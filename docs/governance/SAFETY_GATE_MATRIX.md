# Safety Gate Matrix

Status: active governance control
Date: 2026-06-26
Scope: Pacjent360 agent, projection, report and roadmap work

## Purpose

This matrix turns strategic risk into executable gates. It is intentionally
system-wide: a feature can pass its own sprint checklist and still be blocked if
it violates one of these gates.

## Matrix

| Gate ID | Gate | Blocks | Required Evidence |
| --- | --- | --- | --- |
| `data_truth_gate` | Source records are the only truth. | Timeline, chart or report creates a new clinical fact without source linkage. | Source refs or explicit `source_missing` for every claim. |
| `projection_gate` | Projections are views, not records of clinical truth. | `TimelineEvent`, chart point or report item carries independent interpretation. | Stable source-linked IDs reused across views. |
| `source_gate` | Every visible claim has a source state. | Missing sourceRefs without `source_missing`. | Validator coverage and UI source marker. |
| `ditl_gate` | Output supports a human decision. | Output answers the medical question instead of preparing it. | DITL status, draft status and review path. |
| `forbidden_output_gate` | Clinical decision language is blocked. | Diagnosis, triage, therapy, urgency, treatment instruction or risk scoring. | Forbidden-language test and negative cases. |
| `consent_gate` | Role visibility follows consent. | Caregiver, doctor, reviewer or export sees data outside scope. | Consent scope record and leakage tests. |
| `role_visibility_gate` | Hidden data cannot leak by error copy. | UI reveals existence or topic of blocked data. | Neutral blocked-state copy and role fixtures. |
| `visual_neutrality_gate` | Visual design cannot imply clinical severity. | Red/green health states, warning icons, urgency sorting or readiness scores. | UI lint and screenshot review. |
| `runtime_gate` | Runtime LLM and external calls are explicit decisions. | Runtime model calls, external APIs or hidden network writes in Phase 1. | Config proof and dry-run fixture validation. |
| `persistence_gate` | Drafts do not silently become records. | Writes to profile, IndexedDB, localStorage or exports without acceptance. | Preview, acceptance and audit trail. |
| `phase_boundary_gate` | High-risk Phase 2 work stays deferred. | A7/A8 behavior appears inside Phase 1 under another name. | Roadmap status and red-team cases. |
| `commercial_claim_gate` | B2B claims remain operational. | Marketing says the system diagnoses, recommends care or replaces review. | Copy review and founder-facing pitch lint. |

## Phase Policy

Phase 1 is allowed to organize context, show sources, detect data gaps, prepare
neutral questions and create reviewable drafts on synthetic data.

Phase 2 is blocked by default for plain-language after-visit rewriting,
medication access, care navigation, booking and pharmacy search. These flows can
only move after separate legal, privacy, clinical safety and founder approval.

## Source Model Guardrail

`TimelineEvent`, result charts, report sections and dashboard cards are
projections. They must not store independent clinical meaning. If the same fact
appears in more than one place, each place must point back to the same source
record or projection ID.

## Validation Entry Point

The executable fixture for this matrix is
`fixtures/system-wide-red-team-cases.json`.

The validator is `tools/validate-safety-gate-matrix.js`.

