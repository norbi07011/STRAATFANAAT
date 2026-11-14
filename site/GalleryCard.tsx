import React from 'react';
import { Product } from '../types';
import { eur, ui } from '../lib/i18n';
import { useStore } from './store';
import { NavLink } from './nav';
import { isAvailable } from './ProductCard';

/*
  Karta produktu w „nocnej galerii”: wycięty produkt na ciemnym panelu, cienka złota listwa światła u góry
  (ten sam świat co filmy pod sceną Joeya). Po najechaniu pokazuje plecy koszulki.
*/
export const GalleryCard = ({ product, className = '', eager = false }: { product: Product; className?: string; eager?: boolean }) => {
  const { lang, openWaitlist } = useStore();
  const u = ui(lang);
  const available = isAvailable(product);
  const front = product.cutout ?? product.image;
  const back = product.cutoutBack;

  return (
    <article className={`group relative flex flex-col ${className}`}>
      <NavLink page="product" id={product.id} aria-label={product.name} data-cursor={u.cView} className="relative block aspect-[4/5] overflow-hidden bg-ink-2">
        <span aria-hidden className="absolute inset-x-0 top-0 h-2/3 bg-[radial-gradient(70%_80%_at_50%_0%,rgba(216,166,58,0.14),transparent_70%)] transition-opacity duration-700 group-hover:opacity-160" />
        <span aria-hidden className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-100" />
        <span aria-hidden className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-white/[0.045] to-transparent" />
        <img
          src={front}
          alt={product.name}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          draggable={false}
          className={`absolute inset-0 m-auto h-[80%] w-[80%] object-contain drop-shadow-[0_26px_28px_rgba(0,0,0,0.75)] transition-[opacity,transform] duration-700 ease-out-expo group-hover:scale-[1.03] ${back ? '[@media(hover:hover)]:group-hover:opacity-0' : ''}`}
        />
        {back && (
          <img
            src={back}
            alt=""
            loading="lazy"
            decoding="async"
            draggable={false}
            className="absolute inset-0 m-auto hidden h-[80%] w-[80%] scale-[0.98] object-contain opacity-0 drop-shadow-[0_26px_28px_rgba(0,0,0,0.75)] transition-[opacity,transform] duration-700 ease-out-expo group-hover:scale-[1.03] group-hover:opacity-100 [@media(hover:hover)]:block"
          />
        )}
        {!available && (
          <span className="absolute left-4 top-4 text-[12px] font-semibold uppercase tracking-[0.16em] text-gold">{u.comingSoon}</span>
        )}
      </NavLink>

      <div className="flex items-baseline justify-between gap-4 border-t border-white/10 pt-4">
        <NavLink page="product" id={product.id} className="font-narrow text-base font-bold leading-tight text-white hover:text-haag-yellow md:text-lg">
          {product.name}
        </NavLink>
        <span className="shrink-0 text-base tabular-nums text-white/70 md:text-lg">{eur(product.price, lang)}</span>
      </div>

      {!available && (
        <button
          onClick={() => openWaitlist(product)}
          className="mt-2 self-start text-sm font-semibold text-white/60 underline decoration-white/25 underline-offset-4 transition-colors hover:text-haag-yellow hover:decoration-haag-yellow"
        >
          {u.notifyMe}
        </button>
      )}
    </article>
  );
};
