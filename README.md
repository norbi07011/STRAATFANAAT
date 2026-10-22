# STRAATFANAAT

Sklep streetwear z Hagi (NL / EN / PL). React 19 + TypeScript + Vite, Tailwind v4, Motion, Lenis, Supabase.

## Uruchomienie

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # produkcja → dist/
```

Opcjonalnie w `.env.local`: `GEMINI_API_KEY=...` (stylista AI na stronie produktu).

## Zdjęcia i filmy

Oryginały leżą w `public/images` i `public/video`. Strona używa skompresowanych wersji
(WebP 800/1600 px, MP4 720p) z folderów `opt/`. Po dodaniu nowych plików uruchom:

```bash
npm run optimize
```

## Lista oczekujących i newsletter

Uruchom raz `supabase/signups.sql` w Supabase → SQL Editor. Tworzy tabele `waitlist_signups`
i `newsletter_subscribers` z polityką „tylko insert” dla klientów.

## Struktura

- `pages/` — strony: Home, Shop, ProductPage, Lookbook, About
- `site/` — nagłówek, koszyk, stopka, przejścia między stronami (`nav.tsx`), stan (`store.tsx`)
- `lib/` — Supabase, tłumaczenia UI (`i18n.ts`), mapowanie zdjęć (`media.ts`), routing
- `components/` — Checkout i AdminPanel (ładowane na żądanie)
- `constants.tsx` — produkty i teksty marki
