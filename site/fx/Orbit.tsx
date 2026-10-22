import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimationFrame, useMotionValue, useReducedMotion, useScroll, useTransform, useVelocity } from 'motion/react';
import { Product } from '../../types';
import { useNav } from '../nav';
import { useMouseParallax } from './tilt';

/**
 * 3D orbit carousel (CSS 3D transforms z perspektywą):
 * produkty bez tła krążą wokół logo SF, lewitują (bob animation),
 * scena przechyla się za kursorem, a obrót przyspiesza przy scrollu i daje się przeciągać.
 */
export const Orbit = ({ products, onHover }: { products: Product[]; onHover?: (p: Product | null) => void }) => {
  const reduce = useReducedMotion();
  const { navigate } = useNav();
  const items = products.filter((p) => p.cutout);
  const n = items.length;
  const angle = useMotionValue(0);
  const ringRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const dragging = useRef<{ x: number; a: number } | null>(null);
  const moved = useRef(false);
  const hovering = useRef(false);
  const [radius, setRadius] = useState(420);

  const { scrollY } = useScroll();
  const vel = useVelocity(scrollY);
  const { x: mx, y: my, bind } = useMouseParallax();
  const tiltX = useTransform(my, [-1, 1], [-4, -18]);
  const tiltZ = useTransform(mx, [-1, 1], [-4, 4]);

  useEffect(() => {
    const on = () => setRadius(Math.min(520, Math.max(170, window.innerWidth * 0.32)));
    on();
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);

  useAnimationFrame((t, delta) => {
    if (!dragging.current && !reduce) {
      const boost = Math.min(4, Math.abs(vel.get()) / 600);
      const speed = hovering.current ? 0.004 : 0.012 * (1 + boost);
      angle.set(angle.get() + speed * delta);
    }
    const a = angle.get();
    items.forEach((_, i) => {
      const el = itemRefs.current[i];
      if (!el) return;
      const theta = a + (360 / n) * i;
      const rad = (theta * Math.PI) / 180;
      const z = Math.cos(rad); // 1 = z przodu
      const bob = reduce ? 0 : Math.sin(t / 700 + i * 1.3) * 14;
      // billboard: każdy produkt patrzy w kamerę
      el.style.transform = `rotateY(${theta}deg) translateZ(${radius}px) rotateY(${-theta}deg) translateY(${bob}px)`;
      el.style.zIndex = String(Math.round((z + 1) * 50));
      el.style.filter = `brightness(${0.45 + 0.55 * ((z + 1) / 2)}) blur(${Math.max(0, -z) * 1.5}px)`;
    });
  });

  return (
    <div
      className="relative h-[min(78vh,760px)] w-full touch-pan-y select-none [perspective:1600px]"
      {...bind}
      onPointerDown={(e) => {
        dragging.current = { x: e.clientX, a: angle.get() };
        moved.current = false;
      }}
      onPointerMove={(e) => {
        bind.onPointerMove(e);
        if (dragging.current) {
          const dx = e.clientX - dragging.current.x;
          if (Math.abs(dx) > 6) moved.current = true;
          angle.set(dragging.current.a + dx * 0.3);
        }
      }}
      onPointerLeave={() => {
        bind.onPointerLeave();
        dragging.current = null;
      }}
      onPointerUp={() => (dragging.current = null)}
      onPointerCancel={() => (dragging.current = null)}
    >
      <motion.div ref={ringRef} style={{ rotateX: tiltX, rotateZ: tiltZ, transformStyle: 'preserve-3d' }} className="absolute inset-0">
        {/* środek: logo + poświata */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ transformStyle: 'preserve-3d' }}>
          <div className="absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,210,31,0.35),rgba(11,138,68,0.18)_45%,transparent_70%)] blur-2xl" />
          <motion.img
            src="/images/cutout/logo.webp"
            alt="STRAATFANAAT"
            draggable={false}
            className="relative w-[min(34vw,300px)]"
            animate={reduce ? undefined : { rotateY: [0, 360] }}
            transition={{ duration: 18, ease: 'linear', repeat: Infinity }}
          />
        </div>
        {/* pierścień */}
        <div className="absolute left-1/2 top-1/2" style={{ transformStyle: 'preserve-3d' }}>
          <div
            aria-hidden
            className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-haag-yellow/30"
            style={{ width: radius * 2, height: radius * 2, transform: 'translate(-50%,-50%) rotateX(90deg)' }}
          />
          {items.map((p, i) => (
            <button
              key={p.id}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              className="absolute left-0 top-0 -ml-[min(11vw,95px)] -mt-[min(13vw,115px)] w-[min(22vw,190px)] outline-none [transform-style:preserve-3d] focus-visible:outline-haag-yellow"
              onClick={() => {
                if (!moved.current) navigate('product', p.id);
              }}
              onPointerEnter={() => {
                hovering.current = true;
                onHover?.(p);
              }}
              onPointerLeave={() => {
                hovering.current = false;
                onHover?.(null);
              }}
              onFocus={() => onHover?.(p)}
              aria-label={p.name}
            >
              <img src={p.cutout} alt="" draggable={false} className="w-full drop-shadow-[0_30px_30px_rgba(0,0,0,0.6)]" />
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
