import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

/**
 * Particle logo intro — przy pierwszym wejściu w sesji cząsteczki zlatują się w logo SF,
 * chwilę świecą i rozpryskują się, odsłaniając stronę. Kliknięcie pomija intro.
 */

const KEY = 'sf-intro-seen';
const seen = () => {
  try {
    return sessionStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
};
const markSeen = () => {
  try {
    sessionStorage.setItem(KEY, '1');
  } catch {
    /* ignore */
  }
};

type P = { x: number; y: number; tx: number; ty: number; sx: number; sy: number; vx: number; vy: number; c: string; d: number };

const sampleLogo = (src: string, w: number, h: number, step: number): Promise<{ x: number; y: number }[]> =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const size = Math.min(w, h) * 0.9;
      const off = document.createElement('canvas');
      off.width = Math.floor(size);
      off.height = Math.floor(size);
      const o = off.getContext('2d', { willReadFrequently: true })!;
      o.drawImage(img, 0, 0, size, size);
      const data = o.getImageData(0, 0, off.width, off.height).data;
      const pts: { x: number; y: number }[] = [];
      for (let y = 0; y < off.height; y += step) {
        for (let x = 0; x < off.width; x += step) {
          const i = (y * off.width + x) * 4;
          if (data[i] > 140 && data[i + 1] > 140) pts.push({ x: x + (w - size) / 2, y: y + (h - size) / 2 });
        }
      }
      resolve(pts);
    };
    img.onerror = () => resolve([]);
    img.src = src;
  });

export const ParticleIntro = ({ logo }: { logo: string }) => {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(() => !seen());
  const ref = useRef<HTMLCanvasElement>(null);
  const skip = useRef(false);

  useEffect(() => {
    if (!show) return;
    if (reduce) {
      markSeen();
      setShow(false);
      return;
    }
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let raf = 0;
    let cancelled = false;
    const step = w < 768 ? 4 : 5;
    const colors = ['#ffd21f', '#ffd21f', '#22b35e', '#ffffff'];

    sampleLogo(logo, w, h, step).then((pts) => {
      if (cancelled) return;
      if (!pts.length) {
        markSeen();
        setShow(false);
        return;
      }
      const parts: P[] = pts.map((pt) => {
        const a = Math.random() * Math.PI * 2;
        const r = Math.max(w, h) * (0.6 + Math.random() * 0.6);
        return {
          x: 0,
          y: 0,
          tx: pt.x,
          ty: pt.y,
          sx: w / 2 + Math.cos(a) * r,
          sy: h / 2 + Math.sin(a) * r,
          vx: 0,
          vy: 0,
          c: colors[(Math.random() * colors.length) | 0],
          d: Math.random() * 0.35,
        };
      });

      const ASSEMBLE = 1500;
      const HOLD = 500;
      const BURST = 800;
      const t0 = performance.now();
      const ease = (t: number) => 1 - Math.pow(1 - t, 4);
      let burstAt = -1;

      const frame = (now: number) => {
        const t = now - t0;
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(0, 0, w, h);
        const phaseBurst = skip.current || t > ASSEMBLE + HOLD;
        if (phaseBurst && burstAt < 0) {
          burstAt = t;
          for (const p of parts) {
            const ang = Math.atan2(p.y - h / 2, p.x - w / 2) + (Math.random() - 0.5) * 0.6;
            const sp = 6 + Math.random() * 14;
            p.vx = Math.cos(ang) * sp || 0.01;
            p.vy = Math.sin(ang) * sp || 0.01;
          }
        }
        for (const p of parts) {
          if (!phaseBurst) {
            const k = ease(Math.min(1, Math.max(0, (t / ASSEMBLE - p.d) / (1 - p.d))));
            p.x = p.sx + (p.tx - p.sx) * k;
            p.y = p.sy + (p.ty - p.sy) * k;
            if (t > ASSEMBLE) {
              p.x += Math.sin(t * 0.01 + p.tx) * 0.4;
            }
          } else {
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 1.03;
            p.vy *= 1.03;
          }
          ctx.fillStyle = p.c;
          ctx.fillRect(p.x, p.y, step * 0.6, step * 0.6);
        }
        if (burstAt >= 0 && t > burstAt + BURST) {
          markSeen();
          setShow(false);
          return;
        }
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [show, reduce, logo]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[400] cursor-pointer bg-black"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          onClick={() => (skip.current = true)}
          role="presentation"
        >
          <canvas ref={ref} className="h-full w-full" aria-hidden />
          <button
            onClick={(e) => {
              e.stopPropagation();
              skip.current = true;
            }}
            className="absolute bottom-[max(24px,env(safe-area-inset-bottom))] right-6 text-sm font-semibold text-white/60 hover:text-white"
          >
            Skip
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
