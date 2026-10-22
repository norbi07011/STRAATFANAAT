import React, { useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { ui } from '../lib/i18n';
import { useStore } from '../site/store';
import { NavLink, useNav } from '../site/nav';
import { Btn, Pic } from '../site/ui';

type Filter = 'all' | 'classic' | 'graphic' | 'women';

const LOOKS: { title: string; subtitle: string; image: string; filter: Exclude<Filter, 'all'>; productId: string }[] = [
  { title: 'Straatfanaat Classic', subtitle: 'Signature collection', image: '/images/straatfanaat.jpg', filter: 'classic', productId: '1' },
  { title: 'Omerta Black', subtitle: 'Code of silence', image: '/images/omerta%20(1).jpg', filter: 'graphic', productId: '2' },
  { title: 'FC Den Haag Back', subtitle: 'Die Hard', image: '/images/fc%20den%20haag%20%20back%202.jpeg', filter: 'classic', productId: '17' },
  { title: 'Omerta White', subtitle: 'Contrast edition', image: '/images/bia%C5%82a%20omerta.jpg', filter: 'graphic', productId: '3' },
  { title: 'FCDH Pink', subtitle: 'For her', image: '/images/damska%20fcdh%20r%C3%B3zowy%201.jpeg', filter: 'women', productId: '13' },
  { title: 'Bocian Limited', subtitle: 'Polish heritage', image: '/images/bocian%20(1).jpg', filter: 'graphic', productId: '6' },
  { title: 'Savage Omerta', subtitle: 'Deadly silence', image: '/images/savage%20omerta1.jpeg', filter: 'graphic', productId: '8' },
  { title: 'FCDH Black', subtitle: 'From City, Die Hard', image: '/images/fcdh%20blak%20(1).jpg', filter: 'classic', productId: '4' },
  { title: 'Kolekcja dla niej', subtitle: 'Exclusive women', image: '/images/kolekcja%20dla%20niej%20dla%20niego%20damska%20.jpeg', filter: 'women', productId: '14' },
  { title: 'Champion Street', subtitle: 'Winner mentality', image: '/images/champion.jpg', filter: 'classic', productId: '7' },
  { title: 'FCDH White', subtitle: 'Pure energy', image: '/images/bia%C5%82a%20fcdh%20(1).jpg', filter: 'classic', productId: '5' },
  { title: 'Straatfanaat Strit', subtitle: 'Pure street life', image: '/images/straatfanaat%20strit1.jpeg', filter: 'classic', productId: '10' },
  { title: 'Herb Street', subtitle: 'Nature meets city', image: '/images/herb1.jpeg', filter: 'graphic', productId: '11' },
  { title: 'Kolekcja dla niego', subtitle: 'Exclusive men', image: '/images/kolekcja%20dla%20niego%20dla%20niej%20sesia%20.jpeg', filter: 'classic', productId: '15' },
  { title: 'Czapka Hooligan', subtitle: 'Accessories', image: '/images/czapka.jpeg', filter: 'classic', productId: '16' },
  { title: 'DH Miasto', subtitle: 'Die Hard urban', image: '/images/DH%20miasto%20podglad.jpeg', filter: 'graphic', productId: '12' },
];

export const Lookbook = () => {
  const { lang } = useStore();
  const { navigate } = useNav();
  const u = ui(lang);
  const [filter, setFilter] = useState<Filter>('all');
  const heroRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '25%']);
  const titleX = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '-20%']);

  const filters: { id: Filter; label: string }[] = [
    { id: 'all', label: u.allItems },
    { id: 'classic', label: 'Classic' },
    { id: 'graphic', label: 'Graphic' },
    { id: 'women', label: u.women },
  ];
  const looks = LOOKS.filter((l) => filter === 'all' || l.filter === filter);

  return (
    <div className="bg-black text-white">
      <section ref={heroRef} className="relative h-[100svh] min-h-[600px] overflow-hidden">
        <motion.div style={{ y: imgY }} className="absolute inset-0">
          <Pic src="/images/kolekcja%20dla%20niego%20dla%20niej%20sesia2.jpeg" alt="STRAATFANAAT lookbook" eager large sizes="100vw" className="h-full w-full object-cover object-[50%_30%] brightness-75" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        <motion.h1
          style={{ x: titleX }}
          className="font-banner absolute bottom-6 left-0 whitespace-nowrap px-4 text-[34vw] leading-[0.78] text-haag-yellow md:bottom-10 md:px-8 md:text-[26vw]"
          initial={{ y: '40%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        >
          Lookbook
        </motion.h1>
      </section>

      <section className="px-4 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1600px]">
          <div className="mb-10 flex flex-wrap gap-2" role="tablist">
            {filters.map((f) => (
              <button key={f.id} role="tab" aria-selected={filter === f.id} onClick={() => setFilter(f.id)} className="relative px-4 py-2 text-[15px] font-semibold">
                {filter === f.id && <motion.span layoutId="lb-filter" className="absolute inset-0 bg-haag-yellow" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
                <span className={`relative ${filter === f.id ? 'text-black' : ''}`}>{f.label}</span>
              </button>
            ))}
          </div>

          <div key={filter} className="columns-2 gap-4 md:columns-3 md:gap-6">
              {looks.map((l, i) => (
                <motion.div
                  key={l.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-5% 0px' }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: (i % 3) * 0.06 }}
                  className="mb-4 break-inside-avoid md:mb-6"
                >
                  <NavLink page="product" id={l.productId} className="group block">
                    <div className={`relative overflow-hidden bg-asphalt ${i % 4 === 1 ? 'aspect-[3/4]' : 'aspect-[2/3]'}`}>
                      <Pic src={l.image} alt={l.title} sizes="(min-width: 768px) 33vw, 50vw" className="h-full w-full object-cover transition-transform duration-[1.4s] ease-out-expo group-hover:scale-[1.06]" />
                      <div className="absolute inset-x-0 bottom-0 translate-y-full bg-haag-yellow p-3 text-black transition-transform duration-500 ease-out-expo group-hover:translate-y-0">
                        <span className="text-sm font-semibold">{u.shopDrop}</span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-baseline justify-between gap-3">
                      <span className="font-narrow text-lg font-bold">{l.title}</span>
                      <span className="text-sm text-white/55">{l.subtitle}</span>
                    </div>
                  </NavLink>
                </motion.div>
              ))}
          </div>
        </div>
      </section>

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
            <Pic src="/images/kolekcja%20dla%20niego%20dla%20niej%20sesia%20.jpeg" alt="" sizes="25vw" className="aspect-[2/3] w-full object-cover" />
            <Pic src="/images/kolekcja%20dla%20niej%20dla%20niego%20damska%20.jpeg" alt="" sizes="25vw" className="mt-16 aspect-[2/3] w-full object-cover" />
          </div>
        </div>
      </section>
    </div>
  );
};
