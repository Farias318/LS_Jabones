import type { ReactNode } from 'react';
import { Button } from '../ui/Button';

interface CartSummaryProps {
  total: number;
  ctaLabel: string;
  onCta: () => void;
  ctaDisabled?: boolean;
  children?: ReactNode;
}

const currency = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

export function CartSummary({ total, ctaLabel, onCta, ctaDisabled, children }: CartSummaryProps) {
  return (
    <div className="flex flex-col gap-3 border-t border-[var(--color-line)] pt-4">
      <div className="flex items-center justify-between text-sm font-semibold">
        <span>Total</span>
        <span>{currency.format(total)}</span>
      </div>
      {children}
      <Button variant="primary" onClick={onCta} disabled={ctaDisabled} className="w-full py-3">
        {ctaLabel}
      </Button>
    </div>
  );
}
