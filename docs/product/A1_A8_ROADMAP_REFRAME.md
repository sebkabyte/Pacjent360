# A1-A8 Roadmap Reframe

Status: strategic reframe, not sprint activation
Date: 2026-06-26
Source input: interdisciplinary strategic review, normalized to SSOT

## Decision

The A1-A8 roadmap is split into two phases:

- Phase 1: Context Secretariat.
- Phase 2: High-Risk Assistance.

This document does not unlock implementation. `docs/SPRINTS.md` remains the
execution backlog, while this file sets the strategic ordering and risk posture.

## Phase 1: Context Secretariat

Phase 1 builds the ability to show sourced context safely.

Recommended order:

1. A1-Core: combine Safe Draft Dashboard and Source Grounding.
2. Data Quality: expose missing, conflicting or unsourced records as neutral
   context, not medical meaning.
3. DITL Questions: turn gaps and discrepancies into neutral questions.
4. Visit Checklist: prepare documents and topics for a visit.
5. Consent Guard: enforce caregiver, doctor and reviewer visibility before
   richer sharing features.
6. Medication Reconciliation: compare source records and user declarations
   without dose, therapy or interaction advice.
7. Report Drafting: create a source-grounded context snapshot for review.

The key Phase 1 proof is source-grounded utility: a doctor or reviewer can see
the context faster and verify every claim.

## Phase 2: High-Risk Assistance

Phase 2 contains flows that are useful but easier to misread as medical advice or
autonomous care navigation.

Deferred items:

- A7 Plain Language after visit;
- A7 Post Visit Task Router;
- A8 Medication Access;
- A8 Care Navigation and booking support.

Phase 2 cannot begin until Phase 1 passes safety, privacy, consent, UX and
commercial-message gates on synthetic data.

## Why A1 And A2 Move Together

Safe Draft Dashboard without source grounding is just a polished surface.
Source Grounding without a safe dashboard is hard to validate with real users.
The first implementation track should therefore treat them as A1-Core:

- every visible item has sourceRefs or `source_missing`;
- every generated item is a draft or review item;
- every role sees only what its consent scope allows;
- every interaction is dry-run until a human decision allows more.

## Roadmap Gates

- `Source Truth Gate`: projections cannot become independent facts.
- `Runtime Gate`: runtime LLM remains disabled until explicitly approved.
- `Consent Gate`: role visibility is enforced before summaries or exports.
- `Phase Boundary Gate`: A7/A8 cannot be pulled into Phase 1 by UI convenience.
- `Commercial Claim Gate`: demos sell time saved and traceability, not clinical
  automation.

## Non-Goals For Phase 1

- no diagnosis;
- no triage;
- no therapy recommendation;
- no urgency ranking;
- no default medical norms or interpretation catalogs;
- no autonomous booking, purchase, phone call, email or external write;
- no real patient data in public demo or red-team fixtures.

## Evidence Required To Advance

Before moving beyond Phase 1 planning, keep evidence for:

- source coverage and `source_missing` behavior;
- negative tests for unsafe medical language;
- role and consent leakage tests;
- doctor/reviewer validation on synthetic cases;
- proof that timeline, chart, table and report use the same source-linked IDs;
- proof that commercial messaging does not imply a medical device claim.

