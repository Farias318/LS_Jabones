import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { createOrder } from '../services/api';
import { CartLineItem } from '../components/cart/CartLineItem';
import { CartSummary } from '../components/cart/CartSummary';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export function Cart() {
  const { items, total, updateQuantity, removeItem, clear } = useCart();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = items.length > 0 && name.trim() !== '' && phone.trim() !== '' && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const order = await createOrder({ name, phone, notes: notes || undefined }, items);
      clear();
      navigate(`/pedido/${order.code}`, { state: { order } });
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-sm text-[var(--color-ink)]/60">Todavía no agregaste ningún jabón a tu pedido.</p>
        <Link to="/" className="mt-4 inline-block text-sm font-medium text-[var(--color-brand)] underline">
          Volver al catálogo
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-8">
      <h1 className="pb-4 text-xl font-semibold">Tu pedido</h1>

      <div className="divide-y divide-[var(--color-line)] rounded-2xl border border-[var(--color-line)] bg-white px-4">
        {items.map((item) => (
          <CartLineItem
            key={`${item.refType}-${item.refId}`}
            item={item}
            onIncrease={() => updateQuantity(item.refType, item.refId, item.quantity + 1)}
            onDecrease={() => updateQuantity(item.refType, item.refId, item.quantity - 1)}
            onRemove={() => removeItem(item.refType, item.refId)}
          />
        ))}
      </div>

      <form
        className="mt-6 flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
      >
        <Input label="Nombre" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input
          label="Teléfono (WhatsApp)"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="11-5555-5555"
          required
        />
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Notas (opcional)</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="rounded-lg border border-[var(--color-line)] bg-white px-3.5 py-2.5 outline-none focus:border-[var(--color-brand)]"
            placeholder="Ej: retiro por la tarde, envolver para regalo, etc."
          />
        </label>

        <CartSummary total={total} ctaLabel={submitting ? 'Enviando...' : 'Confirmar pedido'} ctaDisabled={!canSubmit} onCta={() => void handleSubmit()} />
      </form>

      <Button variant="ghost" className="mt-4 w-full" onClick={() => navigate('/')}>
        Seguir viendo el catálogo
      </Button>
    </main>
  );
}
