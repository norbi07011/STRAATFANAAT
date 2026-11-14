---
name: webshop-growth-nl
description: Run and grow the STRAATFANAAT webshop in the Netherlands: product pages that convert, trust signals, checkout and payments, Google visibility (SEO, Google Merchant Center free listings, Shopping, Google Business Profile, local search, AI answers), keyword targets in Dutch, reviews, abandoned carts, email capture, platform choice (own site vs Shopify, TikTok Shop), product research and competitor ad research. Use for anything about the shop, ranking on Google, "how do we show up first", conversion rate, product page, store setup or e-commerce operations.
---

# Webshop growth NL (STRAATFANAAT)

Detailed background: `marketing/wiedza/wnioski-sklep-i-google.md`.

## Principle: there is no trick that beats Google

Black-hat tactics (keyword stuffing, bought links, fake reviews, AI spam pages, cloaking, copied stores) get pages demoted or removed. Being "two steps ahead" means doing what Google and AI search reward **earlier and better than competitors**: complete product data, real brand signals, local presence, reviews, fast pages, and content for searches nobody serves yet.

## Product page (proven layout)

Order, top to bottom on mobile:
1. Title (model name + type: "DE KEIZER Oversized T-shirt").
2. Star rating with number of reviews (only real reviews).
3. Price incl. BTW, free shipping threshold.
4. Size chart link (centimetres, oversized fit advice).
5. Honest stock line only if true ("Nog 3x M").
6. Size picker, Add to cart / Buy now (iDEAL logo visible).
7. Icon row: 300 gsm, ships from NL in 1–2 days, 14 days return, iDEAL.
8. Collapsible rows: description, size and fit, material and care, shipping and returns.
9. Real photos: front, back, print close-up, on a person, label.
10. Collections slider, Instagram/UGC block, reviews.

No fake countdown timers or fake scarcity (hurts conversion and breaks Dutch consumer law). A free-shipping bar at the top lifts order value.

## Trust in the first 3 seconds (NL specifics)

- iDEAL first in checkout (most Dutch online payments), then cards, Bancontact, Klarna/Riverty.
- Clear company info: KvK number, BTW number, address, contact (WhatsApp works well in NL), returns policy, terms (algemene voorwaarden), privacy policy, cookie consent.
- Dutch trust marks: Kiyoh / WebwinkelKeur / Thuiswinkel Waarborg reviews or certification, Google reviews.
- Delivery promise: "Vandaag besteld, morgen in huis" only if true. Ship from NL stock (big advantage over dropshippers shipping 2–3 weeks from China).

## Platform

- Current site: custom React SPA + Supabase, no real checkout. Client-side rendering is weak for SEO (Google and AI crawlers see an almost empty page) and every e-commerce feature must be built by hand.
- Recommended: Shopify as the commerce backend (Shopify Payments with iDEAL, checkout, stock, discounts, abandoned cart e-mails, Google & YouTube channel for Merchant Center, Facebook/Instagram shop, TikTok channel). Either a Shopify theme styled like the current site, or keep the React front end headless via the Storefront API with server-side rendering. This is the owner's decision; present the trade-off, do not migrate without approval.
- TikTok Shop: check availability in the Netherlands before planning it.

## Google visibility checklist

1. **Brand search "straatfanaat" #1**: Organization schema with logo and `sameAs` links to Instagram/TikTok/Facebook, consistent name everywhere, Google Business Profile, Search Console verified.
2. **Google Merchant Center free listings** (biggest quick win for clothing): product feed with title, description, price, availability, images, size, colour, gender, age group, `brand = STRAATFANAAT`, `identifier_exists = no` for own-brand items without GTIN, shipping and return settings for NL. Shows products for free in the Google Shopping tab, Images and search.
3. **Google Business Profile**: online store with pickup in Den Haag or a service area, photos, products, posts, reviews. Ranks for "streetwear Den Haag" and in Maps.
4. **Technical SEO**: server-rendered or pre-rendered HTML per page, unique URL per product (`/product/de-keizer`), unique `<title>` and meta description per page, Product schema (price, availability, brand, reviews), BreadcrumbList, sitemap.xml, robots.txt, canonical tags, hreflang for NL/EN/PL on separate URLs, absolute og:image per page, fast LCP (WebP, preloaded hero), descriptive image file names and alt text in Dutch.
5. **Search Console**: submit sitemap, watch coverage, queries and click-through rate; rewrite titles of pages with impressions but few clicks.
6. **Reviews**: ask every buyer (e-mail 7 days after delivery) for a Google or Kiyoh review; reply to all.
7. **Links and mentions**: local media (Omroep West, AD Haagsche Courant, Den Haag FM, Indebuurt Den Haag), Haagse blogs and creators, collab partners, B2B club customers ("clubkleding door STRAATFANAAT"), supplier/maker directories. Earn them with stories (Polish-Haagse founder, own factory, drops), not by buying.
8. **AI answers (ChatGPT, Perplexity, Google AI Overviews)**: consistent entity facts across site and profiles, an FAQ and "over ons" page with concrete facts, llms.txt, being mentioned in local articles and lists. Use `seo-geo` / `geo` skills.
9. **Images and video in search**: YouTube Shorts and TikTok videos get indexed; product videos with Dutch titles; Pinterest pins link back to product pages.

## Dutch keyword targets (validate volumes in Google Keyword Planner / Search Console)

| Intent | Examples |
|---|---|
| Brand | straatfanaat, straatfanaat kleding |
| City identity | Den Haag shirt, Haagse kleding, 070 shirt, Haagse trots shirt, Den Haag streetwear |
| Supporter style | FCDH shirt, Den Haag supporters kleding, voetbal streetwear |
| Gift | cadeau Haagse voetbalfan, cadeau voor Hagenaar |
| B2B (high intent) | clubkleding laten maken, teamkleding bedrukken, voetbalkleding met logo, trainingspakken club bedrukken, supporterskleding laten maken |

Use the club name only in the forms allowed by the naming rule (`straatfanaat-nl-voice`). One landing page per intent cluster (e.g. `/clubkleding` for B2B, `/den-haag-streetwear`, `/cadeau`).

## Staying ahead

- Google Trends + Search Console weekly: catch rising searches (new season, derby, Koningsdag, Sinterklaas) and publish before the peak.
- Seasonality: pages and products live 4–6 weeks before demand peaks.
- Competitor research: Meta Ad Library and TikTok Creative Center for streetwear/supporter brands; Google search results for target keywords (who ranks, what pages they have, what is missing).
- Answer questions nobody answers well (size advice for oversized, care of puff prints, how club orders work).

## Shop operations rhythm

- Daily: orders, DMs, stock, reviews.
- Weekly: conversion rate (visits → add to cart → checkout → purchase), top products, abandoned carts, ad results (`ads-math`, `campaign-analytics`), Search Console queries.
- Monthly: margin per product after shipping, payment fees and ads; returns and reasons; restock decisions (`streetwear-drop-playbook`).

## Product research (for new designs, not generic dropshipping)

Score ideas on: emotional pull for 070 fans, uniqueness, photo/video friendliness, margin (target 60%+ on own production), size of the audience, timing. Validate with polls, waitlist signups and trial reels before ordering 30+ pieces.
