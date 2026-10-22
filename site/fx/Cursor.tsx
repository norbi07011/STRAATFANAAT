import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';

/**
 * Custom cursor: żółty pierścień podążający za kursorem (mix-blend: difference).
 * Nad elementem z data-cursor="Tekst" rośnie i pokazuje etykietę (np. „Bekijk”, „Sleep”).
 * Tylko na urządzeniach z myszką; systemowy kursor zostaje (dostępność).
 */
export const Cursor = () => {
  const reduce = useReducedMotion();
  const [enabled] = useState(() => window.matchMedia('(hover: hover) and (pointer: fine)').matches);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 600, damping: 40, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 600, damping: 40, mass: 0.4 });
  const [label, setLabel] = useState<string | null>(null);
  const [hot, setHot] = useState(false);
  const [down, setDown] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled || reduce) return;
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
      const t = e.target as HTMLElement | null;
      const withLabel = t?.closest('[data-cursor]') as HTMLElement | null;
      setLabel(withLabel?.dataset.cursor || null);
      setHot(!!t?.closest('a, button, [role="button"], input, select, label'));
    };
    const leave = () => setVisible(false);
    const dn = () => setDown(true);
    const up = () => setDown(false);
    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', leave);
    window.addEventListener('pointerdown', dn);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', leave);
      window.removeEventListener('pointerdown', dn);
      window.removeEventListener('pointerup', up);
    };
  }, [enabled, reduce, x, y]);

  if (!enabled || reduce) return null;
  const size = label ? 96 : hot ? 44 : 14;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[700]"
      style={{ x: sx, y: sy, opacity: visible ? 1 : 0 }}
    >
      <motion.div
        className={`flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full ${label ? 'bg-haag-yellow' : 'border-2 border-haag-yellow mix-blend-difference'}`}
        animate={{ width: size, height: size, scale: down ? 0.8 : 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      >
        <AnimatePresence>
          {label && (
            <motion.span
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              className="text-[13px] font-bold text-black"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};
