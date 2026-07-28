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
  const productWord = items.length === 1 ? 'este producto' : 'estos productos';

  // Nota: WhatsApp corrompe los emoji "de color" (👋🧼💰📱, etc.) en los links wa.me/api.whatsapp.com
  // — verificado a mano contra su propio servicio de redirección, no depende de cómo los codifiquemos
  // nosotros. Por eso el mensaje usa *negrita* nativa de WhatsApp en vez de emoji para destacar.
  const lines = [
    `¡Hola! Me interesa encargar ${productWord} de *LS Jabones*:`,
    '',
    ...items.map((item) => `• ${item.quantity}× ${item.nameSnapshot} — ${formatPrice(item.unitPrice * item.quantity)}`),
    '',
    `*Total:* ${formatPrice(total)}`,
    '',
    `*Soy:* ${customer.name}`,
    `*Mi contacto:* ${customer.phone}`,
  ];

  if (customer.notes) {
    lines.push(`*Notas:* ${customer.notes}`);
  }

  lines.push('', `Pedido #${orderCode}`);

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
}
