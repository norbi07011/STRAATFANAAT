import React, { useState } from 'react';
import { Instagram } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { ui } from '../lib/i18n';
import { joinNewsletter } from '../lib/signups';
import { useStore } from './store';
import { NavLink } from './nav';
import { TextFill } from './fx/scroll';

// Wpisz adres profilu, a link pojawi się w stopce
const INSTAGRAM_URL = '';

export const Footer = () => {
  const { lang } = useStore();
  const t = TRANSLATIONS[lang];
  const u = ui(lang);
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('sending');
    try {
      await joinNewsletter(email, lang);
      setState('done');
    } catch (err) {
      console.error('Newsletter error:', err);
      setState('error');
    }
  };

  return (
    <footer className="relative overflow-hidden bg-black text-white">
      <div className="h-4 scarf-stripes" />
      <div className="mx-auto grid max-w-[1600px] gap-12 px-4 pb-8 pt-16 md:grid-cols-12 md:px-8 md:pt-24">
        <div className="md:col-span-5">
          <h2 className="font-banner text-6xl md:text-7xl">{u.newsletterTitle}</h2>
          {state === 'done' ? (
            <p className="mt-6 text-lg text-haag-yellow">{u.newsletterDone}</p>
          ) : (
            <form onSubmit={submit} className="mt-6 flex max-w-md border-b-2 border-white focus-within:border-haag-yellow">
              <label className="sr-only" htmlFor="nl-email">
                E-mail
              </label>
              <input
                id="nl-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={u.newsletterPlaceholder}
                className="min-w-0 flex-1 bg-transparent py-3 text-lg outline-none placeholder:text-white/35"
              />
              <button type="submit" disabled={state === 'sending'} className="px-2 font-bold text-haag-yellow hover:text-white">
                {state === 'sending' ? u.sending : u.newsletterBtn}
              </button>
            </form>
          )}
          {state === 'error' && <p className="mt-3 text-sm text-red-400">{u.waitlistError}</p>}
        </div>

        <div className="grid grid-cols-2 gap-8 md:col-span-6 md:col-start-7 md:grid-cols-3">
          <div className="flex flex-col gap-3">
            <NavLink page="shop" className="hover:text-haag-yellow">
              {t.nav_shop}
            </NavLink>
            <NavLink page="lookbook" className="hover:text-haag-yellow">
              {t.nav_lookbook}
            </NavLink>
            <NavLink page="about" className="hover:text-haag-yellow">
              {t.nav_about}
            </NavLink>
          </div>
          <div className="flex flex-col gap-3 text-white/70">
            <span>{u.city}</span>
            <span>{u.fact3}</span>
            <span>{u.fact2}</span>
          </div>
          {INSTAGRAM_URL && (
            <div className="flex flex-col gap-3">
              <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-haag-yellow">
                <Instagram className="h-5 w-5" /> Instagram
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-4 md:px-8">
        <TextFill text="Straatfanaat" className="font-banner whitespace-nowrap text-center text-[16vw] leading-[0.8] min-[1600px]:text-[256px]" />
      </div>

      <div className="mx-auto flex max-w-[1600px] flex-col justify-between gap-2 px-4 py-6 text-sm text-white/50 md:flex-row md:px-8">
        <span>
          © {new Date().getFullYear()} STRAATFANAAT. {t.footer_rights}
        </span>
        <span>{t.footer_made_by}</span>
      </div>
    </footer>
  );
};
