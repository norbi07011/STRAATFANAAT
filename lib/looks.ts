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
  { id: 'l1', image: '/images/fc%20den%20haag%20%20back%202.jpeg', productId: '17', chapter: 'classic', hotspot: { x: 50, y: 30 } },
  { id: 'l2', image: '/images/fc-den-haag-back-drop-front.jpg', productId: '17', chapter: 'classic', hotspot: { x: 50, y: 36 } },
  { id: 'l3', image: '/images/czapka.jpeg', productId: '16', chapter: 'classic', hotspot: { x: 45, y: 45 } },
  { id: 'l4', image: '/images/geen-risico-front.jpg', productId: '29', chapter: 'classic', hotspot: { x: 50, y: 30 } },
  { id: 'l5', image: '/images/fcdh-gold-1905-front.jpg', productId: '26', chapter: 'classic', hotspot: { x: 50, y: 32 } },
  { id: 'l6', image: '/images/de-keizer-front.jpg', productId: '28', chapter: 'classic', hotspot: { x: 50, y: 36 } },
  { id: 'l7', image: '/images/savage-drop-front.jpg', productId: '8', chapter: 'classic', hotspot: { x: 62, y: 38 } },
  { id: 'g1', image: '/images/savage%20omerta.jpeg', productId: '8', chapter: 'graphic', hotspot: { x: 55, y: 38 } },
  { id: 'g2', image: '/images/fcdh-soul-neon-back.jpg', productId: '24', chapter: 'graphic', hotspot: { x: 50, y: 45 } },
  { id: 'g3', image: '/images/fcdh-soul-pink-back.jpg', productId: '25', chapter: 'graphic', hotspot: { x: 50, y: 45 } },
  { id: 'g4', image: '/images/money-bear-back.jpg', productId: '27', chapter: 'graphic', hotspot: { x: 50, y: 42 } },
  { id: 'g5', image: '/images/fcdh-gold-1905-back.jpg', productId: '26', chapter: 'graphic', hotspot: { x: 50, y: 42 } },
  { id: 'g6', image: '/images/fc-den-haag-back-drop-back.jpg', productId: '17', chapter: 'graphic', hotspot: { x: 50, y: 40 } },
  { id: 'g7', image: '/images/de-keizer-back.jpg', productId: '28', chapter: 'graphic', hotspot: { x: 50, y: 42 } },
  { id: 'g8', image: '/images/geen-risico-back.jpg', productId: '29', chapter: 'graphic', hotspot: { x: 50, y: 42 } },
  { id: 'g9', image: '/images/savage-drop-back.jpg', productId: '8', chapter: 'graphic', hotspot: { x: 50, y: 40 } },
  { id: 'g10', image: '/images/savage%20omerta1.jpeg', productId: '8', chapter: 'graphic', hotspot: { x: 57, y: 32 } },
];
