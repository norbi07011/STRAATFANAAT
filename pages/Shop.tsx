import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Product } from '../types';
import { TRANSLATIONS } from '../constants';
import { ui } from '../lib/i18n';
import { useStore } from '../site/store';
import { isAvailable, ProductCard } from '../site/ProductCard';
import { LookViewer } from '../site/LookViewer';
import { Look } from '../lib/looks';

type Cat = 'all' | 'Tees' | 'Damskie' | 'Accessories';

export const Shop = ({ products }: { products: Product[] }) => {
  const { lang } = useStore();
  const t = TRANSLATIONS[lang];
  const u = ui(lang);
  const [cat, setCat] = useState<Cat>('all');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sort, setSort] = useState<'featured' | 'low' | 'high' | 'name'>('featured');
  const [cols, setCols] = useState<3 | 4>(4);
  const [quick, setQuick] = useState<number | null>(null);

  const cats: { id: Cat; label: string }[] = [
    { id: 'all', label: u.allItems },
    { id: 'Tees', label: u.tees },
    { id: 'Damskie', label: u.women },
    { id: 'Accessories', label: u.accessories },
  ].filter((c) => c.id === 'all' || products.some((p) => p.category === c.id)) as { id: Cat; label: string }[];

  const list = useMemo(
    () =>
      products
        .filter((p) => cat === 'all' || p.category === cat)
        .filter((p) => !onlyAvailable || isAvailable(p))
        .sort((a, b) =>
          sort === 'low' ? a.price - b.price : sort === 'high' ? b.price - a.price : sort === 'name' ? a.name.localeCompare(b.name) : Number(isAvailable(b)) - Number(isAvailable(a))
        ),
    [products, cat, onlyAvailable, sort]
  );

  // quick view używa tego samego podglądu co lookbook (zdjęcie + szybki zakup)
  const quickLooks: Look[] = list.map((p) => ({ id: `p${p.id}`, image: p.image, productId: p.id, chapter: 'classic', hotspot: { x: 50, y: 50 } }));

  return (
    <div className="min-h-screen bg-paper px-4 pb-24 pt-28 md:px-8 md:pt-36">
      <div className="mx-auto max-w-[1600px]">
        <header className="flex flex-col justify-between gap-6 border-b-2 border-black pb-6 md:flex-row md:items-end">
          <motion.h1
            className="font-banner text-[30vw] leading-[0.78] md:text-[16rem]"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            {t.the_drop}
          </motion.h1>
          <p className="text-lg font-semibold tabular-nums">{u.items(list.length)}</p>
        </header>

        <div className="sticky top-16 z-30 -mx-4 flex flex-wrap items-center justify-between gap-3 bg-paper/90 px-4 py-4 backdrop-blur md:top-20 md:-mx-8 md:px-8">
          <div className="flex flex-wrap gap-2" role="tablist">
            {cats.map((c) => (
              <button
                key={c.id}
                role="tab"
                aria-selected={cat === c.id}
                onClick={() => setCat(c.id)}
                className="relative px-4 py-2 text-[15px] font-semibold"
              >
                {cat === c.id && (
                  <motion.span layoutId="shop-cat" className="absolute inset-0 bg-black" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />
                )}
                <span className={`relative ${cat === c.id ? 'text-haag-yellow' : ''}`}>{c.label}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-[15px] font-semibold">
            <span className="sr-only md:not-sr-only">{u.sortLabel}</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="cursor-pointer border-2 border-black bg-transparent px-3 py-1.5 font-semibold outline-none focus:border-haag-green"
            >
              <option value="featured">{u.sortFeatured}</option>
              <option value="low">{u.sortLow}</option>
              <option value="high">{u.sortHigh}</option>
              <option value="name">{u.sortName}</option>
            </select>
          </label>
          <div className="hidden items-center border-2 border-black lg:flex" role="group" aria-label={u.gridLabel}>
            {([3, 4] as const).map((n) => (
              <button key={n} onClick={() => setCols(n)} aria-pressed={cols === n} className={`flex h-8 w-10 items-center justify-center gap-0.5 ${cols === n ? 'bg-black' : ''}`} aria-label={`${n}`}>
                {Array.from({ length: n }, (_, i) => (
                  <span key={i} className={`h-3.5 w-1 ${cols === n ? 'bg-haag-yellow' : 'bg-black'}`} />
                ))}
              </button>
            ))}
          </div>
          <label className="flex cursor-pointer items-center gap-3 text-[15px] font-semibold">
            <span>{u.onlyAvailable}</span>
            <button
              role="switch"
              aria-checked={onlyAvailable}
              onClick={() => setOnlyAvailable((v) => !v)}
              className={`relative h-7 w-12 transition-colors ${onlyAvailable ? 'bg-haag-green' : 'bg-black/20'}`}
            >
              <motion.span
                layout
                transition={{ type: 'spring', stiffness: 600, damping: 35 }}
                className={`absolute top-1 h-5 w-5 bg-white ${onlyAvailable ? 'right-1' : 'left-1'}`}
              />
            </button>
          </label>
          </div>
        </div>

        {list.length === 0 ? (
          <p className="py-24 text-lg">{u.noResults}</p>
        ) : (
          <motion.div layout className={`mt-6 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-6 ${cols === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
            <AnimatePresence mode="popLayout">
              {list.map((p, i) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: Math.min(i, 8) * 0.04 }}
                >
                  <ProductCard product={p} sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw" onQuickView={() => setQuick(i)} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
      <AnimatePresence>
        {quick !== null && quickLooks[quick] && (
          <LookViewer looks={quickLooks} index={quick} products={products} onIndex={setQuick} onClose={() => setQuick(null)} counter={(i, n) => `${i} / ${n}`} />
        )}
      </AnimatePresence>
    </div>
  );
};
