import React, { useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { PRODUCTS } from '../constants';
import { eur, ui } from '../lib/i18n';
import { img, srcSet } from '../lib/media';
import { Chapter, Look, LOOKS } from '../lib/looks';
import { useStore } from '../site/store';
import { useNav } from '../site/nav';
import { Btn, Pic } from '../site/ui';
import { Coverflow } from '../site/fx/Coverflow';
import { ExploreWall } from '../site/fx/ExploreWall';
import { useMouseParallax } from '../site/fx/tilt';
import { LookViewer } from '../site/LookViewer';
import { VelocityMarquee } from '../site/fx/scroll';

const EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

/* ---------- Kafel looku: odsłonięcie maską przy scrollu + hotspot „shop the look” ---------- */

const LookTile = ({ look, big, onOpen }: { look: Look; big: boolean; onOpen: () => void }) => {
  const { lang } = useStore();
  const u = ui(lang);
  const reduce = useReducedMotion();
  const product = PRODUCTS.find((p) => p.id === look.productId)!;
  const [tip, setTip] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['-6%', '6%']);

  return (
    <motion.div
      ref={ref}
      className="group relative"
      initial={reduce ? false : { clipPath: 'inset(100% 0% 0% 0%)' }}
      whileInView={{ clipPath: 'inset(0% 0% 0% 0%)' }}
      viewport={{ once: true, margin: '-12% 0px' }}
      transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
    >
      <button onClick={onOpen} className="relative block aspect-[4/5] w-full overflow-hidden bg-asphalt" data-cursor={u.cView} aria-label={`${u.shopLook}: ${product.name}`}>
        <motion.div style={{ y }} className="absolute -inset-y-[7%] inset-x-0">
          <motion.img
            layoutId={`look-${look.id}`}
            src={img(look.image, big ? 1600 : 800)}
            srcSet={srcSet(look.image)}
            sizes={big ? '(min-width: 768px) 60vw, 100vw' : '(min-width: 768px) 30vw, 50vw'}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-[filter,transform] duration-[1.2s] ease-out-expo group-hover:scale-[1.04] group-hover:saturate-[1.15]"
          />
        </motion.div>
      </button>

      {/* hotspot na nadruku */}
      <div className="absolute z-10 -translate-x-1/2 -translate-y-1/2" style={{ left: `${look.hotspot.x}%`, top: `${look.hotspot.y}%` }}>
        <button
          onClick={onOpen}
          onPointerEnter={() => setTip(true)}
          onPointerLeave={() => setTip(false)}
          onFocus={() => setTip(true)}
          onBlur={() => setTip(false)}
          className="relative flex h-9 w-9 items-center justify-center"
          aria-label={`${product.name}, ${eur(product.price, lang)}`}
        >
          <span className="absolute inset-0 animate-ping rounded-full bg-haag-yellow/60" />
          <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-haag-yellow text-lg font-black leading-none text-black shadow-lg">+</span>
        </button>
        <AnimatePresence>
          {tip && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-none absolute bottom-11 left-1/2 flex w-56 -translate-x-1/2 items-center gap-3 bg-paper p-2 text-black shadow-2xl"
            >
              <img src={img(product.image)} alt="" className="h-14 w-11 object-cover" />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{product.name}</p>
                <p className="text-sm tabular-nums">{eur(product.price, lang)}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-2 flex items-baseline justify-between gap-3 text-sm">
        <span className="font-narrow font-bold text-white">{product.name}</span>
        <span className="tabular-nums text-white/55">{eur(product.price, lang)}</span>
      </div>
    </motion.div>
  );
};

/* ---------- Rozdział: przyklejony tytuł + redakcyjna siatka ---------- */

const ChapterBlock = ({ chapter, onOpen }: { chapter: Chapter; onOpen: (look: Look) => void }) => {
  const { lang } = useStore();
  const u = ui(lang);
  const looks = LOOKS.filter((l) => l.chapter === chapter);
  const [title, lead] = u.chapters[chapter];
  return (
    <section className="border-t border-white/15 px-4 py-16 md:px-8 md:py-28">
      <div className="mx-auto grid max-w-[1600px] gap-10 md:grid-cols-12">
        <div className="md:col-span-4">
          <div className="md:sticky md:top-28">
            <motion.h2
              className="font-banner text-[22vw] leading-[0.8] text-haag-yellow md:text-[9rem]"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: EXPO }}
            >
              {title}
            </motion.h2>
            <p className="mt-4 max-w-xs text-lg text-white/75">{lead}</p>
            <p className="mt-6 font-banner text-4xl tabular-nums text-white/40">{String(looks.length).padStart(2, '0')} looks</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:col-span-8 md:gap-x-6 md:gap-y-16">
          {looks.map((l, i) => {
            const big = i % 3 === 0;
            return (
              <div key={l.id} className={big ? 'col-span-2' : i % 3 === 2 ? 'md:mt-28' : ''}>
                <LookTile look={l} big={big} onOpen={() => onOpen(l)} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

/* ---------- Strona ---------- */

export const Lookbook = () => {
  const { lang } = useStore();
  const { navigate } = useNav();
  const u = ui(lang);
  const reduce = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '25%']);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.05, reduce ? 1.05 : 1.2]);
  const titleX = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '-25%']);
  const { x: mx, y: my, bind } = useMouseParallax();
  const px = useTransform(mx, [-1, 1], ['-1.5%', '1.5%']);
  const py = useTransform(my, [-1, 1], ['-1.5%', '1.5%']);
  const [viewer, setViewer] = useState<number | null>(null);
  const open = (look: Look) => setViewer(LOOKS.findIndex((l) => l.id === look.id));

  return (
    <div className="bg-black text-white">
      {/* HERO */}
      <section ref={heroRef} {...bind} className="relative h-[100svh] min-h-[620px] overflow-hidden">
        <motion.div style={{ y: imgY, scale: imgScale, x: px }} className="absolute inset-0">
          <motion.div style={{ y: py }} className="h-full w-full">
            <Pic src="/images/kolekcja%20dla%20niego%20dla%20niej%20sesia2.jpeg" alt="STRAATFANAAT lookbook" eager large sizes="100vw" className="h-full w-full object-cover object-[50%_30%] brightness-[0.7]" />
          </motion.div>
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-black/40" />
        <div className="absolute inset-x-0 bottom-0 px-4 pb-8 md:px-8 md:pb-12">
          <motion.p
            className="mb-4 max-w-md text-lg md:text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.6, ease: EXPO }}
          >
            {u.lbLead}
          </motion.p>
          <motion.h1
            style={{ x: titleX }}
            className="font-banner whitespace-nowrap text-[23vw] leading-[0.78] text-haag-yellow"
            initial={{ y: '30%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            transition={{ duration: 1.1, ease: EXPO, delay: 0.15 }}
          >
            Lookbook
          </motion.h1>
        </div>
      </section>

      <div className="bg-haag-yellow py-3 text-black">
        <VelocityMarquee className="font-banner text-2xl md:text-3xl" items={[u.chapters.classic[0], u.chapters.graphic[0], 'Den Haag', u.shopLook]} />
      </div>

      {/* ROZDZIAŁY */}
      <ChapterBlock chapter="classic" onOpen={open} />
      <ChapterBlock chapter="graphic" onOpen={open} />

      {/* ŚCIANA DO PRZECIĄGANIA */}
      <section className="border-t border-white/15 pt-16 md:pt-24">
        <div className="mx-auto mb-8 flex max-w-[1600px] flex-col justify-between gap-4 px-4 md:flex-row md:items-end md:px-8">
          <h2 className="font-banner text-[16vw] md:text-[8rem]">{u.exploreTitle}</h2>
          <p className="max-w-xs text-lg text-white/70 md:text-right">{u.exploreLead}</p>
        </div>
        <ExploreWall looks={LOOKS} onOpen={(i) => setViewer(i)} cursor={u.cDrag} />
      </section>

      {/* COVERFLOW */}
      <section className="overflow-hidden border-t border-white/15 px-4 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1600px]">
          <h2 className="font-banner mb-8 text-[16vw] md:text-[8rem]">Drop 2026</h2>
          <Coverflow products={PRODUCTS} />
        </div>
      </section>

      {/* DUO */}
      <section className="bg-haag-yellow px-4 py-20 text-black md:px-8 md:py-32">
        <div className="mx-auto grid max-w-[1600px] gap-10 md:grid-cols-12 md:items-center">
          <div className="md:col-span-5">
            <h2 className="font-banner text-[20vw] md:text-[9rem]">{u.duoTitle}</h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed">{u.duoText}</p>
            <div className="mt-8">
              <Btn variant="black" onClick={() => navigate('shop')}>
                {u.shopDrop}
              </Btn>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 md:col-span-6 md:col-start-7">
            <Pic src="/images/kolekcja%20dla%20niego%20dla%20niej%20sesia%20.jpeg" alt="" sizes="25vw" className="aspect-[4/5] w-full object-cover" />
            <Pic src="/images/kolekcja%20dla%20niej%20dla%20niego%20damska%20.jpeg" alt="" sizes="25vw" className="mt-16 aspect-[4/5] w-full object-cover" />
          </div>
        </div>
      </section>

      <AnimatePresence>
        {viewer !== null && <LookViewer looks={LOOKS} index={viewer} products={PRODUCTS} onIndex={setViewer} onClose={() => setViewer(null)} />}
      </AnimatePresence>
    </div>
  );
};
