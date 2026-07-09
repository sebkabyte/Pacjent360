# Decision Log

Use this file for product, scope, safety and architecture decisions.

## Template

```md
## YYYY-MM-DD — [Decision title]

### Decision
[What did we decide?]

### Context
[Why was this decision needed?]

### Options considered
1. ...
2. ...
3. ...

### Rationale
[Why this option?]

### Consequences
[What changes? What becomes out of scope?]

### Owner
[Name/role]

### Status
Active / Superseded / Reversed
```

## Seed decisions

### 2026-07-09 — Task-driven UI enforcement layer

Decision: Enforcement task-driven UI active. We enforce Pacjent/Opiekun-first normal UI, `regulatedFeaturesEnabled=false`, no `doctorBrief` in normal mode, no outliers/red alerts/AI synthesis/CDSS language as system claims, and require the task-driven delivery contract for future UI patches.

Rationale: Prevent research-driven scope drift from turning safe action cards into clinical interpretation, LLM synthesis, medication conflict detection, doctor workflows or CDSS-like UI.

Impact: Future UI work must pass `check-task-driven-ui-boundaries`, `check-no-cdss-copy`, `check-normal-ui-no-tech-names` and `validate-go-live.ps1`. Any exception requires RFC.

Status: Active.

### 2026-XX-XX — Doctor-facing workflow deferred

Decision: Lekarz360, doctorBrief and Pacjent w 90 sekund are hidden from normal UI in current MVP rebuild.

Rationale: reduce complexity, protect Patient/Caregiver focus, lower No-CDSS risk, improve mobile usability.

Status: Active.

### 2026-XX-XX — Historia medyczna is core product object

Decision: Medical history is a first-level user-facing area, not technical backend.

Rationale: visit packet must be a snapshot of history, not a one-off form.

Status: Active.
