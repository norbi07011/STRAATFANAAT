import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useScroll, useTransform } from 'motion/react';
import { Check, ChevronDown, Share2, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { TRANSLATIONS } from '../constants';
import { eur, ui } from '../lib/i18n';
import { img, video } from '../lib/media';
import { relatedProducts, specsFromDescription, splitDescription } from '../lib/product';
import { useStore } from '../site/store';
import { NavLink, useNav } from '../site/nav';
import { Btn, Pic } from '../site/ui';
import { isAvailable, ProductCard } from '../site/ProductCard';
import { Lightbox } from '../site/Lightbox';
import { flyToCart } from '../site/fx/flyToCart';
import { RollingNumber } from '../site/fx/scroll';
import { ProductStage } from '../site/fx/ProductStage';
import { DragRail } from '../site/fx/DragRail';
import { Scramble } from '../site/fx/Scramble';

const EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];
const COLOR_NAMES: Record<string, Record<string, string>> = {
  Black: { NL: 'Zwart', EN: 'Black', PL: 'Czarny' },
  White: { NL: 'Wit', EN: 'White', PL: 'Biały' },
  Pink: { NL: 'Roze', EN: 'Pink', PL: 'Różowy' },
};

/* ---------- Akordeon ---------- */

const Accordion = ({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b-2 border-black">
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center justify-between py-4 text-left font-bold">
        {title}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDown className="h-5 w-5" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: EXPO }}
            className="overflow-hidden"
          >
            <div className="pb-5 text-[15px] leading-relaxed text-black/75">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ---------- Galeria: pionowy stos zdjęć (desktop) / karuzela (telefon) ---------- */

const GalleryImage = ({ src, alt, index, onOpen, onActive, priority }: { src: string; alt: string; index: number; onOpen: (i: number) => void; onActive: (i: number) => void; priority: boolean }) => {
  const ref = useRef<HTMLButtonElement>(null);
  const inView = useInView(ref, { amount: 0.55 });
  const [lens, setLens] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-4%', '4%']);
  useEffect(() => {
    if (inView) onActive(index);
  }, [inView, index, onActive]);

  return (
    <button
      ref={ref}
      id={`pdp-img-${index}`}
      onClick={() => onOpen(index)}
      data-cursor="Zoom"
      className="relative block aspect-[4/5] w-full shrink-0 snap-center overflow-hidden bg-paper-2 md:w-full"
      style={index === 0 ? { viewTransitionName: 'product-hero' } : undefined}
      onPointerMove={(e) => {
        if (e.pointerType !== 'mouse') return;
        const r = e.currentTarget.getBoundingClientRect();
        setLens({ x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height });
      }}
      onPointerLeave={() => setLens(null)}
      aria-label={alt}
    >
      <motion.div style={{ y }} className="absolute -inset-y-[5%] inset-x-0">
        <Pic src={src} alt={alt} eager={priority} sizes="(min-width: 768px) 55vw, 100vw" className="h-full w-full object-cover" />
      </motion.div>
      {lens && (
        <span
          aria-hidden
          className="pointer-events-none absolute z-10 hidden h-52 w-52 rounded-full border-4 border-haag-yellow shadow-[0_20px_50px_rgba(0,0,0,0.45)] md:block"
          style={{
            left: lens.x - 104,
            top: lens.y - 104,
            backgroundImage: `url(${img(src, 1600)})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: `${lens.w * 2.5}px ${lens.h * 2.5}px`,
            backgroundPosition: `${-(lens.x * 2.5 - 104)}px ${-(lens.y * 2.5 - 104)}px`,
          }}
        />
      )}
    </button>
  );
};

/* ---------- Strona produktu ---------- */

export const ProductPage = ({ productId, products }: { productId?: string; products: Product[] }) => {
  const { lang, addToCart, openWaitlist, setCartOpen, toast, recent, markViewed } = useStore();
  const { navigate } = useNav();
  const t = TRANSLATIONS[lang];
  const u = ui(lang);
  const product = products.find((p) => p.id === productId);

  const [size, setSize] = useState<string | null>(null);
  const [active, setActive] = useState(0);
  const [mode, setMode] = useState<'photo' | '3d'>('photo');
  const [lightboxAt, setLightboxAt] = useState<number | null>(null);
  const [added, setAdded] = useState(false);
  const [needSize, setNeedSize] = useState(0);
  const [moreText, setMoreText] = useState(false);
  const [advice, setAdvice] = useState('');
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [recentSnapshot] = useState(recent);
  const ctaRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const ctaInView = useInView(ctaRef, { margin: '0px 0px -10% 0px' });

  useEffect(() => {
    if (!product) return;
    setSize(product.sizes.length === 1 ? product.sizes[0] : null);
    setActive(0);
    setMode('photo');
    setAdvice('');
    setMoreText(false);
    markViewed(product.id);
  }, [product, markViewed]);

  const images = useMemo(() => (product ? [...(product.images?.length ? product.images : [product.image]), ...(product.previewImages ?? [])] : []), [product]);
  const onActive = useMemo(() => (i: number) => setActive(i), []);

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-start justify-center gap-6 bg-paper px-4 md:px-8">
        <h1 className="font-banner text-[20vw] md:text-[12rem]">{u.notFoundTitle}</h1>
        <Btn variant="black" onClick={() => navigate('shop')}>
          {u.backToShop}
        </Btn>
      </div>
    );
  }

  const available = isAvailable(product);
  const has3d = !!(product.cutout && product.cutoutBack);
  const { lead, rest } = splitDescription(product, lang);
  const specs = specsFromDescription(product);
  const related = relatedProducts(product, products, 8);
  const recentProducts = recentSnapshot
    .filter((id) => id !== product.id)
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean)
    .slice(0, 6) as Product[];

  const onAdd = () => {
    if (!size) {
      setNeedSize((n) => n + 1);
      document.getElementById('pdp-sizes')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    addToCart(product, size);
    const from = (mode === '3d' ? galleryRef.current : document.getElementById(`pdp-img-${active}`))?.getBoundingClientRect() ?? null;
    flyToCart(mode === '3d' && product.cutout ? product.cutout : img(images[active] ?? product.image), from);
    if ('vibrate' in navigator) navigator.vibrate?.(18);
    setAdded(true);
    toast({
      title: u.added,
      text: `${product.name} · ${u.size} ${size}`,
      image: img(product.image),
      action: { label: u.viewCart, run: () => setCartOpen(true) },
    });
    setTimeout(() => setAdded(false), 1600);
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: product.name, url });
      else {
        await navigator.clipboard.writeText(url);
        toast({ title: u.linkCopied });
      }
    } catch {
      /* anulowane */
    }
  };

  const fetchAdvice = async () => {
    setLoadingAdvice(true);
    const { getStylingAdvice } = await import('../geminiService');
    setAdvice(await getStylingAdvice(product.name, lang));
    setLoadingAdvice(false);
  };

  return (
    <div className="bg-paper pb-28 pt-20 md:pb-24 md:pt-24">
      {/* okruszki + udostępnij */}
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-3 text-sm md:px-8">
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-black/60">
          <NavLink page="home" className="hover:text-black">
            Home
          </NavLink>
          <span aria-hidden>/</span>
          <NavLink page="shop" className="hover:text-black">
            {t.nav_shop}
          </NavLink>
          <span aria-hidden>/</span>
          <span className="truncate font-semibold text-black">{product.name}</span>
        </nav>
        <button onClick={share} className="flex shrink-0 items-center gap-2 font-semibold hover:text-haag-green">
          <Share2 className="h-4 w-4" /> {u.share}
        </button>
      </div>

      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-8 px-4 md:grid-cols-12 md:gap-10 md:px-8">
        {/* ===== Galeria ===== */}
        <div className="min-w-0 md:col-span-7" ref={galleryRef}>
          {has3d && (
            <div className="mb-3 inline-flex border-2 border-black" role="tablist">
              {(['photo', '3d'] as const).map((m) => (
                <button key={m} role="tab" aria-selected={mode === m} onClick={() => setMode(m)} className="relative px-4 py-2 text-sm font-bold">
                  {mode === m && <motion.span layoutId="pdp-mode" className="absolute inset-0 bg-black" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
                  <span className={`relative ${mode === m ? 'text-haag-yellow' : ''}`}>{m === 'photo' ? u.photos : '3D'}</span>
                </button>
              ))}
            </div>
          )}

          <AnimatePresence mode="wait" initial={false}>
            {mode === '3d' && has3d ? (
              <motion.div key="3d" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
                <ProductStage front={product.cutout!} back={product.cutoutBack} name={product.name} hint={u.dragToRotate} />
              </motion.div>
            ) : (
              <motion.div key="photo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative md:flex md:gap-4">
                {/* miniatury (desktop, przyklejone) */}
                {images.length > 1 && (
                  <div className="sticky top-28 hidden h-fit w-16 shrink-0 flex-col gap-2 md:flex">
                    {images.map((src, i) => (
                      <button
                        key={src + i}
                        onClick={() => document.getElementById(`pdp-img-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                        className={`relative aspect-[4/5] w-full overflow-hidden transition-opacity ${i === active ? '' : 'opacity-45 hover:opacity-100'}`}
                        aria-label={u.imageOf(i + 1, images.length)}
                      >
                        <img src={img(src)} alt="" loading="lazy" className="h-full w-full object-cover" />
                        {i === active && <motion.span layoutId="pdp-thumb" className="absolute inset-y-0 left-0 w-1 bg-haag-yellow" />}
                      </button>
                    ))}
                  </div>
                )}
                {/* zdjęcia: telefon = karuzela z przewijaniem, desktop = pionowy stos */}
                <div className="-mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:flex-1 md:flex-col md:gap-4 md:overflow-visible md:px-0" data-lenis-prevent-touch>
                  {images.map((src, i) => (
                    <div key={src + i} className="w-[86vw] shrink-0 md:w-full">
                      <GalleryImage src={src} alt={`${product.name} — ${u.imageOf(i + 1, images.length)}`} index={i} onOpen={setLightboxAt} onActive={onActive} priority={i === 0} />
                    </div>
                  ))}
                </div>
                {/* licznik na telefonie */}
                <div className="mt-3 flex items-center justify-center gap-1.5 md:hidden" aria-hidden>
                  {images.map((_, i) => (
                    <span key={i} className={`h-1.5 transition-all duration-300 ${i === active ? 'w-6 bg-black' : 'w-1.5 bg-black/25'}`} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {product.promoVideo && (
            <div className="mt-6 grid gap-4 bg-black p-4 text-white md:grid-cols-[1fr_1.2fr] md:items-center md:p-6">
              <video src={video(product.promoVideo).src} poster={video(product.promoVideo).poster} controls playsInline preload="none" className="aspect-[9/14] w-full bg-black object-cover" />
              <div>
                <p className="font-banner text-5xl text-haag-yellow">{u.promoVideo}</p>
                <p className="mt-2 text-white/70">{u.onTheStreetLead}</p>
              </div>
            </div>
          )}
        </div>

        {/* ===== Panel zakupu ===== */}
        <aside className="min-w-0 md:col-span-5">
          <div className="flex flex-col gap-6 md:sticky md:top-24">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EXPO, delay: 0.1 }}>
              <div className="flex flex-wrap items-center gap-2 text-sm font-bold">
                {available ? (
                  <span className="inline-flex items-center gap-2 text-haag-green">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-haag-green-bright opacity-75" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-haag-green" />
                    </span>
                    {u.inStock}
                  </span>
                ) : (
                  <span className="bg-haag-yellow px-2.5 py-1">{u.comingSoon}</span>
                )}
                {product.originalPrice && <span className="bg-haag-green px-2.5 py-1 text-white">−{Math.round((1 - product.price / product.originalPrice) * 100)}%</span>}
              </div>
              <h1 className="font-banner mt-3 text-[11.5vw] break-words md:text-[clamp(3.25rem,5vw,6.25rem)]">
                <Scramble text={product.name} trigger="mount" />
              </h1>
              <div className="mt-3 flex items-baseline gap-3">
                <RollingNumber value={eur(product.price, lang)} className="text-3xl font-bold" />
                {product.originalPrice && <span className="text-xl text-black/45 line-through tabular-nums">{eur(product.originalPrice, lang)}</span>}
              </div>
            </motion.div>

            <p className="max-w-prose text-xl leading-snug">{lead}</p>

            {specs.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {specs.map((s) => (
                  <li key={s.key + s.EN} className="border-2 border-black px-3 py-1.5 text-sm font-semibold">
                    {s[lang]}
                  </li>
                ))}
              </ul>
            )}

            {available ? (
              <div ref={ctaRef} className="flex flex-col gap-4">
                <div id="pdp-sizes">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-bold">{size && product.sizes.length > 1 ? `${u.size}: ${size}` : u.chooseSize}</span>
                  </div>
                  <motion.div
                    key={needSize}
                    className="grid grid-cols-5 gap-2"
                    animate={needSize ? { x: [0, -10, 10, -6, 6, 0] } : undefined}
                    transition={{ duration: 0.45 }}
                  >
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSize(s)}
                        aria-pressed={size === s}
                        className={`relative h-12 border-2 font-bold transition-colors ${product.sizes.length === 1 ? 'col-span-5' : ''} ${size === s ? 'border-black' : needSize && !size ? 'border-red-600' : 'border-black/20 hover:border-black'}`}
                      >
                        {size === s && <motion.span layoutId="size-pill" className="absolute inset-0 bg-black" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
                        <span className={`relative ${size === s ? 'text-haag-yellow' : ''}`}>{s}</span>
                      </button>
                    ))}
                  </motion.div>
                </div>
                <Btn variant="black" className="w-full py-5 text-lg" onClick={onAdd}>
                  <AnimatePresence mode="wait" initial={false}>
                    {added ? (
                      <motion.span key="ok" className="flex items-center gap-2" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}>
                        <Check className="h-5 w-5" /> {u.added}
                      </motion.span>
                    ) : (
                      <motion.span key="add" className="flex items-center gap-3" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}>
                        {u.addToCart} <span className="opacity-60">·</span> <span className="tabular-nums">{eur(product.price, lang)}</span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Btn>
              </div>
            ) : (
              <div ref={ctaRef} className="flex flex-col gap-3 bg-black p-5 text-white">
                {product.waitlistCount ? <p className="font-banner text-5xl text-haag-yellow">{u.waiting(product.waitlistCount)}</p> : null}
                <p className="text-white/75">{u.waitlistText}</p>
                <Btn variant="yellow" className="w-full py-5 text-lg" onClick={() => openWaitlist(product)}>
                  {u.notifyMe}
                </Btn>
              </div>
            )}

            <div className="border-t-2 border-black">
              {rest && (
                <Accordion title={u.details} defaultOpen>
                  <p>{rest}</p>
                </Accordion>
              )}
              <Accordion title={u.fitTitle}>
                <ul className="list-inside list-disc space-y-1">
                  {specs.map((s) => (
                    <li key={s.key + s.EN}>{s[lang]}</li>
                  ))}
                  <li>
                    {u.size}: {product.sizes.join(' · ')}
                  </li>
                  <li>{product.colors.map((c) => COLOR_NAMES[c]?.[lang] ?? c).join(', ')}</li>
                </ul>
              </Accordion>
              <Accordion title={u.shippingTitle}>
                <p>{u.fact3}</p>
                <p>{u.fact2}</p>
              </Accordion>
              <Accordion title={u.stylistTitle}>
                <AnimatePresence mode="wait">
                  {advice && (
                    <motion.p key={advice} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-3">
                      {advice}
                    </motion.p>
                  )}
                </AnimatePresence>
                <button onClick={fetchAdvice} disabled={loadingAdvice} className="inline-flex items-center gap-2 border-b-2 border-black pb-0.5 font-semibold hover:text-haag-green disabled:opacity-60">
                  {loadingAdvice ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" /> : <Sparkles className="h-4 w-4" />}
                  {u.stylist}
                </button>
              </Accordion>
            </div>
          </div>
        </aside>
      </div>

      {/* ===== Maak de look af ===== */}
      {related.length > 0 && (
        <section className="mx-auto mt-24 max-w-[1600px] px-4 md:px-8">
          <div className="mb-8 flex items-end justify-between gap-4 border-b-2 border-black pb-4">
            <h2 className="font-banner text-6xl md:text-8xl">{u.completeLook}</h2>
            <NavLink page="shop" className="shrink-0 font-semibold underline decoration-2 underline-offset-4 hover:text-haag-green">
              {u.shopDrop}
            </NavLink>
          </div>
          <DragRail cursor={u.cDrag}>
            {related.map((p) => (
              <div key={p.id} className="w-[62vw] shrink-0 sm:w-[38vw] md:w-[22vw] lg:w-[18vw]">
                <ProductCard product={p} sizes="(min-width: 768px) 22vw, 62vw" />
              </div>
            ))}
          </DragRail>
        </section>
      )}

      {/* ===== Ostatnio oglądane ===== */}
      {recentProducts.length > 0 && (
        <section className="mx-auto mt-20 max-w-[1600px] px-4 md:px-8">
          <h2 className="font-banner mb-6 text-5xl md:text-6xl">{u.recentTitle}</h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {recentProducts.map((p) => (
              <NavLink key={p.id} page="product" id={p.id} className="group block">
                <div className="aspect-[4/5] overflow-hidden bg-paper-2">
                  <img src={img(p.image)} alt={p.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <p className="mt-2 truncate text-sm font-semibold">{p.name}</p>
              </NavLink>
            ))}
          </div>
        </section>
      )}

      {/* ===== Sticky add-to-cart (telefon) ===== */}
      <AnimatePresence>
        {!ctaInView && (
          <motion.div
            initial={{ y: '110%' }}
            animate={{ y: 0 }}
            exit={{ y: '110%' }}
            transition={{ duration: 0.4, ease: EXPO }}
            className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t-2 border-black bg-paper/95 px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur md:hidden"
          >
            <img src={img(product.image)} alt="" className="h-12 w-10 object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold leading-tight">{product.name}</p>
              <p className="text-sm tabular-nums">{eur(product.price, lang)}</p>
            </div>
            {available ? (
              <button onClick={onAdd} className="bg-black px-4 py-3 text-sm font-bold text-white">
                {size ? u.addToCart : u.chooseSize}
              </button>
            ) : (
              <button onClick={() => openWaitlist(product)} className="bg-haag-yellow px-4 py-3 text-sm font-bold">
                {u.notifyMe}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>{lightboxAt !== null && <Lightbox images={images} start={lightboxAt} name={product.name} onClose={() => setLightboxAt(null)} />}</AnimatePresence>
    </div>
  );
};
