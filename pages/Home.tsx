import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, MotionValue, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { Play, X } from 'lucide-react';
import { Product } from '../types';
import { TRANSLATIONS } from '../constants';
import { ui } from '../lib/i18n';
import { video } from '../lib/media';
import { useStore } from '../site/store';
import { NavLink, useNav } from '../site/nav';
import { Btn, Marquee, Pic, Reveal } from '../site/ui';
import { isAvailable, ProductCard } from '../site/ProductCard';

const EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

const useMedia = (q: string) => {
  const [m, setM] = useState(() => window.matchMedia(q).matches);
  useEffect(() => {
    const mq = window.matchMedia(q);
    const on = () => setM(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [q]);
  return m;
};

/* ---------------- Hero ---------------- */

const SplitWord = ({ word, delay }: { word: string; delay: number }) => (
  <span className="block overflow-hidden pb-[0.04em]" aria-hidden>
    {word.split('').map((ch, i) => (
      <motion.span
        key={i}
        className="inline-block"
        initial={{ y: '105%' }}
        animate={{ y: '0%' }}
        transition={{ duration: 1, ease: EXPO, delay: delay + i * 0.045 }}
      >
        {ch}
      </motion.span>
    ))}
  </span>
);

const Hero = () => {
  const { lang } = useStore();
  const { navigate } = useNav();
  const u = ui(lang);
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const wordY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '35%']);
  const vidScale = useTransform(scrollYProgress, [0, 1], [1.08, reduce ? 1.08 : 1.22]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} className="grain relative min-h-[100svh] overflow-hidden bg-black text-white">
      {/* Film: na telefonie tło, na desktopie pionowa karta po prawej */}
      <motion.div
        className="absolute inset-0 md:inset-y-24 md:left-auto md:right-8 md:w-[min(34vw,520px)]"
        initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
        animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
        transition={{ duration: 1.4, ease: [0.76, 0, 0.24, 1], delay: 0.15 }}
      >
        <motion.video
          style={{ scale: vidScale }}
          className="h-full w-full object-cover brightness-[0.55] md:brightness-100"
          src="/video/opt/hero-loop.mp4"
          poster="/video/opt/savage.webp"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-black/40 md:hidden" />
      </motion.div>

      <motion.div
        style={{ y: wordY, opacity: fade }}
        className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1600px] flex-col justify-end px-4 pb-28 pt-28 md:justify-center md:px-8 md:pb-24"
      >
        <h1 className="font-banner whitespace-nowrap text-[28vw] leading-[0.8] md:text-[min(19vw,21rem)]">
          <span className="sr-only">STRAATFANAAT</span>
          <SplitWord word="STRAAT" delay={0.35} />
          <span className="block text-haag-yellow">
            <SplitWord word="FANAAT" delay={0.55} />
          </span>
        </h1>
        <motion.div
          className="mt-8 flex max-w-xl flex-col gap-6 md:mt-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EXPO, delay: 1.1 }}
        >
          <p className="text-xl font-medium md:text-2xl">{u.tagline}</p>
          <div className="flex flex-wrap gap-3">
            <Btn variant="yellow" onClick={() => navigate('shop')}>
              {u.shopDrop}
            </Btn>
            <Btn variant="outline-light" onClick={() => navigate('lookbook')}>
              {u.seeLookbook}
            </Btn>
          </div>
        </motion.div>
      </motion.div>

      <div className="absolute inset-x-0 bottom-0 z-20">
        <div className="h-2 scarf-stripes" />
        <div className="bg-haag-yellow py-3 text-black">
          <Marquee
            className="font-banner text-2xl md:text-3xl"
            items={['Den Haag', lang === 'PL' ? 'Polskie korzenie' : lang === 'EN' ? 'Polish roots' : 'Poolse roots', '300gsm', 'Limited drops', 'Straatfanaat']}
          />
        </div>
      </div>
    </section>
  );
};

/* ---------------- Dostępne teraz ---------------- */

const AvailableNow = ({ products }: { products: Product[] }) => {
  const { lang } = useStore();
  const u = ui(lang);
  const items = products.filter(isAvailable);
  return (
    <section className="bg-paper px-4 py-20 md:px-8 md:py-32">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-10 flex flex-col justify-between gap-4 md:mb-16 md:flex-row md:items-end">
          <h2 className="font-banner text-[18vw] md:text-[10rem]">{u.availableNow}</h2>
          <div className="flex max-w-xs flex-col gap-3 md:items-end md:text-right">
            <p className="text-lg">{u.availableNowLead}</p>
            <NavLink page="shop" className="font-semibold underline decoration-2 underline-offset-4 hover:text-haag-green">
              {u.shopDrop}
            </NavLink>
          </div>
        </div>
        <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 md:grid-cols-3">
          {items.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.08} className={i === 1 ? 'md:translate-y-24' : ''}>
              <ProductCard product={p} sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw" />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ---------------- Następny drop: poziomy pas sterowany scrollem ---------------- */

const Track = ({ items, x }: { items: Product[]; x?: MotionValue<number> }) => (
  <motion.div style={x ? { x } : undefined} className="flex w-max gap-5 px-4 md:gap-8 md:px-8">
    {items.map((p) => (
      <div key={p.id} className="w-[68vw] shrink-0 snap-start sm:w-[42vw] md:w-[clamp(240px,21vw,340px)]">
        <ProductCard product={p} tone="dark" sizes="(min-width: 768px) 22vw, 68vw" />
      </div>
    ))}
  </motion.div>
);

const NextDrop = ({ products }: { products: Product[] }) => {
  const { lang } = useStore();
  const u = ui(lang);
  const items = products.filter((p) => !isAvailable(p));
  const desktop = useMedia('(min-width: 768px)');
  const reduce = useReducedMotion();
  const pinned = desktop && !reduce;

  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);

  useLayoutEffect(() => {
    if (!pinned || !trackRef.current) return;
    const measure = () => setDistance(Math.max(0, (trackRef.current?.scrollWidth ?? 0) - window.innerWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(trackRef.current);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [pinned, items.length]);

  const { scrollYProgress } = useScroll(pinned ? { target: sectionRef, offset: ['start start', 'end end'] } : {});
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);
  const bar = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  const header = (
    <div className="mx-auto mb-10 flex w-full max-w-[1600px] flex-col justify-between gap-4 px-4 md:mb-12 md:flex-row md:items-end md:px-8">
      <h2 className="font-banner text-[18vw] text-white md:text-[10rem]">{u.nextDrop}</h2>
      <p className="max-w-sm text-lg text-white/70 md:text-right">{u.nextDropLead}</p>
    </div>
  );

  if (!pinned) {
    return (
      <section className="bg-asphalt py-20 text-white">
        {header}
        <div className="snap-x snap-mandatory overflow-x-auto pb-4 [scrollbar-width:none]" data-lenis-prevent-touch>
          <Track items={items} />
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative bg-asphalt text-white" style={{ height: `calc(100vh + ${distance}px)` }}>
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden pt-16">
        {header}
        <div ref={trackRef} className="w-max">
          <Track items={items} x={x as MotionValue<number>} />
        </div>
        <div className="mx-auto mt-10 w-full max-w-[1600px] px-8">
          <div className="h-1 bg-white/15">
            <motion.div style={{ width: bar }} className="h-full bg-haag-yellow" />
          </div>
        </div>
      </div>
    </section>
  );
};

/* ---------------- Filmy ---------------- */

const CLIPS = [
  { src: '/video/WhatsApp%20Video%202026-03-27%20at%2011.54.30%20PM.mp4', title: 'Straatfanaat', productId: null as string | null },
  { src: '/video/savage%20.mp4', title: 'Savage Omerta', productId: '8' },
  { src: '/video/czapka%20hooligan.mp4', title: 'Czapka Hooligan', productId: '16' },
];

const AutoClip = ({ src, poster }: { src: string; poster: string }) => {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? el.play().catch(() => {}) : el.pause()), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <video ref={ref} src={src} poster={poster} muted loop playsInline preload="none" className="h-full w-full object-cover" />;
};

const Clips = () => {
  const { lang } = useStore();
  const { lenis } = useNav();
  const u = ui(lang);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    if (open !== null) lenis.current?.stop();
    else lenis.current?.start();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, lenis]);

  return (
    <section className="bg-black px-4 py-20 text-white md:px-8 md:py-32">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-10 flex flex-col justify-between gap-4 md:mb-16 md:flex-row md:items-end">
          <h2 className="font-banner text-[18vw] md:text-[10rem]">{u.onTheStreet}</h2>
          <p className="max-w-xs text-lg text-white/70 md:text-right">{u.onTheStreetLead}</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          {CLIPS.map((c, i) => {
            const v = video(c.src);
            return (
              <Reveal key={c.src} delay={i * 0.1}>
                <div className="group relative aspect-[9/14] overflow-hidden bg-asphalt">
                  <AutoClip src={v.src} poster={v.poster} />
                  <button
                    onClick={() => setOpen(i)}
                    className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/80 via-transparent to-transparent p-5 text-left"
                    aria-label={`${u.playWithSound}: ${c.title}`}
                  >
                    <span className="font-banner text-5xl">{c.title}</span>
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center bg-haag-yellow text-black transition-transform duration-500 ease-out-expo group-hover:scale-110">
                      <Play className="h-6 w-6 fill-black" />
                    </span>
                  </button>
                </div>
                {c.productId && (
                  <NavLink page="product" id={c.productId} className="mt-3 inline-block font-semibold underline decoration-2 underline-offset-4 hover:text-haag-yellow">
                    {u.viewProduct}
                  </NavLink>
                )}
              </Reveal>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {open !== null && (
          <motion.div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
            role="dialog"
            aria-modal="true"
          >
            <button className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center bg-haag-yellow text-black" aria-label={u.close}>
              <X className="h-6 w-6" />
            </button>
            <motion.video
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: EXPO }}
              onClick={(e) => e.stopPropagation()}
              src={video(CLIPS[open].src).src}
              poster={video(CLIPS[open].src).poster}
              controls
              autoPlay
              playsInline
              className="max-h-[88vh] w-auto max-w-full"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

/* ---------------- Manifest: słowa zapalają się przy scrollu ---------------- */

const Word = ({ word, progress, range }: { word: string; progress: MotionValue<number>; range: [number, number] }) => {
  const opacity = useTransform(progress, range, [0.18, 1]);
  return (
    <motion.span style={{ opacity }} className="mr-[0.18em] inline-block">
      {word}
    </motion.span>
  );
};

const Manifesto = () => {
  const { lang } = useStore();
  const t = TRANSLATIONS[lang];
  const u = ui(lang);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'end 55%'] });
  const words = `${t.culture_manifesto_head} ${t.culture_manifesto_sub}`.split(' ');

  return (
    <section className="bg-haag-yellow px-4 py-24 text-black md:px-8 md:py-40">
      <div className="mx-auto max-w-[1600px]">
        <div ref={ref}>
          <p className="font-banner text-[17vw] leading-[0.86] md:text-[11rem]">
            {words.map((w, i) => (
              <Word key={i} word={w} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} />
            ))}
          </p>
        </div>
        <div className="mt-12 grid gap-8 md:mt-20 md:grid-cols-12">
          <p className="text-xl leading-relaxed md:col-span-6 md:col-start-7 md:text-2xl">{t.manifesto_desc}</p>
          <div className="md:col-span-6 md:col-start-7">
            <NavLink page="about" className="inline-block border-b-[3px] border-black pb-1 text-lg font-bold hover:border-haag-green hover:text-haag-green">
              {u.readStory}
            </NavLink>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ---------------- Duo ---------------- */

const Duo = () => {
  const { lang } = useStore();
  const { navigate } = useNav();
  const u = ui(lang);
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['-8%', '8%']);

  return (
    <section className="bg-paper px-4 py-20 md:px-8 md:py-32">
      <div className="mx-auto grid max-w-[1600px] items-center gap-10 md:grid-cols-12">
        <div ref={ref} className="relative aspect-[4/5] overflow-hidden md:col-span-7">
          <motion.div style={{ y }} className="absolute -inset-y-[10%] inset-x-0">
            <Pic src="/images/kolekcja%20dla%20niego%20dla%20niej%20sesia1.jpeg" alt="STRAATFANAAT duo" sizes="(min-width: 768px) 58vw, 100vw" className="h-full w-full object-cover" />
          </motion.div>
        </div>
        <div className="flex flex-col gap-6 md:col-span-4 md:col-start-9">
          <h2 className="font-banner text-[20vw] md:text-[8.5rem]">{u.duoTitle}</h2>
          <p className="text-lg leading-relaxed">{u.duoText}</p>
          <div>
            <Btn variant="black" onClick={() => navigate('lookbook')}>
              {u.viewDuo}
            </Btn>
          </div>
        </div>
      </div>
    </section>
  );
};

export const Home = ({ products }: { products: Product[] }) => (
  <>
    <Hero />
    <AvailableNow products={products} />
    <NextDrop products={products} />
    <Manifesto />
    <Clips />
    <Duo />
  </>
);
