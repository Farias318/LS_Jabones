import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useScrollToSection } from '../../hooks/useScrollToSection';
import { Logo } from './Logo';

interface HeaderBarProps {
  onOpenCart: () => void;
  onOpenMenu: () => void;
}

const LINKS = [
  { id: 'catalogo', label: 'Catálogo' },
  { id: 'como-funciona', label: 'Cómo funciona' },
  { id: 'nosotros', label: 'Nosotros' },
];

export function HeaderBar({ onOpenCart, onOpenMenu }: HeaderBarProps) {
  const { itemCount } = useCart();
  const goToSection = useScrollToSection();

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-line)] bg-[var(--color-paper)]/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/">
          <Logo size={44} showWordmark />
        </Link>

        <nav className="hidden items-center gap-6.5 md:flex">
          {LINKS.map((link) => (
            <button
              key={link.id}
              onClick={() => goToSection(link.id)}
              className="text-[13.5px] font-semibold text-[var(--color-muted)] transition-colors hover:text-[var(--color-brand)]"
            >
              {link.label}
            </button>
          ))}
        </nav>

        <button
          onClick={onOpenMenu}
          aria-label="Abrir menú"
          className="ml-auto flex h-10.5 w-10.5 shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] md:hidden"
        >
          <span className="h-0.5 w-4.5 rounded-full bg-[var(--color-brand-dark)]" />
          <span className="h-0.5 w-4.5 rounded-full bg-[var(--color-brand-dark)]" />
          <span className="h-0.5 w-4.5 rounded-full bg-[var(--color-brand-dark)]" />
        </button>

        <button
          onClick={onOpenCart}
          aria-label="Ver carrito"
          className="relative hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] transition-colors hover:bg-[var(--color-accent-soft)] md:flex"
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M6 8h12l-1.2 10.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 8Z"
              stroke="var(--color-brand-dark)"
              strokeWidth="1.6"
            />
            <path d="M9 8V6a3 3 0 0 1 6 0v2" stroke="var(--color-brand-dark)" strokeWidth="1.6" />
          </svg>
          {itemCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-[var(--color-brand)] px-1 text-[10px] font-medium text-white">
              {itemCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
