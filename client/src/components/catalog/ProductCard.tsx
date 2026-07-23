import type { Product } from '../../types';
import { Button } from '../ui/Button';
import { ProductImagePlaceholder } from './ProductImagePlaceholder';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

const currency = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

export function ProductCard({ product, onAdd }: ProductCardProps) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white">
      {product.imageUrl ? (
        <img src={product.imageUrl} alt={product.name} className="aspect-square w-full object-cover" />
      ) : (
        <ProductImagePlaceholder seed={product.id} className="aspect-square w-full" />
      )}

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div>
          <h3 className="text-sm font-semibold">{product.name}</h3>
          <p className="text-xs text-[var(--color-ink)]/60">{product.perfume}</p>
        </div>

        <p className="line-clamp-2 flex-1 text-xs text-[var(--color-ink)]/70">{product.description}</p>

        <div className="flex flex-wrap gap-1">
          {product.attributes.map((attribute) => (
            <span
              key={attribute}
              className="rounded-full bg-[var(--color-paper)] px-2 py-0.5 text-[10px] text-[var(--color-ink)]/60 ring-1 ring-[var(--color-line)]"
            >
              {attribute}
            </span>
          ))}
        </div>

        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm font-semibold">{currency.format(product.price)}</span>
          <Button variant="primary" className="px-4 py-2 text-xs" onClick={() => onAdd(product)}>
            Agregar
          </Button>
        </div>
      </div>
    </article>
  );
}
