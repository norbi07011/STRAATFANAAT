import React from 'react';
import { motion } from 'motion/react';
import { TRANSLATIONS } from '../constants';
import { ui } from '../lib/i18n';
import { useStore } from '../site/store';
import { useNav } from '../site/nav';
import { Btn, Reveal } from '../site/ui';

const EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];
const INSTAGRAM = 'https://www.instagram.com/straatfanat/';

type Fact = { t: string; d: string };
const COPY: Record<string, { lead: string; story: string[]; factsTitle: string; facts: Fact[]; shop: string; follow: string }> = {
  NL: {
    lead: 'Streetwear uit Den Haag, gemaakt door mensen uit de stad.',
    story: [
      'STRAATFANAAT is begonnen in Den Haag met één simpel probleem. Als fan van 070 had je weinig keus: officiële merch, of hetzelfde shirt dat in elke winkelstraat hangt.',
      'Dus maken we het zelf. We tekenen elke print, laten kleine series naaien en verkopen ze aan mensen die de stad net zo dragen als wij.',
    ],
    factsTitle: 'Zo werken we',
    facts: [
      { t: 'Eigen ontwerp', d: 'Elke print begint als schets bij ons. De ooievaar, 1905, groen en geel: het komt uit de stad.' },
      { t: 'Kleine series', d: 'We maken weinig stuks per model. De eerste serie DE KEIZER telt 60 shirts.' },
      { t: 'Eigen atelier', d: 'De shirts worden genaaid in ons eigen atelier. Zo houden we stof, print en pasvorm zelf in de hand.' },
      { t: 'Bestellen bij mensen', d: 'Bestellen gaat nu via DM op Instagram. Je krijgt antwoord van ons en een betaallink. We sturen met PostNL of je haalt op in Den Haag.' },
    ],
    shop: 'Bekijk de shirts',
    follow: 'Volg @straatfanat',
  },
  EN: {
    lead: 'Streetwear from The Hague, made by people from the city.',
    story: [
      'STRAATFANAAT started in The Hague with one simple problem. As a fan from 070 you had little choice: official merch, or the same shirt that hangs in every high street.',
      'So we make it ourselves. We draw every print, have small runs sewn and sell them to people who wear the city the way we do.',
    ],
    factsTitle: 'How we work',
    facts: [
      { t: 'Our own design', d: 'Every print starts as a sketch with us. The stork, 1905, green and yellow: it comes from the city.' },
      { t: 'Small runs', d: 'We make few pieces per model. The first run of DE KEIZER is 60 shirts.' },
      { t: 'Our own workshop', d: 'The shirts are sewn in our own workshop. That keeps fabric, print and fit in our hands.' },
      { t: 'Ordering from people', d: 'For now you order via Instagram DM. You get an answer from us and a payment link. We ship with PostNL or you pick up in The Hague.' },
    ],
    shop: 'See the shirts',
    follow: 'Follow @straatfanat',
  },
  PL: {
    lead: 'Streetwear z Hagi, robiony przez ludzi z miasta.',
    story: [
      'STRAATFANAAT zaczął się w Hadze od jednego prostego problemu. Kibic z 070 miał mały wybór: oficjalny merch albo ta sama koszulka, która wisi w każdej sieciówce.',
      'Więc robimy to sami. Rysujemy każdy nadruk, szyjemy małe serie i sprzedajemy je ludziom, którzy noszą miasto tak jak my.',
    ],
    factsTitle: 'Tak pracujemy',
    facts: [
      { t: 'Własny projekt', d: 'Każdy nadruk zaczyna się u nas od szkicu. Bocian, 1905, zieleń i żółć: to wszystko jest z miasta.' },
      { t: 'Małe serie', d: 'Robimy mało sztuk każdego modelu. Pierwsza seria DE KEIZER to 60 koszulek.' },
      { t: 'Własna szwalnia', d: 'Koszulki szyjemy we własnej szwalni. Dzięki temu sami pilnujemy materiału, nadruku i kroju.' },
      { t: 'Zamawiasz u ludzi', d: 'Na razie zamawiasz przez DM na Instagramie. Odpisujemy sami i wysyłamy link do płatności. Paczka idzie PostNL albo odbierasz w Hadze.' },
    ],
    shop: 'Zobacz koszulki',
    follow: 'Obserwuj @straatfanat',
  },
};

export const About = () => {
  const { lang } = useStore();
  const { navigate } = useNav();
  const t = TRANSLATIONS[lang];
  const c = COPY[lang] ?? COPY.NL;

  return (
    <div className="bg-black text-white">
      {/* HERO: ekipa na Den Haag Centraal, tytuł u dołu */}
      <section className="relative flex min-h-[92svh] flex-col justify-end overflow-hidden px-4 pb-12 pt-28 md:px-8 md:pb-16">
        <motion.img
          src="/images/bohaterowie/crew-haag-back-centraal.webp"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover object-[50%_30%]"
          initial={{ scale: 1.08, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.6, ease: EXPO }}
        />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_top,#000_4%,rgba(0,0,0,0.55)_42%,rgba(0,0,0,0.35)_100%)]" />
        <div className="relative mx-auto w-full max-w-[1600px]">
          <motion.h1
            className="sf-h2 max-w-[14ch]"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: EXPO, delay: 0.15 }}
          >
            {t.manifesto_title}
          </motion.h1>
          <motion.p
            className="mt-5 max-w-xl text-xl text-white/80 md:text-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            {c.lead}
          </motion.p>
        </div>
      </section>

      {/* HISTORIA */}
      <section className="px-4 py-20 md:px-8 md:py-32">
        <div className="mx-auto grid max-w-[1600px] gap-10 md:grid-cols-12 md:items-center md:gap-8">
          <Reveal className="md:col-span-5">
            <div className="relative overflow-hidden bg-ink-2">
              <span aria-hidden className="absolute inset-x-8 top-0 z-10 h-px bg-gradient-to-r from-transparent via-gold to-transparent opacity-70" />
              <img src="/images/duo/j-joey-keizer-tramlijn.webp" alt="Joey in DE KEIZER, Den Haag" loading="lazy" decoding="async" className="aspect-[4/5] w-full object-cover" />
            </div>
          </Reveal>
          <div className="md:col-span-6 md:col-start-7">
            {c.story.map((p, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <p className={`max-w-[58ch] text-pretty ${i === 0 ? 'text-2xl leading-snug text-white md:text-[2rem] md:leading-[1.25]' : 'mt-8 text-lg leading-relaxed text-white/70 md:text-xl'}`}>{p}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TAK PRACUJEMY */}
      <section className="bg-ink px-4 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-[1600px]">
          <h2 className="sf-h2 mb-10 md:mb-14">{c.factsTitle}</h2>
          <dl className="border-t border-white/12">
            {c.facts.map((f, i) => (
              <Reveal key={f.t} delay={i * 0.05}>
                <div className="grid gap-2 border-b border-white/12 py-7 md:grid-cols-12 md:items-baseline md:gap-8 md:py-9">
                  <dt className="font-narrow text-2xl font-bold md:col-span-4 md:text-3xl">{f.t}</dt>
                  <dd className="max-w-[62ch] text-lg leading-relaxed text-white/70 md:col-span-7 md:col-start-6">{f.d}</dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* ZAMKNIĘCIE */}
      <section className="px-4 py-24 md:px-8 md:py-36">
        <div className="mx-auto flex max-w-[1600px] flex-col items-start gap-10">
          <p className="sf-h2 max-w-[18ch] text-haag-yellow">
            {t.culture_manifesto_head} {t.culture_manifesto_sub}
          </p>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <Btn variant="yellow" onClick={() => navigate('shop')}>
              {c.shop}
            </Btn>
            <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" className="font-semibold text-white underline decoration-gold decoration-2 underline-offset-[6px] hover:text-haag-yellow">
              {c.follow}
            </a>
          </div>
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
