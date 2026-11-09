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
import { CollectionOrbit, DollyZoom, HeroScene, Stats, Story } from './HomeFx';
import { HetRaam } from '../site/fx/HetRaam';
import { Reel, ReelCoverflow } from '../site/fx/ReelCoverflow';
import { Bohaterowie } from '../site/fx/Bohaterowie';

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

const OLD_CLIPS = [
  { src: '/video/WhatsApp%20Video%202026-03-27%20at%2011.54.30%20PM.mp4', title: 'Straatfanaat', productId: null as string | null },
  { src: '/video/savage%20.mp4', title: 'Savage Omerta', productId: '8' },
  { src: '/video/czapka%20hooligan.mp4', title: 'Czapka Hooligan', productId: '16' },
];

const reel = (name: string, title: string, productId: string | null): Reel => ({ src: `/video/rolki/${name}.mp4`, poster: `/video/rolki/${name}.webp`, title, productId });

const REELS: Reel[] = [
  reel('v5-reklama', 'Den Haag draagt', null),
  reel('v5-collectie', 'De collectie', null),
  reel('joey-gold', 'FCDH Gold', '26'),
  reel('v5-romy', 'Romy', '25'),
  reel('joey-keizer', 'De Keizer', '28'),
  reel('v5-duo', 'Joey & Romy', null),
  ...OLD_CLIPS.map((c) => ({ ...video(c.src), title: c.title, productId: c.productId })),
];

const Clips = () => {
  const { lang } = useStore();
  const u = ui(lang);
  return (
    <section className="overflow-hidden bg-black px-4 py-20 text-white md:px-8 md:py-32">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-10 flex flex-col justify-between gap-4 md:mb-16 md:flex-row md:items-end">
          <h2 className="font-banner text-[18vw] md:text-[10rem]">{u.onTheStreet}</h2>
          <p className="max-w-xs text-lg text-white/70 md:text-right">{u.onTheStreetLead}</p>
        </div>
        <ReelCoverflow reels={REELS} />
      </div>
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

export const Home = ({ products }: { products: Product[] }) => {
  const story = products.find((p) => p.id === '17' && p.cutout);
  return (
    <>
      <HeroScene products={products} />
      <HetRaam products={products} />
      {story && <Story product={story} />}
      <AvailableNow products={products} />
      <Bohaterowie />
      <Stats products={products} />
      <CollectionOrbit products={products} />
      <NextDrop products={products} />
      <Manifesto />
      <DollyZoom />
      <Clips />
    </>
  );
};
