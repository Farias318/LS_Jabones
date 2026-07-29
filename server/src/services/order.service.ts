import { desc, eq, inArray } from 'drizzle-orm';
import { db } from '../db/index.js';
import { combos, orderItems, orderPayments, orders, products } from '../db/schema.js';
import { generateOrderCode } from '../lib/orderCode.js';
import type {
  CreateOrderInput,
  CreateOrderPaymentInput,
  UpdateOrderStatusInput,
} from '../schemas/order.schema.js';

export class OrderValidationError extends Error {}

interface ResolvedItem {
  refType: 'product' | 'combo' | 'custom-combo';
  refId: string;
  nameSnapshot: string;
  unitPrice: number;
  quantity: number;
}

/*
  Para 'product'/'combo' se recalcula el precio desde la base (nunca se confía en lo
  que mande el cliente). Para 'custom-combo' ("armá tu combo" en Home.tsx) no hay fila
  en la base que lo respalde — el snapshot armado en el navegador es la única fuente,
  ver la nota en db/schema.ts sobre order_items.ref_id.
*/
async function resolveItems(items: CreateOrderInput['items']): Promise<ResolvedItem[]> {
  const productIds = items.filter((i) => i.refType === 'product').map((i) => i.refId);
  const comboIds = items.filter((i) => i.refType === 'combo').map((i) => i.refId);

  const [productRows, comboRows] = await Promise.all([
    productIds.length ? db.select().from(products).where(inArray(products.id, productIds)) : Promise.resolve([]),
    comboIds.length ? db.select().from(combos).where(inArray(combos.id, comboIds)) : Promise.resolve([]),
  ]);

  const productById = new Map(productRows.map((p) => [p.id, p]));
  const comboById = new Map(comboRows.map((c) => [c.id, c]));

  return items.map((item) => {
    if (item.refType === 'product') {
      const product = productById.get(item.refId);
      if (!product || !product.active) {
        throw new OrderValidationError(`Producto no disponible: ${item.refId}`);
      }
      return { ...item, nameSnapshot: product.name, unitPrice: Number(product.price) };
    }
    if (item.refType === 'combo') {
      const combo = comboById.get(item.refId);
      if (!combo || !combo.active) {
        throw new OrderValidationError(`Combo no disponible: ${item.refId}`);
      }
      return { ...item, nameSnapshot: combo.name, unitPrice: Number(combo.comboPrice) };
    }
    return item;
  });
}

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

async function generateUniqueOrderCode(tx: Tx): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateOrderCode();
    const [existing] = await tx.select({ id: orders.id }).from(orders).where(eq(orders.code, code)).limit(1);
    if (!existing) return code;
  }
  throw new Error('No se pudo generar un código de pedido único');
}

export async function createOrder(input: CreateOrderInput) {
  const resolvedItems = await resolveItems(input.items);
  const total = resolvedItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const orderRow = await db.transaction(async (tx) => {
    const code = await generateUniqueOrderCode(tx);

    const [row] = await tx
      .insert(orders)
      .values({
        code,
        customerName: input.customer.name,
        customerPhone: input.customer.phone,
        customerNotes: input.customer.notes,
        total: total.toFixed(2),
        intent: input.intent,
      })
      .returning();

    await tx.insert(orderItems).values(
      resolvedItems.map((item) => ({
        orderId: row.id,
        refType: item.refType,
        refId: item.refId,
        nameSnapshot: item.nameSnapshot,
        unitPrice: item.unitPrice.toFixed(2),
        quantity: item.quantity,
      })),
    );

    return row;
  });

  return {
    id: orderRow.id,
    code: orderRow.code,
    customer: {
      name: orderRow.customerName,
      phone: orderRow.customerPhone,
      notes: orderRow.customerNotes ?? undefined,
    },
    items: resolvedItems,
    total,
    status: orderRow.status,
    createdAt: orderRow.createdAt.toISOString(),
  };
}

export type PaymentStatus = 'sin_pago' | 'seña' | 'pagado_completo';

// Nunca se guarda como columna — se calcula siempre contra order_payments (ver
// ROADMAP-BACKEND-ADMIN.md §3.1) para que no pueda quedar desincronizado.
function computePaymentStatus(total: number, amountPaid: number): PaymentStatus {
  if (amountPaid <= 0) return 'sin_pago';
  if (amountPaid >= total) return 'pagado_completo';
  return 'seña';
}

function groupBy<T, K>(rows: T[], key: (row: T) => K): Map<K, T[]> {
  const map = new Map<K, T[]>();
  for (const row of rows) {
    const k = key(row);
    const list = map.get(k) ?? [];
    list.push(row);
    map.set(k, list);
  }
  return map;
}

interface ListOrdersFilters {
  status?: string;
  paymentStatus?: PaymentStatus;
}

export async function listOrders(filters: ListOrdersFilters = {}) {
  const orderRows = await db
    .select()
    .from(orders)
    .where(filters.status ? eq(orders.status, filters.status) : undefined)
    .orderBy(desc(orders.createdAt));

  const orderIds = orderRows.map((o) => o.id);
  const [itemRows, paymentRows] = await Promise.all([
    orderIds.length ? db.select().from(orderItems).where(inArray(orderItems.orderId, orderIds)) : Promise.resolve([]),
    orderIds.length
      ? db.select().from(orderPayments).where(inArray(orderPayments.orderId, orderIds))
      : Promise.resolve([]),
  ]);

  const itemsByOrder = groupBy(itemRows, (i) => i.orderId);
  const paymentsByOrder = groupBy(paymentRows, (p) => p.orderId);

  const result = orderRows.map((order) => {
    const total = Number(order.total);
    const amountPaid = (paymentsByOrder.get(order.id) ?? []).reduce((sum, p) => sum + Number(p.amount), 0);
    return {
      id: order.id,
      code: order.code,
      customer: { name: order.customerName, phone: order.customerPhone, notes: order.customerNotes ?? undefined },
      items: (itemsByOrder.get(order.id) ?? []).map((i) => ({
        refType: i.refType,
        refId: i.refId,
        nameSnapshot: i.nameSnapshot,
        unitPrice: Number(i.unitPrice),
        quantity: i.quantity,
      })),
      total,
      status: order.status,
      intent: order.intent,
      amountPaid,
      paymentStatus: computePaymentStatus(total, amountPaid),
      createdAt: order.createdAt.toISOString(),
    };
  });

  return filters.paymentStatus ? result.filter((o) => o.paymentStatus === filters.paymentStatus) : result;
}

export async function getOrderById(id: string) {
  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!order) return null;

  const [itemRows, paymentRows] = await Promise.all([
    db.select().from(orderItems).where(eq(orderItems.orderId, id)),
    db.select().from(orderPayments).where(eq(orderPayments.orderId, id)),
  ]);

  const total = Number(order.total);
  const amountPaid = paymentRows.reduce((sum, p) => sum + Number(p.amount), 0);

  return {
    id: order.id,
    code: order.code,
    customer: { name: order.customerName, phone: order.customerPhone, notes: order.customerNotes ?? undefined },
    items: itemRows.map((i) => ({
      refType: i.refType,
      refId: i.refId,
      nameSnapshot: i.nameSnapshot,
      unitPrice: Number(i.unitPrice),
      quantity: i.quantity,
    })),
    total,
    status: order.status,
    intent: order.intent,
    payments: paymentRows.map((p) => ({
      id: p.id,
      method: p.method,
      amount: Number(p.amount),
      note: p.note ?? undefined,
      registeredBy: p.registeredBy,
      paidAt: p.paidAt.toISOString(),
    })),
    amountPaid,
    paymentStatus: computePaymentStatus(total, amountPaid),
    createdAt: order.createdAt.toISOString(),
  };
}

export async function updateOrderStatus(id: string, input: UpdateOrderStatusInput) {
  const [row] = await db.update(orders).set({ status: input.status }).where(eq(orders.id, id)).returning();
  return row ?? null;
}

export async function addOrderPayment(orderId: string, input: CreateOrderPaymentInput, registeredBy: string) {
  const [order] = await db.select({ id: orders.id }).from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) return null;

  const [payment] = await db
    .insert(orderPayments)
    .values({
      orderId,
      method: input.method,
      amount: input.amount.toFixed(2),
      note: input.note,
      registeredBy,
    })
    .returning();

  return {
    id: payment.id,
    method: payment.method,
    amount: Number(payment.amount),
    note: payment.note ?? undefined,
    registeredBy: payment.registeredBy,
    paidAt: payment.paidAt.toISOString(),
  };
}
