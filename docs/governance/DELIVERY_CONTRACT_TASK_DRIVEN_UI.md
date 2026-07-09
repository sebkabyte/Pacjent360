# Delivery Contract: Task-Driven UI

Status: active governance contract for task-driven UI work.

```text
// P360_MODE: PATIENT_CAREGIVER_FIRST
// P360_UI: TASK_DRIVEN_NO_CLINICAL_INTERPRETATION
// P360_CORE: HISTORY_IS_CORE
// P360_ALLOWED: ACTION_CARDS_SOURCE_BASED
// P360_FORBIDDEN: OUTLIERS_RED_ALERTS_LLM_SYNTHESIS_DOCTOR_AI_CDSS
// P360_CHANGE_CONTROL: RFC_REQUIRED_FOR_ODSKOK
```

This contract filters research into delivery scope. Codex and other agents must not treat research reports as implementation commands until governance has translated them into this contract or a linked RFC.

## Implement Now

- Home direction: `Dzisiaj` as a task-driven entry point in a future UI patch.
- Max 3 neutral action cards.
- Medical history remains the core product object.
- History is card-based.
- Source/status appears as chips.
- Source details open in a drawer or bottom sheet, not a permanent right panel in normal UI.
- Mobile-first layout.
- Pagination or lazy-loading placeholder for long lists.
- Normal UI remains Patient/Caregiver-first.

## Allowed Action Cards

Codex must not invent new v1 action cards without an RFC. Allowed organizational cards:

- `Zbliża się wizyta`
- `Brakuje dokumentu oznaczonego przez pacjenta/opiekuna`
- `Leki i alergie do potwierdzenia`
- `Nowy wpis od opiekuna`
- `Nowy dokument w historii`
- `Pytania zapisane do wizyty`

## Do Not Implement Now

- outliers;
- `poza normą` / `w normie` as system claims;
- red clinical alerts;
- medication conflict detection;
- interaction-risk detection;
- LLM synthesis;
- `Asystent Wizyt`;
- AI chat;
- `doctorBrief`;
- `Lekarz360` in normal UI;
- urgency assessment;
- triage;
- recommendations;
- result interpretation.

## Forbidden Action Cards

- `Wynik poza normą`
- `Ryzyko lekowe`
- `Pilna sprawa`
- `AI przygotowała syntezę`
- `System wykrył odchylenie`

## Required Execution Procedure

1. Planner: produce changed files, implementation steps and acceptance checks.
2. Scope Guard: state whether the work is an `odskok`.
3. Realizer: implement only after the scope is clear.
4. Verifier: run focused guards and QA.
5. Evaluator: close with `GO`, `FIX` or `NO-GO`.

If a plan or implementation needs any forbidden item, stop and create an RFC instead of coding it.

## Required Checks

Focused checks:

```powershell
node tools/check-task-driven-ui-boundaries.mjs
node tools/check-no-cdss-copy.mjs
node tools/verify-click-routes.js
node tools/verify-reactivity.js
```

Full gate:

```powershell
powershell -ExecutionPolicy Bypass -File tools/validate-go-live.ps1
```

## Odskok Rule

Any request to enable doctor-facing normal UI, AI/LLM, outliers, clinical alerts, result interpretation, medication conflict detection, interaction-risk detection, triage, urgency assessment or recommendation logic is Level C and requires RFC plus founder/safety review before implementation.
