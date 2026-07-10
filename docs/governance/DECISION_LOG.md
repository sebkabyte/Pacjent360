# Decision Log

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

### 2026-07-28 — P2 z review S0: rozbieżność provenance i termin G0 (do aktu Foundera)

**Ustalenie reviewera (GPT 5.6 SOL):** (a) `docs/product/PACJENT360_FOUNDER_CONTROL_PACK_V1_2026-07-10.md` wskazuje jako źródło `FOUNDER_DECISION_PACK_2026-07-10.md`, którego NIE ma w tym commicie (dokument jest poza governance-only zestawem S0); (b) commit powstał 28.07.2026, podczas gdy aktywne dokumenty nadal deklarują termin G0 na 24.07.2026, mimo że własna reguła roadmapy nakazuje przesunięcie daty przy braku dowodu.

**Dlaczego nie poprawiono tego w tym commicie:** Founder Control Pack, `PRODUCT_SSOT.md` i WO-S0 są hash-pinowane w `CURRENT_SCOPE_MANIFEST.json` (`ratification.artifactHashes`). Zmiana ich treści unieważnia zapis tego, co zostało ratyfikowane 10.07.2026, a odświeżenie hasha wymaga odrębnej autoryzacji Foundera (precedens: `artifactHashRefresh`). Implementer nie może sam autoryzować takiego odświeżenia.

**Wymagany akt Foundera:** (1) autoryzacja `artifactHashRefresh` dla poprawki provenance w Control Packu; (2) wyznaczenie nowego terminu G0 albo jawne potwierdzenie, że G0 pozostaje bez terminu do czasu pozytywnego review.

**Scope boundary:** ustalenie nie zmienia D1-D8, current wedge, `synthetic-only` ani żadnej zablokowanej bramki. G0 pozostaje `PENDING`.

**Owner:** Sebastian Kalisz, Founder. Zapis: Claude (implementer, Governance V2).

**Status:** Open; wymaga aktu Foundera.


### 2026-07-10 — Founder Control Pack v1 ratified; Sprint 0 activated

**Decision:** Sebastian Kalisz (`P360-FOUNDER-SEBASTIAN-KALISZ-01`) ratified decisions D1-D8 from `docs/product/PACJENT360_FOUNDER_CONTROL_PACK_V1_2026-07-10.md` and activated only `WO-P360-S0` through G0 on 24.07.2026. Attestation: `P360-ATT-D1-D8-20260710-001`.

**Current scope:** competent adult patient + one named adult supporter + one planned visit; manual source selection; max three user-authored questions; versioned VisitPacket; synthetic-only.

**Current exclusions:** doctor as current product, children/guardian baseline, runtime AI/LLM/OCR/CDSS, backend, real data, public self-service and public launch.

**Program decision:** B2C is the 2026 user-research hypothesis; B2B2C is parallel commercial discovery. Final business model and tenancy decision follows G2/Expert Gate.

**Governance consequence:** `PRODUCT_SSOT.md` and `FIRST_WEDGE.md` define product scope; ADR/Decision Log records decisions; `ROADMAP_2026_2027.md` defines conditional gates; `EXECUTION_PLAN_2026_2027.md` defines work orders. `docs/product-delivery/`, older doctor/AI/child-first plans, BLUEPRINT, TEMP and prywatne prompty są `REFERENCE_ONLY`, są odłączone od bieżących executable gates i wymagają ADR do reaktywacji.

**Gate status:** `G0_PENDING`. Ratification of D1-D8 does not equal G0 approval. Independent read-only review and Founder decision `GO-S1`, `FIX` or `NO-GO` remain required.

**Owner:** Sebastian Kalisz, Founder.

**Status:** Active.

### 2026-07-10 — Corrective S0 remediation authorized after independent findings

**Decision:** Founder polecił naprawić findings P0-P2 w granicy Sprintu 0 bez aktywowania S1. Dozwolono zamknięty corrective write set opisany w addendum WO-S0: README i dokumenty scope, ADR 0005/0008, manifest, RACI, attestation/evidence, CI/gate wiring, scope validator oraz jego testy. UI, dane, backend, build i release pozostają no-touch.

**Rationale:** Pierwszy evidence pack nie dowodził closed-world scope, wykonywalnego odłączenia ignorowanego control plane ani end-to-end kodu wyjścia negatywnej mutacji.

**Consequence:** wcześniejszy werdykt `FIX / HOLD G0` pozostaje historycznie poprawny. Korekta może przygotować nowy kandydat do niezależnego review, ale nie może sama podpisać G0.

**Owner:** Sebastian Kalisz, Founder. Implementer: Codex. Oddzielny read-only technical reviewer jest niezależny od implementera i nie podpisuje G0.

**Status:** Active corrective authorization; no phase activation.

### 2026-07-10 — Governance V2 standing delegation ratified

**Decision:** Sebastian Kalisz ratyfikował `docs/governance/GOVERNANCE_V2_STANDING_DELEGATION.md` i udzielił Codexowi stałego mandatu do autonomicznej realizacji, edycji, stage, commit i amend w granicach aktywnego work orderu.

**Founder-reserved decisions:** product-boundary changes, realne dane zdrowotne, funkcje regulowane, destrukcyjne operacje Git oraz push, PR, release i deployment.

**Precedence:** Governance V2 supersedes wcześniejsze bezwzględne zakazy oraz mikroautoryzacje read/edit/stage/commit/amend w Founder Control Pack, WO-S0, Execution Plan, Product Constitution, Definition of Ready/Done i evidence packach. Nie zmienia D1-D8, No-CDSS, `synthetic-only`, current wedge ani human ownership G0. Push, PR, release, deployment i destrukcyjne operacje Git pozostają zastrzeżone dla Foundera.

**Ratification:** `2026-07-10T17:58:26+02:00`.

> Ratyfikuję Pacjent360 Governance V2 i udzielam Codexowi stałego mandatu do autonomicznej realizacji, edycji, stage, commit i amend w granicach aktywnego work orderu. Osobnej zgody wymagają wyłącznie product-boundary changes, realne dane, funkcje regulowane, destrukcyjne operacje Git oraz push, PR, release i deployment.

**Status:** Active; operational authority only; `G0_PENDING`.

### 2026-07-10 — Repo-wide documentation closed-world repair requested

**Decision:** Po review `FIX / HOLD G0` Founder polecił zamknąć pozostałą lukę D8. Discovery ma obejmować całe `docs/` oraz istotne pliki dokumentacyjne w root repo; aktywne dokumenty mają exact-path override, a pozostałe wymagają jawnej klasyfikacji lub kontrolowanej reguły `REFERENCE_ONLY`.

**Required controls:** committed-HEAD G0 mode, obowiązkowy supporting evidence set, fail-closed corrective artifacts, mutacja pominiętego `docs/*.md` oraz osobna mutacja AI/OCR.

**Classifications:** `docs/ARCHITECTURE.md`, `docs/TIMELINE_VISION.md`, `docs/PROJECT_CHRONICLE.md` i `CHANGELOG.md` są `REFERENCE_ONLY` dla current scope i muszą mieć widoczny marker. README nie może przedstawiać ich jako bieżącego źródła prawdy.

**Boundary:** Bez push, PR, release i deploymentu. G0 pozostaje `PENDING` do niezależnego review i osobnego aktu Foundera.

**Status:** Active corrective request; no phase activation.

### 2026-07-10 — S0 corrective commit scope extended; initial reviewer appointment later corrected

**Decision:** Founder authorized one separate S0 corrective commit covering the complete path set in `docs/governance/S0_REPAIR_ALLOWLIST_2026-07-10.json`, extended explicitly to include `docs/product/PRODUCT_CONSTITUTION.md`, `docs/governance/SCOPE_GUARDRAILS.md` and `docs/qa/DEFINITION_OF_READY_DONE.md`. Push, PR, release and deployment remain prohibited.

**Reviewer appointment:** Superseded by the later Founder decision recorded below. Sebastian Kalisz remains Founder and is not the S0 reviewer; Codex remains the implementer.

**Consequence:** The authorized commit may establish tracked and clean-checkout evidence. It does not itself issue `GO-S1`, close G0 or activate S1.

**Authorization timestamp:** `2026-07-10T14:14:37+02:00`.

**Status:** Active authorization; `G0_PENDING` until reviewer verdict and separate Founder decision.

### 2026-07-10 — Clean-checkout S0 amendment authorized

**Decision:** After detached clean-checkout validation of commit `bbf237b` exposed four active scope documents present only as dirty-worktree changes, Founder authorized extending the same amended S0 commit to `PRODUCT_SSOT.md`, `docs/PROGRAM_PLAN.md`, `docs/ROADMAP.md` and `docs/product/FIRST_WEDGE.md`.

**Control improvement:** Tracked G0 validation must reject required files whose working-tree content differs from the Git index. This prevents a dirty worktree from making an incomplete commit appear compliant.

**Boundary:** Amend the existing commit so history still contains one S0 corrective commit. Push, PR, release and deployment remain prohibited.

**Consequence:** G0 remains pending until final clean-checkout proof, the separate GPT 5.6 SOL read-only technical reviewer verdict and a later, separate Founder G0 decision by Sebastian Kalisz.

**Status:** Active corrective authorization; no phase activation.

### 2026-07-10 — S0 reviewer identity corrected; Governance V2 Git precedence clarified

**Founder decision:** Sebastian Kalisz remains Founder and Product accountable and does not serve as the S0 reviewer. Founder appoints the exact label `GPT 5.6 SOL` as the separate read-only technical S0 reviewer. Codex remains the S0 implementer.

**Review boundary:** GPT 5.6 SOL may inspect the pinned S0 commit and issue a separate technical verdict `GO-S1`, `FIX` or `NO-GO`. It cannot modify findings during review, sign G0, impersonate the Founder or replace any human-owned acceptance. Its review record and the later Founder G0 act must remain separate.

**Attestation boundary:** This entry records a Founder governance decision in the repository. It is not a qualified electronic signature, a cryptographic model attestation or independent human assurance.

**Git authority:** Governance V2 permits Codex to edit, stage, commit and amend autonomously inside the active work order. Earlier absolute or consent-based no-stage/no-commit clauses in active S0 documents are superseded. Push, PR, release, deployment and destructive Git operations remain Founder-only exceptions requiring prior approval.

**Scope boundary:** This decision does not change D1-D8, the current wedge, `synthetic-only`, No-CDSS, regulated-feature blocks or `G0_PENDING`.

**Status:** Active; reviewer named; verdict not issued; G0 remains `PENDING`.

### 2026-07-09 — Task-driven UI enforcement layer

Decision: Enforcement task-driven UI active. We enforce Pacjent/Opiekun-first normal UI, `regulatedFeaturesEnabled=false`, no `doctorBrief` in normal mode, no outliers/red alerts/AI synthesis/CDSS language as system claims, and require the task-driven delivery contract for future UI patches.

Rationale: Prevent research-driven scope drift from turning safe action cards into clinical interpretation, LLM synthesis, medication conflict detection, doctor workflows or CDSS-like UI.

Impact: Future UI work must pass `check-task-driven-ui-boundaries`, `check-no-cdss-copy`, `check-normal-ui-no-tech-names` and `validate-go-live.ps1`. Any exception requires RFC.

Status: Active.

### 2026-07-09 — Doctor-facing workflow deferred

Decision: Lekarz360, doctorBrief and Pacjent w 90 sekund are hidden from normal UI in current MVP rebuild.

Rationale: reduce complexity, protect Patient/Caregiver focus, lower No-CDSS risk, improve mobile usability.

Status: Active.

### 2026-07-09 — Historia medyczna is core product object

Decision: Medical history is a first-level user-facing area, not technical backend.

Rationale: visit packet must be a snapshot of history, not a one-off form.

Status: Active.
