import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-dark)]',
  secondary: 'bg-transparent text-[var(--color-ink)] border border-[var(--color-line)] hover:border-[var(--color-brand)]',
  ghost: 'bg-transparent text-[var(--color-ink)] hover:bg-black/5',
};

export function Button({ variant = 'primary', type = 'button', className = '', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  );
}
