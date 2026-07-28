import { useCart } from '../../hooks/useCart';
import { useScrollToSection } from '../../hooks/useScrollToSection';
import { formatPrice } from '../../utils/format';
import { Logo } from './Logo';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  onOpenCart: () => void;
}

const LINKS = [
  { id: 'catalogo', label: 'Catálogo' },
  { id: 'como-funciona', label: 'Cómo funciona' },
  { id: 'nosotros', label: 'Nosotros' },
];

export function MobileMenu({ open, onClose, onOpenCart }: MobileMenuProps) {
  const { itemCount, total } = useCart();
  const goToSection = useScrollToSection();

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-[52] bg-[#3d2029]/35 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <nav
        className={`fixed left-0 top-0 z-[55] flex h-full w-[280px] max-w-[85vw] flex-col bg-[var(--color-surface)] shadow-[16px_0_48px_rgba(95,47,62,0.18)] transition-transform duration-[450ms] ease-[cubic-bezier(.22,1,.36,1)] ${
          open ? 'translate-x-0' : '-translate-x-[105%]'
        }`}
      >
        <div className="flex items-center justify-between border-b border-[var(--color-line)] px-5.5 py-4.5">
          <Logo size={36} showWordmark />
          <button onClick={onClose} aria-label="Cerrar menú" className="px-1.5 py-0.5 text-2xl text-[var(--color-label)] hover:text-[var(--color-brand)]">
            ×
          </button>
        </div>

        <div className="flex flex-1 flex-col py-2.5">
          {LINKS.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                onClose();
                goToSection(link.id);
              }}
              className="px-6 py-3.5 text-left text-[15px] font-semibold text-[var(--color-muted)] hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-brand)]"
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={onOpenCart}
            className="mx-6 mt-3.5 flex items-center justify-center gap-2.5 rounded-full bg-[var(--color-brand)] px-5 py-3.5 text-sm font-semibold tracking-wide text-white transition-colors hover:bg-[var(--color-brand-dark)]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 8h12l-1.2 10.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 8Z" stroke="#fff" strokeWidth="1.7" />
              <path d="M9 8V6a3 3 0 0 1 6 0v2" stroke="#fff" strokeWidth="1.7" />
            </svg>
            Ver pedido ({itemCount}) · {formatPrice(total)}
          </button>
        </div>

        <p className="border-t border-[var(--color-line)] px-6 py-5 font-serif text-xs italic text-[var(--color-label)]">
          hechos con amor, a pedido
        </p>
      </nav>
    </>
  );
}
