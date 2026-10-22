// Generuje zoptymalizowane wersje zdjęć (WebP 800/1600 px) i filmów (720p MP4 + plakat).
// Uruchom: npm run optimize
import sharp from 'sharp';
import { readdirSync, mkdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

export const slug = (name) =>
  name.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l').replace(/Ł/g, 'L')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const root = path.resolve('public');
const imgIn = path.join(root, 'images');
const imgOut = path.join(imgIn, 'opt');
mkdirSync(imgOut, { recursive: true });

for (const f of readdirSync(imgIn)) {
  if (!/\.(jpe?g|png)$/i.test(f)) continue;
  const base = slug(f.replace(/\.[^.]+$/, ''));
  for (const w of [800, 1600]) {
    const out = path.join(imgOut, `${base}-${w}.webp`);
    if (existsSync(out)) continue;
    await sharp(path.join(imgIn, f)).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: 78 }).toFile(out);
  }
}

const vIn = path.join(root, 'video');
const vOut = path.join(vIn, 'opt');
mkdirSync(vOut, { recursive: true });
for (const f of readdirSync(vIn)) {
  if (!/\.mp4$/i.test(f)) continue;
  const base = slug(f.replace(/\.[^.]+$/, ''));
  const out = path.join(vOut, `${base}.mp4`);
  if (!existsSync(out)) {
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', path.join(vIn, f), '-vf', "scale='min(1280,iw)':-2", '-c:v', 'libx264', '-crf', '27', '-preset', 'slow', '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', out]);
  }
  const poster = path.join(vOut, `${base}.webp`);
  if (!existsSync(poster)) {
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', '0.5', '-i', out, '-frames:v', '1', '-vf', "scale='min(1280,iw)':-2", path.join(vOut, `${base}.png`)]);
    await sharp(path.join(vOut, `${base}.png`)).webp({ quality: 75 }).toFile(poster);
    execFileSync('rm', [path.join(vOut, `${base}.png`)]);
  }
}
console.log('Gotowe');
// Krótka pętla do hero (bez dźwięku): 9 s z filmu „savage”
const heroLoop = path.join(vOut, 'hero-loop.mp4');
if (!existsSync(heroLoop)) {
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-t', '9', '-i', path.join(vIn, 'savage .mp4'), '-vf', "scale='min(720,iw)':-2", '-c:v', 'libx264', '-crf', '26', '-preset', 'slow', '-an', '-movflags', '+faststart', heroLoop]);
}
