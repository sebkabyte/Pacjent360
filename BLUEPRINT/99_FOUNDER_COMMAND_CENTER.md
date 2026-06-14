# Founder Command Center

## 1 zdanie

Pacjent360 porządkuje historię pacjenta przed wizytą, pokazując źródła, braki, niepewności i pytania do rozmowy z lekarzem.

## Obecny etap

Publiczna alpha / living prototype. Repo, strona i demo istnieją, ale najważniejszy etap to teraz alignment i walidacja z ludźmi.

## Najważniejszy cel na 30 dni

Doprowadzić stronę, demo i repo do pełnej spójności oraz przygotować pierwsze rozmowy walidacyjne.

## Najważniejszy cel na 90 dni

Sprawdzić, czy brief przed wizytą i historia pacjenta realnie pomagają lekarzom, pacjentom i opiekunom. Na tej podstawie podjąć decyzję: kontynuować, uprościć, pivotować albo zatrzymać wybrany kierunek.

## Top 5 priorytetów

1. Website-to-repo traceability.
2. Prosta ścieżka demo: perspektywa -> pacjent -> kokpit -> historia -> źródła -> podsumowanie.
3. Historia pacjenta czytelna w 10/90 sekund.
4. Walidacja: 2 POZ, 1 specjalista, 3 pacjentów/opiekunów.
5. Safety: zero diagnozy, triage, pilności i rekomendacji terapii.

## Top 5 no-go

1. Realne dane pacjentów w demo, fixtures, promptach albo publicznej walidacji.
2. AI jako lekarz, opiekun albo kliniczny decydent.
3. Claimy publiczne bez pokrycia w repo albo statusu “plan/horyzont”.
4. Backend, OCR, IKP/P1 i runtime agents przed walidacją.
5. Język sugerujący diagnozę, pilność, terapię albo gwarancję efektu klinicznego.

## Następny najlepszy ruch

Zrobić sprint alignmentu: przejść wszystkie publiczne strony i demo pod kątem claimów, safety i zgodności z `PRODUCT_SSOT.md`, a następnie odpalić pierwsze rozmowy walidacyjne.

## Dokumenty, do których wracać

| Potrzeba | Dokument |
|---|---|
| Decyzja strategiczna | `BLUEPRINT/00_MASTER_BLUEPRINT.md` |
| Zakres produktu | `BLUEPRINT/01_PRODUCT_BLUEPRINT.md` |
| Strona WWW | `BLUEPRINT/04_WEBSITE_BLUEPRINT.md` |
| Sprzedaż i GTM | `BLUEPRINT/05_SALES_AND_GTM_BLUEPRINT.md` |
| Walidacja | `BLUEPRINT/06_VALIDATION_BLUEPRINT.md` |
| Operacje | `BLUEPRINT/07_OPERATIONS_BLUEPRINT.md` |
| Technologia | `BLUEPRINT/08_TECHNOLOGY_BLUEPRINT.md` |
| Safety | `BLUEPRINT/09_TRUST_DITL_SAFETY_BLUEPRINT.md` |
| Agenci AI | `BLUEPRINT/10_AI_ASSISTANTS_BLUEPRINT.md` |
| Finansowanie | `BLUEPRINT/11_FUNDING_BLUEPRINT.md` |
| Zespół | `BLUEPRINT/12_TEAM_BLUEPRINT.md` |
| Roadmapa | `BLUEPRINT/13_ROADMAP_AND_MILESTONES.md` |
| Metryki | `BLUEPRINT/14_METRICS_BLUEPRINT.md` |
| Ryzyka | `BLUEPRINT/15_RISK_BLUEPRINT.md` |
| Decyzje | `BLUEPRINT/16_DECISION_LOG.md` |
| 90 dni | `BLUEPRINT/17_NEXT_90_DAYS.md` |

## Rzeczy, których nie ruszać teraz

- backend produkcyjny;
- OCR na realnych danych;
- integracje IKP/P1;
- runtime LLM;
- automatyczne działania agentów;
- pełna poradnia online jako publiczna obietnica;
- system krajowy;
- refaktor od zera bez wyniku walidacji.

## DoD

- Founder po otwarciu tego pliku wie, co jest projektem, co jest priorytetem i czego nie robić.
- Następny ruch jest jednoznaczny.
- Dokument wskazuje, gdzie szukać szczegółów.

## DoE

- Ten plik jest aktualizowany po każdym milestone review.
- Decyzje strategiczne trafiają do `16_DECISION_LOG.md`.
- Priorytety i no-go są zgodne z `PRODUCT_SSOT.md`.

## FoR

Review Command Center ma sprawdzać, czy founder odzyskuje jasność w 60 sekund.
