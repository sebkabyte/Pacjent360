# Pacjent360 — Intended Purpose by Module

Status: roboczy dokument intended purpose do potwierdzenia przez kancelarię  
Data: 2026-06-26  
Decyzja założycielska: D-Legal-001 z 2026-06-26 — Alternatywa C, hybryda modułowa  
Charakter dokumentu: materiał roboczy; dokument nie stanowi opinii prawnej ani kwalifikacji MDR

## 1. Kontekst i zakres dokumentu

Dokument formalizuje decyzję o modułowej strategii prawno-produktowej Pacjent360. Zastępuje jednorodną tezę „całość produktu poza MDR" przez precyzyjne odrębne intended purpose dla każdego modułu.

Jest wejściem do:

- `CLAIMS_REGISTER.md` — co wolno mówić publicznie o każdym module;
- `MDR_CLASSIFICATION_MEMO_REQUEST.md` — pytania do kancelarii per moduł;
- `CLINICAL_MODULE_GO_NO_GO_POLICY.md` — brama decyzyjna przed Clinical Assist.

## 2. Taksonomia modułów

```
Pacjent360 Core
  └── repozytorium źródeł, timeline, braki, audyt, eksport
  └── status: active in MVP; No-CDSS intended purpose do potwierdzenia kancelarią

Pacjent360 AI Drafting
  └── source-bound LLM, draft-only, plain language, zadania organizacyjne
  └── status: gated — wymaga DPIA, DPA, walidatorów, sourceRefs, zero-training
  └── reżim prawny: szara strefa; No-CDSS możliwe przy twardych bramkach; do potwierdzenia kancelarią

Pacjent360 Clinical Assist
  └── interpretacja kliniczna, priorytet, ryzyko, triage, rekomendacje, „co dalej"
  └── status: WYŁĄCZONY — nie jest częścią MVP, nie jest oferowany, nie jest wdrażany
  └── reżim prawny: potencjalny MDR/CDSS/AI Act high-risk; wymaga osobnej ścieżki regulacyjnej
```

## 3. Moduł 1: Pacjent360 Core

### 3.1 Intended purpose

Pacjent360 Core jest narzędziem administracyjno-kontekstowym służącym do porządkowania, przechowywania, indeksowania i udostępniania dokumentów zdrowotnych i kontekstu wizyty przekazanych przez użytkownika.

Celem jest pomoc pacjentowi, rodzicowi, opiekunowi lub uprawnionej osobie wspierającej w zobaczeniu:

- co wiadomo na podstawie dostępnych źródeł;
- czego brakuje lub czego nie ma w dokumentach;
- co jest rozbieżne między źródłami;
- co wymaga wyjaśnienia z uprawnionym profesjonalistą medycznym.

### 3.2 Zakres dozwolony — Core

- przechowywanie i indeksowanie dokumentów zdrowotnych dostarczonych przez użytkownika;
- oś czasu źródeł i zdarzeń z jawnym wskazaniem źródła;
- lista brakujących dokumentów lub luk danych;
- lista rozbieżności między źródłami (np. różne daty, różne wartości);
- checklisty dokumentów do przygotowania na wizytę;
- eksport paczki źródeł dla lekarza lub placówki;
- zarządzanie dostępem: kto, do czego, na jak długo, z jakim zakresem;
- audyt: kto, kiedy, co dodał, komu udostępnił;
- zadania organizacyjne wynikające wprost i dosłownie z dokumentu źródłowego;
- OCR i transkrypcja bez interpretacji treści.

### 3.3 Zakres wyłączony — Core

- interpretacja wartości wyników badań jako normalnych, anormalnych, niebezpiecznych, alarmowych lub uspokajających;
- ocena trendu klinicznego lub progresji;
- ocena pilności, triage lub priorytetyzacja zadań według ryzyka medycznego;
- sugestia specjalisty, badania, leku lub ścieżki postępowania;
- diagnoza, podejrzenie diagnozy lub scoring kliniczny;
- rekomendacja terapeutyczna;
- autonomiczne kontaktowanie się z placówką lub wykonywanie działań bez decyzji człowieka.

### 3.4 Robocza pozycja prawna — Core

Zespół utrzymuje stanowisko, że Pacjent360 Core jest przeznaczony do funkcji administracyjno-kontekstowych i nie posiada własnego przeznaczenia medycznego w rozumieniu MDR 2017/745. Stanowisko to jest hipotezą do potwierdzenia formalną analizą MDR/CDSS przez kancelarię.

Podstawa: MDCG 2019-11 rev.1 wskazuje, że software służący wyłącznie transferowi, przechowywaniu, konwersji, formatowaniu lub archiwizacji danych zasadniczo nie jest sam w sobie wyrobem medycznym.

Do potwierdzenia przez kancelarię:

- czy oś czasu, lista braków, lista rozbieżności i checklisty pozostają poza CDSS;
- czy zadania administracyjne wynikające ze źródła mogą być generowane bez wejścia w care navigation;
- które elementy UI lub copy wymagają zmiany, aby nie sugerować przeznaczenia klinicznego.

## 4. Moduł 2: Pacjent360 AI Drafting

### 4.1 Intended purpose

Pacjent360 AI Drafting jest ograniczonym modułem LLM służącym do tworzenia roboczych uproszczeń językowych i zadań organizacyjnych na podstawie jawnych, wskazanych przez użytkownika źródeł dokumentów.

Celem jest zmniejszenie bariery językowej między dokumentacją medyczną a pacjentem, wyłącznie przez transformację języka bez dodawania nowej informacji klinicznej.

### 4.2 Zakres dozwolony — AI Drafting

- uproszczenie języka źródłowej notatki lub transkrypcji: składnia, skróty z zamkniętego słownika, terminologia laicka — bez zmiany sensu klinicznego;
- przygotowanie listy pytań „do omówienia z lekarzem lub placówką" wyłącznie na podstawie treści wskazanego źródła;
- przygotowanie zadań organizacyjnych wynikających wprost z dokumentu (sprawdzenie skierowania, przygotowanie dokumentu, zanotowanie kodu recepty, umówienie badania wskazanego w źródle);
- zachowanie w outputcie: liczb, dawek, nazw leków, dat, negacji, znaczników niepewności i cytatu źródłowego;
- status outputu: wyłącznie `generated_draft` do czasu jawnej decyzji człowieka.

### 4.3 Zakres wyłączony — AI Drafting

- wolny chat medyczny nad historią pacjenta;
- tryb „wyjaśnij wynik", „co to oznacza", „czy to groźne", „co dalej", „jakie są ryzyka";
- dodawanie edukacji medycznej, patofizjologii lub kontekstu klinicznego spoza źródła;
- zmiana niepewności klinicznej w rozpoznanie lub zmiana rozpoznania w pewność;
- ocena pilności lub nadanie priorytetu medycznego;
- sugestia specjalisty, badania lub ścieżki postępowania;
- autonomiczne działania: wysłanie wiadomości, booking, zakup, kontakt z placówką.

### 4.4 Bramki techniczne wymagane przed uruchomieniem — AI Drafting

AI Drafting jest technicznie zablokowany do czasu spełnienia wszystkich poniższych warunków:

1. zatwierdzona DPIA dla operacji przetwarzania danych zdrowotnych z LLM;
2. podpisana DPA z dostawcą LLM: zero-training, EU/EEA data boundary, ograniczona lub zerowa retencja, wyłączone logowanie treści;
3. wdrożone deterministyczne walidatory outputu: dawki, daty, negacje, nazwy leków, zakazane czasowniki;
4. wdrożony output schema z polami sourceQuote, plainLanguageDraft, sourceRefs, clinicalMeaningDiffFlags i reviewStatus;
5. red-team testy negatywne: konwersja niepewności w rozpoznanie, zmiana dawki, usunięcie negacji, konwersja CITO w alert systemowy;
6. pisemna decyzja go/no-go po przeglądzie DPIA, DPA i wyników walidacji;
7. zatwierdzone `A7_A8_VALIDATION_PROTOCOL.md`.

### 4.5 Robocza pozycja prawna — AI Drafting

AI Drafting może być obroniony jako moduł poza MDR/CDSS wyłącznie przy ścisłym przestrzeganiu ograniczeń z sekcji 4.2–4.4. Każde rozszerzenie zakresu w kierunku interpretacji, oceny ryzyka lub pilności automatycznie przesuwa moduł w kierunku Clinical Assist i wymaga osobnej decyzji prawnej.

Do potwierdzenia przez kancelarię:

- czy plain language na realnych danych zdrowotnych pozostaje transformacją językową, czy staje się interpretacją medyczną;
- czy pytania „do omówienia z lekarzem" generowane przez LLM z dokumentów pacjenta są bezpieczne;
- jakie dowody techniczne są minimalnie wymagane do wykazania braku nowego znaczenia klinicznego;
- czy A7/A8 z No-New-Clinical-Meaning Gate mogą pozostać poza MDSW.

## 5. Moduł 3: Pacjent360 Clinical Assist

### 5.1 Intended purpose — zakres

Clinical Assist oznacza wszelkie funkcje, które:

- interpretują wyniki badań jako normalne, anormalne, niebezpieczne, alarmowe lub wymagające uwagi;
- oceniają pilność, ryzyko kliniczne lub priorytet medyczny;
- sugerują specjalistę, badanie, lek lub ścieżkę postępowania;
- odpowiadają na pytania „co to oznacza", „czy to groźne", „co powinienem zrobić";
- generują rekomendacje lub plany działania o treści klinicznej;
- wykonują triage lub porównują trendy kliniczne w czasie;
- „prowadzą" pacjenta przez system ochrony zdrowia na podstawie oceny stanu zdrowia.

### 5.2 Status — Clinical Assist

**Clinical Assist jest wyłączony. Nie wchodzi do MVP. Nie jest oferowany. Nie jest wdrażany.**

Żaden element publicznej komunikacji, interfejsu, architektury, roadmapy ani dokumentacji technicznej przeznaczonej dla użytkowników nie może sugerować, że Clinical Assist jest częścią aktualnego lub planowanego w krótkim terminie produktu.

### 5.3 Warunki wejścia — Clinical Assist

Clinical Assist może zostać uruchomiony wyłącznie po:

1. pisemnej decyzji kancelarii potwierdzającej ścieżkę regulacyjną;
2. formalnym MDR Classification Memo per funkcja, ze wskazaniem klasy i ścieżki zgodności;
3. AI Act Classification Memo z analizą high-risk i planem human oversight;
4. wdrożeniu QMS, risk management, software lifecycle i clinical evaluation;
5. DPIA i DPA dla każdego operatora przetwarzania;
6. zatwierdzonej strategii post-market monitoring;
7. pisemnej decyzji go/no-go założyciela, kancelarii i, jeśli wymagane, jednostki notyfikowanej.

Szczegóły: `docs/legal/CLINICAL_MODULE_GO_NO_GO_POLICY.md`.

### 5.4 Izolacja — Clinical Assist

Aby Clinical Assist nie „zakażał" pozycji prawnej Core i AI Drafting:

- żadna funkcja Clinical Assist nie może być wdrożona jako feature flag lub ukryty element istniejącego kodu bez osobnej decyzji prawnej;
- nazwa „Clinical Assist" lub jej odpowiednik nie powinna pojawiać się w publicznym copy jako planowana lub dostępna;
- jeśli moduł będzie kiedykolwiek budowany, powinien mieć osobne repo lub osobny, wyraźnie oddzielony komponent z własną dokumentacją MDR.

## 6. Reguły wspólne dla wszystkich modułów

### 6.1 Wording DITL

We wszystkich modułach obowiązuje granica DITL (Doctor in the Loop):

- dozwolone: `pytanie`, `brak danych`, `rozbieżność`, `do wyjaśnienia`, `do potwierdzenia`, `źródło`, `zadanie`, `status`, `do omówienia z lekarzem`, `w zakresie referencyjnym`, `poniżej/powyżej zakresu referencyjnego`;
- zakazane: `diagnoza`, `rozpoznanie` (jako output systemu), `zalecenie`, `rekomendacja`, `wskazanie` (jako rada), `pilne`, `pilnej oceny`, `wymaga natychmiastowej`, `poza normą`, `w normie`, `triage`.

### 6.2 CITO

Oznaczenia pilności przepisane ze źródła mogą być wyświetlane wyłącznie jako dosłowny cytat z dokumentu, z obligatoryjnym komunikatem:

> „[CITO] — etykieta przepisana ze źródła: [nazwa dokumentu, data]. Pacjent360 nie ocenia pilności. Znaczenie oznaczenia potwierdź z wystawcą dokumentu lub placówką."

Zakazane: kolor alertu, sortowanie według CITO, push notification, dashboard „urgent", scoring pilności.

### 6.3 IKP/P1/CeZ/NFZ

We wszystkich modułach obowiązuje obligatoryjny non-affiliation disclaimer:

> „Pacjent360 jest niezależnym narzędziem do porządkowania dokumentów zdrowotnych przekazanych przez użytkownika. Nie jest usługą IKP, P1, CeZ ani NFZ i nie jest przez nie autoryzowany. Integracje z systemami publicznymi lub placówkami wymagają odrębnej podstawy prawnej, technicznej i umownej."

### 6.4 Dane fikcyjne

Demo i środowisko testowe używają wyłącznie danych fikcyjnych. Przed wejściem do demo użytkownik musi potwierdzić: „Używam wyłącznie danych fikcyjnych." Demo nie jest przeznaczone do realnych danych osobowych ani zdrowotnych.

## 7. Decyzje do potwierdzenia przez kancelarię

| ID | Pytanie | Moduł | Priorytet |
| --- | --- | --- | --- |
| D-MDR-01 | Czy Core jako repozytorium źródeł, timeline, braki, audyt i eksport może być kwalifikowany poza MDR? | Core | P0 |
| D-MDR-02 | Czy AI Drafting z No-New-Clinical-Meaning Gate może pozostać poza MDR? | AI Drafting | P0 |
| D-MDR-03 | Czy plain language na realnych danych zdrowotnych jest transformacją językową, czy interpretacją medyczną? | AI Drafting | P0 |
| D-MDR-04 | Jakie dowody techniczne są minimalne do wykazania braku nowego znaczenia klinicznego? | AI Drafting | P0 |
| D-MDR-05 | Czy pytania „do omówienia z lekarzem" generowane przez LLM z dokumentów pacjenta są bezpieczne? | AI Drafting | P0 |
| D-MDR-06 | Czy zadania administracyjne z dokumentu mogą być tworzone automatycznie bez wejścia w care navigation? | Core / AI Drafting | P0 |
| D-MDR-07 | Które funkcje roadmapy automatycznie uruchamiają MDR Rule 11? | wszystkie | P0 |
| D-MDR-08 | Czy Clinical Assist powinien być od razu projektowany jako MDR class IIa/IIb candidate? | Clinical Assist | P1 |
| D-AI-01 | Czy A7/A8 jako systemy AI wchodzą w high-risk przez MDR route lub Annex III AI Act? | AI Drafting | P1 |
| D-RODO-01 | Czy DPIA jest obligatoryjna już przed zamkniętym pilotem z AI Drafting? | AI Drafting | P0 |

## 8. Historia decyzji

| Data | Decyzja | Opis |
| --- | --- | --- |
| 2026-06-26 | D-Legal-001 | Founder przyjął Alternatywę C: Core + AI Drafting jako MVP; Clinical Assist jako wyłączony przyszły moduł regulowany. |
