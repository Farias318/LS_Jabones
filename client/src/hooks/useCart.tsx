import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { CartItem, CartRefType } from '../types';

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  total: number;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (refType: CartRefType, refId: string) => void;
  updateQuantity: (refType: CartRefType, refId: string, quantity: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function sameLine(item: CartItem, refType: CartRefType, refId: string) {
  return item.refType === refType && item.refId === refId;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem: CartContextValue['addItem'] = (item, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((line) => sameLine(line, item.refType, item.refId));
      if (existing) {
        return prev.map((line) =>
          sameLine(line, item.refType, item.refId)
            ? { ...line, quantity: line.quantity + quantity }
            : line,
        );
      }
      return [...prev, { ...item, quantity }];
    });
  };

  const removeItem: CartContextValue['removeItem'] = (refType, refId) => {
    setItems((prev) => prev.filter((line) => !sameLine(line, refType, refId)));
  };

  const updateQuantity: CartContextValue['updateQuantity'] = (refType, refId, quantity) => {
    if (quantity <= 0) {
      removeItem(refType, refId);
      return;
    }
    setItems((prev) =>
      prev.map((line) => (sameLine(line, refType, refId) ? { ...line, quantity } : line)),
    );
  };

  const clear = () => setItems([]);

  const itemCount = useMemo(() => items.reduce((sum, line) => sum + line.quantity, 0), [items]);
  const total = useMemo(
    () => items.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0),
    [items],
  );

  return (
    <CartContext.Provider value={{ items, itemCount, total, addItem, removeItem, updateQuantity, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>');
  return ctx;
}
