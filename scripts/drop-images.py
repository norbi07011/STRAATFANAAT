"""
Nowe zdjęcia produktów (mockup: przód po lewej, tył po prawej, 1536x1024).
Dla każdego: pełne zdjęcie, połówki przód/tył (do strony produktu i lookbooka)
oraz wycięcia bez tła do ściany w sklepie i efektów 3D.

Uruchom:  python3 scripts/drop-images.py <folder_ze_zdjęciami>
"""
import sys
from pathlib import Path
import cv2
import numpy as np
from PIL import Image
from rembg import new_session, remove

ROOT = Path(__file__).resolve().parent.parent
IMG = ROOT / 'public/images'
WALL = IMG / 'wall'
CUT = IMG / 'cutout'

# plik źródłowy -> (id produktu, nazwa plików)
SRC = {
    '638fc466-image.jpg': ('8', 'savage-drop'),
    '639d3dc5-image.jpg': ('17', 'fc-den-haag-back-drop'),
    'a635289e-image.jpg': ('24', 'fcdh-soul-neon'),
    '66ca898c-image.jpg': ('25', 'fcdh-soul-pink'),
    '347f9f3e-image.jpg': ('26', 'fcdh-gold-1905'),
    '011f60c1-image.jpg': ('27', 'money-bear'),
    '0dbc7c20-image.jpg': ('28', 'de-keizer'),
    'b4dff75d-image.jpg': ('29', 'geen-risico'),
}

session = new_session('isnet-general-use')


# Ciemna koszulka na ciemnym tle: dla kilku zdjęć inny model daje czystszą krawędź
OVERRIDE = {'26-f': ('u2net', True), '27-f': ('isnet-general-use', False), '28-b': ('isnet-general-use', False)}
_sessions = {'isnet-general-use': session}


def cut(im, key):
    model, post = OVERRIDE.get(key, ('isnet-general-use', True))
    ses = _sessions.setdefault(model, new_session(model) if model not in _sessions else _sessions[model])
    m = np.array(remove(im, session=ses, post_process_mask=post, only_mask=True).convert('L'))
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))
    out = im.convert('RGBA')
    out.putalpha(Image.fromarray(m))
    out = out.crop(out.getbbox())
    out.thumbnail((1200, 1200), Image.LANCZOS)
    return out


def main(src_dir):
    for name, (pid, slug) in SRC.items():
        im = Image.open(Path(src_dir) / name).convert('RGB')
        w, h = im.size
        im.save(IMG / f'{slug}.jpg', quality=92)
        halves = {'f': im.crop((0, 0, w // 2, h)), 'b': im.crop((w // 2, 0, w, h))}
        for side, half in halves.items():
            half.save(IMG / f"{slug}-{'front' if side == 'f' else 'back'}.jpg", quality=92)
            c = cut(half, f'{pid}-{side}')
            c.save(WALL / f'{pid}-{side}.webp', 'WEBP', quality=88, method=6)
            c.save(CUT / f"{slug}-{'front' if side == 'f' else 'back'}.webp", 'WEBP', quality=88, method=6)
        print('ok', pid, slug)


if __name__ == '__main__':
    main(sys.argv[1])
