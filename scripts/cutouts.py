# Wycina produkty z tła (rembg) -> public/images/cutout/<slug>.webp (przezroczyste tło)
import sys, re, unicodedata, io
from pathlib import Path
from rembg import remove, new_session
from PIL import Image

FILES = [
    'elegant (1).png', 'elegant (2).png', 'hooligan (1).png', 'hooligan (2).png',
    'straatfanaat (L) (1).png', 'straatfanaat (L) (2).png', 'street (1).png', 'street (2).png',
    'Koszulka z abstrakcyjnym nadrukiem.png', 'T-shirt z geometrycznym nadrukiem.png',
    'czapka.jpeg', 'fc den haag  back .jpeg', 'fc den haag  back 1.jpeg',
]

def slug(s):
    s = unicodedata.normalize('NFD', s).encode('ascii', 'ignore').decode().replace('ł', 'l').lower()
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')

src = Path('public/images'); out = Path('public/images/cutout')
session = new_session('isnet-general-use')
for f in FILES:
    dst = out / f"{slug(Path(f).stem)}.webp"
    if dst.exists():
        continue
    im = Image.open(src / f).convert('RGB')
    im.thumbnail((1100, 1100))
    cut = remove(im, session=session, post_process_mask=True)
    bbox = cut.getbbox()
    if bbox:
        cut = cut.crop(bbox)
    cut.save(dst, 'WEBP', quality=82, method=6)
    print('ok', dst, cut.size)
