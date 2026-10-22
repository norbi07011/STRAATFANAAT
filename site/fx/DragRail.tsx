import React, { useLayoutEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

/**
 * Pozioma karuzela do przeciągania z bezwładnością (myszka i palec) + pasek postępu.
 * Kliknięcia w środku nie odpalają się po przeciągnięciu.
 */
export const DragRail = ({ children, cursor, dark = false }: { children: React.ReactNode; cursor?: string; dark?: boolean }) => {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [max, setMax] = useState(0);
  const x = useMotionValue(0);
  const moved = useRef(false);
  const progress = useTransform(x, (v) => (max ? Math.min(1, Math.max(0, -v / max)) : 0));
  const sp = useSpring(progress, { stiffness: 200, damping: 30 });
  const width = useTransform(sp, (p) => `${15 + p * 85}%`);

  useLayoutEffect(() => {
    const measure = () => setMax(Math.max(0, (inner.current?.scrollWidth ?? 0) - (outer.current?.clientWidth ?? 0)));
    measure();
    const ro = new ResizeObserver(measure);
    if (inner.current) ro.observe(inner.current);
    if (outer.current) ro.observe(outer.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={outer} className="overflow-hidden" data-cursor={max > 0 ? cursor : undefined}>
      <motion.div
        ref={inner}
        className="flex w-max cursor-grab gap-4 active:cursor-grabbing md:gap-6"
        style={{ x }}
        drag={max > 0 ? 'x' : false}
        dragConstraints={{ left: -max, right: 0 }}
        dragElastic={0.08}
        dragTransition={{ power: 0.35, timeConstant: 300 }}
        onDragStart={() => (moved.current = true)}
        onClickCapture={(e) => {
          if (moved.current) {
            e.preventDefault();
            e.stopPropagation();
          }
          moved.current = false;
        }}
        onPointerDown={() => (moved.current = false)}
      >
        {children}
      </motion.div>
      {max > 0 && (
        <div className={`mt-6 h-[3px] ${dark ? 'bg-white/15' : 'bg-black/10'}`}>
          <motion.div style={{ width }} className="h-full bg-haag-yellow" />
        </div>
      )}
    </div>
  );
};
