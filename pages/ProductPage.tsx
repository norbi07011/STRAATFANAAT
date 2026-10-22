import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Sparkles, X, ZoomIn } from 'lucide-react';
import { Product } from '../types';
import { eur, ui } from '../lib/i18n';
import { img, video } from '../lib/media';
import { useStore } from '../site/store';
import { NavLink, useNav } from '../site/nav';
import { Btn, Pic } from '../site/ui';
import { flyToCart } from '../site/fx/flyToCart';
import { RollingNumber } from '../site/fx/scroll';
import { isAvailable, ProductCard } from '../site/ProductCard';

const EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

const Zoom = ({ images, start, name, onClose }: { images: string[]; start: number; name: string; onClose: () => void }) => {
  const { lang } = useStore();
  const { lenis } = useNav();
  const u = ui(lang);
  const [i, setI] = useState(start);
  const [origin, setOrigin] = useState('50% 50%');
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    lenis.current?.stop();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setI((v) => (v + 1) % images.length);
      if (e.key === 'ArrowLeft') setI((v) => (v - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      lenis.current?.start();
    };
  }, [images.length, lenis, onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[120] flex flex-col bg-paper"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label={name}
    >
      <div className="flex items-center justify-between px-4 py-3 md:px-8">
        <span className="text-sm font-semibold tabular-nums">
          {i + 1} / {images.length}
        </span>
        <span className="hidden text-sm text-black/60 md:block">{u.zoomHint}</span>
        <button onClick={onClose} className="flex h-11 w-11 items-center justify-center bg-black text-white" aria-label={u.close}>
          <X className="h-5 w-5" />
        </button>
      </div>
      <div
        className="relative flex-1 cursor-zoom-in overflow-hidden"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
        }}
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
        onClick={() => setZoomed((z) => !z)}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={images[i]}
            src={img(images[i], 1600)}
            alt={name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full w-full object-contain transition-transform duration-200 ease-out"
            style={{ transformOrigin: origin, transform: zoomed ? 'scale(2.2)' : 'scale(1)' }}
          />
        </AnimatePresence>
      </div>
      {images.length > 1 && (
        <div className="flex justify-center gap-2 overflow-x-auto px-4 py-3">
          {images.map((src, idx) => (
            <button
              key={src}
              onClick={() => setI(idx)}
              className={`h-20 w-14 shrink-0 overflow-hidden border-2 ${idx === i ? 'border-black' : 'border-transparent opacity-60 hover:opacity-100'}`}
              aria-label={`${idx + 1}`}
            >
              <img src={img(src)} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export const ProductPage = ({ productId, products }: { productId?: string; products: Product[] }) => {
  const { lang, addToCart, openWaitlist, setCartOpen } = useStore();
  const { navigate } = useNav();
  const u = ui(lang);
  const product = products.find((p) => p.id === productId);

  const [size, setSize] = useState<string | null>(null);
  const [active, setActive] = useState(0);
  const [zoomAt, setZoomAt] = useState<number | null>(null);
  const [added, setAdded] = useState(false);
  const [advice, setAdvice] = useState('');
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [needSize, setNeedSize] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);
  const [lens, setLens] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  useEffect(() => {
    setSize(product && product.sizes.length === 1 ? product.sizes[0] : null);
    setActive(0);
    setAdvice('');
  }, [product]);

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
  const gallery = product.images?.length ? product.images : [product.image];
  const details = product.previewImages ?? [];
  const allImages = [...gallery, ...details];
  const related = products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4);

  const onAdd = () => {
    if (!size) {
      setNeedSize(true);
      return;
    }
    addToCart(product, size);
    flyToCart(img(gallery[active]), mainRef.current?.getBoundingClientRect() ?? null);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setCartOpen(true);
    }, 900);
  };

  const fetchAdvice = async () => {
    setLoadingAdvice(true);
    const { getStylingAdvice } = await import('../geminiService');
    setAdvice(await getStylingAdvice(product.name, lang));
    setLoadingAdvice(false);
  };

  const labels = [u.front, u.back];

  return (
    <div className="bg-paper pb-24 pt-20 md:pt-24">
      <div className="mx-auto grid max-w-[1600px] gap-8 px-4 md:grid-cols-12 md:gap-10 md:px-8">
        {/* Galeria */}
        <div className="md:col-span-7">
          <div
            ref={mainRef}
            className="relative aspect-[2/3] overflow-hidden bg-paper-2 bg-cover bg-center"
            style={{ viewTransitionName: 'product-hero', backgroundImage: `url(${img(gallery[0])})` }}
            onPointerMove={(e) => {
              if (e.pointerType !== 'mouse') return;
              const r = e.currentTarget.getBoundingClientRect();
              setLens({ x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height });
            }}
            onPointerLeave={() => setLens(null)}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.button
                key={gallery[active]}
                className="absolute inset-0 cursor-zoom-in"
                initial={{ clipPath: 'inset(0 0 0 100%)' }}
                animate={{ clipPath: 'inset(0 0 0 0%)' }}
                exit={{ opacity: 0.6 }}
                transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                onClick={() => setZoomAt(active)}
                aria-label={`${u.zoomHint}`}
              >
                <Pic src={gallery[active]} alt={`${product.name} ${labels[active] ?? active + 1}`} eager large sizes="(min-width: 768px) 58vw, 100vw" className="h-full w-full object-cover" />
              </motion.button>
            </AnimatePresence>
            {/* image zoom lens / magnifier */}
            {lens && (
              <div
                aria-hidden
                className="pointer-events-none absolute z-20 h-48 w-48 rounded-full border-4 border-haag-yellow shadow-[0_20px_50px_rgba(0,0,0,0.45)]"
                style={{
                  left: lens.x - 96,
                  top: lens.y - 96,
                  backgroundImage: `url(${img(gallery[active], 1600)})`,
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: `${lens.w * 2.6}px ${lens.h * 2.6}px`,
                  backgroundPosition: `${-(lens.x * 2.6 - 96)}px ${-(lens.y * 2.6 - 96)}px`,
                }}
              />
            )}
            <span className="pointer-events-none absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center bg-paper text-black">
              <ZoomIn className="h-5 w-5" />
            </span>
          </div>

          {gallery.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-5">
              {gallery.map((src, i) => (
                <button
                  key={src}
                  onClick={() => setActive(i)}
                  className={`relative aspect-[2/3] overflow-hidden bg-paper-2 transition-opacity ${i === active ? '' : 'opacity-55 hover:opacity-100'}`}
                  aria-label={labels[i] ?? `${i + 1}`}
                  aria-current={i === active}
                >
                  <img src={img(src)} alt="" loading="lazy" className="h-full w-full object-cover" />
                  {i === active && <motion.span layoutId="thumb-bar" className="absolute inset-x-0 bottom-0 h-1 bg-haag-yellow" />}
                </button>
              ))}
            </div>
          )}

          {details.length > 0 && (
            <div className="mt-10">
              <h2 className="font-banner mb-3 text-5xl">{u.details}</h2>
              <div className="grid grid-cols-2 gap-3">
                {details.map((src, i) => (
                  <button key={src} onClick={() => setZoomAt(gallery.length + i)} className="group relative aspect-[2/3] overflow-hidden bg-paper-2">
                    <Pic src={src} alt={`${product.name} detail ${i + 1}`} sizes="(min-width: 768px) 29vw, 50vw" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.promoVideo && (
            <div className="mt-10">
              <h2 className="font-banner mb-3 text-5xl">{u.promoVideo}</h2>
              <video
                src={video(product.promoVideo).src}
                poster={video(product.promoVideo).poster}
                controls
                playsInline
                preload="none"
                className="aspect-[9/14] w-full max-w-md bg-black object-cover"
              />
            </div>
          )}
        </div>

        {/* Panel zakupu */}
        <div className="md:col-span-5">
          <div className="flex flex-col gap-6 md:sticky md:top-28">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EXPO, delay: 0.15 }}>
              <div className="flex flex-wrap items-center gap-2">
                {!available && <span className="bg-haag-yellow px-3 py-1 text-sm font-bold">{u.comingSoon}</span>}
                {product.originalPrice && <span className="bg-haag-green px-3 py-1 text-sm font-bold text-white">Sale</span>}
              </div>
              <h1 className="font-banner mt-3 text-[16vw] [overflow-wrap:anywhere] md:text-[clamp(3.5rem,5.4vw,7rem)]">{product.name}</h1>
              <div className="mt-3 flex items-baseline gap-3 tabular-nums">
                <RollingNumber value={eur(product.price, lang)} className="text-3xl font-bold" />
                {product.originalPrice && <span className="text-xl text-black/45 line-through">{eur(product.originalPrice, lang)}</span>}
              </div>
            </motion.div>

            <p className="max-w-prose text-lg leading-relaxed text-black/80">{product.description[lang]}</p>

            {available ? (
              <>
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-semibold">{u.chooseSize}</span>
                    {needSize && !size && <span className="text-sm font-semibold text-red-700">{u.chooseSize}</span>}
                  </div>
                  <motion.div
                    className="flex flex-wrap gap-2"
                    animate={needSize && !size ? { x: [0, -8, 8, -5, 5, 0] } : { x: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSize(s)}
                        aria-pressed={size === s}
                        className={`relative h-12 min-w-14 border-2 px-3 font-bold transition-colors ${size === s ? 'border-black' : 'border-black/20 hover:border-black'}`}
                      >
                        {size === s && <motion.span layoutId="size-pill" className="absolute inset-0 bg-black" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
                        <span className={`relative ${size === s ? 'text-haag-yellow' : ''}`}>{s}</span>
                      </button>
                    ))}
                  </motion.div>
                </div>

                <Btn variant="black" className="w-full py-5 text-lg" onClick={onAdd} aria-live="polite">
                  <AnimatePresence mode="wait" initial={false}>
                    {added ? (
                      <motion.span key="ok" className="flex items-center gap-2" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}>
                        <Check className="h-5 w-5" /> {u.added}
                      </motion.span>
                    ) : (
                      <motion.span key="add" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}>
                        {u.addToCart}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Btn>
              </>
            ) : (
              <div className="flex flex-col gap-3">
                {product.waitlistCount ? <p className="font-semibold">{u.waiting(product.waitlistCount)}</p> : null}
                <Btn variant="yellow" className="w-full py-5 text-lg" onClick={() => openWaitlist(product)}>
                  {u.notifyMe}
                </Btn>
              </div>
            )}

            <ul className="grid gap-2 border-y-2 border-black py-4 text-[15px] font-medium">
              <li>{u.fact1}</li>
              <li>{u.fact2}</li>
              <li>{u.fact3}</li>
            </ul>

            <div className="bg-black p-5 text-white">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-banner text-4xl">{u.stylistTitle}</h2>
                <Sparkles className="h-5 w-5 text-haag-yellow" />
              </div>
              <AnimatePresence mode="wait">
                {advice && (
                  <motion.p key={advice} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-3 text-white/85">
                    {advice}
                  </motion.p>
                )}
              </AnimatePresence>
              <button
                onClick={fetchAdvice}
                disabled={loadingAdvice}
                className="mt-4 inline-flex items-center gap-2 border-b-2 border-haag-yellow pb-0.5 font-semibold text-haag-yellow hover:text-white disabled:opacity-60"
              >
                {loadingAdvice ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-haag-yellow border-t-transparent" /> : null}
                {u.stylist}
              </button>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mx-auto mt-24 max-w-[1600px] px-4 md:px-8">
          <div className="mb-8 flex items-end justify-between gap-4 border-b-2 border-black pb-4">
            <h2 className="font-banner text-6xl md:text-8xl">{u.moreFromDrop}</h2>
            <NavLink page="shop" className="font-semibold underline decoration-2 underline-offset-4 hover:text-haag-green">
              {u.shopDrop}
            </NavLink>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} sizes="(min-width: 768px) 25vw, 50vw" />
            ))}
          </div>
        </section>
      )}

      <AnimatePresence>
        {zoomAt !== null && <Zoom images={allImages} start={zoomAt} name={product.name} onClose={() => setZoomAt(null)} />}
      </AnimatePresence>
    </div>
  );
};
