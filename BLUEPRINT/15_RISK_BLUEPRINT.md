# Risk Blueprint

## Cel dokumentu

Nazwać ryzyka Pacjent360 i przypisać mitygacje, ownerów oraz no-go.

## Rejestr ryzyk

| ID | Ryzyko | Wpływ | Prawdopodobieństwo | Mitygacja | Owner | No-go |
|---|---|---|---|---|---|---|
| R-001 | Użytkownik myli raport z diagnozą | wysoki | średnie | copy safety, DoH, walidacja | clinical safety | >=2 takie odczyty |
| R-002 | Flagi/kolory wyglądają jak triage | wysoki | średnie | neutralne statusy, brak języka pilności | UX + safety | “pilne”/ranking ryzyka |
| R-003 | Opiekun widzi za dużo | wysoki | średnie | macierz zgód, testy scope | privacy | leakage danych |
| R-004 | Strona obiecuje więcej niż repo | wysoki | wysokie | claim registry, review WWW | founder | claim bez statusu |
| R-005 | AI brzmi jak lekarz | wysoki | średnie | agenci jako funkcje porządkowania | product | output kliniczny |
| R-006 | Realne dane trafią do demo/promptów | krytyczny | średnie | no-real-data policy | founder/security | wykryte realne dane |
| R-007 | Backend zbudowany za wcześnie | średni | średnie | validation gate | CTO | brak dowodu wartości |
| R-008 | Historia pacjenta jest niezrozumiała | wysoki | wysokie | test 10/90 sekund, UX redesign | UX | lekarz nie rozumie |
| R-009 | Inwestor widzi chaos strategii | średni | średnie | master blueprint | founder | brak next move |
| R-010 | Publiczny język “poradnia online” wyprzedza produkt | wysoki | średnie | etapowanie i statusy | founder/GTM | obietnica istniejącej usługi |
| R-011 | Repo zawiera prywatne materiały | wysoki | niskie/średnie | allowlist, gitignore lokalny, review | engineering | plik prywatny staged |
| R-012 | Prompt injection w dokumentach | wysoki | później średnie | A0 agent safety, dry-run | security/AI | runtime bez gate |
| R-013 | Brak walidacji z ludźmi | wysoki | wysokie | zaplanować rozmowy | founder | decyzje produktu bez rozmów |
| R-014 | Strona jest ładna, ale niekonkretna | średni | średnie | test 10 sekund | UX/GTM | użytkownik nie rozumie |
| R-015 | Public interest miesza się z komercją bez jasności | średni | średnie | osobny funding/team blueprint | founder/legal | obietnice udziałów bez procesu |

## Ryzyka produktowe

- zbyt szeroki zakres;
- demo zbyt techniczne;
- historia pacjenta niezrozumiała;
- brak pierwszego wedge.

## Ryzyka medyczne

- język diagnozy;
- triage;
- reassurance;
- sugestia terapii;
- mylenie obserwacji opiekuna z faktem klinicznym.

## Ryzyka prawne

- realne dane bez procesu;
- niejasne zgody;
- publiczne obietnice “anonimizacji”;
- claim wyrobu medycznego.

## Ryzyka techniczne

- monolit frontendowy;
- brak parytetu UI-eksport;
- publikacja nieaktualnego dist;
- CDN cache;
- niekontrolowane zależności.

## Ryzyka UX

- pierwsze kliknięcie niejasne;
- za dużo tekstu;
- źródła dominują UI;
- opiekun nie wie, dlaczego nie ma dostępu.

## Ryzyka funding

- za duża narracja zbyt wcześnie;
- brak dowodów walidacyjnych;
- niedoszacowanie compliance;
- mieszanie open source z equity bez procesu.

## DoD

- Każde ryzyko ma ownera i mitygację.
- Istnieją no-go.
- Ryzyka są aktualizowane co sprint.

## DoE

- Risk review odbywa się przed publikacją i przed walidacją.
- P0 ryzyka blokują release.
- Decision log pokazuje, jak ryzyko zostało obsłużone.

## FoR

Review ryzyk ma szukać najgorszego możliwego odczytu przez użytkownika, regulatora, lekarza i inwestora.
