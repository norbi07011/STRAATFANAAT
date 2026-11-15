import React from 'react';
import { motion } from 'motion/react';
import { PRODUCTS } from '../constants';
import { eur, ui } from '../lib/i18n';
import { useStore } from '../site/store';
import { NavLink } from '../site/nav';
import { Reveal } from '../site/ui';
import { GalleryCard } from '../site/GalleryCard';

/*
  Lookbook: zdjęcia z ulicy (Joey, Romy i ekipa 070 w Hadze), nie makiety produktów.
  Układ gazetowy w kolumnach, każde zdjęcie prowadzi do koszulki, którą widać w kadrze.
*/

const EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

type Shot = { src: string; who: string; place: string; productId: string | null };

const SHOTS: Shot[] = [
  { src: '/images/bohaterowie/joey-haag-back-toren.webp', who: 'Joey', place: 'Haagse Toren', productId: '17' },
  { src: '/images/duo/k02-black-trench-keizer-passage.webp', who: 'Romy', place: 'De Passage', productId: '28' },
  { src: '/images/bohaterowie/crew-haag-back-centraal.webp', who: '070 crew', place: 'Den Haag Centraal', productId: '17' },
  { src: '/images/duo/j-joey-keizer-haagse-toren.webp', who: 'Joey', place: 'Haagse Toren', productId: '28' },
  { src: '/images/bohaterowie/joey-fcdh-gold-scheveningen.webp', who: 'Joey', place: 'Scheveningen', productId: '26' },
  { src: '/images/duo/industrial-keizer-laakhaven.webp', who: 'Joey', place: 'Laakhaven', productId: '28' },
  { src: '/images/bohaterowie/crew-de-keizer-scheveningen.webp', who: '070 crew', place: 'Pier, Scheveningen', productId: '28' },
  { src: '/images/duo/k-romy-plecy-tron.webp', who: 'Romy', place: 'Den Haag', productId: '28' },
  { src: '/images/bohaterowie/joey-de-keizer-plein.webp', who: 'Joey', place: 'Plein', productId: '28' },
  { src: '/images/duo/d02-duo-fcdh-tyl-schilderswijk.webp', who: 'Joey & Romy', place: 'Schilderswijk', productId: null },
  { src: '/images/bohaterowie/joey-fcdh-soul-neon.webp', who: 'Joey', place: 'Lange Voorhout', productId: '24' },
  { src: '/images/duo/joey-elegancki-keizer-lange-voorhout.webp', who: 'Joey', place: 'Lange Voorhout', productId: '28' },
  { src: '/images/bohaterowie/crew-haag-back-passage.webp', who: '070 crew', place: 'De Passage', productId: '17' },
  { src: '/images/duo/j-joey-keizer-centraal.webp', who: 'Joey', place: 'Den Haag Centraal', productId: '28' },
  { src: '/images/duo/m14-plecy-tron-haga.webp', who: 'Joey', place: 'Den Haag', productId: '28' },
  { src: '/images/duo/j-joey-keizer-tramlijn.webp', who: 'Joey', place: 'Tramlijn', productId: '28' },
];

const HERO = '/images/bohaterowie/joey-de-keizer-plein.webp';

const LookFigure = ({ s }: { s: Shot }) => {
  const { lang } = useStore();
  const u = ui(lang);
  const product = s.productId ? PRODUCTS.find((p) => p.id === s.productId) ?? null : null;
  const img = (
    <div className="relative overflow-hidden bg-ink-2">
      <img
        src={s.src}
        alt={`${s.who}${product ? ` in ${product.name}` : ''}, ${s.place}, Den Haag`}
        loading="lazy"
        decoding="async"
        className="w-full transition-transform duration-[1.2s] ease-out-expo group-hover:scale-[1.03]"
      />
    </div>
  );
  return (
    <figure className="group mb-8 break-inside-avoid md:mb-12">
      {product ? (
        <NavLink page="product" id={product.id} aria-label={`${u.cView}: ${product.name}`} data-cursor={u.cView} className="block">
          {img}
        </NavLink>
      ) : (
        img
      )}
      <figcaption className="mt-3 flex items-baseline justify-between gap-4 text-sm">
        <span className="text-white/60">
          {s.who} · {s.place}
        </span>
        {product && (
          <NavLink page="product" id={product.id} className="shrink-0 font-semibold text-white underline decoration-white/25 underline-offset-4 hover:text-haag-yellow hover:decoration-haag-yellow">
            {product.name} · {eur(product.price, lang)}
          </NavLink>
        )}
      </figcaption>
    </figure>
  );
};

export const Lookbook = () => {
  const { lang } = useStore();
  const u = ui(lang);

  return (
    <div className="bg-black text-white">
      {/* HERO: tytuł po lewej, wysokie zdjęcie po prawej */}
      <section className="mx-auto grid max-w-[1600px] gap-8 px-4 pt-28 md:min-h-[100svh] md:grid-cols-12 md:items-end md:gap-8 md:px-8 md:pt-24">
        <div className="pb-2 md:col-span-6 md:pb-16">
          <motion.h1
            className="sf-h2"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: EXPO, delay: 0.1 }}
          >
            Lookbook
          </motion.h1>
          <motion.p
            className="mt-5 max-w-md text-xl text-white/75 md:text-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.45 }}
          >
            {u.lbLead}
          </motion.p>
        </div>
        <motion.div
          className="relative overflow-hidden bg-ink-2 md:col-span-5 md:col-start-8 md:h-[86svh]"
          initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
          animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1], delay: 0.1 }}
        >
          <span aria-hidden className="absolute inset-x-8 top-0 z-10 h-px bg-gradient-to-r from-transparent via-gold to-transparent opacity-70" />
          <img src={HERO} alt="Joey in DE KEIZER, Plein, Den Haag" className="aspect-[4/5] h-full w-full object-cover object-top md:aspect-auto" />
        </motion.div>
      </section>

      {/* ZDJĘCIA */}
      <section className="px-4 py-16 md:px-8 md:py-28">
        <div className="mx-auto max-w-[1600px] columns-2 gap-4 md:gap-8 lg:columns-3">
          {SHOTS.filter((s) => s.src !== HERO).map((s) => (
            <LookFigure key={s.src} s={s} />
          ))}
        </div>
      </section>

      {/* KOLEKCJA */}
      <section className="bg-ink px-4 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-[1600px]">
          <div className="mb-10 flex flex-col justify-between gap-5 md:mb-14 md:flex-row md:items-end">
            <h2 className="sf-h2">{u.orbitTitle}</h2>
            <NavLink page="shop" className="font-semibold text-white underline decoration-gold decoration-2 underline-offset-[6px] hover:text-haag-yellow">
              {u.shopDrop}
            </NavLink>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4">
            {PRODUCTS.map((p) => (
              <GalleryCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
