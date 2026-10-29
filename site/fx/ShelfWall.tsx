import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { animate, AnimatePresence, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, ChevronDown, Plus, X } from 'lucide-react';
import { Product } from '../../types';
import { eur, ui } from '../../lib/i18n';
import { splitDescription } from '../../lib/product';
import { useStore } from '../store';
import { useNav } from '../nav';
import { isAvailable } from '../ProductCard';
import { flyToCart } from './flyToCart';

/**
 * Shelf wall z kamerą (jak „LAST DEPT.” z filmiku):
 * produkty bez tła na szklanych półkach na ciemnej ścianie. Najechanie zapala półkę neonem,
 * kliknięcie wjeżdża kamerą w produkt (transform całej ściany), panel zakupu pojawia się w rogach,
 * strzałki przeskakują do sąsiada z odjazdem i dojazdem kamery, Esc wraca do ściany.
 */

const CAM_EASE: [number, number, number, number] = [0.65, 0, 0.35, 1];
const wallImg = (p: Product) => `/images/wall/${p.id}.webp`;

const COLOR_NAMES: Record<string, Record<string, string>> = {
  Black: { NL: 'Zwart', EN: 'Black', PL: 'Czarny' },
  White: { NL: 'Wit', EN: 'White', PL: 'Biały' },
  Pink: { NL: 'Roze', EN: 'Pink', PL: 'Różowy' },
};

interface Layout {
  W: number; // szerokość sceny
  H: number; // wysokość ściany
  stageH: number;
  cols: number;
  colW: number;
  rowH: number;
  imgH: number;
  top: number;
  pad: number;
  mobile: boolean;
}

const useLayout = (count: number): Layout => {
  const get = (): Layout => {
    const W = window.innerWidth;
    const stageH = window.innerHeight;
    const mobile = W < 768;
    const cols = mobile ? 2 : W < 1100 ? 4 : 5;
    const pad = mobile ? 16 : Math.round(W * 0.045);
    const colW = (W - pad * 2) / cols;
    const rowH = mobile ? Math.max(250, stageH * 0.34) : Math.max(300, stageH * 0.4);
    const imgH = rowH * (mobile ? 0.6 : 0.6);
    const top = mobile ? 150 : Math.max(150, stageH * 0.2);
    const rows = Math.ceil(count / cols);
    const H = Math.max(stageH, top + rows * rowH + (mobile ? 120 : 90));
    return { W, H, stageH, cols, colW, rowH, imgH, top, pad, mobile };
  };
  const [l, setL] = useState(get);
  useEffect(() => {
    let t = 0;
    const on = () => {
      clearTimeout(t);
      t = window.setTimeout(() => setL(get()), 120);
    };
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);
  useEffect(() => setL(get()), [count]); // eslint-disable-line react-hooks/exhaustive-deps
  return l;
};

/* ---------- jedna półka z produktem ---------- */

const Shelf = ({
  product,
  x,
  y,
  L,
  active,
  dim,
  onOpen,
  lang,
  cursor,
}: {
  product: Product;
  x: number;
  y: number;
  L: Layout;
  active: boolean;
  dim: boolean;
  onOpen: () => void;
  lang: ReturnType<typeof useStore>['lang'];
  cursor: string;
}) => {
  const [hover, setHover] = useState(false);
  const lit = active || hover;
  const shelfW = L.colW * (L.mobile ? 0.86 : 0.74);
  const shelfY = L.rowH * 0.72; // linia półki w komórce
  return (
    <div className="pointer-events-none absolute" style={{ left: x, top: y, width: L.colW, height: L.rowH }}>
      {/* poświata na ścianie pod półką */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 transition-opacity duration-500"
        style={{
          top: shelfY - 10,
          width: shelfW * 1.25,
          height: L.rowH * 0.42,
          opacity: lit ? 1 : 0,
          background: 'radial-gradient(ellipse 50% 46% at 50% 8%, rgba(255,150,30,0.55), rgba(255,110,20,0.18) 55%, transparent 75%)',
          filter: 'blur(6px)',
        }}
      />
      <button
        onClick={onOpen}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        aria-label={`${product.name}, ${eur(product.price, lang)}`}
        data-cursor={L.mobile || active ? undefined : cursor}
        className="pointer-events-auto absolute left-1/2 flex -translate-x-1/2 items-end justify-center outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-haag-yellow"
        style={{ top: shelfY - L.imgH + 3, height: L.imgH, width: L.colW * 0.9 }}
      >
        <img
          src={wallImg(product)}
          alt=""
          draggable={false}
          loading="lazy"
          decoding="async"
          className="max-h-full w-auto max-w-full object-contain object-bottom transition-[transform,filter,opacity] duration-500 ease-out-expo"
          style={{
            transform: hover && !active ? 'translateY(-4px)' : 'none',
            filter: `drop-shadow(0 ${L.imgH * 0.04}px ${L.imgH * 0.05}px rgba(0,0,0,0.55)) ${lit ? 'brightness(1.06)' : 'brightness(0.94)'}`,
            opacity: dim ? 0.55 : 1,
          }}
        />
      </button>
      {/* szklana półka */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 -translate-x-1/2" style={{ top: shelfY, width: shelfW }}>
        <div
          className="relative h-[7px] transition-[background,box-shadow] duration-500"
          style={{
            background: lit
              ? 'linear-gradient(180deg,#fff3d6 0%,#ffcc4d 35%,#ff9a1f 100%)'
              : 'linear-gradient(180deg,rgba(255,255,255,0.42) 0%,rgba(255,255,255,0.14) 40%,rgba(255,255,255,0.06) 100%)',
            boxShadow: lit
              ? '0 0 6px #ffb347, 0 0 18px rgba(255,150,40,0.9), 0 0 46px rgba(255,120,20,0.7), 0 10px 60px 8px rgba(255,110,20,0.45)'
              : '0 1px 0 rgba(255,255,255,0.25) inset, 0 12px 16px -8px rgba(0,0,0,0.75)',
            borderRadius: 2,
          }}
        >
          {/* uchwyty z pleksi */}
          <span className="absolute -bottom-[12px] left-[6%] h-[12px] w-[10px] bg-white/10" />
          <span className="absolute -bottom-[12px] right-[6%] h-[12px] w-[10px] bg-white/10" />
        </div>
      </div>
      {/* etykieta pod półką (hover) */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 right-0 text-center transition-all duration-300"
        style={{ top: shelfY + 22, opacity: hover && !active ? 1 : 0, transform: hover && !active ? 'none' : 'translateY(-4px)' }}
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/85">{product.name}</p>
        <p className="mt-0.5 text-[11px] tabular-nums text-white/55">
          {eur(product.price, lang)}
          {!isAvailable(product) ? ' · soon' : ''}
        </p>
      </div>
    </div>
  );
};

/* ---------- panel zakupu w trybie zbliżenia ---------- */

const FocusPanel = ({ product, mobile }: { product: Product; mobile: boolean }) => {
  const { lang, addToCart, openWaitlist, toast, setCartOpen } = useStore();
  const { navigate } = useNav();
  const u = ui(lang);
  const [size, setSize] = useState<string | null>(product.sizes.length === 1 ? product.sizes[0] : null);
  const [open, setOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const available = isAvailable(product);

  useEffect(() => {
    setSize(product.sizes.length === 1 ? product.sizes[0] : null);
    setAdded(false);
    setOpen(false);
  }, [product]);

  const add = () => {
    if (!size) {
      setOpen(true);
      return;
    }
    addToCart(product, size);
    const el = document.querySelector('[data-wall-focus-img]') as HTMLElement | null;
    flyToCart(wallImg(product), el?.getBoundingClientRect() ?? null);
    setAdded(true);
    toast({ title: u.added, text: `${product.name} · ${u.size} ${size}`, image: wallImg(product), action: { label: u.viewCart, run: () => setCartOpen(true) } });
    setTimeout(() => setAdded(false), 1800);
  };

  const row = 'flex items-center justify-between gap-4 border-b border-white/12 py-2.5 text-[12px]';

  return (
    <div className={`${mobile ? 'w-full' : 'w-[300px]'} text-white`}>
      <div className="flex items-start justify-between gap-4 border-b border-white/12 pb-3">
        <div className="text-[11px] uppercase tracking-[0.14em] text-white/55">
          <p>Straatfanaat / {product.category}</p>
          <p className="mt-1 text-white/80">{product.colors.map((c) => COLOR_NAMES[c]?.[lang] ?? c).join(' / ')}</p>
        </div>
        <p className="text-[22px] font-bold tabular-nums">{eur(product.price, lang)}</p>
      </div>

      {available ? (
        <>
          <div className={row}>
            <span className="text-white/55">{u.size}</span>
            <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex items-center gap-1.5 font-semibold">
              {size ?? u.chooseSize}
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
          </div>
          <AnimatePresence initial={false}>
            {open && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="flex flex-wrap gap-1.5 py-3">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setSize(s);
                        setOpen(false);
                      }}
                      aria-pressed={size === s}
                      className={`h-9 min-w-10 rounded-full px-3 text-[12px] font-bold transition ${size === s ? 'bg-white text-black' : 'bg-white/10 hover:bg-white/20'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {/* pigułka „dodaj” z okrągłym przyciskiem, jak na filmiku */}
          <button
            onClick={add}
            className="group mt-4 flex h-12 w-full items-center justify-between rounded-full bg-[#ece7df] pl-5 pr-1.5 text-[13px] font-semibold text-black transition hover:bg-white"
          >
            <span>{added ? u.added : size ? `${u.addToCart}` : u.chooseSize}</span>
            <span className={`flex h-9 w-9 items-center justify-center rounded-full transition ${added ? 'bg-haag-green text-white' : 'bg-black text-white group-hover:bg-haag-yellow group-hover:text-black'}`}>
              {added ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </span>
          </button>
        </>
      ) : (
        <>
          <div className={row}>
            <span className="text-white/55">Status</span>
            <span className="font-semibold text-haag-yellow">{u.comingSoon}</span>
          </div>
          <button
            onClick={() => openWaitlist(product)}
            className="group mt-4 flex h-12 w-full items-center justify-between rounded-full bg-[#ece7df] pl-5 pr-1.5 text-[13px] font-semibold text-black transition hover:bg-white"
          >
            <span>{u.notifyMe}</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white group-hover:bg-haag-yellow group-hover:text-black">
              <Plus className="h-4 w-4" />
            </span>
          </button>
        </>
      )}
      <div className="mt-3 flex items-center justify-between text-[11px] text-white/50">
        <span>{u.fact2}</span>
        <button onClick={() => navigate('product', product.id)} className="font-semibold text-white/80 underline underline-offset-2 hover:text-haag-yellow">
          {u.viewProduct}
        </button>
      </div>
    </div>
  );
};

/* ---------- ściana ---------- */

export const ShelfWall = ({ products, extra }: { products: Product[]; extra?: React.ReactNode }) => {
  const { lang } = useStore();
  const { lenis } = useNav();
  const u = ui(lang);
  const reduce = useReducedMotion();
  const L = useLayout(products.length);
  const sectionRef = useRef<HTMLElement>(null);
  const [focus, setFocus] = useState<number | null>(null);
  const [settled, setSettled] = useState(false); // panel pokazuje się po dojeździe kamery
  const busy = useRef(false);

  const camX = useMotionValue(0);
  const camY = useMotionValue(0);
  const camS = useMotionValue(1);
  const transform = useTransform([camX, camY, camS], ([x, y, s]) => `translate3d(${x}px, ${y}px, 0) scale(${s})`);

  // pozycje komórek
  const cells = useMemo(
    () =>
      products.map((_, i) => {
        const col = i % L.cols;
        const row = Math.floor(i / L.cols);
        return { x: L.pad + col * L.colW, y: L.top + row * L.rowH };
      }),
    [products, L]
  );

  // przewijanie ściany w trybie przeglądania (sticky scena)
  const travel = Math.max(0, L.H - L.stageH);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
  const browseY = () => -scrollYProgress.get() * travel;
  const topUiOpacity = useTransform(scrollYProgress, [0, travel > 0 ? Math.min(0.12, 160 / travel) : 1], [1, 0]);
  useMotionValueEvent(scrollYProgress, 'change', () => {
    if (focus === null && !busy.current) camY.set(browseY());
  });
  useLayoutEffect(() => {
    if (focus === null && !busy.current) {
      camX.set(0);
      camS.set(1);
      camY.set(browseY());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [L]);

  // gdzie ma stanąć kamera dla produktu i
  const target = useCallback(
    (i: number) => {
      const c = cells[i];
      const cx = c.x + L.colW / 2;
      const cy = c.y + L.rowH * 0.72 - L.imgH / 2 + 3; // środek zdjęcia nad półką
      const s = L.mobile ? (L.stageH * 0.4) / L.imgH : (L.stageH * 0.6) / L.imgH;
      const tx = L.mobile ? L.W * 0.5 : L.W * 0.42;
      const ty = L.mobile ? L.stageH * 0.36 : L.stageH * 0.56;
      return { x: tx - s * cx, y: ty - s * cy, s };
    },
    [cells, L]
  );

  const fly = useCallback(
    async (to: { x: number; y: number; s: number }, via?: { x: number; y: number; s: number }) => {
      const dur = reduce ? 0 : via ? 1.15 : 0.95;
      const opts = (k: 'x' | 'y' | 's') => ({
        duration: dur,
        ease: CAM_EASE,
        ...(via ? { times: [0, 0.45, 1] } : {}),
      });
      const kf = (mv: typeof camX, k: 'x' | 'y' | 's') => (via ? [mv.get(), via[k], to[k]] : to[k]);
      await Promise.all([
        animate(camX, kf(camX, 'x') as any, opts('x')),
        animate(camY, kf(camY, 'y') as any, opts('y')),
        animate(camS, kf(camS, 's') as any, opts('s')),
      ]);
    },
    [camX, camY, camS, reduce]
  );

  const open = useCallback(
    async (i: number) => {
      if (busy.current) return;
      busy.current = true;
      lenis.current?.stop();
      const prev = focus;
      setSettled(false);
      setFocus(i);
      if (prev === null) {
        await fly(target(i));
      } else {
        // odjazd do pół drogi i dojazd do sąsiada (jak na filmiku 11.5s → 11.7s)
        const a = target(prev);
        const b = target(i);
        const mid = Math.min(a.s, b.s) * 0.55;
        const c1 = cells[prev];
        const c2 = cells[i];
        const mcx = (c1.x + c2.x) / 2 + L.colW / 2;
        const mcy = (c1.y + c2.y) / 2 + L.rowH * 0.5;
        const tx = L.mobile ? L.W * 0.5 : L.W * 0.5;
        const ty = L.stageH * 0.5;
        await fly(b, { x: tx - mid * mcx, y: ty - mid * mcy, s: mid });
      }
      setSettled(true);
      busy.current = false;
    },
    [cells, focus, fly, lenis, target, L]
  );

  const close = useCallback(async () => {
    if (busy.current || focus === null) return;
    busy.current = true;
    setSettled(false);
    await fly({ x: 0, y: browseY(), s: 1 });
    setFocus(null);
    lenis.current?.start();
    busy.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus, fly, lenis]);

  const step = useCallback((d: number) => focus !== null && open((focus + d + products.length) % products.length), [focus, open, products.length]);

  useEffect(() => {
    if (focus === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [focus, close, step]);

  // po wyjściu ze strony odblokuj scroll
  useEffect(() => () => lenis.current?.start(), [lenis]);

  const fp = focus !== null ? products[focus] : null;
  const lead = fp ? splitDescription(fp, lang).lead : '';

  return (
    <section ref={sectionRef} className="relative bg-[#24201f]" style={{ height: L.stageH + travel }} aria-label={u.wallTitle}>
      <div className="sticky top-0 overflow-hidden" style={{ height: L.stageH }}>
        {/* ściana (transformowana przez kamerę) */}
        <motion.div
          className="absolute left-0 top-0 origin-top-left will-change-transform"
          style={{ width: L.W, height: L.H, transform }}
          onClick={(e) => {
            if (focus !== null && e.target === e.currentTarget) close();
          }}
        >
          {/* tekstura i światło ściany, większe niż ściana, żeby przy zbliżeniu nie było krawędzi */}
          <div
            aria-hidden
            className="pointer-events-none absolute"
            style={{
              left: -L.W * 0.5,
              top: -L.stageH * 0.5,
              width: L.W * 2,
              height: L.H + L.stageH,
              background: `radial-gradient(ellipse 30% 26% at 30% 22%, rgba(255,214,226,0.20), transparent 70%), radial-gradient(ellipse 60% 50% at 50% 60%, rgba(70,62,60,0.55), transparent 80%), #24201f`,
            }}
          />
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.22] mix-blend-overlay [background-image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22220%22 height=%22220%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.75%22 numOctaves=%223%22 stitchTiles=%22stitch%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>')]" />
          {products.map((p, i) => (
            <Shelf
              key={p.id}
              product={p}
              x={cells[i].x}
              y={cells[i].y}
              L={L}
              lang={lang}
              cursor={u.cView}
              active={focus === i}
              dim={focus !== null && focus !== i}
              onOpen={() => (focus === i ? undefined : open(i))}
            />
          ))}
        </motion.div>

        {/* winieta w zbliżeniu */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-opacity duration-700"
          style={{ opacity: focus !== null ? 1 : 0, background: 'radial-gradient(ellipse 70% 70% at 42% 55%, transparent 40%, rgba(0,0,0,0.55) 100%)' }}
        />

        {/* przyciemnienie pod panelem (prawa góra) i pod paskiem na dole */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-opacity duration-500"
          style={{
            opacity: focus !== null && settled ? 1 : 0,
            background: L.mobile
              ? 'linear-gradient(0deg, rgba(20,17,16,0.9) 0%, transparent 45%)'
              : 'radial-gradient(ellipse 34% 42% at 100% 12%, rgba(20,17,16,0.92) 30%, transparent 100%)',
          }}
        />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#1d1918] to-transparent" />

        {/* zdjęcie do fly-to-cart (niewidoczny punkt odniesienia) */}
        {fp && (
          <span
            data-wall-focus-img
            aria-hidden
            className="pointer-events-none absolute"
            style={
              L.mobile
                ? { left: L.W * 0.5 - 90, top: L.stageH * 0.36 - 110, width: 180, height: 220 }
                : { left: L.W * 0.42 - 160, top: L.stageH * 0.56 - 200, width: 320, height: 400 }
            }
          />
        )}

        {/* UI przeglądania */}
        <AnimatePresence>
          {focus === null && (
            <motion.div key="browse" className="pointer-events-none absolute inset-0 text-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.2 } }}>
              <motion.div className="absolute" style={{ left: L.pad, top: L.mobile ? 84 : 104, opacity: topUiOpacity, maxWidth: L.mobile ? '52%' : 420 }}>
                <p className="text-[11px] uppercase tracking-[0.16em] text-white/50">{u.wallEyebrow}</p>
                <p className="mt-2 text-[15px] leading-snug text-white/85">{u.tagline}</p>
              </motion.div>
              {extra && (
                <motion.div className="pointer-events-auto absolute" style={{ right: L.pad, top: L.mobile ? 80 : 100, opacity: topUiOpacity }}>
                  {extra}
                </motion.div>
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-4 pb-4 text-[11px] text-white/45 md:px-[4.5vw]">
                <span>© STRAATFANAAT</span>
                <span className="hidden md:block">{u.wallHint}</span>
                <span className="tabular-nums">{u.items(products.length)}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* UI zbliżenia */}
        <AnimatePresence>
          {fp && settled && (
            <motion.div key="focus-ui" className="pointer-events-none absolute inset-0 text-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.18 } }}>
              {/* nazwa, lewa góra */}
              <motion.div
                key={fp.id}
                className="pointer-events-auto absolute max-w-[min(520px,60vw)]"
                style={{ left: L.pad, top: L.mobile ? 78 : 100 }}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="text-[11px] uppercase tracking-[0.16em] text-white/50">
                  Straatfanaat — {String(focus! + 1).padStart(2, '0')} / {String(products.length).padStart(2, '0')}
                </p>
                <h2 className="font-banner mt-2 text-[40px] leading-[0.86] md:text-[64px]">{fp.name}</h2>
                {!L.mobile && <p className="mt-3 max-w-[380px] text-[13px] leading-relaxed text-white/70">{lead}</p>}
              </motion.div>

              {/* panel, prawa góra (desktop) / dół (telefon) */}
              <motion.div
                className="pointer-events-auto absolute"
                style={L.mobile ? { left: 16, right: 16, bottom: 16 } : { right: L.pad, top: 100 }}
                initial={{ opacity: 0, y: L.mobile ? 30 : -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
              >
                <div className={L.mobile ? 'rounded-2xl bg-black/70 p-4 backdrop-blur-md' : ''}>
                  <FocusPanel product={fp} mobile={L.mobile} />
                </div>
              </motion.div>

              {/* nawigacja */}
              <div className={`pointer-events-auto absolute flex items-center gap-2 ${L.mobile ? 'right-4 top-[78px]' : 'bottom-6'}`} style={L.mobile ? undefined : { left: L.pad }}>
                <button onClick={close} className="flex h-10 items-center gap-2 rounded-full bg-white/10 px-4 text-[12px] font-semibold backdrop-blur hover:bg-white/20" aria-label={u.backToWall}>
                  <X className="h-4 w-4" />
                  <span className="hidden md:inline">{u.backToWall}</span>
                </button>
                <button onClick={() => step(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur hover:bg-haag-yellow hover:text-black" aria-label={u.prev}>
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button onClick={() => step(1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur hover:bg-haag-yellow hover:text-black" aria-label={u.next}>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              {!L.mobile && <p className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[11px] text-white/45">{u.wallKeys}</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
