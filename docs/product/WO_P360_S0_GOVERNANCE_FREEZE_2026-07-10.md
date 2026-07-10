# WO-P360-S0 — Governance Freeze

**Data przygotowania:** 2026-07-10
**Planowane okno:** 2026-07-10 — 2026-07-24
**Status:** ACTIVE - ratyfikowany przez Foundera 2026-07-10; G0 nadal PENDING
**Tryb:** docs/governance/tooling only

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

```text
// P360_MODE: PATIENT_CAREGIVER_FIRST
// P360_CORE: SOURCE_LED_VISIT_PREP
// P360_WEDGE: COMPETENT_ADULT_PATIENT_PLUS_ONE_NAMED_ADULT_SUPPORTER
// P360_ACTION: ONE_PLANNED_VISIT_PACKET_MAX_3_USER_QUESTIONS
// P360_DATA: SYNTHETIC_ONLY_UNTIL_HUMAN_REAL_DATA_GATE
// P360_SCOPE: NO_DOCTOR_NO_AI_NO_CDSS_NO_BACKEND_CURRENT_PHASE
// P360_REGULATED_FEATURES: HARD_DISABLED
// P360_CHANGE_CONTROL: RFC_REQUIRED_FOR_SCOPE_CHANGE
// P360_GIT: AUTONOMOUS_STAGE_COMMIT_AMEND__FOUNDER_ONLY_PUSH_PR_RELEASE_DEPLOYMENT_DESTRUCTIVE_GIT
```

## Cel

Utworzyć jedną aktywną i niesprzeczną prawdę o bieżącym produkcie Pacjent360. Nie implementować funkcji produktowych.

## Decyzje wejściowe

1. Produkt: źródłowa historia → ręczny wybór do jednej planowanej wizyty → maks. 3 pytania → wersjonowany pakiet.
2. Użytkownicy current phase: kompetentny dorosły pacjent i jedna nazwana dorosła osoba wspierająca.
3. Dane: wyłącznie syntetyczne do formalnego Real-Data Gate.
4. Lekarz: późniejszy odbiorca read-only pakietu; nie current product.
5. AI/LLM/OCR/CDSS/clinical interpretation: zablokowane.
6. Hipoteza użytkowa: B2C; równoległe commercial discovery B2B2C; decyzja biznesowa po G2/Expert Gate.
7. Roadmapa jest systemem bramek, nie obietnicą release.
8. Dzisiaj aktywny jest tylko Sprint 0.

## Dozwolony zakres

- inwentaryzacja dokumentów i aktywnego backlogu;
- propozycja hierarchy/precedence;
- statusy `ACTIVE`, `SUPERSEDED`, `REFERENCE_ONLY`;
- aktualizacja dokumentów governance/product po jawnej ratyfikacji;
- Owner/RACI Matrix;
- Definition of Ready/Done;
- ADR/Decision Record;
- read-only repo reconnaissance;
- scope validator oraz test pozytywny i kontrolowana negatywna mutacja.

## Oczekiwana allowlista plików

Dostosuj do rzeczywistej struktury repo, ale nie wychodź poza:

- `PRODUCT_SSOT.md`
- `docs/PROGRAM_PLAN.md`
- `docs/ROADMAP.md`
- `docs/product/FIRST_WEDGE.md`
- `docs/product/PRODUCT_CONSTITUTION.md`
- `docs/product/ROADMAP_2026_2027.md`
- `docs/product/EXECUTION_PLAN_2026_2027.md`
- `docs/governance/DECISION_LOG.md`
- `docs/governance/SCOPE_GUARDRAILS.md`
- `docs/governance/OWNER_RACI_MATRIX.md`
- `docs/qa/DEFINITION_OF_READY_DONE.md`
- nowy ADR/Decision Record
- nowy `tools/validate-current-scope.mjs`
- test/fixture validatora

Jeżeli wymagany plik nie istnieje albo realna struktura jest inna, zatrzymaj zapis i zwróć proposed path map. Nie twórz przypadkowych duplikatów.

### Corrective addendum S0-R po findings P0-P2

**Autoryzacja:** Sebastian Kalisz, Founder, 2026-07-10. Polecenie: naprawić findings w celu ponownego niezależnego review bez aktywowania S1.
**Charakter:** doprecyzowanie dowodu i enforcementu D1-D8; nie zmienia current wedge ani D1-D8.
**Governance V2:** Codex może autonomicznie wykonywać edit/stage/commit/amend w granicach tego aktywnego work orderu. Push, PR, release, deployment i destrukcyjne operacje Git wymagają uprzedniej zgody Foundera.
**Reviewer:** GPT 5.6 SOL jest oddzielnym read-only technical S0 reviewerem. Sebastian Kalisz pozostaje Founderem i nie jest reviewerem; GPT 5.6 SOL nie może podpisać G0.

Rozszerzona, zamknięta allowlista korekty:

- `README.md`;
- `docs/product/PACJENT360_FOUNDER_CONTROL_PACK_V1_2026-07-10.md`;
- `docs/product/WO_P360_S0_GOVERNANCE_FREEZE_2026-07-10.md`;
- `docs/product/ROADMAP_2026_2027.md`;
- `docs/product/EXECUTION_PLAN_2026_2027.md`;
- `docs/adr/0005-product-ssot-hierarchy.md`;
- `docs/adr/0008-founder-control-pack-v1-scope-freeze.md`;
- `docs/governance/DECISION_LOG.md`;
- `docs/governance/CURRENT_SCOPE_MANIFEST.json`;
- `docs/governance/OWNER_RACI_MATRIX.md`;
- `docs/governance/S0_G0_EVIDENCE_PACK_2026-07-10.md`;
- `docs/governance/FOUNDER_ATTESTATION_D1_D8_2026-07-10.md`;
- `docs/governance/S0_REPAIR_BASELINE_2026-07-10.json`;
- `docs/governance/S0_REPAIR_ALLOWLIST_2026-07-10.json`;
- `docs/governance/S0_REPAIR_CHANGESET_2026-07-10.json`;
- `docs/governance/S0_CORRECTIVE_EVIDENCE_PACK_2026-07-10.md`;
- `.github/workflows/validate.yml`;
- `tools/validate-current-scope.mjs`;
- `tests/current-scope-validator.test.mjs`;
- `tools/capture-s0-boundary.mjs`;
- `tools/validate-go-live.ps1`;
- `tools/verify-public-repo.ps1`;
- `tools/public-repo-manifest.txt`;
- lokalne markery `REFERENCE_ONLY` w ignorowanych `BLUEPRINT/20_ONE_PLAN_AND_GATES.md` i `CODEX_SH_DELIVERY_LOOP_PROMPT.md`.

Każda inna ścieżka pozostaje no-touch. Baseline korekty i końcowy changeset muszą umożliwić porównanie path-by-path, także dla plików untracked i ignored. Ignorowane markery nie są źródłem prawdy; jedyną kontrolą behawioralną jest ich nieobecność w executable gates.

## Pliki i obszary no-touch

- produktowy UI i CSS;
- runtime flags;
- backend/API implementation;
- `dist/`, deploy, Service Worker i artefakty builda;
- clinical/doctor/AI modules;
- dokumenty counsel/internal poza read-only klasyfikacją statusu;
- jakiekolwiek dane użytkowników;
- pliki spoza zatwierdzonej allowlisty.

## Zadania

1. Zapisz bazowy commit/tree SHA i stan clean/dirty. Nie wykonuj `stash`, `clean`, `reset`, zmiany branch ani globalnego formatera.
2. Odczytaj wszystkie dokumenty, które deklarują current product, MVP, role, wedge, roadmapę, AI, doctor view, children/guardian albo backend.
3. Zbuduj tabelę:
   - ścieżka;
   - deklarowany status;
   - rzeczywisty wpływ na current scope;
   - rekomendacja `ACTIVE/SUPERSEDED/REFERENCE_ONLY`;
   - sprzeczność;
   - wymagana decyzja ludzka.
4. Sprawdź, czy `docs/product-delivery/` jest ignorowane i czy zawiera równoległy backlog. Zaproponuj jedną z opcji: przenieść kanoniczne elementy do śledzonego katalogu albo jawnie oznaczyć cały katalog jako reference-only.
5. Przygotuj diff ratyfikujący:
   - adult patient + named adult supporter;
   - one planned visit;
   - synthetic-only;
   - no doctor/AI/CDSS/backend current phase;
   - B2C product research + B2B2C commercial discovery;
   - gate-based roadmap.
6. Przygotuj Owner/RACI Matrix z wartościami `NAMED`, `PLANNED`, `VACANT-BLOCKING`.
7. Dodaj scope validator. Validator ma failować, gdy aktywny dokument:
   - stawia lekarza jako głównego użytkownika current phase;
   - włącza children/guardian baseline;
   - włącza runtime AI/OCR/CDSS;
   - obiecuje real-data/public launch przed właściwą bramką;
   - definiuje inny first wedge.
8. Dodaj:
   - przypadek PASS dla ratyfikowanego zakresu;
   - kontrolowaną mutację doctor-first lub AI-first, która musi zwrócić non-zero.
9. Nie oznaczaj dokumentu jako zatwierdzony bez ludzkiego wpisu w Decision Logu.
10. Zwróć evidence pack; stage/commit/amend są dozwolone zgodnie z Governance V2, lecz nie wykonuj push, PR, release, deploymentu ani destrukcyjnej operacji Git bez uprzedniej zgody Foundera.

## Testy obowiązkowe

- scope validator: PASS;
- doctor-first mutation: FAIL/non-zero;
- AI/OCR current-scope mutation: FAIL/non-zero;
- każdy aktywny plan wskazuje ten sam wedge;
- wszystkie statusy dokumentów mają uzasadnienie;
- git diff dotyczy wyłącznie allowlisty;
- brak zmian UI/runtime/build;
- stage/commit/amend, jeżeli wykonane, mieszczą się w aktywnym WO; brak push, PR, release, deploymentu i destrukcyjnych operacji Git bez uprzedniej zgody Foundera.

## Definition of Done

- jedna podpisywalna definicja produktu;
- jedna hierarchia SSOT;
- mapa `ACTIVE/SUPERSEDED/REFERENCE_ONLY`;
- RACI bez ukrytych human gates;
- scope validator z dowodem pozytywnym i negatywnym;
- jawne unresolved items;
- rekomendacja `GO-S1`, `FIX` albo `NO-GO`;
- brak zmian poza zakresem.

## Stop conditions

Zatrzymaj pracę i zwróć `BLOCKED`, jeżeli:

- nie można ustalić bazowego stanu repo bez destrukcyjnej operacji;
- dwa aktywne dokumenty wymagają sprzecznych decyzji Foundera;
- potrzebna jest zmiana UI/backendu;
- wymagany jest push, PR, release, deployment albo destrukcyjna operacja Git bez uprzedniej zgody Foundera;
- brakuje ratyfikacji D1–D8;
- wdrożenie wymaga zgadywania, który dokument jest nadrzędny.

## Oczekiwany format odpowiedzi Codex

1. Repo baseline i dirty-state warning.
2. Mapa dokumentów.
3. Sprzeczności P0/P1/P2.
4. Proposed SSOT hierarchy.
5. Proposed RACI.
6. Lista planowanych zmian z allowlistą.
7. Diff albo patch proposal.
8. Wynik testu PASS.
9. Wynik kontrolowanej mutacji FAIL.
10. Unresolved human decisions.
11. Final verdict: `GO-S1`, `FIX` albo `NO-GO`.
12. Potwierdzenie: stage/commit/amend wykonano wyłącznie w aktywnym WO; no push/PR/release/deployment/destructive Git bez uprzedniej zgody Foundera.

---

## Prompt dla GPT 5.6 SOL — oddzielnego read-only technical S0 reviewera

```text
Jako GPT 5.6 SOL przejrzyj WO-P360-S0 i jego evidence read-only. Nie poprawiaj plików. Sprawdź, czy istnieje dokładnie jeden current wedge: kompetentny dorosły pacjent + jedna nazwana dorosła osoba wspierająca + jedna planowana wizyta; synthetic-only; no doctor/AI/CDSS/backend current phase. Wymień wszystkie aktywne dokumenty, które temu przeczą, wszystkie anonimowe human-owned gates i wszystkie miejsca, gdzie ignored/reference docs nadal sterują backlogiem. Zweryfikuj test pozytywny i kontrolowaną mutację negatywną. Zwróć findings P0-P2, luki dowodowe oraz jeden techniczny werdykt: GO-S1, FIX albo NO-GO. Ten akt review nie jest podpisem G0 ani model attestation; G0 wymaga późniejszego, odrębnego aktu Foundera Sebastiana Kalisza.
```

## Prompt dla Founder OS

```text
Zarejestruj WO-P360-S0 jako ACTIVE, a G0 jako PENDING. Nie wykonuj product-repo writes i nie awansuj lifecycle. Zbierz: decyzje D1-D8, bazowy SHA, mapę ACTIVE/SUPERSEDED/REFERENCE_ONLY, RACI, evidence validatora i wynik niezależnego review. Wskaż wymagane podpisy Foundera, ownerów, freshness dowodów, blokery oraz następny dozwolony krok. Zwróć founder brief z decyzją do podpisu: GO-S1, FIX albo NO-GO. Founder OS nie może sam podpisać G0.
```
