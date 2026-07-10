# Pacjent360 Product Constitution

Status: **ACTIVE, RATIFIED GOVERNANCE BASELINE**
Ratyfikacja: Founder, 2026-07-10
Podrzędność: `../../PRODUCT_SSOT.md` pozostaje Product SSOT

<!-- P360_CURRENT_SCOPE_V1
contract_id=FCV1-D1-D8-2026-07-10
current_sprint=S0
gate=G0_PENDING
primary_user=competent_adult_patient
support_user=one_named_adult_supporter
wedge=one_planned_visit
data=synthetic_only
doctor=later_read_only_recipient
children_guardians=blocked
runtime_ai_ocr_cdss=blocked
backend=blocked
public_launch=blocked_2026_2027
-->

## 1. Product truth

Pacjent360 jest źródłowym Sekretariatem Kontekstu Zdrowotnego. Historia jest rdzeniem, a główną przyszłą akcją na historii jest ręczne przygotowanie jednej wizyty.

## 2. Current wedge

```text
competent adult patient
+ one named adult supporter
+ one planned visit
+ manual source selection
+ max three user-authored questions
-> versioned VisitPacket
```

## 3. Current phase

Aktywny jest wyłącznie Sprint 0 do G0. Current phase jest synthetic-only i docs/governance/tooling-only.

Lekarz, dzieci/guardian, AI/LLM/OCR/CDSS, backend, realne dane i integracje nie należą do current phase.

## 4. Hard rules

1. Źródło jest prawdą; historia jest projekcją.
2. Każdy element ma osobę, autora, źródło/status i datę albo `unknown`.
3. Pakiet zawiera wyłącznie ręcznie wybrane elementy.
4. System nie diagnozuje, nie interpretuje, nie ocenia pilności i nie rekomenduje.
5. Nazwana osoba wspierająca nie jest automatycznie opiekunem prawnym.
6. Dostęp musi być ograniczony przed renderem, pakietem i eksportem.
7. Mobile-first i jedno zadanie na ekran wygrywają z kompletnością funkcji.
8. Każdy odskok wymaga właściwego RFC.
9. AI nie zatwierdza własnej pracy ani human-owned gate.
10. Codex jest implementerem S0; GPT 5.6 SOL jest oddzielnym read-only technical S0 reviewerem; Sebastian Kalisz jest Founderem i nie jest reviewerem. Review i późniejszy akt Foundera G0 są odrębne, a GPT 5.6 SOL nie może podpisać G0.
11. Governance V2 pozwala Codexowi autonomicznie wykonywać edit/stage/commit/amend w aktywnym work orderze. Push, PR, release, deployment i destrukcyjne operacje Git wymagają uprzedniej zgody Foundera.

## 5. Product is not

- AI doctor;
- diagnostic, triage or urgency system;
- CDSS;
- treatment recommendation tool;
- result interpretation tool;
- clinical completeness engine;
- official medical record or EHR;
- IKP/P1/CeZ/NFZ;
- certified medical device claim.

## 6. Later, conditional

Warunkowe fazy mogą badać:

- produkcyjny adult supporter access model po opinii prawnej;
- synthetic-first backend po G3;
- read-only odbiór pakietu przez lekarza po dowodzie, że PDF/print nie wystarcza;
- zamknięty pilot po security, privacy i independent assurance.

Istnienie fazy w roadmapie nie aktywuje jej.

## 7. Change control

Zmiana definicji, wedge, granicy Alphy, roli lekarza albo modelu B2C/B2B2C wymaga RFC Level C, aktualizacji ADR i Decision Logu oraz podpisu Foundera.
