import React, { useRef, useState } from 'react';
import { AnimatePresence, motion, MotionValue, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { Product } from '../types';
import { eur, ui } from '../lib/i18n';
import { useStore } from '../site/store';
import { NavLink, useNav } from '../site/nav';
import { Btn, Pic } from '../site/ui';
import { SmokeShader } from '../site/fx/SmokeShader';
import { Spotlights } from '../site/fx/Spotlights';
import { useMouseParallax } from '../site/fx/tilt';
import { CountUp, VelocityMarquee } from '../site/fx/scroll';
import { Orbit } from '../site/fx/Orbit';
import { flyToCart } from '../site/fx/flyToCart';

const EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

/* ================= HERO: shader dymu + reflektory + lewitujące koszulki z mouse parallax ================= */

const SplitWord = ({ word, delay }: { word: string; delay: number }) => (
  <span className="block overflow-hidden pb-[0.04em]" aria-hidden>
    {word.split('').map((ch, i) => (
      <motion.span
        key={i}
        className="inline-block"
        initial={{ y: '110%', rotateZ: 8 }}
        animate={{ y: '0%', rotateZ: 0 }}
        transition={{ duration: 1.1, ease: EXPO, delay: delay + i * 0.05 }}
      >
        {ch}
      </motion.span>
    ))}
  </span>
);

const Floater = ({
  src,
  mx,
  my,
  depth,
  className,
  delay,
  bob,
}: {
  src: string;
  mx: MotionValue<number>;
  my: MotionValue<number>;
  depth: number;
  className: string;
  delay: number;
  bob: number;
}) => {
  const reduce = useReducedMotion();
  const x = useTransform(mx, [-1, 1], [-depth * 40, depth * 40]);
  const y = useTransform(my, [-1, 1], [-depth * 26, depth * 26]);
  const rotY = useTransform(mx, [-1, 1], [-depth * 14, depth * 14]);
  const rotX = useTransform(my, [-1, 1], [depth * 10, -depth * 10]);
  return (
    <motion.div style={{ x, y, rotateY: rotY, rotateX: rotX }} className={`absolute [transform-style:preserve-3d] ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 120, scale: 0.85 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.4, ease: EXPO, delay }}
      >
        <motion.img
          src={src}
          alt=""
          draggable={false}
          className="w-full drop-shadow-[0_40px_40px_rgba(0,0,0,0.7)]"
          animate={reduce ? undefined : { y: [0, -bob, 0], rotateZ: [-1.5, 1.5, -1.5] }}
          transition={{ duration: 5 + depth * 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </motion.div>
  );
};

export const HeroScene = ({ products }: { products: Product[] }) => {
  const { lang } = useStore();
  const { navigate } = useNav();
  const u = ui(lang);
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { x: mx, y: my, bind } = useMouseParallax();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const wordY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '40%']);
  const sceneY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '-25%']);
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const wordX = useTransform(mx, [-1, 1], [12, -12]);

  const pick = (id: string) => products.find((p) => p.id === id)?.cutout;
  const left = pick('21');
  const center = pick('17');
  const right = pick('18');

  return (
    <section ref={ref} {...bind} className="relative min-h-[100svh] overflow-hidden bg-black text-white">
      <div className="absolute inset-0">
        <SmokeShader />
      </div>
      <Spotlights />

      {/* scena 3D z lewitującymi koszulkami */}
      <motion.div style={{ y: sceneY, opacity: fade }} className="pointer-events-none absolute inset-0 [perspective:1200px]">
        {left && <Floater src={left} mx={mx} my={my} depth={0.6} delay={0.9} bob={14} className="right-[38%] top-[20%] hidden w-[17vw] max-w-[260px] opacity-80 blur-[1px] lg:block" />}
        {right && <Floater src={right} mx={mx} my={my} depth={0.8} delay={1.05} bob={18} className="right-[2%] top-[12%] w-[34vw] max-w-[300px] md:right-[3%] md:w-[20vw]" />}
        {center && <Floater src={center} mx={mx} my={my} depth={1.2} delay={0.75} bob={22} className="right-[8%] top-[38%] w-[52vw] max-w-[440px] md:right-[17%] md:top-[30%] md:w-[28vw]" />}
      </motion.div>

      <motion.div style={{ y: wordY, opacity: fade }} className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1600px] flex-col justify-end px-4 pb-32 pt-28 md:px-8 md:pb-36">
        <motion.h1 style={{ x: wordX }} className="font-banner whitespace-nowrap text-[28vw] leading-[0.8] mix-blend-normal md:text-[min(17vw,19rem)]">
          <span className="sr-only">STRAATFANAAT</span>
          <SplitWord word="STRAAT" delay={0.3} />
          <span className="block text-haag-yellow">
            <SplitWord word="FANAAT" delay={0.5} />
          </span>
        </motion.h1>
        <motion.div
          className="mt-8 flex max-w-xl flex-col gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EXPO, delay: 1.2 }}
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

      <motion.div
        aria-hidden
        className="absolute bottom-20 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs font-semibold text-white/60 md:flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        {u.scroll}
        <span className="relative h-10 w-[2px] overflow-hidden bg-white/20">
          <motion.span className="absolute inset-x-0 top-0 h-4 bg-haag-yellow" animate={reduce ? undefined : { y: [-16, 40] }} transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }} />
        </span>
      </motion.div>

      <div className="absolute inset-x-0 bottom-0 z-20">
        <div className="h-2 scarf-stripes" />
        <div className="bg-haag-yellow py-3 text-black">
          <VelocityMarquee
            className="font-banner text-2xl md:text-3xl"
            items={['Den Haag', lang === 'PL' ? 'Polskie korzenie' : lang === 'EN' ? 'Polish roots' : 'Poolse roots', '300gsm', 'Limited drops', 'Straatfanaat']}
          />
        </div>
      </div>
    </section>
  );
};

/* ================= SCROLLYTELLING: przypięta koszulka obraca się, opis zmienia się ze scrollem ================= */

export const Story = ({ product }: { product: Product }) => {
  const { lang, addToCart } = useStore();
  const u = ui(lang);
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const shirtRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  // scrubbing: obrót i skala koszulki są „przyklejone” do scrolla
  const rotateY = useTransform(scrollYProgress, [0, 0.18, 0.4, 0.62, 0.8, 1], reduce ? [0, 0, 0, 0, 0, 0] : [-20, 0, 180, 210, 360, 360]);
  const scale = useTransform(scrollYProgress, [0, 0.45, 0.62, 0.8], [0.9, 1, 1.25, 1]);
  const y = useTransform(scrollYProgress, [0, 0.5, 1], ['6%', '0%', '-4%']);
  const glow = useTransform(scrollYProgress, [0, 0.5, 1], [0.35, 0.8, 0.5]);
  const bar = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  useMotionValueEvent(scrollYProgress, 'change', (v) => setStep(v < 0.25 ? 0 : v < 0.52 ? 1 : v < 0.74 ? 2 : 3));

  const steps = u.story;
  const add = () => {
    if (!size) return;
    addToCart(product, size);
    flyToCart(product.cutout ?? product.image, shirtRef.current?.getBoundingClientRect() ?? null);
  };

  return (
    <section ref={ref} className="relative bg-black text-white" style={{ height: '420vh' }}>
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden md:flex-row">
        <Spotlights className="opacity-70" />
        {/* scena z koszulką */}
        <div className="relative flex flex-1 items-center justify-center [perspective:1400px] md:order-2">
          <motion.div aria-hidden style={{ opacity: glow }} className="absolute h-[70vmin] w-[70vmin] rounded-full bg-[radial-gradient(circle,rgba(255,210,31,0.45),rgba(11,138,68,0.25)_45%,transparent_70%)] blur-3xl" />
          <motion.div ref={shirtRef} style={{ rotateY, scale, y }} className="relative w-[min(62vw,520px)] [transform-style:preserve-3d] md:w-[min(36vw,560px)]">
            <img src={product.cutout} alt={`${product.name} — ${u.front}`} className="w-full drop-shadow-[0_50px_50px_rgba(0,0,0,0.8)] [backface-visibility:hidden]" />
            {product.cutoutBack && (
              <img
                src={product.cutoutBack}
                alt={`${product.name} — ${u.back}`}
                className="absolute inset-0 w-full drop-shadow-[0_50px_50px_rgba(0,0,0,0.8)] [backface-visibility:hidden] [transform:rotateY(180deg)]"
              />
            )}
          </motion.div>
        </div>

        {/* opis zmieniający się ze scrollem */}
        <div className="relative z-10 flex flex-col justify-end px-4 pb-10 md:w-[42%] md:justify-center md:pb-0 md:pl-8 lg:pl-16">
          <p className="mb-4 text-sm font-semibold text-haag-yellow">{product.name}</p>
          <div className="relative min-h-[11rem] md:min-h-[18rem]">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -40, filter: 'blur(10px)' }}
                transition={{ duration: 0.5, ease: EXPO }}
              >
                <h2 className="font-banner text-[17vw] md:text-[clamp(4rem,8vw,8.5rem)]">{steps[step].t}</h2>
                <p className="mt-3 max-w-md text-lg text-white/80 md:text-xl">{steps[step].d}</p>
                {step === 3 && (
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <span className="font-banner text-5xl tabular-nums">{eur(product.price, lang)}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {product.sizes.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSize(s)}
                          aria-pressed={size === s}
                          className={`h-10 min-w-10 px-2 text-sm font-bold ring-2 transition ${size === s ? 'bg-haag-yellow text-black ring-haag-yellow' : 'ring-white/30 hover:ring-white'}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    <Btn variant="yellow" onClick={add} disabled={!size}>
                      {size ? u.quickAdd : u.chooseSize}
                    </Btn>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="mt-8 flex items-center gap-4">
            <div className="flex gap-2">
              {steps.map((_, i) => (
                <span key={i} className={`h-1.5 transition-all duration-500 ${i === step ? 'w-10 bg-haag-yellow' : 'w-4 bg-white/25'}`} />
              ))}
            </div>
            <NavLink page="product" id={product.id} className="text-sm font-semibold underline underline-offset-4 hover:text-haag-yellow">
              {u.viewProduct}
            </NavLink>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1 bg-white/10">
          <motion.div style={{ width: bar }} className="h-full bg-haag-yellow" />
        </div>
      </div>
    </section>
  );
};

/* ================= Count-up statystyki ================= */

export const Stats = ({ products }: { products: Product[] }) => {
  const { lang } = useStore();
  const u = ui(lang);
  const waiting = products.reduce((n, p) => n + (p.waitlistCount ?? 0), 0);
  const fmt = (n: number) => Math.round(n).toLocaleString(lang === 'EN' ? 'en-GB' : lang === 'PL' ? 'pl-PL' : 'nl-NL');
  const stats = [
    { to: products.length, label: u.statModels },
    { to: 300, label: u.statGsm },
    { to: waiting, label: u.statWaiting },
    { to: 3, label: u.statLangs },
  ];
  return (
    <section className="bg-haag-yellow px-4 py-16 text-black md:px-8 md:py-24">
      <dl className="mx-auto grid max-w-[1600px] grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col-reverse gap-2 border-t-[3px] border-black pt-4">
            <dt className="text-base font-semibold md:text-lg">{s.label}</dt>
            <dd className="font-banner text-[20vw] leading-[0.8] md:text-[9rem]">
              <CountUp to={s.to} format={fmt} />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
};

/* ================= Orbita kolekcji ================= */

export const CollectionOrbit = ({ products }: { products: Product[] }) => {
  const { lang } = useStore();
  const u = ui(lang);
  const [hover, setHover] = useState<Product | null>(null);
  return (
    <section className="relative overflow-hidden bg-black py-20 text-white md:py-28">
      <div className="absolute inset-0 opacity-60">
        <SmokeShader />
      </div>
      <div className="relative z-10 mx-auto flex max-w-[1600px] flex-col justify-between gap-4 px-4 md:flex-row md:items-end md:px-8">
        <h2 className="font-banner text-[18vw] md:text-[10rem]">{u.orbitTitle}</h2>
        <p className="max-w-xs text-lg text-white/70 md:text-right">{u.orbitLead}</p>
      </div>
      <div className="relative z-10">
        <Orbit products={products} onHover={setHover} />
      </div>
      <div className="relative z-10 flex h-16 items-center justify-center" aria-live="polite">
        <AnimatePresence mode="wait">
          {hover && (
            <motion.p
              key={hover.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="font-banner text-4xl text-haag-yellow md:text-5xl"
            >
              {hover.name} · {eur(hover.price, lang)}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

/* ================= Dolly zoom: kamera „wjeżdża” w zdjęcie ================= */

export const DollyZoom = () => {
  const { lang } = useStore();
  const { navigate } = useNav();
  const u = ui(lang);
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const clip = useTransform(scrollYProgress, [0, 0.6], reduce ? ['inset(0% 0% 0% 0%)', 'inset(0% 0% 0% 0%)'] : ['inset(24% 34% 24% 34%)', 'inset(0% 0% 0% 0%)']);
  const imgScale = useTransform(scrollYProgress, [0, 0.6, 1], reduce ? [1, 1, 1] : [1.6, 1.05, 1]);
  const textOpacity = useTransform(scrollYProgress, [0.5, 0.75], [0, 1]);
  const textY = useTransform(scrollYProgress, [0.5, 0.8], [60, 0]);
  const titleScale = useTransform(scrollYProgress, [0, 0.6], [1, 0.6]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  return (
    <section ref={ref} className="relative bg-paper" style={{ height: '260vh' }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <motion.p
          aria-hidden
          style={{ scale: titleScale, opacity: titleOpacity }}
          className="font-banner absolute inset-x-0 top-[8%] z-0 text-center text-[22vw] text-black md:text-[16vw]"
        >
          Duo
        </motion.p>
        <motion.div style={{ clipPath: clip }} className="absolute inset-0 z-10">
          <motion.div style={{ scale: imgScale }} className="h-full w-full">
            <Pic src="/images/kolekcja%20dla%20niego%20dla%20niej%20sesia1.jpeg" alt="STRAATFANAAT duo" large sizes="100vw" className="h-full w-full object-cover" />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
        </motion.div>
        <motion.div style={{ opacity: textOpacity, y: textY }} className="absolute inset-x-0 bottom-0 z-20 mx-auto max-w-[1600px] px-4 pb-14 text-white md:px-8">
          <h2 className="font-banner text-[18vw] md:text-[9rem]">{u.duoTitle}</h2>
          <p className="mt-3 max-w-lg text-lg md:text-xl">{u.duoText}</p>
          <div className="mt-6">
            <Btn variant="yellow" onClick={() => navigate('lookbook')}>
              {u.viewDuo}
            </Btn>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
