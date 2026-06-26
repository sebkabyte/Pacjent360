# Sprinty LLM i asystentow operacyjnych

Status: plan wdrozenia funkcji eksperymentalnych w prototypie Pacjent360™. **[AUDYT 26.06.2026]** Sprint A0 byl oznaczony jako nieukonczony po audycie zewnetrznym. **[AKTUALIZACJA 26.06.2026]** brakujace artefakty techniczne A0 zostaly domkniete lokalnie: `public/patient360-agent-policy.js`, `fixtures/a0-agent-policy-edgecases.json`, `tools/validate-a0-agent-policy.ps1`. Decyzja A0: `continue_with_conditions` - wolno przejsc do planowania A1, ale A1-A8 pozostaja zablokowane do osobnego uruchomienia sprintu i review human safety/privacy/security.

Normatywne zrodlo: `SSOT.md`. Obowiazuja tez `docs/legal/DISCLAIMER.md`, `SECURITY.md`, `docs/deployment/GO_LIVE_CHECKLIST.md`, `docs/governance/RISKS.md` i `CONTRIBUTING.md`.

Ten plan dotyczy wylacznie asystentow operacyjnych. Asystenci moga porzadkowac kontekst, wskazywac braki, przygotowywac pytania DITL i tworzyc wersje robocze raportow. Nie diagnozuja, nie triazuja, nie rekomenduja terapii, nie oceniaja pilnosci i nie przyjmuja realnych danych pacjentow.

## Zasady stale

- Tylko dane fikcyjne, kompozytowe albo syntetyczne.
- Kazdy output LLM ma byc oznaczony jako draft, pytanie, brak danych, zadanie albo status do weryfikacji.
- Kazdy output musi miec zrodlo albo kanoniczny status `source_missing` (label UI: `brak zrodla`).
- Kazdy output klinicznie istotny musi miec status DITL: do potwierdzenia przez lekarza lub innego uprawnionego profesjonaliste.
- Zakazane etykiety i komunikaty: diagnoza, zalecenie leczenia, terapia, pilne, natychmiast, triage, decyzja kliniczna, w normie, poza norma.
- Zadna integracja z zewnetrznym LLM nie moze wysylac realnych danych pacjentow.
- No-go dla calego programu: jakikolwiek output moze zostac rozsadnie odczytany jako diagnoza, triage, rekomendacja terapii albo instrukcja kliniczna.

## Klasyfikacja agentow

Klasyfikacja agentow jest normatywnie opisana w `SSOT.md`.

| Agent / modul | Klasa | Uwagi wdrozeniowe |
| --- | --- | --- |
| `DataQualityAgent` | `safe` | Braki, duplikaty, niespojne daty, statusy i source coverage. |
| `SourceGroundingAgent` | `safe` | Mapowanie twierdzen do zrodel albo `source_missing`; brak dopowiadania faktow. |
| `DemoSafetyLintAgent` | `safe` | Lint jezyka demo, disclaimery, blokady zakazanych outputow. |
| `ConsentGuardAgent` | `safe` | Bramka zgody i widocznosci; nie streszcza danych poza zakresem zgody. |
| `VisitChecklistAgent` | `caution` | Checklisty i pytania do rozmowy; bez oceny pilnosci i bez odpowiedzi klinicznej. |
| `DITLQuestionAgent` | `caution` | Neutralne pytania DITL; bez sugestii rozpoznania lub dzialania. |
| `MedicationSupportAgent` | `caution` | Dry-run operacyjny; nie dobiera dawki, nie zmienia terapii, nie ocenia interakcji klinicznie. |
| `ReportDraftingAgent` | `caution` | Draft raportu kontekstowego z pelnym source grounding i review. |
| `VisitPlainLanguageAgent` | `caution` | Prosty draft podsumowania po wizycie; bez interpretacji klinicznej i bez zmiany sensu wypowiedzi. |
| `PostVisitTaskRouter` | `caution` | Zadania organizacyjne po wizycie; bez autonomicznego bookingu, zakupu lub decyzji medycznej. |
| `MedicationAccessAgent` | `caution` | Logistyka realizacji recepty; bez wyboru zamiennika, dawki lub terapii. |
| `CareNavigationAgent` | `caution` | Nawigacja po placowkach i terminach; bez oceny pilnosci i bez decyzji o specjalizacji. |
| Diagnoza, triage, terapia, scoring ryzyka, dawkowanie | `forbidden` | No-go bez zmiany intended purpose i pelnej walidacji klinicznej/regulacyjnej. |

## Aktywny backlog wdrozenia

Wdrozenie jest aktywowane od Sprint A0. Aktywny jest tylko zakres A0; A1-A8 sa zablokowane do czasu zamkniecia A0 i review safety/privacy/security.

| ID | Sprint | Zadanie | Status | Zaleznosc | Kryterium zamkniecia |
| --- | --- | --- | --- | --- | --- |
| A0-01 | A0 | Ujednolicic kontrakty outputow oraz modele After Visit Loop | done | `SSOT.md`, `ARCHITECTURE.md` | Kontrakty ujednolicone i walidowalne: `Encounter`, `VisitArtifact`, `VisitSummary`, `PostVisitPlan`, `CareTask` w `public/patient360-agent-policy.js` + fixture A0. |
| A0-02 | A0 | Przygotowac prototyp `AgentPolicy` dla agentow `safe` i `caution` | done | A0-01 | Kazdy agent A0 ma `allowedOutputs`, komplet `forbiddenOutputs`, klase `safe/caution`, consent scopes i reguly walidatora. |
| A0-03 | A0 | Zaprojektowac walidator zakazanych outputow i slow klinicznych | done | A0-01 | Testy negatywne blokuja diagnoze, triage, pilnosc, terapie. |
| A0-04 | A0 | Zbudowac syntetyczne fixtures demo dla pacjenta, opiekuna, lekarza, dokumentu, lekow i transkrypcji wizyty | done | brak | Zero realnych danych i zero historii prywatnych. |
| A0-05 | A0 | Dopisac ryzyka LLM do `RISKS.md` i procedury review do `SECURITY.md` | done | `SSOT.md` | Risk register zawiera halucynacje, leakage, prompt injection i ton autorytatywny. |
| A0-06 | A0 | Zrobic go/no-go review A0 przed jakimkolwiek UI dry-run | done_with_conditions | A0-01..A0-05 | Decyzja: `continue_with_conditions`; brak UI dry-run w A0, A1 wymaga osobnego kickoffu i review human safety/privacy/security. |
| A1-01 | A1-Core | Pulpit Bezpiecznego Podgladu Pacjenta + Source Grounding | done | A0 complete | `public/patient360-a1-core.js`, `tools/validate-a1-core-dashboard.ps1`; projekcje read-only, source grounded. |
| A3-A5-01 | A3+A5 | Data Quality + neutralne pytania DITL | done | A1-Core complete | `public/patient360-a3-a5-quality.js`, `tools/validate-a3-a5-quality.ps1`; luki danych jako pytania, bez wagi klinicznej. |
| A4-01 | A4 | Consent Guard / Zero-Knowledge UI | done | A3+A5 complete | `public/patient360-a4-consent-guard.js`, `tools/validate-a4-consent-guard.ps1`; fail-safe `requiredArea`, orphan cleanup, brak licznikow ukrycia. |
| A6-01 | A6 | Visit Checklist / Pre-Visit One-Pager | done | A1-Core + A3+A5 + A4 complete | `public/patient360-a6-checklist.js`, `tools/validate-a6-checklist.ps1`; operacyjna checklista "zabierz / zapytaj / potwierdz". |
| A7-01 | A7 | After Visit Loop: `VisitPlainLanguageAgent` + `PostVisitTaskRouter` | blocked | A6 complete | Podsumowanie prostym jezykiem i zadania po wizycie jako draft z review. |
| A8-01 | A8 | Logistyka po wizycie: `MedicationAccessAgent` + `CareNavigationAgent` | blocked | A7 complete | Tylko handoff organizacyjny, bez bookingu/zakupu bez czlowieka. |

## Sprint A0 Safety & Contracts

Klasa: fundament safety i kontraktow; bez uruchamiania agenta produktowego.

### Cel

Ustalic kontrakty, granice i slownictwo dla LLM/asystentow, zanim powstanie jakakolwiek funkcja produktowa.

### Zakres

- Definicja roli: asystenci operacyjni, nie kliniczni.
- Kontrakty danych dla wejsc i wyjsc agentow: `source_id`, `source_type`, `claim`, `confidence_label`, `ditl_status`, `source_status`, `user_visible_label`; `source_status` uzywa kanonicznej wartosci `source_missing`, gdy nie ma zrodla.
- Kontrakty After Visit Loop: `Encounter`, `VisitArtifact`, `VisitSummary`, `PostVisitPlan`, `CareTask`.
- Lista dozwolonych typow outputu: pytanie DITL, brak danych, rozbieznosc, zadanie przygotowawcze, draft raportu.
- Lista zabronionych typow outputu: diagnoza, terapia, triage, ocena pilnosci, interpretacja wyniku jako norma/patologia.
- Minimalny prompt safety i reguly walidacji odpowiedzi.
- Fixtures syntetyczne do testow: pacjent demo, opiekun demo, lekarz demo, dokument demo, lista lekow demo, transkrypcja wizyty demo.
- Rejestr ryzyk LLM: halucynacje, nadinterpretacja, brak zrodel, ton autorytatywny, leakage danych, prompt injection.

### DoD

- Kontrakty wejsc/wyjsc sa opisane i mozliwe do walidacji automatycznej.
- Kazdy agent ma jawny intended use i forbidden use.
- Istnieje wspolny slownik etykiet UI dla outputow LLM.
- Istnieje minimalny zestaw syntetycznych danych testowych.
- Istnieje checklista review dla promptow, outputow i UI copy.

### Testy

- Testy kontraktowe JSON/schema dla kazdego typu outputu.
- Testy negatywne dla slow i fraz zabronionych.
- Testy prompt-injection na syntetycznych dokumentach.
- Snapshoty outputow z fixtures demo.
- Manual review 10 przykladow przez osobe produktowa i clinical safety reviewer.

### Clinical Safety Gate

Przejscie dalej tylko jesli kazdy output jest opisany jako kontekst operacyjny, pytanie albo draft do weryfikacji. Bramka blokuje sprint, jezeli model moze wydac komunikat sugerujacy diagnoze, pilnosc, leczenie albo zastapienie lekarza.

### No-Go

- Brak wymaganego zrodla lub statusu `source_missing`.
- Output bez statusu DITL.
- Jakikolwiek prompt lub etykieta UI sugeruje decyzje kliniczna.
- Testy wykrywaja diagnoze, triage, terapie albo ocene pilnosci.
- Do testow trafiaja realne dane pacjentow.

### A0 Go/No-Go Review 2026-06-26

Decyzja: `continue_with_conditions`.

Dowody techniczne:

- `public/patient360-agent-policy.js` - walidowalny kontrakt A0 dla `AgentPolicy` oraz modeli `Encounter`, `VisitArtifact`, `VisitSummary`, `PostVisitPlan`, `CareTask`.
- `fixtures/a0-agent-policy-edgecases.json` - syntetyczny fixture pokrywajacy wszystkie agenty A0: safe i caution.
- `tools/validate-a0-agent-policy.ps1` - walidator pozytywny i negatywny: komplet polityk, forbidden outputs, source refs, DITL status i blokada zakazanego jezyka.
- `tools/validate-go-live.ps1` uruchamia walidator A0 przed `SH-0 cross-contract validation`.

Warunki przejscia dalej:

- A1 moze byc planowany jako osobny sprint, ale nie jest automatycznie odblokowany przez sam wpis w backlogu.
- Jakikolwiek UI dry-run wymaga zachowania dry-run only, danych fikcyjnych, braku zapisu produkcyjnego i osobnego review human safety/privacy/security.
- Brak runtime LLM i brak danych realnych pacjentow do czasu osobnej decyzji.

### A1 Kickoff Intake 2026-06-26

Status: `pending_kickoff`, nie aktywacja sprintu.

Po zewnetrznym przegladzie UX/red-team powstal oczyszczony pakiet wejscia do A1:

- `docs/product/A1_SAFE_DRAFT_DASHBOARD_BRIEF.md` - brief Safe Draft Dashboard podporzadkowany `SSOT.md` i zasadom A0.
- `fixtures/a1-safe-draft-dashboard.snapshot.json` - syntetyczny fixture pod przyszly pulpit A1.
- `tools/validate-a1-safe-draft-dashboard.ps1` - walidator blokujacy runtime LLM, zapis do profilu, brak zrodel, sortowanie po pilnosci i zakazane copy.
- Po przegladzie UX/safety Gemini doprecyzowano gate'y: brak nazw agentow w UI pacjenta, brak ikon ostrzegawczych/medycznych, brak progress barow oraz pytania/rozbieznosci tylko w inspektorze, nie jako fakty w glownym feedzie.

Ten pakiet nie odblokowuje A1-A8. A1 nadal wymaga osobnego kickoffu oraz review human safety/privacy/security przed jakimkolwiek UI dry-run.

### Strategic Roadmap Reframe 2026-06-26

Status: `strategic_guardrail`, nie aktywacja sprintu.

Po interdyscyplinarnym przegladzie strategicznym utrwalono warstwe decyzji
systemowych ponad A1-A8:

- `docs/product/PACJENT360_NORTH_STAR.md` - Pacjent360 jako sekretariat
  kontekstu, nie system decyzji medycznych.
- `docs/product/A1_A8_ROADMAP_REFRAME.md` - podzial na Phase 1 Context
  Secretariat oraz Phase 2 High-Risk Assistance.
- `docs/governance/SAFETY_GATE_MATRIX.md` - macierz bramek blokujaca m.in.
  duplikaty prawdy, leakage zgod, Phase 2 w Phase 1 i overclaim komercyjny.
- `fixtures/system-wide-red-team-cases.json` - syntetyczne przypadki red-team
  dla bramek systemowych.
- `tools/validate-safety-gate-matrix.ps1` - walidator uruchamiany w go-live
  validation.

Decyzja strategiczna:

- A1 i A2 powinny byc traktowane jako jeden tor `A1-Core`: bezpieczny dashboard
  ma sens dopiero z source groundingiem, a source grounding wymaga walidowalnego
  UI.
- A7 Plain Language oraz A8 booking/apteki/nawigacja pozostaja Phase 2
  High-Risk Assistance i sa zablokowane do osobnej decyzji privacy/legal/clinical
  safety/founder.
- `TimelineEvent`, wykres wyniku, karta dashboardu i raport sa projekcjami ze
  zrodel. Nie moga byc osobna prawda kliniczna.
- Komercjalizacja ma opierac sie na oszczednosci czasu i weryfikowalnosci
  zrodel, nie na automatycznej diagnozie lub rekomendacji.

Ten wpis nie odblokowuje A1-A8 i nie zmienia Data Contract v7. Dodaje bramke,
ktora ma zatrzymac niekontrolowane rozszerzenie zakresu przed UI lub runtime.

## Sprint A1 Pulpit Bezpiecznego Podgladu Pacjenta (Safe Draft Dashboard)

Klasa: infrastruktura safety zorientowana na pacjenta; kazdy agent musi byc oznaczony jako `safe`, `caution` albo `forbidden` zgodnie z `SSOT.md`.

### Cel

Zbudowac przyjazny dla pacjenta pulpit, na ktorym uzytkownik moze wybrac jeden z syntetycznych przypadkow testowych (fixtures) i zobaczyc, jak asystenci operacyjni wizualizuja bezpieczne wersje robocze (drafts), statusy DITL oraz zrodla danych, bez zapisywania zmian w profilu produkcyjnym.

### Zakres

- Panel wyboru syntetycznego pacjenta/przypadku testowego dla celow demonstracyjnych i walidacyjnych.
- Przyjazna dla pacjenta wizualizacja bezpiecznych statusow (`draft`, `do weryfikacji przez lekarza`, `brak zrodla`).
- Integracja z `AgentPolicy` (blokowanie wyswietlania niedozwolonych tresci, np. diagnoz, bezposrednio w interfejsie).
- Brak formularzy typu "developer console" – interfejs odzwierciedla realny wyglad aplikacji Pacjent360.
- Mozliwosc pobrania raportu z przeprowadzonego podgladu jako plik JSON do celow audytowych.

### DoD

- Pacjent testowy moze zaladowac fixture i przejrzec projekt interfejsu z bezpiecznymi oznaczeniami.
- Wszystkie teksty i etykiety sa sformulowane prostym jezykiem pacjenta (brak slownictwa technicznego w glownym widoku).
- Kazdy element pochodzacy z LLM ma jasne wizualne wyroznienie oraz link do dokumentu zrodlowego.
- Brak mutacji stanu glownego bazy danych lub localStorage.
- Walidator safety blokuje renderowanie jakichkolwiek fraz zakazanych.

### Testy

- Testy interfejsu (UI) pod katem przejrzystosci oznaczen bezpieczeństwa.
- Testy blokowania renderowania zakazanych fraz w UI (np. "diagnoza").
- Testy poprawnosci wyswietlania linkow do zrodel przy twierdzeniach.
- Scenariusz manualny: weryfikacja przez pacjenta i lekarza, czy prezentacja danych nie sugeruje decyzji klinicznych.

### Clinical Safety Gate

Pulpit musi jasno komunikowac pacjentowi, ze prezentowane dane maja charakter wylacznie pogladowy i pomocniczy. Kazdy widok draftu wymaga wyraznego naglowka "Wersja robocza asystenta".

### No-Go

- Interfejs pozwala na wprowadzanie rzeczywistych danych medycznych.
- UI wyglada jak narzedzie programistyczne (konsole, logi systemowe jako glowny element).
- Brak widocznych ostrzezen i statusow DITL przy generowanych elementach.

## Sprint A2 Pulpit Zgodnosci i Wiarygodnosci Danych (Data Integrity & Grounding UI)

Klasa: `safe` dla `DataQualityAgent` i `SourceGroundingAgent`.

### Cel

Umozliwic pacjentowi i opiekunowi pelne zrozumienie statusu ich danych: co jest potwierdzone dokumentem medycznym, czego brakuje (luki jakosciowe), a co wymaga wyjasnienia, z bezpośrednim linkowaniem do zrodel.

### Zakres

- Wdrozenie `DataQualityAgent`: analiza profilu pod katem brakow (np. brak dawkowania przy leku, niepelna data badania) i prezentacja tego pacjentowi jako "Zadania do uzupelnienia".
- Wdrozenie `SourceGroundingAgent`: kazdy fakt prezentowany w profilu pacjenta otrzymuje interaktywny znacznik zrodla (np. "Wypis ze szpitala z dnia X") lub status `source_missing` (czerwona flaga: "Brak oficjalnego dokumentu").
- Wykluczenie jakichkolwiek interpretacji klinicznych wynikow (np. agent nie moze stwierdzic, czy wynik TSH jest "dobry" czy "zly").

### DoD

- Pacjent widzi w swoim profilu czytelne podsumowanie jakosci danych: "Kompletne", "Wymaga uzupelnienia".
- Kazde twierdzenie w UI ma klikalny odnosnik do dokumentu zrodlowego ( groundingu).
- Brak generowania jakichkolwiek hipotez medycznych przy braku zrodel.
- 100% pokrycia twierdzen w syntetycznych fixtures.

### Testy

- Testy regresji na profilach z duplikatami i brakami w dokumentacji.
- Testy halucynacji: weryfikacja, ze agent zrodel nie dopisuje faktow nieobecnych w fixtures.
- Testy poprawnego linkowania elementu UI z plikiem fixture.

### Clinical Safety Gate

Agent jakosci danych moze wylacznie wskazywac braki formalne. Jesli sprobuje zinterpretowac brak jako zagrozenie zdrowotne (np. "brak dawki moze byc niebezpieczny"), Clinical Safety Gate blokuje wdrozenie.

### No-Go

- Sugerowanie interpretacji wynikow laboratoryjnych lub stanu klinicznego.
- Ukrywanie faktu, ze jakies twierdzenie nie posiada zrodla (brak oznaczenia `source_missing`).
- Wyswietlanie pacjentowi surowych logow JSON zamiast przyjaznych komunikatow.

## Sprint A3 Asystent Przygotowania Wizyty (Visit Preparation Checklist & Smart Questions)

Klasa: `caution` dla `VisitChecklistAgent` i `DITLQuestionAgent`.

### Cel

Wsparcie pacjenta w przygotowaniu sie do wizyty u lekarza poprzez wygenerowanie spersonalizowanej checklisty dokumentow/badan oraz neutralnych pytan ulatwiajacych dialog z lekarzem.

### Zakres

- `VisitChecklistAgent`: generowanie checklisty zadan (np. "Zabierz ze soba ostatnie badanie EKG", "Potwierdz liste przyjmowanych suplementow").
- `DITLQuestionAgent`: tworzenie listy neutralnych pytan do lekarza na podstawie niespojnosci wykrytych przez A2 (np. "Zapytaj o roznice w dawkowaniu leku X miedzy zaleceniem A a B").
- Filtrowanie pytan tak, aby nie sugerowaly one zadnej diagnozy ani terapii.

### DoD

- Checklista i pytania sa sformulowane jako material pomocniczy do rozmowy z lekarzem.
- UI umozliwia pacjentowi odznaczanie punktow na checkliscie oraz eksport pytan do pliku PDF/druku.
- Brak jakichkolwiek sugestii leczenia w tresci pytan.
- Pytania sa scisle powiazane z wykrytymi niespojnosciami danych.

### Testy

- Testy copy-editing: automatyczna weryfikacja pytan pod katem braku sformulowan dyrektywnych (np. "czy lekarz powinien zmienic...").
- Testy scenariuszy: brak badan w historii, sprzeczne zalecenia lekow, brak planu kontroli.
- Testy bezpieczenstwa pod katem wstrzykiwania pytan sugerujacych diagnoze.

### Clinical Safety Gate

Pytania moga miec wylacznie charakter ulatwiajacy komunikacje (np. "O co zapytac lekarza"). Niedopuszczalne sa pytania sugerujace konkretne jednostki chorobowe lub terapie.

### No-Go

- Pytanie sugeruje diagnoze (np. "Zapytaj czy to moze byc borelioza").
- Asystent narzuca pilnosc wizyty (np. "Musisz pilnie skonsultowac to badanie").
- Uzytkownik widzi pytania bez podania zrodla niespojnosci.

## Sprint A4 Pulpit Uprawnien Bliskich (Caregiver Access & Consent Guard)

Klasa: `safe` dla `ConsentGuardAgent`.

### Cel

Zapewnienie pelnego bezpieczenstwa i kontroli nad dostepem opiekunow/rodziny do danych pacjenta, filtrujac wszelkie podsumowania i wyjscia asystentow przez pryzmat udzielonych zgod.

### Zakres

- `ConsentGuardAgent`: modul sprawdzajacy uprawnienia przed wyrenderowaniem jakiejkolwiek informacji w panelu opiekuna.
- Interfejs zarzadzania zgodami dla pacjenta: pacjent moze okreslic, czy opiekun widzi sekcje lekow, wizyt, czy pelne podsumowania.
- Zapewnienie, ze asystent operacyjny nie "ujawni" poufnych danych pacjenta w streszczeniu generowanym dla opiekuna.

### DoD

- Opiekun widzi w UI tylko te sekcje i dane, na ktore pacjent wyrazil zgode.
- Proba wyswietlenia danych poza zakresem skutkuje neutralnym komunikatem, ktory nie zdradza zawartosci.
- Pelny audit trail (logi bezpieczenstwa) rejestrujacy kazdy dostep opiekuna do danych.
- Mozliwosc natychmiastowego cofniecia zgody przez pacjenta.

### Testy

- Testy uprawnien: weryfikacja dla roznych poziomow dostepu (pelny, tylko leki, tylko wizyty, brak dostepu).
- Testy leakage: sprawdzenie, czy streszczenia generowane dla opiekuna nie zawieraja faktow medycznych z zablokowanych obszarow.
- Testy reakcji systemu na nagle cofniecie zgody w trakcie sesji.

### Clinical Safety Gate

Zgoda pacjenta jest warunkiem bezwzglednym. Modul Consent Guard dziala na poziomie systemowym i zadne podsumowanie LLM nie moze go ominac ani sparafrazowac zablokowanych danych.

### No-Go

- Opiekun dowiaduje sie o istnieniu zablokowanego dokumentu poprzez komunikat bledu (np. "Brak dostepu do dokumentu o nowotworze").
- Streszczenie asystenta dla opiekuna zawiera informacje spoza obszaru udzielonej zgody.
- Brak logowania zdarzen dostepu do danych.

## Sprint A5 Bezpieczne Uzgadnianie Lekow (Medication Reconciliation Assistant)

Klasa: `caution` dla `MedicationSupportAgent`.

### Cel

Wsparcie pacjenta i lekarza w procesie uzgadniania lekow poprzez automatyczne zestawienie lekow przepisanych, wykupionych i zadeklarowanych jako przyjmowane, w celu przygotowania raportu rozbieznosci przed wizyta.

### Zakres

- Zestawienie list lekow z roznych zrodel (recepty, ankieta pacjenta, zalecenia powizytowe).
- Wykrywanie rozbieznosci formalnych: brakujace dawki, podwojne zapisy (ten sam lek pod roznymi nazwami handlowymi).
- Generowanie roboczego zestawienia lekow z czytelnym oznaczeniem sprawdzonych pozycji.
- Przygotowanie pytan do lekarza/farmaceuty w przypadku watpliwosci (np. "Przyjmujesz lek X i lek Y, ktore sa swoimi zamiennikami").

### DoD

- Agent nie modyfikuje dawkowania ani nie sugeruje odstawienia lekow.
- Kazdy wpis lekowy posiada przypisane zrodlo lub status `do wyjasnienia`.
- Raport rozbieznosci lekowych prezentuje wylacznie fakty (brak ocen klinicznych interakcji).
- UI pozwala na reczne zatwierdzenie listy przez pacjenta przed wyslaniem jej lekarzowi.

### Testy

- Testy wykrywania duplikatow lekow (np. rozne nazwy handlowe dla tej samej substancji czynnej).
- Testy odpornosci na brakujace dawkowanie w zrodlach.
- Testy blokady: asystent nie moze wyswietlic komunikatu sugerujacego przerwanie terapii.

### Clinical Safety Gate

Asystent lekowy dziala wylacznie jako narzedzie porownawcze. Wszelkie sugestie dotyczace zmiany terapii, dawkowania, interakcji farmakologicznych sa zablokowane.

### No-Go

- Agent sugeruje pacjentowi zmiane por przyjmowania, dawki lub odstawienie leku.
- Raport jest prezentowany jako "Aktualny Plan Leczenia" (musi byc oznaczony jako "Wersja Robocza do Konsultacji").
- System automatycznie wysyla liste do systemow zewnetrznych bez akceptacji pacjenta.

## Sprint A6 Visit Checklist / Pre-Visit One-Pager

Klasa: `caution` dla `VisitChecklistAgent`; checklista jest projekcja
logistyczna, nie dokumentacja medyczna, diagnoza ani rekomendacja.

### Cel

Zamknac Phase 1 Pre-Visit przez jeden ekran operacyjny, ktory agreguje
A1-Core, A3+A5 i A4 w format: co zabrac, o co zapytac, co potwierdzic i co
jest gotowe do pokazania podczas rozmowy.

### Zakres

- `public/patient360-a6-checklist.js`: `projectVisitChecklist()` jako czysta
  projekcja nad obecnym demo state; bez migracji Data Contract i bez runtime LLM.
- Wejscia: A1 feed/inspector, A3+A5 gaps/questions oraz A4 Consent Guard.
- Wyjscia: `VisitChecklistItem` z `projectionId`, `category`, `status`,
  `requiredArea`, `sourceRefs` i `linkedSurfaces`.
- Role matrix: pacjent widzi "zabierz / zapytaj / potwierdz", opiekun widzi
  tylko zakres po A4, lekarz widzi ten sam graf jako "dostarczono / pytania
  pacjenta / do potwierdzenia".
- Deduplikacja: pytanie DITL ma pierwszenstwo przed tym samym obiektem
  biznesowym w sekcji gotowe.

### DoD

- Kazdy item ma `sourceRefs` albo jawny `source_missing`.
- Kazdy item ma `requiredArea`; brak pola blokuje item dla opiekuna.
- Opiekun nie widzi licznikow ukrycia, kart odmowy ani tekstow typu "brak
  dostepu".
- Statusy sa logistyczne: `ready`, `confirm`, `missing`, `optional`; brak
  skali klinicznej.
- UI nie uzywa kolorow triage; statusy maja neutralna palete.

### Testy

- `tests/a6-visit-checklist.test.js` - projekcja read-only, Jan, Maja,
  ograniczony opiekun Andrzeja i blokada zakazanego copy.
- `tools/validate-a6-checklist.ps1` - walidator go-live dla source gate,
  projection gate, A4 zero-knowledge i safety gate.
- `tools/smoke-browser.ps1` - domyslny start pacjenta otwiera A6.
- `tools/verify-click-routes.js` - perspektywa pacjenta prowadzi do
  `visitChecklist`.

### Clinical Safety Gate

A6 moze porzadkowac tylko operacyjny pakiet przed rozmowa. Jezeli item
zaczyna sugerowac znaczenie kliniczne, pilnosc, leczenie albo decyzje,
walidator ma go zablokowac przed UI.

### No-Go

- Item bez `sourceRefs` lub `requiredArea`.
- Automatyczne laczenie lub przeliczanie danych klinicznych.
- Sortowanie po pilnosci lub ryzyku medycznym.
- Tekst sugerujacy rozpoznanie, leczenie, pilna reakcje albo decyzje
  kliniczna.

## Sprint A7 After Visit Loop: VisitPlainLanguageAgent + PostVisitTaskRouter

Klasa: `caution` dla `VisitPlainLanguageAgent` i `PostVisitTaskRouter`.

### Cel

Uproszczenie klinicznego podsumowania wizyty do prostego, zrozumialego dla pacjenta jezyka oraz wygenerowanie sugerowanych zadan organizacyjnych po wizycie bez autonomicznego podejmowania decyzji medycznych.

### Zakres

- `VisitPlainLanguageAgent`: tlumaczenie klinicznego `VisitSummary` oraz `Encounter` na prosty jezyk (Plain Language) dla pacjenta lub opiekuna.
- `PostVisitTaskRouter`: analiza `PostVisitPlan` i generowanie roboczych zadan `CareTask` (np. kontrola cisnienia, umowienie USG, wykupienie leku) powiazanych ze zrodlem (`source_id`).
- Prezentacja uproszczonego podsumowania i zadan w czytelnym panelu "Po wizycie" z opcja recznej edycji i akceptacji przez uzytkownika.
- Wykorzystanie struktur After Visit Loop zdefiniowanych w Sprint A0.

### DoD

- Uproszczone podsumowanie nie zmienia sensu klinicznego zalecen ani dawkowania lekow.
- Kazde zadanie `CareTask` ma status `draft`, przypisane zrodlo (`source_id`) oraz wymaga klikniecia "Zatwierdz" przez pacjenta.
- System nie wysyla powiadomien ani nie modyfikuje kalendarza bez zgody uzytkownika.
- Wyrazne oznaczenie w UI: "Wygenerowano automatycznie. Sprawdz zgodnosc z zaleceniami lekarza".

### Testy

- Testy transformacji tekstu: weryfikacja, ze uproszczony opis nie pomija ostrzezen (np. "zazywac ostroznie") ani nie zmienia wartosci numerycznych dawek.
- Testy negatywne: blokada proby interpretacji wynikow badan (np. "wynik zly", "wynik w normie" sa odrzucane przez walidator).
- Testy generowania `CareTask` na podstawie roznych planow wizyt (testy jednostkowe na fixtures).

### Clinical Safety Gate

Zmiana jezyka na prosty nie moze lagodzic ostrzezen lekarskich. Jezeli asystent pominie w tlumaczeniu kluczowe przeciwwskazanie lub ostrzezenie, testy bezpieczenstwa musza przerwac proces.

### No-Go

- Zadania sa zapisywane jako "aktywne/wymagane" bez zgody pacjenta.
- Agent samodzielnie ustala medyczna pilnosc (triage) zadan powizytowych.
- Uproszczona wersja sugeruje zmiane dawkowania lub interpretuje stan zdrowia pacjenta.

## Sprint A8 Logistyka po wizycie: MedicationAccessAgent + CareNavigationAgent

Klasa: `caution` dla `MedicationAccessAgent` i `CareNavigationAgent`.

### Cel

Wsparcie pacjenta w wyszukiwaniu placowek medycznych, terminow kontrolnych oraz aptek posiadajacych przepisane leki, w oparciu o syntetyczne dane i makiety API.

### Zakres

- `MedicationAccessAgent`: wyszukiwanie dostepnosci lekow z `PostVisitPlan` na bazie fikcyjnych danych aptek.
- `CareNavigationAgent`: wyszukiwanie placowek specjalistycznych lub POZ realizujacych zalecenia/skierowania z `PostVisitPlan` i `Encounter`.
- Prezentacja danych teleadresowych placowek i aptek bez rekomendacji jakosciowych.
- Przygotowanie szablonu wiadomosci rezerwacyjnej lub skierowania dla uzytkownika (handoff organizacyjny).

### DoD

- Agent nie proponuje substytutow ani zamiennikow lekow (odsyla do lekarza/farmaceuty).
- Kryteria wyszukiwania opieraja sie wylacznie na odleglosci, terminach i godzinach otwarcia, bez oceny klinicznej placowki.
- UI wyraznie odroznia informacje logistyczne od porad zdrowotnych.
- Brak realnych transakcji finansowych, rezerwacji czy zakupow bez udzialu czlowieka.

### Testy

- Testy blokady substytucji lekowej: w przypadku braku leku, agent zwraca rekomendacje konsultacji z farmaceuta, zabrania sie sugerowania innej substancji czynnej.
- Testy obslugi pustych wynikow wyszukiwania placowek w syntetycznej bazie.
- Weryfikacja braku jakichkolwiek wywolan do zewnetrznych, nieautoryzowanych API produkcyjnych.

### Clinical Safety Gate

Wyszukiwarka aptek i placowek musi miec staly disclaimer informujacy, ze asystent ulatwia jedynie logistyke i nie ocenia kompetencji placowek ani nie dobiera lekow zamiennych.

### No-Go

- Automatyczny zakup leku lub rezerwacja terminu bez zgody i potwierdzenia pacjenta.
- Propozycja zamiany leku na inny preparat w przypadku braku dostepnosci.
- Rankingowanie placowek pod katem ich jakosci medycznej przez LLM.
