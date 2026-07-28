import { useToast } from '../../hooks/useToast';

export function Toast() {
  const { message, visible } = useToast();

  return (
    <div
      className={`fixed bottom-7 left-1/2 z-[60] max-w-[90vw] -translate-x-1/2 truncate rounded-full bg-[var(--color-deep)] px-5.5 py-3 text-[13.5px] font-semibold text-[#f9edf0] shadow-lg shadow-[var(--color-deep)]/30 transition-all duration-300 pointer-events-none ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
      }`}
    >
      {message}
    </div>
  );
}
