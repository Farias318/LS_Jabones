import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';

interface HeaderBarProps {
  onOpenCart: () => void;
}

/*
  Logo como texto por ahora — reemplazar por <img src="/logo.svg"> cuando
  llegue el logo real de la marca (ver docs/analisis-mejoras.md).
*/
export function HeaderBar({ onOpenCart }: HeaderBarProps) {
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-line)] bg-[var(--color-paper)]/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5">
        <Link to="/" className="text-base font-semibold tracking-tight">
          LS Jabones
        </Link>

        <button
          onClick={onOpenCart}
          aria-label="Ver carrito"
          className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/5"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M6 8h12l-1.2 10.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 8Z"
              stroke="var(--color-ink)"
              strokeWidth="1.6"
            />
            <path d="M9 8V6a3 3 0 0 1 6 0v2" stroke="var(--color-ink)" strokeWidth="1.6" />
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
