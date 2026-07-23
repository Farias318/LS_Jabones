import type { Product } from '../../types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  onAdd: (product: Product) => void;
}

export function ProductGrid({ products, onAdd }: ProductGridProps) {
  if (products.length === 0) {
    return <p className="py-10 text-center text-sm text-[var(--color-ink)]/60">No hay productos con ese filtro.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onAdd={onAdd} />
      ))}
    </div>
  );
}
