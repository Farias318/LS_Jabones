import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { CartLineItem } from './CartLineItem';
import { CartSummary } from './CartSummary';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, total, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-[#3d2029]/35 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden="true"
      />

      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-[var(--color-surface)] shadow-[-16px_0_48px_rgba(95,47,62,0.16)] transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-[#f6e8ec] px-6 py-5.5">
          <h2 className="font-serif text-2xl font-semibold text-[var(--color-ink)]">Tu pedido</h2>
          <button onClick={onClose} aria-label="Cerrar carrito" className="p-0.5 text-2xl text-[var(--color-label)] hover:text-[var(--color-brand)]">
            ×
          </button>
        </div>

        {items.length > 0 ? (
          <div className="flex-1 divide-y divide-[#f6e8ec] overflow-y-auto px-6">
            {items.map((item) => (
              <CartLineItem
                key={`${item.refType}-${item.refId}`}
                item={item}
                onIncrease={() => updateQuantity(item.refType, item.refId, item.quantity + 1)}
                onDecrease={() => updateQuantity(item.refType, item.refId, item.quantity - 1)}
                onRemove={() => removeItem(item.refType, item.refId)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-accent-soft)]">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 8h12l-1.2 10.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 8Z" stroke="#cf93a5" strokeWidth="1.6" />
                <path d="M9 8V6a3 3 0 0 1 6 0v2" stroke="#cf93a5" strokeWidth="1.6" />
              </svg>
            </span>
            <p className="text-sm text-[var(--color-muted)]">Todavía no agregaste ningún jabón.</p>
            <button onClick={onClose} className="border-0 border-b border-[#d9b3c0] bg-transparent pb-0.5 text-[13px] font-semibold text-[var(--color-brand)]">
              Ver catálogo
            </button>
          </div>
        )}

        <div className="border-t border-[var(--color-line)] px-6 pb-5.5 pt-4.5">
          <CartSummary
            total={total}
            ctaLabel="Continuar pedido"
            ctaDisabled={items.length === 0}
            onCta={() => {
              onClose();
              navigate('/carrito');
            }}
          >
            <p className="text-[11.5px] text-[var(--color-label)]">
              Sin stock: cada jabón se elabora a pedido, con tiempos artesanales.
            </p>
          </CartSummary>
        </div>
      </aside>
    </>
  );
}
