import React, { useEffect, useRef } from 'react';
import { motion, MotionValue, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { Product } from '../types';
import { eur, ui } from '../lib/i18n';
import { useStore } from './store';
import { NavLink, useNav } from './nav';
import { Btn } from './ui';
import { isAvailable } from './ProductCard';
import { FrameScrub, useFrameMode } from './fx/FrameScrub';

/*
  Góra strony głównej: kinowy kadr z galerii (te same koszulki co w animacjach), marka i hasło,
  a u dołu wolno przesuwająca się karuzela szklanych kart z produktami, które leżą na stanie.
*/

const EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

const GlassCard = ({ product, label }: { product: Product; label: string }) => {
  const { lang } = useStore();
  return (
    <NavLink
      page="product"
      id={product.id}
      className="group/card flex w-[250px] shrink-0 items-center gap-4 rounded-2xl border border-white/15 bg-white/[0.07] p-3 pr-5 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.9)] backdrop-blur-xl transition-[background-color,border-color,transform] duration-500 ease-out-expo hover:-translate-y-1 hover:border-gold/60 hover:bg-white/[0.12] md:w-[290px]"
    >
      <span className="relative flex h-[76px] w-[68px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-black/45 md:h-[88px] md:w-[78px]">
        <img src={product.cutout ?? product.image} alt="" draggable={false} className="h-[86%] w-[86%] object-contain drop-shadow-[0_8px_10px_rgba(0,0,0,0.7)] transition-transform duration-700 ease-out-expo group-hover/card:scale-110" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 text-[12px] font-medium text-white/65">
          <span className="h-1.5 w-1.5 rounded-full bg-haag-green-bright" />
          {label}
        </span>
        <span className="mt-1 block truncate font-narrow text-[17px] font-bold leading-tight text-white">{product.name}</span>
        <span className="mt-0.5 block text-[15px] tabular-nums text-white/80">{eur(product.price, lang)}</span>
      </span>
    </NavLink>
  );
};

/* ---------- film obrotu przewijany scrollem ----------
   Gdy w public/het-raam/ leży obrot.mp4 (telefon: obrot-m.mp4), okładka przypina się na czas przewijania,
   a Joey odwraca się od okna do widza (klatki K5 → K6 → K7 → K8). Bez pliku okładka jest zwykłym zdjęciem.
   Kodowanie pod przewijanie: każda klatka kluczowa (ffmpeg -g 1), bez dźwięku. */

const TURN_SRC = '/het-raam/obrot.mp4';
const TURN_SRC_M = '/het-raam/obrot-m.mp4';
const PORTRAIT = '(max-aspect-ratio: 4/5)';
const FRAME = 'h-full w-full object-cover object-[62%_40%] [@media(max-aspect-ratio:4/5)]:object-[50%_38%]';

// pierwsze 6% przewijania stoi na zdjęciu, film kończy się przy 92% (to samo co w TurnScrub)
const TURN_MAP = (pr: number) => (pr - 0.06) / 0.86;

const useTurnFilm = () => {
  const [portrait, setPortrait] = React.useState(() => typeof window !== 'undefined' && window.matchMedia(PORTRAIT).matches);
  const [found, setFound] = React.useState<string | null>(null);
  const src = portrait ? TURN_SRC_M : TURN_SRC;
  useEffect(() => {
    const mq = window.matchMedia(PORTRAIT);
    const on = () => setPortrait(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  useEffect(() => {
    let alive = true;
    fetch(src, { method: 'HEAD' })
      .then((r) => alive && setFound(r.ok && (r.headers.get('content-type') ?? '').startsWith('video') ? src : null))
      .catch(() => {});
    return () => { alive = false; };
  }, [src]);
  return found === src ? src : null;
};

const TurnScrub = ({ src, progress, measure }: { src: string; progress: MotionValue<number>; measure: () => number }) => {
  const ref = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = React.useState(false);
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
      // pierwsze 6% przewijania stoi na zdjęciu, film kończy się przy 92% i zostaje na ostatniej klatce
      target = Math.min(1, Math.max(0, (pr - 0.06) / 0.86)) * (v.duration || 0);
      if (!raf) raf = requestAnimationFrame(seek);
    };
    const onData = () => { set(measure()); setReady(true); };
    v.addEventListener('loadeddata', onData);
    if (v.readyState >= 2) onData();
    const off = progress.on('change', set);
    // po odświeżeniu strony przeglądarka potrafi przywrócić stare miejsce przewijania i od razu je cofnąć;
    // film zostawał wtedy na ostatniej klatce, więc dosynchronizowujemy go jeszcze chwilę po starcie i po każdym seeku
    // (wartość z useScroll bywa wtedy nieaktualna aż do pierwszego ruchu, dlatego mierzymy położenie sekcji sami)
    const sync = () => set(measure());
    const timers = [300, 1200, 3000].map((ms) => window.setTimeout(sync, ms));
    v.addEventListener('seeked', sync);
    return () => { off(); timers.forEach(clearTimeout); v.removeEventListener('seeked', sync); v.removeEventListener('loadeddata', onData); if (raf) cancelAnimationFrame(raf); };
  }, [progress, src, measure]);
  return <video ref={ref} key={src} src={src} muted playsInline preload="auto" aria-hidden className={`absolute inset-0 ${FRAME} transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-0'}`} />;
};

export const HeroNow = ({ products }: { products: Product[] }) => {
  const { lang } = useStore();
  const { navigate } = useNav();
  const u = ui(lang);
  const reduce = useReducedMotion();
  const items = products.filter(isAvailable);
  const loop = reduce ? items : [...items, ...items, ...items];

  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
  const turnSrc = useTurnFilm();
  const measure = React.useCallback(() => {
    const el = sectionRef.current;
    if (!el) return 0;
    const range = el.offsetHeight - window.innerHeight;
    return range > 0 ? Math.min(1, Math.max(0, -el.getBoundingClientRect().top / range)) : 0;
  }, []);
  const film = !reduce && turnSrc;
  const frames = useFrameMode();
  /* napis i karuzela ustępują, gdy Joey zaczyna się odwracać */
  const uiOpacity = useTransform(scrollYProgress, [0.04, 0.2], [1, 0]);
  const uiY = useTransform(scrollYProgress, [0.04, 0.2], [0, 40]);
  const uiPe = useTransform(uiOpacity, (o) => (o > 0.5 ? 'auto' : 'none'));
  const shade = useTransform(scrollYProgress, [0.04, 0.25], [1, 0.35]);

  return (
    <section ref={sectionRef} className={`relative bg-black text-white ${film ? 'h-[300vh]' : ''}`}>
     <div className={`flex min-h-[100svh] flex-col justify-end overflow-hidden ${film ? 'sticky top-0 h-[100svh]' : 'relative'}`}>
      {/* ten sam pokój z deszczem co w scenie niżej, a w nim Joey plecami do okna w DE KEIZER (kadry K5) */}
      <motion.div
        aria-hidden
        className="absolute inset-0"
        initial={{ scale: 1.08, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.8, ease: EXPO }}
      >
        <picture>
          <source media="(max-aspect-ratio: 4/5)" srcSet="/het-raam/pokoj-joey-m.webp" />
          <img src="/het-raam/pokoj-joey-d.webp" alt="" fetchPriority="high" className={FRAME} />
        </picture>
        {film && (frames
          ? <FrameScrub dir="/seq/obrot-m" count={145} width={540} height={960} progress={scrollYProgress} map={TURN_MAP} measure={measure} className={`absolute inset-0 ${FRAME}`} />
          : <TurnScrub src={film} progress={scrollYProgress} measure={measure} />)}
      </motion.div>
      <motion.div aria-hidden style={film ? { opacity: shade } : undefined} className="absolute inset-0 bg-[linear-gradient(to_top,#000_0%,rgba(0,0,0,0.6)_28%,rgba(0,0,0,0.05)_60%,rgba(0,0,0,0.45)_100%)]" />

      <motion.div style={film ? { opacity: uiOpacity, y: uiY, pointerEvents: uiPe } : undefined} className="relative">
      <div className="relative mx-auto w-full max-w-[1600px] px-4 md:px-8">
        <motion.h1
          className="font-banner text-[12.4vw] leading-[0.86] md:text-[clamp(4rem,7.4vw,6rem)]"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.9, ease: EXPO, delay: 0.15 }}
        >
          Straat<span className="text-haag-yellow">fanaat</span>
        </motion.h1>
        <motion.div
          className="mt-4 flex flex-col gap-5 md:flex-row md:items-center md:gap-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EXPO, delay: 0.4 }}
        >
          <p className="text-lg text-white/80 md:text-xl">{u.tagline}</p>
          <div className="flex flex-wrap gap-3">
            <Btn variant="yellow" onClick={() => navigate('shop')}>
              {u.shopDrop}
            </Btn>
            <Btn variant="outline-light" onClick={() => navigate('lookbook')}>
              {u.seeLookbook}
            </Btn>
          </div>
        </motion.div>
      </div>

      {/* karuzela: dostępne teraz */}
      <motion.div
        className="relative mt-10 pb-8 md:mt-12 md:pb-10"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EXPO, delay: 0.6 }}
      >
        <div
          className={`sf-hero-rail group/rail ${reduce ? 'overflow-x-auto px-4 md:px-8' : 'overflow-hidden'} [mask-image:linear-gradient(to_right,transparent,#000_6%,#000_94%,transparent)]`}
          aria-label={u.availableNow}
        >
          <div className={`flex w-max gap-4 py-2 ${reduce ? '' : 'sf-hero-track pl-4'}`}>
            {loop.map((p, i) => (
              <div key={`${p.id}-${i}`} aria-hidden={i >= items.length ? true : undefined}>
                <GlassCard product={p} label={u.availableNow} />
              </div>
            ))}
          </div>
        </div>
      </motion.div>
      </motion.div>
     </div>
    </section>
  );
};
