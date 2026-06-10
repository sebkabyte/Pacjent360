# Pacjent360 UI Brand Checklist

Status: active checklist for public site, demo MVP and future app surfaces  
Scope: visual consistency, accessibility and clinical-safety wording  
Applies to: every UI change before commit

Pacjent360 should look like one trustworthy product across the public website, legal pages, doctor desktop, patient app and caregiver views. A UI change is ready only if it passes this checklist.

## Checklist

1. **Tokens, not random values**  
   Colors, radius, spacing, shadows, focus and typography should come from `public/brand/tokens.css` or from a local variable that falls back to a `--p360-*` token.

2. **One button system**  
   Primary, secondary, ghost and icon actions should visually map to the shared Pacjent360 button language. A new button style needs a clear product reason.

3. **Status is never color-only**  
   Every status needs text and, where practical, an icon. Color supports meaning but must not be the only signal.

4. **Colors describe data state, not clinical urgency**  
   Red, amber, green and blue indicate data status, missing context, confirmation or information. They must not imply diagnosis, triage, urgency or treatment priority.

5. **Focus is visible**  
   Links, buttons, inputs, filters, map events, cards used as controls and dialog actions need a visible `focus-visible` state.

6. **Mobile text and controls fit**  
   UI text must not overflow cards, buttons, tables or map panels. Touch targets should remain usable on small screens.

7. **Website and demo feel like one brand**  
   Public pages, legal pages and demo screens should share typography, status language, button behavior, radius scale and core colors.

8. **No diagnosis, triage or treatment wording**  
   UI output must not use language that makes Pacjent360 look like a diagnostic, triage, therapy or clinical decision system. Use context, source, question, task, status and DITL wording.

9. **Summaries keep source and uncertainty visible**  
   A summary, flag, timeline event, stage frame or report item must show a source or an explicit verification status. If source is missing, it must say so.

10. **New global classes are prefixed**  
   New shared classes should use `p360-`. Legacy classes may remain, but new reusable UI vocabulary should not add ambiguous global names such as `.card`, `.tag`, `.hero` or `.metric`.

## Stop Conditions

Stop and rewrite the UI change if it:

- can be read as a diagnosis or recommendation;
- hides that data is missing, uncertain or from patient/caregiver report;
- relies on red/amber/green alone for meaning;
- introduces a new visual language for one page only;
- weakens focus, mobile readability or source traceability.

## Recommended Wording

Prefer:

- `w dokumencie zapisano`;
- `pacjent zgłosił`;
- `opiekun odnotował`;
- `brak potwierdzenia w dokumentach`;
- `do omówienia z lekarzem`;
- `status: do weryfikacji przez lekarza`;
- `źródło`;
- `zadanie organizacyjne`;
- `pytanie DITL`.

Avoid:

- `diagnoza`;
- `triage`;
- `zalecamy`;
- `rekomendujemy`;
- `wskazanie do`;
- `pilne`;
- `wymaga natychmiastowej`;
- `system podejrzewa`;
- `nie musisz iść do lekarza`.

