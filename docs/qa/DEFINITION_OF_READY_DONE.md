# Definition of Ready / Definition of Done

Status: **ACTIVE FOR RATIFIED SCOPE**
Current sprint: **S0 only**
Gate: **G0_PENDING**

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

## Definition of Ready - każdy work order

Work order może wejść do wykonania tylko, gdy ma:

1. aktywny sprint i gate;
2. referencję do Product SSOT, ADR i Decision Logu;
3. problem użytkownika albo outcome kontrolny;
4. dokładny bazowy commit/tree SHA i clean/dirty status;
5. dokładną allowlistę plików owned;
6. listę plików no-touch;
7. acceptance criteria;
8. wpływ na source/status/date/visibility;
9. wpływ na No-CDSS, privacy, medical safety i mobile;
10. pozytywny test oraz kontrolowaną mutację negatywną;
11. stop conditions;
12. ownera akceptacji i wskazanie human-owned gate;
13. jawne out-of-scope;
14. potwierdzenie Governance V2: Codex może autonomicznie wykonać stage/commit/amend w aktywnym work orderze; push/PR/release/deployment i destrukcyjne operacje Git wymagają uprzedniej zgody Foundera.

## Definition of Done - Sprint 0

S0 jest technicznie gotowy do niezależnego review tylko, gdy:

1. D1-D8 są zapisane jako ratyfikowane;
2. `PRODUCT_SSOT.md` i `FIRST_WEDGE.md` wskazują jeden wedge;
3. hierarchia dokumentów jest jedna;
4. istnieje mapa `ACTIVE / SUPERSEDED / REFERENCE_ONLY`;
5. `docs/product-delivery/` nie steruje backlogiem;
6. RACI używa `NAMED / PLANNED / VACANT-BLOCKING`;
7. scope validator przechodzi;
8. doctor-first mutation zwraca non-zero;
9. AI/OCR-current mutation zwraca non-zero;
10. diff jest podzbiorem allowlisty WO-S0;
11. nie zmieniono UI/runtime/build;
12. stage/commit/amend, jeżeli wykonane, mieszczą się w aktywnym work orderze i Governance V2; nie wykonano push/PR/release/deployment ani destrukcyjnej operacji Git bez uprzedniej zgody Foundera;
13. unresolved human items są jawne;
14. GPT 5.6 SOL jako oddzielny read-only technical S0 reviewer zwrócił `GO-S1`, `FIX` albo `NO-GO`;
15. Founder osobno podpisał decyzję G0.

## Future product DoD

Po aktywacji właściwego sprintu dodatkowo obowiązują:

- normal UI bez technicznych nazw i CDSS-like copy;
- mobile/reflow/accessibility;
- każde twierdzenie ze źródłem/statusem;
- osoba wspierająca widzi tylko zakres;
- neutralny no-access state;
- brak alertów, rekomendacji i klinicznego rankingu;
- QA evidence oraz wymagane human sign-off.

Ta sekcja nie aktywuje żadnego przyszłego sprintu.
