import { eq, inArray } from 'drizzle-orm';
import { db } from '../db/index.js';
import { combos, orderItems, orders, products } from '../db/schema.js';
import { generateOrderCode } from '../lib/orderCode.js';
import type { CreateOrderInput } from '../schemas/order.schema.js';

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
