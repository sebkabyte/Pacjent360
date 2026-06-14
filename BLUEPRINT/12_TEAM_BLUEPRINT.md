# Team Blueprint

## Cel dokumentu

Określić, kogo naprawdę potrzeba w zespole Pacjent360 na kolejnych etapach.

## Teraz

| Rola | Po co jest | Pierwsze 30 dni | Metryka sukcesu | Ryzyko złego dopasowania |
|---|---|---|---|---|
| Founder / product lead | decyzje, narracja, priorytety | 10 rozmów, SSOT, partnerzy | jasny next move co tydzień | rozpraszanie się wizją |
| UX/UI reviewer | prostota strony i demo | test 10 sekund, ścieżki demo | użytkownik rozumie bez tłumaczenia | zbyt dekoracyjny design |
| Medical advisor | bezpieczeństwo języka | review briefu i pytań | 0 diagnoza/triage claim | próba budowania CDSS za wcześnie |
| Privacy/legal reviewer | zgody i dane | review privacy, consent, copy | brak no-go prawnych | blokowanie bez rozwiązań |
| Security reviewer | hosting, repo, CSP, upload | review publikacji | brak P0 publikacyjnych | security theatre |

## 0-3 miesiące

| Rola | Zadania | Pierwsze 90 dni |
|---|---|---|
| CTO / architect | kontrola kontraktów, plan techniczny | ocenić app.js, data contracts, backend-readiness |
| Frontend lead | uproszczenie demo i UI | ścieżka role -> pacjent -> historia -> raport |
| Validation researcher | rozmowy i wyniki | 6-20 sesji walidacyjnych |
| Growth / GTM | rozmowy z partnerami | 3 rozmowy pilotażowe |
| Clinical safety reviewer | DoH i wording | safety review strony/demo |

## 3-9 miesięcy

| Rola | Zadania | Metryka |
|---|---|---|
| Backend engineer | backend-ready prototype po decyzji | bezpieczny auth/consent/audit draft |
| Product designer | aplikacja pacjenta/opiekuna | ukończenie flow przygotowania wizyty |
| Data/privacy engineer | retention, export, audit | privacy-by-design review |
| Pilot PM | prowadzenie partnera | pilot bez chaosu operacyjnego |
| Medical board | review klinicznych granic | brak driftu w CDSS |

## 9-18 miesięcy

| Rola | Zadania |
|---|---|
| Head of Product | roadmapa i discovery |
| Head of Engineering | skala i jakość techniczna |
| Security / compliance lead | audyty i procesy |
| Partnerships lead | placówki, fundacje, partnerzy |
| Clinical operations lead | jeśli powstaje model poradni online |

## Role bazowe

### Founder / product lead

- Zadania: decyzje, priorytety, komunikacja, walidacja.
- 30 dni: uporządkować blueprint i rozmowy.
- 90 dni: dowód wartości albo pivot.
- Ryzyko: próba zrobienia wszystkiego naraz.

### CTO / architect

- Zadania: architektura, kontrakty, jakość repo.
- 30 dni: audit monolitu i granic danych.
- 90 dni: plan controlled rebuild.
- Ryzyko: budowa backendu za wcześnie.

### Frontend lead

- Zadania: demo, UI, testy klików.
- 30 dni: uprościć ścieżkę demo.
- 90 dni: modularny UI bez regresji.
- Ryzyko: efekt wizualny kosztem jasności.

### UX/UI designer

- Zadania: strona, aplikacja, historia pacjenta.
- 30 dni: test 10 sekund i pierwszego kliknięcia.
- 90 dni: spójny design system.
- Ryzyko: “ładne”, ale niezrozumiałe.

### Medical advisor

- Zadania: sens workflow i język kliniczny.
- 30 dni: review briefu.
- 90 dni: udział w walidacji.
- Ryzyko: przesunięcie w rekomendacje kliniczne.

### Clinical safety reviewer

- Zadania: DoH, safety gates, harm review.
- 30 dni: review strony/demo.
- 90 dni: safety case dla MVP.
- Ryzyko: brak jasnych no-go.

### Privacy / legal

- Zadania: zgody, RODO, disclaimery.
- 30 dni: review public alpha.
- 90 dni: model pilotu.
- Ryzyko: niedoszacowanie realnych danych.

### Security reviewer

- Zadania: hosting, repo, headers, upload, incident.
- 30 dni: security checklist.
- 90 dni: pilot threat model.
- Ryzyko: checklisty bez realnych testów.

### Growth / GTM

- Zadania: rozmowy, partnerzy, inwestorzy.
- 30 dni: 10 rozmów.
- 90 dni: 3 partnerzy pilotażowi.
- Ryzyko: sprzedaż claimów przed dowodem.

### Validation researcher

- Zadania: protokoły, wywiady, metryki.
- 30 dni: plan i rekrutacja.
- 90 dni: raport walidacyjny.
- Ryzyko: feedback anegdotyczny bez metryk.

### Operations / PMO

- Zadania: rytm, decyzje, backlog.
- 30 dni: cadence.
- 90 dni: milestone review.
- Ryzyko: biurokracja bez decyzji.

## DoD

- Wiadomo, kto jest potrzebny teraz, a kto później.
- Każda rola ma zadania i metrykę.
- Zespół nie buduje skali przed walidacją.

## DoE

- Role są powiązane z milestone’ami.
- Pierwsze rekrutacje dotyczą safety, UX, validation i tech foundations.
- Nie ma mieszania lekarzy-reviewerów z agentami AI.

## FoR

Review zespołu ma sprawdzać, czy dana osoba redukuje największe ryzyko obecnego etapu.
