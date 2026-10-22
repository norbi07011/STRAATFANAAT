import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Minus, Plus, X } from 'lucide-react';
import { eur, ui } from '../lib/i18n';
import { img } from '../lib/media';
import { useStore } from './store';
import { useNav } from './nav';
import { Btn } from './ui';

const FREE_SHIPPING = 75; // zgodnie z Checkout.tsx

export const CartDrawer = () => {
  const { lang, cart, cartTotal, setQty, isCartOpen, setCartOpen } = useStore();
  const { navigate, lenis } = useNav();
  const u = ui(lang);
  const left = Math.max(0, FREE_SHIPPING - cartTotal);
  const progress = Math.min(1, cartTotal / FREE_SHIPPING);

  useEffect(() => {
    if (isCartOpen) lenis.current?.stop();
    else lenis.current?.start();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setCartOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isCartOpen, lenis, setCartOpen]);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label={u.cart}>
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
          />
          <motion.aside
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-paper text-black"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="flex items-center justify-between border-b-2 border-black px-5 py-4">
              <h2 className="font-banner text-5xl">{u.cart}</h2>
              <button onClick={() => setCartOpen(false)} className="flex h-10 w-10 items-center justify-center" aria-label={u.close}>
                <X className="h-6 w-6" />
              </button>
            </div>

            {cart.length > 0 && (
              <div className="border-b border-black/15 px-5 py-4">
                <p className="text-sm font-semibold">{left > 0 ? u.toFreeShipping(eur(left, lang)) : u.freeShipping}</p>
                <div className="mt-2 h-2 overflow-hidden bg-paper-2">
                  <motion.div
                    className="h-full scarf-stripes-diag"
                    initial={false}
                    animate={{ width: `${progress * 100}%` }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-5 py-4" data-lenis-prevent>
              {cart.length === 0 ? (
                <div className="flex h-full flex-col items-start justify-center gap-6">
                  <p className="text-lg">{u.cartEmpty}</p>
                  <Btn
                    variant="black"
                    onClick={() => {
                      setCartOpen(false);
                      navigate('shop');
                    }}
                  >
                    {u.shopDrop}
                  </Btn>
                </div>
              ) : (
                <ul className="flex flex-col gap-4">
                  <AnimatePresence initial={false}>
                    {cart.map((item) => (
                      <motion.li
                        key={`${item.id}-${item.selectedSize}`}
                        layout
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 40, height: 0, marginTop: 0 }}
                        className="flex gap-4"
                      >
                        <img src={img(item.image)} alt={item.name} className="h-28 w-20 shrink-0 bg-paper-2 object-cover" />
                        <div className="flex flex-1 flex-col">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="font-bold leading-tight">{item.name}</h3>
                            <span className="font-bold tabular-nums">{eur(item.price * item.quantity, lang)}</span>
                          </div>
                          <p className="mt-1 text-sm text-black/60">
                            {u.size}: {item.selectedSize}
                          </p>
                          <div className="mt-auto flex items-center justify-between">
                            <div className="flex items-center border-2 border-black">
                              <button
                                className="flex h-8 w-8 items-center justify-center hover:bg-black hover:text-white"
                                onClick={() => setQty(item.id, item.selectedSize, item.quantity - 1)}
                                aria-label="-1"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="w-8 text-center font-bold tabular-nums">{item.quantity}</span>
                              <button
                                className="flex h-8 w-8 items-center justify-center hover:bg-black hover:text-white"
                                onClick={() => setQty(item.id, item.selectedSize, item.quantity + 1)}
                                aria-label="+1"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                            <button
                              className="text-sm font-semibold underline underline-offset-4 hover:text-haag-green"
                              onClick={() => setQty(item.id, item.selectedSize, 0)}
                            >
                              {u.remove}
                            </button>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t-2 border-black px-5 py-5">
                <div className="mb-4 flex items-baseline justify-between">
                  <span className="font-semibold">{u.subtotal}</span>
                  <span className="font-banner text-4xl tabular-nums">{eur(cartTotal, lang)}</span>
                </div>
                <Btn
                  variant="black"
                  className="w-full"
                  onClick={() => {
                    setCartOpen(false);
                    navigate('checkout');
                  }}
                >
                  {u.checkout}
                </Btn>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};
