# A1 Safe Draft Dashboard Brief

<!-- P360_CONTROL_STATUS: SUPERSEDED -->

> **SUPERSEDED / REFERENCE_ONLY:** historical A1 design brief. It does not activate A1, authorize UI work or create current acceptance gates or Founder decisions. Current authority is `PRODUCT_SSOT.md`, `docs/product/PACJENT360_FOUNDER_CONTROL_PACK_V1_2026-07-10.md`, `docs/governance/CURRENT_SCOPE_MANIFEST.json` and the single active work order.

Status: historical kickoff intake, not current implementation
Date: 2026-06-26
Source input: Gemini UX strategy review, preserved as historical evidence

## Positioning

This archived brief does not provide a path from A0 to A1. A1 is not current
scope and can only be reconsidered through the active governance process and an
explicitly authorized future work order.

The product principle for A1 is:

> Always show source and status. Never imply a clinical decision.

## Scope

A1 is a Safe Draft Dashboard for synthetic fixtures. It lets a reviewer choose a
test case and inspect draft operational outputs, DITL status and source links in
a patient-friendly interface.

Allowed in A1 planning:

- synthetic fixture selection;
- timeline/feed cards with draft status and source labels;
- detail inspector showing provenance and unresolved items;
- read-only audit JSON download for the preview session;
- validation that blocks unsafe copy, missing source status and unsafe sorting.
- display rules that hide technical agent names and keep draft questions or
  discrepancies in the inspector rather than the main feed.

Not allowed in A1:

- runtime LLM calls;
- real patient data entry;
- writes to the main IndexedDB or localStorage profile state;
- urgency, importance or risk sorting;
- red/green semantic health coloring;
- warning or medical iconography;
- progress bars or readiness scores;
- booking, purchase, external API calls or care navigation;
- clinical interpretation, triage, therapy or decision language.

## Information Architecture

The dashboard uses one synthetic story with role-specific density, not separate
truths.

Patient lens:

- scenario selector;
- calm timeline/feed ordered chronologically;
- feed cards limited to neutral facts and source summaries;
- detail inspector with provenance and draft question/task context.

Caregiver lens:

- only areas allowed by fixture consent scope;
- no placeholder for blocked areas;
- organizational tasks only inside the consent scope.

Doctor/reviewer lens:

- denser source coverage;
- discrepancies shown as items to verify, not ranked findings;
- each medical-context item links to sourceRefs or explicit source_missing.

## UI Copy Rules

Preferred labels:

- "Szkic do omowienia"
- "Brak wskazanego zrodla"
- "Rozbieznosc w zapisach"
- "Zadanie organizacyjne"
- "Pytanie do rozmowy"
- "Zakres ze zrodla"
- "Oznacz do omowienia"
- "Porownaj zrodla"

Avoid in user-visible copy:

- "diagnoza"
- "zalecenie"
- "terapia"
- "pilne"
- "natychmiast"
- "triage"
- "w normie"
- "poza norma"
- "rekomendacja"
- "alert"
- "zastosuj plan"
- "wykryto"
- "blad"
- "zostaw jako luke"
- "gotowosc wizyty"

## Red-Team Risks To Validate

- Color or iconography makes an item feel urgent.
- A status badge sounds like a medical approval.
- A technical agent name leaks into patient-facing UI.
- Source gaps are hidden or softened.
- A draft can be mistaken for a medical record.
- Chronology is replaced by priority-like sorting.
- Caregiver UI reveals that a blocked section exists.
- A generated question suggests a condition or treatment path.
- Generated questions or discrepancies appear as main feed facts.
- A result chart implies improvement or decline.
- A rejected draft looks like deleting source documentation.
- An export looks like official medical documentation.
- A progress metric makes the patient feel pressure or clinical readiness.

## Historical A1 Acceptance Gates

The archived A1 proposal used these gates. They do not activate current or future UI work:

- `Data Gate`: fixture only, no user medical input and no real patient data.
- `Runtime Gate`: runtime LLM calls are disabled.
- `Persistence Gate`: no writes to primary profile storage.
- `Source Gate`: every rendered card has sourceRefs or `source_missing`.
- `Status Gate`: every assistant-origin item has a visible draft/review status.
- `Sort Gate`: feed order is chronological or alphabetical only.
- `Visual Gate`: no red/green semantic health state.
- `Icon Gate`: no warning, exclamation, siren, cross or medical icons.
- `Display Gate`: technical agent names are never exposed in patient UI.
- `Surface Gate`: questions, discrepancies and source gaps render in the
  inspector, not as authoritative feed facts.
- `Progress Gate`: no readiness percentages, progress bars or completion score.
- `Safety Copy Gate`: user-visible text blocks forbidden clinical wording.
- `Consent Gate`: caregiver views omit blocked areas without naming them.
- `Scope Gate`: A1 does not include booking, purchases or external actions.

## Historical Open Questions (Not Current Founder Decisions)

1. Whether plain language always appears next to original source text.
2. Whether `source_missing` renders as an item-level marker or blocks a card.
3. How conflicting source claims are displayed without declaring a winner.
4. What term replaces "assistant" in the main patient UI.
5. Whether the default entry point is "history view" or "prepare visit".
6. How to explain fixture-driven previews to reviewers without overclaiming.
7. Whether A1 may show any action buttons beyond preview/audit export.
8. How doctor acceptance is represented without creating medical records.
9. Which role lens is the first validation scenario.
10. Which manual review evidence is required before opening A1 implementation.
