import React, { useEffect, useRef, useState } from 'react';

const GLYPHS = 'ABCDEFGHIJKLMNOPRSTUVWXYZ0123456789#%&*+=/';

/**
 * Text scramble / decode: litery „przelosowują się” i układają w docelowy tekst.
 * trigger="hover" — przy najechaniu na rodzica; trigger="mount" — przy pojawieniu się.
 */
export const Scramble = ({ text, trigger = 'hover', className = '' }: { text: string; trigger?: 'hover' | 'mount'; className?: string }) => {
  const [out, setOut] = useState(text);
  const raf = useRef(0);
  const ref = useRef<HTMLSpanElement>(null);

  const run = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    cancelAnimationFrame(raf.current);
    const start = performance.now();
    const dur = 420 + text.length * 18;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const fixed = Math.floor(p * text.length);
      setOut(
        text
          .split('')
          .map((ch, i) => (i < fixed || ch === ' ' ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0]))
          .join('')
      );
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    setOut(text);
    if (trigger === 'mount') run();
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, trigger]);

  useEffect(() => {
    if (trigger !== 'hover') return;
    const host = ref.current?.closest('a, button') ?? ref.current;
    if (!host) return;
    host.addEventListener('pointerenter', run);
    return () => host.removeEventListener('pointerenter', run);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, trigger]);

  return (
    <span ref={ref} className={className} aria-label={text}>
      <span aria-hidden>{out}</span>
    </span>
  );
};
