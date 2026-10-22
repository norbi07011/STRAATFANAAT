import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { img } from '../lib/media';
import { ui } from '../lib/i18n';
import { useStore } from './store';
import { useNav } from './nav';

/**
 * Pełnoekranowa galeria: przesuwanie palcem / strzałkami, kliknięcie powiększa,
 * a ruch myszy przesuwa powiększony fragment.
 */
export const Lightbox = ({ images, start, name, onClose }: { images: string[]; start: number; name: string; onClose: () => void }) => {
  const { lang } = useStore();
  const { lenis } = useNav();
  const u = ui(lang);
  const [[i, dir], setI] = useState<[number, number]>([start, 0]);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState('50% 50%');
  const go = (d: number) => {
    setZoom(false);
    setI(([v]) => [(v + d + images.length) % images.length, d]);
  };

  useEffect(() => {
    lenis.current?.stop();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      lenis.current?.start();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[300] flex flex-col bg-black text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label={name}
    >
      <div className="flex items-center justify-between px-4 py-3 md:px-8">
        <span className="text-sm font-semibold tabular-nums">{u.imageOf(i + 1, images.length)}</span>
        <span className="hidden text-sm text-white/60 md:block">{u.zoomHint}</span>
        <button onClick={onClose} className="flex h-11 w-11 items-center justify-center bg-haag-yellow text-black" aria-label={u.close}>
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.div
            key={i}
            custom={dir}
            className="absolute inset-0 flex items-center justify-center"
            initial={{ x: dir >= 0 ? '60%' : '-60%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: dir >= 0 ? '-60%' : '60%', opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            drag={zoom ? false : 'x'}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.4}
            onDragEnd={(_, info) => {
              if (info.offset.x < -80) go(1);
              else if (info.offset.x > 80) go(-1);
            }}
          >
            <img
              src={img(images[i], 1600)}
              alt={`${name} — ${u.imageOf(i + 1, images.length)}`}
              draggable={false}
              onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
                setZoom((z) => !z);
              }}
              onMouseMove={(e) => {
                if (!zoom) return;
                const r = e.currentTarget.getBoundingClientRect();
                setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
              }}
              className={`max-h-full max-w-full object-contain transition-transform duration-300 ${zoom ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
              style={{ transform: zoom ? 'scale(2.4)' : 'scale(1)', transformOrigin: origin }}
            />
          </motion.div>
        </AnimatePresence>
        {images.length > 1 && (
          <>
            <button onClick={() => go(-1)} className="absolute left-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center bg-white/10 backdrop-blur hover:bg-haag-yellow hover:text-black" aria-label={u.prev}>
              <ChevronLeft />
            </button>
            <button onClick={() => go(1)} className="absolute right-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center bg-white/10 backdrop-blur hover:bg-haag-yellow hover:text-black" aria-label={u.next}>
              <ChevronRight />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex justify-center gap-2 overflow-x-auto px-4 py-3">
          {images.map((src, idx) => (
            <button
              key={src + idx}
              onClick={() => setI([idx, idx > i ? 1 : -1])}
              className={`relative h-20 w-14 shrink-0 overflow-hidden transition-opacity ${idx === i ? 'opacity-100' : 'opacity-45 hover:opacity-100'}`}
              aria-label={u.imageOf(idx + 1, images.length)}
            >
              <img src={img(src)} alt="" className="h-full w-full object-cover" />
              {idx === i && <motion.span layoutId="lb-thumb" className="absolute inset-x-0 bottom-0 h-1 bg-haag-yellow" />}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
};
