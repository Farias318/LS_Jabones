// Mismo alfabeto que client/src/utils/orderMessage.ts (sin 0/O/1/I para que sea fácil de leer por WhatsApp).
const ORDER_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateOrderCode(): string {
  return Array.from({ length: 4 }, () => ORDER_CODE_CHARS[Math.floor(Math.random() * ORDER_CODE_CHARS.length)]).join('');
}
