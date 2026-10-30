import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'velora_ria_cart_v1';
const CartContext = createContext(null);

const read = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(read);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      open,
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      totalCents: items.reduce((sum, item) => sum + (item.priceCents || 0) * item.quantity, 0),
      openCart: () => setOpen(true),
      closeCart: () => setOpen(false),
      add: (product) =>
        setItems((prev) => {
          const existing = prev.find((item) => item.slug === product.slug);
          if (existing) {
            return prev.map((item) =>
              item.slug === product.slug ? { ...item, quantity: Math.min(item.quantity + 1, 5) } : item,
            );
          }
          return [
            ...prev,
            {
              slug: product.slug,
              name: product.name,
              priceCents: product.priceCents,
              image: product.image,
              category: product.category,
              quantity: 1,
            },
          ];
        }),
      remove: (slug) => setItems((prev) => prev.filter((item) => item.slug !== slug)),
      clear: () => setItems([]),
    }),
    [items, open],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};
