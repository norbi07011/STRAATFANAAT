import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { animate, AnimatePresence, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, ChevronDown, Plus, RotateCw, X } from 'lucide-react';
import { Product } from '../../types';
import { eur, ui } from '../../lib/i18n';
import { splitDescription } from '../../lib/product';
import { wallSides } from '../../lib/wall';
import { useStore } from '../store';
import { useNav } from '../nav';
import { isAvailable } from '../ProductCard';
import { flyToCart } from './flyToCart';

/**
 * Shelf wall z kamerą:
 * – ściana z półkami, wszystkie koszulki na tym samym kroju (przód), neon pod półką po najechaniu,
 * – kliknięcie: kamera wjeżdża w produkt (transform całej ściany),
 * – po dojeździe kamery ostra karta 3D zastępuje zdjęcie na ścianie: klik lub przeciągnięcie obraca przód ↔ tył,
 * – strzałki/klawiatura: przejazd do sąsiada, Esc wraca do ściany.
 */

const CAM_EASE: [number, number, number, number] = [0.65, 0, 0.35, 1];

const COLOR_NAMES: Record<string, Record<string, string>> = {
  Black: { NL: 'Zwart', EN: 'Black', PL: 'Czarny' },
  White: { NL: 'Wit', EN: 'White', PL: 'Biały' },
  Pink: { NL: 'Roze', EN: 'Pink', PL: 'Różowy' },
};

interface Layout {
  W: number;
  H: number;
  stageH: number;
  cols: number;
  colW: number;
  rowH: number;
  imgH: number;
  imgW: number;
  shelfY: number;
  top: number;
  pad: number;
  mobile: boolean;
}

const computeLayout = (count: number): Layout => {
  const W = window.innerWidth;
  const stageH = window.innerHeight;
  const mobile = W < 768;
  const cols = mobile ? 2 : W < 1100 ? 4 : 5;
  const pad = mobile ? 16 : Math.round(W * 0.045);
  const colW = (W - pad * 2) / cols;
  const rowH = mobile ? Math.max(250, stageH * 0.32) : Math.max(300, stageH * 0.4);
  const imgH = rowH * 0.62;
  const imgW = colW * 0.86;
  const shelfY = rowH * 0.74;
  const top = mobile ? 150 : Math.max(150, stageH * 0.2);
  const rows = Math.ceil(count / cols);
  const H = Math.max(stageH, top + rows * rowH + (mobile ? 120 : 90));
  return { W, H, stageH, cols, colW, rowH, imgH, imgW, shelfY, top, pad, mobile };
};

const useLayout = (count: number) => {
  const [l, setL] = useState(() => computeLayout(count));
  useEffect(() => {
    let t = 0;
    const on = () => {
      clearTimeout(t);
      t = window.setTimeout(() => setL(computeLayout(count)), 150);
    };
    setL(computeLayout(count));
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, [count]);
  return l;
};

/* ---------- półka ---------- */

const Shelf = React.memo(function Shelf({
  product,
  x,
  y,
  L,
  active,
  hidden,
  dim,
  onOpen,
  priceLabel,
  eager,
}: {
  product: Product;
  x: number;
  y: number;
  L: Layout;
  active: boolean;
  hidden: boolean;
  dim: boolean;
  onOpen: () => void;
  priceLabel: string;
  eager: boolean;
}) {
  const [hover, setHover] = useState(false);
  const lit = active || hover;
  const shelfW = L.colW * (L.mobile ? 0.86 : 0.74);
  const src = wallSides(product.id).main;
  return (
    <div className="pointer-events-none absolute" style={{ left: x, top: y, width: L.colW, height: L.rowH }}>
      {/* miękki cień produktu na półce (zamiast drogiego filtra drop-shadow) */}
      <div
        aria-hidden
        className="absolute left-1/2 -translate-x-1/2 rounded-[50%] bg-black/55 blur-[10px]"
        style={{ top: L.shelfY - 10, width: shelfW * 0.7, height: 14 }}
      />
      {/* poświata neonu na ścianie */}
      <div
        aria-hidden
        className="absolute left-1/2 -translate-x-1/2 transition-opacity duration-300"
        style={{
          top: L.shelfY - 6,
          width: shelfW * 1.3,
          height: L.rowH * 0.45,
          opacity: lit ? 1 : 0,
          background: 'radial-gradient(ellipse 50% 44% at 50% 6%, rgba(255,150,30,0.55), rgba(255,110,20,0.16) 55%, transparent 75%)',
        }}
      />
      <button
        onClick={onOpen}
        onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(true)}
        onPointerLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        aria-label={`${product.name}, ${priceLabel}`}
        className="pointer-events-auto absolute left-1/2 flex -translate-x-1/2 items-end justify-center outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-haag-yellow"
        style={{ top: L.shelfY - L.imgH + 2, height: L.imgH, width: L.imgW, cursor: active ? 'default' : 'pointer' }}
      >
        <img
          src={src}
          alt=""
          draggable={false}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          className="h-full w-full object-contain object-bottom transition-[transform,opacity] duration-500 ease-out-expo"
          style={{
            transform: hover && !active ? 'translateY(-6px) scale(1.02)' : 'none',
            opacity: hidden ? 0 : dim ? 0.5 : 1,
          }}
        />
      </button>
      {/* szklana półka */}
      <div aria-hidden className="absolute left-1/2 -translate-x-1/2" style={{ top: L.shelfY, width: shelfW }}>
        <div className="relative h-[7px] rounded-[2px]" style={{ background: 'linear-gradient(180deg,rgba(255,255,255,0.42),rgba(255,255,255,0.12) 45%,rgba(255,255,255,0.05))', boxShadow: '0 12px 16px -8px rgba(0,0,0,0.75)' }}>
          <div
            className="absolute inset-0 rounded-[2px] transition-opacity duration-300"
            style={{
              opacity: lit ? 1 : 0,
              background: 'linear-gradient(180deg,#fff3d6 0%,#ffcc4d 35%,#ff9a1f 100%)',
              boxShadow: '0 0 6px #ffb347, 0 0 18px rgba(255,150,40,0.9), 0 0 46px rgba(255,120,20,0.7)',
            }}
          />
          <span className="absolute -bottom-[12px] left-[6%] h-[12px] w-[10px] bg-white/10" />
          <span className="absolute -bottom-[12px] right-[6%] h-[12px] w-[10px] bg-white/10" />
        </div>
      </div>
      {/* nazwa i cena pod półką */}
      <div
        aria-hidden
        className="absolute inset-x-0 text-center transition-[opacity,transform] duration-300"
        style={{ top: L.shelfY + 22, opacity: hover && !active ? 1 : 0, transform: hover && !active ? 'none' : 'translateY(-4px)' }}
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/85">{product.name}</p>
        <p className="mt-0.5 text-[11px] tabular-nums text-white/55">{priceLabel}</p>
      </div>
    </div>
  );
});

/* ---------- karta 3D w zbliżeniu: klik / przeciągnięcie = obrót przód ↔ tył ---------- */

const FlipCard = ({ product, rect, hint, onFlipChange }: { product: Product; rect: { left: number; top: number; width: number; height: number }; hint: string; onFlipChange: (back: boolean) => void }) => {
  const sides = wallSides(product.id);
  const reduce = useReducedMotion();
  const rot = useMotionValue(0);
  const rotS = useSpring(rot, { stiffness: 140, damping: 22, mass: 0.9 });
  const shadow = useTransform(rotS, (v) => 0.7 + 0.3 * Math.abs(Math.cos((v * Math.PI) / 180)));
  const drag = useRef<{ x: number; r: number; moved: boolean } | null>(null);

  useEffect(() => {
    rot.jump(0);
    rotS.jump(0);
  }, [product.id, rot, rotS]);

  useMotionValueEvent(rotS, 'change', (v) => {
    const n = (((Math.round(v / 180) % 2) + 2) % 2) === 1;
    onFlipChange(n);
  });

  const to = (deg: number) => rot.set(deg);
  const flip = () => sides.canFlip && to(Math.round(rot.get() / 180) * 180 + 180);

  // udostępnij przyciskowi „Obróć” w panelu
  useEffect(() => {
    const on = () => flip();
    window.addEventListener('sf:wall-flip', on);
    return () => window.removeEventListener('sf:wall-flip', on);
  });

  return (
    <motion.div
      className="absolute select-none [perspective:1600px]"
      style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height, touchAction: 'none', cursor: sides.canFlip ? 'grab' : 'default' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onPointerDown={(e) => {
        if (!sides.canFlip) return;
        drag.current = { x: e.clientX, r: rot.get(), moved: false };
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d) return;
        const dx = e.clientX - d.x;
        if (Math.abs(dx) > 4) d.moved = true;
        if (d.moved) rot.set(d.r + dx * 0.55);
      }}
      onPointerUp={() => {
        const d = drag.current;
        drag.current = null;
        if (!d) return;
        if (!d.moved) flip();
        else to(Math.round(rot.get() / 180) * 180);
      }}
      onPointerCancel={() => (drag.current = null)}
      data-wall-focus-img
      role={sides.canFlip ? 'button' : undefined}
      aria-label={sides.canFlip ? hint : undefined}
      tabIndex={sides.canFlip ? 0 : -1}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          flip();
        }
      }}
    >
      <motion.div style={{ scaleX: shadow }} className="absolute bottom-[-2%] left-[15%] h-[6%] w-[70%] rounded-[50%] bg-black/60 blur-xl" />
      <motion.div className="relative h-full w-full [transform-style:preserve-3d]" style={{ rotateY: reduce ? rot : rotS }}>
        <img
          src={sides.main}
          alt={product.name}
          draggable={false}
          className="absolute inset-0 h-full w-full object-contain object-bottom [backface-visibility:hidden]"
        />
        {sides.canFlip && (
          <img
            src={sides.back!}
            alt=""
            draggable={false}
            className="absolute inset-0 h-full w-full object-contain object-bottom [backface-visibility:hidden] [transform:rotateY(180deg)]"
          />
        )}
      </motion.div>
    </motion.div>
  );
};

/* ---------- panel zakupu ---------- */

const FocusPanel = ({ product, mobile, isBack }: { product: Product; mobile: boolean; isBack: boolean }) => {
  const { lang, addToCart, openWaitlist, toast, setCartOpen } = useStore();
  const { navigate } = useNav();
  const u = ui(lang);
  const [size, setSize] = useState<string | null>(product.sizes.length === 1 ? product.sizes[0] : null);
  const [open, setOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const available = isAvailable(product);
  const sides = wallSides(product.id);

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
    flyToCart(sides.main, el?.getBoundingClientRect() ?? null);
    setAdded(true);
    toast({ title: u.added, text: `${product.name} · ${u.size} ${size}`, image: sides.main, action: { label: u.viewCart, run: () => setCartOpen(true) } });
    setTimeout(() => setAdded(false), 1800);
  };

  const row = 'flex items-center justify-between gap-4 border-b border-white/12 py-2.5 text-[12px]';
  const pill = 'group mt-4 flex h-12 w-full items-center justify-between rounded-full bg-[#ece7df] pl-5 pr-1.5 text-[13px] font-semibold text-black transition hover:bg-white';

  return (
    <div className={`${mobile ? 'w-full' : 'w-[300px]'} text-white`}>
      <div className="flex items-start justify-between gap-4 border-b border-white/12 pb-3">
        <div className="text-[11px] uppercase tracking-[0.14em] text-white/55">
          <p>Straatfanaat / {product.category}</p>
          <p className="mt-1 text-white/80">{product.colors.map((c) => COLOR_NAMES[c]?.[lang] ?? c).join(' / ')}</p>
        </div>
        <p className="text-[22px] font-bold tabular-nums">{eur(product.price, lang)}</p>
      </div>

      {sides.canFlip && (
        <div className={row}>
          <span className="text-white/55">{u.sideLabel}</span>
          <button onClick={() => window.dispatchEvent(new Event('sf:wall-flip'))} className="flex items-center gap-1.5 font-semibold hover:text-haag-yellow">
            {isBack ? u.back : u.front}
            <RotateCw className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

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
          <button onClick={add} className={pill}>
            <span>{added ? u.added : size ? u.addToCart : u.chooseSize}</span>
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
          <button onClick={() => openWaitlist(product)} className={pill}>
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
  const [settled, setSettled] = useState(false);
  const [moving, setMoving] = useState(false);
  const [isBack, setIsBack] = useState(false);
  const busy = useRef(false);
  const focusRef = useRef<number | null>(null);
  focusRef.current = focus;

  const camX = useMotionValue(0);
  const camY = useMotionValue(0);
  const camS = useMotionValue(1);
  const transform = useTransform([camX, camY, camS], ([x, y, s]) => `translate3d(${x}px, ${y}px, 0) scale(${s})`);

  const cells = useMemo(
    () =>
      products.map((_, i) => ({
        x: L.pad + (i % L.cols) * L.colW,
        y: L.top + Math.floor(i / L.cols) * L.rowH,
      })),
    [products, L]
  );

  const travel = Math.max(0, L.H - L.stageH);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
  const browseY = useCallback(() => -scrollYProgress.get() * travel, [scrollYProgress, travel]);
  const topUiOpacity = useTransform(scrollYProgress, [0, travel > 0 ? Math.min(0.12, 160 / travel) : 1], [1, 0]);
  useMotionValueEvent(scrollYProgress, 'change', () => {
    if (focusRef.current === null && !busy.current) camY.set(browseY());
  });
  useLayoutEffect(() => {
    if (focusRef.current === null && !busy.current) {
      camX.set(0);
      camS.set(1);
      camY.set(browseY());
    }
  }, [L, browseY, camX, camY, camS]);

  // pole zdjęcia produktu i na ścianie (współrzędne ściany)
  const imgBox = useCallback(
    (i: number) => {
      const c = cells[i];
      return { x: c.x + (L.colW - L.imgW) / 2, y: c.y + L.shelfY - L.imgH + 2, w: L.imgW, h: L.imgH };
    },
    [cells, L]
  );

  const target = useCallback(
    (i: number) => {
      const b = imgBox(i);
      const s = L.mobile ? (L.stageH * 0.42) / L.imgH : (L.stageH * 0.64) / L.imgH;
      const cx = b.x + b.w / 2;
      const cy = b.y + b.h / 2;
      const tx = L.mobile ? L.W * 0.5 : L.W * 0.44;
      const ty = L.mobile ? L.stageH * 0.38 : L.stageH * 0.55;
      return { x: tx - s * cx, y: ty - s * cy, s };
    },
    [imgBox, L]
  );

  // pole karty 3D na ekranie = pole zdjęcia po transformacji kamery
  const focusRect = useMemo(() => {
    if (focus === null) return null;
    const b = imgBox(focus);
    const t = target(focus);
    return { left: t.x + b.x * t.s, top: t.y + b.y * t.s, width: b.w * t.s, height: b.h * t.s };
  }, [focus, imgBox, target]);

  const fly = useCallback(
    async (to: { x: number; y: number; s: number }, via?: { x: number; y: number; s: number }) => {
      setMoving(true);
      const duration = reduce ? 0 : via ? 1.1 : 0.9;
      const run = (mv: typeof camX, k: 'x' | 'y' | 's') =>
        animate(mv, (via ? [mv.get(), via[k], to[k]] : to[k]) as any, { duration, ease: CAM_EASE, ...(via ? { times: [0, 0.45, 1] } : {}) });
      await Promise.all([run(camX, 'x'), run(camY, 'y'), run(camS, 's')]);
      setMoving(false);
    },
    [camX, camY, camS, reduce]
  );

  const open = useCallback(
    async (i: number) => {
      if (busy.current) return;
      busy.current = true;
      lenis.current?.stop();
      const prev = focusRef.current;
      setSettled(false);
      setIsBack(false);
      setFocus(i);
      if (prev === null) {
        await fly(target(i));
      } else {
        const a = target(prev);
        const b = target(i);
        const mid = Math.min(a.s, b.s) * 0.55;
        const c1 = cells[prev];
        const c2 = cells[i];
        const mcx = (c1.x + c2.x) / 2 + L.colW / 2;
        const mcy = (c1.y + c2.y) / 2 + L.rowH * 0.5;
        await fly(b, { x: L.W * 0.5 - mid * mcx, y: L.stageH * 0.5 - mid * mcy, s: mid });
      }
      setSettled(true);
      busy.current = false;
    },
    [cells, fly, lenis, target, L]
  );

  const close = useCallback(async () => {
    if (busy.current || focusRef.current === null) return;
    busy.current = true;
    setSettled(false);
    await fly({ x: 0, y: browseY(), s: 1 });
    setFocus(null);
    lenis.current?.start();
    busy.current = false;
  }, [fly, lenis, browseY]);

  const step = useCallback(
    (d: number) => {
      const f = focusRef.current;
      if (f !== null) open((f + d + products.length) % products.length);
    },
    [open, products.length]
  );

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

  useEffect(() => () => lenis.current?.start(), [lenis]);

  const fp = focus !== null ? products[focus] : null;
  const lead = fp ? splitDescription(fp, lang).lead : '';
  const canFlip = fp ? wallSides(fp.id).canFlip : false;

  return (
    <section ref={sectionRef} className="relative bg-[#24201f]" style={{ height: L.stageH + travel }} aria-label={u.wallTitle}>
      <div className="sticky top-0 overflow-hidden" style={{ height: L.stageH }}>
        {/* ściana: will-change tylko w ruchu, po zatrzymaniu przeglądarka renderuje ją ostro w nowej skali */}
        <motion.div
          className="absolute left-0 top-0 origin-top-left"
          style={{ width: L.W, height: L.H, transform, willChange: moving ? 'transform' : 'auto' }}
          onClick={(e) => {
            if (focusRef.current !== null && e.target === e.currentTarget) close();
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute"
            style={{
              left: -L.W * 0.5,
              top: -L.stageH * 0.5,
              width: L.W * 2,
              height: L.H + L.stageH,
              background: `radial-gradient(ellipse 30% 26% at 30% 22%, rgba(255,214,226,0.18), transparent 70%), radial-gradient(ellipse 60% 50% at 50% 60%, rgba(70,62,60,0.5), transparent 80%), #24201f`,
            }}
          />
          {products.map((p, i) => (
            <Shelf
              key={p.id}
              product={p}
              x={cells[i].x}
              y={cells[i].y}
              L={L}
              priceLabel={`${eur(p.price, lang)}${isAvailable(p) ? '' : ` · ${u.comingSoon}`}`}
              eager={i < L.cols * 2}
              active={focus === i}
              hidden={focus === i && settled}
              dim={focus !== null && focus !== i}
              onOpen={() => {
                if (focusRef.current !== i) open(i);
              }}
            />
          ))}
        </motion.div>

        {/* winieta w zbliżeniu */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-opacity duration-700"
          style={{ opacity: focus !== null ? 1 : 0, background: 'radial-gradient(ellipse 70% 70% at 44% 55%, transparent 40%, rgba(0,0,0,0.5) 100%)' }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-opacity duration-500"
          style={{
            opacity: focus !== null && settled ? 1 : 0,
            background: L.mobile
              ? 'linear-gradient(0deg, rgba(20,17,16,0.92) 0%, transparent 45%)'
              : 'radial-gradient(ellipse 34% 44% at 100% 12%, rgba(20,17,16,0.92) 30%, transparent 100%)',
          }}
        />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#1d1918] to-transparent" />

        {/* ostra karta 3D na miejscu zdjęcia */}
        <AnimatePresence>
          {fp && settled && focusRect && <FlipCard key={fp.id} product={fp} rect={focusRect} hint={u.flipHint} onFlipChange={setIsBack} />}
        </AnimatePresence>

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
            <motion.div key="focus-ui" className="pointer-events-none absolute inset-0 text-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.15 } }}>
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
                {!L.mobile && <p className="mt-3 max-w-[360px] text-[13px] leading-relaxed text-white/70">{lead}</p>}
              </motion.div>

              <motion.div
                className="pointer-events-auto absolute"
                style={L.mobile ? { left: 16, right: 16, bottom: 16 } : { right: L.pad, top: 100 }}
                initial={{ opacity: 0, y: L.mobile ? 30 : -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
              >
                <div className={L.mobile ? 'rounded-2xl bg-black/70 p-4 backdrop-blur-md' : ''}>
                  <FocusPanel product={fp} mobile={L.mobile} isBack={isBack} />
                </div>
              </motion.div>

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
              {canFlip && focusRect && (
                <p
                  className="absolute -translate-x-1/2 text-center text-[11px] font-semibold text-white/60"
                  style={{ left: focusRect.left + focusRect.width / 2, top: Math.min(L.stageH - (L.mobile ? 260 : 60), focusRect.top + focusRect.height + 26) }}
                >
                  <RotateCw className="mr-1 inline h-3 w-3" />
                  {u.flipHint}
                </p>
              )}
              {!L.mobile && <p className="absolute bottom-8 right-[4.5vw] text-[11px] text-white/45">{u.wallKeys}</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
