# Pacjent360 S0 / G0 Evidence Pack - superseded first attempt

Status: **SUPERSEDED / REFERENCE_ONLY AFTER REVIEW FINDINGS**
Superseded by: `docs/governance/S0_CORRECTIVE_EVIDENCE_PACK_2026-07-10.md`
Reason: pierwszy pakiet nie miał closed-world manifestu, reprodukowalnego attestation, end-to-end CLI negative ani pathwise corrective baseline. Jego werdykt `FIX / HOLD G0` pozostaje historycznie poprawny.
Date: 2026-07-10
Active work order: `docs/product/WO_P360_S0_GOVERNANCE_FREEZE_2026-07-10.md`
Decision basis: Founder ratified D1-D8 on 2026-07-10

## 1. Repo baseline and dirty-state warning

Baseline captured before S0 writes:

| Field | Value |
|---|---|
| Branch | `codex/s2-rework` |
| HEAD | `1a2e4b6a9bef10259b874bf4c3672fcdfb84f8a4` |
| Tree | `1d5094a48599b56ee095ac96b287c1bd05c53bce` |
| Upstream | `origin/codex/s2-rework` |
| Modified tracked entries | 32 |
| Untracked top-level porcelain entries | 29 |
| Staged | 0 |
| `docs/product-delivery/` ignored | true |

Worktree był brudny przed S0. Nie wykonano `stash`, `clean`, `reset`, branch switch ani globalnego formatowania. Z tego powodu pełny obecny diff nie może być przedstawiany jako diff wyłącznie S0. Dowodem write setu S0 jest jawna lista poniżej oraz historia operacji `apply_patch` bieżącego wykonania.

## 2. Ratyfikacja

Founder przekazał wpis:

> Ratyfikuję decyzje D1-D8 Founder Control Pack v1 z 10.07.2026, aktywuję wyłącznie Sprint 0 do bramki G0 24.07.2026 i utrzymuję wszystkie późniejsze fazy jako warunkowe do czasu wymaganych dowodów oraz ludzkich podpisów.

Ratyfikacja została zapisana w:

- `PRODUCT_SSOT.md`;
- `docs/adr/0008-founder-control-pack-v1-scope-freeze.md`;
- `docs/governance/DECISION_LOG.md`;
- `docs/product/PACJENT360_FOUNDER_CONTROL_PACK_V1_2026-07-10.md`;
- `docs/product/ROADMAP_2026_2027.md`;
- `docs/product/EXECUTION_PLAN_2026_2027.md`;
- aktywnym WO-S0.

Ratyfikacja D1-D8 nie jest decyzją G0. G0 pozostaje osobnym human-owned gate.

## 3. Active scope

```text
competent adult patient
+ one named adult supporter
+ one planned visit
+ manual source selection
+ max three user-authored questions
-> versioned VisitPacket
```

Current data mode: `synthetic_only`.

Current exclusions:

- doctor as current product;
- children/guardian baseline;
- runtime AI/LLM/OCR/CDSS;
- backend/auth and real data;
- public self-service and public launch;
- diagnosis, triage, urgency, interpretation, scoring and recommendations.

## 4. Document status map

### ACTIVE

| Path/group | Role | Why active |
|---|---|---|
| `PRODUCT_SSOT.md` | Product SSOT | ratified definition and scope |
| `docs/product/FIRST_WEDGE.md` | first wedge | ratified D2 |
| `docs/adr/0008-founder-control-pack-v1-scope-freeze.md` | decision | accepted D1-D8 and hierarchy |
| `docs/governance/DECISION_LOG.md` | decision history | ratification and gate status |
| `docs/PROGRAM_PLAN.md` | program order | one active sprint and conditional gates |
| `docs/ROADMAP.md` | executive view | points to the ratified roadmap |
| `docs/product/ROADMAP_2026_2027.md` | gate roadmap | active program, later phases conditional |
| `docs/product/EXECUTION_PLAN_2026_2027.md` | execution system | S0 active, S1-P7 conditional |
| `docs/product/PRODUCT_CONSTITUTION.md` | guardrail | subordinate to Product SSOT |
| `docs/product/PACJENT360_FOUNDER_CONTROL_PACK_V1_2026-07-10.md` | founder summary | management layer, not second SSOT |
| `docs/product/WO_P360_S0_GOVERNANCE_FREEZE_2026-07-10.md` | active work order | only current work order |
| `docs/governance/SCOPE_GUARDRAILS.md` | scope policy | RFC and forbidden-boundary rules |
| `docs/governance/CURRENT_SCOPE_MANIFEST.json` | machine registry | validator input |
| `docs/governance/OWNER_RACI_MATRIX.md` | ownership | human gaps explicit |
| `docs/qa/DEFINITION_OF_READY_DONE.md` | delivery gate | S0 DoR/DoD |
| safety docs in manifest | safety | safety remains authoritative |

### REFERENCE_ONLY

| Path/group | Reason |
|---|---|
| `docs/product-delivery/` | ignored, historical blueprint set; cannot drive backlog |
| `docs/SPRINTS.md` and `docs/SSOT.md` | historical AI/agent lane; no active runtime AI |
| `docs/product/DEMO_I18N_*` | older execution plan; i18n can later be acceptance criterion |
| `docs/product/ROADMAP_SMALL_STEPS.md` | discovery input, superseded by ratified roadmap |
| `docs/product/FOUNDER_DECISION_PACK_2026-07-10.md` | input report, superseded by Founder Control Pack v1 |
| `docs/product/MVP_*` and `USER_FLOWS_*` | design/research references, not active work orders |
| `BLUEPRINT/`, `TEMP/` | ignored historical material |
| `research/`, `docs/reviews/` | evidence/input, not implementation authority |

### SUPERSEDED CURRENT-SCOPE CLAIMS

The following claims are superseded wherever they appear in historical/reference material:

- doctor-first current product;
- child/guardian baseline;
- runtime AI/OCR current phase;
- backend before Evidence/Real-Data gates;
- public launch in 2026-2027.

The original files remain available for history. They do not regain authority without ADR/RFC.

## 5. Owner/RACI result

RACI is recorded in `docs/governance/OWNER_RACI_MATRIX.md`.

Key result:

- Founder: `NAMED`, accountable for G0;
- Codex: `NAMED`, S0 implementer only;
- Independent S0 Reviewer: `VACANT-BLOCKING` before G0;
- QA Lead and Release Manager: `VACANT-BLOCKING` before G1/candidate build;
- Medical Safety, Security and Privacy/Legal: `PLANNED` fractional humans.

No vacant role is treated as silent approval.

## 6. S0 write set

Files written in this S0 execution:

- `PRODUCT_SSOT.md`;
- `docs/PROGRAM_PLAN.md`;
- `docs/ROADMAP.md`;
- `docs/product/FIRST_WEDGE.md`;
- `docs/product/PRODUCT_CONSTITUTION.md`;
- `docs/product/ROADMAP_2026_2027.md`;
- `docs/product/EXECUTION_PLAN_2026_2027.md`;
- `docs/product/PACJENT360_FOUNDER_CONTROL_PACK_V1_2026-07-10.md`;
- `docs/product/WO_P360_S0_GOVERNANCE_FREEZE_2026-07-10.md`;
- `docs/adr/0008-founder-control-pack-v1-scope-freeze.md`;
- `docs/governance/DECISION_LOG.md`;
- `docs/governance/SCOPE_GUARDRAILS.md`;
- `docs/governance/OWNER_RACI_MATRIX.md`;
- `docs/governance/CURRENT_SCOPE_MANIFEST.json`;
- `docs/governance/S0_G0_EVIDENCE_PACK_2026-07-10.md`;
- `docs/qa/DEFINITION_OF_READY_DONE.md`;
- `tools/validate-current-scope.mjs`;
- `tests/current-scope-validator.test.mjs`.

No product UI, runtime, API, backend, `dist`, build or deployment file was written as part of S0. Such paths remain pre-existing dirty worktree state where applicable.

## 7. Automated evidence

| Command | Result |
|---|---|
| `node tools/validate-current-scope.mjs` | PASS: 19 registered documents, one active work order, G0 pending |
| `node --test tests/current-scope-validator.test.mjs` | PASS 5/5 |
| doctor-first controlled mutation | expected FAIL detected |
| AI/OCR-current controlled mutation | expected FAIL detected |
| duplicate active work order mutation | expected FAIL detected |
| `node --test tests` | PASS 76/76 legacy tests |
| three normal-UI governance guards | PASS |
| `git diff --check` | PASS; pre-existing CRLF normalization warnings only |

`validate-go-live.ps1` was not run because it writes `dist` and is outside S0.

## 8. Unresolved human items

1. Founder must name an independent S0 reviewer.
2. Independent reviewer must run the prompt from WO-S0 and issue `GO-S1`, `FIX` or `NO-GO`.
3. Founder must separately sign the G0 result after that review.
4. QA, Release, Medical Safety, Security and Privacy/Legal ownership must be closed at the gates stated in RACI.
5. Existing public/runtime P0 issues remain for conditional S1; they are not solved by governance ratification.

## 9. Evaluator verdict

**FIX / HOLD G0.**

Reason: ratification, canonical reconciliation and automated evidence are complete, but independent S0 reviewer remains `VACANT-BLOCKING` and Founder has not yet signed the separate G0 result.

Permitted next step: independent read-only S0 review only.

Forbidden next step: S1 implementation, UI redesign, backend, real data, build, release or deployment.

## 10. Git and release confirmation

No stage, commit, push, PR, merge, tag, release, upload or deployment was performed.
