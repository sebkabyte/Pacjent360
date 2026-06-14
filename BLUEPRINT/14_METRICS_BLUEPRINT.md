# Metrics Blueprint

## Cel dokumentu

Ustalić metryki, które mówią, czy Pacjent360 idzie w dobrą stronę.

## Product metrics

| Metryka | Cel |
|---|---:|
| Lekarz rozumie brief bez tłumaczenia | >= 70% sesji |
| Lekarz wskazuje 3 sprawy do wyjaśnienia | >= 70% sesji |
| Pacjent wie, co przygotować | >= 4/6 uczestników |
| Opiekun rozumie zakres zgody | >= 4/6 uczestników |
| Ukończenie ścieżki demo | >= 80% |

## Website metrics

| Metryka | Cel |
|---|---:|
| Test 10 sekund: “co to jest?” | >= 80% poprawnych odpowiedzi |
| Klik w demo albo kontakt | baseline, potem wzrost |
| Bounce po hero | do obserwacji |
| Mobile readability | brak bloków tekstu dominujących ekran |
| Broken links | 0 |

## Validation metrics

| Metryka | Cel |
|---|---:|
| Liczba sesji | min. 6 |
| Przydatność briefu 1-5 | >= 3.5 |
| Zaufanie do źródeł 1-5 | >= 3.5 |
| Odczyt jako diagnoza/triage | 0 |
| Lista braków produktu | minimum 10 konkretnych wniosków |

## Investor metrics

| Metryka | Cel |
|---|---:|
| Rozmowy inwestorskie | 3-5 po P2 |
| Zrozumienie wedge | >= 80% rozmów |
| Request for follow-up | >= 2 |
| Pytania o safety/RODO | zapisane i zaadresowane |
| Zainteresowanie pilotem | >= 1 partner / inwestor |

## Engineering metrics

| Metryka | Cel |
|---|---:|
| `node --test tests/` | pass |
| Harm gates | pass |
| Demo coherence | pass |
| Reactivity/click routes | pass |
| Public package verifier | pass przed uploadem |
| Liczba realnych danych w repo | 0 |

## Safety metrics

| Metryka | Cel |
|---|---:|
| Serious safety concern | 0 |
| Claim bez źródła/statusu | 0 w publicznym core flow |
| Opiekun widzi poza zgodą | 0 |
| Zakazane frazy w UI | 0 |
| AI output bez źródła | no-go do A0 |

## Metryka strategiczna

Po 90 dniach projekt powinien mieć:

- jasny publiczny przekaz;
- działające demo bez tłumaczenia;
- minimum 6 sesji walidacyjnych;
- decyzję continue / pivot / stop;
- minimum 1 rozmowę partnerską lub inwestorską z realnym follow-up.

## DoD

- Metryki są mierzalne.
- Metryki obejmują produkt, stronę, walidację, engineering i safety.
- Są progi continue/pivot/stop.

## DoE

- Istnieje tracker wyników walidacji.
- Wyniki mają datę i uczestnika/personę.
- Decyzje roadmapy odnoszą się do metryk.

## FoR

Review metryk ma sprawdzać, czy liczby pomagają podjąć decyzję, a nie tylko ładnie wyglądają.
