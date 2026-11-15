import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Product } from '../types';
import { TRANSLATIONS } from '../constants';
import { ui } from '../lib/i18n';
import { useStore } from '../site/store';
import { isAvailable } from '../site/ProductCard';
import { GalleryCard } from '../site/GalleryCard';
import { LookViewer } from '../site/LookViewer';
import { Look } from '../lib/looks';
import { ShelfWall } from '../site/fx/ShelfWall';

type Cat = 'all' | 'Tees' | 'Damskie' | 'Accessories';

export const Shop = ({ products }: { products: Product[] }) => {
  const { lang, shopView, setShopView } = useStore();
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

  const wallList = useMemo(() => [...products].sort((a, b) => Number(isAvailable(b)) - Number(isAvailable(a))), [products]);

  const toggle = (dark: boolean) => (
    <div className={`flex items-center rounded-full p-1 text-[13px] font-semibold ${dark ? 'bg-white/10 text-white backdrop-blur' : 'border-2 border-black'}`} role="group" aria-label={u.gridLabel}>
      {(['wall', 'grid'] as const).map((v) => (
        <button
          key={v}
          onClick={() => {
            setShopView(v);
            window.scrollTo(0, 0);
          }}
          aria-pressed={shopView === v}
          className={`rounded-full px-3.5 py-1.5 transition ${shopView === v ? (dark ? 'bg-white text-black' : 'bg-black text-haag-yellow') : ''}`}
        >
          {v === 'wall' ? u.wallView : u.gridView}
        </button>
      ))}
    </div>
  );

  if (shopView === 'wall') {
    return (
      <div className="relative bg-[#24201f]">
        <ShelfWall products={wallList} extra={toggle(true)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-4 pb-24 pt-28 text-white md:px-8 md:pt-36">
      <div className="mx-auto max-w-[1600px]">
        <header className="flex flex-col justify-between gap-6 border-b border-white/12 pb-8 md:flex-row md:items-end">
          <motion.h1
            className="sf-h2"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            {t.the_drop}
          </motion.h1>
          <div className="flex flex-col items-start gap-3 md:items-end">
            {toggle(true)}
            <p className="text-base tabular-nums text-white/60">{u.items(list.length)}</p>
          </div>
        </header>

        <div className="sticky top-16 z-30 -mx-4 flex flex-wrap items-center justify-between gap-3 bg-black/85 px-4 py-4 backdrop-blur md:top-20 md:-mx-8 md:px-8">
          <div className="flex flex-wrap gap-2" role="tablist">
            {cats.map((c) => (
              <button
                key={c.id}
                role="tab"
                aria-selected={cat === c.id}
                onClick={() => setCat(c.id)}
                className="relative px-4 py-2 text-[15px] font-semibold text-white/70 transition-colors hover:text-white"
              >
                {cat === c.id && (
                  <motion.span layoutId="shop-cat" className="absolute inset-0 bg-white" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />
                )}
                <span className={`relative ${cat === c.id ? 'text-black' : ''}`}>{c.label}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-[15px] font-semibold text-white/80">
            <span className="sr-only md:not-sr-only">{u.sortLabel}</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="cursor-pointer border border-white/25 bg-black px-3 py-1.5 font-semibold text-white outline-none focus:border-haag-yellow"
            >
              <option value="featured">{u.sortFeatured}</option>
              <option value="low">{u.sortLow}</option>
              <option value="high">{u.sortHigh}</option>
              <option value="name">{u.sortName}</option>
            </select>
          </label>
          <div className="hidden items-center border border-white/25 lg:flex" role="group" aria-label={u.gridLabel}>
            {([3, 4] as const).map((n) => (
              <button key={n} onClick={() => setCols(n)} aria-pressed={cols === n} className={`flex h-8 w-10 items-center justify-center gap-0.5 ${cols === n ? 'bg-white' : ''}`} aria-label={`${n}`}>
                {Array.from({ length: n }, (_, i) => (
                  <span key={i} className={`h-3.5 w-1 ${cols === n ? 'bg-black' : 'bg-white/60'}`} />
                ))}
              </button>
            ))}
          </div>
          <label className="flex cursor-pointer items-center gap-3 text-[15px] font-semibold text-white/80">
            <span>{u.onlyAvailable}</span>
            <button
              role="switch"
              aria-checked={onlyAvailable}
              onClick={() => setOnlyAvailable((v) => !v)}
              className={`relative h-7 w-12 transition-colors ${onlyAvailable ? 'bg-haag-green' : 'bg-white/20'}`}
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
          <div className="mt-8 flex flex-col gap-16 md:gap-24">
            {[
              { title: u.availableNow, items: list.filter(isAvailable) },
              { title: u.nextDrop, items: list.filter((p) => !isAvailable(p)) },
            ]
              .filter((g) => g.items.length > 0)
              .map((g) => (
                <section key={g.title}>
                  <div className="mb-6 flex items-baseline justify-between gap-4 border-b border-white/12 pb-4">
                    <h2 className="font-narrow text-2xl font-bold md:text-3xl">{g.title}</h2>
                    <span className="text-base tabular-nums text-white/55">{u.items(g.items.length)}</span>
                  </div>
                  <div className={`grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-6 ${cols === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
                    {g.items.map((p) => (
                      <GalleryCard key={p.id} product={p} />
                    ))}
                  </div>
                </section>
              ))}
          </div>
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
