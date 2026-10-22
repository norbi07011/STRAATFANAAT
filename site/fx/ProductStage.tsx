import React, { useEffect, useRef } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react';
import { Spotlights } from './Spotlights';

/**
 * Interaktywny podgląd 3D: koszulka bez tła na scenie z reflektorami.
 * Przeciągnij, aby obrócić (z bezwładnością); przód i tył to dwie ściany karty 3D.
 */
export const ProductStage = ({ front, back, name, hint }: { front: string; back?: string; name: string; hint: string }) => {
  const reduce = useReducedMotion();
  const rot = useMotionValue(0);
  const smooth = useSpring(rot, { stiffness: 120, damping: 20 });
  const shadowScale = useTransform(smooth, (v) => 0.75 + 0.25 * Math.abs(Math.cos((v * Math.PI) / 180)));
  const drag = useRef<{ x: number; r: number; t: number; v: number } | null>(null);

  // krótka zapowiedź obrotu przy wejściu
  useEffect(() => {
    if (reduce) return;
    const c = animate(rot, [0, -35, 25, 0], { duration: 2.2, ease: 'easeInOut', delay: 0.6 });
    return () => c.stop();
  }, [reduce, rot]);

  return (
    <div
      className="relative flex aspect-[4/5] w-full cursor-grab touch-pan-y select-none items-center justify-center overflow-hidden bg-black [perspective:1400px] active:cursor-grabbing"
      data-cursor={hint}
      onPointerDown={(e) => {
        drag.current = { x: e.clientX, r: rot.get(), t: performance.now(), v: 0 };
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d) return;
        const now = performance.now();
        const next = d.r + (e.clientX - d.x) * 0.6;
        d.v = (next - rot.get()) / Math.max(1, now - d.t);
        d.t = now;
        rot.set(next);
      }}
      onPointerUp={() => {
        const d = drag.current;
        drag.current = null;
        if (!d) return;
        // bezwładność, a potem dociągnięcie do najbliższej strony (przód / tył)
        const projected = rot.get() + d.v * 260;
        const snap = Math.round(projected / 180) * 180;
        animate(rot, snap, { type: 'spring', stiffness: 60, damping: 16, velocity: d.v * 1000 });
      }}
      onPointerCancel={() => (drag.current = null)}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,#2a2b2e_0%,#000_70%)]" />
      <Spotlights className="opacity-80" />
      <motion.div style={{ scaleX: shadowScale }} className="absolute bottom-[12%] h-8 w-[55%] rounded-[50%] bg-black/80 blur-xl" />
      <motion.div style={{ rotateY: smooth }} className="relative w-[78%] [transform-style:preserve-3d]">
        <motion.div animate={reduce ? undefined : { y: [0, -12, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }} className="[transform-style:preserve-3d]">
          <img src={front} alt={`${name}`} draggable={false} className="w-full drop-shadow-[0_40px_40px_rgba(0,0,0,0.7)] [backface-visibility:hidden]" />
          {back && (
            <img
              src={back}
              alt=""
              draggable={false}
              className="absolute inset-0 w-full drop-shadow-[0_40px_40px_rgba(0,0,0,0.7)] [backface-visibility:hidden] [transform:rotateY(180deg)]"
            />
          )}
        </motion.div>
      </motion.div>
      <p className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 text-sm font-semibold text-white/70">↔ {hint}</p>
    </div>
  );
};
