import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../../types';
import { eur, ui } from '../../lib/i18n';
import { img } from '../../lib/media';
import { useStore } from '../store';
import { NavLink } from '../nav';

const SWATCH: Record<string, string> = { Black: '#000000', White: '#ffffff', Pink: '#f4a7c0' };

/**
 * 3D coverflow carousel z wyborem koloru: przeciąganie, strzałki i klawiatura.
 */
export const Coverflow = ({ products }: { products: Product[] }) => {
  const { lang } = useStore();
  const u = ui(lang);
  const colors = useMemo(() => Array.from(new Set(products.flatMap((p) => p.colors))).filter((c) => SWATCH[c]), [products]);
  const [color, setColor] = useState<string>('all');
  const list = useMemo(() => products.filter((p) => color === 'all' || p.colors.includes(color)), [products, color]);
  const [index, setIndex] = useState(0);
  const [step, setStep] = useState(260);

  useEffect(() => setIndex(Math.min(Math.floor(list.length / 2), list.length - 1)), [list]);
  useEffect(() => {
    const on = () => setStep(Math.min(320, Math.max(170, window.innerWidth * 0.26)));
    on();
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);

  const go = (d: number) => setIndex((i) => Math.max(0, Math.min(list.length - 1, i + d)));
  const current = list[index];

  return (
    <div
      className="outline-none"
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Coverflow"
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(1);
        if (e.key === 'ArrowLeft') go(-1);
      }}
    >
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <span className="mr-2 font-semibold">{u.color}</span>
        <button
          onClick={() => setColor('all')}
          aria-pressed={color === 'all'}
          className={`h-9 px-3 text-sm font-semibold ring-2 ring-offset-2 ring-offset-black transition ${color === 'all' ? 'bg-haag-yellow text-black ring-haag-yellow' : 'text-white ring-white/25 hover:ring-white'}`}
        >
          {u.allItems}
        </button>
        {colors.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            aria-pressed={color === c}
            aria-label={c}
            title={c}
            className={`h-9 w-9 rounded-full ring-2 ring-offset-2 ring-offset-black transition ${color === c ? 'ring-haag-yellow' : 'ring-white/25 hover:ring-white'}`}
            style={{ background: SWATCH[c] }}
          />
        ))}
      </div>

      <motion.div
        className="relative h-[clamp(340px,52vw,560px)] cursor-grab touch-pan-y [perspective:1400px] active:cursor-grabbing"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        onDragEnd={(_, info) => {
          const d = Math.round(-info.offset.x / (step * 0.45));
          if (d) go(Math.max(-3, Math.min(3, d)));
        }}
      >
        {list.map((p, i) => {
          const off = i - index;
          const abs = Math.abs(off);
          if (abs > 4) return null;
          return (
            <motion.div
              key={p.id}
              className="absolute left-1/2 top-0 w-[clamp(170px,26vw,320px)] [transform-style:preserve-3d]"
              style={{ zIndex: 100 - abs, marginLeft: 'calc(clamp(170px,26vw,320px) / -2)' }}
              initial={false}
              animate={{
                x: off === 0 ? 0 : Math.sign(off) * (step * 0.68 + (abs - 1) * step * 0.4),
                rotateY: off === 0 ? 0 : off < 0 ? 58 : -58,
                scale: off === 0 ? 1.08 : 0.9,
                z: off === 0 ? 80 : -abs * 90,
                opacity: abs > 3 ? 0 : 1,
              }}
              transition={{ type: 'spring', stiffness: 170, damping: 24 }}
              onClick={() => off !== 0 && setIndex(i)}
            >
              <div className="aspect-[2/3] overflow-hidden bg-asphalt-2 [-webkit-box-reflect:below_6px_linear-gradient(transparent_70%,rgba(0,0,0,0.35))]">
                <img src={img(p.image)} alt={p.name} draggable={false} className="h-full w-full object-cover" />
              </div>
            </motion.div>
          );
        })}
        <button onClick={() => go(-1)} className="absolute left-0 top-1/2 z-[200] flex h-12 w-12 -translate-y-1/2 items-center justify-center bg-white/10 text-white backdrop-blur hover:bg-haag-yellow hover:text-black" aria-label="←">
          <ChevronLeft />
        </button>
        <button onClick={() => go(1)} className="absolute right-0 top-1/2 z-[200] flex h-12 w-12 -translate-y-1/2 items-center justify-center bg-white/10 text-white backdrop-blur hover:bg-haag-yellow hover:text-black" aria-label="→">
          <ChevronRight />
        </button>
      </motion.div>

      <div className="mt-16 flex min-h-24 flex-col items-center text-center" aria-live="polite">
        <AnimatePresence mode="wait">
          {current && (
            <motion.div key={current.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
              <NavLink page="product" id={current.id} className="font-banner text-5xl hover:text-haag-yellow md:text-6xl">
                {current.name}
              </NavLink>
              <p className="mt-2 tabular-nums text-white/70">
                {eur(current.price, lang)} · {current.available === false ? u.comingSoon : u.availableNow}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
