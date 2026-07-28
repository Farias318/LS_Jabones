import type { Product } from '../../types';
import { Button } from '../ui/Button';
import { ProductImagePlaceholder } from './ProductImagePlaceholder';
import { formatPrice } from '../../utils/format';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
  comboMode?: boolean;
  selected?: boolean;
  onToggleSelect?: (product: Product) => void;
}

export function ProductCard({ product, onAdd, comboMode = false, selected = false, onToggleSelect }: ProductCardProps) {
  const handleAction = () => {
    if (comboMode) onToggleSelect?.(product);
    else onAdd(product);
  };

  return (
    <article
      className={`flex flex-col overflow-hidden rounded-2xl bg-[var(--color-surface)] transition-all ${
        selected
          ? 'border-2 border-[var(--color-brand)] shadow-lg shadow-[var(--color-deep)]/10 -translate-y-0.5'
          : 'border border-[var(--color-line)] hover:shadow-lg hover:shadow-[var(--color-deep)]/10 hover:-translate-y-0.5'
      }`}
    >
      {product.imageUrl ? (
        <img src={product.imageUrl} alt={product.name} className="aspect-square w-full object-cover" />
      ) : (
        <ProductImagePlaceholder label={`foto: ${product.name.toLowerCase()}`} className="aspect-square w-full" />
      )}

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div>
          <h3 className="font-serif text-lg font-semibold text-[var(--color-deep)]">{product.name}</h3>
          <p className="text-xs italic text-[var(--color-label)]">{product.perfume}</p>
        </div>

        <p className="line-clamp-2 flex-1 text-xs leading-relaxed text-[var(--color-muted)]">{product.description}</p>

        <div className="flex flex-wrap gap-1">
          {product.attributes.map((attribute) => (
            <span
              key={attribute}
              className="rounded-full bg-[var(--color-accent-soft)] px-2.5 py-0.5 text-[10px] text-[var(--color-brand)]"
            >
              {attribute}
            </span>
          ))}
        </div>

        <div className="mt-2 flex items-center justify-between">
          <span className="font-serif text-lg font-semibold text-[var(--color-deep)]">{formatPrice(product.price)}</span>
          <Button
            variant={selected ? 'primary' : 'secondary'}
            className="px-4 py-2 text-xs"
            onClick={handleAction}
          >
            {comboMode ? (selected ? 'Quitar ✓' : 'Sumar al combo') : 'Agregar'}
          </Button>
        </div>
      </div>
    </article>
  );
}
