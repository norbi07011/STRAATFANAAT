import { CartItem, Language } from '../types';
import { ui } from './i18n';

// Numer WhatsApp sklepu w formacie międzynarodowym, same cyfry (np. 31612345678).
// Dopóki jest pusty, zamówienia idą przez DM na Instagramie.
export const WHATSAPP_NUMBER = '31642474314';
export const INSTAGRAM_DM = 'https://ig.me/m/straatfanat';
export const HAS_WHATSAPP = WHATSAPP_NUMBER.length > 0;

// Do czasu podpięcia płatności (Mollie/iDEAL) zamówienia przyjmujemy przez WhatsApp/DM.
export const ONLINE_CHECKOUT_ENABLED = false;

export const whatsappOrderLink = (cart: CartItem[], lang: Language) => {
  if (!HAS_WHATSAPP) return INSTAGRAM_DM;
  const u = ui(lang);
  const lines = cart.map((i) => `- ${i.quantity}x ${i.name}, ${u.size} ${i.selectedSize} (€${i.price * i.quantity})`);
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const text = [u.orderMsg, ...lines, `${u.subtotal}: €${total}`].join('\n');
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
};

// Zwykły kontakt (pytanie o rozmiar, dostawę, zamówienie klubowe): otwiera rozmowę z właścicielem.
const CONTACT_MSG: Record<Language, string> = {
  NL: 'Hoi STRAATFANAAT, ik heb een vraag:',
  EN: 'Hi STRAATFANAAT, I have a question:',
  PL: 'Cześć STRAATFANAAT, mam pytanie:',
};

export const whatsappContactLink = (lang: Language) =>
  HAS_WHATSAPP
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(CONTACT_MSG[lang])}`
    : INSTAGRAM_DM;
