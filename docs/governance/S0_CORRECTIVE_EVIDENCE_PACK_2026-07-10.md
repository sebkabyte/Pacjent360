# Pacjent360 S0 Corrective Evidence Pack

<!-- P360_PHASE_NOTE
Wzmianki o dzieciach i opiekunach prawnych w tym dokumencie opisuja role ZABLOKOWANE
w current phase. Current scope: kompetentny doroslty pacjent + jedna nazwana dorosla
osoba wspierajaca + jedna planowana wizyta; lekarz = pozniejszy odbiorca read-only.
Zrodlo prawdy: docs/governance/CURRENT_SCOPE_MANIFEST.json.
-->

Status: **TECHNICAL PASS; READY FOR GPT 5.6 SOL READ-ONLY REVIEW; G0_PENDING**
Corrective authorization: Sebastian Kalisz, Founder, 2026-07-10
Implementer: Codex under Governance V2 standing mandate
Independent S0 Reviewer: GPT 5.6 SOL
Reviewer mode: separate read-only technical review on the final commit SHA
Founder gate owner: Sebastian Kalisz; the reviewer cannot sign G0
Contract: `FCV1-D1-D8-2026-07-10`
Attestation: `P360-ATT-D1-D8-20260710-001`

## 1. Purpose and role separation

Ten pakiet opisuje techniczną korektę S0. Nie jest werdyktem reviewera, podpisem G0 ani zgodą na S1.

Role są rozdzielone:

- Codex wykonuje korektę i przygotowuje dowody;
- `GPT 5.6 SOL` wykonuje później osobny review read-only, przypięty do finalnego SHA;
- Sebastian Kalisz nie jest reviewerem i jako Founder podejmuje dopiero późniejszą, odrębną decyzję G0.

SHA finalnego commita nie może być zapisany wewnątrz pliku należącego do tego samego commita bez zmiany tego SHA. Dlatego finalny SHA przypina osobny akt review.

## 2. Product and S0 boundary

Korekta nie zmienia D1-D8 ani produktu:

- current wedge: competent adult patient + one named adult supporter + one planned visit;
- dane: synthetic-only;
- lekarz: późniejszy odbiorca read-only, nie current user;
- children/guardian, AI/LLM/OCR/CDSS, backend, real data i public launch: blocked;
- aktywny jest jeden work order S0;
- nie zmieniono `public/`, runtime, schema, fixtures, API, build ani release artifacts.

## 3. Corrective baseline and allowlist

| Evidence | Value |
|---|---|
| Base commit | `1a2e4b6a9bef10259b874bf4c3672fcdfb84f8a4` |
| Base tree | `1d5094a48599b56ee095ac96b287c1bd05c53bce` |
| Raw baseline status SHA-256 | `081595C783029E35588B6B8BB3F252A8D3BC64CAE004A4D5AEC648DD3F9BF18F` |
| Baseline status entries | 106 |
| Tracked clean paths reconstructed from base | 15 |
| Authorized commit paths | 43 |
| Forbidden areas | `public/`, `schema/`, `fixtures/`, `api/`, `dist/`, `build/` |

Źródła: `S0_REPAIR_BASELINE_2026-07-10.json`, `S0_REPAIR_ALLOWLIST_2026-07-10.json` i `S0_REPAIR_CHANGESET_2026-07-10.json`.

Finalny changeset jest generowany z indeksu względem base commit, a nie z całego dirty worktree. Dzięki temu 85 wcześniejszych zmian użytkownika pozostaje poza kandydatem. Po commicie validator sam wylicza `HEAD^..HEAD` i wymaga dokładnej zgodności rzeczywistego diffu z allowlistą i changesetem.

## 4. Remediation of independent-review findings

| Finding | Remediation / control |
|---|---|
| Founder był jednocześnie reviewerem | Sebastian pozostaje wyłącznie Founderem; `GPT 5.6 SOL` jest osobnym reviewerem technicznym; Codex implementerem |
| Stare `docs/SSOT.md` i `docs/SPRINTS.md` sterowały aktywnymi bramkami | oba pliki mają widoczny status `SUPERSEDED`; aktywne security/safety/risk docs wskazują Product SSOT, Founder Control Pack i Safety Gate Matrix |
| Katalogowy default przepuszczał drugi aktywny WO | manifest ma exact inventory wszystkich 76 tracked documentation paths; tracked/staged path spoza inventory jest błędem |
| `committed HEAD mode` czytał dirty/staged stan | formalny tryb wymaga clean checkout i sprawdza wszystkie tracked documentation paths oraz każdy discovered path względem `HEAD` |
| Supporting evidence było sprawdzane tylko po ścieżce | wymagane supporting docs mają obowiązkowe markery treści; placeholder Founder Attestation jest odrzucany |
| Validator ufał deklarowanemu changesetowi | validator porównuje realny `HEAD^..HEAD` z allowlistą, forbidden areas i pełnym path set changesetu |
| AI/OCR drift można było sparafrazować | test odrzuca także frazę „W obecnym MVP OCR odczytuje dokumenty, a lekarz korzysta z panelu do oceny wizyty” |
| Governance V2 przeczyło aktywnemu DoR/DoD | WO, Execution Plan, Product Constitution, Founder Control Pack i DoR/DoD mają jedną regułę: edit/stage/commit/amend dozwolone; push/PR/release/deployment/destructive Git Founder-only |
| Ignorowane `docs/product-delivery/` nie miało izolacji | README zawiera wymagany marker; manifest rejestruje ignored control plane; aktywne executable controls nie mogą go wywoływać |
| Validator ufał deklaracjom tego pakietu | `validateEvidencePackTruthfulness` porównuje deklarowane liczby (`Authorized commit paths`, `PASS n/n allowlisted paths`, `closed-world candidates`) z rzeczywistą allowlistą, changesetem i policzonym closed-world; sam uruchamia `git diff --check HEAD^ HEAD`; odrzuca prozatorskie „nie zmieniono `public/`", jeżeli `public/` przestało być egzekwowanym forbidden prefixem |

## 5. Validator design

Formalny tryb bez `--allow-untracked`:

1. wymaga repo z `HEAD` i parentem;
2. wymaga clean checkout;
3. porównuje pełny tracked documentation inventory z `HEAD` i indeksem;
4. odrzuca discovered path nieobecny w `HEAD`;
5. sprawdza wymagane markery aktywnych/supporting artefaktów;
6. porównuje realny diff finalnego commita z allowlistą, changesetem i forbidden areas.

Tryb `--allow-untracked` służy wyłącznie do pracy nad korektą w istniejącym dirty checkout. Nie jest formalnym dowodem G0.

## 6. Validation evidence

Walidację wykonano na odłączonym commicie kandydata zbudowanym wyłącznie z indeksu. Worktree był czysty przed i po kontrolach.

| Check | Result |
|---|---|
| Formalny `node tools/validate-current-scope.mjs` | PASS: 15 active scope contracts, 11 supporting documents, 7 executable controls, 76/76 closed-world candidates, 76 tracked documentation paths, committed HEAD mode |
| Scope validator tests | PASS 30/30 |
| Legacy regression | PASS 76/76 |
| Task-driven / normal-name / No-CDSS guards | PASS 3/3 |
| Definition of Harm + Safety Gate Matrix | PASS 2/2 |
| Final path set | PASS 43/43 allowlisted paths; 0 outside; 0 missing; 0 forbidden |
| `git diff --check HEAD^ HEAD` | PASS |
| Clean checkout | PASS before and after validation |
| Staged-only path probe | FAIL/non-zero as required |
| Forbidden `public/index.html` diff probe | FAIL/non-zero as required |
| Placeholder Founder Attestation probe | FAIL/non-zero as required |
| Alternate active WO under `docs/product/` probe | FAIL/non-zero as required |
| AI/OCR + doctor-panel paraphrase probe | FAIL/non-zero as required |
| Stale `Authorized commit paths` probe | FAIL/non-zero as required |
| Stale `PASS n/n allowlisted paths` probe | FAIL/non-zero as required |
| Lifted `public/` forbidden-area claim probe | FAIL/non-zero as required |

Zielone testy są dowodem technicznym. Nie są ratyfikacją, werdyktem niezależnego reviewera ani podpisem G0.

`validate-go-live.ps1` nie jest uruchamiany, ponieważ generuje `dist`, ZIP, release manifest i upload-ready artifacts. Push, PR, release i deployment pozostają poza zakresem.

## 7. Required next act

Po technicznym zamknięciu kandydat trafia do `GPT 5.6 SOL` na osobny review read-only. Reviewer przypina dokładny SHA i wydaje jeden techniczny werdykt. Dopiero później Sebastian Kalisz może wykonać osobny akt Foundera dotyczący G0.
