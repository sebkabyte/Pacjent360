# Analiza luk: Kokpity i Oś czasu

Status: wynik deep research — do decyzji autora.
Data: 2026-06-07.
Metoda: code review `app.js` (renderCore, renderPatientPortal, renderTimeline, renderFullDataAccess, demo data) + konfrontacja z ARCHITECTURE.md, SSOT.md, ROADMAP.md.

---

## 1. Kontekst problemu

Trzy osoby patrzą na tę samą historię pacjenta, ale każda z fundamentalnie inną potrzebą:

| Persona | Pytanie kluczowe | Horyzont czasowy | Język | Działanie |
|---|---|---|---|---|
| **Lekarz** | „Co muszę wyjaśnić przed dzisiejszą decyzją?" | Epizod (dni/tygodnie) | Kliniczny, skrótowy | Rozstrzyga pytania DITL |
| **Pacjent** | „Czy jestem przygotowany do wizyty? Co powinienem wiedzieć?" | Moja historia (miesiące/lata) | Prosty, dzienny | Zbiera dane, zadaje pytania |
| **Opiekun** | „Co muszę zorganizować dla bliskiej osoby?" | Zadania (najbliższe dni) | Prosty + organizacyjny | Pilnuje terminów, dokumentów, leków |

**Obecne MVP traktuje te trzy perspektywy zbyt podobnie.** Analiza poniżej pokazuje konkretne luki.

---

## 2. GAP ANALYSIS — Kokpit Lekarza (renderCore)

### 2.1 Co jest dobrze

- ✅ Nagłówek „Pacjent w 90 sekund" — jasna obietnica.
- ✅ Siatka 6 kart (ninety-grid): baseline, problem, zmiana, red flags, luki, pytanie decyzyjne.
- ✅ Lista pytań DITL ze statusami i źródłami.
- ✅ Trzy kolumny: Story / State / Risk.
- ✅ Przyciski akcji: Decyzja, Wywiad, One-pager.
- ✅ Safety note: „bez automatycznej diagnozy ani zaleceń".

### 2.2 Luki i rekomendacje

| # | Luka | Obecny stan | Powinno być | Priorytet |
|---|---|---|---|---|
| L-01 | **Metryka „Quality" jest myląca** | `qualityScore()` zwraca procent — sugeruje ocenę jakości opieki | Zmienić na „Kompletność źródeł" (źródło: audit FIX-10) | Wysoki |
| L-02 | **Full Data Hub jest identyczny z pacjentem** | `renderFullDataAccess("clinician")` zmienia tylko opis tekstowy, te same 6 kafelków | Lekarz potrzebuje: (1) Flagi/sygnały, (2) Medication reconciliation, (3) Wyniki do interpretacji, (4) Źródła z niskim zaufaniem, (5) Braki dokumentacji. Pacjent nie potrzebuje „Raporty" ani „Zgody" na tym poziomie | Wysoki |
| L-03 | **Brak „Medication reconciliation at a glance"** | Leki dostępne tylko przez nawigację do osobnego widoku | Lekarz powinien widzieć na kokpicie: ile leków, ile niepotwierdzonych, rozbieżność przepisane vs brane — jako mini-tabelę, nie jako link do innego widoku | Wysoki |
| L-04 | **Brak sekcji „Czego brakuje"** | Braki danych (Unknown/To verify) schowane w ninety-grid jako jedna karta | Lekarz potrzebuje jawnej listy: „brak aktualnego EKG", „brak potwierdzenia listy leków", „brak wywiadu od opiekuna" — z typem brakującego źródła | Średni |
| L-05 | **Sparkline bez danych realnych** | `sparklineSVG()` generuje SVG, ale dane demo mają 2-3 punkty — sparkline jest nieczytelna | Ukryć sparkline gdy < 4 punktów, pokazać prosty trend (↑↓→) (źródło: audit FIX-11) | Niski |
| L-06 | **Brak „timeline snippet"** | Lekarz nie widzi mini-osi czasu na kokpicie — musi nawigować do osobnego widoku | Dodać mini-timeline ostatnich 4-6 zdarzeń w formie listy chronologicznej (nie pełny widok filmowy) | Średni |
| L-07 | **3 kolumny Story/State/Risk** | Użyteczne, ale identyczny układ jak raport — kokpit powinien być bardziej skondensowany | Zmienić na 2 kolumny: „Co wiadomo" / „Co wyjaśnić" — bardziej decyzyjny format | Niski |

---

## 3. GAP ANALYSIS — Kokpit Pacjenta (renderPatientPortal)

### 3.1 Co jest dobrze

- ✅ Nagłówek „Mój Pacjent 360" — jasna obietnica.
- ✅ Profil pacjenta z wiekiem i kontaktem wspierającym.
- ✅ Sekcja „Co jest przede mną" (upcoming).
- ✅ Sekcja „Ostatnie wyniki" z wartościami i zakresami.
- ✅ Sekcja „Co przyjmuję" (leki).
- ✅ Safety note: „Nie zastępuje konsultacji lekarskiej".

### 3.2 Luki i rekomendacje

| # | Luka | Obecny stan | Powinno być | Priorytet |
|---|---|---|---|---|
| P-01 | **Język jest kliniczny, nie pacjentowy** | Sekcja „Decyzja / sprawa do wyjaśnienia" używa `clinicalQuestion` — np. „Co lekarz musi wyjaśnić przed decyzją o planowanej procedurze?" | Pacjent powinien widzieć: „Co warto omówić z lekarzem: potwierdź listę leków, zapytaj o przygotowanie do zabiegu" — język zadaniowy, prosty | **Krytyczny** |
| P-02 | **Pytania używają statusów DITL** | Statusy „do wyjaśnienia", „dalsza kontrola" to język lekarza wewnątrz systemu | Pacjent powinien widzieć: „Do omówienia", „Lekarz sprawdzi", „Załatwione" — prosty, zrozumiały status | **Krytyczny** |
| P-03 | **Full Data Hub jest klonem widoku lekarza** | Te same 6 kafelków: Dokumenty, Oś czasu, Leki, Wyniki, **Raporty**, **Zgody** | Pacjent potrzebuje: (1) Moje dokumenty, (2) Moja historia, (3) Moje leki, (4) Moje wyniki, (5) **Moje pytania do lekarza**, (6) **Co mam przygotować**. Raporty to narzędzie lekarza. Zgody to osobna sekcja ustawień, nie kafelek na głównej | Wysoki |
| P-04 | **Brak sekcji „Co mam przygotować na wizytę"** | Nie istnieje | Pacjent przed wizytą potrzebuje checklisty: ✅ mam wyniki, ⬜ brak aktualnego EKG, ⬜ lista leków do potwierdzenia, ⬜ pytania zapisane. To jest core visit loop „przed wizytą" | **Krytyczny** |
| P-05 | **Brak sekcji „Co ustalono po wizycie"** | Nie istnieje (planowane w visit loop) | Po wizycie pacjent powinien widzieć: co lekarz rozstrzygnął, jakie zadania zostały, kiedy następna kontrola — w prostym języku, jako lista „do zrobienia" | Wysoki |
| P-06 | **Wyniki pokazują zakres referencyjny bez wyjaśnienia** | `observationStatus()` zwraca „w zakresie ref." / „powyżej zakresu ref." | Pacjent potrzebuje: „Wynik w oczekiwanym przedziale" / „Wynik powyżej oczekiwanego przedziału — omów z lekarzem" + tooltip z wartościami | Wysoki |
| P-07 | **Brak „Moja historia w prostych słowach"** | Podsumowanie to tablica metryk (Dokumenty: 4, Wyniki: 3, Leki: 4) — liczby, nie narracja | Pacjent potrzebuje 3-4 zdań: „Masz zaplanowany zabieg. Masz 4 leki — 1 wymaga potwierdzenia. Masz 3 wyniki badań — wszystkie aktualne. Brakuje aktualnego EKG." | Wysoki |
| P-08 | **Source chips są niezrozumiałe** | `sourceChips()` generuje `doc:d1`, `interview:i1` — format referencyjny | Pacjent powinien widzieć: „Źródło: ankieta z 12 maja", „Źródło: rozmowa z 2 czerwca" — czytelne nazwy, nie ID | Średni |
| P-09 | **Metryki są takie same jak u lekarza** | `metric()` generuje te same kafelki w obu kokpitach | Pacjent potrzebuje inny zestaw metryk: „Dokumenty do wizyty: 3/5 gotowe", „Leki: 1 do potwierdzenia", „Pytania: 4 zapisane", „Najbliższa wizyta: za 3 dni" | Średni |
| P-10 | **Brak sekcji „Moja rodzina / opiekun"** | `guardian: "brak"` wyświetlone jednolinijkowo | Pacjent powinien mieć sekcję zarządzania kręgiem wsparcia: kto ma dostęp, do czego, jak dodać opiekuna | Średni |

---

## 4. GAP ANALYSIS — Kokpit Opiekuna (NIE ISTNIEJE)

### 4.1 Co jest

Opiekun nie ma własnego widoku. W architekturze opisany jest jako „scoped view" pacjenta — widzi tylko to, na co pacjent dał zgodę. Ale w kodzie:
- Brak `renderCaregiverPortal()`.
- Brak modelu danych `CaregiverScope`.
- Consent model (`consents[]`) nie definiuje zakresu per-opiekun, tylko per-podmiot.
- `guardian` w patient model to prosty string.

### 4.2 Co opiekun potrzebuje (vs co jest)

| # | Potrzeba opiekuna | Obecny stan | Powinno być | Priorytet |
|---|---|---|---|---|
| O-01 | **Kokpit z widokiem zadań** | Brak | Dashboard: „Co muszę zorganizować" — najbliższe wizyty, dokumenty do przygotowania, leki do wykupienia/podania, pytania do zapisania | **Krytyczny** |
| O-02 | **Zakres dostępu (scope)** | `consents[]` ma `scope: "one-pager decyzyjny + źródła"` — tekst, nie model | Strukturalny scope: `{ wizyty: true, leki: true, wyniki: false, dokumenty: ["d1","d3"], zadania: true }` — granularny dostęp | Wysoki |
| O-03 | **Język organizacyjny** | N/A | „Wykup receptę", „Umów wizytę kontrolną", „Przywieź wyniki z laboratorium", „Sprawdź czy mama wzięła leki" — język tasków, nie kliniczny | Wysoki |
| O-04 | **Brak klinicznych szczegółów** | N/A | Opiekun NIE powinien widzieć: flag klinicznych, pytań DITL, szczegółów wyników, raportów decyzyjnych. Widzi: terminy, statusy zadań, dokumenty do dostarczenia | Wysoki |
| O-05 | **Powiadomienia / przypomnienia** | Brak | „Wizyta za 3 dni — potrzebne: aktualne wyniki + lista leków", „Lek X: czas na dawkę" | Średni |
| O-06 | **Historia akcji opiekuna** | Brak | Audit trail: „Opiekun oznaczył receptę jako wykupioną", „Opiekun dodał wynik badania" | Średni |

---

## 5. GAP ANALYSIS — Oś Czasu (renderTimeline) — „Film"

### 5.1 Co jest dobrze

- ✅ 3 zakresy czasowe: Epizod / 12 mies. / Od urodzenia.
- ✅ 3 poziomy detalu: Ogół / Standard / Szczegóły.
- ✅ Suwak zoom z animacją.
- ✅ Minimap nawigacyjna.
- ✅ Legenda track icons.
- ✅ Kotwice czasu (virtual events) dla pustych odcinków.
- ✅ Zabezpieczenie „Epizod" jako domyślny zakres.

### 5.2 Luki i rekomendacje

| # | Luka | Obecny stan | Powinno być | Priorytet |
|---|---|---|---|---|
| T-01 | **Spine labels w języku angielskim** | `<span>story</span><span>state</span><span>risk</span><span>decision</span>` | Polski UI wymaga polskich etykiet: „Historia / Stan / Ryzyko / Decyzja" — albo usunąć spine labels i użyć track colors | **Krytyczny** |
| T-02 | **9 tracków, ale 7 pustych w demo** | Demo patient P1 ma zdarzenia na: konsultacje (2), leki (1), badania (1), objawy wywiadu (1), decyzje (1). Tracki puste: objawy, rozpoznania, hospitalizacje, funkcjonowanie | Ukryć puste tracki z overview. Pokazać je jako „brak danych" dopiero na poziomie „Szczegóły" | Wysoki |
| T-03 | **„Od urodzenia" tworzy 54 lata pustej przestrzeni** | Dla pacjenta urodzonego w 1972, zdarzenia od maja 2026 — 54 lata empty gap z jedną kotwicą | Zmienić na smart zoom: automatycznie przeskoczyć do pierwszego zdarzenia klinicznego z adnotacją „brak danych wcześniejszych" | Wysoki |
| T-04 | **Brak filtrowania po tracku** | Legenda jest pasywna — klik na track nic nie robi | Klik na track w legendzie powinien filtrować oś czasu do jednego tracku. Ctrl+klik = multi-track | Wysoki |
| T-05 | **Brak narracji „Co się działo"** | Events to karty z datą, trackiem i opisem — czytelnik musi sam złożyć historię | Nad osią czasu dodać auto-generowaną narracię epizodu: „12 maja: rozpoczęto kwalifikację. 18 maja: pojawił się problem z lekami. 25 maja: konsultacja zaleciła EKG. 30 maja: wyniki kontrolne. 2 czerwca: wywiad z pacjentem." — 3-5 zdań | Wysoki |
| T-06 | **Spine model nie pasuje do tracków** | Spine: story/state/risk/decision (4 linie). Tracki: objawy/badania/leki/rozpoznania/hospitalizacje/konsultacje/funkcjonowanie/decyzje/wywiady (9 tracków). Brak mapowania | Usunąć spine labels. Spine powinien być neutralną linią czasu. Tracki wizualnie różnić się kolorem. Karty mają już track label — to wystarczy | Średni |
| T-07 | **Alternating above/below jest mechaniczny** | `index % 2 === 0 ? "above" : "below"` — bez logiki semantycznej | Above/below powinno zależeć od tracku, nie od indeksu — np. badania/leki zawsze above, decyzje/konsultacje zawsze below — tworzy wizualną warstwowość | Średni |
| T-08 | **Brak „teraz" marker** | Oś czasu nie zaznacza „dziś" — użytkownik nie wie, co jest przeszłością a co przyszłością | Dodać wyraźny marker „Dziś" na osi czasu z datą. Zdarzenia planowane (przyszłe) mieć inny styl karty — np. obrys przerywany | Wysoki |
| T-09 | **Brak powiązań między zdarzeniami** | Zdarzenia to izolowane karty. Brak wizualnych łączeń: „wynik badania → decyzja o procedurze → konsultacja" | Dodać opcjonalne linie powiązań (na poziomie „Szczegóły") gdy zdarzenia dzielą sourceRefs — np. doc:d1 łączy te1 i te2 | Niski |
| T-10 | **Oś czasu nie zmienia się per persona** | Identyczny widok dla lekarza i pacjenta | Lekarz: focus na epizod, tracki kliniczne, pytania DITL na osi. Pacjent: focus na „moje wizyty i co z nich wynikło", prosty język, brak tracków klinicznych. Opiekun: focus na zadania organizacyjne na osi czasu | Wysoki |

---

## 6. MACIERZ WSPÓLNYCH ELEMENTÓW — co jest wspólne, co MUSI się różnić

### Wspólne (shared data layer)

Te elementy powinny korzystać z tych samych danych bazowych:
- Źródła (documents, observations, interviews, medications)
- Model zdarzeń (timelineEvents)
- Konsensus źródeł (sourceRefs, trust, confidence)

### MUSZĄ się różnić per persona

| Element | Lekarz | Pacjent | Opiekun |
|---|---|---|---|
| **Nagłówek kokpitu** | „Pacjent w 90 sekund" | „Moja historia i co dalej" | „Organizacja opieki" |
| **Główna metryka** | Pytania DITL / Red flags / Kompletność | Dokumenty gotowe / Pytania zapisane / Najbliższa wizyta | Zadania do zrobienia / Terminy / Leki do wykupienia |
| **Język statusów** | „do wyjaśnienia", „dalsza kontrola", „wyjaśnione", „odrzucone" | „Do omówienia", „Lekarz sprawdzi", „Gotowe", „Nieaktualne" | „Do zrobienia", „Zrobione", „Czeka na pacjenta" |
| **Sekcja centralna** | Pytania DITL + braki danych | „Co przygotować na wizytę" (checklist) | „Co zorganizować" (task list) |
| **Wyniki badań** | Wartość + zakres ref. + źródło + sparkline | „Wynik w oczekiwanym przedziale" / „Do omówienia" | Brak (chyba że consent) |
| **Leki** | Medication reconciliation (tabela rozbieżności) | „Co przyjmuję" (prosta lista z pytaniami) | „Co ma być podane/wykupione" (harmonogram) |
| **Flagi** | Red/amber/green/blue z evidence | Brak flag (za kliniczne). Zamiast: „Rzeczy do wyjaśnienia z lekarzem" | Brak |
| **Raporty** | One-pager, Known/Unknown | Brak (to narzędzie lekarza) | Brak |
| **Oś czasu** | Epizod kliniczny, multi-track, DITL | „Moje wizyty" — prostsza forma, skupiona na wizytach i wynikach | „Terminy" — lista zadań z datami |
| **Source chips** | `doc:d1`, `interview:i1` (format ref.) | „Ankieta z 12 maja", „Rozmowa z 2 czerwca" (czytelne) | Brak (za szczegółowe) |
| **Full Data Hub** | Flagi, Medication reconciliation, Źródła niskiej jakości, Braki, Raport | Moje dokumenty, Historia, Leki, Wyniki, Pytania, Przygotowanie | Zadania, Terminy, Dokumenty do dostarczenia |
| **Akcje** | Rozstrzygnij DITL, Oznacz flagę, Generuj raport | Dodaj pytanie, Dodaj dokument, Oznacz jako przygotowane | Oznacz zadanie, Dodaj notatkę, Potwierdź wykonanie |

---

## 7. REDESIGN TIMELINE — propozycja „Film"

### 7.1 Obecna metafora vs proponowana

**Obecna:** Oś czasu to horizontalny scroll z kartami na gałęziach (git-branch metaphor) — techniczny, abstrakcyjny.

**Proponowana:** „Film pacjenta" — narracyjna oś czasu z rozdziałami.

### 7.2 Nowa architektura timeline

```
┌─────────────────────────────────────────────────────────┐
│  NARRACJA EPIZODU (auto-generowana, 3-5 zdań)          │
│  „12 maja rozpoczęto kwalifikację do procedury.         │
│   25 maja konsultacja wskazała braki w dokumentacji.    │
│   30 maja dostępne wyniki kontrolne.                     │
│   Dziś: 4 pytania do rozstrzygnięcia przez lekarza."   │
├─────────────────────────────────────────────────────────┤
│  KONTROLKI: [Epizod] [12 mies.] [Cały] | Filtruj: ◉◉◉ │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ──●────●────●────●──────●──────●── [DZIŚ ▼] ──→       │
│    │    │    │    │      │      │                        │
│  12.05 18.05 25.05 30.05 02.06 06.06                   │
│    │    │    │    │      │      │                        │
│  [Kw]  [Lk]  [Kn]  [Bd]  [Wy]  [Dc]                  │
│                                                         │
│  Kw = Kwalifikacja    Lk = Leki    Kn = Konsultacja    │
│  Bd = Badania         Wy = Wywiad  Dc = Decyzja DITL   │
├─────────────────────────────────────────────────────────┤
│  MINIMAP: [===========|===] scroll indicator            │
└─────────────────────────────────────────────────────────┘
```

### 7.3 Kluczowe zmiany

| # | Zmiana | Uzasadnienie |
|---|---|---|
| TN-01 | **Narracja epizodu na górze** | Zanim użytkownik zobaczy karty, dostaje 3-5 zdań kontekstu — „film ma narratora" |
| TN-02 | **Marker „Dziś"** | Oddziela przeszłość od przyszłości. Zdarzenia planowane mają odrębny styl |
| TN-03 | **Filtrowanie po trackach** | Klikalna legenda — pokaż tylko badania, tylko leki, tylko konsultacje |
| TN-04 | **Smart zoom dla „Od urodzenia"** | Automatyczny skip do pierwszego zdarzenia z adnotacją „brak danych wcześniejszych" |
| TN-05 | **Polskie spine labels lub usunięcie** | story/state/risk/decision → Historia/Stan/Sygnały/Decyzja, albo usunąć spine (tracki wystarczą) |
| TN-06 | **Semantyczny above/below** | Karty grupowane wizualnie per kategoria: badania/wyniki above, decyzje/konsultacje below |
| TN-07 | **Powiązania sourceRef** | Na poziomie „Szczegóły" linie łączące zdarzenia dzielące wspólne źródła |
| TN-08 | **Per-persona wariant** | Lekarz widzi pełną oś. Pacjent widzi „Moje wizyty". Opiekun widzi „Terminy" |

---

## 8. PLAN IMPLEMENTACJI — priorytetyzacja

### Faza A: Blokery UX (przed jakimkolwiek pokazem)

1. **P-01 + P-02**: Zmienić język pacjenta — `clinicalQuestion` → `patientQuestion`, statusy DITL → prosty język
2. **T-01**: Spolszczyć spine labels lub usunąć
3. **T-08**: Dodać marker „Dziś" na osi czasu

### Faza B: Separacja kokpitów (visit loop MVP)

4. **P-04**: Dodać sekcję „Co przygotować na wizytę" (checklist przed wizytą)
5. **P-03**: Przeprojektować Full Data Hub per persona
6. **L-03**: Dodać medication reconciliation mini-tabelę na kokpicie lekarza
7. **L-01**: Zmienić „Quality" → „Kompletność źródeł"
8. **T-02 + T-04**: Ukryć puste tracki + dodać filtrowanie
9. **T-05**: Dodać narrację epizodu nad osią czasu
10. **P-07**: Dodać „Moja historia w prostych słowach" (narracyjne podsumowanie)

### Faza C: Nowe perspektywy

11. **O-01**: Zbudować kokpit opiekuna — dashboard zadań
12. **O-02**: Zbudować model scope (granularny dostęp per-opiekun)
13. **P-05**: Dodać „Co ustalono po wizycie" (after visit loop)
14. **T-10**: Wariant osi czasu per persona
15. **T-03**: Smart zoom dla „Od urodzenia"

### Faza D: Polish

16. **P-06**: Prosty język wyników badań
17. **P-08**: Czytelne nazwy źródeł zamiast ID
18. **T-06 + T-07**: Usunięcie spine, semantyczny above/below
19. **T-09**: Powiązania między zdarzeniami
20. **L-04 + L-06**: „Czego brakuje" + mini-timeline na kokpicie lekarza

---

## 9. MODEL DANYCH — wymagane rozszerzenia

### 9.1 Nowe pola w `patient`

```javascript
// Prosty język dla pacjenta
patientSummary: "Masz zaplanowany zabieg...",  // auto-generowane lub redagowane
patientQuestion: "Potwierdź listę leków...",    // patient-facing wersja clinicalQuestion
```

### 9.2 Nowy model `CaregiverScope`

```javascript
{
  id: "cs1",
  patientId: "p1",
  caregiverId: "cg1",
  name: "Anna Kowalska",
  role: "opiekun lekowy",        // opiekun lekowy | opiekun wizyt | rodzina
  scope: {
    wizyty: true,
    leki: true,
    wyniki: false,               // pacjent nie udostępnił wyników
    dokumenty: ["d1", "d3"],     // tylko wybrane dokumenty
    zadania: true,
    timeline: "wizyty"           // widzi tylko track: konsultacje + decyzje
  },
  validTo: "2026-12-31",
  status: "aktywny"
}
```

### 9.3 Nowy model `VisitChecklist`

```javascript
{
  id: "vc1",
  patientId: "p1",
  visitDate: "2026-06-10",
  items: [
    { label: "Aktualne wyniki laboratoryjne", status: "gotowe", sourceRef: "doc:d2" },
    { label: "Aktualne EKG", status: "brak", sourceRef: null },
    { label: "Lista leków potwierdzona", status: "do potwierdzenia", sourceRef: "interview:i1" },
    { label: "Pytania do lekarza zapisane", status: "gotowe", sourceRef: null }
  ]
}
```

### 9.4 Nowy model `PostVisitSummary`

```javascript
{
  id: "pvs1",
  patientId: "p1",
  visitDate: "2026-06-06",
  resolvedQuestions: [
    { questionId: "hq1", resolution: "wyjaśnione", note: "Lista leków potwierdzona z pacjentem" }
  ],
  tasks: [
    { label: "Wykupić receptę na lek X", assignee: "pacjent", due: "2026-06-09" },
    { label: "Dostarczyć EKG do poradni", assignee: "opiekun", due: "2026-06-08" }
  ],
  nextVisit: "2026-06-20",
  patientSummary: "Lekarz potwierdził listę leków. Trzeba zrobić EKG przed kolejną wizytą za 2 tygodnie."
}
```

### 9.5 Mapowanie statusów per persona

```javascript
const STATUS_MAP = {
  "do wyjaśnienia":    { doctor: "do wyjaśnienia",    patient: "Do omówienia",     caregiver: "Do sprawdzenia" },
  "dalsza kontrola":   { doctor: "dalsza kontrola",   patient: "Lekarz sprawdzi",  caregiver: "Czeka" },
  "wyjaśnione":        { doctor: "wyjaśnione",        patient: "Gotowe",           caregiver: "Zrobione" },
  "odrzucone":         { doctor: "odrzucone",          patient: "Nieaktualne",      caregiver: "Nieaktualne" }
};
```

---

## 10. STRATEGIA MOBILE — per persona

### 10.1 Kontekst użycia per urządzenie

| Persona | Główne urządzenie | Kontekst | Konsekwencja UX |
|---|---|---|---|
| **Lekarz** | Desktop / tablet | Gabinet, 90 sek. przed konsultacją | Gęsty layout OK, tabele, multi-kolumny |
| **Pacjent** | Telefon | Poczekalnia, apteka, dom | Single-column, duże przyciski, krótkie sekcje |
| **Opiekun** | Telefon | W drodze, organizacja zdalna | Task-list, checkboxy, powiadomienia |

### 10.2 Wymagania mobile per kokpit

**Kokpit pacjenta (mobile-first):**
- Single-column stack: checklist → pytania → leki → wyniki
- Sekcje zwijane (accordion) — na telefonie nie scrollujesz 11 sekcji
- Duże touch targets (min. 44×44px per WCAG)
- „Co przygotować" jako top-level widok (nie zagrzebane w dashboardzie)
- Offline read: pacjent w poczekalni może nie mieć internetu

**Kokpit opiekuna (mobile-first):**
- Lista zadań z checkboxami — „done" jednym tapnięciem
- Duże karty z terminem i statusem
- Brak szczegółów klinicznych (nie potrzebuje sparkline)
- Push notifications (w fazie PWA/natywnej)

**Kokpit lekarza (desktop-first, responsive):**
- Desktop: pełny layout jak obecny (ninety-grid, 3 kolumny, tabele)
- Tablet: 2-kolumnowy fallback
- Telefon: sensowny readonly, ale to NIE jest primary use case

### 10.3 Ścieżka technologiczna

```
FAZA 2 (teraz)          FAZA 4 (po walidacji)     PO PRODUCT-MARKET FIT
─────────────────────   ──────────────────────    ────────────────────────
Responsive CSS          PWA (manifest + SW)        React Native / Flutter
mobile-first layout     Instalacja z Chrome        Google Play + App Store
media queries           Offline read cache         Push notifications
touch targets           Ikony + splash screen      Skan dokumentu (kamera)
                                                   Biometria (odblokowanie)
```

**Zasada:** NIE budujemy natywnej aplikacji dopóki PWA nie udowodni, że ludzie chcą tego używać na telefonie.

---

## 11. ZASADY BEZPIECZEŃSTWA dla zmian kokpitowych

Każda zmiana musi przejść Clinical Safety Checklist:

1. **Język pacjenta nie sugeruje diagnozy.** „Do omówienia" ≠ „powinnaś", „Lekarz sprawdzi" ≠ „jest problem".
2. **Opiekun widzi TYLKO to, co w scope.** Brak scope = brak dostępu.
3. **Checklist wizytowa nie jest zaleceniem.** „Brak aktualnego EKG" ≠ „musisz zrobić EKG". To informacja o kompletności, nie rekomendacja.
4. **Post-visit summary to draft do akceptacji lekarza.** Nigdy nie jest generowany automatycznie bez review.
5. **Narracja osi czasu to opis zdarzeń, nie interpretacja.** „30 maja dostępne wyniki kontrolne" ≠ „wyniki były niepokojące".
6. **Żaden kokpit nie ocenia pilności.** Brak priorytetyzacji „pilne/normalne".
7. **Każde zdanie ma źródło.** Brak sourceRef = brak zdania na ekranie.

---

## 12. PODSUMOWANIE

### Najważniejsze 6 zmian

1. **Oddzielić język per persona** — to jest fundamentalna luka. Pacjent widzi język lekarza, a powinien widzieć język codzienny.
2. **Dodać „Co przygotować na wizytę"** — to jest brakujące serce visit loop „przed wizytą".
3. **Zbudować kokpit opiekuna** — obecnie nie istnieje, choć architektura go obiecuje.
4. **Przeprojektować Full Data Hub per persona** — identyczne kafelki to zaprzeczenie idei trzech perspektyw.
5. **Dodać narrację do osi czasu** — „film" potrzebuje narratora, nie tylko ujęć.
6. **Mobile-first dla pacjenta i opiekuna** — pacjent nie otwiera laptopa w poczekalni, opiekun nie siada do komputera w drodze.

### Skala zmian

- Faza A: ~4-6h pracy (refactor języka i spine labels)
- Faza B: ~16-24h (nowe sekcje, nowy data hub, narracja timeline, responsive CSS)
- Faza C: ~24-40h (nowy kokpit opiekuna, scope model, post-visit)
- Faza D: ~8-12h (polish, powiązania, PWA)

---

Autor analizy: Claude (na zlecenie Sebastiana Kalisza).
Metoda: code review app.js + konfrontacja z dokumentacją projektową.
Następny krok: decyzja autora o priorytetach i zakresie wdrożenia.
