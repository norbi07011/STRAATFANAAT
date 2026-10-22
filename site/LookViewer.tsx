import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
import { Product } from '../types';
import { Look } from '../lib/looks';
import { eur, ui } from '../lib/i18n';
import { img } from '../lib/media';
import { splitDescription } from '../lib/product';
import { useStore } from './store';
import { useNav } from './nav';
import { isAvailable } from './ProductCard';
import { flyToCart } from './fx/flyToCart';

const EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * Look viewer: kliknięte zdjęcie „przelatuje” (shared layout) na pół ekranu,
 * obok produkt z tego zdjęcia z szybkim zakupem. Strzałki, klawiatura i swipe przełączają looki.
 */
export const LookViewer = ({
  looks,
  index,
  products,
  onClose,
  onIndex,
  counter,
}: {
  looks: Look[];
  index: number;
  products: Product[];
  onClose: () => void;
  onIndex: (i: number) => void;
  counter?: (i: number, n: number) => string;
}) => {
  const { lang, addToCart, openWaitlist, toast, setCartOpen } = useStore();
  const { navigate, lenis } = useNav();
  const u = ui(lang);
  const look = looks[index];
  const product = products.find((p) => p.id === look.productId)!;
  const available = isAvailable(product);
  const [size, setSize] = useState<string | null>(null);
  const [dir, setDir] = useState(0);
  const [added, setAdded] = useState(false);
  const { lead } = splitDescription(product, lang);

  const go = (d: number) => {
    setDir(d);
    onIndex((index + d + looks.length) % looks.length);
  };

  useEffect(() => {
    setSize(product.sizes.length === 1 ? product.sizes[0] : null);
    setAdded(false);
  }, [product]);

  useEffect(() => {
    lenis.current?.stop();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      lenis.current?.start();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const add = (e: React.MouseEvent) => {
    if (!size) return;
    addToCart(product, size);
    flyToCart(img(look.image), (e.currentTarget.closest('[data-look-root]')?.querySelector('[data-look-img]') as HTMLElement)?.getBoundingClientRect() ?? null);
    setAdded(true);
    toast({ title: u.added, text: `${product.name} · ${u.size} ${size}`, image: img(product.image), action: { label: u.viewCart, run: () => setCartOpen(true) } });
  };

  return (
    <motion.div
      data-look-root
      className="fixed inset-0 z-[300] grid bg-black text-white md:grid-cols-[1.15fr_1fr]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3, delay: 0.1 } }}
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
    >
      {/* zdjęcie */}
      <div className="relative h-[52svh] overflow-hidden md:h-full">
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.div
            key={look.id}
            className="absolute inset-0"
            initial={dir === 0 ? false : { x: dir > 0 ? '100%' : '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: dir > 0 ? '-35%' : '35%', opacity: 0.4 }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.35}
            onDragEnd={(_, info) => {
              if (info.offset.x < -80) go(1);
              else if (info.offset.x > 80) go(-1);
            }}
          >
            <motion.img
              layoutId={`look-${look.id}`}
              data-look-img
              src={img(look.image, 1600)}
              alt={product.name}
              draggable={false}
              className="h-full w-full object-cover"
              transition={{ duration: 0.7, ease: EXPO }}
            />
          </motion.div>
        </AnimatePresence>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />
        <p className="absolute bottom-4 left-4 font-banner text-4xl tabular-nums text-haag-yellow md:bottom-6 md:left-6 md:text-6xl">{(counter ?? u.lookOf)(index + 1, looks.length)}</p>
      </div>

      {/* produkt */}
      <div className="flex min-h-0 flex-col overflow-y-auto p-5 md:p-10" data-lenis-prevent>
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-2">
            <button onClick={() => go(-1)} className="flex h-11 w-11 items-center justify-center border-2 border-white/30 hover:border-haag-yellow hover:text-haag-yellow" aria-label={u.prev}>
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button onClick={() => go(1)} className="flex h-11 w-11 items-center justify-center border-2 border-white/30 hover:border-haag-yellow hover:text-haag-yellow" aria-label={u.next}>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
          <button onClick={onClose} className="flex h-11 w-11 items-center justify-center bg-haag-yellow text-black" aria-label={u.close}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={product.id + look.id}
            initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -16, filter: 'blur(8px)' }}
            transition={{ duration: 0.45, ease: EXPO }}
            className="mt-auto flex flex-col gap-5 pt-8"
          >
            {!counter && <p className="text-sm font-bold text-haag-yellow">{u.shopLook}</p>}
            <h2 className="font-banner text-[11.5vw] break-words md:text-[clamp(3.5rem,5.5vw,6.5rem)]">{product.name}</h2>
            <div className="flex items-center gap-3 tabular-nums">
              <span className="text-2xl font-bold">{eur(product.price, lang)}</span>
              {!available && <span className="bg-haag-yellow px-2.5 py-1 text-sm font-bold text-black">{u.comingSoon}</span>}
            </div>
            <p className="max-w-md text-lg text-white/80">{lead}</p>

            {available ? (
              <>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      aria-pressed={size === s}
                      className={`h-11 min-w-12 px-3 font-bold ring-2 transition ${size === s ? 'bg-haag-yellow text-black ring-haag-yellow' : 'ring-white/25 hover:ring-white'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <button onClick={add} disabled={!size} className="flex h-14 items-center justify-center gap-2 bg-haag-yellow font-bold text-black transition hover:bg-white disabled:opacity-40">
                  {added ? (
                    <>
                      <Check className="h-5 w-5" /> {u.added}
                    </>
                  ) : size ? (
                    `${u.addToCart} · ${eur(product.price, lang)}`
                  ) : (
                    u.chooseSize
                  )}
                </button>
              </>
            ) : (
              <button onClick={() => openWaitlist(product)} className="flex h-14 items-center justify-center bg-haag-yellow font-bold text-black hover:bg-white">
                {u.notifyMe}
              </button>
            )}
            <button
              onClick={() => {
                onClose();
                setTimeout(() => navigate('product', product.id), 50);
              }}
              className="self-start border-b-2 border-white pb-0.5 font-semibold hover:border-haag-yellow hover:text-haag-yellow"
            >
              {u.viewProduct}
            </button>
          </motion.div>
        </AnimatePresence>

        {/* miniatury looków */}
        <div className="mt-8 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          {looks.map((l, i) => (
            <button
              key={l.id}
              onClick={() => {
                setDir(i > index ? 1 : -1);
                onIndex(i);
              }}
              className={`relative h-16 w-12 shrink-0 overflow-hidden transition-opacity ${i === index ? '' : 'opacity-40 hover:opacity-100'}`}
              aria-label={u.lookOf(i + 1, looks.length)}
            >
              <img src={img(l.image)} alt="" loading="lazy" className="h-full w-full object-cover" />
              {i === index && <motion.span layoutId="lv-thumb" className="absolute inset-x-0 bottom-0 h-1 bg-haag-yellow" />}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
