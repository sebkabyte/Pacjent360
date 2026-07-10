# Pacjent360 Owner / RACI Matrix

Status: **ACTIVE FOR S0; HUMAN GAPS EXPLICIT**
Date: 2026-07-10
Gate: G0_PENDING

## Status vocabulary

- `NAMED` - konkretna osoba albo jawnie wskazany wykonawca ma mandat w bieżącym sprincie.
- `PLANNED` - NIEDOPUSZCZALNE w S0. Execution Plan wymaga w S0 wyłącznie `NAMED` albo `VACANT-BLOCKING`; rola bez obsadzenia jest `VACANT-BLOCKING`.
- `VACANT-BLOCKING` - brak ownera blokuje wskazaną bramkę.

## S0 RACI

| Funkcja | Owner/wykonawca | Status | RACI w S0 | Najpóźniej wymagany | Ograniczenie |
|---|---|---|---|---|---|
| Founder / Product accountable | Sebastian Kalisz (`P360-FOUNDER-SEBASTIAN-KALISZ-01`) | `NAMED` | A | teraz | tylko Founder podpisuje G0; ratyfikacja: `P360-ATT-D1-D8-20260710-001` |
| Delivery coordination | Codex w standing mandate Governance V2; Sebastian Kalisz jako Product accountable | `NAMED` | R/A | aktywny work order | Codex prowadzi wykonanie autonomicznie, ale nie zatwierdza human gate |
| Implementer S0 | Codex, Governance V2 standing mandate | `NAMED` | R | S0 | autonomiczne edit/stage/commit/amend; bez push/PR/release/deployment i destrukcyjnych operacji Git |
| Decision Scribe | Codex zapisuje decyzje operacyjne; Founder podpisuje wyłącznie decyzje zastrzeżone i human gates | `NAMED` | R/A | aktywny work order | brak samodzielnego statusu GO-S1 |
| Independent technical S0 Reviewer | GPT 5.6 SOL (oddzielony od implementera i Foundera) | `NAMED` | R | przed G0 24.07 | wyłącznie read-only technical review; może wydać `GO-S1`, `FIX` albo `NO-GO`, ale nie podpisuje G0 i nie zastępuje human-owned gate |
| Tech Lead | nieobsadzone; rekrutacja przed G2 | `VACANT-BLOCKING` | C | przed decyzją architektoniczną po G2 | nie blokuje samego S0 |
| QA Lead | do wskazania | `VACANT-BLOCKING` | C | przed G1 | niezależny evidence owner |
| Medical Safety Reviewer | nieobsadzone; fractional do zakontraktowania | `VACANT-BLOCKING` | C | przed zewnętrzną Alphą/G1 | klasyfikuje safety misreads |
| Security Lead | nieobsadzone; fractional do zakontraktowania | `VACANT-BLOCKING` | C | przed G1/G3 | nie akceptuje własnej implementacji |
| Privacy/Legal/DPO | nieobsadzone; external/fractional do zakontraktowania | `VACANT-BLOCKING` | C | przed G3 | AI nie zastępuje opinii |
| Release Manager | do wskazania | `VACANT-BLOCKING` | I | przed candidate build | odpowiada za parity |
| Founder OS | narzędzie organizacyjne | `NAMED` | I | S0 | rejestruje, nie zatwierdza |

## Gate ownership

| Gate | Accountable human | Required independent input | Current status |
|---|---|---|---|
| G0 Scope | Sebastian Kalisz | GPT 5.6 SOL jako oddzielny read-only technical S0 reviewer | `PENDING - reviewer named; verdict not issued` |
| G1 Alpha Safety | Sebastian Kalisz (Founder) | QA Lead `VACANT-BLOCKING`, Medical Safety Reviewer `VACANT-BLOCKING`, Release Manager `VACANT-BLOCKING` | `NOT ACTIVE - 3 seats VACANT-BLOCKING` |
| G2 Evidence | Sebastian Kalisz (Founder) | UX Research `VACANT-BLOCKING`, QA Lead `VACANT-BLOCKING`, Medical Safety Reviewer `VACANT-BLOCKING` | `NOT ACTIVE - 3 seats VACANT-BLOCKING` |
| G3 Real-Data Build | Sebastian Kalisz (Founder) | Privacy/Legal/DPO `VACANT-BLOCKING`, Security Lead `VACANT-BLOCKING` | `NOT ACTIVE - 2 seats VACANT-BLOCKING` |
| G4-G9 | Sebastian Kalisz (Founder) jako accountable; delegacja wymaga wpisu w Decision Logu | Security Lead, QA Lead, Privacy/Legal/DPO, Medical Safety Reviewer - wszystkie `VACANT-BLOCKING`; niezależny pentester nieobsadzony | `NOT ACTIVE - no seat filled` |

## Unresolved gate actions

1. GPT 5.6 SOL wykonuje oddzielny read-only technical review S0 i zapisuje osobny werdykt `GO-S1`, `FIX` albo `NO-GO`; samo wskazanie reviewera ani jego werdykt nie zamyka G0.
2. Po werdykcie review Sebastian Kalisz wykonuje odrębny akt Foundera podpisujący albo odrzucający G0. Sebastian Kalisz jest Founderem i nie pełni roli reviewera S0; GPT 5.6 SOL nie może podpisać G0.
3. Founder rezerwuje QA, Medical Safety, Security i Privacy/Legal przed G1/G3 zgodnie z roadmapą.
4. Rekord ratyfikacji Foundera jest przechowywany w `docs/governance/FOUNDER_ATTESTATION_D1_D8_2026-07-10.md`. Nie jest kwalifikowanym podpisem elektronicznym i nie zastępuje osobnego podpisu G0.

Brak ownera nie jest zgodą milczącą. Oznacza `HOLD` na odpowiedniej bramce.
