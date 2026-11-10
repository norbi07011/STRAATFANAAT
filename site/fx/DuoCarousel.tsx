import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { animate, AnimatePresence, motion, MotionValue, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform } from 'motion/react';
import { useStore } from '../store';
import { useNav } from '../nav';
import { ui } from '../../lib/i18n';
import { Btn } from '../ui';

/* Obrotowy pierścień 3D z lewitującymi kartami w miejscu dawnej sekcji DUO (decyzja właściciela 2026-11-10).
   Kręci się w pętli, co kilka sekund przeskakuje o jedną kartę sprężyną, da się go kręcić palcem.
   Tylko zdjęcia z nadrukiem w prawidłowej wielkości (sprawdzone w zbliżeniu). */

type Slide = { src: string; who: string; place: string; model: string };

const SLIDES: Slide[] = [
  { src: '/images/duo/j-joey-keizer-haagse-toren.webp', who: 'Joey', place: 'Haagse Toren', model: 'De Keizer' },
  { src: '/images/duo/k02-black-trench-keizer-passage.webp', who: 'Romy', place: 'De Passage', model: 'De Keizer' },
  { src: '/images/duo/d02-duo-fcdh-tyl-schilderswijk.webp', who: 'Joey & Romy', place: 'Schilderswijk', model: 'Straatfanaat' },
  { src: '/images/duo/industrial-keizer-laakhaven.webp', who: 'Joey', place: 'Laakhaven', model: 'De Keizer' },
  { src: '/images/duo/k-romy-plecy-tron.webp', who: 'Romy', place: 'Den Haag', model: 'De Keizer' },
  { src: '/images/duo/joey-elegancki-keizer-lange-voorhout.webp', who: 'Joey', place: 'Lange Voorhout', model: 'De Keizer' },
  { src: '/images/duo/j-joey-keizer-centraal.webp', who: 'Joey', place: 'Den Haag Centraal', model: 'De Keizer' },
  { src: '/images/duo/m14-plecy-tron-haga.webp', who: 'Joey', place: 'Den Haag', model: 'De Keizer' },
  { src: '/images/duo/j-joey-keizer-tramlijn.webp', who: 'Joey', place: 'Tramlijn', model: 'De Keizer' },
];

const N = SLIDES.length;
const STEP = 360 / N;
const SPRING = { type: 'spring' as const, stiffness: 55, damping: 15, mass: 1.1 };
const pad = (n: number) => String(n).padStart(2, '0');
const mod = (a: number, n: number) => ((a % n) + n) % n;

const Card = ({ s, i, rot, w, r, onPick }: { s: Slide; i: number; rot: MotionValue<number>; w: number; r: number; onPick: (i: number) => void }) => {
  // kąt karty względem widza: 0 = na wprost, ±180 = z tyłu
  const rel = useTransform(rot, (v) => {
    const a = mod(i * STEP + v + 180, 360) - 180;
    return a;
  });
  const opacity = useTransform(rel, (a) => Math.max(0, Math.cos((a * Math.PI) / 180) * 0.85 + 0.15));
  const bright = useTransform(rel, (a) => `brightness(${0.35 + 0.65 * Math.max(0, Math.cos((a * Math.PI) / 180)) ** 2})`);
  const sheen = useTransform(rel, [-STEP, 0, STEP], ['120%', '-20%', '-120%']);
  const z = useTransform(rel, (a) => Math.round(100 - Math.abs(a)));

  return (
    <motion.div
      className="absolute left-1/2 top-0 [transform-style:preserve-3d]"
      style={{ width: w, marginLeft: -w / 2, opacity, zIndex: z, transform: `rotateY(${i * STEP}deg) translateZ(${r}px)` }}
    >
      {/* lewitowanie: każda karta w swoim rytmie */}
      <motion.button
        type="button"
        onClick={() => onPick(i)}
        aria-label={`${s.who}, ${s.place}`}
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 4.2 + (i % 4) * 0.45, repeat: Infinity, ease: 'easeInOut', delay: i * 0.35 }}
        className="relative block aspect-[9/16] w-full overflow-hidden rounded-[18px] bg-asphalt shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)] ring-1 ring-white/10"
        style={{ filter: bright }}
      >
        <img src={s.src} alt={`${s.who} in ${s.model}, ${s.place}, Den Haag`} loading="lazy" decoding="async" draggable={false} className="h-full w-full object-cover" />
        <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
        {/* błysk światła przesuwający się po karcie, gdy wjeżdża na środek */}
        <motion.span
          aria-hidden
          style={{ x: sheen }}
          className="pointer-events-none absolute inset-y-0 -left-1/4 w-[150%] bg-[linear-gradient(105deg,transparent_35%,rgba(255,255,255,0.22)_48%,transparent_60%)]"
        />
        <span className="absolute inset-x-0 bottom-0 p-3 text-left text-white md:p-4">
          <span className="block text-[10px] font-bold uppercase tracking-[0.22em] text-haag-yellow">{s.who} · {s.place}</span>
          <span className="font-banner block text-2xl leading-none md:text-3xl">{s.model}</span>
        </span>
      </motion.button>
      {/* cień na „podłodze” */}
      <span aria-hidden className="mx-auto mt-6 block h-4 w-3/4 rounded-[50%] bg-black/70 blur-md" />
    </motion.div>
  );
};

export const DuoCarousel = () => {
  const { lang } = useStore();
  const { navigate } = useNav();
  const u = ui(lang);
  const reduce = useReducedMotion();
  const stage = useRef<HTMLDivElement>(null);
  const rot = useMotionValue(0);
  const [active, setActive] = useState(0);
  const [w, setW] = useState(200);
  const paused = useRef(false);
  const drag = useRef<{ x: number; start: number } | null>(null);

  useLayoutEffect(() => {
    const measure = () => {
      const vw = window.innerWidth;
      setW(vw < 768 ? Math.round(vw * 0.5) : Math.min(300, Math.round(vw * 0.2)));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);
  const r = Math.round((w / 2 / Math.tan(Math.PI / N)) * 1.12);

  useMotionValueEvent(rot, 'change', (v) => setActive(mod(Math.round(-v / STEP), N)));

  const goTo = (target: number) => animate(rot, target, SPRING);
  const step = (dir: number) => goTo(Math.round(rot.get() / STEP) * STEP - dir * STEP);
  const pick = (i: number) => {
    const cur = Math.round(-rot.get() / STEP);
    let d = mod(i - cur, N);
    if (d > N / 2) d -= N;
    goTo(-(cur + d) * STEP);
  };

  // pętla: co 3,6 s przeskok o jedną kartę
  useEffect(() => {
    if (reduce) return;
    const t = window.setInterval(() => {
      if (!paused.current && !drag.current && document.visibilityState === 'visible') step(1);
    }, 3600);
    return () => window.clearInterval(t);
  }, [reduce]);

  const onDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, start: rot.get() };
    paused.current = true;
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    rot.set(drag.current.start + (e.clientX - drag.current.x) * (STEP / (w * 0.9)));
  };
  const onUp = () => {
    if (!drag.current) return;
    drag.current = null;
    goTo(Math.round(rot.get() / STEP) * STEP);
    window.setTimeout(() => (paused.current = false), 5000);
  };

  const ring = useTransform(rot, (v) => `translateZ(${-r}px) rotateY(${v}deg)`);
  const s = SLIDES[active];

  return (
    <section className="relative overflow-hidden bg-black py-20 text-white md:py-28">
      {/* miękkie zielono-żółte światło za pierścieniem */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_45%_at_50%_55%,rgba(0,122,61,0.35),transparent_70%),radial-gradient(30%_25%_at_50%_80%,rgba(255,210,0,0.12),transparent_70%)]" />

      <div className="relative mx-auto max-w-[1600px] px-4 text-center md:px-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-haag-yellow">Duo · 070</p>
        <h2 className="font-banner mt-3 text-[15vw] leading-[0.85] md:text-[7rem]">{u.duoTitle}</h2>
        <p className="mx-auto mt-4 max-w-lg text-base text-white/70 md:text-lg">{u.duoText}</p>
      </div>

      <div
        ref={stage}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerLeave={onUp}
        onMouseEnter={() => (paused.current = true)}
        onMouseLeave={() => (paused.current = false)}
        className="relative mx-auto mt-12 cursor-grab touch-pan-y select-none active:cursor-grabbing md:mt-16"
        style={{ perspective: 1400, height: (w * 16) / 9 + 60 }}
      >
        <motion.div className="absolute inset-0 [transform-style:preserve-3d]" style={{ transform: ring }}>
          {SLIDES.map((sl, i) => (
            <Card key={sl.src} s={sl} i={i} rot={rot} w={w} r={r} onPick={pick} />
          ))}
        </motion.div>
      </div>

      <div className="relative mx-auto mt-6 flex max-w-[1600px] flex-col items-center gap-5 px-4 md:px-8">
        <div className="flex items-center gap-6">
          <button type="button" aria-label="Vorige" onClick={() => step(-1)} className="grid h-11 w-11 place-items-center rounded-full border border-white/30 transition-colors hover:border-haag-yellow hover:text-haag-yellow">←</button>
          <div className="min-w-[9rem] text-center" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.div key={active} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35 }}>
                <span className="font-banner block text-2xl tabular-nums">{pad(active + 1)} / {pad(N)}</span>
                <span className="block text-xs uppercase tracking-[0.2em] text-white/60">{s.who} · {s.place}</span>
              </motion.div>
            </AnimatePresence>
          </div>
          <button type="button" aria-label="Volgende" onClick={() => step(1)} className="grid h-11 w-11 place-items-center rounded-full border border-white/30 transition-colors hover:border-haag-yellow hover:text-haag-yellow">→</button>
        </div>
        <Btn variant="yellow" onClick={() => navigate('lookbook')}>
          {u.viewDuo}
        </Btn>
      </div>
    </section>
  );
};
