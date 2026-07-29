import { Router } from 'express';
import { createOrderSchema } from '../schemas/order.schema.js';
import { createOrder, OrderValidationError } from '../services/order.service.js';

export const ordersRouter = Router();

ordersRouter.post('/', async (req, res, next) => {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Pedido inválido', details: parsed.error.flatten() });
    return;
  }

  try {
    const order = await createOrder(parsed.data);
    res.status(201).json(order);
  } catch (err) {
    if (err instanceof OrderValidationError) {
      res.status(400).json({ error: err.message });
      return;
    }
    next(err);
  }
});
