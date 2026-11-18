import React, { useEffect, useRef } from 'react';
import { MotionValue } from 'motion/react';

/*
  Przewijanie filmu na telefonie. Telefony źle znoszą ustawianie currentTime w <video> (zacina się,
  a iPhone często w ogóle nie wczytuje filmu bez dotknięcia), więc na pionowym ekranie dotykowym
  rysujemy gotowe klatki (public/seq/<nazwa>/000.webp …) na płótnie. Komputer zostaje przy filmie.
  Klatki robi się z filmu: ffmpeg -i film.mp4 -vf "fps=12,scale=540:960" -c:v libwebp -q:v 64 -start_number 0 %03d.webp
*/

const PHONE = '(max-aspect-ratio: 4/5) and (pointer: coarse), (max-aspect-ratio: 4/5) and (max-width: 900px)';

export const useFrameMode = () => {
  const [on, setOn] = React.useState(() => typeof window !== 'undefined' && window.matchMedia(PHONE).matches);
  useEffect(() => {
    const mq = window.matchMedia(PHONE);
    const f = () => setOn(mq.matches);
    mq.addEventListener('change', f);
    return () => mq.removeEventListener('change', f);
  }, []);
  return on;
};

type Props = {
  dir: string;
  count: number;
  width: number;
  height: number;
  progress: MotionValue<number>;
  /** postęp sekcji (0–1) → miejsce w filmie (0–1) */
  map: (pr: number) => number;
  /** własny pomiar postępu na starcie, gdy wartość z useScroll bywa nieaktualna */
  measure?: () => number;
  className?: string;
  label?: string;
  onReady?: () => void;
};

export const FrameScrub = ({ dir, count, width, height, progress, map, measure, className = '', label, onReady }: Props) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = React.useState(false);

  useEffect(() => {
    const c = ref.current;
    const ctx = c?.getContext('2d', { alpha: false });
    if (!c || !ctx) return;
    let imgs: (HTMLImageElement | undefined)[] = [];
    let ok: boolean[] = [];
    let active = false;
    let alive = true;
    let raf = 0;
    let want = 0;
    let drawn = -1;
    let first = true;

    const nearest = (i: number) => {
      for (let d = 0; d < count; d++) {
        if (i - d >= 0 && ok[i - d]) return i - d;
        if (i + d < count && ok[i + d]) return i + d;
      }
      return -1;
    };
    const draw = () => {
      raf = 0;
      const i = nearest(want);
      if (i < 0 || i === drawn) return;
      ctx.drawImage(imgs[i]!, 0, 0, width, height);
      drawn = i;
      if (first) { first = false; setReady(true); onReady?.(); }
    };
    const ask = () => { if (!raf) raf = requestAnimationFrame(draw); };
    const set = (pr: number) => {
      want = Math.round(Math.min(1, Math.max(0, map(pr))) * (count - 1));
      ask();
    };

    const loadOne = (i: number) => {
      if (imgs[i]) return;
      const im = new Image();
      im.decoding = 'async';
      im.onload = () => { if (alive && imgs[i] === im) { ok[i] = true; ask(); } };
      im.src = `${dir}/${String(i).padStart(3, '0')}.webp`;
      imgs[i] = im;
    };
    const load = () => {
      if (active) return;
      active = true;
      // najpierw klatka pod palcem i co ósma (film rusza od razu), potem reszta
      loadOne(want);
      for (let i = 0; i < count; i += 8) loadOne(i);
      loadOne(count - 1);
      for (let i = 0; i < count; i++) loadOne(i);
    };
    const unload = () => {
      if (!active) return;
      active = false;
      imgs.forEach((im) => { if (im) { im.onload = null; im.src = ''; } });
      imgs = [];
      ok = [];
    };

    // wczytujemy, gdy sekcja jest w pobliżu ekranu, a zwalniamy pamięć, gdy jest daleko
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? load() : unload()), { rootMargin: '200% 0px' });
    io.observe(c);

    const sync = () => set(measure ? measure() : progress.get());
    sync();
    const off = progress.on('change', measure ? sync : set);
    const timers = [300, 1200, 3000].map((ms) => window.setTimeout(sync, ms));
    return () => {
      alive = false;
      off();
      io.disconnect();
      timers.forEach(clearTimeout);
      if (raf) cancelAnimationFrame(raf);
      unload();
    };
  }, [dir, count, width, height, progress, map, measure, onReady]);

  return (
    <canvas
      ref={ref}
      width={width}
      height={height}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={`${className} transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-0'}`}
    />
  );
};
