// Zdjęcia do „ściany” w sklepie: wycięcia bez tła (scripts/drop-images.py).
// Każda koszulka ma przód i tył; czapka tylko jedno ujęcie.

const ONLY: Record<string, 'f' | 'b'> = {
  '16': 'f',
};

export const wallSides = (id: string) => {
  const only = ONLY[id];
  const front = only === 'b' ? null : `/images/wall/${id}-f.webp`;
  const back = only === 'f' ? null : `/images/wall/${id}-b.webp`;
  return { front, back, main: (front ?? back)!, canFlip: !!front && !!back };
};
