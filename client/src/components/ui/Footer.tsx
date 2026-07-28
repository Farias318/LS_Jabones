import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="bg-[var(--color-deep)] px-6 pb-10 pt-14 text-[#f4dfe6]">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4.5 text-center">
        <Logo size={64} tone="inverse" />
        <p className="font-serif text-xl italic">Jabones artesanales, hechos con amor</p>
        <p className="text-[13px] text-[#cfa3b2]">Pedidos y consultas por WhatsApp · Argentina</p>
        <p className="mt-1 text-[11px] uppercase tracking-[.2em] text-[#a67487]">© 2026 LS Jabones</p>
      </div>
    </footer>
  );
}
