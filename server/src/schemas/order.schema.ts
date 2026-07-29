import { z } from 'zod';

// Espeja CartItem/CustomerInfo de client/src/types/index.ts.
export const orderItemSchema = z.object({
  refType: z.enum(['product', 'combo', 'custom-combo']),
  refId: z.string().min(1),
  nameSnapshot: z.string().min(1),
  unitPrice: z.number().positive(),
  quantity: z.number().int().positive(),
});

export const createOrderSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(1),
    phone: z.string().trim().min(1),
    notes: z.string().trim().min(1).optional(),
  }),
  items: z.array(orderItemSchema).min(1),
  intent: z.enum(['pago_directo', 'whatsapp']).default('whatsapp'),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
