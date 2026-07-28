interface ProductImagePlaceholderProps {
  label: string;
  className?: string;
}

/**
 * Placeholder para productos sin foto real todavía (patrón a rayas + etiqueta,
 * igual que design/LS Jabones v1.html). Reemplazar por <img src={imageUrl}>
 * cuando lleguen las fotos.
 */
export function ProductImagePlaceholder({ label, className = '' }: ProductImagePlaceholderProps) {
  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{
        backgroundImage: 'repeating-linear-gradient(-45deg, #f8ecef 0 14px, #f3e2e7 14px 28px)',
      }}
      aria-hidden="true"
    >
      <span className="rounded-md bg-[#fffdfc]/75 px-2.5 py-1 font-mono text-[11px] text-[#b58798]">
        [ {label} ]
      </span>
    </div>
  );
}
