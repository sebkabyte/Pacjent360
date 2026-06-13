# Pacjent360™: plan strategiczny i harmonogram rzeczowo-techniczny

Status: nadrzedny plan programu po audycie repo i councilu.

Data: 2026-06-08

Ten dokument spina `README.md`, `ARCHITECTURE.md`, `SSOT.md`, `TIMELINE_VISION.md`, `ROADMAP.md`, `SPRINTS.md`, `RISKS.md`, `GO_LIVE_CHECKLIST.md` i `VALIDATION_PROTOCOL.md` w jeden plan pracy. Nie zastepuje dokumentow safety. Jesli zakres LLM/asystentow koliduje z `SSOT.md`, pierwszenstwo ma `SSOT.md`.

## Hierarchia dokumentow

`PROGRAM_PLAN.md` jest nadrzednym harmonogramem programu.

Wczesniejsze prywatne backlogi AI, zadania wykonawcze i notatki historyczne nie sa anulowane. Sa objete przez M0-M12 jako szczegolowy backlog wykonawczy i material historyczny. Nie powinny byc traktowane jako rownolegly, konkurencyjny harmonogram.

Hierarchia robocza (po ADR 0005, 2026-06-10):

```text
PRODUCT_SSOT.md / DISCLAIMER.md / SECURITY.md / RISKS.md
  -> PROGRAM_PLAN.md
    -> ARCHITECTURE.md / TIMELINE_VISION.md / ROADMAP.md
      -> SPRINTS.md / SSOT.md (zakres: LLM/agenci)
        -> prywatne backlogi AI i handovery (niepubliczne, robocze)
```

Zasada:

- `PRODUCT_SSOT.md` mowi, czym jest produkt i co jest no-go (ADR 0005).
- `docs/SSOT.md` rzadzi granicami LLM/asystentow w ramach `PRODUCT_SSOT.md`.
- `TIMELINE_VISION.md` rzadzi docelowa Mapa Pacjenta 360.
- `PROGRAM_PLAN.md` rzadzi kolejnoscia prac.
- Prywatne backlogi AI sa kontekstem wykonawczym, ale nie nadrzednym planem programu.

## Stan po sprincie nocnym

Sprint FAZA 1+2 z prywatnego backlogu AI zostal wykonany kierunkowo przed tym uaktualnieniem planu. Oznacza to, ze `PROGRAM_PLAN.md` startuje z repo po istotnych zmianach MVP, a nie ze stanu sprzed sprintu.

Zrealizowane lub czesciowo zrealizowane kierunkowo:

- rozdzielenie kokpitu lekarza i pacjenta,
- jezyk pacjenta i statusy per persona,
- sekcja przygotowania do wizyty,
- Full Data Hub per persona,
- medication reconciliation w kokpicie lekarza,
- narracja epizodu i filtrowanie warstw mapy,
- mobile/responsive CSS,
- Mapa Pacjenta 360 jako wspolny komponent lekarz/pacjent,
- krotkie karty zdarzen i inspektor zdarzenia,
- pierwsze `timelineEpisodes` i `timelineRelations`.

Konsekwencja:

- M0 zaczyna sie od odswiezenia `dist/public` aktualnym kodem, a nie od implementowania FAZA 1+2 od nowa.
- Elementy FAZA 1+2 zostaja przeniesione do statusu: `done / needs QA / needs hardening`.
- Nowych funkcji nie dokladamy, dopoki M0 i Data Contract v0.1 nie sa opanowane.

## Decyzja strategiczna

Pacjent360™ nie jest "AI lekarzem", systemem triage ani alternatywa dla IKP/P1.

Pacjent360™ jest open source warstwa kontekstu pacjenta:

```text
Source -> Claim -> Event -> Episode -> Encounter -> Task -> Report
```

Produktowo oznacza to:

```text
Mapa Pacjenta 360 + petla wizyty + Doctor in the Loop
```

Najkrotsza definicja:

> Pacjent360™ pomaga pacjentowi, opiekunowi i lekarzowi zobaczyc, co wiadomo, czego brakuje, co jest niepewne i co trzeba wyjasnic przed lub po kontakcie medycznym.

## Repo dzis

Repo jest dojrzalym prototypem alpha, ale nadal lokalnym i statycznym.

| Obszar | Stan |
| --- | --- |
| Strona publiczna | `public/index.html`, `public/site.css`, `public/site.js`, `public/assets/` |
| Demo MVP | `public/demo.html`, `public/app.js`, `public/styles.css` |
| Model lokalny | `localStorage`, `pacjent360-state-v11`, dane fikcyjne |
| Mapa Pacjenta 360 | wspolny komponent lekarz/pacjent, zdarzenia, epizody, relacje, inspektor |
| Dokumentacja safety | `DISCLAIMER.md`, `PRIVACY.md`, `SECURITY.md`, `RISKS.md`, `GO_LIVE_CHECKLIST.md` |
| Architektura | `ARCHITECTURE.md`, `TIMELINE_VISION.md`, `SSOT.md` |
| Sprinty LLM | `SPRINTS.md`, aktywny tylko A0 jako safety/contracts |
| Walidacja | `VALIDATION_PROTOCOL.md`, metryki dla lekarza i pacjenta/opiekuna |

Wazne ustalenia councilu:

- `dist/public` moze byc starsze niz najnowszy `public/app.js` i `public/styles.css`; przed publikacja trzeba zawsze odswiezyc paczke.
- Publiczne repo jest no-go bez dzialajacych aliasow `security@pacjent360.com.pl` i `kontakt@pacjent360.com.pl`.
- Materialy robocze AI, prywatne handovery i notatki autora powinny byc traktowane jako prywatne albo polprywatne do osobnego oczyszczenia.
- `public/app.js` jest akceptowalny dla MVP, ale nie dla dalszej architektury produktu. Kolejne milestone'y musza wydzielic kontrakty danych, walidatory, fixtures i renderery.

## Filary programu

### 1. Governance i publikacja

Cel: publikowac tylko czysta, bezpieczna paczke i nie otwierac repo przed uporzadkowaniem.

Zakres:

- clean public package,
- aliasy kontaktowe,
- branch protection,
- public repo allowlist,
- rollback,
- incident/security path.

### 2. Mapa Pacjenta 360 jako rdzen

Cel: timeline nie jest zakladka, tylko projekcja historii pacjenta.

Zakres:

- `Source`,
- `Claim`,
- `TimelineEvent`,
- `TimelineEpisode`,
- `TimelineRelation`,
- statusy,
- inspektor,
- relacje neutralne, bez przyczynowosci.

### 3. Workflow przed wizyta i raport 90 sekund

Cel: pierwszy realny wedge produktu.

Zakres:

- pacjent/opiekun przygotowuje dokumenty, leki, wywiad i pytania,
- lekarz widzi raport `Known / Unknown / Uncertain / To verify`,
- testujemy zrozumialosc i brak odczytu jako diagnoza/triage.

### 4. Krag wsparcia i zgody

Cel: opiekun jest realna persona, nie tylko wpis w zgodach.

Zakres:

- rodzic,
- opiekun prawny,
- osoba wspierajaca (z zakresem dostepu, np. leki albo wizyty),
- granularne zgody,
- audyt dostepu,
- widok opiekuna z zadaniami.

### 5. After Visit Loop

Cel: zamknac petle po wizycie bez wchodzenia w decyzje kliniczne.

Zakres:

- `Encounter`,
- `VisitArtifact`,
- `VisitSummary` jako draft,
- `PostVisitPlan`,
- `CareTask`,
- widok "Co dalej po wizycie".

### 6. Asystenci operacyjni po kontraktach

Cel: automatyzacja jako sekretariat kontekstu, nie jako doradca medyczny.

Zakres:

- A0 Safety & Contracts,
- walidator zakazanych outputow,
- synthetic fixtures,
- dry-run,
- preview,
- reczna akceptacja,
- audit `AgentRun`.

### 7. Interoperability readiness

Cel: przygotowac model pod oficjalne standardy bez scrapingu IKP/P1.

Zakres:

- FHIR/IPS-inspired export,
- `Provenance`,
- mapowanie `Patient360 -> FHIR-ish Bundle`,
- adapter boundary dla IKP/P1,
- `INTEGRATION_STRATEGY.md`.

## Kamienie milowe

| ID | Milestone | Horyzont | Wynik |
| --- | --- | ---: | --- |
| M0 | Publication Ready | 1-2 dni | czysta paczka publiczna, smoke test, aliasy kontaktowe, go-live check |
| M1 | Program SSOT Freeze | tydzien 1 | jeden program prac, zaktualizowane statusy, brak sprzecznych planow |
| M2 | Data Contract v0.1 | tydzien 1-2 | `schemaVersion`, enumy, `Source`, `Claim`, walidator source coverage |
| M3 | Patient Map Core | tydzien 2-3 | mapa jako projekcja danych, epizody, relacje, inspektor, pasma/warstwy |
| M4 | Pre-Visit Workflow | tydzien 3 | pacjent/opiekun zaczyna od zera i przygotowuje kontekst wizyty |
| M5 | Report Validation Pack | tydzien 4 | 3-5 fikcyjnych case studies, formularz feedbacku, metryki |
| M6 | Validation Pilot | tydzien 5+ | 2 POZ, 1 specjalista, 3 pacjentow/opiekunow, decyzja continue/pivot/no-go |
| M7 | Caregiver Scope MVP | tydzien 6 | widok opiekuna, role, zakresy zgody, audyt |
| M8 | After Visit Loop MVP | tydzien 7-8 | `Encounter`, `VisitSummary draft`, `PostVisitPlan`, `CareTask`, "Co dalej" |
| M9 | Agent Safety A0 | tydzien 9 | kontrakty agentow, `AgentPolicy`, walidator, fixtures |
| M10 | Manual Agent Dry-Run | tydzien 10 | dry-run bez realnych danych, preview, no hidden commit |
| M11 | First Safe Assistants | tydzien 11 | `DataQualityAgent`, `SourceGroundingAgent`, `DemoSafetyLintAgent` |
| M12 | Strategic Decision Gate | tydzien 12 | decyzja: open source community, pilot instytucjonalny, PWA/backend, pivot albo stop |
| M13 | Care Circle Language & Authority | po M7, przed M8 | rozdzial krag opieki (ludzie) vs agenci (funkcje), slownictwo UI/copy, kierunek macierzy authority (rodzic/opiekun prawny/osoba wspierajaca) |
| M14 | Definition of Harm & Safety Case | rownolegle z M5 | `DEFINITION_OF_HARM.md` (H-001..H-010), `SAFETY_CASE.md` jako argumentacja z istniejacych dowodow, testy negatywne w walidatorach |

### Aktualny status milestone'ow - 2026-06-08

| Milestone | Status | Uwagi |
| --- | --- | --- |
| M0 Publication Ready | repo alpha open / go-live gated | Publiczne repo alpha zostalo otwarte z czystej allowlisty. `dist/public` przechodzi build, verifier i browser smoke, a `dist/upload-ready` przechodzi verifier oraz HTTP smoke jako katalog uploadu. Produkcyjny go-live domeny i prywatna obsluga zgloszen nadal czekaja na aliasy `security@pacjent360.com.pl` i `kontakt@pacjent360.com.pl`. |
| M1 Program SSOT Freeze | done directionally | `PROGRAM_PLAN.md` jest nadrzednym harmonogramem. Prywatne backlogi AI, FAZY/CKP/MOB/NAT i notatki robocze sa backlogiem wykonawczym albo historia prac. |
| M2 Data Contract v0.1 | done vertical slice | Jest `public/patient360-contract.js`, `schema/patient360.schema.json`, eksport `schemaVersion: 7`, `sourceQuality`, typ zrodla `consent`, walidator i ADR `0004-data-contract-v7.md`. |
| M3 Patient Map Core | done vertical slice + snapshot / needs further hardening | Dodano `public/patient360-map-model.js`, przepieto renderer mapy na czysty model, dodano walidator M3, snapshot fixture i edge-case fixture. Dalsze pasma/warstwy i pelny rozdzial renderera zostaja w kolejnych iteracjach. |
| M4 Pre-Visit Workflow | vertical slice + model | Kokpit pacjenta ma flow "Przygotowanie krok po kroku", checklist summary, statusy `gotowe / do potwierdzenia / brak danych`, czysty model `public/patient360-previsit-model.js`, fixture no-data i walidator M4. Pelne M4 nadal wymaga wariantu opiekuna. |

## Harmonogram rzeczowo-techniczny

### Tydzien 0: safety freeze i repo hygiene

Cel: nie isc dalej z nowymi funkcjami, dopoki repo i publikacja nie sa opanowane.

Zadania:

- odswiezyc `dist/public` po najnowszych zmianach Mapy Pacjenta,
- powtorzyc `GO_LIVE_CHECKLIST.md`,
- skonfigurowac i przetestowac `security@pacjent360.com.pl` oraz `kontakt@pacjent360.com.pl`,
- przygotowac public repo allowlist,
- zdecydowac, ktore dokumenty robocze AI zostaja prywatne,
- nie robic `git add .`; publiczne repo aktualizowac przez allowlist i czysta paczke.

Definition of Done:

- `node --check public/app.js` pass,
- clean package bez prywatnych notatek, szkicow komunikacji, `.git`, `.env`, lokalnych katalogow narzedzi i roboczych materialow AI,
- publiczne pliki maja disclaimer/privacy,
- znany jest rollback.

### Tydzien 1: Program SSOT i Data Contract v0.1

Cel: uporzadkowac jeden rdzen danych i jeden plan programu.

Zadania produktowe:

- zamrozic definicje: Mapa Pacjenta 360 + petla wizyty + DITL,
- oznaczyc `SPRINTS.md` jako plan agentowy, nie caly plan produktu,
- zaktualizowac `ROADMAP.md` do programu M0-M12.

Zadania techniczne:

- dodac decyzje ADR: `Source -> Claim -> Event -> Episode -> View`,
- zaprojektowac `schema/patient360.schema.json`,
- dodac `schemaVersion`,
- spisac enumy statusow i labeli UI,
- zaprojektowac walidator `sourceRefs` / `source_missing`.

Definition of Done:

- kazdy nowy rekord ma jasny typ, status i zrodlo,
- eksport JSON ma wersje schematu,
- znane sa migracje `v6 -> v7`,
- dokumentacja wskazuje jeden aktywny plan.

#### Mapping Data Contract v0.1 do obecnego MVP

Obecny model `v6` nie musi zostac przebudowany jednorazowo. Data Contract v0.1 powinien byc warstwa kompatybilnosci nad obecnymi tablicami.

| Obecnie w `public/app.js` | Kontrakt v0.1 | Migracja v6 -> v7 |
| --- | --- | --- |
| `documents[]`, `interviews[]`, `observations[]`, `medications[]`, `decisionContexts[]` | `Source[]` + rekordy domenowe | utworzyc rejestr `sources[]` z typem, data, tytulem i ref do rekordu |
| stringi `sourceRefs` typu `doc:d1` | `SourceRef` | zachowac stringi w UI, ale walidowac je przez `sources[]` |
| opis w rekordach domenowych | `Claim[]` | pierwsza wersja: claim tylko dla raportu, flag, pytan DITL i mapy |
| `timelineEvents[]` | `Event[]` jako projekcja z claim/source | zachowac `timelineEvents`, dodac `claimRefs`, `sourceRefs`, `schemaStatus` |
| `timelineEpisodes[]` | `Episode[]` | dopisac `eventRefs`, `startDate`, `endDate`, `status`, `sourceRefs` |
| `timelineRelations[]` | `Relation[]` | wymagac `relationType`, `fromEventId`, `toEventId`, `sourceRefs`, zakaz przyczynowosci |
| `knownUnknowns[]`, `flags[]`, `ditlQuestions[]` | `Claim[]` + `Question[]` | kazdy element ma source albo `source_missing` |
| `consents[]` tekstowe/strukturalne | `ConsentScope[]` + `Source(type=consent)` | `consent:id` jest formalnym zrodlem aktu zgody, a pozostale `sourceRefs` tlumacza kontekst udostepnienia |
| `audit[]` | `AuditLog[]` | dodac typ akcji, aktora, zakres i ref do danych |

Minimalne pola `schemaVersion: 7`:

```text
schemaVersion
sources[]
claims[]
timelineEvents[]
timelineEpisodes[]
timelineRelations[]
consentScopes[]
audit[]
```

Zakres tygodnia 1 nie oznacza pelnego refaktoru monolitu. Oznacza:

1. opis schematu,
2. walidator kontraktu,
3. migrator danych demo,
4. test source coverage,
5. eksport JSON zgodny z nowa wersja.

Refaktor plikow `state/renderers/validators/fixtures` jest osobnym etapem M3/M7, a nie warunkiem samego Data Contract v0.1.

Status implementacyjny M2:

- schemat: `schema/patient360.schema.json`,
- wspolne slowniki kontraktu: `public/patient360-contract.js`,
- eksport demo: `schemaVersion: 7`, `contractVersion: 0.1`, `sources[]`, `claims[]`, `timelineEvents[]`, `timelineEpisodes[]`, `timelineRelations[]`, `consentScopes[]`, `audit[]`, `sourceQuality`, `domainData`,
- walidator: `powershell -ExecutionPolicy Bypass -File tools\validate-data-contract.ps1`,
- decyzja migracyjna: `docs/adr/0004-data-contract-v7.md`,
- zakres: warstwa kompatybilnosci nad obecnym `public/app.js`, bez pelnego refaktoru monolitu.

### Tydzien 2-3: Patient Map Core

Cel: mapa staje sie operacyjnym rdzeniem produktu.

Dokument prowadzacy: `TIMELINE_VISION.md`.

Zadania:

- wydzielic model mapy od renderowania UI,
- dodac jawne `Source` i `Claim`,
- dodac pasma epizodow i panel warstw,
- relacje pokazywac jako neutralne powiazania,
- inspektor zdarzenia ma prowadzic do: zrodla, pytania, braku danych, zadania albo raportu,
- naprawic checkliste przed wizyta: status danych, nie tylko `item.done`.

Definition of Done:

- lekarz i pacjent widza te sama historie,
- mapa ma source coverage albo `source_missing`,
- zdarzenia planowane nie wygladaja jak fakty dokonane,
- mobile ma przewijanie mapy bez globalnego overflow.

### Tydzien 3: Pre-Visit Workflow

Cel: pacjent/opiekun potrafi zaczac od zera.

Zadania:

- empty state dla pacjenta bez danych,
- "przygotuj wizyte" jako prowadzony flow,
- dokumenty,
- leki,
- wywiad,
- pytania,
- braki,
- raport preview.

Definition of Done:

- nowy uzytkownik wie, co ma przygotowac,
- checklista nie brzmi jak zalecenie medyczne,
- kazdy punkt ma zrodlo lub status braku zrodla.

### Tydzien 4-5: Validation Pack i pilot

Cel: sprawdzic, czy projekt ma realna wartosc.

Uwaga operacyjna: tydzien 5 jest celem, nie obietnica kalendarzowa. Rekrutacje reviewerow trzeba zaczac juz w M0/M1. Jesli nie ma uczestnikow albo bezpiecznych fikcyjnych case studies, M6 przesuwa sie bez obchodzenia bramek safety.

Zadania:

- przygotowac 3-5 neutralnych fikcyjnych case studies,
- przygotowac formularz feedbacku,
- uruchomic `VALIDATION_PROTOCOL.md`,
- zebrac feedback: lekarze POZ, specjalista, pacjenci/opiekunowie,
- zmierzyc ryzyko mylnej interpretacji.

Metryki:

| Metryka | Kontynuuj | Pivotuj |
| --- | ---: | ---: |
| Przydatnosc raportu, skala 1-5 | >= 3.5 | < 2.5 |
| Zrozumialosc celu dla wszystkich reviewerow | >= 4/6 | < 2/6 |
| Zrozumialosc pacjent/opiekun | >= 2/3 | < 1/3 |
| Odczyt jako diagnoza/triage | 0 | >= 2 |

Definition of Done:

- jest decyzja continue/pivot/no-go,
- feedback trafia do roadmapy,
- raport nie jest odczytywany jako diagnoza, triage ani zalecenie.

### Tydzien 6: Caregiver Scope MVP

Cel: opiekun ma realny, bezpieczny widok.

Zadania:

- `SupportRole`,
- `ConsentScope`,
- `AccessScope`,
- audit access,
- widok opiekuna,
- cofniecie zgody ukrywa przyszle outputy,
- brak leakage przez komunikat bledu lub raport.

Definition of Done:

- widac, kto co widzi, dlaczego i do kiedy,
- osoby wspierajace maja rozne zakresy dostepu (np. obszar lekow vs obszar wizyt),
- cofniecie zgody zmienia widocznosc i zapisuje audyt.

### Tydzien 7-8: After Visit Loop MVP

Cel: zamknac petle po kontakcie z lekarzem.

Zadania:

- `Encounter`,
- `VisitArtifact`,
- `VisitSummary draft`,
- `PostVisitPlan`,
- `CareTask`,
- widok "Co dalej po wizycie",
- zadania organizacyjne: dokument, badanie, recepta, termin, pytanie.

Definition of Done:

- podsumowanie jest draftem, nie dokumentacja medyczna,
- zadania maja zrodlo,
- system nie umawia, nie kupuje, nie wybiera terapii i nie ocenia pilnosci.

### Tydzien 9-11: Agent Safety i dry-run

Cel: dopiero po kontraktach pokazac pierwsza automatyzacje.

Zadania:

- `AgentPolicy`,
- `AgentRun`,
- walidator forbidden outputs,
- prompt-injection tests,
- synthetic fixtures,
- dry-run UI,
- preview,
- reczna akceptacja,
- source coverage.

Pierwsze asystenty:

- `DataQualityAgent`,
- `SourceGroundingAgent`,
- `DemoSafetyLintAgent`.

Definition of Done:

- brak realnych danych,
- brak hidden commit,
- kazdy output ma zrodlo albo `source_missing`,
- kazdy output ma status DITL,
- walidator blokuje diagnoze, triage, pilnosc, terapie i zalecenia.

### Tydzien 12: Strategic Decision Gate

Cel: zdecydowac, co dalej.

Opcje:

- kontynuowac open source community,
- przygotowac pilot instytucjonalny,
- wejsc w PWA/backend,
- skupic sie tylko na Mapie Pacjenta,
- zatrzymac LLM i zostac przy narzedziu kontekstu,
- pivot, jesli walidacja nie potwierdzi wartosci.

Warunki przejscia dalej:

- istnieje walidacja z uzytkownikami,
- jest czysty public repo model,
- jest source/data contract,
- nie ma aktywnych P0 safety,
- znana jest decyzja regulacyjna: context tool vs CDSS/MDR.

## Aktualne P0/P1/P2

### P0 no-go

- Nie publikowac starego `dist/public`.
- Nie uruchamiac produkcyjnego go-live domeny ani prywatnej obslugi zgloszen bez aliasow kontaktowych.
- Nie publikowac roboczych dokumentow AI bez czyszczenia.
- Nie dodawac LLM runtime bez A0, dry-run, walidatora, zrodel i audytu.
- Nie uzywac realnych danych pacjentow w demo, fixtures, promptach ani walidacji publicznej.

### P1

- Ograniczyc jezyk i wizualia alertowe, zeby flagi nie wygladaly jak triage.
- Ujednolicic "raport kontekstowy" zamiast jezyka specjalistyczno-decyzyjnego w UI.
- Opakowac zrodla typu "zalecono" jako "dokument zawiera informacje o...".
- Dodac mocniejsza bramke przed formularzami demo: tylko dane fikcyjne.
- Naprawic checkliste przed wizyta, ktora teraz moze mylic `status` z `done`.

### P2

- Ujednolicic nazwy techniczne `clinicalQuestion` -> `contextQuestion` w przyszlych migracjach.
- Rozwazyc lokalne ikony zamiast CDN.
- Doprecyzowac retencje logow hostingu w privacy.
- Dodac `PUBLIC_REPO_MANIFEST.md`.
- Dodac `INTEGRATION_STRATEGY.md` po Data Contract v0.1.

## Go / no-go dla strategicznych kierunkow

| Kierunek | Go | No-go |
| --- | --- | --- |
| Publikacja domeny | czysta paczka, privacy, disclaimer, smoke test | stary `dist/public`, prywatne pliki, brak rollbacku |
| Publiczne repo | aliasy, allowlist, branch protection, license, clean docs | `git add .`, robocze AI docs, prywatne materialy |
| Walidacja | fikcyjne cases, protokol, metryki | realne dane, brak safety wording |
| Opiekun | strukturalne zgody i audit | tekstowe zgody bez realnego filtrowania |
| LLM/agenci | A0, dry-run, preview, validator, audit | runtime bez zrodel i bez review |
| Integracje | adapter boundary, FHIR/IPS mapping, legalna sciezka | scraping IKP/P1, przechowywanie loginow |
| CDSS/MDR | osobna decyzja, review prawne/kliniczne/regulacyjne | przypadkowy dryf przez wording lub flagi |

## Model pracy

Kazda sesja powinna zaczynac sie od:

1. Cel sprintu.
2. Ostatni handover.
3. P0/P1 safety.
4. `RISKS.md`.
5. Stan `dist/public`.
6. Stan public repo.
7. Czy zmiana dotyka DITL, zgody, zrodel albo LLM.

Kazda sesja powinna konczyc sie wpisem:

```text
Context
Decisions
Changed files
Tests
Risks
Next step
```

Definition of Ready:

- uzytkownik,
- problem,
- ryzyko clinical/privacy,
- zrodla danych,
- status DITL,
- kryterium akceptacji,
- test safety.

Definition of Done:

- dziala lokalnie,
- brak realnych danych,
- wording bez diagnozy/triage/terapii/pilnosci,
- source coverage albo `source_missing`,
- eksport i audyt nie ujawniaja danych poza zakresem,
- testy techniczne i smoke test,
- ryzyka zaktualizowane.

## Decyzje programu

### D-001: publiczne repo

Decyzja: publiczne repo ma zawierac tylko publiczne artefakty i oczyszczona dokumentacje.

Robocze dokumenty AI, prywatne handovery i notatki autora nie trafiaja do publicznego repo domyslnie. Moga zostac opublikowane tylko po osobnym czyszczeniu i decyzji allowlist.

### D-002: minimalny public repo manifest

Minimalna allowlista publicznego repo:

```text
.github/
.gitattributes
.gitignore
README.md
LICENSE
NOTICE
SECURITY.md
CONTRIBUTING.md
CHANGELOG.md
public/
docs/ARCHITECTURE.md
docs/PROGRAM_PLAN.md
docs/ROADMAP.md
docs/SPRINTS.md
docs/SSOT.md
docs/TIMELINE_VISION.md
docs/governance/
docs/legal/
docs/deployment/
docs/validation/
robots.txt
sitemap.xml
docs/adr/
tools/public-repo-manifest.txt
tools/prepare-hosting-upload.ps1
tools/prepare-public.ps1
tools/verify-public.ps1
tools/smoke-public.ps1
tools/smoke-deployed-compare.ps1
tools/smoke-browser.ps1
tools/smoke-browser.js
tools/domain-diagnostics.js
tools/release-readiness.js
tools/prepare-public-repo.ps1
tools/verify-public-repo.ps1
tools/validate-data-contract.ps1
tools/validate-data-contract.js
tools/validate-map-model.ps1
tools/validate-map-model.js
tools/validate-previsit-workflow.ps1
tools/validate-previsit-workflow.js
tools/validate-caregiver-scope.ps1
tools/validate-caregiver-scope.js
tools/validate-consent-draft.ps1
tools/validate-consent-draft.js
tools/validate-a11y.ps1
tools/validate-a11y.js
tools/validate-validation-pack.ps1
tools/validate-validation-pack.js
tools/validate-pre-show.ps1
tools/validate-go-live.ps1
tools/verify-contact-gate.ps1
tools/verify-deployed-site.ps1
tools/verify-release-artifacts.ps1
tools/write-release-manifest.ps1
tools/write-upload-manifest.ps1
fixtures/patient-map-model.snapshot.json
fixtures/patient-map-model-edgecases.json
fixtures/previsit-workflow-edgecases.json
fixtures/caregiver-scope-edgecases.json
fixtures/consent-draft-edgecases.json
schema/patient360.schema.json
```

Poza allowlista do osobnej decyzji: robocze dokumenty AI, prywatne handovery, lokalne zrzuty, katalogi builda oraz dokumenty z osobistym lub roboczym kontekstem.

### D-003: paczka publikacyjna

Decyzja: `dist/public` jest kanoniczna paczka builda publikacyjnego, a `dist/upload-ready` jest kanonicznym katalogiem do wgrania na hosting.

Root workspace jest srodowiskiem roboczym. Hosting nie powinien wskazywac na root projektu ani na `dist` jako calosc.

### D-004: pierwsi reviewerzy

Kolejnosc:

1. safety/privacy/security review dla publikacji,
2. technical reviewer dla clean package i repo,
3. lekarz POZ dla raportu 90 sekund,
4. pacjent/opiekun dla zrozumialosci workflow,
5. prawnik/regulatory reviewer przed szerszym publicznym uzyciem lub partnerstwem.

### D-005: najblizszy sprint

Decyzja historyczna: pierwszym sprintem po planie byl repo/go-live hardening.

Data Contract v0.1 zaczyna sie zaraz po M0, ale nie wyprzedza:

- odswiezenia `dist/public`,
- smoke testu,
- aliasow kontaktowych,
- public repo allowlist,
- decyzji o roboczych dokumentach AI.

Status 2026-06-08: M0 i M2 sa wykonane lokalnie jako powtarzalny vertical slice. M3 ma pierwszy vertical slice: czysty model mapy, renderer przepiety na model i walidator. Otwarty gate pozostaje poza kodem: aliasy kontaktowe i decyzja public repo.

### D-006: context tool vs CDSS/MDR

Decyzja domyslna: Pacjent360™ pozostaje narzedziem kontekstu, zrodel, pytan i zadan organizacyjnych.

Formalna decyzja o potencjalnym wejsciu w CDSS/MDR moze zapasc dopiero na M12 albo pozniej, po walidacji, review prawnym/regulacyjnym i osobnym ADR. Do tego czasu kazda funkcja, ktora sugeruje diagnoze, pilnosc, terapie, ranking ryzyka albo decyzje kliniczna, jest no-go.

### D-007: relacja M0-M12 do wczesniejszych faz roboczych

Decyzja: M0-M12 nie kasuje wczesniejszych faz roboczych, ale je obejmuje i porzadkuje. FAZY/CKP/MOB/NAT nie sa drugim harmonogramem. Sa backlogiem wykonawczym, lista historycznych ustalen i zbiorem taskow, ktore trzeba mapowac do aktualnego milestone'u programu.

Praktyczna zasada:

- planujemy wedlug M0-M12,
- wybieramy zadania z FAZ/CKP tylko wtedy, gdy wspieraja aktualny milestone,
- przy konflikcie kolejnosci wygrywa `PROGRAM_PLAN.md`,
- przy konflikcie safety wygrywaja `SSOT.md`, `DISCLAIMER.md`, `SECURITY.md` i `RISKS.md`.

### D-008: zrodlo zgody w Data Contract

Decyzja: zgoda jest osobnym typem zrodla `consent` w Data Contract v0.1.

Praktyczna zasada:

- `sources[]` zawiera `consent:{id}` dla kazdej zgody,
- `consentScopes[].sourceRefs` zawiera `consent:{id}` oraz kontekstowe zrodla udostepnienia, np. `doc:*`, `interview:*`, `report:*`, `medication:*`, `decision:*`,
- `consent:{id}` nie oznacza realnego podpisu kwalifikowanego ani integracji z systemem publicznym; w MVP to lokalny artefakt zakresu dostepu,
- nowe zgody z formularza musza miec self-reference `consent:{id}` i przechodzic `tools/validate-consent-draft.ps1`.

### D-009: contact gate przed go-live i prywatna obsluga zgloszen

Decyzja: DNS/MX nie wystarcza do odblokowania publikacji.

Praktyczna zasada:

- `tools/verify-contact-gate.ps1 -DnsOnly` sprawdza tylko techniczny precheck poczty domeny,
- pelny gate wymaga recznego testu wysylka-odbior-odpowiedz dla `security@pacjent360.com.pl` i `kontakt@pacjent360.com.pl`,
- po recznym tescie uruchamiamy `tools/verify-contact-gate.ps1 -ReceiptConfirmed -MonitorOwner "..."`,
- wynik trzeba zapisac w `docs/deployment/GO_LIVE_CHECKLIST.md` albo prywatnym handoverze,
- bez tego produkcyjny go-live domeny i prywatna obsluga zgloszen pozostaja no-go.

### D-010: post-deploy verifier domeny

Decyzja: po uploadzie `dist/upload-ready` na hosting trzeba sprawdzic realna domenę osobnym verifierem.

Praktyczna zasada:

- `tools/verify-deployed-site.ps1 -BaseUrl "https://pacjent360.com.pl"` sprawdza opublikowana strone, demo, disclaimer, privacy, maintenance, asset hero, skrypty modeli, safety markers i blokade prywatnych plikow,
- verifier domeny nie zastępuje finalnego human review ani contact gate,
- dla lokalnego testu mozna uzyc `-AllowHttp`, np. na `http://127.0.0.1:4173`.

### D-011: release manifest dla artefaktow publikacyjnych

Decyzja: kazdy lokalny release candidate powinien miec zapisane hashe i rozmiary paczek.

Praktyczna zasada:

- `tools/validate-go-live.ps1` uruchamia `tools/write-release-manifest.ps1` po zbudowaniu `dist/public` i `dist/repo`,
- `tools/prepare-public.ps1 -Zip` tworzy `dist/pacjent360-public.zip` oraz czytelny alias `dist/pacjent360-upload-root.zip` do rozpakowania bezposrednio w document root domeny,
- `tools/verify-release-artifacts.ps1` sprawdza ZIP-y, `.sha256`, manifest, wymagane pliki, brak prywatnych materiałów, zgodność z katalogami `dist/public` oraz `dist/repo`, a także rozpakowany hosting ZIP jako symulację uploadu,
- `tools/validate-go-live.ps1` przygotowuje `dist/upload-ready`, uruchamia `tools/smoke-public.ps1 -PackageDir "dist/upload-ready" -Port 4194`, a potem `tools/smoke-deployed-compare.ps1`, zeby sprawdzic dokladnie katalog przeznaczony do wgrania oraz sciezke post-deploy compare,
- `tools/write-upload-manifest.ps1` zapisuje `dist/upload-ready-manifest.json` z SHA256 kazdego pliku przeznaczonego do uploadu, `dist/document-root-checklist.txt` z krotka lista plikow dla operatora oraz `dist/deployment-handoff.txt` z hashami, lista plikow i komendami po uploadzie,
- `tools/validate-go-live.ps1` uruchamia `node tools/release-readiness.js -ReportPath "dist/go-live-status.txt"` po wygenerowaniu handoffu, zeby zapisac aktualny raport `GO/NO-GO`,
- `tools/domain-diagnostics.js` pomaga po nieudanym verifierze domeny rozroznic brak uploadu, zly document root, problem `www`, HTTP/HTTPS albo placeholder hostingu,
- `tools/verify-deployed-site.ps1` i `tools/domain-diagnostics.js` traktuja publicznie zostawione ZIP-y, `.sha256`, manifesty, checklisty, handoff i raporty statusu/diagnostyki jako blad publikacji; po rozpakowaniu upload-root ZIP trzeba usunac z document root,
- `dist/release-manifest.json` zawiera SHA256, rozmiar, sciezki i zewnetrzne bramki,
- pliki `dist/pacjent360-public.zip.sha256` i `dist/pacjent360-public-repo.zip.sha256` pomagaja potwierdzic, ktory artefakt zostal wrzucony na hosting albo do repo,
- manifest release nie trafia domyslnie do public repo; jest dowodem lokalnym dla autora/reviewera.

### D-012: historyczne prompty i prywatne backlogi AI

Decyzja: historyczne prompty i prywatne backlogi AI sa materialami historycznymi oraz backlogiem pomocniczym, nie aktywnym harmonogramem programu.

Praktyczna zasada:

- nie uruchamiamy historycznych master promptow jako "wykonaj wszystko" bez decyzji autora,
- zadania z prywatnych backlogow AI mozna wykonywac tylko po mapowaniu do aktualnego milestone M0-M12,
- jesli stary prompt koliduje z `PROGRAM_PLAN.md`, wygrywa `PROGRAM_PLAN.md`,
- jesli stary prompt koliduje z safety/privacy/security, wygrywaja `SSOT.md`, `DISCLAIMER.md`, `SECURITY.md` i `RISKS.md`.

## Materialy zewnetrzne GPT - status adopcji 2026-06-10

Autor dostarczyl prywatne materialy koncepcyjne z rozmow z GPT PRO: notatki, paczki plikow, warianty stron WWW i master prompty wykonawcze. Decyzja autora: materialy GPT sa wylacznie ideami; kierunek okresla ten plan. Master prompty z prywatnego katalogu koncepcyjnego nie sa harmonogramem i nie wolno ich wykonywac wprost.

### Przyjete (zmapowane do planu)

- `PRODUCT_SSOT.md` + hierarchia dokumentow -> wykonane, ADR 0005.
- Rozdzial krag opieki (ludzie) vs agenci operacyjni (funkcje) -> M13.
- Definition of Harm (H-001..H-010) + Safety Case -> M14.
- `evidenceClass` (dokument vs relacja pacjenta vs obserwacja opiekuna) -> M13/M14, kontrakt danych.
- Zasada traceability strona<->repo -> `PRODUCT_SSOT.md` sekcja 7, obowiazuje od zaraz.
- Wedge A+B (rodzic/opiekun przygotowuje wizyte + lekarz 90 sekund) -> `docs/product/FIRST_WEDGE.md`, zatwierdzony przez autora 2026-06-10.
- Design story-website jako baza nowej strony publicznej -> po operacji tresci (bez roadmapy krajowej i budzetow).

### Odroczone (dobre, ale po walidacji M5/M6)

- Wersjonowanie raportow (`ReportVersion`) -> kandydat M15 po M5.
- Macierz authority dziecko/rodzic/opiekun prawny jako KOD -> po decyzji wedge w pilocie; jako DOKUMENT czesc M13.
- Threat model prompt injection -> wlaczyc do istniejacego M9 Agent Safety A0, nie dublowac.
- Polityka retencji/usuwania danych -> dokument przed jakimikolwiek realnymi danymi; MVP ich nie ma.

### Odrzucone jako plan (zostaja prywatna referencja)

- Program Foundation Pack (fazy P0-P5, 14 rol, budzety 1,5-4 mln PLN na 90 dni, 400 mln-1,2 mld PLN rollout) - scenariusz finansowania, nie plan pracy jednoosobowego projektu alpha.
- Architektura komorkowa 38M, Temporal/LangGraph, SLO/observability, model organizacji, kodowanie ICD/SNOMED/LOINC, break-glass - horyzont po walidacji i po decyzji M12.
- Systemy milestone'ow z paczek (M00-M12 v2, workstreamy v1, PR-001..005 v5) - kolizja numeracji z tym planem; tresc czerpiemy wybiorczo, numeracji nie importujemy.

## Najblizszy rekomendowany krok

Zatwierdzony plan biezacy (2026-06-10): FAZA A higiena repo (wykonana: git podpiety do origin/main, .gitignore chroni materialy robocze) -> FAZA B konsolidacja planu (ten dokument, PRODUCT_SSOT, wedge) -> FAZA C nowa strona publiczna na bazie story-website po operacji tresci + restyle demo + rebuild paczki -> FAZA D poprawki produktowe (slownictwo kregu opieki, DoH, Safety Case, evidenceClass).

Rownolegle, poza kodem (wylacznie autor):

1. skonfigurowac i recznie przetestowac aliasy `security@pacjent360.com.pl` oraz `kontakt@pacjent360.com.pl`,
2. uruchomic `tools/verify-contact-gate.ps1 -ReceiptConfirmed -MonitorOwner "..."`,
3. wgrac `dist/upload-ready` (po rebuildzie z FAZY C) do document root domeny,
4. uruchomic `tools/verify-deployed-site.ps1` i `node tools/release-readiness.js`,
5. finalny human review na domenie.

Contact gate pozostaje bramka dla produkcyjnego go-live, ale nie blokuje lokalnego hardeningu produktu.
