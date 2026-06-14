# Roadmap And Milestones

## Cel dokumentu

Ustalić realistyczną roadmapę, która nie jest za duża i prowadzi od alpha do walidowanego MVP.

## P0: porządkowanie fundamentów

| Obszar | Treść |
|---|---|
| Cel | jeden SSOT, bezpieczeństwo, brak rozjazdu strony z repo |
| Zakres | BLUEPRINT, PRODUCT_SSOT, claim review, safety copy |
| Pliki / obszary | `BLUEPRINT/`, `PRODUCT_SSOT.md`, `public/`, `docs/governance/` |
| DoD | każda publiczna obietnica ma status |
| DoE | claim registry albo review list |
| No-go | nowe funkcje kliniczne |
| Decyzja | czy można iść do walidacji |

## P1: strona i repo alignment

| Obszar | Treść |
|---|---|
| Cel | strona sprzedaje jasno, repo broni claimów |
| Zakres | homepage, subpages, SEO, contact, README alignment |
| Pliki / obszary | `public/index.html`, podstrony, `README.md` |
| DoD | test 10 sekund przechodzi |
| DoE | linki i smoke test |
| No-go | claimy “ratuje życie”, “diagnozuje”, “pełna anonimizacja” |
| Decyzja | czy publikować aktualną wersję |

## P2: uproszczenie demo i widoku Historia

| Obszar | Treść |
|---|---|
| Cel | demo zrozumiałe bez prowadzenia |
| Zakres | perspektywa -> pacjent -> kokpit -> historia -> źródła -> podsumowanie |
| Pliki / obszary | `public/demo.html`, `public/app.js`, historia/mapa |
| DoD | klikane elementy działają i zmieniają stan |
| DoE | verify-reactivity, click routes, screen review |
| No-go | techniczne widoki jako główny UI |
| Decyzja | czy demo pokazać lekarzom |

## P3: walidacja z użytkownikami

| Obszar | Treść |
|---|---|
| Cel | sprawdzić wartość i ryzyka |
| Zakres | 6 sesji: 2 POZ, 1 specjalista, 3 pacjent/opiekun |
| Pliki / obszary | `docs/validation/`, tracker wyników |
| DoD | rozmowy wykonane i opisane |
| DoE | metryki continue/pivot/stop |
| No-go | realne dane pacjentów w publicznym demo |
| Decyzja | kontynuować / pivot / stop |

## P4: MVP product slice

| Obszar | Treść |
|---|---|
| Cel | pierwszy spójny flow produktu |
| Zakres | przygotowanie wizyty, brief, zgody, historia, raport |
| Pliki / obszary | frontend, contract, fixtures, tests |
| DoD | flow działa dla minimum 2-3 fikcyjnych przypadków |
| DoE | testy + walidacja użytkowników |
| No-go | backend bez dowodu potrzeby |
| Decyzja | czy projektować backend-ready contracts |

## P5: pilot

| Obszar | Treść |
|---|---|
| Cel | zamknięty pilot z partnerem |
| Zakres | privacy, security, support, consent, audit |
| Pliki / obszary | pilot protocol, legal/privacy/security docs |
| DoD | pilot ma jasny protokół i brak P0 risk |
| DoE | partner, uczestnicy, zgody, exit criteria |
| No-go | przetwarzanie danych bez formalnego procesu |
| Decyzja | czy wejść w produkt operacyjny |

## DoD

- Roadmapa jest podzielona na małe kroki.
- Każdy milestone ma no-go i decyzję.
- Backend i integracje nie wyprzedzają walidacji.

## DoE

- Każdy sprint mapuje się do P0-P5.
- Founder wie, który milestone jest aktywny.
- Nie ma równoległych konkurencyjnych roadmap.

## FoR

Review roadmapy ma sprawdzać, czy każdy krok zmniejsza najbliższe ryzyko.
