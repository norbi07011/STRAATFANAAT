import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';

/**
 * Volumetric spotlights + particle dust.
 * Dwa stożki światła z góry (CSS, mix-blend: screen) i kurz unoszący się w ich świetle (canvas).
 */
export const Spotlights = ({ className = '' }: { className?: string }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || reduce) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0;
    let h = 0;
    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const N = window.innerWidth < 768 ? 45 : 110;
    const dust = Array.from({ length: N }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.6 + 0.3,
      vx: (Math.random() - 0.5) * 0.00012,
      vy: -Math.random() * 0.00018 - 0.00004,
      tw: Math.random() * Math.PI * 2,
    }));

    // jasność kurzu zależy od tego, czy ziarenko jest w stożku światła
    const beams = [
      { x: 0.22, spread: 0.2 },
      { x: 0.78, spread: 0.22 },
    ];
    const lightAt = (x: number, y: number) =>
      beams.reduce((acc, b) => {
        const half = b.spread * (0.25 + y);
        const d = Math.abs(x - b.x) / half;
        return Math.max(acc, d < 1 ? (1 - d) * (1 - y * 0.6) : 0);
      }, 0.08);

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);

    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || document.hidden) return;
      const dt = Math.min(50, now - last);
      last = now;
      ctx.clearRect(0, 0, w, h);
      for (const p of dust) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.tw += dt * 0.002;
        if (p.y < -0.02) {
          p.y = 1.02;
          p.x = Math.random();
        }
        if (p.x < 0) p.x = 1;
        if (p.x > 1) p.x = 0;
        const a = lightAt(p.x, p.y) * (0.55 + 0.45 * Math.sin(p.tw));
        ctx.fillStyle = `rgba(255, 236, 170, ${a})`;
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [reduce]);

  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div className="sf-beam left-[22%]" />
      <div className="sf-beam sf-beam--b left-[78%]" />
      <canvas ref={ref} className="absolute inset-0 h-full w-full" />
    </div>
  );
};
