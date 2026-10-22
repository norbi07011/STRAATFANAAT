import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useAnimate, useMotionValueEvent, useScroll } from 'motion/react';
import { ShoppingBag, X } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { ui } from '../lib/i18n';
import { useStore } from './store';
import { NavLink, useNav } from './nav';
import { Scramble } from './fx/Scramble';

const LANGS: Language[] = ['NL', 'EN', 'PL'];

export const Logo = ({ className = '' }: { className?: string }) => (
  <span className={`font-banner text-[28px] leading-none tracking-tight md:text-[32px] ${className}`}>Straatfanaat</span>
);

const LangSwitch = ({ dark }: { dark: boolean }) => {
  const { lang, setLang } = useStore();
  return (
    <div className="flex items-center gap-1 text-[13px] font-bold" role="group" aria-label="Taal / Language / Język">
      {LANGS.map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`relative px-2 py-1 transition-opacity ${lang === l ? 'opacity-100' : 'opacity-45 hover:opacity-100'}`}
        >
          {lang === l && (
            <motion.span
              layoutId="lang-pill"
              className={`absolute inset-0 ${dark ? 'bg-black' : 'bg-haag-yellow'}`}
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
          <span className={`relative ${lang === l ? (dark ? 'text-haag-yellow' : 'text-black') : ''}`}>{l}</span>
        </button>
      ))}
    </div>
  );
};

export const Header = () => {
  const { lang, cartCount, setCartOpen } = useStore();
  const { route } = useNav();
  const t = TRANSLATIONS[lang];
  const u = ui(lang);
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setSolid(y > 60);
    setHidden(y > 400 && y > prev && !menuOpen);
  });

  useEffect(() => setMenuOpen(false), [route]);

  // fly-to-cart: pokaż nagłówek i podbij ikonę koszyka
  const [cartScope, animateCart] = useAnimate<HTMLButtonElement>();
  useEffect(() => {
    const show = () => setHidden(false);
    const bump = () => {
      if (cartScope.current) animateCart(cartScope.current, { scale: [1, 1.45, 0.9, 1.1, 1], rotate: [0, -14, 10, -4, 0] }, { duration: 0.6 });
    };
    window.addEventListener('sf:show-header', show);
    window.addEventListener('sf:cart-bump', bump);
    return () => {
      window.removeEventListener('sf:show-header', show);
      window.removeEventListener('sf:cart-bump', bump);
    };
  }, [animateCart, cartScope]);

  // Na jasnych stronach (sklep, produkt) tekst nagłówka jest czarny, dopóki tło jest przezroczyste
  const lightPage = route.page === 'shop' || route.page === 'product' || route.page === 'notfound';
  const darkText = lightPage && !solid;

  const links = [
    { page: 'shop' as const, label: t.nav_shop },
    { page: 'lookbook' as const, label: t.nav_lookbook },
    { page: 'about' as const, label: t.nav_about },
  ];

  return (
    <>
      <motion.header
        initial={false}
        animate={{ y: hidden ? '-100%' : '0%' }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
          solid ? 'bg-black/85 text-white backdrop-blur-md' : darkText ? 'text-black' : 'text-white'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-6 px-4 md:h-20 md:px-8">
          <NavLink page="home" aria-label="STRAATFANAAT home">
            <Logo />
          </NavLink>

          <nav className="hidden items-center gap-8 md:flex">
            {links.map((l) => (
              <NavLink key={l.page} page={l.page} className="group relative py-1 text-[15px] font-semibold">
                <Scramble text={l.label} />
                <span
                  className={`absolute -bottom-0.5 left-0 h-[3px] w-full origin-left bg-haag-yellow transition-transform duration-500 ease-out-expo ${
                    route.page === l.page ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                />
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3 md:gap-5">
            <div className="hidden sm:block">
              <LangSwitch dark={darkText} />
            </div>
            <button
              ref={cartScope}
              data-cart-icon
              onClick={() => setCartOpen(true)}
              className="relative flex h-10 w-10 items-center justify-center"
              aria-label={`${u.cart} (${cartCount})`}
            >
              <ShoppingBag className="h-[22px] w-[22px]" strokeWidth={2} />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 600, damping: 20 }}
                    className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-haag-yellow px-1 text-[11px] font-black text-black"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <button
              onClick={() => setMenuOpen(true)}
              className="flex h-10 items-center gap-2 text-[15px] font-semibold md:hidden"
              aria-expanded={menuOpen}
            >
              <span className="flex w-6 flex-col gap-[5px]">
                <span className="h-[2px] w-full bg-current" />
                <span className="h-[2px] w-2/3 bg-current" />
              </span>
              <span className="sr-only">{u.menu}</span>
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[60] flex flex-col bg-black text-white md:hidden"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="flex h-16 items-center justify-between px-4">
              <Logo className="text-haag-yellow" />
              <button onClick={() => setMenuOpen(false)} className="flex h-10 w-10 items-center justify-center" aria-label={u.close}>
                <X className="h-7 w-7" />
              </button>
            </div>
            <nav className="flex flex-1 flex-col justify-center gap-2 px-4">
              {[{ page: 'home' as const, label: 'Home' }, ...links].map((l, i) => (
                <div key={l.page} className="overflow-hidden">
                  <motion.div
                    initial={{ y: '110%' }}
                    animate={{ y: '0%' }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.25 + i * 0.07 }}
                  >
                    <NavLink
                      page={l.page}
                      className={`font-banner block text-[22vw] ${route.page === l.page ? 'text-haag-yellow' : 'text-white'}`}
                    >
                      {l.label}
                    </NavLink>
                  </motion.div>
                </div>
              ))}
            </nav>
            <div className="flex items-center justify-between px-4 pb-6">
              <LangSwitch dark={false} />
              <span className="text-sm text-white/60">{u.city}</span>
            </div>
            <div className="h-5 scarf-stripes" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
