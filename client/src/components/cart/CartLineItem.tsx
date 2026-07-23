import type { CartItem } from '../../types';

interface CartLineItemProps {
  item: CartItem;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}

const currency = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

export function CartLineItem({ item, onIncrease, onDecrease, onRemove }: CartLineItemProps) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="flex-1">
        <p className="text-sm font-medium">{item.nameSnapshot}</p>
        <p className="text-xs text-[var(--color-ink)]/60">{currency.format(item.unitPrice)} c/u</p>
      </div>

      <div className="flex items-center gap-2 rounded-full border border-[var(--color-line)] px-1.5 py-1">
        <button
          onClick={onDecrease}
          aria-label="Restar unidad"
          className="flex h-6 w-6 items-center justify-center rounded-full text-sm hover:bg-black/5"
        >
          −
        </button>
        <span className="w-4 text-center text-xs font-medium">{item.quantity}</span>
        <button
          onClick={onIncrease}
          aria-label="Sumar unidad"
          className="flex h-6 w-6 items-center justify-center rounded-full text-sm hover:bg-black/5"
        >
          +
        </button>
      </div>

      <span className="w-16 text-right text-sm font-semibold">
        {currency.format(item.unitPrice * item.quantity)}
      </span>

      <button
        onClick={onRemove}
        aria-label={`Quitar ${item.nameSnapshot}`}
        className="text-[var(--color-ink)]/40 hover:text-[var(--color-ink)]"
      >
        ×
      </button>
    </div>
  );
}
