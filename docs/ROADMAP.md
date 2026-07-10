# Pacjent360 - aktywny widok roadmapy

Status: **ACTIVE EXECUTIVE VIEW**
Ratyfikacja: Founder, 2026-07-10
Pełna roadmapa: `product/ROADMAP_2026_2027.md`

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

## Teraz

Aktywny jest wyłącznie:

> **Sprint 0 - Governance Freeze, 10-24.07.2026, G0_PENDING.**

Zakres:

- Product SSOT i First Wedge;
- ADR/Decision Log;
- mapa dokumentów;
- RACI;
- Definition of Ready/Done;
- scope validator i negatywne mutacje;
- niezależny read-only review.

Nie zmieniamy UI, backendu, API, runtime, `dist` ani publicznego wdrożenia.

## Po G0, warunkowo

| Etap | Warunek aktywacji | Status |
|---|---|---|
| S1 Alpha Safety | podpisane G0 `GO-S1` | CONDITIONAL |
| S2-S6 Evidence | G1 i zamknięte P0 | CONDITIONAL |
| P7 legal/backend/pilot | odpowiednie G2-G6 | CONDITIONAL |

Nie wolno rozpoczynać etapu tylko dlatego, że występuje w roadmapie.

## Current wedge

```text
kompetentny dorosły pacjent
+ jedna nazwana dorosła osoba wspierająca
+ jedna planowana wizyta
+ ręczny wybór źródłowych informacji
+ maksymalnie trzy pytania
-> wersjonowany Pakiet wizyty
```

## Zablokowane

- doctor-first current product;
- dzieci i guardian baseline;
- runtime AI/LLM/OCR/CDSS;
- backend i realne dane;
- publiczny self-service i launch;
- interpretacja, triage, pilność, scoring i rekomendacje.

## Źródła prawdy

1. `../PRODUCT_SSOT.md`
2. `product/FIRST_WEDGE.md`
3. `adr/0008-founder-control-pack-v1-scope-freeze.md`
4. `governance/DECISION_LOG.md`
5. `product/ROADMAP_2026_2027.md`
6. `product/EXECUTION_PLAN_2026_2027.md`
7. aktywny `WO_P360_S0_GOVERNANCE_FREEZE_2026-07-10.md`
