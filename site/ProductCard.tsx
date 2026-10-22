import React from 'react';
import { Product } from '../types';
import { eur, ui } from '../lib/i18n';
import { useStore } from './store';
import { NavLink } from './nav';
import { Pic } from './ui';

export const isAvailable = (p: Product) => p.available !== false;

export const ProductCard = ({
  product,
  tone = 'light',
  sizes,
  className = '',
  aspect = 'aspect-[2/3]',
}: {
  product: Product;
  tone?: 'light' | 'dark';
  sizes?: string;
  className?: string;
  aspect?: string;
}) => {
  const { lang, openWaitlist } = useStore();
  const u = ui(lang);
  const available = isAvailable(product);
  const second = product.images?.[1];
  const dark = tone === 'dark';

  return (
    <article className={`group relative flex flex-col ${className}`}>
      <NavLink page="product" id={product.id} className="block" aria-label={product.name}>
        <div className={`relative overflow-hidden ${dark ? 'bg-asphalt-2' : 'bg-paper-2'} ${aspect}`}>
          <Pic
            src={product.image}
            alt={product.name}
            sizes={sizes}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] ease-out-expo group-hover:scale-[1.04]"
          />
          {second && (
            <Pic
              src={second}
              alt=""
              sizes={sizes}
              className="absolute inset-0 h-full w-full object-cover !opacity-0 transition-opacity duration-700 group-hover:!opacity-100"
            />
          )}
          <div className="absolute left-0 top-0 flex flex-wrap gap-0">
            {!available && <span className="bg-haag-yellow px-3 py-1.5 text-[13px] font-bold text-black">{u.comingSoon}</span>}
            {product.originalPrice && <span className="bg-haag-green px-3 py-1.5 text-[13px] font-bold text-white">−{Math.round((1 - product.price / product.originalPrice) * 100)}%</span>}
          </div>
        </div>
      </NavLink>

      <div className="flex flex-col gap-1 pt-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div>
          <NavLink page="product" id={product.id} className="font-narrow text-lg font-bold leading-tight hover:underline md:text-xl">
            {product.name}
          </NavLink>
          {!available && product.waitlistCount ? (
            <p className={`mt-0.5 text-sm ${dark ? 'text-white/55' : 'text-black/55'}`}>{u.waiting(product.waitlistCount)}</p>
          ) : null}
        </div>
        <div className="flex items-baseline gap-2 tabular-nums sm:block sm:text-right">
          {product.originalPrice && (
            <span className={`order-2 text-sm line-through sm:block ${dark ? 'text-white/45' : 'text-black/45'}`}>{eur(product.originalPrice, lang)}</span>
          )}
          <span className="text-lg font-bold">{eur(product.price, lang)}</span>
        </div>
      </div>

      {!available && (
        <button
          onClick={() => openWaitlist(product)}
          className={`mt-3 self-start border-b-2 pb-0.5 text-[15px] font-semibold transition-colors ${
            dark ? 'border-haag-yellow text-haag-yellow hover:text-white' : 'border-black hover:border-haag-green hover:text-haag-green'
          }`}
        >
          {u.notifyMe}
        </button>
      )}
    </article>
  );
};
