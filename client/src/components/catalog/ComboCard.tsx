import type { Combo, Product } from '../../types';
import { Button } from '../ui/Button';
import { formatPrice, shortProductName } from '../../utils/format';

interface ComboCardProps {
  combo: Combo;
  products: Product[];
  onAdd: (combo: Combo) => void;
}

export function ComboCard({ combo, products, onAdd }: ComboCardProps) {
  const includedNames = combo.productIds
    .map((id) => products.find((p) => p.id === id)?.name)
    .filter((name): name is string => Boolean(name))
    .map(shortProductName);

  return (
    <article className="flex flex-col gap-3 rounded-[20px] border border-[#eed7de] bg-gradient-to-br from-[#f9edf0] to-[#f4dfe6] px-6 pb-5 pt-6">
      <h3 className="font-serif text-2xl font-semibold text-[var(--color-deep)]">{combo.name}</h3>
      <p className="flex-1 text-sm leading-relaxed text-[var(--color-muted)]">{combo.description}</p>
      <p className="text-xs italic text-[var(--color-label)]">Incluye: {includedNames.join(' · ')}</p>

      <div className="mt-1.5 flex items-center justify-between">
        <span className="font-serif text-2xl font-semibold text-[var(--color-deep)]">{formatPrice(combo.comboPrice)}</span>
        <Button variant="primary" className="px-6 py-2.5 text-[13px]" onClick={() => onAdd(combo)}>
          Agregar
        </Button>
      </div>
    </article>
  );
}
