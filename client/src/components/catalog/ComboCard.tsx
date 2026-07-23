import type { Combo, Product } from '../../types';
import { Button } from '../ui/Button';
import { ProductImagePlaceholder } from './ProductImagePlaceholder';

interface ComboCardProps {
  combo: Combo;
  products: Product[];
  onAdd: (combo: Combo) => void;
}

const currency = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

export function ComboCard({ combo, products, onAdd }: ComboCardProps) {
  const includedNames = combo.productIds
    .map((id) => products.find((p) => p.id === id)?.name)
    .filter((name): name is string => Boolean(name));

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-[var(--color-brand)]/40 bg-white">
      <ProductImagePlaceholder seed={combo.id} className="aspect-square w-full" />

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[var(--color-brand)] px-2 py-0.5 text-[10px] font-medium text-white">
            Combo
          </span>
          <h3 className="text-sm font-semibold">{combo.name}</h3>
        </div>

        <p className="text-xs text-[var(--color-ink)]/70">{combo.description}</p>
        <p className="text-[11px] text-[var(--color-ink)]/50">Incluye: {includedNames.join(', ')}</p>

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-sm font-semibold">{currency.format(combo.comboPrice)}</span>
          <Button variant="primary" className="px-4 py-2 text-xs" onClick={() => onAdd(combo)}>
            Agregar
          </Button>
        </div>
      </div>
    </article>
  );
}
