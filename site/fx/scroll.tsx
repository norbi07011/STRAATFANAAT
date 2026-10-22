import React, { useEffect, useRef, useState } from 'react';
import {
  animate,
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'motion/react';

/* ---------- Scroll progress bar ---------- */

export const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-[3px] origin-left bg-haag-yellow"
    />
  );
};

/* ---------- Velocity marquee: przyspiesza i wygina się przy szybkim scrollu ---------- */

const wrap = (min: number, max: number, v: number) => {
  const r = max - min;
  return ((((v - min) % r) + r) % r) + min;
};

export const VelocityMarquee = ({
  items,
  baseVelocity = -2,
  className = '',
}: {
  items: string[];
  baseVelocity?: number;
  className?: string;
}) => {
  const reduce = useReducedMotion();
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { damping: 50, stiffness: 400 });
  const factor = useTransform(smooth, [-2500, 0, 2500], [-6, 0, 6], { clamp: false });
  const skew = useTransform(smooth, [-3000, 0, 3000], [14, 0, -14]);
  const x = useTransform(baseX, (v) => `${wrap(-25, 0, v)}%`);
  const dir = useRef(1);

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    let move = dir.current * baseVelocity * (delta / 1000);
    const f = factor.get();
    if (f < 0) dir.current = -1;
    else if (f > 0) dir.current = 1;
    move += dir.current * move * Math.abs(f);
    baseX.set(baseX.get() + move);
  });

  const row = items.map((t, i) => (
    <span key={i} className="flex items-center">
      <span className="px-5 md:px-8">{t}</span>
      <span aria-hidden className="inline-block h-3 w-3 rotate-45 bg-current md:h-4 md:w-4" />
    </span>
  ));

  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`} aria-label={items.join(', ')}>
      <motion.div style={{ x, skewX: skew }} className="flex w-max" aria-hidden>
        {[0, 1, 2, 3].map((k) => (
          <div key={k} className="flex shrink-0 items-center">
            {row}
          </div>
        ))}
      </motion.div>
    </div>
  );
};

/* ---------- Count-up on scroll ---------- */

export const CountUp = ({ to, format = (n) => String(Math.round(n)), duration = 1.6 }: { to: number; format?: (n: number) => string; duration?: number }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-15% 0px' });
  const reduce = useReducedMotion();
  const [val, setVal] = useState(reduce ? to : 0);
  useEffect(() => {
    if (!inView || reduce) return;
    const c = animate(0, to, { duration, ease: [0.16, 1, 0.3, 1], onUpdate: setVal });
    return () => c.stop();
  }, [inView, to, duration, reduce]);
  return (
    <span ref={ref} className="tabular-nums">
      {format(val)}
    </span>
  );
};

/* ---------- Rolling number: cyfry przewijają się do nowej wartości ---------- */

const Digit = ({ d }: { d: number }) => (
  <span className="relative inline-block h-[1em] w-[0.62em] overflow-hidden leading-none">
    <motion.span
      className="absolute left-0 top-0 flex flex-col"
      initial={false}
      animate={{ y: `${-d * 10}%` }}
      transition={{ type: 'spring', stiffness: 220, damping: 26 }}
    >
      {Array.from({ length: 10 }, (_, i) => (
        <span key={i} className="block h-[1em] text-center leading-none">
          {i}
        </span>
      ))}
    </motion.span>
  </span>
);

export const RollingNumber = ({ value, className = '' }: { value: string; className?: string }) => (
  <span className={`inline-flex items-end tabular-nums ${className}`} aria-label={value}>
    <span aria-hidden className="inline-flex items-end">
      {value.split('').map((ch, i) =>
        /\d/.test(ch) ? (
          <Digit key={`${value.length - i}`} d={Number(ch)} />
        ) : (
          <span key={`s${value.length - i}`} className="inline-block h-[1em] whitespace-pre leading-none">
            {ch}
          </span>
        )
      )}
    </span>
  </span>
);

/* ---------- Scroll-driven text fill / text mask reveal ---------- */

export const TextFill = ({ text, className = '' }: { text: string; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] });
  const clip = useTransform(scrollYProgress, [0.1, 0.95], reduce ? ['inset(0 0% 0 0)', 'inset(0 0% 0 0)'] : ['inset(0 100% 0 0)', 'inset(0 0% 0 0)']);
  return (
    <div ref={ref} className={`relative select-none ${className}`} aria-label={text}>
      <span aria-hidden className="block text-transparent [-webkit-text-stroke:2px_var(--color-haag-yellow)]">
        {text}
      </span>
      <motion.span aria-hidden style={{ clipPath: clip }} className="absolute inset-0 block text-haag-yellow">
        {text}
      </motion.span>
    </div>
  );
};
