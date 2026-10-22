import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimationFrame, useMotionValue, useReducedMotion } from 'motion/react';
import { Look } from '../../lib/looks';
import { img } from '../../lib/media';

/**
 * Draggable canvas gallery („ściana”): siatka zdjęć większa niż ekran, przeciągana w każdą stronę
 * z bezwładnością. Zdjęcia bliżej środka są większe i ostrzejsze (efekt soczewki).
 */
export const ExploreWall = ({ looks, onOpen, cursor }: { looks: Look[]; onOpen: (lookIndex: number) => void; cursor: string }) => {
  const reduce = useReducedMotion();
  const wrap = useRef<HTMLDivElement>(null);
  const [vw, setVw] = useState(1200);
  const [vh, setVh] = useState(800);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const moved = useRef(false);
  const tiles = useRef<(HTMLButtonElement | null)[]>([]);

  const COLS = 8;
  const ROWS = 5;
  const tileW = vw < 768 ? 150 : 250;
  const tileH = tileW * 1.25;
  const gap = vw < 768 ? 14 : 28;
  const W = COLS * (tileW + gap);
  const H = ROWS * (tileH + gap) + tileH / 2;
  const cells = Array.from({ length: COLS * ROWS }, (_, i) => ({ look: looks[i % looks.length], li: i % looks.length, col: i % COLS, row: Math.floor(i / COLS) }));

  useEffect(() => {
    const on = () => {
      const r = wrap.current?.getBoundingClientRect();
      setVw(r?.width ?? window.innerWidth);
      setVh(r?.height ?? window.innerHeight);
    };
    on();
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);

  // start w środku ściany
  useEffect(() => {
    x.set(-(W - vw) / 2);
    y.set(-(H - vh) / 2);
  }, [W, H, vw, vh, x, y]);

  useAnimationFrame(() => {
    if (reduce) return;
    const ox = x.get();
    const oy = y.get();
    const cx = vw / 2;
    const cy = vh / 2;
    const maxD = Math.hypot(vw, vh) / 1.6;
    cells.forEach((c, i) => {
      const el = tiles.current[i];
      if (!el) return;
      const px = ox + c.col * (tileW + gap) + tileW / 2;
      const py = oy + c.row * (tileH + gap) + (c.col % 2 ? tileH / 2 : 0) + tileH / 2;
      const d = Math.min(1, Math.hypot(px - cx, py - cy) / maxD);
      const s = 1.08 - d * 0.38;
      el.style.transform = `scale(${s})`;
      el.style.opacity = String(1 - d * 0.55);
    });
  });

  return (
    <div ref={wrap} className={`relative h-[85svh] cursor-grab overflow-hidden active:cursor-grabbing ${vw < 768 ? 'touch-pan-y' : 'touch-none'}`} data-cursor={cursor}>
      <motion.div
        className="absolute left-0 top-0"
        style={{ x, y, width: W, height: H }}
        drag={vw < 768 ? 'x' : true}
        dragConstraints={{ left: -(W - vw), right: 0, top: -(H - vh), bottom: 0 }}
        dragElastic={0.12}
        dragTransition={{ power: 0.3, timeConstant: 320 }}
        onPointerDown={() => (moved.current = false)}
        onDragStart={() => (moved.current = true)}
      >
        {cells.map((c, i) => (
          <button
            key={i}
            ref={(el) => {
              tiles.current[i] = el;
            }}
            onClick={() => !moved.current && onOpen(c.li)}
            className="absolute overflow-hidden bg-asphalt-2 will-change-transform"
            style={{
              left: c.col * (tileW + gap),
              top: c.row * (tileH + gap) + (c.col % 2 ? tileH / 2 : 0),
              width: tileW,
              height: tileH,
            }}
            tabIndex={i < looks.length ? 0 : -1}
            aria-label={`Look ${c.li + 1}`}
          >
            <img src={img(c.look.image)} alt="" draggable={false} loading="lazy" className="pointer-events-none h-full w-full object-cover" />
          </button>
        ))}
      </motion.div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,#000_100%)]" />
    </div>
  );
};
