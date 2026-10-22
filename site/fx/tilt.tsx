import React, { useRef } from 'react';
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react';

const canHover = () => typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ---------- 3D tilt card with glare ---------- */

export const Tilt = ({ children, className = '', max = 10 }: { children: React.ReactNode; className?: string; max?: number }) => {
  const reduce = useReducedMotion();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const sx = useSpring(px, { stiffness: 220, damping: 22 });
  const sy = useSpring(py, { stiffness: 220, damping: 22 });
  const rotateY = useTransform(sx, [0, 1], [-max, max]);
  const rotateX = useTransform(sy, [0, 1], [max, -max]);
  const gx = useTransform(sx, (v) => `${v * 100}%`);
  const gy = useTransform(sy, (v) => `${v * 100}%`);
  const glare = useMotionTemplate`radial-gradient(circle at ${gx} ${gy}, rgba(255,255,255,0.35), rgba(255,255,255,0) 55%)`;
  const glareOpacity = useMotionValue(0);
  const go = useSpring(glareOpacity, { stiffness: 200, damping: 30 });
  const enabled = !reduce && canHover();

  if (!enabled) return <div className={className}>{children}</div>;

  return (
    <div className={`[perspective:900px] ${className}`}>
      <motion.div
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="relative will-change-transform"
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          px.set((e.clientX - r.left) / r.width);
          py.set((e.clientY - r.top) / r.height);
          glareOpacity.set(1);
        }}
        onPointerLeave={() => {
          px.set(0.5);
          py.set(0.5);
          glareOpacity.set(0);
        }}
      >
        {children}
        <motion.div aria-hidden style={{ backgroundImage: glare, opacity: go }} className="pointer-events-none absolute inset-0 z-10 mix-blend-overlay" />
      </motion.div>
    </div>
  );
};

/* ---------- Magnetic button ---------- */

export const Magnetic = ({ children, strength = 0.35, className = '' }: { children: React.ReactNode; strength?: number; className?: string }) => {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 18, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 260, damping: 18, mass: 0.6 });
  const ref = useRef<HTMLDivElement>(null);
  if (reduce || !canHover()) return <div className={`inline-flex ${className}`}>{children}</div>;
  return (
    <motion.div
      ref={ref}
      style={{ x: sx, y: sy }}
      className={`inline-flex ${className}`}
      onPointerMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
};

/* ---------- Mouse parallax: wartości -1..1 dla całej sceny ---------- */

export const useMouseParallax = () => {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 20 });
  const sy = useSpring(my, { stiffness: 60, damping: 20 });
  const bind = {
    onPointerMove: (e: React.PointerEvent) => {
      if (reduce || e.pointerType !== 'mouse') return;
      const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
      mx.set(((e.clientX - r.left) / r.width) * 2 - 1);
      my.set(((e.clientY - r.top) / r.height) * 2 - 1);
    },
    onPointerLeave: () => {
      mx.set(0);
      my.set(0);
    },
  };
  return { x: sx, y: sy, bind };
};
