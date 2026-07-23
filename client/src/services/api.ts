import type { CartItem, CustomerInfo, Order } from '../types';

/*
  Sin backend todavía (frontend-first, ver docs/analisis-mejoras.md). Esta
  función simula lo que hará POST /api/orders: valida, genera un código corto
  y resuelve como si el pedido se hubiese guardado. El día que exista la API
  real, solo cambia el cuerpo de esta función — los componentes que la llaman
  (Cart.tsx) no deberían tocarse.
*/
function randomOrderCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export async function createOrder(customer: CustomerInfo, items: CartItem[]): Promise<Order> {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  return {
    id: crypto.randomUUID(),
    code: randomOrderCode(),
    customer,
    items,
    total,
    status: 'pendiente',
    createdAt: new Date().toISOString(),
  };
}
