import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { useStore } from './store';

/** Powiadomienia (np. „Toegevoegd” z przyciskiem do koszyka) — prawy dolny róg, przeciągnij w bok, aby zamknąć. */
export const Toasts = () => {
  const { toasts, dismissToast } = useStore();
  return (
    <div
      className="pointer-events-none fixed bottom-[max(96px,env(safe-area-inset-bottom))] right-4 md:bottom-4 z-[650] flex w-[min(440px,calc(100vw-32px))] flex-col gap-2"
      aria-live="polite"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={(_, info) => Math.abs(info.offset.x) > 80 && dismissToast(t.id)}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            className="pointer-events-auto flex items-center gap-3 bg-black p-3 pr-2 text-white shadow-[0_20px_50px_rgba(0,0,0,0.35)]"
          >
            {t.image && <img src={t.image} alt="" className="h-14 w-11 shrink-0 object-cover" />}
            <div className="min-w-0 flex-1">
              <p className="font-bold leading-tight">{t.title}</p>
              {t.text && <p className="truncate text-sm text-white/65">{t.text}</p>}
            </div>
            {t.action && (
              <button
                onClick={() => {
                  t.action!.run();
                  dismissToast(t.id);
                }}
                className="shrink-0 bg-haag-yellow px-3 py-2 text-sm font-bold text-black hover:bg-white"
              >
                {t.action.label}
              </button>
            )}
            <button onClick={() => dismissToast(t.id)} className="flex h-8 w-8 shrink-0 items-center justify-center text-white/60 hover:text-white" aria-label="×">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
