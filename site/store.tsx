import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CartItem, Language, Product } from '../types';

const read = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};
const write = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* prywatne okno / zablokowany storage */
  }
};

const detectLang = (): Language => {
  const saved = read<Language | null>('sf-lang', null);
  if (saved === 'NL' || saved === 'EN' || saved === 'PL') return saved;
  const nav = (navigator.language || '').toLowerCase();
  if (nav.startsWith('pl')) return 'PL';
  if (nav.startsWith('nl')) return 'NL';
  return 'NL';
};

interface Store {
  lang: Language;
  setLang: (l: Language) => void;
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (p: Product, size: string) => void;
  setQty: (id: string, size: string, qty: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  waitlistProduct: Product | null;
  openWaitlist: (p: Product | null) => void;
}

const Ctx = createContext<Store | null>(null);

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLangState] = useState<Language>(detectLang);
  const [cart, setCart] = useState<CartItem[]>(() => read<CartItem[]>('sf-cart', []));
  const [isCartOpen, setCartOpen] = useState(false);
  const [waitlistProduct, openWaitlist] = useState<Product | null>(null);

  useEffect(() => write('sf-cart', cart), [cart]);
  useEffect(() => {
    document.documentElement.lang = lang.toLowerCase();
  }, [lang]);

  const setLang = useCallback((l: Language) => {
    setLangState(l);
    write('sf-lang', l);
  }, []);

  const addToCart = useCallback((product: Product, size: string) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id && i.selectedSize === size);
      if (existing) {
        return prev.map((i) => (i === existing ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { ...product, quantity: 1, selectedSize: size }];
    });
  }, []);

  const setQty = useCallback((id: string, size: string, qty: number) => {
    setCart((prev) =>
      qty <= 0
        ? prev.filter((i) => !(i.id === id && i.selectedSize === size))
        : prev.map((i) => (i.id === id && i.selectedSize === size ? { ...i, quantity: qty } : i))
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const value = useMemo<Store>(
    () => ({
      lang,
      setLang,
      cart,
      cartCount: cart.reduce((n, i) => n + i.quantity, 0),
      cartTotal: cart.reduce((n, i) => n + i.price * i.quantity, 0),
      addToCart,
      setQty,
      clearCart,
      isCartOpen,
      setCartOpen,
      waitlistProduct,
      openWaitlist,
    }),
    [lang, setLang, cart, addToCart, setQty, clearCart, isCartOpen, waitlistProduct]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useStore = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
};
