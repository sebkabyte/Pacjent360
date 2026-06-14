# Pacjent360 Master Blueprint

Status: command center projektu  
Data: 2026-06-14  
Zasada nadrzędna: porządkujemy kontekst, lekarz decyduje

## 1. Jednozdaniowa definicja

Pacjent360 to warstwa kontekstu pacjenta, która porządkuje dokumenty, wyniki, leki, obserwacje, pytania i zgody w czytelną historię przed wizytą.

## 2. Główna obietnica produktu

Pacjent, rodzic albo opiekun przygotowuje materiały przed wizytą, a lekarz widzi krótki, źródłowy obraz tego, co wiadomo, czego brakuje i co warto wyjaśnić w rozmowie.

## 3. Problem

Dane medyczne są rozproszone: w aplikacjach, plikach PDF, zdjęciach, wypisach, notatkach, pamięci pacjenta i obserwacjach rodziny. Przed wizytą często brakuje jednej, spokojnej historii.

## 4. Rozwiązanie

Pacjent360 układa materiały w prosty przepływ:

```text
dokumenty / leki / objawy / obserwacje
-> historia pacjenta
-> braki i niepewności
-> pytania do rozmowy
-> raport kontekstowy przed wizytą
-> zadania organizacyjne po wizycie
```

## 5. Dla kogo

| Persona | Co dostaje |
|---|---|
| Lekarz | krótki brief, źródła, rozbieżności, pytania do rozmowy |
| Pacjent | listę rzeczy do przygotowania, dokumenty, leki, pytania, zgody |
| Rodzic | sposób zebrania historii dziecka przed wizytą |
| Opiekun prawny | dostęp zgodny z podstawą opieki i zakresem zgody |
| Osoba wspierająca | ograniczony dostęp do zadań, wizyt, dokumentów albo leków |
| Inwestor / partner | wedge produktu, ścieżkę walidacji i potencjał skali |
| Współtwórca | jasny zakres, reguły bezpieczeństwa i obszary wkładu |

## 6. Pierwszy wedge

Pierwszy wedge to przygotowanie wizyty:

- pacjent, rodzic albo opiekun zbiera kontekst;
- system porządkuje historię i źródła;
- lekarz dostaje brief przed rozmową;
- po wizycie pacjent/opiekun widzi kroki organizacyjne.

Nie zaczynamy od pełnego systemu EHR, backendu, OCR, integracji IKP/P1 ani runtime AI.

## 7. Co jest w MVP

- statyczna strona WWW;
- demo alpha na danych fikcyjnych;
- trzy perspektywy: Lekarz360, Pacjent360, Opiekun360;
- historia pacjenta / mapa zdarzeń;
- dokumenty, leki, wyniki, wywiad, zgody, raport;
- schema, fixtures, walidatory i smoke testy;
- zasady DITL, źródeł, zgód i bezpieczeństwa copy.

## 8. Co jest poza zakresem teraz

- diagnoza;
- triage;
- ocena pilności;
- rekomendacje leczenia;
- dawkowanie;
- realne dane pacjentów;
- scraping IKP/P1;
- przechowywanie loginów;
- backend produkcyjny;
- integracje kliniczne;
- autonomiczni agenci wykonujący działania za użytkownika.

## 9. Strategia Polska-first / global-ready

Polska jest pierwszym rynkiem walidacyjnym, bo problem rozproszonych danych, opiekunów rodzinnych, dokumentów PDF i krótkich wizyt jest bardzo widoczny lokalnie. Projekt ma jednak od początku trzymać język i model danych gotowy do późniejszego myślenia globalnego: patient story, context layer, consent, source traceability, FHIR/IPS jako przyszły kierunek.

## 10. Najważniejsze decyzje

| ID | Decyzja |
|---|---|
| D-001 | Pacjent360 jest warstwą kontekstu, nie AI lekarzem. |
| D-002 | Najpierw walidujemy workflow przygotowania wizyty. |
| D-003 | Strona nie może obiecywać więcej niż repo potrafi obronić. |
| D-004 | DITL jest granicą operacyjną: lekarz rozstrzyga. |
| D-005 | Care Circle to ludzie; agenci AI to funkcje pomocnicze. |
| D-006 | Backend, OCR, IKP/P1 i runtime agents są po walidacji. |
| D-007 | Polska-first, ale język i architektura mają być global-ready. |

## 11. Najbliższe 90 dni

1. Zamrozić Master Blueprint jako command center.
2. Uporządkować alignment strony, repo i demo.
3. Przejść copy safety review wszystkich stron publicznych.
4. Uprościć demo do ścieżki: perspektywa -> pacjent -> kokpit -> historia -> źródła -> podsumowanie.
5. Przygotować i wykonać 6 rozmów walidacyjnych.
6. Zmierzyć, czy lekarz rozumie brief bez tłumaczenia.
7. Zmierzyć, czy pacjent/opiekun wie, co przygotować.
8. Podjąć decyzję: kontynuować, uprościć, pivotować albo zatrzymać moduł.

## 12. Kamienie milowe

| Milestone | Cel | Decyzja na końcu |
|---|---|---|
| P0 Fundamenty | blueprint, safety, repo hygiene | czy mamy jeden SSOT |
| P1 WWW + repo alignment | publiczne claimy mają pokrycie | czy strona jest wiarygodna |
| P2 Demo clarity | prosta ścieżka demo i historia pacjenta | czy demo da się pokazać bez tłumaczenia |
| P3 Walidacja | rozmowy z lekarzami/pacjentami/opiekunami | continue / pivot / stop |
| P4 MVP slice | pierwszy użyteczny flow produktu | czy budować backend-ready contracts |
| P5 Pilot | partner pilotażowy i bezpieczny protokół | czy wejść w produkt operacyjny |

## 13. Najważniejsze ryzyka

| Ryzyko | Mitygacja |
|---|---|
| Strona brzmi jak produkt kliniczny | claim registry i copy safety review |
| Użytkownik myli raport z diagnozą | jasny język: pytania, źródła, braki, decyzja lekarza |
| Opiekun widzi za dużo | macierz zgód i testy dostępu |
| AI wygląda jak lekarz | agenci jako asystenci porządkowania, bez decyzji |
| Demo ma zbyt dużo warstw | ścieżka prowadzona i progressive disclosure |
| Repo nie potwierdza strony | website-to-repo traceability |

## 14. Następny najlepszy ruch

Wykonać krótki sprint alignmentu: sprawdzić `public/` i `BLUEPRINT/` względem `PRODUCT_SSOT.md`, usunąć lub oznaczyć claimy bez pokrycia jako `plan / horyzont`, a potem przygotować pierwsze rozmowy walidacyjne.

## DoD

- Founder w 2 minuty potrafi wyjaśnić projekt.
- Każdy priorytet ma następny krok.
- Zakres MVP i no-go są jasne.
- Strona, demo i repo mają ten sam rdzeń narracji.
- Dokument nie obiecuje diagnozy, triage ani terapii.

## DoE

- Istnieje komplet plików `BLUEPRINT/`.
- `00_MASTER_BLUEPRINT.md` linkuje logicznie do roadmapy, walidacji, safety i strony.
- `git diff --check` przechodzi dla dokumentów.
- W review można wskazać: definicję, wedge, 90 dni, ryzyka i next move.

## FoR

Review tego dokumentu ma sprawdzać jedno: czy pomaga founderowi podjąć decyzję, a nie tylko opisuje projekt.
