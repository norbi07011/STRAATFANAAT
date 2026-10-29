"""
Spójne mockupy do ściany (Shop wall): każda koszulka na tym samym kroju, przód i tył.
Nadruk jest wycinany ze zdjęcia produktu (bez pudełek i tła) i nakładany na czystą koszulkę
z cieniowaniem fałd. Wynik: public/images/wall/<id>-f.webp oraz <id>-b.webp (gdy jest tył).

Uruchom:  python3 scripts/wall-mockups.py
"""
from pathlib import Path
import cv2
import numpy as np
from PIL import Image
from rembg import new_session, remove

ROOT = Path(__file__).resolve().parent.parent
IMG = ROOT / 'public/images'
OUT = IMG / 'wall'
OUT.mkdir(exist_ok=True)
DEBUG = ROOT / 'scripts/.wall-debug'

# id: (przód, tył, kolor koszulki)   None = brak zdjęcia tej strony
SPEC = {
    '1': ('straatfanaat4 podglad.jpeg', 'straatfanaat5 podglad.jpeg', 'black'),
    '2': ('omerta 3 podglad.jpeg', 'omerta4 podglad .jpeg', 'black'),
    '3': ('biała omerta4 podglad.jpeg', ('biała omerta5 podglad.jpeg', (0.0, 0.0, 1.0, 0.63)), 'white'),
    '4': (('fcdh blak3.jpeg', (0.03, 0.0, 0.56, 1.0)), ('fcdh blak3.jpeg', (0.44, 0.0, 1.0, 1.0)), 'black'),
    '5': ('biała fcdh4 podglad.jpeg', 'biała fcdh5 podglad.jpeg', 'white'),
    '6': ('bocian4 podglad.jpeg', 'bocian5 podglad.jpeg', 'black'),
    '7': ('champion4 podglad.jpeg', 'champion5 podglad.jpeg', 'black'),
    '8': ('savage omerta2.jpeg', None, 'black'),
    '10': ('straatfanaat strit podglad.jpeg', None, 'white'),
    '11': (None, 'herb podglad.jpeg', 'black'),
    '12': ('DH miasto podglad.jpeg', None, 'black'),
    '13': (None, 'damska fcdh rózowy  podglad.jpeg', 'black'),
    '14': ('kolekcja dla niego dla niej damska  podglad.jpeg', 'kolekcja dla niej dla niego damska podglad .jpeg', 'black'),
    '15': ('kolekcja dla niego dla niej meska 1 podglad.jpeg', 'kolekcja dla niej dla niego meska podglad .jpeg', 'black'),
    '17': ('fc den haag  back 1.jpeg', 'fc den haag  back .jpeg', 'black'),
    '18': ('elegant (2).png', 'elegant (1).png', 'black'),
    '19': ('hooligan (1).png', 'hooligan (2).png', 'black'),
    '20': ('Koszulka z abstrakcyjnym nadrukiem.png', None, 'black'),
    '21': ('straatfanaat (L) (2).png', 'straatfanaat (L) (1).png', 'black'),
    '22': ('street (2).png', 'street (1).png', 'black'),
    '23': ('T-shirt z geometrycznym nadrukiem.png', None, 'black'),
}

cloth = new_session('u2net_cloth_seg')
general = new_session('isnet-general-use')
SCALE = 2


def load(spec):
    name, crop = (spec, None) if isinstance(spec, str) else spec
    im = Image.open(IMG / name).convert('RGB')
    if crop:
        w, h = im.size
        im = im.crop((int(crop[0] * w), int(crop[1] * h), int(crop[2] * w), int(crop[3] * h)))
    return im


def shirt_mask(im):
    """Maska koszulki: górna część garderoby z u2net_cloth_seg (bez pudełek, ludzi i tła)."""
    small = im.copy()
    small.thumbnail((1024, 1024))
    out = remove(small, session=cloth, only_mask=True).convert('L')
    m = np.array(out)
    m = m[: small.height]  # górny pas = górna część garderoby
    m = cv2.resize(m, im.size, interpolation=cv2.INTER_LINEAR)
    m = (m > 110).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(m, 8)
    if n > 1:
        m = (lab == 1 + np.argmax(st[1:, cv2.CC_STAT_AREA])).astype(np.uint8)
    # dziury (jasny nadruk bywa brany za tło) wypełniamy
    pad = np.pad(1 - m, 4, constant_values=1).astype(np.uint8) * 255
    ff = np.zeros((pad.shape[0] + 2, pad.shape[1] + 2), np.uint8)
    cv2.floodFill(pad, ff, (0, 0), 0)
    m = (m | (pad[4:-4, 4:-4] > 0)).astype(np.uint8)
    return m


THRESH = {'18-f': 44}


def extract_print(im, mask, color, key=''):
    """Wycina sam nadruk z koszulki: piksele wyraźnie inne niż bazowy kolor tkaniny."""
    a = np.array(im).astype(np.float32)
    L = a.mean(axis=2)
    hsv = cv2.cvtColor(a.astype(np.uint8), cv2.COLOR_RGB2HSV)
    sat = hsv[..., 1].astype(np.float32)
    inner = cv2.erode(mask, np.ones((25, 25), np.uint8))
    ys, xs = np.where(mask > 0)
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    w = x1 - x0
    # tylko korpus (bez rękawów, z marginesem od krawędzi)
    body = np.zeros_like(mask)
    body[y0 + int(0.04 * w): y1, x0 + int(0.22 * w): x1 - int(0.22 * w)] = 1
    region = (inner & body).astype(bool)
    base = np.median(L[region])
    # lokalne oświetlenie tkaniny (fałdy) — odejmujemy je, żeby nie łapać cieni
    bg = cv2.medianBlur(np.clip(L, 0, 255).astype(np.uint8), 31).astype(np.float32)
    if color == 'black':
        diff = L - np.minimum(bg, base + 18)
        alpha = np.clip((diff - THRESH.get(key, 26)) * 6, 0, 255)
    else:
        diff = base - L  # biała koszulka: mało fałd, duże ciemne nadruki nie mogą „zjeść” tła
        alpha = np.clip((diff - 22) * 6, 0, 255)
    alpha = np.maximum(alpha, np.clip((sat - 70) * 4, 0, 255) * (L > 35))
    alpha *= region
    # usuń drobny szum
    bw = (alpha > 60).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(bw, 8)
    keep = np.zeros_like(bw)
    for i in range(1, n):
        if st[i, cv2.CC_STAT_AREA] >= 12:
            keep[lab == i] = 1
    keep = cv2.dilate(keep, np.ones((5, 5), np.uint8))
    alpha *= keep
    alpha = cv2.GaussianBlur(alpha, (0, 0), 0.6)
    rgb = a.copy()
    if color == 'black':
        rgb = np.clip((rgb - base * 0.6) * 1.08, 0, 255)
    return np.dstack([rgb, alpha]).astype(np.uint8), (x0, y0, x1, y1)


def blank(side, color):
    im = np.array(Image.open(ROOT / f'scripts/blank-{side}.png').convert('RGBA'))
    im = cv2.resize(im, (im.shape[1] * SCALE, im.shape[0] * SCALE), interpolation=cv2.INTER_LANCZOS4).astype(np.float32)
    if color == 'white':
        L = im[..., :3].mean(axis=2)
        a = im[..., 3] > 128
        lo, hi = np.percentile(L[a], 2), np.percentile(L[a], 99.5)
        n = np.clip((L - lo) / (hi - lo), 0, 1)
        shade = 0.72 + 0.32 * n ** 0.8
        im[..., :3] = np.array([242, 241, 237], np.float32)[None, None] * shade[..., None]
    return im


def composite(shirt, pr, src_box, side):
    H, W = shirt.shape[:2]
    a = shirt[..., 3] > 128
    ys, xs = np.where(a)
    tx0, tx1, ty0 = xs.min(), xs.max(), ys.min()
    sx0, sy0, sx1, _ = src_box
    s = (tx1 - tx0) / max(1, (sx1 - sx0))
    M = np.float32([[s, 0, tx0 - sx0 * s], [0, s, ty0 - sy0 * s]])
    layer = cv2.warpAffine(pr.astype(np.float32), M, (W, H), flags=cv2.INTER_LANCZOS4, borderValue=0)
    L = shirt[..., :3].mean(axis=2)
    Lb = cv2.GaussianBlur(L, (0, 0), 3)
    mean = cv2.GaussianBlur(L, (0, 0), 30) + 1
    ratio = np.clip(Lb / mean, 0.6, 1.35) ** 0.8
    gx = cv2.Sobel(cv2.GaussianBlur(L, (0, 0), 6), cv2.CV_32F, 1, 0, ksize=5)
    gy = cv2.Sobel(cv2.GaussianBlur(L, (0, 0), 6), cv2.CV_32F, 0, 1, ksize=5)
    mx, my = np.meshgrid(np.arange(W, dtype=np.float32), np.arange(H, dtype=np.float32))
    layer = cv2.remap(layer, mx + gx * 0.02, my + gy * 0.02, cv2.INTER_LINEAR, borderValue=0)
    alpha = (layer[..., 3] / 255.0) * (shirt[..., 3] / 255.0) * 0.98
    out = shirt.copy()
    out[..., :3] = shirt[..., :3] * (1 - alpha[..., None]) + np.clip(layer[..., :3] * ratio[..., None], 0, 255) * alpha[..., None]
    return out


def save(arr, path):
    im = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
    im = im.crop(im.getbbox())
    im.thumbnail((1200, 1200), Image.LANCZOS)
    im.save(path, 'WEBP', quality=88, method=6)


def main():
    DEBUG.mkdir(exist_ok=True)
    for pid, (front, back, color) in SPEC.items():
        for side, spec in (('f', front), ('b', back)):
            dst = OUT / f'{pid}-{side}.webp'
            if spec is None:
                if dst.exists():
                    dst.unlink()
                continue
            im = load(spec)
            m = shirt_mask(im)
            pr, box = extract_print(im, m, color, f'{pid}-{side}')
            Image.fromarray(pr).save(DEBUG / f'{pid}-{side}-print.png')
            shirt = blank('front' if side == 'f' else 'back', color)
            save(composite(shirt, pr, box, side), dst)
            print('ok', pid, side)
    # czapka bez zmian: zwykłe wycięcie z tła
    cap = remove(Image.open(IMG / 'czapka.jpeg').convert('RGB'), session=general, post_process_mask=True)
    cap = cap.crop(cap.getbbox())
    cap.thumbnail((1200, 1200))
    cap.save(OUT / '16-f.webp', 'WEBP', quality=88, method=6)
    print('ok 16 f')


if __name__ == '__main__':
    main()
