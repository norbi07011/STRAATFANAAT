import { supabase } from './supabase';

// Zapisy na listę oczekujących i newsletter.
// Tabele tworzy plik supabase/signups.sql (uruchom go raz w Supabase → SQL Editor).

export const joinWaitlist = async (input: {
  productId: string;
  productName: string;
  contactType: 'email' | 'whatsapp';
  contact: string;
  language: string;
}) => {
  const { error } = await supabase.from('waitlist_signups').insert({
    product_id: input.productId,
    product_name: input.productName,
    contact_type: input.contactType,
    contact: input.contact.trim(),
    language: input.language,
  });
  if (error) throw error;
};

export const joinNewsletter = async (email: string, language: string) => {
  const { error } = await supabase
    .from('newsletter_subscribers')
    .insert({ email: email.trim().toLowerCase(), language });
  // 23505 = adres już zapisany; dla klienta to też sukces
  if (error && error.code !== '23505') throw error;
};
