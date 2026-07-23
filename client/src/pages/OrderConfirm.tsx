import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import type { Order } from '../types';
import { Button } from '../components/ui/Button';

const currency = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

export function OrderConfirm() {
  const { code } = useParams<{ code: string }>();
  const location = useLocation();
  const order = (location.state as { order?: Order } | null)?.order;

  if (!order || order.code !== code) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="mx-auto flex max-w-xl flex-col items-center px-4 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-brand)]/10">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 12.5 9.5 17 19 7" stroke="var(--color-brand)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <h1 className="mt-4 text-xl font-semibold">¡Pedido recibido!</h1>
      <p className="mt-1 text-sm text-[var(--color-ink)]/60">
        Código de tu pedido: <span className="font-semibold text-[var(--color-ink)]">#{order.code}</span>
      </p>
      <p className="mt-1 text-xs text-[var(--color-ink)]/50">
        En breve te confirmamos por WhatsApp al {order.customer.phone}.
      </p>

      <div className="mt-6 w-full divide-y divide-[var(--color-line)] rounded-2xl border border-[var(--color-line)] bg-white p-4 text-left">
        {order.items.map((item) => (
          <div key={`${item.refType}-${item.refId}`} className="flex justify-between py-2 text-sm">
            <span>
              {item.quantity}× {item.nameSnapshot}
            </span>
            <span className="font-medium">{currency.format(item.unitPrice * item.quantity)}</span>
          </div>
        ))}
        <div className="flex justify-between pt-2 text-sm font-semibold">
          <span>Total</span>
          <span>{currency.format(order.total)}</span>
        </div>
      </div>

      <Link to="/" className="mt-6 w-full">
        <Button variant="secondary" className="w-full">
          Volver al catálogo
        </Button>
      </Link>
    </main>
  );
}
