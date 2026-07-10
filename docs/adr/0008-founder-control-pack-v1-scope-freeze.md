# ADR 0008 - Founder Control Pack v1 and current scope freeze

Status: **ACCEPTED**
Date: 2026-07-10
Decision owner: Sebastian Kalisz, Founder (`P360-FOUNDER-SEBASTIAN-KALISZ-01`)
Attestation: `P360-ATT-D1-D8-20260710-001`
Supersedes for current hierarchy: ADR 0005

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

## Context

Repo zawierało równoległe definicje doctor-first, parent/guardian-first, AI-first i patient/caregiver-first. Roadmapy, sprinty i ignorowany `docs/product-delivery/` mogły uruchamiać sprzeczne prace.

## Decision

Founder ratyfikował D1-D8 Founder Control Pack v1:

1. Pacjent360 jest Sekretariatem Kontekstu Zdrowotnego.
2. Current wedge to kompetentny dorosły pacjent, jedna nazwana dorosła osoba wspierająca i jedna planowana wizyta.
3. Alpha pozostaje synthetic-only i moderowana do Real-Data Gate.
4. Lekarz jest późniejszym odbiorcą read-only pakietu, nie current product.
5. B2C jest hipotezą użytkową 2026; B2B2C równoległym commercial discovery.
6. Do G2 działa solo Founder + AI/Codex/Founder OS + fractional human reviewers.
7. Daty są datami bramek, nie obietnicami wydania.
8. Obowiązuje jedna hierarchia prawdy i jeden aktywny work order.

Aktywny jest wyłącznie Sprint 0. G0 pozostaje `PENDING` do niezależnego review i osobnej decyzji Foundera.

## Hierarchy

```text
PRODUCT_SSOT.md + safety
-> FIRST_WEDGE.md
-> accepted ADR + DECISION_LOG.md
-> ROADMAP_2026_2027.md
-> EXECUTION_PLAN_2026_2027.md
-> one active work order
-> evidence
```

## Consequences

- `docs/product-delivery/`, BLUEPRINT, TEMP, prywatne prompty `CODEX_*.md` i starsze sprinty są `REFERENCE_ONLY`.
- Bieżące executable gates nie mogą czytać ani wykonywać ich stanu. Sam opis `REFERENCE_ONLY` nie wystarcza.
- Doctor/AI/child/guardian/backend-first current scope jest superseded.
- S1-P7 są warunkowe i nie mogą być rozpoczęte przed właściwym gate.
- D1-D5 można zmienić wyłącznie RFC Level C i wpisem w Decision Logu.
- AI nie może podpisać G0 ani późniejszego human-owned gate.

## Rejected alternatives

- trzy równoległe role jako current MVP;
- lekarz jako główny odbiorca Alphy;
- dziecko/guardian jako baseline;
- backend lub AI przed dowodem wartości;
- traktowanie roadmapy jako automatycznie aktywnego backlogu.

## Verification

`tools/validate-current-scope.mjs` oraz testy negatywnych mutacji sprawdzają zgodność aktywnych dokumentów z tym ADR.
