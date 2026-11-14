import React, { useRef, useState } from 'react';
import { motion, MotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import { Product } from '../../types';
import { eur, ui } from '../../lib/i18n';
import { useStore } from '../store';
import { NavLink } from '../nav';
import { isAvailable } from '../ProductCard';
import { GalleryCard } from '../GalleryCard';

/*
  Scena „jeden produkt na środku”: scroll opowiada jedną historię.
  Każdy rozdział to jedna koszulka: wjeżdża z innej strony, obraca się o pełny obrót (przód, plecy, przód),
  odjeżdża, a tło zmienia kolor. Tekst po lewej wymienia się z rozdziałem, kropki po prawej pokazują postęp.
  W ostatnim rozdziale wszystkie produkty ustawiają się w rzędzie.
*/

const EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

// kolor światła za produktem (rgb), dobrany do nadruku
const GLOW: Record<string, string> = {
  '28': '216,166,58', // DE KEIZER: złoto
  '17': '170,178,188', // HAAG Back!: srebro
  '8': '190,205,60', // SAVAGE: żółto-zielony
  '16': '34,179,94', // czapka: zieleń
};
const ORDER = ['28', '17', '8', '16'];

// skąd wjeżdża i dokąd odjeżdża kolejny produkt
const PATHS = [
  { inX: '60vw', inY: '0vh', outX: '-60vw', outY: '0vh' },
  { inX: '0vw', inY: '70vh', outX: '0vw', outY: '-70vh' },
  { inX: '-60vw', inY: '0vh', outX: '60vw', outY: '0vh' },
  { inX: '0vw', inY: '-70vh', outX: '0vw', outY: '70vh' },
];

const useIsDesktop = () => {
  const [d, setD] = useState(() => typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches);
  React.useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const on = () => setD(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return d;
};

const Garment = ({ product, i, n, progress, desktop }: { product: Product; i: number; n: number; progress: MotionValue<number>; desktop: boolean }) => {
  const step = 1 / (n + 1);
  const a = i * step;
  const b = a + step;
  const lineStart = n * step + 0.04;
  const lineEnd = n * step + 0.12;
  const path = PATHS[i % PATHS.length];
  // pozycja w końcowym rzędzie
  const spread = desktop ? 14.5 : 23;
  const finalX = `${(i - (n - 1) / 2) * spread}vw`;
  const finalScale = desktop ? 0.4 : 0.27;
  const pts = [a - 0.06, a + 0.03, b - 0.05, b + 0.02, lineStart, lineEnd];

  const x = useTransform(progress, pts, [path.inX, '0vw', '0vw', path.outX, path.outX, finalX]);
  const y = useTransform(progress, pts, [path.inY, '0vh', '0vh', path.outY, '0vh', '0vh']);
  const opacity = useTransform(progress, [a - 0.06, a, b, b + 0.03, lineStart, lineStart + 0.05], [i === 0 ? 1 : 0, 1, 1, 0, 0, 1]);
  const scale = useTransform(progress, [a - 0.06, a + 0.03, lineStart, lineEnd], [0.82, 1, 1, finalScale]);
  const rotateY = useTransform(progress, [a + 0.02, b - 0.04], [0, 360]);
  const front = product.cutout ?? product.image;
  const back = product.cutoutBack ?? front;

  return (
    <motion.div style={{ x, y, opacity, scale }} className="absolute inset-0 flex items-center justify-center will-change-transform">
      <motion.div style={{ rotateY }} className="relative aspect-[743/804] h-full [transform-style:preserve-3d]">
        <img src={front} alt={product.name} draggable={false} className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_34px_38px_rgba(0,0,0,0.7)] [backface-visibility:hidden]" />
        <img src={back} alt="" draggable={false} className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_34px_38px_rgba(0,0,0,0.7)] [backface-visibility:hidden] [transform:rotateY(180deg)]" />
      </motion.div>
    </motion.div>
  );
};

export const DropStage = ({ products }: { products: Product[] }) => {
  const { lang } = useStore();
  const u = ui(lang);
  const reduce = useReducedMotion();
  const desktop = useIsDesktop();
  const available = products.filter(isAvailable);
  const items = [...ORDER.map((id) => available.find((p) => p.id === id)).filter((p): p is Product => !!p), ...available.filter((p) => !ORDER.includes(p.id))].slice(0, 4);
  const n = items.length;

  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const p = useSpring(scrollYProgress, { stiffness: 110, damping: 26, mass: 0.4 });
  const [active, setActive] = useState(0);
  useMotionValueEvent(scrollYProgress, 'change', (v) => setActive(Math.min(n, Math.max(0, Math.floor(v * (n + 1))))));

  if (reduce || n === 0) {
    return (
      <section className="bg-black px-4 py-20 text-white md:px-8">
        <div className="mx-auto max-w-[1600px]">
          <h2 className="sf-h2 mb-10">{u.availableNow}</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4">
            {items.map((it) => (
              <GalleryCard key={it.id} product={it} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const current = active < n ? items[active] : null;

  return (
    <section ref={ref} aria-label={u.availableNow} className="relative bg-black text-white" style={{ height: `${(n + 1) * 95}vh` }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* światło za produktem: jedno na rozdział, przenikają się w 600 ms */}
        {items.map((it, i) => (
          <div
            key={it.id}
            aria-hidden
            className="absolute inset-0 transition-opacity duration-[600ms] ease-out"
            style={{
              opacity: active === i ? 1 : 0,
              background: `radial-gradient(46% 52% at ${desktop ? '62%' : '50%'} ${desktop ? '50%' : '36%'}, rgba(${GLOW[it.id] ?? '216,166,58'},0.34), transparent 72%)`,
            }}
          />
        ))}
        <div aria-hidden className="absolute inset-0 transition-opacity duration-[600ms]" style={{ opacity: active === n ? 1 : 0, background: 'radial-gradient(70% 45% at 50% 46%, rgba(216,166,58,0.2), transparent 72%)' }} />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black to-transparent" />

        {/* produkty */}
        <div className="absolute inset-x-0 top-[12svh] h-[42svh] [perspective:1400px] md:left-[24%] md:top-[18svh] md:h-[62svh]">
          {items.map((it, i) => (
            <Garment key={it.id} product={it} i={i} n={n} progress={p} desktop={desktop} />
          ))}
        </div>

        {/* tekst rozdziału */}
        <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black via-black/85 to-transparent px-4 pb-10 pt-16 md:inset-y-0 md:bg-none md:pt-0 md:left-0 md:right-auto md:flex md:w-[40%] md:items-center md:px-8 md:pb-0">
          <div className="mx-auto w-full max-w-[1600px]">
            {/* bez fazy wyjścia: nowy tekst wchodzi od razu, więc nigdy nie zostaje puste miejsce */}
            <>
              <motion.div
                key={current ? current.id : 'row'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EXPO, delay: 0.12 }}
              >
                {current ? (
                  <>
                    <h2 className="sf-h2 max-w-[9ch]">{current.name}</h2>
                    <p className="mt-4 flex items-center gap-3 text-lg text-white/75 md:text-xl">
                      <span className="tabular-nums text-white">{eur(current.price, lang)}</span>
                      <span aria-hidden className="h-1 w-1 rounded-full bg-white/40" />
                      <span className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-haag-green-bright" />
                        {u.availableNow}
                      </span>
                    </p>
                    <NavLink page="product" id={current.id} className="mt-6 inline-block bg-haag-yellow px-7 py-4 text-[15px] font-bold text-black transition-colors hover:bg-white">
                      {u.cView}
                    </NavLink>
                  </>
                ) : (
                  <>
                    <h2 className="sf-h2">{u.availableNow}</h2>
                    <p className="mt-4 text-lg text-white/75 md:text-xl">{u.availableNowLead}</p>
                    <NavLink page="shop" className="mt-6 inline-block bg-haag-yellow px-7 py-4 text-[15px] font-bold text-black transition-colors hover:bg-white">
                      {u.shopDrop}
                    </NavLink>
                  </>
                )}
              </motion.div>
            </>
          </div>
        </div>

        {/* kropki postępu */}
        <ol aria-hidden className="absolute right-4 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-3 md:right-8">
          {Array.from({ length: n + 1 }, (_, i) => (
            <li key={i} className={`h-2 w-2 rounded-full transition-all duration-500 ${active === i ? 'scale-150 bg-haag-yellow' : 'bg-white/30'}`} />
          ))}
        </ol>
      </div>
    </section>
  );
};
