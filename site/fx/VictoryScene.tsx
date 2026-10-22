import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ui } from '../../lib/i18n';
import { useStore } from '../store';
import { confetti, screenShake } from './confetti';

/**
 * Success celebration („victory scene”) po złożeniu zamówienia:
 * logo SF uderza w ekran → screen shake → fala uderzeniowa → konfetti.
 * Wyzwalane zdarzeniem window 'sf:victory' (patrz Checkout.tsx).
 */
export const VictoryScene = () => {
  const { lang } = useStore();
  const u = ui(lang);
  const [order, setOrder] = useState<string | null>(null);

  useEffect(() => {
    const on = (e: Event) => {
      const detail = (e as CustomEvent<{ orderNumber?: string }>).detail;
      setOrder(detail?.orderNumber ?? '');
      setTimeout(() => {
        screenShake('hard');
        confetti(window.innerWidth * 0.25, window.innerHeight * 0.75, 120);
        confetti(window.innerWidth * 0.75, window.innerHeight * 0.75, 120);
      }, 520);
      setTimeout(() => confetti(window.innerWidth / 2, window.innerHeight * 0.6, 180, 1.4), 1100);
    };
    window.addEventListener('sf:victory', on);
    return () => window.removeEventListener('sf:victory', on);
  }, []);

  return (
    <AnimatePresence>
      {order !== null && (
        <motion.div
          className="fixed inset-0 z-[450] flex flex-col items-center justify-center overflow-hidden bg-black text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label={u.victoryTitle}
        >
          {/* pasy szalika przelatujące przez ekran */}
          <motion.div
            className="absolute left-[-20%] top-1/2 h-24 w-[140%] -translate-y-1/2 scarf-stripes-diag opacity-80"
            initial={{ x: '-100%', rotate: -8 }}
            animate={{ x: '0%', rotate: -8 }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          />
          {/* fala uderzeniowa */}
          <motion.span
            className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border-[6px] border-haag-yellow"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 9], opacity: [0, 1, 0] }}
            transition={{ delay: 0.5, duration: 0.9, ease: 'easeOut' }}
          />
          <motion.img
            src="/images/cutout/logo.webp"
            alt=""
            className="relative z-10 w-[min(46vw,280px)]"
            initial={{ scale: 4, opacity: 0, rotate: -12 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ duration: 0.5, ease: [0.7, 0, 0.84, 0] }}
          />
          <motion.h2
            className="font-banner relative z-10 mt-4 text-center text-[16vw] text-haag-yellow md:text-[9rem]"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.75, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            {u.victoryTitle}
          </motion.h2>
          <motion.div
            className="relative z-10 mt-4 flex flex-col items-center gap-6 px-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            <p className="max-w-md text-lg text-white/80">{u.victoryText}</p>
            {order && <p className="font-mono text-xl tabular-nums text-white">{order}</p>}
            <button onClick={() => setOrder(null)} className="bg-haag-yellow px-7 py-4 font-bold text-black hover:bg-white">
              {u.keepShopping}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
