# Operations Blueprint

## Cel dokumentu

Ustalić prosty model prowadzenia projektu, żeby founder nie gubił się między stroną, demo, repo, walidacją, inwestorami i nowymi pomysłami.

## Zasada operacyjna

Każdy pomysł trafia do jednego z koszyków:

| Koszyk | Znaczenie |
|---|---|
| Teraz | wzmacnia pierwszy wedge i bezpieczeństwo publikacji |
| Następnie | potrzebne do walidacji lub MVP slice |
| Później | dobre, ale wymaga dowodów lub zespołu |
| Horyzont | wizja po walidacji |
| Nie teraz | rozprasza albo zwiększa ryzyko |

## SSOT projektu

| Obszar | SSOT |
|---|---|
| Produkt i granice | `PRODUCT_SSOT.md` |
| Strategia i decyzje | `BLUEPRINT/00_MASTER_BLUEPRINT.md`, `BLUEPRINT/16_DECISION_LOG.md` |
| Roadmapa | `BLUEPRINT/13_ROADMAP_AND_MILESTONES.md` |
| Safety | `BLUEPRINT/09_TRUST_DITL_SAFETY_BLUEPRINT.md`, `docs/governance/` |
| Technologia | `BLUEPRINT/08_TECHNOLOGY_BLUEPRINT.md`, `docs/ARCHITECTURE.md` |
| Walidacja | `BLUEPRINT/06_VALIDATION_BLUEPRINT.md`, `docs/validation/` |
| Materiały robocze | `TEMP/`, nie publiczny SSOT |

## Rytm tygodniowy

### Monday planning

- sprawdzić cel tygodnia;
- sprawdzić top 5 priorytetów;
- wybrać maksymalnie 3 zadania;
- ocenić ryzyka safety/RODO;
- zapisać DoD i DoE.

### Wednesday review

- sprawdzić, czy zadania nadal mają sens;
- przegląd strony i demo;
- review claimów publicznych;
- odciąć rozpraszacze.

### Friday decision log

- zapisać decyzje;
- co dowieziono;
- co nie działa;
- co zostaje na kolejny tydzień;
- aktualizacja ryzyk.

### Monthly milestone review

- ocena milestone;
- walidacja metryk;
- decyzja: continue / pivot / pause;
- aktualizacja 90 dni.

## PR governance

Każdy PR lub zmiana powinna mieć:

- cel;
- użytkownika;
- pliki;
- ryzyko;
- DoD;
- DoE;
- wpływ na stronę;
- wpływ na safety;
- testy.

## Gdzie trafiają pomysły

| Pomysł | Trafia do |
|---|---|
| Copy strony | Website backlog + claim registry |
| Nowy ekran demo | Product backlog |
| AI/agent | AI Assistants Blueprint + safety gate |
| Integracja | Technology horizon |
| Ryzyko | Risk Blueprint |
| Decyzja strategiczna | Decision Log |
| Materiał luźny | TEMP, potem triage |

## Czego nie robić operacyjnie

- Nie wykonywać równolegle strony, backendu, agentów i fundraisingu bez priorytetu tygodnia.
- Nie publikować claimów bez śladu w repo.
- Nie zaczynać backendu przed walidacją przepływu.
- Nie przenosić materiałów z TEMP automatycznie.
- Nie robić `git add .` przy publikacyjnych zmianach.

## DoD

- Projekt ma rytm tygodniowy i miesięczny.
- Każdy pomysł ma miejsce.
- Każda decyzja ma log.
- Materiały robocze nie stają się automatycznie strategią.

## DoE

- Istnieje aktualny `16_DECISION_LOG.md`.
- Co tydzień powstaje krótki handover.
- Każdy sprint kończy się decyzją, nie tylko listą zmian.
- Founder wie, co jest następnym ruchem.

## FoR

Review operacyjne ma sprawdzać, czy projekt idzie do dowodu wartości, a nie do większej liczby równoległych dokumentów.
