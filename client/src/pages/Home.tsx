import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { Combo, Product } from '../types';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import { useToast } from '../hooks/useToast';
import { PerfumeFilter } from '../components/catalog/PerfumeFilter';
import { ProductGrid } from '../components/catalog/ProductGrid';
import { ComboCard } from '../components/catalog/ComboCard';
import { ProductImagePlaceholder } from '../components/catalog/ProductImagePlaceholder';
import { Logo } from '../components/ui/Logo';
import { Footer } from '../components/ui/Footer';
import { formatPrice, shortProductName } from '../utils/format';

const MAX_COMBO_ITEMS = 3;

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function Home() {
  const { products, combos, perfumes, perfumeFilter, setPerfumeFilter, filteredProducts } = useProducts();
  const { addItem } = useCart();
  const { show: showToast } = useToast();
  const location = useLocation();

  const [comboMode, setComboMode] = useState(false);
  const [comboSel, setComboSel] = useState<string[]>([]);

  useEffect(() => {
    const target = (location.state as { scrollTo?: string } | null)?.scrollTo;
    if (target) {
      scrollTo(target);
      window.history.replaceState({}, '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddProduct = (product: Product) => {
    addItem({
      refType: 'product',
      refId: product.id,
      nameSnapshot: product.name,
      unitPrice: product.price,
      imageUrl: product.imageUrl,
    });
    showToast(`${product.name} agregado al pedido ✓`);
  };

  const handleAddCombo = (combo: Combo) => {
    addItem({
      refType: 'combo',
      refId: combo.id,
      nameSnapshot: combo.name,
      unitPrice: combo.comboPrice,
    });
    showToast(`${combo.name} agregado al pedido ✓`);
  };

  const toggleComboMode = () => {
    setComboMode((mode) => !mode);
    setComboSel([]);
  };

  const toggleSelectProduct = (product: Product) => {
    setComboSel((sel) => {
      if (sel.includes(product.id)) return sel.filter((id) => id !== product.id);
      if (sel.length >= MAX_COMBO_ITEMS) {
        showToast(`Máximo ${MAX_COMBO_ITEMS} jabones por combo`);
        return sel;
      }
      return [...sel, product.id];
    });
  };

  const comboSelProducts = comboSel.map((id) => products.find((p) => p.id === id)).filter((p): p is Product => Boolean(p));
  const comboSum = comboSelProducts.reduce((sum, p) => sum + p.price, 0);
  const comboSelectionValid = comboSel.length >= 2;

  const addCustomCombo = () => {
    if (!comboSelectionValid) return;
    const name = 'Tu combo: ' + comboSelProducts.map((p) => shortProductName(p.name)).join(' · ');
    addItem({ refType: 'custom-combo', refId: `custom-${Date.now()}`, nameSnapshot: name, unitPrice: comboSum });
    showToast(`${name} agregado al pedido ✓`);
    setComboMode(false);
    setComboSel([]);
  };

  return (
    <main>
      <section className="relative overflow-hidden px-6 pb-19 pt-22 text-center">
        <div
          className="pointer-events-none absolute -top-35 left-1/2 h-130 w-180 -translate-x-1/2"
          style={{ background: 'radial-gradient(closest-side, rgba(216,167,181,.28), rgba(216,167,181,0))' }}
        />
        <div className="relative mx-auto flex max-w-xl flex-col items-center gap-5.5">
          <Logo size={104} />
          <p className="text-[11px] uppercase tracking-[.32em] text-[var(--color-label)]">Jabones artesanales</p>
          <h1 className="font-serif text-[clamp(38px,6vw,58px)] font-medium leading-[1.08] tracking-tight text-[var(--color-deep)]">
            Hechos con amor,
            <br />
            <em className="font-normal not-italic">a pedido</em>
          </h1>
          <p className="max-w-[440px] text-base leading-relaxed text-[var(--color-muted)]">
            Cada jabón se elabora especialmente para vos, con ingredientes naturales y aromas que abrazan. Elegí los
            tuyos y te confirmamos por WhatsApp.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3.5">
            <button
              onClick={() => scrollTo('catalogo')}
              className="inline-flex items-center rounded-full bg-[var(--color-brand)] px-7.5 py-3.5 text-sm font-semibold tracking-wide text-white transition-colors hover:bg-[var(--color-brand-dark)]"
            >
              Ver catálogo
            </button>
            <button
              onClick={() => scrollTo('como-funciona')}
              className="inline-flex items-center rounded-full border border-[#d9b3c0] px-7.5 py-3.5 text-sm font-semibold tracking-wide text-[var(--color-brand)] transition-colors hover:bg-[var(--color-accent-soft)]"
            >
              Cómo funciona
            </button>
          </div>
        </div>
      </section>

      {combos.length > 0 && (
        <section className="mx-auto max-w-5xl px-6 pb-16 pt-6">
          <p className="pb-1.5 text-[11px] uppercase tracking-[.28em] text-[var(--color-label)]">Combos</p>
          <h2 className="pb-6 font-serif text-[32px] font-medium text-[var(--color-deep)]">Pensados para regalar(te)</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {combos.map((combo) => (
              <ComboCard key={combo.id} combo={combo} products={products} onAdd={handleAddCombo} />
            ))}
          </div>
        </section>
      )}

      <section id="catalogo" className="mx-auto max-w-5xl scroll-mt-20 px-6 pb-20 pt-2">
        <p className="pb-1.5 text-[11px] uppercase tracking-[.28em] text-[var(--color-label)]">Catálogo</p>
        <h2 className="pb-5 font-serif text-[32px] font-medium text-[var(--color-deep)]">Nuestros jabones</h2>

        <div className="mb-6.5 flex flex-wrap gap-2">
          <PerfumeFilter perfumes={perfumes} selected={perfumeFilter} onSelect={setPerfumeFilter} />
          <button
            onClick={toggleComboMode}
            className={`shrink-0 rounded-full border border-dashed px-4 py-2 text-xs font-bold transition-colors ${
              comboMode
                ? 'border-[var(--color-brand)] bg-[var(--color-accent-soft)] text-[var(--color-brand)]'
                : 'border-[#cf93a5] text-[var(--color-brand)]'
            }`}
          >
            + Armá tu combo
          </button>
        </div>

        {comboMode && (
          <div className="mb-6 flex flex-wrap items-center gap-3.5 rounded-2xl border border-dashed border-[#cf93a5] bg-[var(--color-accent-soft)] px-5 py-3.5">
            <p className="min-w-55 flex-1 text-[13.5px] text-[var(--color-muted)]">
              <strong>Armá tu combo:</strong> elegí 2 o 3 jabones tocando las tarjetas · {comboSel.length}/{MAX_COMBO_ITEMS}
            </p>
            <span className="font-serif text-xl font-semibold text-[var(--color-deep)]">{formatPrice(comboSum)}</span>
            <button
              onClick={addCustomCombo}
              disabled={!comboSelectionValid}
              className="rounded-full bg-[var(--color-brand)] px-6 py-2.5 text-[13px] font-semibold text-white transition-all hover:bg-[var(--color-brand-dark)] disabled:cursor-default disabled:opacity-45"
            >
              Agregar combo
            </button>
            <button onClick={toggleComboMode} className="border-0 bg-transparent p-0 text-[13px] font-semibold text-[var(--color-brand)] underline">
              Cancelar
            </button>
          </div>
        )}

        <ProductGrid
          products={filteredProducts}
          onAdd={handleAddProduct}
          comboMode={comboMode}
          comboSelection={comboSel}
          onToggleSelect={toggleSelectProduct}
        />
      </section>

      <section id="como-funciona" className="scroll-mt-20 bg-[var(--color-accent-soft)] px-6 py-18">
        <div className="mx-auto max-w-5xl">
          <p className="pb-1.5 text-center text-[11px] uppercase tracking-[.28em] text-[var(--color-label)]">Cómo funciona</p>
          <h2 className="pb-11 text-center font-serif text-[32px] font-medium text-[var(--color-deep)]">
            Sin stock: todo se hace para vos
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                n: 1,
                title: 'Elegís tus jabones',
                text: 'Armá tu pedido con jabones individuales o combos, como más te guste.',
              },
              {
                n: 2,
                title: 'Te confirmamos por WhatsApp',
                text: 'Recibís un mensaje con el detalle, el tiempo de elaboración y la forma de pago.',
              },
              {
                n: 3,
                title: 'Lo hacemos y te lo entregamos',
                text: 'Tus jabones se elaboran a mano y coordinamos la entrega con vos.',
              },
            ].map((step) => (
              <div key={step.n} className="flex flex-col items-center gap-3.5 text-center">
                <span className="flex h-13.5 w-13.5 items-center justify-center rounded-full border border-[#cf93a5] bg-[var(--color-surface)] font-serif text-[26px] text-[var(--color-brand)]">
                  {step.n}
                </span>
                <h3 className="font-serif text-xl font-semibold text-[var(--color-ink)]">{step.title}</h3>
                <p className="max-w-65 text-sm leading-relaxed text-[var(--color-muted)]">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="nosotros" className="mx-auto max-w-5xl scroll-mt-20 px-6 py-20">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
          <ProductImagePlaceholder
            label="foto: manos haciendo jabón"
            className="mx-auto aspect-[4/5] w-full max-w-105 rounded-[20px]"
          />
          <div className="flex flex-col gap-4">
            <p className="text-[11px] uppercase tracking-[.28em] text-[var(--color-label)]">Nosotros</p>
            <h2 className="font-serif text-[32px] font-medium leading-tight text-[var(--color-deep)]">
              Un emprendimiento que nació en casa
            </h2>
            <p className="text-[15px] leading-relaxed text-[var(--color-muted)]">
              LS Jabones empezó como un hobby y se convirtió en un ritual: elegir los aceites, los aromas y los
              moldes para que cada jabón sea único. No trabajamos con stock — cada pedido se elabora a mano, con
              tiempo y cariño, pensando en quién lo va a usar.
            </p>
            <p className="text-[15px] leading-relaxed text-[var(--color-muted)]">
              Usamos ingredientes naturales, aptos para pieles sensibles, y probamos cada receta antes de ofrecerla.
            </p>
            <button
              onClick={() => scrollTo('catalogo')}
              className="self-start border-b border-[#d9b3c0] pb-0.5 text-sm font-semibold text-[var(--color-brand)]"
            >
              Conocé nuestros jabones →
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
