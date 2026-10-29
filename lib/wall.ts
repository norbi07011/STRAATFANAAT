// Zdjęcia do „ściany” w sklepie (generowane przez scripts/wall-mockups.py).
// Każdy produkt ma przód i/lub tył na tym samym kroju koszulki.

const ONLY: Record<string, 'f' | 'b'> = {
  '8': 'f',
  '10': 'f',
  '11': 'b',
  '12': 'f',
  '13': 'b',
  '16': 'f',
  '20': 'f',
  '23': 'f',
};

export const wallSides = (id: string) => {
  const only = ONLY[id];
  const front = only === 'b' ? null : `/images/wall/${id}-f.webp`;
  const back = only === 'f' ? null : `/images/wall/${id}-b.webp`;
  return { front, back, main: (front ?? back)!, canFlip: !!front && !!back };
};
