import type { CartItem } from '../../types';
import { formatPrice } from '../../utils/format';

interface CartLineItemProps {
  item: CartItem;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
  thumbnailSize?: number;
}

export function CartLineItem({ item, onIncrease, onDecrease, onRemove, thumbnailSize = 48 }: CartLineItemProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 py-4">
      <div
        className="shrink-0 rounded-xl"
        style={{
          width: thumbnailSize,
          height: thumbnailSize,
          backgroundImage: 'repeating-linear-gradient(-45deg, #f8ecef 0 8px, #f3e2e7 8px 16px)',
        }}
      />

      <div className="min-w-30 flex-1">
        <p className="text-sm font-medium">{item.nameSnapshot}</p>
        <p className="text-xs text-[var(--color-label)]">{formatPrice(item.unitPrice)} c/u</p>
      </div>

      <div className="ml-auto flex items-center gap-2 rounded-full border border-[var(--color-line)] px-1.5 py-1">
        <button
          onClick={onDecrease}
          aria-label="Restar unidad"
          className="flex h-6.5 w-6.5 items-center justify-center rounded-full text-[15px] text-[var(--color-brand)] hover:bg-[var(--color-accent-soft)]"
        >
          −
        </button>
        <span className="w-4 text-center text-xs font-semibold">{item.quantity}</span>
        <button
          onClick={onIncrease}
          aria-label="Sumar unidad"
          className="flex h-6.5 w-6.5 items-center justify-center rounded-full text-[15px] text-[var(--color-brand)] hover:bg-[var(--color-accent-soft)]"
        >
          +
        </button>
      </div>

      <span className="w-16 text-right text-sm font-bold">{formatPrice(item.unitPrice * item.quantity)}</span>

      <button
        onClick={onRemove}
        aria-label={`Quitar ${item.nameSnapshot}`}
        className="p-0.5 text-lg text-[var(--color-label)] hover:text-[var(--color-brand)]"
      >
        ×
      </button>
    </div>
  );
}
