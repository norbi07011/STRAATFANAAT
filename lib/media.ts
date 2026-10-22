// Mapuje oryginalne ścieżki (/images/…) na zoptymalizowane wersje WebP
// wygenerowane przez scripts/optimize-media.mjs (npm run optimize).

const slug = (name: string) =>
  name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ł/g, 'l')
    .replace(/Ł/g, 'L')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const baseName = (src: string) => {
  const file = decodeURIComponent(src.split('/').pop() || '');
  return slug(file.replace(/\.[^.]+$/, ''));
};

export const img = (src: string, width: 800 | 1600 = 800) => {
  if (!src || !src.startsWith('/images/') || src.startsWith('/images/opt/')) return src;
  return `/images/opt/${baseName(src)}-${width}.webp`;
};

export const srcSet = (src: string) => `${img(src, 800)} 800w, ${img(src, 1600)} 1600w`;

export const video = (src: string) => {
  const base = baseName(src);
  return { src: `/video/opt/${base}.mp4`, poster: `/video/opt/${base}.webp` };
};
