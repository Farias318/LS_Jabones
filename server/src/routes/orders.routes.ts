import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.middleware.js';
import {
  createOrderPaymentSchema,
  createOrderSchema,
  updateOrderStatusSchema,
} from '../schemas/order.schema.js';
import {
  addOrderPayment,
  createOrder,
  getOrderById,
  listOrders,
  OrderValidationError,
  type PaymentStatus,
  updateOrderStatus,
} from '../services/order.service.js';

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

const FABRICATION_STATUSES = ['pendiente', 'en_fabricacion', 'listo', 'entregado', 'cancelado'];
const PAYMENT_STATUSES: PaymentStatus[] = ['sin_pago', 'seña', 'pagado_completo'];

ordersRouter.get('/', requireAdmin, async (req, res, next) => {
  const statusParam = req.query.status;
  const paymentStatusParam = req.query.paymentStatus;

  const status = typeof statusParam === 'string' && FABRICATION_STATUSES.includes(statusParam) ? statusParam : undefined;
  const paymentStatus =
    typeof paymentStatusParam === 'string' && PAYMENT_STATUSES.includes(paymentStatusParam as PaymentStatus)
      ? (paymentStatusParam as PaymentStatus)
      : undefined;

  try {
    const result = await listOrders({ status, paymentStatus });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

ordersRouter.get('/:id', requireAdmin, async (req, res, next) => {
  try {
    const order = await getOrderById(req.params.id as string);
    if (!order) {
      res.status(404).json({ error: 'Pedido no encontrado' });
      return;
    }
    res.json(order);
  } catch (err) {
    next(err);
  }
});

ordersRouter.patch('/:id/status', requireAdmin, async (req, res, next) => {
  const parsed = updateOrderStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Estado inválido', details: parsed.error.flatten() });
    return;
  }

  try {
    const order = await updateOrderStatus(req.params.id as string, parsed.data);
    if (!order) {
      res.status(404).json({ error: 'Pedido no encontrado' });
      return;
    }
    res.json(order);
  } catch (err) {
    next(err);
  }
});

ordersRouter.post('/:id/payments', requireAdmin, async (req, res, next) => {
  const parsed = createOrderPaymentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Pago inválido', details: parsed.error.flatten() });
    return;
  }

  try {
    const registeredBy = req.user?.email ?? 'admin';
    const payment = await addOrderPayment(req.params.id as string, parsed.data, registeredBy);
    if (!payment) {
      res.status(404).json({ error: 'Pedido no encontrado' });
      return;
    }
    res.status(201).json(payment);
  } catch (err) {
    next(err);
  }
});
