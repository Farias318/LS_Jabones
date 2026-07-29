import { API_URL } from '../config/api';
import type { CartItem, Combo, CustomerInfo, Order, Product } from '../types';

export async function fetchProducts(): Promise<Product[]> {
  const response = await fetch(`${API_URL}/api/products`);
  if (!response.ok) throw new Error(`No se pudo cargar el catálogo (status ${response.status})`);
  return response.json();
}

export async function fetchCombos(): Promise<Combo[]> {
  const response = await fetch(`${API_URL}/api/combos`);
  if (!response.ok) throw new Error(`No se pudieron cargar los combos (status ${response.status})`);
  return response.json();
}

export async function createOrder(
  customer: CustomerInfo,
  items: CartItem[],
  intent: 'pago_directo' | 'whatsapp',
): Promise<Order> {
  const response = await fetch(`${API_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer,
      items: items.map(({ refType, refId, nameSnapshot, unitPrice, quantity }) => ({
        refType,
        refId,
        nameSnapshot,
        unitPrice,
        quantity,
      })),
      intent,
    }),
  });

  if (!response.ok) {
    throw new Error(`No se pudo registrar el pedido (status ${response.status})`);
  }

  return response.json();
}
