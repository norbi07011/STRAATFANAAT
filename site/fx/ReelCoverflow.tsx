import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Play, Volume2, X } from 'lucide-react';
import { ui } from '../../lib/i18n';
import { useStore } from '../store';
import { NavLink, useNav } from '../nav';

export type Reel = { src: string; poster: string; title: string; productId: string | null };

const EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** Środkowa rolka gra bez dźwięku, boczne stoją na klatce. */
const ReelVideo = ({ reel, active }: { reel: Reel; active: boolean }) => {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (active) el.play().catch(() => {});
    else el.pause();
  }, [active]);
  return (
    <video
      ref={ref}
      src={active ? reel.src : undefined}
      poster={reel.poster}
      muted
      loop
      playsInline
      preload={active ? 'auto' : 'none'}
      className="h-full w-full object-cover"
    />
  );
};

/**
 * Karuzela rolek 3D (jak coverflow w lookbooku): przeciąganie, strzałki, klawiatura.
 * Klik w środkową rolkę otwiera ją na pełnym ekranie z dźwiękiem.
 */
export const ReelCoverflow = ({ reels }: { reels: Reel[] }) => {
  const { lang } = useStore();
  const { lenis } = useNav();
  const u = ui(lang);
  const [index, setIndex] = useState(Math.min(2, reels.length - 1));
  const [open, setOpen] = useState<number | null>(null);
  const [step, setStep] = useState(240);

  useEffect(() => {
    const on = () => setStep(Math.min(300, Math.max(150, window.innerWidth * 0.22)));
    on();
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);

  useEffect(() => {
    if (open !== null) lenis.current?.stop();
    else lenis.current?.start();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, lenis]);

  const go = (d: number) => setIndex((i) => Math.max(0, Math.min(reels.length - 1, i + d)));
  const current = reels[index];
  const W = 'clamp(190px,24vw,330px)';

  return (
    <div
      className="outline-none"
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Reels"
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(1);
        if (e.key === 'ArrowLeft') go(-1);
      }}
    >
      <motion.div
        className="relative h-[calc(clamp(190px,24vw,330px)*16/9+40px)] cursor-grab touch-pan-y [perspective:1500px] active:cursor-grabbing"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        onDragEnd={(_, info) => {
          const d = Math.round(-info.offset.x / (step * 0.45));
          if (d) go(Math.max(-3, Math.min(3, d)));
        }}
      >
        {reels.map((r, i) => {
          const off = i - index;
          const abs = Math.abs(off);
          if (abs > 4) return null;
          const active = off === 0;
          return (
            <motion.div
              key={r.src}
              className="absolute left-1/2 top-0 [transform-style:preserve-3d]"
              style={{ zIndex: 100 - abs, width: W, marginLeft: `calc(${W} / -2)` }}
              initial={false}
              animate={{
                x: active ? 0 : Math.sign(off) * (step * 0.7 + (abs - 1) * step * 0.42),
                rotateY: active ? 0 : off < 0 ? 55 : -55,
                scale: active ? 1.06 : 0.86,
                z: active ? 90 : -abs * 100,
                opacity: abs > 3 ? 0 : 1 - abs * 0.12,
              }}
              transition={{ type: 'spring', stiffness: 170, damping: 24 }}
            >
              <button
                onClick={() => (active ? setOpen(i) : setIndex(i))}
                aria-label={active ? `${u.playWithSound}: ${r.title}` : r.title}
                className="group relative block aspect-[9/16] w-full overflow-hidden bg-asphalt-2 text-left [-webkit-box-reflect:below_6px_linear-gradient(transparent_78%,rgba(0,0,0,0.3))]"
              >
                <ReelVideo reel={r} active={active} />
                <span className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-500 ${active ? 'opacity-100' : 'opacity-60'}`} />
                {!active && <span className="absolute inset-0 bg-black/35" />}
                {active && (
                  <span className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                    <span className="font-banner text-3xl leading-none text-white md:text-4xl">{r.title}</span>
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-haag-yellow text-black transition-transform duration-500 ease-out-expo group-hover:scale-110">
                      <Play className="h-5 w-5 fill-black" />
                    </span>
                  </span>
                )}
                {active && (
                  <span className="absolute left-3 top-3 flex items-center gap-1.5 bg-black/55 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur">
                    <Volume2 className="h-3.5 w-3.5" /> {u.playWithSound}
                  </span>
                )}
              </button>
            </motion.div>
          );
        })}
        <button onClick={() => go(-1)} className="absolute left-0 top-[40%] z-[200] flex h-12 w-12 -translate-y-1/2 items-center justify-center bg-white/10 text-white backdrop-blur hover:bg-haag-yellow hover:text-black" aria-label="←">
          <ChevronLeft />
        </button>
        <button onClick={() => go(1)} className="absolute right-0 top-[40%] z-[200] flex h-12 w-12 -translate-y-1/2 items-center justify-center bg-white/10 text-white backdrop-blur hover:bg-haag-yellow hover:text-black" aria-label="→">
          <ChevronRight />
        </button>
      </motion.div>

      {/* licznik + kropki */}
      <div className="mt-16 flex flex-col items-center gap-4 text-center" aria-live="polite">
        <div className="flex gap-2">
          {reels.map((r, i) => (
            <button
              key={r.src}
              onClick={() => setIndex(i)}
              aria-label={r.title}
              className={`h-[3px] transition-all duration-500 ${i === index ? 'w-10 bg-haag-yellow' : 'w-4 bg-white/25 hover:bg-white/60'}`}
            />
          ))}
        </div>
        <AnimatePresence mode="wait">
          {current?.productId && (
            <motion.div key={current.src} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
              <NavLink page="product" id={current.productId} className="font-semibold underline decoration-2 underline-offset-4 hover:text-haag-yellow">
                {u.viewProduct}
              </NavLink>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {open !== null && (
          <motion.div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
            role="dialog"
            aria-modal="true"
          >
            <button className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center bg-haag-yellow text-black" aria-label={u.close}>
              <X className="h-6 w-6" />
            </button>
            <motion.video
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: EXPO }}
              onClick={(e) => e.stopPropagation()}
              src={reels[open].src}
              poster={reels[open].poster}
              controls
              autoPlay
              playsInline
              className="max-h-[88vh] w-auto max-w-full"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
