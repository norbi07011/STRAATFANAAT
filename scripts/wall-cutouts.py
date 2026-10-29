# Wycina produkty do „ściany” (Shop wall): public/images/wall/<id>.webp, przezroczyste tło.
import cv2, numpy as np
from pathlib import Path
from PIL import Image
from rembg import remove, new_session

SRC = {
    '1': 'straatfanaat5 podglad.jpeg', '2': 'omerta4 podglad .jpeg', '3': 'biała omerta4 podglad.jpeg',
    '4': ('fcdh blak3.jpeg', (0.565, 0.0, 1.0, 1.0)), '5': 'biała fcdh4 podglad.jpeg', '6': 'bocian4 podglad.jpeg',
    '7': 'champion5 podglad.jpeg', '8': 'savage omerta2.jpeg', '10': 'straatfanaat strit podglad.jpeg',
    '11': 'herb podglad.jpeg', '12': 'DH miasto podglad.jpeg', '13': 'damska fcdh rózowy  podglad.jpeg',
    '14': 'kolekcja dla niej dla niego damska podglad .jpeg', '15': 'kolekcja dla niego dla niej meska 1 podglad.jpeg',
    '16': 'czapka.jpeg', '17': 'fc den haag  back 1.jpeg', '18': 'elegant (1).png', '19': 'hooligan (2).png',
    '20': 'Koszulka z abstrakcyjnym nadrukiem.png', '21': 'straatfanaat (L) (1).png', '22': 'street (1).png',
    '23': 'T-shirt z geometrycznym nadrukiem.png',
}
src = Path('public/images'); out = Path('public/images/wall'); out.mkdir(exist_ok=True)
session = new_session('isnet-general-use')
for pid, spec in SRC.items():
    dst = out / f'{pid}.webp'
    if dst.exists():
        continue
    name, crop = (spec, None) if isinstance(spec, str) else spec
    im = Image.open(src / name).convert('RGB')
    if crop:
        w, h = im.size
        im = im.crop((int(crop[0] * w), int(crop[1] * h), int(crop[2] * w), int(crop[3] * h)))
    cut = np.array(remove(im, session=session, post_process_mask=True))
    a = cut[..., 3]
    # zostaw tylko największy element (koszulka), bez pudełka i drobnych śmieci
    n, lab, stats, _ = cv2.connectedComponentsWithStats((a > 40).astype(np.uint8), 8)
    if n > 1:
        big = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])
        keep = cv2.dilate((lab == big).astype(np.uint8), np.ones((5, 5), np.uint8))
        cut[..., 3] = (a * keep).astype(np.uint8)
    img = Image.fromarray(cut)
    img = img.crop(img.getbbox())
    img.thumbnail((1100, 1100), Image.LANCZOS)
    img.save(dst, 'WEBP', quality=86, method=6)
    print(pid, img.size)
