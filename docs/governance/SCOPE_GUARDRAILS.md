# Pacjent360 Scope Guardrails

Status: **ACTIVE - FCV1 D1-D8**
Current sprint: **S0 only**
Gate: **G0_PENDING**

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

## Current wedge

> kompetentny dorosły pacjent + jedna nazwana dorosła osoba wspierająca + jedna planowana wizyta.

## Current work boundary

Do G0 wolno zmieniać wyłącznie ratyfikowane docs/governance/tooling z WO-S0. UI, runtime, API, backend, build i deployment są no-touch.

## Future normal UI boundary

Po osobnym `GO-S1` normalny UI może zmierzać wyłącznie do:

- Dzisiaj;
- Moja historia;
- Przygotuj wizytę;
- Pomagam komuś;
- Kto może mi pomagać / Dostępy.

Ten wykaz nie aktywuje S1.

## Forbidden current scope

- Lekarz360, doctorBrief i Doctor Context jako current product;
- dzieci, rodzic działający z mocy prawa i guardian cases;
- A1/S2/clinical/technical modules jako normalny produkt;
- AI/LLM/OCR/RAG/embeddings;
- diagnoza, triage, pilność, scoring, result interpretation i rekomendacje;
- realne dane, backend/auth i integracje;
- publiczny self-service lub launch;
- szerszy dostęp osoby wspierającej niż jawny zakres.

## Source and packet rules

- źródło jest prawdą, historia projekcją;
- brak daty pozostaje `unknown`;
- każdy element ma autora i źródło/status;
- Pakiet wizyty ma tylko ręcznie wybrane elementy;
- maksymalnie trzy pytania zapisuje użytkownik;
- zero automatycznej selekcji lub klinicznego rankingu.

## RFC triggers

RFC Level C jest wymagany dla zmiany:

- D1 definicji produktu;
- D2 pierwszego wedge;
- D3 granicy Alphy;
- D4 roli lekarza;
- D5 hipotezy B2C/B2B2C;
- current role, data mode, backend, AI albo public launch;
- zakresu dostępu lub nowej kategorii danych.

## Governance V2 operating authority

`docs/governance/GOVERNANCE_V2_STANDING_DELEGATION.md` jest aktywnym mandatem wykonawczym. Codex autonomicznie realizuje, edytuje, testuje, stage'uje, commit'uje i amenduje w granicach aktywnego work orderu.

Osobna zgoda Foundera pozostaje wymagana wyłącznie dla product-boundary changes, realnych danych, funkcji regulowanych, destrukcyjnych operacji Git oraz push/PR/release/deployment. Allowlista dokumentuje wykonany zakres i nie jest mikrobramką zgody.

## Enforcement

`tools/validate-current-scope.mjs` sprawdza ratyfikowany kontrakt i active document manifest. Każdy krytyczny gate musi mieć przypadek PASS oraz kontrolowaną mutację FAIL/non-zero.
