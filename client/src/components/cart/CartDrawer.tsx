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
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        aria-hidden="true"
      />

      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-white p-5 shadow-xl transition-transform ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between pb-3">
          <h2 className="text-base font-semibold">Tu pedido</h2>
          <button onClick={onClose} aria-label="Cerrar carrito" className="text-xl text-[var(--color-ink)]/50">
            ×
          </button>
        </div>

        {items.length === 0 ? (
          <p className="flex-1 text-sm text-[var(--color-ink)]/60">Todavía no agregaste ningún jabón.</p>
        ) : (
          <div className="flex-1 divide-y divide-[var(--color-line)] overflow-y-auto">
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
        )}

        <CartSummary
          total={total}
          ctaLabel="Continuar pedido"
          ctaDisabled={items.length === 0}
          onCta={() => {
            onClose();
            navigate('/carrito');
          }}
        />
      </aside>
    </>
  );
}
