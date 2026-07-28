import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import type { Order } from '../types';
import { formatPrice } from '../utils/format';

export function OrderConfirm() {
  const { code } = useParams<{ code: string }>();
  const location = useLocation();
  const order = (location.state as { order?: Order } | null)?.order;

  if (!order || order.code !== code) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="mx-auto flex max-w-140 flex-col items-center px-6 pb-24 pt-18 text-center">
      <span className="flex h-18 w-18 items-center justify-center rounded-full bg-[var(--color-accent-soft)]">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 12.5 9.5 17 19 7" stroke="var(--color-brand)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>

      <h1 className="mt-5.5 font-serif text-[38px] font-medium text-[var(--color-ink)]">¡Pedido recibido!</h1>
      <p className="mt-2.5 text-sm text-[var(--color-muted)]">
        Código de tu pedido: <strong className="text-[var(--color-deep)]">#{order.code}</strong>
      </p>
      <p className="mt-1.5 text-[13px] text-[var(--color-label)]">
        En breve te confirmamos por WhatsApp al {order.customer.phone}.
      </p>

      <div className="mt-7 w-full rounded-[18px] border border-[var(--color-line)] bg-[var(--color-surface)] px-5.5 py-2 text-left">
        {order.items.map((item) => (
          <div key={`${item.refType}-${item.refId}`} className="flex justify-between border-b border-[#f6e8ec] py-3 text-sm">
            <span>
              {item.quantity}× {item.nameSnapshot}
            </span>
            <span className="font-semibold">{formatPrice(item.unitPrice * item.quantity)}</span>
          </div>
        ))}
        <div className="flex justify-between py-3.5 text-[15px] font-bold">
          <span>Total</span>
          <span className="text-[var(--color-deep)]">{formatPrice(order.total)}</span>
        </div>
      </div>

      <Link to="/" className="mt-7 w-full">
        <button className="w-full rounded-full border border-[#d9b3c0] bg-transparent px-4 py-3.5 text-sm font-semibold tracking-wide text-[var(--color-brand)] transition-colors hover:bg-[var(--color-accent-soft)]">
          Volver al catálogo
        </button>
      </Link>
    </main>
  );
}
