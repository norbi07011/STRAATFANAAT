# Wnioski: dropshipping, prowadzenie sklepu i Google (2026-11-07)

Transkrypcje są w `marketing/wiedza/transkrypcje/`. Dwa filmy z playlisty (Trading 212, inwestowanie dla początkujących) dotyczą giełdy, nie sklepów, więc ich nie analizowałem.

## Co mówią filmy (i co z tego bierzemy)

**Ogólna uwaga:** 6 z 7 filmów to reklama płatnych narzędzi (AutoDS, ZenDrop, StoreBuild, CreateUGC, Stan Store) z linkami afiliacyjnymi i promocjami Shopify. Model w nich to dropshipping przypadkowych produktów z Chin. My mamy własną markę, własne projekty i towar na miejscu, więc to inny, lepszy biznes. Bierzemy tylko to, co pasuje.

1. **Układ strony produktu, który konwertuje** (Austin Rabin, Haven Golf, 3,9 mln USD): tytuł → gwiazdki opinii → cena → tabela rozmiarów → prawdziwa informacja o stanie → wybór rozmiaru → przyciski kupna → ikonki korzyści → rozwijane sekcje (opis, rozmiar i krój, zwroty) → kolekcje → Instagram → opinie. Bez sztucznych liczników czasu, bo obniżają konwersję. Zapisane w skillu `webshop-growth-nl`.
2. **Klient decyduje w 3 sekundy, czy ufa sklepowi** (Mark Tilbury). Pasek darmowej wysyłki u góry podnosi wartość koszyka. Pakiety (2 koszulki taniej) zwiększają zamówienie.
3. **Realny wynik dropshippingu w 7 dni:** 150 USD na reklamy Meta dało 402 USD przychodu, a więc po kosztach produktu prawie zero zysku. Dropshipping z Chin w NL oznacza 2–3 tygodnie dostawy, zwroty i chargebacki. My wysyłamy z Holandii, co jest dużą przewagą.
4. **Badanie konkurencji przez Meta Ad Library:** widać wszystkie reklamy konkurencji, które z nich działają najdłużej, teksty i strony docelowe. Darmowe, robimy to dla marek streetwearowych i kibicowskich.
5. **Ocena produktu przed testem:** emocja, rozwiązanie problemu, czy dobrze wygląda na wideo, marża 40–75%. U nas: oceniamy nowe projekty, a potem testujemy je ankietą, listą oczekujących i trial reels, zanim zamówimy 30 sztuk.
6. **Reklamy TikTok na start:** szeroko, bez zawężania zainteresowań (algorytm sam szuka), 18+, kilka wersji wideo. Pasuje do naszego planu, gdy ruszy sklep.
7. **Reklamy UGC z AI:** popularne, ale produkt musi być prawdziwy. Robimy to tylko z prawdziwymi zdjęciami koszulek i z oznaczeniem AI.

## Czego filmy nie mówią, a co jest kluczowe dla nas

### Google: nie ma sztuczki, która przechytrzy Google
Kupowane linki, upychanie słów, fałszywe opinie, strony generowane masowo przez AI, kopiowanie cudzych sklepów: Google to wykrywa i obniża stronę albo usuwa ją z wyników. Być „dwa kroki przed Google” znaczy robić to, co Google nagradza, wcześniej i lepiej niż konkurencja.

### 10 rzeczy, które dadzą nam pierwsze miejsca
1. **Google Merchant Center, darmowe wyniki produktowe.** Największa szybka wygrana dla odzieży: nasze koszulki za darmo w zakładce Zakupy, w Grafice i w wynikach wyszukiwania. Wymaga pliku z danymi produktów (tytuł, cena, stan, zdjęcia, rozmiar, kolor, marka).
2. **Profil firmy w Google (Google Business Profile).** Wyniki na „streetwear Den Haag” i w Mapach. Sklep online z odbiorem w Hadze też się kwalifikuje.
3. **Nazwa marki na 1. miejscu.** Na hasło „straatfanaat” musimy wyskakiwać od razu ze sklepem, profilem w Google i kontami social. Dane strukturalne Organization i spójna nazwa wszędzie.
4. **Techniczne SEO.** Obecna strona to aplikacja React renderowana w przeglądarce. Google i boty AI widzą prawie pustą stronę. Potrzebne: HTML renderowany na serwerze, osobny adres i tytuł dla każdego produktu, dane strukturalne Product (cena, dostępność, opinie), mapa strony, wersje językowe NL/EN/PL pod osobnymi adresami.
5. **Strony pod konkretne wyszukiwania po niderlandzku**, np. „Den Haag shirt”, „Haagse kleding”, „070 shirt”, „cadeau Haagse voetbalfan”, a dla B2B „clubkleding laten maken”, „teamkleding bedrukken”. To ostatnie to hasła z gotowością do zakupu i często słabą konkurencją.
6. **Opinie:** Google i Kiyoh/WebwinkelKeur (holenderskie znaki zaufania). Prosimy każdego kupującego e-mailem po 7 dniach.
7. **Wzmianki i linki z lokalnych mediów:** Omroep West, AD Haagsche Courant, Den Haag FM, Indebuurt Den Haag. Historia „polsko-haska marka z własną szwalnią” to dobry temat dla dziennikarzy.
8. **Odpowiedzi AI (ChatGPT, Perplexity, AI Overviews w Google):** spójne fakty o marce wszędzie, strona FAQ i „o nas” z konkretami, plik llms.txt, wzmianki w artykułach.
9. **Wideo i obrazy w wyszukiwarce:** Shorts, TikTok i Pinterest są indeksowane. Nazwy plików i opisy zdjęć po niderlandzku.
10. **Wyprzedzanie sezonu:** Google Trends i Search Console co tydzień, strony i produkty gotowe 4–6 tygodni przed szczytem (start sezonu, derby, Koningsdag, Sinterklaas).

### Decyzja do podjęcia: platforma sklepu
Obecna strona wygląda świetnie, ale nie ma prawdziwej kasy, a każdą funkcję sklepu (płatności iDEAL, stany, rabaty, e-maile o porzuconym koszyku, plik produktów dla Google, sklep na Instagramie) trzeba pisać od zera. Do tego SEO jest słabe przez renderowanie w przeglądarce.

Rekomendacja: **Shopify jako silnik sklepu.** Daje iDEAL przez Shopify Payments, kasę, magazyn, rabaty, odzyskiwanie porzuconych koszyków i gotowe połączenie z Google Merchant Center, Instagramem/Facebookiem i TikTokiem. Dwie drogi:
- **Motyw Shopify** ostylowany jak obecna strona (szybciej, taniej w utrzymaniu).
- **Obecny front w React** podpięty do Shopify (zostają efekty i wygląd, ale więcej pracy i potrzebne renderowanie po stronie serwera).

W tej sesji jest już podłączony konektor Shopify, więc gdy załóżmy sklep, będę mógł nim zarządzać bezpośrednio (produkty, stany, zamówienia, rabaty, analityka).
