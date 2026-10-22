// Zdjęcia lookbooka: każde wskazuje produkt, a hotspot (x, y w %) leży na nadruku.
export type Chapter = 'classic' | 'graphic' | 'women';

export interface Look {
  id: string;
  image: string;
  productId: string;
  chapter: Chapter;
  hotspot: { x: number; y: number };
}

export const LOOKS: Look[] = [
  { id: 'l1', image: '/images/straatfanaat.jpg', productId: '1', chapter: 'classic', hotspot: { x: 47, y: 52 } },
  { id: 'l2', image: '/images/fc%20den%20haag%20%20back%202.jpeg', productId: '17', chapter: 'classic', hotspot: { x: 50, y: 30 } },
  { id: 'l3', image: '/images/fcdh%20blak%20(1).jpg', productId: '4', chapter: 'classic', hotspot: { x: 52, y: 45 } },
  { id: 'l4', image: '/images/bia%C5%82a%20fcdh%20(1).jpg', productId: '5', chapter: 'classic', hotspot: { x: 50, y: 50 } },
  { id: 'l5', image: '/images/champion.jpg', productId: '7', chapter: 'classic', hotspot: { x: 50, y: 42 } },
  { id: 'l6', image: '/images/straatfanaat%20strit1.jpeg', productId: '10', chapter: 'classic', hotspot: { x: 50, y: 70 } },
  { id: 'l7', image: '/images/czapka.jpeg', productId: '16', chapter: 'classic', hotspot: { x: 45, y: 45 } },
  { id: 'g1', image: '/images/omerta%20(1).jpg', productId: '2', chapter: 'graphic', hotspot: { x: 52, y: 52 } },
  { id: 'g2', image: '/images/savage%20omerta.jpeg', productId: '8', chapter: 'graphic', hotspot: { x: 55, y: 38 } },
  { id: 'g3', image: '/images/bia%C5%82a%20omerta.jpg', productId: '3', chapter: 'graphic', hotspot: { x: 50, y: 48 } },
  { id: 'g4', image: '/images/bocian%20(1).jpg', productId: '6', chapter: 'graphic', hotspot: { x: 50, y: 52 } },
  { id: 'g5', image: '/images/herb1.jpeg', productId: '11', chapter: 'graphic', hotspot: { x: 50, y: 50 } },
  { id: 'g6', image: '/images/savage%20omerta1.jpeg', productId: '8', chapter: 'graphic', hotspot: { x: 57, y: 32 } },
  { id: 'g7', image: '/images/DH%20miasto%20podglad.jpeg', productId: '12', chapter: 'graphic', hotspot: { x: 45, y: 38 } },
  { id: 'w1', image: '/images/damska%20fcdh%20r%C3%B3zowy%201.jpeg', productId: '13', chapter: 'women', hotspot: { x: 50, y: 50 } },
  { id: 'w2', image: '/images/kolekcja%20dla%20niej%20dla%20niego%20damska%20.jpeg', productId: '14', chapter: 'women', hotspot: { x: 50, y: 50 } },
  { id: 'w3', image: '/images/kolekcja%20dla%20niego%20dla%20niej%20sesia%20.jpeg', productId: '15', chapter: 'women', hotspot: { x: 35, y: 42 } },
  { id: 'w4', image: '/images/kolekcja%20dla%20niego%20dla%20niej%20sesia2.jpeg', productId: '14', chapter: 'women', hotspot: { x: 72, y: 37 } },
];
