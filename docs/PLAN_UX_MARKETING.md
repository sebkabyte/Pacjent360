# Plan Wdrożenia Strategii Marketingowej i UX dla Pacjent360™

Na podstawie analizy repozytorium oraz wytycznych z `marketing_ux_strategy.md`, `PRODUCT_SSOT.md` i `ARCHITECTURE.md`, przygotowałem plan modyfikacji kodu, aby wdrożyć nowe podejście do komunikacji i wizualizacji (bez naruszania istniejącej architektury i granic produktu).

## User Review Required

> [!IMPORTANT]
> Proszę o zapoznanie się z poniższym planem wdrożenia, w którym proponuję konkretne zmiany w plikach HTML/CSS/JS. Szczególnie istotny jest wybór wariantu tekstów na stronę główną oraz koncepcji wizualnej dla Osi Czasu (Medyczna Mapa Metra). Czekam na Twoją decyzję lub uwagi, zanim zacznę modyfikować pliki.

## Open Questions

> [!WARNING]
> 1. **Hero Wariant**: Który z 3 wariantów z `marketing_ux_strategy.md` mamy zastosować w Hero? Proponuję wariant 1 ("Zaprojektowane by wspierać. Pozwól AI uporządkować dokumentację medyczną.").
> 2. **Storytelling**: W której części strony wstawić emocjonalną opowieść (Patient Story)? Proponuję dodać nową sekcję tuż pod sekcją Hero, która gładko wprowadzi użytkownika w problem (Pain).
> 3. **Mapa Metra**: Czy zgadzasz się, aby zmodyfikować `patient360-map-view.js` tak, aby obecne pasma (lanes) zamieniły się w kolorowe linie "metra", a zdarzenia stały się "stacjami"?

## Proposed Changes

Poniżej zestawienie planowanych zmian podzielone na sekcje tematyczne.

---

### Zmiany w strukturze Landing Page (Strona Główna)

Zreorganizujemy zawartość `public/index.html`, wprowadzając silny storytelling oraz strukturę zoptymalizowaną pod UX/SEO.

#### [MODIFY] [index.html](file:///c:/Users/Joulix/Documents/Pacjent%20360/public/index.html)
- **Hero Section**: Aktualizacja nagłówków z uwzględnieniem wybranego wariantu (przejście z tonu defensywnego na pewny, wspierający).
- **Trust Strip**: Zmiana komunikatów na budujące wartość (np. "Czyste środowisko Sandbox", "Pełna kontrola lekarza (DITL)"). Usuniemy formy przypominające straszaki.
- **Nowa sekcja Problem (The Pain - Storytelling)**: Wstrzyknięcie narracji o "Tonącej w dokumentach rodzinie" (według wskazówek Storytellera) w miejscu starej sekcji `#problem`.
- **Reorganizacja sekcji**: Zmiana kolejności według schematu *Pain -> Solution -> Benefits -> Social Proof / Mission -> CTA*. 
- **SEO/UX**: Uporządkowanie hierarchii nagłówków H1, H2, H3 (z dodaniem słów kluczowych "Asystenci AI dla pacjentów", "uporządkowana dokumentacja medyczna").

#### [MODIFY] [story.css](file:///c:/Users/Joulix/Documents/Pacjent%20360/public/assets/story.css)
- Dodanie klas CSS dla nowej sekcji Storytellingu (lepsza typografia, cytaty, oddzielenie wizualne bólu od rozwiązania).
- Dopracowanie stylów zmodernizowanego "Trust Strip" tak, aby przypominał pas bezpieczeństwa/gwarancji, a nie komunikat błędu.

---

### Zmiany w widoku Osi Czasu (Demo)

Obecny kod w `public/patient360-map-view.js` dzieli już zdarzenia na tory i pasma (lanes). Przekształcimy tę strukturę w koncepcję **Medycznej Mapy Metra**, rezygnując z tradycyjnego "wykresu Gantta" na rzecz nowoczesnej i przejrzystej mapy topologicznej (węzły, stacje i przesiadki).

#### [MODIFY] [patient360-map-view.js](file:///c:/Users/Joulix/Documents/Pacjent%20360/public/patient360-map-view.js)
- Zmiana struktury renderowania węzłów zdarzeń (zamiast standardowych "mini-tick", stworzymy duże, okrągłe stacje "subway-station").
- Integracja "przesiadek" - dla zdarzeń, które należą do powiązanych epizodów (np. diagnoza na jednej linii i przypisany lek na innej).

#### [MODIFY] [components.css](file:///c:/Users/Joulix/Documents/Pacjent%20360/public/brand/components.css) 
*(lub opcjonalnie `styles.css` zależnie od obecnego ułożenia osi)*
- Definicja kolorów linii metra w oparciu o istniejące tokeny (np. Oś "Leki" -> Teal, Oś "Wyniki" -> Blue).
- Klasy dla animowanych "pulsów" na najnowszych i aktywnych zdarzeniach (mikroanimacje ułatwiające skanowanie wzrokiem - zgodnie z wytycznymi UI Visionary).
- Zmiana CSS dla `temporal-lane-band` na widok gładkich linii wektorowych łączących zdarzenia.

## Verification Plan

### Manual Verification
- Uruchomienie lokalnego środowiska w przeglądarce (`public/index.html`).
- Weryfikacja wizualna na desktopie i mobile:
  - Przejście od sekcji Hero aż po CTA na dole strony pod kątem emocjonalnego flow.
  - Sprawdzenie zgodności zmienionych tekstów i ostrzeżeń z polityką narzuconą przez `docs/SSOT.md` (brak obietnic medycznych).
- Test wizualizacji Mapy Metra wewnątrz `public/demo.html` (Widok osi czasu - "Historia Pacjenta"). Sprawdzenie, czy nowa forma ułatwia skanowanie wielowątkowych zdarzeń.
