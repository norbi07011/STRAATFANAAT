import React, { useEffect, useRef } from 'react';
import { motion, MotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import { useStore } from '../store';
import { NavLink } from '../nav';
import { Product } from '../../types';

/*
  Film produktowy przewijany scrollem (obrót kamery wokół koszulek).
  Jeden przyklejony kadr, film kodowany z każdą klatką kluczową (ffmpeg -g 1), teksty rozdziałów nad obrazem.
  Na pionowym ekranie poziomy film stoi w całości na środku, a za nim jego rozmyta kopia wypełnia tło.
*/

type Chapter = { range: [number, number]; kicker: string; title: string };
type Copy = { chapters: Chapter[]; cta: string };
export type ScrollFilmProps = { src: string; poster: string; label: string; copy: Record<string, Copy>; height?: string; onCta?: () => void };

const Scrub = ({ src, poster, progress, className, label }: { src: string; poster: string; progress: MotionValue<number>; className: string; label?: string }) => {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    let raf = 0;
    let target = 0;
    const seek = () => {
      raf = 0;
      if (!v.duration) return;
      if (Math.abs(v.currentTime - target) > 1 / 60) v.currentTime = target;
    };
    const set = (pr: number) => {
      // film kończy się przy 88% sekcji, ostatni rozdział stoi na końcowej klatce
      target = Math.min(1, Math.max(0, pr / 0.88)) * (v.duration || 0);
      if (!raf) raf = requestAnimationFrame(seek);
    };
    const onMeta = () => set(progress.get());
    v.addEventListener('loadedmetadata', onMeta);
    if (v.readyState >= 1) onMeta();
    const off = progress.on('change', set);
    return () => { off(); v.removeEventListener('loadedmetadata', onMeta); if (raf) cancelAnimationFrame(raf); };
  }, [progress, src]);
  return <video ref={ref} src={src} poster={poster} muted playsInline preload="auto" aria-label={label} aria-hidden={label ? undefined : true} className={className} />;
};

const ChapterText = ({ ch, progress, last, children }: { ch: Chapter; progress: MotionValue<number>; last: boolean; children?: React.ReactNode }) => {
  const [a, b] = ch.range;
  const opacity = useTransform(progress, last ? [a, a + 0.04] : a === 0 ? [0, b - 0.04, b] : [a, a + 0.04, b - 0.04, b], last ? [0, 1] : a === 0 ? [1, 1, 0] : [0, 1, 1, 0]);
  const y = useTransform(progress, a === 0 ? [0, b] : [a, a + 0.05], a === 0 ? [0, -20] : [28, 0]);
  const pe = useTransform(opacity, (o) => (o > 0.5 ? 'auto' : 'none'));
  return (
    <motion.div style={{ opacity, y }} className="pointer-events-none absolute inset-x-0 bottom-0 z-30 px-4 pb-10 md:px-10 md:pb-14">
      <div className="mx-auto max-w-[1600px]">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-haag-yellow md:text-sm">{ch.kicker}</p>
        <p className="font-banner text-[12vw] leading-[0.88] text-white [text-shadow:0_4px_30px_rgba(0,0,0,0.7)] md:text-[min(6.5vw,7rem)]">{ch.title}</p>
        {children && <motion.div style={{ pointerEvents: pe }} className="mt-5">{children}</motion.div>}
      </div>
    </motion.div>
  );
};

export const ScrollFilm = ({ src, poster, label, copy, height = '420vh', onCta }: ScrollFilmProps) => {
  const { lang } = useStore();
  const c = copy[lang] ?? copy.NL;
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.4 });
  const bar = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  if (reduce) {
    return (
      <section aria-label={label} className="relative bg-black text-white">
        <img src={poster} alt={label} className="w-full" />
        <div className="px-4 py-8 md:px-10">
          <p className="font-banner text-4xl md:text-6xl">{c.chapters[0].title}</p>
          <NavLink page="shop" className="mt-4 inline-block bg-haag-yellow px-6 py-3 text-sm font-bold uppercase tracking-widest text-black">{c.cta}</NavLink>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} aria-label={label} className="relative bg-black text-white" style={{ height }}>
      <div className="sticky top-0 flex h-[100svh] w-full items-center justify-center overflow-hidden bg-black">
        {/* rozmyte tło wypełnia pionowy ekran */}
        <img src={poster} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-125 object-cover opacity-50 blur-2xl landscape:hidden" />
        <Scrub src={src} poster={poster} progress={p} label={label} className="relative z-10 w-full portrait:max-h-[60svh] portrait:object-contain landscape:absolute landscape:inset-0 landscape:h-full landscape:object-cover" />
        <div aria-hidden className="pointer-events-none absolute inset-0 z-20 bg-[linear-gradient(to_top,rgba(0,0,0,0.85)_0%,transparent_38%)]" />
        {c.chapters.map((ch, i) => (
          <ChapterText key={i} ch={ch} progress={scrollYProgress} last={i === c.chapters.length - 1}>
            {i !== c.chapters.length - 1 ? undefined : onCta ? (
              <button type="button" onClick={onCta} className="inline-block bg-haag-yellow px-6 py-3 text-sm font-bold uppercase tracking-widest text-black hover:bg-white">{c.cta}</button>
            ) : (
              <NavLink page="shop" className="inline-block bg-haag-yellow px-6 py-3 text-sm font-bold uppercase tracking-widest text-black hover:bg-white">{c.cta}</NavLink>
            )}
          </ChapterText>
        ))}
        <div aria-hidden className="absolute inset-x-0 top-0 z-30 h-[3px] bg-white/10">
          <motion.div style={{ width: bar }} className="h-full bg-haag-yellow" />
        </div>
      </div>
    </section>
  );
};

/* ---------- film 1: HAAG Back! + DE KEIZER, od przodu przez bok do pleców ---------- */

const KEIZER_COPY: Record<string, Copy> = {
  NL: {
    chapters: [
      { range: [0, 0.24], kicker: 'Nu leverbaar', title: 'HAAG Back! + DE KEIZER' },
      { range: [0.3, 0.56], kicker: 'Eigen ontwerp uit Den Haag', title: 'Loop er maar omheen' },
      { range: [0.66, 1], kicker: '€55 per stuk', title: 'De rug zegt genoeg' },
    ],
    cta: 'Bekijk de shirts',
  },
  EN: {
    chapters: [
      { range: [0, 0.24], kicker: 'Available now', title: 'HAAG Back! + DE KEIZER' },
      { range: [0.3, 0.56], kicker: 'Own design from The Hague', title: 'Walk around them' },
      { range: [0.66, 1], kicker: '€55 each', title: 'The back says enough' },
    ],
    cta: 'See the shirts',
  },
  PL: {
    chapters: [
      { range: [0, 0.24], kicker: 'Dostępne teraz', title: 'HAAG Back! + DE KEIZER' },
      { range: [0.3, 0.56], kicker: 'Własny projekt z Hagi', title: 'Obejdź je dookoła' },
      { range: [0.66, 1], kicker: '55 € za sztukę', title: 'Plecy mówią wszystko' },
    ],
    cta: 'Zobacz koszulki',
  },
};

export const KeizerOrbitFilm = () => (
  <ScrollFilm src="/films/orbit-haag-keizer.mp4" poster="/films/orbit-haag-keizer.webp" label="HAAG Back! en DE KEIZER, van voor naar achter" copy={KEIZER_COPY} />
);

/* ---------- film 2: FCDH SOUL Pink + Neon, obrót i wejście w nadruk na plecach ---------- */

const SOUL_COPY: Record<string, Copy> = {
  NL: {
    chapters: [
      { range: [0, 0.2], kicker: 'Binnenkort', title: 'FCDH SOUL · Pink + Neon' },
      { range: [0.28, 0.5], kicker: 'Voor haar en voor hem', title: 'Zelfde ziel, twee kleuren' },
      { range: [0.56, 0.74], kicker: 'De rug', title: 'Kom maar dichterbij' },
      { range: [0.8, 1], kicker: 'Nieuwe drop komt eraan', title: 'Zet je op de lijst' },
    ],
    cta: 'Zet me op de lijst',
  },
  EN: {
    chapters: [
      { range: [0, 0.2], kicker: 'Coming soon', title: 'FCDH SOUL · Pink + Neon' },
      { range: [0.28, 0.5], kicker: 'For her and for him', title: 'Same soul, two colours' },
      { range: [0.56, 0.74], kicker: 'The back', title: 'Come closer' },
      { range: [0.8, 1], kicker: 'New drop coming', title: 'Get on the list' },
    ],
    cta: 'Put me on the list',
  },
  PL: {
    chapters: [
      { range: [0, 0.2], kicker: 'Wkrótce', title: 'FCDH SOUL · Pink + Neon' },
      { range: [0.28, 0.5], kicker: 'Dla niej i dla niego', title: 'Ta sama dusza, dwa kolory' },
      { range: [0.56, 0.74], kicker: 'Plecy', title: 'Podejdź bliżej' },
      { range: [0.8, 1], kicker: 'Nowy drop nadchodzi', title: 'Zapisz się na listę' },
    ],
    cta: 'Zapisz mnie na listę',
  },
};

export const SoulOrbitFilm = ({ products }: { products: Product[] }) => {
  const { openWaitlist } = useStore();
  const neon = products.find((p) => p.name === 'FCDH SOUL Neon') ?? null;
  return (
    <ScrollFilm src="/films/orbit-soul-neon.mp4" poster="/films/orbit-soul-neon.webp" label="FCDH SOUL Pink en Neon, van voor tot de rugprint" copy={SOUL_COPY} height="520vh" onCta={neon ? () => openWaitlist(neon) : undefined} />
  );
};
