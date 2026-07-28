import type { CartItem, CustomerInfo } from '../types';
import { formatPrice } from './format';
import { WHATSAPP_NUMBER } from '../config/checkout';

const ORDER_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateOrderCode(): string {
  return Array.from({ length: 4 }, () => ORDER_CODE_CHARS[Math.floor(Math.random() * ORDER_CODE_CHARS.length)]).join('');
}

export function buildWhatsAppOrderUrl(
  orderCode: string,
  customer: CustomerInfo,
  items: CartItem[],
  total: number,
): string {
  const lines = [
    `🧼 Pedido #${orderCode} — LS Jabones`,
    `${customer.name} — ${customer.phone}`,
    '',
    ...items.map((item) => `${item.quantity}× ${item.nameSnapshot} (${formatPrice(item.unitPrice * item.quantity)})`),
    '',
    `Total: ${formatPrice(total)}`,
  ];

  if (customer.notes) {
    lines.push('', `Notas: ${customer.notes}`);
  }

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
}
