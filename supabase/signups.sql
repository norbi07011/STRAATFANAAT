-- STRAATFANAAT: lista oczekujących + newsletter
-- Uruchom raz w Supabase → SQL Editor.
-- Klient (klucz anon) może TYLKO dodawać wpisy, nie może ich czytać.

create table if not exists public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  product_id text not null,
  product_name text,
  contact_type text not null check (contact_type in ('email', 'whatsapp')),
  contact text not null check (char_length(contact) between 5 and 200),
  language text,
  created_at timestamptz not null default now()
);

alter table public.waitlist_signups enable row level security;

drop policy if exists "anon can join waitlist" on public.waitlist_signups;
create policy "anon can join waitlist"
  on public.waitlist_signups for insert
  to anon, authenticated
  with check (true);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);
alter table public.newsletter_subscribers add column if not exists language text;

alter table public.newsletter_subscribers enable row level security;

drop policy if exists "anon can subscribe" on public.newsletter_subscribers;
create policy "anon can subscribe"
  on public.newsletter_subscribers for insert
  to anon, authenticated
  with check (true);

-- Licznik osób czekających na produkt (publiczny, bez danych kontaktowych)
create or replace view public.v_waitlist_counts as
  select product_id, count(*)::int as waiting
  from public.waitlist_signups
  group by product_id;

grant select on public.v_waitlist_counts to anon, authenticated;
