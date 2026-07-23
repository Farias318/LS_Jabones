const TINTS = ['#eef0ea', '#f3efe9', '#eef1f0', '#f1efe6'];

function tintFor(seed: string): string {
  const hash = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return TINTS[hash % TINTS.length];
}

interface ProductImagePlaceholderProps {
  seed: string;
  className?: string;
}

/**
 * Placeholder ilustrado para productos sin foto real todavía. Reemplazar por
 * <img src={product.imageUrl}> cuando lleguen las fotos — ver
 * docs/analisis-mejoras.md sobre optimización de imágenes.
 */
export function ProductImagePlaceholder({ seed, className = '' }: ProductImagePlaceholderProps) {
  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{ backgroundColor: tintFor(seed) }}
      aria-hidden="true"
    >
      <svg width="40%" height="40%" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="24" width="44" height="28" rx="6" stroke="var(--color-brand)" strokeWidth="2" />
        <path d="M16 24c0-6 6-11 16-11s16 5 16 11" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" />
        <path d="M22 38c2-2 4-2 6 0s4 2 6 0 4-2 6 0 4 2 6 0" stroke="var(--color-brand)" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      </svg>
    </div>
  );
}
