interface PerfumeFilterProps {
  perfumes: string[];
  selected: string | null;
  onSelect: (perfume: string | null) => void;
}

/**
 * No envuelve en su propio contenedor a propósito: en el mock los chips de
 * perfume y el chip "+ Armá tu combo" comparten una sola fila flex-wrap, así
 * que el layout lo define el padre (Home).
 */
export function PerfumeFilter({ perfumes, selected, onSelect }: PerfumeFilterProps) {
  return (
    <>
      <FilterChip label="Todos" active={selected === null} onClick={() => onSelect(null)} />
      {perfumes.map((perfume) => (
        <FilterChip key={perfume} label={perfume} active={selected === perfume} onClick={() => onSelect(perfume)} />
      ))}
    </>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
        active
          ? 'bg-[var(--color-brand)] text-white'
          : 'bg-[var(--color-surface)] text-[var(--color-muted)] ring-1 ring-[var(--color-line)] hover:ring-[var(--color-brand)]'
      }`}
    >
      {label}
    </button>
  );
}
