# Pacjent360 - wykonawczy plan sprintow i work orderow

Status: **RATIFIED EXECUTION SYSTEM - ACTIVE ONLY S0; S1-P7 CONDITIONAL**
Wersja: 1.0, 2026-07-10
Zakres: Pacjent/Opiekun-first, dane syntetyczne do formalnego Real-Data Gate
Dokument nadrzedny: `docs/product/ROADMAP_2026_2027.md`

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

Ten plan zamienia ratyfikowaną roadmapę w zadania wykonawcze. Nie zastępuje `PRODUCT_SSOT.md`, `FIRST_WEDGE.md` ani `DECISION_LOG.md`. Founder aktywował wyłącznie Sprint 0 do G0; S1-P7 pozostają warunkowe. Stare plany doctor-first, parent-first, AI-first i backend-first są materiałem historycznym do jawnego oznaczenia jako `superseded` albo `reference-only`, a nie równoległym backlogiem. `docs/product-delivery/` jest ignorowane przez `.gitignore` i ma status `REFERENCE_ONLY`; niniejszy plan znajduje się w śledzalnym `docs/product/`.

## Zasady wykonania

Każdy work order zaczyna się od:

```text
// P360_MODE: PATIENT_CAREGIVER_FIRST
// P360_CORE: HISTORY_IS_CORE
// P360_ACTION: VISIT_PREP_FROM_HISTORY
// P360_DATA: SYNTHETIC_ONLY_UNTIL_HUMAN_REAL_DATA_GATE
// P360_SCOPE: NO_DOCTOR_NO_AI_NO_CDSS_CURRENT_PHASE
// P360_REGULATED_FEATURES: HARD_DISABLED
// P360_CHANGE_CONTROL: RFC_REQUIRED_FOR_ODSKOK
// P360_GIT: AUTONOMOUS_STAGE_COMMIT_AMEND__FOUNDER_ONLY_PUSH_PR_RELEASE_DEPLOYMENT_DESTRUCTIVE_GIT
```

Obowiazuje lancuch:

```text
Founder/Founder OS intake
-> Planner
-> Scope Guard
-> Implementer
-> Verifier
-> Evaluator
-> Decision Scribe
```

Zasady niepodlegajace negocjacji:

1. Codex nie rozszerza zakresu przy okazji.
2. Founder OS rejestruje stan, dowody i decyzje, ale nie zatwierdza sam human-owned gates.
3. Zielony test nie zastępuje opinii prawnej, DPIA, medical-safety sign-off ani niezaleznego pentestu.
4. `?tech=1`, ukrycie CSS i role switch w przegladarce nie sa kontrola dostepu.
5. Brak jawnej daty pozostaje `unknown`; system nie tworzy dzisiejszej daty.
6. Normalny artefakt nie moze fizycznie zawierac aktywnych funkcji regulowanych.
7. Governance V2 pozwala Codexowi autonomicznie wykonywac edit/stage/commit/amend w aktywnym work orderze. Push, PR, release, deployment i destrukcyjne operacje Git wymagaja uprzedniej zgody Foundera.
8. Kazdy work order wskazuje bazowy commit/tree SHA, dokladna allowliste plikow i zakaz zmian poza nia.
9. Obecny dirty checkout jest zamrozony: bez `stash`, `clean`, `reset`, przelaczania galezi, globalnego formatera i buildow generujacych artefakty.
10. Po zatwierdzonym backupie dalsza implementacja powinna odbywac sie w osobnym czystym worktree; nigdy `git add -A`.

## 1. Plan sprintow od 10.07.2026

### Stan startowy

Repo ma dobra baze guardow i testow dla zrodlowego demo, ale nie jest gotowe do release ani realnych danych. Najwazniejsze P0 na starcie:

- D1-D8 i current wedge zostaly ratyfikowane 10.07.2026; G0 pozostaje osobna, niepodpisana bramka;
- repo wymaga closed-world kontroli, aby README, stare ADR-y, prywatne prompty i ignorowany control plane nie mogly przeczyc ratyfikacji ani sterowac wykonaniem;
- `regulatedFeaturesEnabled=false` istnieje jako deklaracja, ale sciezka flag musi byc zablokowana rowniez zachowaniem runtime;
- `public` i `dist/public` sa rozjechane, a techniczne moduly nadal trafiaja do paczki;
- aktualna domena publiczna nie ma parity ze zrodlem/artefaktem i pozostaje `HOLD` dla publicznego showcase;
- public-repo packaging kopiuje ignorowane materialy prawne/counsel; obecnego ZIP-a nie wolno publikowac;
- normalny flow supportera ma potwierdzone problemy przy 320 px;
- normalny stan zdrowotny jest utrwalany lokalnie, a demo posiada rownolegle modele/store/pakiety;
- nie ma backendu, produkcyjnej tozsamosci, vault isolation, server-side policy, trwalego audytu, retencji ani deletion orchestration.

### Harmonogram bazowy

| Sprint | Daty | Wynik | Bramka |
|---|---:|---|---|
| S0 | 10-24.07.2026 | Jeden zakres, SSOT i wlasciciele | G0 Scope |
| S1 | 27.07-07.08.2026 | Product boundary oraz Safe Alpha Candidate | G1 Alpha Safety |
| S2 | 10-21.08.2026 | Spokojny pulpit Pacjent/Opiekun-first | lokalny UX gate |
| S3 | 24.08-04.09.2026 | Zrodlowa os czasu i dokument metadata-only | data/provenance gate |
| S4 | 07-18.09.2026 | Adult supporter access prototype | synthetic access gate |
| S5 | 21.09-02.10.2026 | Security/audit baseline dla Alphy | synthetic safety gate |
| S6 | 05-09.10.2026 | Zamrozone prywatne demo i Evidence Gate | G2 Evidence |
| P7 | 12.10.2026-22.12.2027 | Readiness, secure foundation, assurance i closed pilot | G3-G9 human-owned |

S2-S5 zawieraja kolejne fale moderowanych testow, aby S6 byl synteza dowodow, a nie proba zebrania 15 sesji w ostatnim tygodniu. P7 nie jest jednym sprintem. To program 1-2-tygodniowych work orderow. Realne dane moga wejsc najwczesniej 15.09.2027 i tylko po wszystkich bramkach.

### Wlasciciele

| Rola | Odpowiedzialnosc |
|---|---|
| Founder | scope, budzet, akceptacja ryzyka i human-owned gates |
| Delivery Lead | sprint, zaleznosci, blokery, evidence pack |
| Product/UX | problem uzytkownika, flow, research, metryki wartosci |
| Tech Lead | kontrakty, architektura, implementacja i migracje |
| QA Lead | macierz testow, negatywne mutacje, dowod wykonania |
| Security Lead | threat model, access, audit, lifecycle i assurance |
| Privacy/Legal | role GDPR, podstawa, DPIA, delegacja, claims i regulatory mema |
| Medical Safety | hazard controls, source fidelity i safety misread thresholds |
| Release Manager | source/build/runtime parity i podpisany artefakt |

W Sprincie 0 kazda rola musi dostac konkretne nazwisko albo status `VACANT-BLOCKING`.

## 2. Sprint 0 - stabilizacja governance

**Daty:** 10-24.07.2026
**Cel:** zamrozic jeden produkt i jedna hierarchie prawdy.
**Wartosc/ryzyko:** usuwa ryzyko, ze Codex poprawnie zrealizuje niewlasciwy, starszy produkt.

### Zakres

- adult competent patient + one named adult supporter;
- jedna planowana wizyta jako pierwszy wedge;
- B2C jako ratyfikowana hipoteza uzytkowa 2026; B2B2C jako rownolegle commercial discovery, nie alternatywny current wedge;
- lekarz, dzieci, opiekun prawny, AI, backend i integracje poza current phase;
- mapa aktywnych, superseded i reference-only dokumentow;
- RACI, Definition of Ready/Done, Risk Register i Decision Log.

### Pliki/dokumenty do zmiany

- `PRODUCT_SSOT.md`
- `docs/PROGRAM_PLAN.md` i skrotowy `docs/ROADMAP.md`
- `docs/product/FIRST_WEDGE.md`
- `docs/product/PRODUCT_CONSTITUTION.md`
- `docs/product/ROADMAP_2026_2027.md`
- `docs/governance/DECISION_LOG.md`
- `docs/governance/SCOPE_GUARDRAILS.md`
- `docs/qa/DEFINITION_OF_READY_DONE.md`
- nowy `docs/governance/OWNER_RACI_MATRIX.md`
- nowy ADR ratyfikujacy hierarchie i zakres
- closed-world manifest klasyfikujacy rowniez `README.md`, stare ADR-y, prywatne prompty, `BLUEPRINT/` i `docs/product-delivery/`
- nowy `tools/validate-current-scope.mjs`

### Zadania

1. Ratyfikacja D1-D8 z 10.07 pozostaje decyzja wejsciowa i nie jest ponownie otwierana bez RFC Level C.
2. Repo Guardian utrzymuje closed-world klasyfikacje `ACTIVE / ACTIVE_SUPPORTING / SUPERSEDED / REFERENCE_ONLY`.
3. `docs/product-delivery/`, `BLUEPRINT/` i prywatne prompty pozostaja archiwum referencyjnym i sa fizycznie odlaczone od aktywnych gate'ow.
4. Decision Scribe zapisuje date ze strefa, identyfikator Foundera, attestation ID, hashe ratyfikowanych artefaktow i konsekwencje decyzji.
5. Scope validator sprawdza kompletna minimalna liste aktywnych dokumentow, body drift, executable control surfaces i kod wyjscia CLI dla mutacji.
6. PM przypisuje nazwiska rolom albo oznacza wakat jako blocker; rola nie jest `NAMED` bez konkretnej osoby lub jednoznacznego identyfikatora.
7. Nie wykonuje sie zmian UI ani architektury produkcyjnej.

### Testy

- scope validator ma przejsc na docelowym zestawie;
- kontrolowana mutacja doctor-first ma zwrocic non-zero;
- kazdy aktywny plan wskazuje ten sam wedge;
- git diff jest ograniczony do governance/docs/toolingu scope.

### Ryzyka

- oznaczenie dokumentu `superseded` bez decyzji Foundera;
- skasowanie historii zamiast zachowania jej jako reference-only;
- rozpoczecie kodowania przed G0.

### Kryteria odbioru

- podpisany Scope Freeze i SSOT precedence record;
- RACI bez anonimowych human gates;
- stare plany nie sa aktywnym backlogiem;
- kanoniczny plan znajduje sie w sledzalnym katalogu i wskazuje bazowy SHA;
- scope validator ma test pozytywny i negatywny;
- wynik Evaluatora: `GO-S1`, `FIX` albo `NO-GO`.

### Work order Codex

```text
WO-P360-S0. Pracuj docs/governance/tooling only. D1-D8 i current wedge sa ratyfikowane. Zamknij repo-wide klasyfikacje, odlacz ignored control plane, pokaz pathwise diff, test pozytywny oraz end-to-end CLI negative z non-zero. Nie zmieniaj UI. G0 pozostaje human-owned.
```

### Review prompt

```text
Jako GPT 5.6 SOL, oddzielny read-only technical S0 reviewer, zweryfikuj S0 bez poprawiania findings. Wymien sprzeczne aktywne dokumenty, anonimowe role i kazde miejsce, gdzie lekarz/dziecko/AI pozostaje current scope. Zwroc findings P0-P2 oraz techniczny werdykt GO-S1/FIX/NO-GO. Sebastian Kalisz pozostaje Founderem i nie jest reviewerem; Codex jest implementerem. Review i pozniejszy akt Foundera G0 sa odrebne, a GPT 5.6 SOL nie moze podpisac G0.
```

## 3. Sprint 1 - product boundary i jezyk UI

**Daty:** 27.07-07.08.2026
**Cel:** stworzyc fizycznie ograniczony Safe Alpha Candidate na danych fikcyjnych.
**Wartosc/ryzyko:** zmniejsza ryzyko CDSS-like copy, ukrytego uruchomienia funkcji regulowanych i wyslania niewlasciwej paczki.

### Zakres

- twardy runtime deny dla wszystkich regulated features;
- fizyczne odseparowanie normalnego artefaktu od tech/doctor/clinical modules;
- jeden kanoniczny slownik: `Moja historia`, `Pomagam komus`, `Przygotuj wizyte`, `Pakiet wizyty`, `Kto moze pomagac?`;
- skan wszystkich indeksowanych stron i skryptow, nie zamknietej listy recznej;
- `unknown` zamiast tworzenia daty;
- naprawa sitemap, PWA/service worker i source/build/runtime parity;
- fixture-only gate i pelny reset storage/cache.

### Pliki/dokumenty do zmiany

- `public/patient360-flags.js`
- `public/demo.html`, `public/app.js`, `public/index.html`, `public/agents.html`
- `public/sitemap.xml`, `public/sw.js`
- `tools/check-no-cdss-copy.mjs`
- `tools/check-task-driven-ui-boundaries.mjs`
- `tools/check-normal-ui-no-tech-names.mjs`
- `tools/prepare-public.ps1`, `tools/verify-public.ps1`
- `tools/prepare-public-repo.ps1`, `tools/public-repo-manifest.txt`
- `tools/smoke-browser.js`, `tools/validate-pre-show.ps1`
- `.github/workflows/validate.yml` i `CODEOWNERS`
- `docs/governance/NO_CDSS_LANGUAGE_RULES.md`
- `docs/governance/DELIVERY_CONTRACT_TASK_DRIVEN_UI.md`
- `docs/legal/CLAIMS_REGISTER.md`

### Zadania

1. Sprawic, aby `REGULATED_FEATURES_ENABLED=false` bylo sprawdzane przez runtime API flag, nie tylko guard tekstowy.
2. Dodac negatywny test, ktory probuje wlaczyc funkcje organizacyjnego AI/doctor module i oczekuje deny.
3. Usunac tech/doctor/clinical modules z normalnego manifestu/paczki; `?tech=1` pozostaje laboratorium lokalnym, nie security boundary.
4. Skanowac kazda strone z sitemap i kazdy zaladowany przez nia skrypt.
5. Ujednolicic nazwy i neutralne copy; `Pakiet wizyty` jest snapshotem, nie summary klinicznym.
6. Naprawic date unknown, reset `localStorage + sessionStorage + IndexedDB + CacheStorage` i PWA N->N+1.
7. Zastapic kopiowanie calego `docs/legal/` zamknieta allowlista; public-repo verifier ma failowac na materialach counsel/internal.
8. Porownac live runtime z zatwierdzonym manifestem i utrzymac `HOLD`, dopoki wszystkie hashe/HTTP sa zgodne.
9. Wygenerowanie `dist` jest osobnym, jawnym krokiem Release Managera po zgodzie Foundera i tylko z czystego source snapshotu.

### Testy

- trzy istniejace guardy governance;
- hard-disable behavior test flagi;
- forbidden public module manifest test;
- no-fabricated-date test;
- sitemap/indexed-surface claims scan;
- browser smoke na czystym profilu;
- PWA N->N+1 i full reset;
- public-repo leak test dla materialow counsel/internal;
- live runtime full-manifest parity z cache-busterem;
- po jawnej zgodzie na candidate: SHA-256 parity `public -> dist/public -> runtime`.

### Ryzyka

- test sprawdza tylko string `false`, a nie zachowanie;
- tech code pozostaje w bundle mimo niewidocznej nawigacji;
- przebudowanie `dist` nadpisuje cudze artefakty w dirty worktree;
- public-repo ZIP ujawnia materialy kancelarii lub pomija nadrzedny SSOT;
- legalny cytat zrodla zostaje blednie potraktowany jako claim systemu.

### Kryteria odbioru

- zero otwartych P0 boundary/copy/runtime;
- normalny bundle nie zawiera aktywnych funkcji regulowanych;
- hard-disable nie moze zostac ominiety wariantem A/B ani stanem persisted;
- wszystkie indeksowane powierzchnie przechodza scan;
- missing date pozostaje unknown;
- public-repo artifact nie zawiera counsel/internal docs i ma jawny canonical manifest;
- release manifest zapisuje commit SHA, tree hash, `dirty=false`, hash allowlisty i hash narzedzia budujacego;
- source build jest zielony; candidate parity ma osobny dowod, jesli Founder zlecil build.

### Work order Codex

```text
WO-P360-S1. Napraw tylko P0 product boundary i language. Udowodnij zachowanie REGULATED_FEATURES_ENABLED=false, fizycznie wyklucz tech/doctor modules z normalnego artefaktu, rozszerz scan na indexed surfaces, zachowaj unknown dates i zamknij public-repo leak. Nie redesignuj flow. Nie generuj dist bez osobnej zgody i czystego source snapshotu.
```

### Review prompt

```text
Red-team S1. Sprobuj obejsc flagi wariantem, persisted state, URL i bezposrednim importem. Porownaj normalny manifest z bundle. Przeskanuj indexed copy. Zwroc P0-P2 i GO-S2/FIX/NO-GO; samo ukrycie CSS oznacza FAIL.
```

## 4. Sprint 2 - dashboard pacjenta/opiekuna

**Daty:** 10-21.08.2026
**Cel:** spokojny, task-driven `Dzisiaj` i pierwszorzedny flow doroslego supportera.
**Wartosc/ryzyko:** uzytkownik widzi nastepna czynność, a nie magazyn danych; maleje przeciazenie i pomylka osoby.

### Zakres

- maksymalnie trzy glowne akcje: `Moja historia`, `Przygotuj wizyte`, `Pomagam komus`;
- maksymalnie trzy neutralne karty organizacyjne z allowlisty;
- jawna aktywna osoba i rola;
- neutralny brak dostepu, bez ujawnienia ukrytej kategorii;
- adult patient/supporter fixtures tylko dla normalnego UI;
- mobile 320/360/390/768 i 400% reflow;
- pierwsza fala moderowanych sesji na fikcyjnym case.

### Pliki/dokumenty do zmiany

- `public/app.js`, `public/demo.html`, `public/styles.css`
- `public/patient360-caregiver-model.js`
- `public/patient360-a4-consent-guard.js`
- adult-only fixture/demo data
- `tools/smoke-browser.js`, `tools/verify-click-routes.js`, `tools/verify-reactivity.js`
- `docs/ux/MOBILE_FIRST_RULES.md`, `docs/ux/CARE_GIVER_UX_RULES.md`
- `docs/product/USER_FLOWS_PATIENT_CAREGIVER.md`
- `docs/research/EVIDENCE_LEDGER.md` lub zatwierdzony odpowiednik

### Zadania

1. Usunac z normalnego home doctor/AI/technical choices i nadmiar nawigacji.
2. Karty tworzyc tylko z jawnego stanu organizacyjnego: wizyta, brak oznaczony przez uzytkownika, wpis supportera, dokument metadata, pytania.
3. Karta nie moze powstac z severity, result range, specialty score ani clinical priority.
4. Wskazac aktywna osobe przed kazdym zapisem.
5. Oznaczac wpis supportera jako `od opiekuna` i `do omowienia`/`do potwierdzenia`.
6. Przeprowadzic pierwsze 3-5 moderowanych sesji; bez realnych danych.

### Testy

- normal UI no-tech/no-doctor;
- max 3 primary actions i allowlista kart;
- wrong-person i no-active-person fail-closed;
- no-access zero-knowledge copy;
- 320/360/390/768, 400% reflow, keyboard focus;
- kazda karta ma autora/source/status/date-or-unknown;
- manual safety question: czy aplikacja powiedziala, co medycznie zrobic?

### Ryzyka

- task card staje sie ukryta rekomendacja;
- caregiver role switch jest mylony z uwierzytelnieniem;
- `Dzisiaj` tworzy medyczna priorytetyzacje;
- pozytywny feedback rodzinny zostaje uznany za evidence produktu.

### Kryteria odbioru

- home jest rozumiany bez instrukcji;
- zero pomylki osoby/roli/zakresu;
- zero safety misread;
- brak tabel, stalego sidebara i stalego panelu zrodel na mobile;
- obserwacje sesji sa zapisane bez PII/PHI.

### Work order Codex

```text
WO-P360-S2. Zbuduj task-driven Dzisiaj i adult patient/supporter flow na fixtures. Uzyj tylko allowlisted action cards. Jedna osoba, jedno zadanie, jedno glowne CTA. Nie dodawaj doctor view, AI, result labels ani nowych typow kart. Dodaj mobile i wrong-person tests.
```

### Review prompt

```text
Zweryfikuj S2 jako zestresowany pacjent, supporter i privacy reviewer. Szukaj ukrytej priorytetyzacji, pomylki osoby, leakage przez empty state i przeciazenia 320 px. Zwroc evidence oraz GO-S3/FIX/NO-GO.
```

## 5. Sprint 3 - os czasu i dokumenty

**Daty:** 24.08-04.09.2026
**Cel:** jeden zrodlowy model historii oraz recznie skladany pakiet wizyty.
**Wartosc/ryzyko:** eliminuje dwa store, dwa pakiety, falszywe daty i niesprawdzalne podsumowania.

### Zakres

- `SourceRecord` + typed records + read-only `HistoryItem` projection;
- `occurredOn=null` i jawny `dateStatus`;
- dokument jako metadata-only w Alphie; bez binarnego uploadu, OCR i parsera;
- `VisitDraft` z recznym wyborem oraz maksymalnie trzema pytaniami;
- immutable `VisitPacket v3`, bez rankingu, summary90s i wnioskow;
- jeden repository port z `FixtureStore`; obecny IndexedDB lab nie jest produkcyjnym store;
- localStorage tylko dla jezyka/preferencji/scenario ID.

### Pliki/dokumenty do zmiany

- `public/patient360-contract.js`
- `schema/patient360.schema.json`
- `public/patient360-visitpacket.js`
- normalny model historii i repository port
- fixture store i edge-case fixtures
- `public/app.js`
- `api/openapi.yaml` jako jawny contract-only draft
- `tools/validate-data-contract.js`, `tools/validate-visit-packet.js`

### Zadania

1. Zamrozic kontrakt przed przepinaniem UI.
2. Dodac fixtures pozytywne i negatywne, walidator oraz migracje v2->v3.
3. Uzyc `HistoryItem` tylko jako projection, nie drugi write model.
4. Zachowac pelne pola leku bez reconciliation i porad.
5. Generowac pakiet tylko z jawnie wybranych ID; brak cichego sortowania, truncation i completeness score.
6. Ujednolicic UI, print i syntetyczny eksport na tym samym zbiorze ID.
7. Przeprowadzic kolejna fale 3-4 sesji na zamrozonym case.

### Testy

- schema `additionalProperties=false` tam, gdzie bezpieczne;
- unknown-date property tests;
- 100% author/source/status/date-or-unknown;
- manual selection exactness;
- UI/print/export ID parity;
- no silent truncation/sorting;
- migration v2->v3 i rollback fixture;
- XSS/content injection przez tytul, notatke i source label.

### Ryzyka

- refaktor kontraktu wyprzedzi evidence;
- nazwa `kompletnosc` stanie sie ocena medyczna;
- metadata-only dokument zostanie przedstawiony jako przeanalizowany;
- zmiana v2 w miejscu zniszczy reprodukowalnosc.

### Kryteria odbioru

- jeden canonical write model i jeden FixtureStore dla normalnego UI;
- VisitPacket jest wersjonowanym snapshotem dokladnie wybranych wpisow;
- 100% provenance coverage;
- brak health-like free text w persisted localStorage;
- wszystkie kontraktowe, migracyjne i parity tests przechodza.

### Work order Codex

```text
WO-P360-S3. Contract-first: SourceRecord, typed records, HistoryItem projection, VisitDraft i immutable VisitPacket v3. Najpierw fixtures/testy, potem adapter UI. Metadata-only, unknown dates, manual selection. Bez uploadu, OCR, AI, scoringu i klinicznego sortowania.
```

### Review prompt

```text
Zweryfikuj S3 jako data architect i medical-safety reviewer. Porownaj ID w store, timeline, packet, print i export. Szukaj falszywych dat, utraty pol leku, drugiego write modelu, truncation i ukrytego rankingu. Zwroc GO-S4/FIX/NO-GO.
```

## 6. Sprint 4 - zgody i delegowanie dostepu

**Daty:** 07-18.09.2026
**Cel:** zbudowac syntetyczny prototyp technicznego dostepu doroslego supportera bez udawania pelnomocnictwa lub zgody RODO.
**Wartosc/ryzyko:** ogranicza najgrozniejsze ryzyko produktu - ujawnienie danych niewlasciwej osobie.

### Zakres

- `DemoAccessGrant` w Alphie, a docelowo `DelegationGrant`;
- grantor, grantee, patient/profile, purpose, actions, resource filters, issued/expiry/revoke/version;
- actor binding i zakaz re-delegacji;
- ten sam policy result dla UI, packet, print/export i przyszlego API;
- revoke/expiry fail-closed;
- tylko kompetentny dorosly pacjent i jeden nazwany dorosly supporter;
- dzieci, opiekun prawny, utrata zdolnosci i spory rodzinne poza zakresem.

### Pliki/dokumenty do zmiany

- `public/patient360-consent-model.js`
- `public/patient360-caregiver-model.js`
- `public/patient360-a4-consent-guard.js`
- `schema/patient360.schema.json`
- fixtures i testy access/revoke/expiry
- nowy `docs/governance/CONSENT_DELEGATION_MODEL.md`
- nowy `docs/governance/ACCESS_POLICY_MATRIX.md`
- `docs/legal/PRIVACY.md` jako draft copy, bez claimu opinii prawnej

### Zadania

1. Oddzielic: legal basis, authority, technical grant i ewentualna zgode/transparency.
2. Wymagac konkretnego `granteeUserId`; sama rola nie nadaje dostepu.
3. Zablokowac sumowanie zakresow bez jawnego aktora.
4. Revoke ma odciac aktywny widok i invalidowac stale selection przed packet/export.
5. Empty state nie ujawnia, ze istnieje ukryta kategoria.
6. Copy uzytkowe: `dostep`, nie `pelny dostep`, `zgoda RODO` ani `upowaznienie medyczne`.
7. Przeprowadzic 3-4 sesje z supporterami na danych fikcyjnych.

### Testy

- two accounts, same role, no shared grant;
- wrong patient/profile/vault deny;
- missing actor deny;
- expiry boundary i revoke race;
- stale packet selection after revoke;
- UI/packet/export policy parity;
- zero-knowledge deny copy;
- audit event dla grant/revoke.

### Ryzyka

- frontend filter zostaje uznany za produkcyjna kontrole;
- checkbox zgody staje sie substytutem authority;
- eksport zawiera wiecej niz UI;
- revoke obiecuje cofniecie juz pobranej kopii.

### Kryteria odbioru

- wszystkie negative access tests fail-closed;
- grant jest actor-bound, scoped, expiring i revocable;
- revoke odcina aktywna sesje syntetyczna i wszystkie projekcje;
- UI nie sklada obietnic prawnych;
- formalny model produkcyjny pozostaje `requires legal opinion`.

### Work order Codex

```text
WO-P360-S4. Zawaz model do adult patient + named adult supporter. Wymus jawnego aktora i grantee, fail-closed expiry/revoke oraz parity UI/packet/export. W Alphie nazywaj to DemoAccessGrant. Nie implementuj dzieci, guardian authority ani produkcyjnego auth.
```

### Review prompt

```text
Red-team S4. Testuj dwa konta tej samej roli, zly profil, brak aktora, revoke podczas aktywnego widoku, stale packet i leakage w empty state/export. Zwroc P0-P2 i GO-S5/FIX/NO-GO. Frontend-only enforcement oznacza PARTIAL, nie production PASS.
```

## 7. Sprint 5 - security i audit baseline

**Daty:** 21.09-02.10.2026
**Cel:** udokumentowac i przetestowac bezpieczna granice Alphy oraz kontrakt przyszlej produkcji.
**Wartosc/ryzyko:** zapobiega myleniu lokalnego event logu, resetu demo i braku AI endpointu z produkcyjnym bezpieczenstwem.

### Zakres

- Data Map, Asset Inventory, DFD i Trust Boundaries;
- Security Baseline dla Alpha vs przed PHI;
- audit schema/policy z allowlista pol;
- osobny technical log bez payloadow zdrowotnych;
- AI Agent Policy: runtime AI/OCR/RAG/embeddings/tools/egress absent;
- prompt-injection corpus jako defensive fixture; dokumenty sa danymi, nie instrukcjami;
- demo reset/export/delete semantics;
- incident playbook dla wrong-person, leakage i stale runtime;
- jedna read-only CI lane i osobna stateful release lane.

### Pliki/dokumenty do zmiany

- `docs/governance/DEFINITION_OF_HARM.md`
- `docs/governance/SAFETY_CASE.md`, `SAFETY_GATE_MATRIX.md`, `RISK_REGISTER_STARTER.md`
- `docs/governance/AI_AGENT_GATES.md`
- nowy `docs/governance/DATA_MAP.md`
- nowy `docs/governance/SECURITY_BASELINE.md`
- nowy `docs/governance/AUDIT_LOG_POLICY.md`
- `docs/reviews/PACJENT360_DEFENSIVE_RED_TEAM_2026-07-09.md`
- `SECURITY.md`
- audit/consent/API validators i CI workflow
- nowe prompt-injection fixtures i boundary test

### Zadania

1. Rozdzielic audit event od application log i od Evidence Ledger.
2. Audit event ma: eventId, schemaVersion, occurredAt, actorId/type, subject/vault opaque IDs, action, resource type/ID, purpose, policyDecision/reason, outcome, correlationId, source i integrity metadata. Bez klinicznego payloadu.
3. Dodac coverage catalog dla read, create, update, packet, grant, revoke, export, delete i admin/support.
4. Test prompt injection ma potwierdzic brak endpointu/egressu/tool invocation; nie udaje bezpieczenstwa przyszlego LLM.
5. Reset demo usuwa wszystkie browser stores i cache; przyszly delete pozostaje contract/runbook, nie claim funkcji produkcyjnej.
6. CI uruchamia source guardy i testy read-only; release lane moze generowac dist tylko jawnie.

### Testy

- audit coverage i audit-before-read fixtures;
- nested PHI canary w log/audit metadata;
- tamper/ordering/duplicate event tests;
- no-AI-endpoint/no-egress test;
- prompt injection in PDF-like text, note and source title pozostaje inert data;
- full browser reset;
- forbidden phrase and doctor isolation regression;
- controlled negative mutation dla kazdej krytycznej bramki.

### Ryzyka

- lokalna tablica audit zostanie nazwana niezmiennym audytem;
- denylista PHI nie wykryje zagniezdzonych pol;
- prompt-injection test bez LLM zostanie przedstawiony jako LLM assurance;
- CI nie sprawdzi packaging/runtime.

### Kryteria odbioru

- komplet wymaganych governance docs ma ownera, status i date review;
- audit schema uzywa zamknietej allowlisty i opaque IDs;
- prompt-injection corpus istnieje, ale runtime AI pozostaje fizycznie nieobecny;
- source CI jest read-only i hard-fail;
- produkcyjne security controls sa jawnie oznaczone `future / not implemented`.

### Work order Codex

```text
WO-P360-S5. Zbuduj Alpha security/audit evidence i przyszle kontrakty, nie produkcyjne claims. Oddziel audit, logs i research evidence. Dodaj no-AI/no-egress oraz inert-content tests. Rozszerz Definition of Harm. Nie implementuj backendu, uploadu ani LLM.
```

### Review prompt

```text
Zweryfikuj S5 defensywnie. Odrzuc dowod, ktory myli lokalna symulacje z auth/RLS/append-only audit. Szukaj PHI w nested logs, brakujacych eventow, egressu i nieczyszczonego cache. Zwroc GO-S6/FIX/NO-GO oraz liste human-owned gaps.
```

## 8. Sprint 6 - prywatne demo i Evidence Gate

**Daty:** 05-09.10.2026
**Cel:** zamrozic jedna wersje, zebrac dowody z calej rundy i podjac decyzje continue/narrow/pivot/stop.
**Wartosc/ryzyko:** unika dalszego budowania na podstawie intuicji i convenience feedback.

### Zakres

- jeden adult patient/supporter fixture;
- jedna wersja aplikacji przez cala ostatnia fale;
- moderowane sesje tylko na danych fikcyjnych;
- lacznie z S2-S5: 15 sesji taskowych, 10-20 wywiadow, min. 5 osob 60+/supporterow seniora;
- Evidence Ledger bez PII/PHI;
- 3 niezalezne oceny pakietu przez workflow/medical-safety/privacy-security reviewerow;
- podpisana decyzja G2.

### Pliki/dokumenty do zmiany

- zamrozony fixture/snapshot demo
- `docs/research/RESEARCH_SAFETY_RULES.md`
- `docs/research/EVIDENCE_LEDGER.md`
- `docs/research/RESEARCH_SYNTHESIS_TEMPLATE.md`
- `docs/validation/*` lub zatwierdzony odpowiednik
- `docs/governance/DECISION_LOG.md`
- lokalny evidence manifest z hashami, bez release

### Zadania

1. Feature freeze; tylko P0/P1 fixes z retestem.
2. Uruchomic source-only test lane i czysty browser rehearsal.
3. Jesli Founder jawnie zleci candidate build, Release Manager buduje w czystym katalogu i porownuje hashe; bez deploymentu.
4. Policzyc metryki na zamrozonej wersji; istotna zmiana rozdziela kohorty.
5. Medical Safety i QA niezaleznie klasyfikuja safety misreads.
6. Founder podpisuje jedna decyzje: continue, narrow, pivot lub stop.

### Testy i progi

- >=10/15 konczy pakiet bez pomocy w <=8 minut;
- 0 wrong-person/wrong-scope;
- 0 odpowiedzi, ze system powiedzial co medycznie zrobic;
- 100% packet items ma source/status/author/date-or-unknown;
- >=70% usefulness 4/5+;
- >=8/15 potwierdza powtarzalny problem organizacyjny;
- mobile, keyboard, 400% reflow i clean-browser pass;
- wszystkie P0 zamkniete i niezaleznie zweryfikowane.

### Ryzyka

- Founder session jest liczona do metryk;
- zmiany miedzy sesjami sa sumowane jako jedna kohorta;
- brak reviewerow jest interpretowany jako approval;
- `continue` jest mylone z pozwoleniem na real-data backend.

### Kryteria odbioru

- Evidence Pack zawiera wersje, mianowniki, niepowodzenia i caveats;
- wynik G2 ma podpis i uzasadnienie;
- `continue` otwiera tylko P7.1/P7.2: expert/model/legal gate;
- brak dowodu wartosci albo safety threshold oznacza narrow/pivot/stop.

### Work order Codex

```text
WO-P360-S6. Feature freeze. Przygotuj reprodukowalny source evidence pack, uruchom zatwierdzone testy i zsyntetyzuj anonimowe wyniki. Nie zmieniaj scope, nie buduj backendu, nie generuj release i nie deklaruj GO. Przedstaw continue/narrow/pivot/stop do podpisu Foundera.
```

### Review prompt

```text
Audytuj S6 jak niezalezny evaluator. Sprawdz wersje, mianowniki, oddzielenie kohort, safety misreads i brak PHI. Odrzuc vanity metrics. Zwroc GO-P7.1, NARROW, PIVOT albo STOP; nie otwieraj real-data gate.
```

## 9. Sprint 7 - program zamknietego pilotazu

**Nazwa wykonawcza:** `P7 Closed Pilot Readiness & Cohort`
**Daty:** 12.10.2026-22.12.2027
**Zasada:** P7 nie jest jednym sprintem. Kazdy wiersz ponizej jest osobnym work orderem 1-2 tygodniowym albo krotka bramka human-owned.

### Zakres programu

1. Expert/model gate i jeden canonical contract.
2. Formalne legal/privacy/security mema i Adult Delegation decision.
3. Produkcyjny backend synthetic-first dopiero po G3.
4. Lifecycle, restore, deletion, incident response i support operations.
5. Niezalezny pentest, remediation i retest.
6. Full-stack private demo nadal na syntetykach.
7. Zamkniety pilot: maks. 20 doroslych pacjentow i 10 nazwanych supporterow.
8. Brak konta lekarza, binary upload, OCR, AI, embeddings, integracji i public registration w Cohort A.

### Work ordery P7

| WO | Daty | Outcome | Done/gate |
|---|---:|---|---|
| P7-01 | 12-23.10.2026 | expert packet i channel/model discovery | 3 niezalezne oceny, zero CDSS misread |
| P7-02 | 26.10-06.11.2026 | canonical model/store/VisitPacket decision | jeden kontrakt i B2C/B2B2C hypothesis |
| P7-03 | 09-20.11.2026 | GDPR roles, basis candidates, data map, DPIA draft | DPO/counsel review pending/complete jawne |
| P7-04 | 23.11-04.12.2026 | threat/security architecture, retention, vendors | zero nierozstrzygnietych P0 design |
| P7-05 | 07-18.12.2026 | MDR/CDSS, AI Act, CRA, adult delegation mema | G3 Real-Data Build Authorization human-owned |
| P7-06 | 04-15.01.2027 | backend ADR, env i security CI skeleton | synthetic-only architecture approved |
| P7-07 | 18-29.01.2027 | OIDC/PKCE, recovery, privileged MFA/step-up | auth negative suite pass |
| P7-08 | 01-12.02.2027 | patient vault, membership, RLS/object boundary | cross-vault deny by default |
| P7-09 | 15-26.02.2027 | server PDP/ABAC i DelegationGrant | actor-bound parity pass |
| P7-10 | 01-12.03.2027 | transactional append-only audit i PHI-safe logs | audit-before-read + PHI canary pass |
| P7-11 | 15-26.03.2027 | Source/typed records/history API | schema, authz i idempotency pass |
| P7-12 | 29.03-09.04.2027 | immutable packet, print/export | same policy and exact ID set |
| P7-13 | 12-23.04.2027 | retention/delete orchestrator | active delete synthetic proof |
| P7-14 | 26-30.04.2027 | secure vertical-slice gate | G4a synthetic backend GO/NO-GO |
| P7-15 | 03-14.05.2027 | DSAR/export/delete drill | end-to-end evidence |
| P7-16 | 17-28.05.2027 | encrypted backup i restore drill 1 | RPO/RTO evidence |
| P7-17 | 31.05-11.06.2027 | IR, kill switches, support JIT | tabletop wrong-person/ATO/leakage |
| P7-18 | 14-25.06.2027 | restore drill 2 i deletion tombstones | deleted data does not resurrect |
| P7-19 | 28-30.06.2027 | operations gate | G4 Secure Staging human sign-off |
| P7-20 | 01-16.07.2027 | ASVS profile, abuse suite, pentest readiness | scope and evidence pack accepted |
| P7-21 | 19-30.07.2027 | independent source-assisted pentest | findings issued by independent tester |
| P7-22 | 02-13.08.2027 | remediation i independent retest | zero Critical/High; G5 human sign-off |
| P7-23 | 16-27.08.2027 | full-stack private demo, synthetic | clean-room deployment and reset pass |
| P7-24 | 30.08-10.09.2027 | pilot charter, notices, support/revoke/delete drills | G6 Pilot Entry signed |
| P7-25 | 15-30.09.2027 | cohort wave 1 | no P0 incident, daily monitoring |
| P7-26 | 01-15.10.2027 | cohort wave 2 | metrics and safety review |
| P7-27 | 18-29.10.2027 | cohort wave 3 i checkpoint | G7 continue/freeze/stop 31.10 |
| P7-28 | 01-12.11.2027 | cohort wave 4 | no scope expansion |
| P7-29 | 15-30.11.2027 | cohort wave 5 i live close | withdrawal/revoke/delete complete |
| P7-30 | 01-15.12.2027 | pilot closeout | report, refreshed DPIA/threat model |
| P7-31 | 16-22.12.2027 | MVP decision | continue/repeat/narrow/pivot/stop |

### Pliki/dokumenty programu

- product boundary i current intended purpose;
- `MDR/CDSS Classification Memo`;
- `AI Act Screening` i AI inventory = none in runtime;
- `CRA Applicability Memo`;
- GDPR roles/basis matrix, DPIA, ROPA, DPA, vendor/subprocessor/transfer register;
- Adult Authority/Delegation Memo;
- Data Map, DFD, Threat Model i Security Architecture;
- Retention/Deletion/Backup Matrix;
- Audit Log Policy i event catalog;
- Incident Response, BCP/DR, Support Access SOP;
- Pilot Charter, notices, withdrawal/stop criteria;
- Pentest report/retest i Security Acceptance Record;
- Pilot Closeout Report.

### Testy programu

- OIDC, recovery, global revoke i privileged step-up;
- cross-vault/IDOR dla CRUD/list/search/export/jobs/audit/files;
- actor-bound grant, revoke <=5 min i expiry fail-closed;
- PHI canary w logach, URL, tickets, audit metadata i analytics;
- export/delete/DSAR/withdrawal end-to-end;
- active delete <=24h i restore bez odrodzenia danych;
- RPO <=24h i RTO <=8h;
- incident tabletop i kill switches;
- independent ASVS-based pentest i retest;
- pilot stop criteria wykonywalne operacyjnie.

### Ryzyka i stop conditions

- brak formalnego memo lub DPO/counsel sign-off: tylko syntetyczna Alpha;
- brak zespolu/budzetu 30.11.2026: pilot przechodzi na 2028;
- wrong-person, cross-vault, ineffective revoke/delete lub advice misread: natychmiastowy freeze;
- jeden Critical/High pentest: brak realnych danych do retestu;
- feature expansion w trakcie cohort: nowy RFC i osobna kohorta;
- powazna poprawka po incydencie: minimum 30-dniowy soak, nawet jesli przesuwa decyzje na 2028.

### Kryteria odbioru P7

- G3-G9 maja jawne podpisy human owners;
- zero otwartych Critical/High i Medium z PHI/cross-tenant impact;
- zero wrong-person/wrong-scope disclosure i zero system advice;
- DSAR, revoke, delete, restore i incident drill maja reprodukowalny dowod;
- Pilot Report podaje mianowniki, porazki, incydenty i caveats;
- wynik nie jest automatyczna zgoda na public launch.

### Work order Codex P7

```text
WO-P360-P7-[NN]. Wykonaj tylko zatwierdzony wycinek i zachowaj synthetic-first do jawnego G5/G6. Zacznij od kontraktu i negatywnych testow. Nie rozszerzaj cohort ani funkcji. Nie wydawaj opinii prawnej, security acceptance ani decyzji pilota. Zatrzymaj sie przy brakujacym human sign-off.
```

### Review prompt P7

```text
Audytuj P7-[NN] niezaleznie od implementatora. Sprawdz dowod pozytywny i kontrolowana mutacje negatywna, isolation/policy/audit/lifecycle oraz zgodnosc z podpisana bramka. Zwroc GO-NEXT/FIX/HOLD/STOP. Zielone CI bez human sign-off nie otwiera kolejnego gate.
```

## 10. Work ordery dla Codex i Founder OS

### Uniwersalny format work orderu Codex

```text
ID:
Bazowy commit/tree SHA i clean/dirty status:
Cel uzytkownika:
Ryzyko redukowane:
Dozwolony zakres:
Dokladna allowlista plikow owned:
Pliki no-touch:
Poza zakresem:
Testy pozytywne:
Mutacja negatywna:
Artefakty dowodowe:
Hash allowlisty/build toola, jesli dotyczy:
Stop conditions:
Git/release: edit/stage/commit/amend dozwolone autonomicznie w aktywnym WO; push/PR/release/deployment/destructive Git zakazane bez uprzedniej zgody Foundera.
```

### Founder OS - mandat

Founder OS nie implementuje produktu ani nie zatwierdza gate. Dla kazdego sprintu tworzy `PROPOSED` intake, wskazuje wymagane ludzkie decyzje, laczy evidence i przygotowuje founder brief.

| Sprint | Work order Founder OS | Oczekiwany output |
|---|---|---|
| S0 | Zarejestruj Scope Freeze, sprzecznosci SSOT i wakaty RACI. Nie aktywuj roadmapy. | decision brief z 4 blokujacymi pytaniami |
| S1 | Przyjmij P0 boundary/runtime jako controlled delivery; sledz dowody, nie wynik marketingowy. | gate brief G1 z PASS/FAIL i ownerami |
| S2 | Rejestruj hipotezy UX oraz sesje bez PII/PHI. | evidence summary, nie feature backlog |
| S3 | Zarejestruj decyzje kontraktowe i migracje jako proposed ADR. | contract decision brief |
| S4 | Oddziel UX demo access od legal authority. | human legal questions + access evidence |
| S5 | Zbierz safety/security docs i oznacz `implemented` vs `planned`. | control evidence map |
| S6 | Zsyntetyzuj G2 i przedstaw continue/narrow/pivot/stop. | founder decision pack |
| P7 | Pilnuj sekwencji G3-G9, wygasania dowodow i sign-off. | gate-specific brief; zero auto-approval |

### Uniwersalny prompt Founder OS

```text
Zarejestruj work order Pacjent360 jako PROPOSED. Przeczytaj aktualny scope, gate, Decision Log i evidence. Nie wykonuj product-repo writes i nie awansuj lifecycle bez ludzkiego podpisu. Zwroc: decyzje Foundera, blokery, ownerow, freshness dowodow, nastepny dozwolony krok i stop condition.
```

## 11. Review prompts dla kazdego sprintu

Kazdy reviewer dziala read-only i nie poprawia wlasnych findings.

| Sprint | Perspektywa reviewera | Pytanie rozstrzygajace |
|---|---|---|
| S0 | Repo Guardian + PM | Czy istnieje jedna aktywna prawda i jeden wedge? |
| S1 | Compliance + Release + QA | Czy funkcje regulowane sa fizycznie nieaktywne i nieobecne w normalnym artefakcie? |
| S2 | UX + Privacy + Accessibility | Czy pacjent/supporter rozumie osobe, zadanie i zakres bez przeciazenia? |
| S3 | Principal Architect + Medical Safety | Czy kazdy fakt ma zrodlo i system niczego nie dopowiada ani nie rankuje? |
| S4 | Privacy/Security + Legal | Czy access grant jest actor-bound i nie udaje authority? |
| S5 | Security + Incident Lead + QA | Czy dowody sa rzeczywistymi kontrolami Alphy, a nie produkcyjnym theater? |
| S6 | Independent Evaluator | Czy evidence uzasadnia continue, czy tylko pokazuje ladne demo? |
| P7 | Independent domain owner | Czy gate ma niezalezny dowod i human sign-off? |

Wspolny prompt:

```text
Przejrzyj plan, diff, test output i evidence dla [SPRINT]. Najpierw findings P0-P2 z plikami/linami, potem luki dowodowe, nastepnie GO/FIX/HOLD/NO-GO/RFC REQUIRED. Nie implementuj i nie akceptuj twierdzen bez dowodu runtime lub podpisu human ownera.
```

## 12. Test matrix

| ID | Test | Od sprintu | Automatyzacja/dowod | Fail oznacza |
|---|---|---:|---|---|
| T01 | aktywny SSOT nie zawiera doctor/child/AI current scope | S0 | nowy scope validator + negative mutation | freeze feature work |
| T02 | normal UI no-CDSS: wszystkie indexed surfaces bez zakazanych claimow | S1 | rozszerzony No-CDSS scan | brak demo |
| T03 | regulated flag blokuje zachowanie, nie tylko ma wartosc false | S1 | unit/runtime negative test | P0 |
| T04 | normal bundle fizycznie bez tech/doctor/clinical modules | S1 | manifest/import scan | P0 |
| T05 | doctor view izolowany dla URL i persisted state | S1 | browser smoke | P0 |
| T06 | source/dist/runtime SHA parity | S1 | release parity lane | brak candidate/release |
| T07 | missing date pozostaje unknown | S1 | unit/property/browser | P0 safety |
| T08 | kazdy item ma author/source/status/date-or-unknown | S2 | schema + browser assertions | brak packet |
| T09 | action cards pochodza tylko z allowlisty organizacyjnej | S2 | boundary guard | brak demo |
| T10 | wrong active person/role fail-closed | S2 | browser negative test | P0 privacy |
| T11 | no-access state nie ujawnia ukrytych kategorii | S2 | zero-knowledge test | P0 privacy |
| T12 | packet ma dokladnie recznie wybrane ID | S3 | contract/parity test | brak packet |
| T13 | brak silent sort/truncation/clinical ordering | S3 | property/golden test | P0 safety |
| T14 | UI, print i export maja identyczny zakres | S3 | ID set comparison | brak share/export |
| T15 | VisitPacket v2->v3 migration jest jawna i deterministyczna | S3 | migration fixtures | brak migration |
| T16 | dwa konta tej samej roli nie dziela grantu | S4 | access negative test | P0 |
| T17 | revoke w aktywnej sesji odcina UI/packet/export | S4 | browser + contract | P0 |
| T18 | expiry/revoke race fail-closed | S4 | clock/negative tests | P0 |
| T19 | policy parity UI/packet/export/przyszle API | S4 | common decision fixtures | P0 |
| T20 | audit catalog pokrywa read/create/update/packet/grant/revoke/export/delete | S5 | coverage validator | brak gate |
| T21 | audit-before-read failure blokuje disclosure | S5/P7 | contract/integration test | P0 |
| T22 | PHI canary nie trafia do log/audit/URL/ticket | S5/P7 | canary scan | incident/HOLD |
| T23 | prompt injection w tresci jest inert; brak AI endpoint/egress/tool | S5 | defensive fixtures + network test | P0 boundary |
| T24 | XSS/content injection przez tytul/notatke/source/export | S3/P7 | browser/security suite | P0 |
| T25 | reset usuwa local/session/IndexedDB/CacheStorage | S1/S5 | clean-browser test | brak demo |
| T26 | 320/360/390/768 i 400% reflow bez overflow | S2-S6 | screenshots/manual + assertions | FIX/HOLD |
| T27 | keyboard, focus, labels i screen reader critical flow | S2-S6 | automated + human review | FIX/HOLD |
| T28 | PWA N->N+1 bez mixed-version UI | S1/S6 | SW upgrade test | brak candidate |
| T29 | cross-vault/IDOR CRUD/list/search/export/jobs/files | P7 | integration/abuse suite | pilot NO-GO |
| T30 | revoke <=5 min, active delete <=24h | P7 | timed E2E | pilot NO-GO |
| T31 | restore nie odradza usunietych danych | P7 | restore drills | pilot NO-GO |
| T32 | RPO <=24h i RTO <=8h | P7 | two restore drills | pilot NO-GO |
| T33 | wrong-person/ATO/leakage tabletop i kill switches | P7 | signed drill record | pilot NO-GO |
| T34 | pentest/retest zero Critical/High | P7 | independent report | pilot NO-GO |
| T35 | 0 safety misread jako advice/triage/interpretation | S2-S6/P7 | moderowane badanie | HOLD/STOP |

Kazda krytyczna automatyczna bramka musi miec:

1. znany przypadek `PASS`;
2. kontrolowana mutacje, ktora musi zakonczyc sie non-zero;
3. zapis wersji, komendy, czasu i wyniku;
4. ownera interpretujacego dowod;
5. osobny human sign-off tam, gdzie wymagany.

## 13. Release gates

| Gate | Co wolno po GO | Wymagany dowod | Kto podpisuje |
|---|---|---|---|
| R0 Local Source | dalsza praca lokalna | source tests/guards PASS | QA/Tech |
| R1 Safe Alpha Candidate | moderowane demo fikcyjne | G1, zero P0, clean browser, reset | Founder + Safety + QA |
| R2 Research Session | pokaz uczestnikowi na fikcyjnym case | Research Safety SOP, moderator, consent research | UX Research |
| R3 Expert Demo | pokaz zamrozonego packet ekspertom | G2 continue/narrow, source/print parity | Product + Medical Safety |
| R4 Real-Data Build | budowa synthetic-first backendu | formalne G3 mema i authorization | Founder + Legal/DPO + Security |
| R5 Secure Staging | assurance/pentest | identity, vault/RLS, policy, audit, lifecycle drills | Security + QA |
| R6 Real-Data Readiness | przygotowanie pilota | pentest retest, final DPIA/DPA/vendors, zero P0 | Independent Security + DPO + Founder |
| R7 Pilot Entry | ograniczony real-data cohort | charter, notices, support, dry run, operators | Pilot Lead + DPO + Security + Founder |
| R8 Pilot Checkpoint | kontynuacja bez rozszerzania | zero disclosure/advice/Sev1/Sev2 | Steering Council |
| R9 Pilot Exit | decyzja 2028 | closeout, deletion/DSAR, refreshed DPIA/threat | Founder/Council |

Zaden gate w 2026-2027 nie oznacza automatycznego public launch. `validate-go-live.ps1`, zielony dashboard, Codex lub Founder OS nie moga podpisac R4-R9.

## 14. Funkcje, ktore pozostaja zablokowane

Bez osobnego RFC Level C, opinii i programu regulacyjnego zablokowane sa:

1. diagnoza, triage i ocena pilnosci;
2. interpretacja wynikow, norm, trendow i ryzyka;
3. rekomendacje leczenia, dawki, odstawienia lub zamiany leku;
4. wykrywanie konfliktow/interakcji lekowych;
5. runtime LLM, RAG, embeddings, vector store i AI chat;
6. OCR/parser dokumentow na danych pacjenta;
7. autonomiczne narzedzia/agent actions;
8. konto lekarza, doctorBrief i `Pacjent w 90 sekund` w normalnym UI;
9. clinical summary, ranking, scoring, alerts i specjalistyczna priorytetyzacja;
10. dzieci, opiekun prawny i utrata zdolnosci w baseline pilota;
11. binary document upload w Cohort A;
12. public self-service registration;
13. produkcyjna integracja IKP/P1/CeZ/NFZ/EHDS;
14. scraping, przejmowanie loginow albo import nieoficjalna droga;
15. analytics/session replay/error logs z trescia zdrowotna;
16. uzycie danych produkcyjnych do treningu, prompt improvement lub benchmarku;
17. rozszerzenie cohort podczas pilota bez nowego gate;
18. publiczne claimy `bezpieczny sejf`, `klinicznie zwalidowany`, `EHDS-ready`, `P1-ready`.

Najbezpieczniejsza polityka prompt injection w current MVP to fizyczny brak endpointu AI, OCR, embeddings, narzedzi i egressu modelowego.

## 15. Decyzja koncowa dla Foundera

### Teraz - korekta S0 po niezaleznym review

Nie zlecac kolejnego patcha UI. Decyzje sa zamkniete:

1. Current wedge: kompetentny dorosly pacjent + jedna nazwana dorosla osoba wspierajaca + jedna planowana wizyta.
2. Hipoteza uzytkowa 2026: B2C. B2B2C: rownolegle discovery komercyjne.
3. Lekarz, dzieci, AI, backend i integracje: `later/blocked`.
4. Founder/Product accountable: Sebastian Kalisz. Pozostale role musza miec konkretnego ownera albo jawny status `PLANNED`/`VACANT-BLOCKING`.

Output: reprodukowalny akt ratyfikacji, closed-world manifest, odlaczony legacy control plane, E2E negative CLI oraz pakiet do niezaleznego review. Bez zmian UI.

### W tym tygodniu - do 17.07.2026

1. Utrzymac ratyfikowany `ROADMAP_2026_2027.md` bez ponownego otwierania D1-D8.
2. Zamknac closed-world mape `ACTIVE / ACTIVE_SUPPORTING / SUPERSEDED / REFERENCE_ONLY`.
3. Nazwac RACI i wakaty zgodnie z definicja statusow.
4. Utrzymac wyłącznie WO-S0 do osobnego `GO-S1`.
5. Zarezerwowac fractional reviewers: UX/accessibility, medical safety, legal/DPO, security i QA.
6. Nie generowac release, nie publikowac i nie zapraszac uczestnikow.

### Najblizsze 30 dni - do 09.08.2026

1. Zamknac G0 do 24.07.
2. W Sprincie 1 zamknac hard-disable, physical module isolation, unknown dates, indexed claims scan, reset oraz runtime parity.
3. Utworzyc Research Safety SOP i Evidence Ledger.
4. Zbudowac Safe Alpha Candidate do 07.08 wyłącznie na fikcyjnym case.
5. Dopiero po G1 zaplanowac moderowane sesje S2-S6.
6. Jesli ktorykolwiek P0 pozostaje otwarty, przesunac demo. Nie negocjowac granicy kalendarzem.

Najwazniejsza decyzja wykonawcza brzmi:

> Najpierw zdobywamy prawo do bezpiecznego testu Alphy. Dopiero dowod wartosci otwiera formalny Real-Data Gate. Pilot nie jest nastepnym sprintem po ladnym demo.
