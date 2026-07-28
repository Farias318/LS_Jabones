import { boolean, integer, numeric, pgTable, primaryKey, text, timestamp, uuid } from 'drizzle-orm/pg-core';

/*
  Esquema base — ver ROADMAP-BACKEND-ADMIN.md y docs/especificacion-tecnica.md §5.
  order_payments y orders.intent son las dos únicas adiciones sobre lo ya documentado
  en la especificación técnica original, para soportar conciliación manual de pagos
  (ver ROADMAP-BACKEND-ADMIN.md §2 y §3).
*/

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  perfume: text('perfume').notNull(),
  description: text('description'),
  attributes: text('attributes').array(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  imageUrl: text('image_url'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const combos = pgTable('combos', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  comboPrice: numeric('combo_price', { precision: 10, scale: 2 }).notNull(),
  description: text('description'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Tabla puente M:N entre combos y products. ON DELETE RESTRICT en product_id: evita
// borrar un producto que integra un combo activo (ver docs/analisis-mejoras.md #4).
export const comboItems = pgTable(
  'combo_items',
  {
    comboId: uuid('combo_id')
      .notNull()
      .references(() => combos.id, { onDelete: 'cascade' }),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'restrict' }),
    quantity: integer('quantity').notNull().default(1),
  },
  (table) => [primaryKey({ columns: [table.comboId, table.productId] })],
);

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(), // corto y legible, ej. "A1B2"
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull(),
  customerNotes: text('customer_notes'),
  total: numeric('total', { precision: 10, scale: 2 }).notNull(),
  status: text('status').notNull().default('pendiente'),
  // 'pendiente' | 'en_fabricacion' | 'listo' | 'entregado' | 'cancelado'
  intent: text('intent').notNull().default('whatsapp'),
  // 'pago_directo' (botón "Pagar ahora") | 'whatsapp' (botón "Encargar por WhatsApp")
  mpPreferenceId: text('mp_preference_id'), // reservado para cuando se automatice el pago (roadmap §8)
  notifiedAt: timestamp('notified_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// name_snapshot/unit_price: si el producto/combo cambia después, el pedido histórico
// no se altera. ref_id es texto (no FK) porque puede apuntar a products.id, combos.id,
// o a un id de combo armado por el cliente en la web (no existe como fila en la base).
export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  refType: text('ref_type').notNull(), // 'product' | 'combo' | 'custom-combo'
  refId: text('ref_id').notNull(),
  nameSnapshot: text('name_snapshot').notNull(),
  unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
  quantity: integer('quantity').notNull().default(1),
});

// Un pedido puede tener varios pagos parciales (seña por transferencia + resto en
// efectivo al entregar). El estado de pago del pedido se calcula comparando
// SUM(order_payments.amount) contra orders.total — no se guarda como flag fijo.
export const orderPayments = pgTable('order_payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  method: text('method').notNull(), // 'mercado_pago_link' | 'efectivo' | 'transferencia' | 'otro'
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  note: text('note'),
  registeredBy: text('registered_by').notNull(), // admin que lo cargó
  paidAt: timestamp('paid_at', { withTimezone: true }).notNull().defaultNow(),
});

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull().default('admin'),
  notifyPhone: text('notify_phone').notNull(), // WhatsApp donde recibe los pedidos
});
