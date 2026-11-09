import React, { useEffect, useRef } from 'react';
import { motion, MotionValue, useMotionTemplate, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import { Product } from '../../types';
import { useStore } from '../store';
import { Btn } from '../ui';

/*
  HET RAAM v2: prawdziwa scena 3D sterowana scrollem (bez sklejki klatek).
  Pokój z deszczem (k0), koszulka HAAG Back! spada z sufitu i obraca się w 3D (przód / tył),
  czapka S spada wirując i ląduje nad koszulką, kamera najeżdża w głąb pokoju.
  Akty i teksty wg BIBLIA-HET-RAAM.md (wersja 2).
*/

const IMG = {
  roomD: '/het-raam/pokoj-d.webp',
  roomM: '/het-raam/pokoj-m.webp',
  front: '/images/cutout/fc-den-haag-back-drop-front.webp',
  back: '/images/cutout/fc-den-haag-back-drop-back.webp',
  cap: '/images/cutout/czapka.webp',
  capBack: '/images/cutout/czapka-back.webp',
};

type Act = { range: [number, number]; kicker: string; title: string };

const COPY: Record<string, { acts: Act[]; cta: string; scroll: string }> = {
  NL: {
    acts: [
      { range: [0.0, 0.22], kicker: 'Gemaakt voor 070', title: 'STRAATFANAAT' },
      { range: [0.26, 0.47], kicker: 'FC Den Haag Back', title: 'HAAG Back! · €55' },
      { range: [0.51, 0.72], kicker: 'Groen-geel', title: 'Den Haag, 070' },
      { range: [0.77, 1], kicker: 'Nieuwe drop komt eraan', title: 'Zet je op de lijst' },
    ],
    cta: 'Zet me op de lijst',
    scroll: 'Scroll',
  },
  EN: {
    acts: [
      { range: [0.0, 0.22], kicker: 'Made for 070', title: 'STRAATFANAAT' },
      { range: [0.26, 0.47], kicker: 'FC Den Haag Back', title: 'HAAG Back! · €55' },
      { range: [0.51, 0.72], kicker: 'Green-yellow', title: 'Den Haag, 070' },
      { range: [0.77, 1], kicker: 'New drop coming', title: 'Get on the list' },
    ],
    cta: 'Put me on the list',
    scroll: 'Scroll',
  },
  PL: {
    acts: [
      { range: [0.0, 0.22], kicker: 'Zrobione dla 070', title: 'STRAATFANAAT' },
      { range: [0.26, 0.47], kicker: 'FC Den Haag Back', title: 'HAAG Back! · €55' },
      { range: [0.51, 0.72], kicker: 'Zielono-żółci', title: 'Den Haag, 070' },
      { range: [0.77, 1], kicker: 'Nowy drop nadchodzi', title: 'Zapisz się na listę' },
    ],
    cta: 'Zapisz mnie na listę',
    scroll: 'Przewiń',
  },
};

/* ---------- tekst aktu: zakresy zawsze w 0–1 (Motion używa scroll-timeline) ---------- */

const ActText = ({ act, progress, last, children }: { act: Act; progress: MotionValue<number>; last: boolean; children?: React.ReactNode }) => {
  const [a, b] = act.range;
  const opacity = useTransform(
    progress,
    a === 0 ? [0, b - 0.04, b] : last ? [a, a + 0.04] : [a, a + 0.04, b - 0.04, b],
    a === 0 ? [1, 1, 0] : last ? [0, 1] : [0, 1, 1, 0],
  );
  const y = useTransform(progress, a === 0 ? [0, b] : [a, a + 0.05], a === 0 ? [0, -20] : [36, 0]);
  const pe = useTransform(opacity, (o) => (o > 0.5 ? 'auto' : 'none'));
  return (
    <motion.div style={{ opacity, y }} className="pointer-events-none absolute inset-x-0 bottom-0 z-30 px-4 pb-8 md:px-10 md:pb-14">
      <div className="mx-auto max-w-[1600px]">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-haag-yellow md:text-sm">{act.kicker}</p>
        <p className="font-banner text-[14vw] leading-[0.85] text-white [text-shadow:0_4px_30px_rgba(0,0,0,0.6)] md:text-[min(8vw,8.5rem)]">{act.title}</p>
        {children && <motion.div style={{ pointerEvents: pe }} className="mt-5">{children}</motion.div>}
      </div>
    </motion.div>
  );
};

/* ---------- deszcz: lekkie smugi na canvas, szybsze przy scrollu ---------- */

const Rain = ({ speed }: { speed: MotionValue<number> }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d')!;
    let raf = 0;
    let drops: { x: number; y: number; l: number; v: number; o: number }[] = [];
    const fit = () => {
      c.width = c.clientWidth;
      c.height = c.clientHeight;
      const n = Math.round((c.width * c.height) / 9000);
      drops = Array.from({ length: n }, () => ({ x: Math.random() * c.width, y: Math.random() * c.height, l: 8 + Math.random() * 22, v: 6 + Math.random() * 10, o: 0.08 + Math.random() * 0.22 }));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(c);
    const tick = () => {
      const boost = 1 + Math.min(Math.abs(speed.get()) / 400, 3);
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.lineWidth = 1;
      for (const d of drops) {
        d.y += d.v * boost;
        d.x -= 0.6 * boost;
        if (d.y > c.height) { d.y = -d.l; d.x = Math.random() * c.width * 1.1; }
        ctx.strokeStyle = `rgba(200,220,255,${d.o})`;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x + 1.2, d.y + d.l * boost);
        ctx.stroke();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [speed]);
  return <canvas ref={ref} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full mix-blend-screen" />;
};

/* ---------- film Joeya przewijany scrollem ----------
   Gdy w public/het-raam/ leży joey.mp4 (Kling: spada, obraca się, ląduje, łapie czapkę),
   film zastępuje scenę 3D i jest „przewijany” scrollem. Bez pliku zostaje scena 3D.
   Kodowanie pod przewijanie: każda klatka kluczowa (ffmpeg -g 1), bez dźwięku. */

const JOEY_SRC = '/het-raam/joey.mp4';
const JOEY_POSTER = '/het-raam/joey.webp';

const useJoeyAvailable = () => {
  const [ok, setOk] = React.useState(false);
  useEffect(() => {
    let alive = true;
    fetch(JOEY_SRC, { method: 'HEAD' })
      .then((r) => alive && setOk(r.ok && (r.headers.get('content-type') ?? '').startsWith('video')))
      .catch(() => {});
    return () => { alive = false; };
  }, []);
  return ok;
};

const JoeyScrub = ({ progress, onReady }: { progress: MotionValue<number>; onReady: () => void }) => {
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
      // film kończy się przy 90% sekcji, ostatni akt stoi na końcowej klatce
      target = Math.min(1, Math.max(0, pr / 0.9)) * (v.duration || 0);
      if (!raf) raf = requestAnimationFrame(seek);
    };
    const onMeta = () => { set(progress.get()); onReady(); };
    v.addEventListener('loadedmetadata', onMeta);
    if (v.readyState >= 1) onMeta();
    const off = progress.on('change', set);
    return () => { off(); v.removeEventListener('loadedmetadata', onMeta); if (raf) cancelAnimationFrame(raf); };
  }, [progress, onReady]);
  return (
    <video
      ref={ref}
      src={JOEY_SRC}
      poster={JOEY_POSTER}
      muted
      playsInline
      preload="auto"
      aria-label="Joey in HAAG Back! en de S-pet"
      className="absolute inset-0 h-full w-full object-cover object-[50%_40%]"
    />
  );
};

/* ---------- scena ---------- */

export const HetRaam = ({ products }: { products: Product[] }) => {
  const { lang, openWaitlist } = useStore();
  const copy = COPY[lang] ?? COPY.NL;
  const reduce = useReducedMotion();
  const shirtProduct = products.find((p) => p.id === '17') ?? null;

  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress, scrollY } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
  // sprężyna: ruch ma bezwładność zamiast przeskakiwać za kółkiem
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.4 });
  const velocity = useTransform(scrollY, (v) => v); // tylko do deszczu
  const prev = useRef(0);
  const speed = useTransform(velocity, (v) => { const d = v - prev.current; prev.current = v; return d * 20; });

  /* kamera: powolny najazd w głąb pokoju */
  const roomScale = useTransform(p, [0, 1], [1.02, reduce ? 1.02 : 1.42]);
  const roomY = useTransform(p, [0, 1], ['0%', reduce ? '0%' : '-3%']);
  const vignette = useTransform(p, [0, 0.75, 1], [0.35, 0.45, 0.7]);

  /* koszulka: spada z sufitu z obrotem, ląduje, pełny obrót 360°, przy końcu jeszcze raz */
  const shirtY = useTransform(p, [0, 0.17, 0.23, 0.5, 0.6, 0.77, 1], ['-115vh', '3vh', '0vh', '0vh', '5vh', '0vh', '-4vh']);
  // obrót szybko przechodzi przez bok (90°), a długo stoi przodem albo tyłem, żeby nigdy nie zatrzymać się na „kresce”
  const shirtRotY = useTransform(p, [0, 0.2, 0.26, 0.32, 0.37, 0.43, 0.48, 1], [-260, -12, 0, 0, 180, 180, 360, 360]);
  const shirtRotX = useTransform(p, [0, 0.17, 0.23, 0.5, 0.6], [40, -10, 0, 0, 6]);
  const shirtRotZ = useTransform(p, [0, 0.17, 0.23], [-30, 5, 0]);
  const shirtScale = useTransform(p, [0, 0.23, 0.77, 1], [0.75, 1, 1, 1.06]);
  const shirtTransform = useMotionTemplate`translateY(${shirtY}) rotateX(${shirtRotX}deg) rotateY(${shirtRotY}deg) rotateZ(${shirtRotZ}deg) scale(${shirtScale})`;

  /* połysk przesuwa się po materiale razem z obrotem */
  const sheenX = useTransform(shirtRotY, (r) => `${((((r % 360) + 360) % 360) / 360) * 300 - 100}%`);
  /* przyciemnienie boków przy obrocie (wygląda jak światło z okna) */
  const sideShade = useTransform(shirtRotY, (r) => Math.abs(Math.sin((r * Math.PI) / 180)) * 0.55);

  /* cień na mokrej podłodze */
  const shadowScale = useTransform(p, [0, 0.17, 0.23, 0.5, 0.6, 0.77], [0.15, 0.95, 1, 1, 0.9, 1]);
  const shadowOpacity = useTransform(p, [0, 0.17, 0.23], [0, 0.6, 0.75]);
  const shadowSqueeze = useTransform(shirtRotY, (r) => 0.55 + Math.abs(Math.cos((r * Math.PI) / 180)) * 0.45);
  const shadowW = useTransform([shadowScale, shadowSqueeze], ([a, b]: number[]) => a * b);
  const shadowTransform = useMotionTemplate`translateX(-50%) scaleX(${shadowW}) scaleY(${shadowScale})`;

  /* czapka S: spada wirując, łapie się nad kołnierzem */
  const capY = useTransform(p, [0.47, 0.6, 0.65, 0.77, 1], ['-120vh', '1vh', '0vh', '0vh', '-2vh']);
  // czapka wiruje tylko w locie, po lądowaniu stoi przodem (lekko pod kątem)
  const capRotY = useTransform(p, [0.47, 0.62, 1], [-720, -14, -14]);
  const capRotX = useTransform(p, [0.47, 0.6, 0.65], [70, -12, 8]);
  const capRotZ = useTransform(p, [0.47, 0.6, 0.65], [40, -8, -6]);
  const capOpacity = useTransform(p, [0.46, 0.48], [0, 1]);
  const capTransform = useMotionTemplate`translateY(${capY}) rotateX(${capRotX}deg) rotateY(${capRotY}deg) rotateZ(${capRotZ}deg)`;

  /* błysk przy lądowaniu czapki */
  const flash = useTransform(p, [0.6, 0.62, 0.68], [0, 0.35, 0]);
  const hintOpacity = useTransform(scrollYProgress, [0, 0.04], [1, 0]);

  /* film Joeya (jeśli jest) zastępuje koszulkę i czapkę 3D */
  const joeyAvailable = useJoeyAvailable();
  const [joeyReady, setJoeyReady] = React.useState(false);
  const markReady = React.useCallback(() => setJoeyReady(true), []);
  const useJoey = joeyAvailable && !reduce;
  const joeyScale = useTransform(p, [0, 1], [1, 1.08]);

  return (
    <section ref={sectionRef} aria-label="STRAATFANAAT: Het Raam" className="relative h-[520vh] bg-black text-white">
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden [perspective:1400px]">
        {/* pokój */}
        <motion.div style={{ scale: roomScale, y: roomY }} className="absolute inset-0 origin-[50%_45%] will-change-transform">
          <picture>
            <source media="(max-aspect-ratio: 4/5)" srcSet={IMG.roomM} />
            <img src={IMG.roomD} alt="" aria-hidden className="h-full w-full object-cover" fetchPriority="high" />
          </picture>
          <Rain speed={speed} />
        </motion.div>
        {/* film ma własny ruch kamery, więc tylko delikatny najazd */}
        {useJoey && (
          <motion.div style={{ scale: joeyScale }} className="absolute inset-0 origin-[50%_40%] will-change-transform">
            <JoeyScrub progress={p} onReady={markReady} />
            <Rain speed={speed} />
          </motion.div>
        )}
        <motion.div aria-hidden style={{ opacity: vignette }} className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,transparent_35%,black_100%)]" />

        {/* scena 3D */}
        <div className={`${useJoey && joeyReady ? 'hidden' : 'flex'} absolute inset-0 items-center justify-center pt-[16svh] pb-[22svh] md:pt-[18svh] md:pb-[16svh] [transform-style:preserve-3d]`}>
          <div className="relative h-[40svh] max-h-[560px] aspect-[743/804] md:h-[50svh] [transform-style:preserve-3d]">
            {/* cień */}
            <motion.div
              aria-hidden
              style={{ opacity: shadowOpacity, transform: shadowTransform }}
              className="absolute left-1/2 top-[104%] h-[9%] w-[78%] rounded-[50%] bg-black blur-xl"
            />

            {/* koszulka: dwie strony, każda widoczna tylko od przodu */}
            <motion.div style={{ transform: shirtTransform }} className="absolute inset-0 [transform-style:preserve-3d] will-change-transform">
              <div className="animate-[raamFloat_5s_ease-in-out_infinite] absolute inset-0 [transform-style:preserve-3d]">
                <Face src={IMG.front} sheenX={sheenX} shade={sideShade} />
                <Face src={IMG.back} sheenX={sheenX} shade={sideShade} back />
              </div>
            </motion.div>

            {/* czapka nad kołnierzem */}
            <motion.div
              style={{ transform: capTransform, opacity: capOpacity }}
              className="absolute left-1/2 top-[-27%] w-[46%] -translate-x-1/2 [transform-style:preserve-3d] will-change-transform"
            >
              <div className="relative animate-[raamFloat_4.2s_ease-in-out_infinite_0.6s] [transform-style:preserve-3d]">
                <img src={IMG.cap} alt="Czapka S, STRAATFANAAT" className="w-full drop-shadow-[0_18px_30px_rgba(0,0,0,0.65)] [backface-visibility:hidden]" />
                <img src={IMG.capBack} alt="" aria-hidden className="absolute inset-0 w-full drop-shadow-[0_18px_30px_rgba(0,0,0,0.65)] [backface-visibility:hidden] [transform:rotateY(180deg)]" />
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div aria-hidden style={{ opacity: flash }} className="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(circle_at_50%_30%,rgba(255,231,0,0.9),transparent_55%)] mix-blend-screen" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[45%] bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

        {copy.acts.map((act, i) => (
          <ActText key={i} act={act} progress={scrollYProgress} last={i === copy.acts.length - 1}>
            {i === copy.acts.length - 1 && shirtProduct ? (
              <Btn variant="yellow" onClick={() => openWaitlist(shirtProduct)}>
                {copy.cta}
              </Btn>
            ) : undefined}
          </ActText>
        ))}

        <motion.div aria-hidden style={{ opacity: hintOpacity }} className="absolute right-4 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-center gap-3 text-[11px] font-bold uppercase tracking-[0.3em] text-white/70 md:right-10 md:flex">
          <span className="[writing-mode:vertical-rl]">{copy.scroll}</span>
          <span className="h-16 w-px bg-white/50" />
        </motion.div>
      </div>
      <style>{`@keyframes raamFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}@media (prefers-reduced-motion: reduce){.animate-\\[raamFloat_5s_ease-in-out_infinite\\],.animate-\\[raamFloat_4\\.2s_ease-in-out_infinite_0\\.6s\\]{animation:none}}`}</style>
    </section>
  );
};

const Face = ({ src, back, sheenX, shade }: { src: string; back?: boolean; sheenX: MotionValue<string>; shade: MotionValue<number> }) => {
  const mask = { WebkitMaskImage: `url(${src})`, maskImage: `url(${src})`, WebkitMaskSize: '100% 100%', maskSize: '100% 100%' } as React.CSSProperties;
  return (
    <div className="absolute inset-0 [backface-visibility:hidden]" style={{ transform: back ? 'rotateY(180deg) translateZ(8px)' : 'translateZ(8px)' }}>
      <img src={src} alt={back ? 'HAAG Back! achterkant' : 'HAAG Back! voorkant'} className="h-full w-full object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,0.55)]" draggable={false} />
      {/* połysk z okna */}
      <motion.div
        aria-hidden
        style={{ ...mask, backgroundPositionX: sheenX }}
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(105deg,transparent_35%,rgba(170,200,255,0.22)_50%,transparent_65%)] bg-[length:200%_100%] mix-blend-screen"
      />
      {/* cień boczny przy obrocie */}
      <motion.div aria-hidden style={{ ...mask, opacity: shade }} className="pointer-events-none absolute inset-0 bg-black" />
    </div>
  );
};
