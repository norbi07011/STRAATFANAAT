import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Product } from '../types';
import { eur, ui } from '../lib/i18n';
import { useStore } from './store';
import { NavLink, useNav } from './nav';
import { Btn } from './ui';
import { isAvailable } from './ProductCard';

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

export const HeroNow = ({ products }: { products: Product[] }) => {
  const { lang } = useStore();
  const { navigate } = useNav();
  const u = ui(lang);
  const reduce = useReducedMotion();
  const items = products.filter(isAvailable);
  const loop = reduce ? items : [...items, ...items, ...items];

  return (
    <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden bg-black text-white">
      {/* ten sam pokój z deszczem co w scenie Joeya niżej: okładka płynnie przechodzi w animację */}
      <motion.div
        aria-hidden
        className="absolute inset-0"
        initial={{ scale: 1.08, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.8, ease: EXPO }}
      >
        <picture>
          <source media="(max-aspect-ratio: 4/5)" srcSet="/het-raam/pokoj-m.webp" />
          <img src="/het-raam/pokoj-d.webp" alt="" fetchPriority="high" className="h-full w-full object-cover object-[50%_45%]" />
        </picture>
      </motion.div>
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_top,#000_0%,rgba(0,0,0,0.6)_28%,rgba(0,0,0,0.05)_60%,rgba(0,0,0,0.45)_100%)]" />

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
    </section>
  );
};
