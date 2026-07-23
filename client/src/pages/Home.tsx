import type { Combo, Product } from '../types';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import { PerfumeFilter } from '../components/catalog/PerfumeFilter';
import { ProductGrid } from '../components/catalog/ProductGrid';
import { ComboCard } from '../components/catalog/ComboCard';

export function Home() {
  const { products, combos, perfumes, perfumeFilter, setPerfumeFilter, filteredProducts } = useProducts();
  const { addItem } = useCart();

  const handleAddProduct = (product: Product) => {
    addItem({
      refType: 'product',
      refId: product.id,
      nameSnapshot: product.name,
      unitPrice: product.price,
      imageUrl: product.imageUrl,
    });
  };

  const handleAddCombo = (combo: Combo) => {
    addItem({
      refType: 'combo',
      refId: combo.id,
      nameSnapshot: combo.name,
      unitPrice: combo.comboPrice,
    });
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <section className="pb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Jabones artesanales, hechos a pedido</h1>
        <p className="mt-1 text-sm text-[var(--color-ink)]/60">
          Elegí tus jabones o combos favoritos y armá tu pedido — te confirmamos por WhatsApp.
        </p>
      </section>

      {combos.length > 0 && (
        <section className="pb-10">
          <h2 className="pb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-ink)]/50">Combos</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {combos.map((combo) => (
              <ComboCard key={combo.id} combo={combo} products={products} onAdd={handleAddCombo} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="pb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-ink)]/50">Catálogo</h2>
        <div className="pb-4">
          <PerfumeFilter perfumes={perfumes} selected={perfumeFilter} onSelect={setPerfumeFilter} />
        </div>
        <ProductGrid products={filteredProducts} onAdd={handleAddProduct} />
      </section>
    </main>
  );
}
