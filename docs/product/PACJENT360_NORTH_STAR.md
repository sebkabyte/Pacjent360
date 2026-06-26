# Pacjent360 North Star

Status: strategic guardrail
Date: 2026-06-26
Source input: interdisciplinary strategic review, normalized to SSOT

## Product Thesis

Pacjent360 is a context secretariat for patient, caregiver and doctor workflows.
It helps people see what is known, what is missing, what is sourced and what
should be discussed with an authorized professional.

Pacjent360 is not a medical decision system. It does not diagnose, triage,
recommend therapy, select urgency, replace official medical records or act as a
doctor, pharmacist or emergency service.

## North Star Outcome

The product should reduce the time needed to reconstruct patient context before
or during a visit. The commercial claim is operational: less time spent searching
through papers, PDFs, notes and scattered records. The claim is not clinical
automation.

## Source Truth

The source layer is the only clinical-context truth:

- documents;
- transcripts with explicit consent and retention policy;
- official imports;
- user-entered facts marked as manual source;
- audit records and acceptance decisions.

Every projection, timeline card, result chart, report draft or checklist item is
a view over source-linked records. A projection can improve navigation, but it
cannot become an independent clinical fact.

## Product Language

Allowed language:

- context;
- source;
- draft;
- missing data;
- discrepancy in records;
- question for the visit;
- task to confirm;
- source scope;
- consent scope.

Blocked language in patient-facing output:

- diagnosis;
- triage;
- urgent clinical judgment;
- therapy recommendation;
- treatment instruction;
- risk score;
- default medical interpretation;
- autonomous booking or purchase decision.

## Operating Boundaries

- Phase 1 focuses on Context Secretariat: source grounding, data quality,
  consent visibility, DITL questions, visit preparation and report drafts on
  synthetic data.
- Phase 2 contains higher-risk work: plain language rewriting after visits and
  booking/pharmacy/navigation flows. These require separate privacy, legal,
  clinical safety and product approval.
- Runtime LLM, real patient data, external APIs, autonomous actions and
  persistent writes require explicit gates before activation.

## Founder-Level Decisions

The following decisions must be explicit before product expansion:

1. Who is allowed to accept a draft as usable context.
2. How long prompts, transcripts, source snippets and audit logs are retained.
3. Which data may ever leave the browser or controlled backend.
4. Whether EU-only hosting and model routing are mandatory from the first pilot.
5. How caregiver access is scoped, revoked and audited.
6. How doctor-facing snapshots preserve the exact source state at export time.
7. What evidence is required before Phase 2 work can begin.

