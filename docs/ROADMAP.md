# Roadmapa Pacjent 360

Status: kierunek rozwoju eksperymentalnego dla Pacjent 360.

Nadrzedny plan programu po audycie repo i council: `PROGRAM_PLAN.md`.

FAZY 0-4, CKP/MOB/NAT i sprinty asystentow opisane nizej sa teraz szczegolowym backlogiem wykonawczym mapowanym do M0-M12 z `PROGRAM_PLAN.md`. Nie stanowia rownoleglego harmonogramu. Status 2026-06-08: M0 Publication Ready i M2 Data Contract v0.1 sa wykonane lokalnie jako powtarzalny vertical slice. Publiczne repo alpha jest otwarte z czystej allowlisty; produkcyjny go-live domeny i prywatna obsluga zgloszen nadal czekaja na potwierdzone aliasy kontaktowe.

Normatywne zrodlo: `SSOT.md`. Obowiazuja tez `docs/legal/DISCLAIMER.md`, `SECURITY.md`, `docs/deployment/GO_LIVE_CHECKLIST.md`, `docs/governance/RISKS.md` i `SPRINTS.md`.
Analiza luk kokpitow: `docs/COCKPIT_GAP_ANALYSIS.md`.

Asystenci LLM w tym projekcie sa narzedziami operacyjnymi. Ich zadaniem jest porzadkowanie kontekstu, wskazywanie brakow, pilnowanie zrodel, przygotowanie checklist i tworzenie draftow do weryfikacji. Nie diagnozuja, nie triazuja, nie rekomenduja terapii i nie pracuja na realnych danych pacjentow.

## Teraz

**Najwyzszy priorytet: M3 Patient Map Core, bez szerokich nowych funkcji.**

M0 i M2 sa lokalnie zamkniete. Najblizszy techniczny krok to wydzielenie czystego modelu Mapy Pacjenta 360, z zachowaniem obecnego UI i bez zmiany eksportu poza testami regresji.

- Status FAZA 0: wykonane kierunkowo, utrzymac jako safety gate przy kazdej publikacji.
- Status FAZA 1: wykonane kierunkowo w sprincie nocnym, teraz `done / needs QA / needs hardening`.
- Status M0: `done locally / go-live gated` przez aliasy kontaktowe.
- Status M2: `done vertical slice` przez `patient360-contract.js`, schema, walidator i ADR.
- Status M3: `done vertical slice + snapshot / needs further hardening`.
- Status M4: `vertical slice + model` przez flow "Przygotowanie krok po kroku", `patient360-previsit-model.js`, fixture no-data i walidator M4.
- Utrzymac twarda granice DITL: Pacjent 360 to prototyp kontekstowy, nie system kliniczny.

## Nastepne 2 tygodnie

- Status FAZA 2: wykonane kierunkowo w sprincie nocnym, teraz QA, hardening i dopasowanie do modelu Mapy Pacjenta 360.
- **Mobile-first CSS** dla kokpitow pacjenta i opiekuna — utrzymac, testowac i poprawiac regresje.
- Wzbogacic dane demo: 3+ punktow na obserwacje (sparkline), Pacjent B z wywiadami i zgodami.
- Usunac dead code: stare `renderReports()` + `renderOnePager()`.
- Filtrowanie po trackach na osi czasu + ukrywanie pustych trackow.
- M3 hardening: ograniczenie duplikacji helperow w `app.js`, source coverage, neutralne relacje, statusy `planowane` i `virtual`; snapshot i edge-case fixtures sa juz aktywna bramka regresji.
- M4 hardening: wariant opiekuna i dalszy test, ze flow przed wizyta nie brzmi jak zalecenie kliniczne; no-data fixture i walidator M4 sa juz aktywne.

## 6 tygodni

- FAZA 3 (Kokpity C): nowe perspektywy — kokpit opiekuna (`renderCaregiverPortal`), model `CaregiverScope`, widok „Co ustalono po wizycie" (`PostVisitSummary`), wariant osi czasu per persona.
- Nowa narracja WWW: hero, 5 sekcji, screenshot demo.
- Sprint A0 Safety & Contracts dla agentow LLM: kontrakty, walidator, fixtures, ryzyka.
- Zdefiniowac kontrakty outputow dla agentow: zrodlo, status DITL, `source_missing`, typ outputu, walidacja safety.
- Zbudowac syntetyczne fixtures do testowania LLM bez realnych danych.

## Pozniej

- FAZA 4 (Kokpity D): polish — prosty jezyk wynikow, czytelne nazwy zrodel, semantyczny above/below, powiazania sourceRef.
- **PWA**: manifest.json, service worker, ikony, instalacja z przegladarki, offline mode (cache kokpitow pacjenta i opiekuna read-only).
- Sprint A1-A2: Manual Agent Dry-Run UI + DataQualityAgent + SourceGroundingAgent.
- Sprint A3-A6: VisitChecklistAgent, DITLQuestionAgent, ConsentGuard, MedicationSupport, ReportDrafting.
- Sprint A7-A8: After Visit Loop agents, Logistyka.
- Rozszerzyc biblioteke syntetycznych przypadkow i testow regresji.
- Rozwazac lokalne lub prywatne uruchamianie modeli dopiero po audycie prywatnosci i bezpieczenstwa.
- Rozwazac integracje z oficjalnymi standardami danych dopiero po stabilizacji kontraktow i walidacji safety.
- Rozwazac oficjalna integracje z IKP/P1/e-Profilem Pacjenta tylko legalna sciezka, bez scrapingu i bez przechowywania loginow.
- Rozwazac szersze testy z lekarzami, pacjentami i opiekunami, nadal bez realnych danych medycznych w publicznym prototypie.
- Rozwazac mechanizmy audytu promptow, wersjonowania agentow i porownywania outputow miedzy modelami.
- **Natywna aplikacja mobilna** (React Native / Flutter) dopiero po walidacji PWA i product-market fit. Decyzja o publikacji w Google Play / App Store wymaga osobnej bramki (store review, privacy policy mobilna, biometria).

## Nie robimy

- Nie diagnozujemy.
- Nie robimy triage.
- Nie rekomendujemy terapii.
- Nie oceniamy pilnosci medycznej.
- Nie podpowiadamy zmiany leczenia, dawki, odstawienia ani zamiany leku.
- Nie interpretujemy wynikow jako prawidlowe, nieprawidlowe, alarmowe, w normie lub poza norma.
- Nie przyjmujemy realnych danych pacjentow w demo, dry-runach, promptach, fixtures ani walidacji publicznej.
- Nie wysylamy danych pacjenta do zewnetrznego LLM.
- Nie scrapujemy IKP/P1 i nie przechowujemy loginow.
- Nie udajemy CeZ, NFZ, IKP, P1 ani e-Profilu Pacjenta.
- Nie pokazujemy opiekunowi danych poza zakresem zgody pacjenta.
- Nie publikujemy funkcji LLM bez clinical safety gate, privacy/security review i testow zakazanych outputow.
- Nie streszczamy realnych nagran ani transkrypcji wizyt bez zgody, retencji, mozliwosci usuniecia i review privacy/security.
- Nie wykonujemy autonomicznego bookingu wizyty, zakupu leku ani kontaktu z placowka w MVP.
