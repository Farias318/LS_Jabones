interface PerfumeFilterProps {
  perfumes: string[];
  selected: string | null;
  onSelect: (perfume: string | null) => void;
}

export function PerfumeFilter({ perfumes, selected, onSelect }: PerfumeFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 overflow-x-auto pb-1">
      <FilterChip label="Todos" active={selected === null} onClick={() => onSelect(null)} />
      {perfumes.map((perfume) => (
        <FilterChip key={perfume} label={perfume} active={selected === perfume} onClick={() => onSelect(perfume)} />
      ))}
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
        active
          ? 'bg-[var(--color-brand)] text-white'
          : 'bg-white text-[var(--color-ink)]/70 ring-1 ring-[var(--color-line)] hover:ring-[var(--color-brand)]'
      }`}
    >
      {label}
    </button>
  );
}
