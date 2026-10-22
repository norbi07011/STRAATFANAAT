import React, { useState } from 'react';
import { motion } from 'motion/react';
import { img, srcSet } from '../lib/media';

/* ---------- Przycisk ---------- */

type Variant = 'yellow' | 'black' | 'outline-light' | 'outline-dark';

const variants: Record<Variant, { base: string; fill: string; hoverText: string }> = {
  yellow: { base: 'bg-haag-yellow text-black', fill: 'bg-black', hoverText: 'group-hover:text-haag-yellow' },
  black: { base: 'bg-black text-white', fill: 'bg-haag-yellow', hoverText: 'group-hover:text-black' },
  'outline-light': { base: 'border-2 border-white text-white', fill: 'bg-white', hoverText: 'group-hover:text-black' },
  'outline-dark': { base: 'border-2 border-black text-black', fill: 'bg-black', hoverText: 'group-hover:text-white' },
};

export const Btn = ({
  variant = 'yellow',
  className = '',
  children,
  as = 'button',
  ...rest
}: {
  variant?: Variant;
  as?: 'button' | 'a';
} & React.ButtonHTMLAttributes<HTMLButtonElement> &
  React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
  const v = variants[variant];
  const Tag = as as any;
  return (
    <Tag
      className={`group relative inline-flex items-center justify-center gap-3 overflow-hidden px-7 py-4 text-[15px] font-bold tracking-tight transition-colors disabled:pointer-events-none disabled:opacity-40 ${v.base} ${className}`}
      {...rest}
    >
      <span
        aria-hidden
        className={`absolute inset-0 origin-bottom scale-y-0 transition-transform duration-500 ease-out-expo group-hover:scale-y-100 ${v.fill}`}
      />
      <span className={`relative flex items-center gap-3 transition-colors duration-300 ${v.hoverText}`}>{children}</span>
    </Tag>
  );
};

/* ---------- Pojawianie się przy scrollu (używane oszczędnie) ---------- */

export const Reveal = ({
  children,
  delay = 0,
  className = '',
  y = 40,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-10% 0px' }}
    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay }}
  >
    {children}
  </motion.div>
);

/* ---------- Zdjęcie z WebP, lazy i płynnym wejściem ---------- */

export const Pic = ({
  src,
  alt,
  className = '',
  sizes = '(min-width: 1024px) 33vw, 100vw',
  eager = false,
  large = false,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  eager?: boolean;
  large?: boolean;
}) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <img
      src={img(src, large ? 1600 : 800)}
      srcSet={srcSet(src)}
      sizes={sizes}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onLoad={() => setLoaded(true)}
      className={`transition-[opacity,filter] duration-700 ${loaded ? 'opacity-100 blur-0' : 'opacity-0 blur-md'} ${className}`}
    />
  );
};

/* ---------- Taśma przewijana ---------- */

export const Marquee = ({ items, className = '' }: { items: string[]; className?: string }) => {
  const row = (
    <div className="flex shrink-0 items-center">
      {items.map((t, i) => (
        <span key={i} className="flex items-center">
          <span className="px-6 md:px-10">{t}</span>
          <span aria-hidden className="inline-block h-3 w-3 rotate-45 bg-current opacity-70 md:h-4 md:w-4" />
        </span>
      ))}
    </div>
  );
  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`} aria-label={items.join(', ')}>
      <div className="flex w-max animate-marquee" aria-hidden>
        {row}
        {row}
      </div>
    </div>
  );
};
