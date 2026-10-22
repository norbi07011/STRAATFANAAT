import { Language, Product } from '../types';

/**
 * Opisy w constants.tsx zaczynają się od „NAZWA - …”. Na stronie produktu nazwa jest już w nagłówku,
 * więc zdejmujemy ten prefiks i dzielimy tekst na lead (1. zdanie) i resztę.
 */
export const splitDescription = (p: Product, lang: Language) => {
  const raw = p.description[lang] ?? '';
  const m = raw.match(/^([^-–—]{2,60})\s[-–—]\s/);
  // zdejmij tylko prefiks pisany wersalikami albo równy nazwie produktu
  const prefix = m?.[1].trim() ?? '';
  const isName = prefix && (prefix === prefix.toUpperCase() || p.name.toLowerCase().startsWith(prefix.toLowerCase()));
  const stripped = (isName && m ? raw.slice(m[0].length) : raw).trim();
  const sentences = stripped.match(/[^.!?]+[.!?]+(\s|$)/g)?.map((s) => s.trim()) ?? [stripped];
  return { lead: sentences[0] ?? '', rest: sentences.slice(1).join(' ') };
};

/** Cechy materiału wyciągnięte wyłącznie z tekstu opisu (nic nie dopisujemy od siebie). */
export const specsFromDescription = (p: Product) => {
  const text = `${p.description.EN} ${p.description.NL}`.toLowerCase();
  const specs: { key: string; NL: string; EN: string; PL: string }[] = [];
  if (text.includes('300gsm')) specs.push({ key: 'gsm', NL: '300gsm katoen', EN: '300gsm cotton', PL: 'Bawełna 300gsm' });
  else if (text.includes('100%')) specs.push({ key: 'cotton', NL: '100% katoen', EN: '100% cotton', PL: '100% bawełny' });
  if (text.includes('oversized')) specs.push({ key: 'fit', NL: 'Oversized fit', EN: 'Oversized fit', PL: 'Krój oversize' });
  if (text.includes('fitted')) specs.push({ key: 'fit', NL: 'Getailleerde fit', EN: 'Fitted cut', PL: 'Krój dopasowany' });
  if (text.includes('one size')) specs.push({ key: 'size', NL: 'One size', EN: 'One size', PL: 'Jeden rozmiar' });
  if (text.includes('limited')) specs.push({ key: 'ltd', NL: 'Limited edition', EN: 'Limited edition', PL: 'Edycja limitowana' });
  return specs;
};

/** Pasujące produkty: najpierw ta sama kategoria i kolor, potem dostępne. */
export const relatedProducts = (p: Product, all: Product[], n = 8) =>
  all
    .filter((x) => x.id !== p.id)
    .map((x) => ({
      x,
      score: (x.category === p.category ? 2 : 0) + (x.colors.some((c) => p.colors.includes(c)) ? 1 : 0) + (x.available !== false ? 1.5 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map((r) => r.x);
