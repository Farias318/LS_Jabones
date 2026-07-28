import type { ReactNode } from 'react';
import { Button } from '../ui/Button';
import { formatPrice } from '../../utils/format';

interface CartSummaryProps {
  total: number;
  ctaLabel: string;
  onCta: () => void;
  ctaDisabled?: boolean;
  children?: ReactNode;
}

export function CartSummary({ total, ctaLabel, onCta, ctaDisabled, children }: CartSummaryProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <span className="text-[13px] text-[var(--color-label)]">Total</span>
        <span className="font-serif text-[26px] font-semibold text-[var(--color-deep)]">{formatPrice(total)}</span>
      </div>
      {children}
      <Button variant="primary" onClick={onCta} disabled={ctaDisabled} className="w-full py-3.5">
        {ctaLabel}
      </Button>
    </div>
  );
}
