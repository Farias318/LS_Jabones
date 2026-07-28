import { useState, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useToast } from '../hooks/useToast';
import { CartLineItem } from '../components/cart/CartLineItem';
import { Input } from '../components/ui/Input';
import { formatPrice } from '../utils/format';
import { buildWhatsAppOrderUrl, generateOrderCode } from '../utils/orderMessage';
import { MERCADOPAGO_PAY_URL } from '../config/checkout';

export function Cart() {
  const { items, total, updateQuantity, removeItem, clear } = useCart();
  const { show: showToast } = useToast();
  const [orderCode] = useState(generateOrderCode);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  const canSubmit = items.length > 0 && name.trim() !== '' && phone.trim() !== '';

  const handlePagarAhora = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!canSubmit) {
      event.preventDefault();
      return;
    }
    showToast(`Te llevamos a Mercado Pago — el total es ${formatPrice(total)}`);
  };

  const handleEncargarWhatsApp = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!canSubmit) {
      event.preventDefault();
      return;
    }
    showToast(`Pedido #${orderCode} — te esperamos en WhatsApp ✓`);
    clear();
  };

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-sm text-[var(--color-muted)]">Todavía no agregaste ningún jabón a tu pedido.</p>
        <Link to="/" className="mt-4 inline-block text-sm font-medium text-[var(--color-brand)] underline">
          Volver al catálogo
        </Link>
      </main>
    );
  }

  const whatsAppUrl = buildWhatsAppOrderUrl(orderCode, { name, phone, notes: notes || undefined }, items, total);
  const linkStateClass = canSubmit ? '' : 'pointer-events-none opacity-45';

  return (
    <main className="mx-auto max-w-160 px-6 pb-20 pt-10">
      <Link to="/" className="text-[13px] font-medium text-[var(--color-brand)]">
        ← Volver al catálogo
      </Link>

      <h1 className="mb-5.5 mt-4.5 font-serif text-[38px] font-medium text-[var(--color-deep)]">Tu pedido</h1>

      <div className="flex flex-col divide-y divide-[#f6e8ec] rounded-[18px] border border-[var(--color-line)] bg-[var(--color-surface)] px-5.5">
        {items.map((item) => (
          <CartLineItem
            key={`${item.refType}-${item.refId}`}
            item={item}
            thumbnailSize={52}
            onIncrease={() => updateQuantity(item.refType, item.refId, item.quantity + 1)}
            onDecrease={() => updateQuantity(item.refType, item.refId, item.quantity - 1)}
            onRemove={() => removeItem(item.refType, item.refId)}
          />
        ))}
      </div>

      <div className="mt-7 flex flex-col gap-4">
        <Input label="Nombre" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" required />
        <Input
          label="Teléfono (WhatsApp)"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="11-5555-5555"
          required
        />
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Notas (opcional)
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="resize-y rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none focus:border-[#cf93a5]"
            placeholder="Ej: retiro por la tarde, envolver para regalo…"
          />
        </label>

        <div className="mt-1.5 border-t border-[var(--color-line)] pt-4.5">
          <div className="mb-4">
            <p className="text-xs text-[var(--color-label)]">Total</p>
            <p className="font-serif text-[28px] font-semibold text-[var(--color-deep)]">{formatPrice(total)}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={MERCADOPAGO_PAY_URL}
              aria-disabled={!canSubmit}
              tabIndex={canSubmit ? 0 : -1}
              onClick={handlePagarAhora}
              className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[var(--color-brand)] px-6 py-3.5 text-sm font-semibold tracking-wide text-white transition-colors hover:bg-[var(--color-brand-dark)] ${linkStateClass}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="6" width="18" height="13" rx="2.5" stroke="#fff" strokeWidth="1.7" />
                <path d="M3 10.5h18" stroke="#fff" strokeWidth="1.7" />
              </svg>
              Pagar ahora
            </a>

            <a
              href={whatsAppUrl}
              aria-disabled={!canSubmit}
              tabIndex={canSubmit ? 0 : -1}
              onClick={handleEncargarWhatsApp}
              className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[#d9b3c0] px-6 py-3.5 text-sm font-semibold tracking-wide text-[var(--color-brand)] transition-colors hover:bg-[var(--color-accent-soft)] ${linkStateClass}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M4 20l1.3-3.9A7.5 7.5 0 1 1 8.9 19L4 20Z"
                  stroke="var(--color-brand)"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                />
              </svg>
              Encargar por WhatsApp
            </a>
          </div>
        </div>

        <p className="text-right text-xs text-[var(--color-label)]">
          Pagás directo por Mercado Pago o coordinamos tu pedido por WhatsApp.
        </p>
      </div>
    </main>
  );
}
