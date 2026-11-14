---
name: straatfanaat-graphics
description: Make or update STRAATFANAAT social graphics (Instagram/Facebook posts 1080x1350, stories and reel end cards 1080x1920, carousel slides, price cards, announcements) from real product photos using the project's HTML template and headless Chrome. Use whenever a post, carousel, story, ad image or banner for the brand is needed.
---

# STRAATFANAAT graphics pipeline

## Rules

- **Real photos only.** Product images must show the actual shirt the customer receives. Many existing images in `public/images` were generated with GPT and contain errors (wrong backs, "ELLEGANT" neck label). Do not use an image for ads or posts until the owner has confirmed it matches the real product.
- AI image generation is fine for backgrounds, moods and concept art, never for the product itself.
- Apply the naming rule from `straatfanaat-nl-voice` (no "ADO", no club crest).
- Text on graphics is Dutch.

## Brand tokens

- Colours: black `#000`, asphalt `#1c1d1f`, paper `#e4e4e0`, Haag yellow `#ffd21f`, Haag green `#0b8a44`, bright green `#22b35e`.
- Font: Archivo variable (`node_modules/@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2`). Headlines: weight 900, `font-stretch: 62%`, uppercase, line-height .84. Small labels: `font-stretch: 125%`, weight 700, uppercase, letter-spacing .08em.
- Signature element: yellow/green scarf stripe top and bottom (90px blocks, 28px high).
- Dark smoky radial background, product with deep drop shadow.

## How to make graphics

1. Template: `marketing/grafiki/szablon.html`. Each graphic is a function in the `slides` object, selected by URL hash (`szablon.html#post05-zo-bestel-je`). Add a new entry by copying an existing one.
2. Product cut-outs (transparent WebP) live in `public/images/cutout/`. For new real photos: remove the background (Adobe `image_remove_background` tool, or the project's `scripts/cutouts.py`), save as WebP in `public/images/cutout/`.
3. Render with headless Chrome (bash):

```bash
CH="/c/Program Files/Google/Chrome/Application/chrome.exe"
"$CH" --headless=new --disable-gpu --hide-scrollbars --allow-file-access-from-files \
  --virtual-time-budget=3000 --window-size=1080,1350 \
  --screenshot="E:/strony/straatfanaat/marketing/grafiki/png/NAME.png" \
  "file:///E:/strony/straatfanaat/marketing/grafiki/szablon.html#NAME"
```

Use `--window-size=1080,1920` for stories and reel cards.

4. **Always open every PNG and check it**: text not overlapping, product print not covered, nothing cut off at the edges, Dutch spelled correctly. Fix and re-render before showing the owner.
5. Send the finished files to the owner with `SendUserFile`.

## Sizes

| Use | Size |
|---|---|
| IG/FB feed post, carousel | 1080x1350 (4:5) |
| Story, reel cover, reel end card, TikTok | 1080x1920 (9:16) |
| Meta ad square fallback | 1080x1080 |
| Website OG image | 1200x630 |

## Rule from owner feedback (2026-11-07): no pasted prints on AI shirts
A flat print pasted onto an AI-generated plain shirt (`nadruk.py`) looks fake: it doesn't follow folds, perspective or arms, and the owner rejected it ("logo krzywo, inne, nie nadaje się"). For ads, videos and Genjutsu/Kling reference images:
- Use **real photos of the real shirt on a real person** (`E:\STRAATFANAAT-marketing\zdjecia-prawdziwe\`, e.g. `haag-back-przod-czapka.jpg`, `elegant-fcdh-plecy-ulica.jpg`). If a needed angle is missing, ask the owner for a 5-minute phone shoot (full body, front and back, Hague street, daylight).
- Genjutsu takes person, clothes and location 100% from the reference image and only the motion from the template, so the reference image must already be perfect.
- `nadruk.py` is acceptable only for flat mockups (product on hanger/flat lay), never on a moving or posing body.
- 2026-11-07, second rejection: a better composite (Adobe shirt mask, displacement on folds, fabric shading, grain) on GPT photos of DE KEIZER was rejected again ("nieakceptowalne, wzorka dobrze nie widać, krzywo"). The GPT photos are only 941 px wide, so the print ends up about 180 px: soft and dim, with no perspective. Do not propose any print compositing on AI photos again, whatever the technique (including the Adobe connector, which has no generative fill or compositing). Product on a body = real photo of the real shirt only.
