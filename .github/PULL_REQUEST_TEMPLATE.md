# PR: [Title]

## Scope

- [ ] Patient
- [ ] Caregiver
- [ ] Medical history
- [ ] Visit preparation
- [ ] Visit packet
- [ ] Post-visit
- [ ] Access
- [ ] Tech mode only

## What changed?

## What intentionally did not change?

## Pacjent360 Guardrails

- [ ] Normal UI is Patient/Caregiver-first.
- [ ] No Lekarz360 / doctorBrief in normal UI.
- [ ] No LLM/AI/asystent in normal UI.
- [ ] No diagnosis, triage, urgency assessment, risk scoring, interpretation or recommendations.
- [ ] No outliers / `poza normą` / `w normie` as system assessments.
- [ ] No red clinical alerts.
- [ ] No medication conflict / interaction-risk detection.
- [ ] Action cards are organizational, not clinical.
- [ ] Action cards use the approved v1 allowlist or an RFC is linked.
- [ ] Every visible information item has source/status or missing-source status.
- [ ] Caregiver access scope applied before render.
- [ ] Neutral no-access state.
- [ ] Mobile: no permanent sidebar/right panel.
- [ ] Sources render as chips plus drawer/bottom sheet, not a permanent right source panel.
- [ ] `regulatedFeaturesEnabled` remains `false`.
- [ ] `node tools/check-task-driven-ui-boundaries.mjs` passed.
- [ ] `node tools/check-no-cdss-copy.mjs` passed.

## Testing

- [ ] Home smoke test.
- [ ] Historia flow.
- [ ] Add item flow.
- [ ] Visit preparation flow.
- [ ] Caregiver flow.
- [ ] Mobile QA.
- [ ] Safety QA.
- [ ] Existing validators/regression.

## Odskok?

- [ ] No.
- [ ] Yes — RFC linked: ______

## Screenshots / notes
