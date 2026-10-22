import React from 'react';
import { motion } from 'motion/react';
import { TRANSLATIONS } from '../constants';
import { ui } from '../lib/i18n';
import { useStore } from '../site/store';
import { useNav } from '../site/nav';
import { Btn, Marquee, Pic, Reveal } from '../site/ui';

export const About = () => {
  const { lang } = useStore();
  const { navigate } = useNav();
  const t = TRANSLATIONS[lang];
  const u = ui(lang);

  const pillars = [
    { title: t.pillar_auth_title, desc: t.pillar_auth_desc },
    { title: t.pillar_innov_title, desc: t.pillar_innov_desc },
    { title: t.pillar_comm_title, desc: t.pillar_comm_desc },
  ];

  return (
    <div className="bg-black text-white">
      <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden px-4 pb-12 pt-28 md:px-8 md:pb-16">
        <div aria-hidden className="absolute right-[-10%] top-1/2 w-[80vw] max-w-[760px] -translate-y-1/2 opacity-25 md:right-0 md:w-[45vw] md:opacity-60">
          <motion.img
            src="/images/opt/logo-800.webp"
            alt=""
            className="w-full"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
        <div className="relative mx-auto w-full max-w-[1600px]">
          <motion.h1
            className="font-banner text-[26vw] leading-[0.8] md:text-[17rem]"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          >
            {t.brand_story}
          </motion.h1>
          <motion.p
            className="mt-6 max-w-xl text-xl md:text-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {u.tagline}
          </motion.p>
        </div>
      </section>

      <div className="bg-haag-yellow py-3 text-black">
        <Marquee className="font-banner text-3xl md:text-4xl" items={[t.no_boundaries, t.join_revolution, 'Den Haag', t.no_boundaries, t.join_revolution, 'Den Haag']} />
      </div>

      <section className="bg-paper px-4 py-20 text-black md:px-8 md:py-32">
        <div className="mx-auto grid max-w-[1600px] gap-12 md:grid-cols-12">
          <div className="md:col-span-7">
            <h2 className="font-banner text-[15vw] md:text-[8rem]">{t.manifesto_title}</h2>
          </div>
          <div className="flex flex-col gap-8 md:col-span-4 md:col-start-9 md:pt-4">
            <p className="text-xl leading-relaxed">{t.manifesto_desc}</p>
            <Pic src="/images/metki%20ubran.jpeg" alt="STRAATFANAAT labels" sizes="(min-width: 768px) 33vw, 100vw" className="w-full" />
          </div>
        </div>
      </section>

      <section className="px-4 py-20 md:px-8 md:py-32">
        <div className="mx-auto max-w-[1600px] border-t-2 border-white">
          {pillars.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.05}>
              <div className="group relative grid gap-4 overflow-hidden border-b-2 border-white py-10 md:grid-cols-12 md:items-end md:py-14">
                <span
                  aria-hidden
                  className="absolute inset-0 origin-bottom scale-y-0 bg-haag-yellow transition-transform duration-700 ease-out-expo group-hover:scale-y-100"
                />
                <h3 className="font-banner relative text-[16vw] transition-colors duration-500 group-hover:text-black md:col-span-7 md:text-[9rem]">{p.title}</h3>
                <p className="relative max-w-md text-lg text-white/75 transition-colors duration-500 group-hover:text-black md:col-span-4 md:col-start-9">{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden px-4 pb-24 pt-8 md:px-8 md:pb-32">
        <div className="mx-auto flex max-w-[1600px] flex-col items-start gap-10">
          <h2 className="font-banner text-[14vw] text-haag-yellow md:text-[10rem]">{t.born_in}</h2>
          <Btn variant="yellow" onClick={() => navigate('shop')}>
            {t.join_family}
          </Btn>
        </div>
      </section>
    </div>
  );
};

export const NotFound = () => {
  const { lang } = useStore();
  const { navigate } = useNav();
  const u = ui(lang);
  return (
    <div className="flex min-h-screen flex-col justify-center gap-8 bg-paper px-4 pt-20 md:px-8">
      <div className="mx-auto w-full max-w-[1600px]">
        <p className="font-banner text-[40vw] leading-[0.8] text-haag-green md:text-[22rem]">404</p>
        <h1 className="font-banner mt-4 text-6xl md:text-8xl">{u.notFoundTitle}</h1>
        <p className="mt-4 max-w-md text-lg">{u.notFoundText}</p>
        <Btn variant="black" className="mt-8" onClick={() => navigate('shop')}>
          {u.backToShop}
        </Btn>
      </div>
    </div>
  );
};
