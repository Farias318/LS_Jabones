import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Input({ label, id, className = '', ...props }: InputProps) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-[var(--color-ink)]">{label}</span>
      <input
        id={id}
        className={`rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-2.5 text-[var(--color-ink)] outline-none focus:border-[var(--color-brand)] ${className}`}
        {...props}
      />
    </label>
  );
}
