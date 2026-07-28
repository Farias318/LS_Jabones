interface LogoProps {
  size?: number;
  tone?: 'brand' | 'inverse';
  showWordmark?: boolean;
  className?: string;
}

/**
 * Isotipo "L♥s" de LS Jabones — dos anillos concéntricos con las iniciales.
 * Reproduce el mark de design/LS Jabones v1.html; no depende de un archivo
 * de imagen, así que escala limpio en cualquier tamaño vía `size`.
 */
export function Logo({ size = 44, tone = 'brand', showWordmark = false, className = '' }: LogoProps) {
  const ringColor = tone === 'brand' ? '#cf93a5' : '#b57e91';
  const glyphColor = tone === 'brand' ? 'var(--color-brand)' : '#f4dfe6';
  const inner = size * 0.865;

  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <span
        className="flex shrink-0 items-center justify-center rounded-full"
        style={{ width: size, height: size, border: `1px solid ${ringColor}` }}
      >
        <span
          className="flex items-baseline justify-center rounded-full font-serif"
          style={{
            width: inner,
            height: inner,
            border: `1px solid ${ringColor}`,
            color: glyphColor,
            paddingTop: size * 0.14,
          }}
        >
          <span style={{ fontSize: size * 0.5, fontWeight: 500, lineHeight: 1 }}>L</span>
          <span style={{ fontSize: size * 0.19, lineHeight: 1, transform: `translateY(-${size * 0.21}px)` }}>♥</span>
          <span style={{ fontSize: size * 0.35, fontWeight: 500, lineHeight: 1 }}>s</span>
        </span>
      </span>

      {showWordmark && (
        <span className="flex flex-col gap-px">
          <span
            className="font-serif leading-none font-semibold tracking-wide"
            style={{ fontSize: size * 0.48, color: tone === 'brand' ? 'var(--color-ink)' : '#f4dfe6' }}
          >
            LS Jabones
          </span>
          <span
            className="leading-none uppercase"
            style={{ fontSize: size * 0.2, letterSpacing: '.24em', color: tone === 'brand' ? 'var(--color-label)' : '#cfa3b2' }}
          >
            artesanales · a pedido
          </span>
        </span>
      )}
    </span>
  );
}
