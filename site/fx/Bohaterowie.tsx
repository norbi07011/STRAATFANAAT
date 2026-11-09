import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useStore } from '../store';
import { NavLink } from '../nav';
import { DragRail } from './DragRail';

/* Najlepsze zdjęcia naszych bohaterów (Joey i ekipa 070), wybrane i sprawdzone w zbliżeniu (2026-11-09). */

type Shot = { src: string; who: string; model: string; productId: string | null; place: string; tall: boolean };

const SHOTS: Shot[] = [
  { src: '/images/bohaterowie/joey-haag-back-toren.webp', who: 'Joey', model: 'HAAG Back!', productId: '17', place: 'Haagse Toren', tall: true },
  { src: '/images/bohaterowie/crew-haag-back-centraal.webp', who: '070 crew', model: 'HAAG Back!', productId: '17', place: 'Den Haag Centraal', tall: false },
  { src: '/images/bohaterowie/joey-fcdh-gold-scheveningen.webp', who: 'Joey', model: 'FCDH Gold 1905', productId: '26', place: 'Scheveningen', tall: true },
  { src: '/images/bohaterowie/joey-de-keizer-plein.webp', who: 'Joey', model: 'De Keizer', productId: '28', place: 'Plein', tall: true },
  { src: '/images/bohaterowie/crew-de-keizer-scheveningen.webp', who: '070 crew', model: 'De Keizer', productId: '28', place: 'Pier, Scheveningen', tall: false },
  { src: '/images/bohaterowie/joey-fcdh-soul-neon.webp', who: 'Joey', model: 'FCDH Soul Neon', productId: '24', place: 'Lange Voorhout', tall: true },
  { src: '/images/bohaterowie/crew-haag-back-passage.webp', who: '070 crew', model: 'HAAG Back!', productId: '17', place: 'De Passage', tall: false },
  { src: '/images/bohaterowie/joey-straatfanaat-script.webp', who: 'Joey', model: 'Straatfanaat', productId: null, place: 'Lange Voorhout', tall: true },
];

const COPY: Record<string, { title: string; lead: string; drag: string; view: string }> = {
  NL: { title: '070 in beeld', lead: 'Joey en de crew in onze shirts, op plekken die elke Hagenaar kent.', drag: 'Sleep', view: 'Bekijk shirt' },
  EN: { title: '070 in frame', lead: 'Joey and the crew in our shirts, in places every Hagenaar knows.', drag: 'Drag', view: 'View shirt' },
  PL: { title: '070 w kadrze', lead: 'Joey i ekipa w naszych koszulkach, w miejscach, które zna każdy z Hagi.', drag: 'Przeciągnij', view: 'Zobacz koszulkę' },
};

const Card = ({ s, i, view }: { s: Shot; i: number; view: string }) => (
  <motion.figure
    initial={{ opacity: 0, y: 60, rotate: i % 2 ? 2 : -2 }}
    whileInView={{ opacity: 1, y: 0, rotate: 0 }}
    viewport={{ once: true, margin: '-10% 0px' }}
    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: (i % 4) * 0.07 }}
    className={`group relative shrink-0 overflow-hidden bg-asphalt ${s.tall ? 'aspect-[9/16]' : 'aspect-[4/5]'} h-[62svh] max-h-[640px] min-h-[380px]`}
  >
    <img
      src={s.src}
      alt={`${s.who} in ${s.model}, ${s.place}`}
      loading="lazy"
      draggable={false}
      className="h-full w-full object-cover transition-transform duration-[1.2s] ease-out-expo group-hover:scale-[1.06]"
    />
    <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/0 to-transparent" />
    <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 md:p-5">
      <span>
        <span className="block text-[11px] font-bold uppercase tracking-[0.25em] text-haag-yellow">{s.who} · {s.place}</span>
        <span className="font-banner block text-3xl leading-none md:text-4xl">{s.model}</span>
      </span>
      {s.productId && (
        <NavLink page="product" id={s.productId} className="shrink-0 border-b-2 border-white pb-0.5 text-sm font-bold opacity-0 transition-opacity duration-300 hover:border-haag-yellow hover:text-haag-yellow group-hover:opacity-100 max-md:opacity-100">
          {view}
        </NavLink>
      )}
    </figcaption>
  </motion.figure>
);

export const Bohaterowie = () => {
  const { lang } = useStore();
  const c = COPY[lang] ?? COPY.NL;
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const titleX = useTransform(scrollYProgress, [0, 1], ['6%', '-12%']);

  return (
    <section ref={ref} className="overflow-hidden bg-black py-20 text-white md:py-32">
      <div className="mx-auto mb-10 max-w-[1600px] px-4 md:mb-14 md:px-8">
        <motion.h2 style={{ x: titleX }} className="font-banner whitespace-nowrap text-[20vw] leading-[0.85] md:text-[12rem]">
          {c.title}
        </motion.h2>
        <p className="mt-6 max-w-md text-lg text-white/70">{c.lead}</p>
      </div>
      <div className="px-4 md:px-8">
        <DragRail cursor={c.drag} dark>
          {SHOTS.map((s, i) => (
            <Card key={s.src} s={s} i={i} view={c.view} />
          ))}
        </DragRail>
      </div>
    </section>
  );
};
