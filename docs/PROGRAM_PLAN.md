# Pacjent360 - ratyfikowany plan programu

Status: **ACTIVE PROGRAM CONTROL**
Ratyfikacja: Founder, 2026-07-10
Podstawa: ADR 0008, Founder Control Pack v1 i Product SSOT

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

## 1. Rola dokumentu

Ten dokument ustala kolejność programu. Definicję produktu prowadzi `../PRODUCT_SSOT.md`, pierwszy wedge prowadzi `product/FIRST_WEDGE.md`, decyzje prowadzą `governance/DECISION_LOG.md` i zatwierdzone ADR-y, pełne daty prowadzi `product/ROADMAP_2026_2027.md`, a work ordery prowadzi `product/EXECUTION_PLAN_2026_2027.md`.

Żaden prywatny backlog, raport, blueprint, prompt ani plik w ignorowanym katalogu nie może sam aktywować pracy.

## 2. Hierarchia programu

```text
PRODUCT_SSOT.md + safety
-> FIRST_WEDGE.md
-> ADR + DECISION_LOG.md
-> ROADMAP_2026_2027.md
-> EXECUTION_PLAN_2026_2027.md
-> jeden aktywny work order
-> evidence + human gate
```

`docs/product-delivery/` pozostaje `REFERENCE_ONLY`. Historyczne szczegóły mogą zostać ponownie użyte wyłącznie przez jawny ADR lub nowy zatwierdzony work order.

## 3. Jedyny aktywny program pracy

### Sprint 0 - Governance Freeze

**Okno:** 10-24.07.2026
**Gate:** G0 Scope
**Status:** ACTIVE, G0_PENDING

Cel:

- jeden current wedge;
- jedna hierarchia SSOT;
- mapa `ACTIVE / SUPERSEDED / REFERENCE_ONLY`;
- Owner/RACI Matrix;
- Definition of Ready/Done;
- scope validator z przypadkiem PASS i kontrolowanym FAIL;
- niezależny read-only review;
- decyzja Foundera `GO-S1`, `FIX` albo `NO-GO`.

Do zamknięcia G0 nie wolno zmieniać UI, runtime, API, backendu, builda ani deploymentu.

## 4. Program warunkowy

| Gate | Termin planistyczny | Prawo uzyskiwane po ludzkim GO |
|---|---:|---|
| G0 Scope | 24.07.2026 | możliwość aktywowania S1 |
| G1 Alpha Safety | 07.08.2026 | moderowane demo syntetyczne |
| G2 Evidence | 09.10.2026 | continue/narrow/pivot/stop; ewentualny formalny design |
| G3 Real-Data Build | 18.12.2026 | synthetic-first backend build |
| G4 Secure Staging | 30.06.2027 | niezależne assurance |
| G5 Real-Data Readiness | 15.08.2027 | przygotowanie pilota |
| G6 Pilot Entry | 15.09.2027 | ograniczony closed cohort |
| G7 Pilot Checkpoint | 31.10.2027 | continue/freeze/stop bez rozszerzania scope |
| G8 Pilot Exit | 15.12.2027 | closeout i decyzja 2028 |
| G9 MVP Decision | 22.12.2027 | plan 2028, nie automatyczny launch |

Daty są datami bramek, nie obietnicami dostarczenia. Brak dowodu albo otwarty P0 przesuwa datę.

## 5. Model zespołu

Do G2:

```text
Founder + AI/Codex/Founder OS + fractional human reviewers
```

Wymagani human owners są jawnie `NAMED`, `PLANNED` albo `VACANT-BLOCKING`. AI nie może zatwierdzać własnej pracy ani podpisywać human gate.

## 6. Enduring controls

Niezależnie od fazy pozostają aktywne:

- no-CDSS i source provenance;
- zakaz realnych danych przed formalną bramką;
- public artifact z zamkniętej allowlisty;
- brak counsel/internal material w publicznym repo artifact;
- source/build/runtime manifest z commit SHA, tree hash i `dirty=false`;
- release-readiness w trybie hard-fail;
- osobny human approval dla stage, commit, push, PR, release, upload i deploy;
- Decision Log i RFC dla każdego materialnego odskoku.

## 7. Zablokowane

Bez osobnego RFC Level C i właściwych opinii pozostają zablokowane:

- diagnoza, triage, pilność, interpretacja i rekomendacje;
- AI/LLM/OCR/RAG/embeddings;
- dzieci i guardian cases;
- produkcyjne konto lekarza;
- backend/auth i realne dane przed G3/G5;
- publiczny self-service;
- produkcyjne integracje IKP/P1/EHDS;
- publiczny launch w 2026-2027.

## 8. Najbliższa decyzja

Jedynym następnym dozwolonym wynikiem jest pakiet dowodowy S0 i human-owned decyzja G0 24.07.2026.
