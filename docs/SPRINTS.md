# Sprinty LLM i asystentow operacyjnych

Status: plan wdrozenia funkcji eksperymentalnych w prototypie Pacjent 360.

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

Wdrozenie jest aktywowane od Sprint A0. Aktywny jest tylko zakres A0; A1-A6 sa zablokowane do czasu zamkniecia A0 i review safety/privacy/security.

| ID | Sprint | Zadanie | Status | Zaleznosc | Kryterium zamkniecia |
| --- | --- | --- | --- | --- | --- |
| A0-01 | A0 | Ujednolicic kontrakty outputow: `source_id`, `source_type`, `ditl_status`, `source_status`, `user_visible_label` oraz modele After Visit Loop | active | `SSOT.md`, `ARCHITECTURE.md` | Jeden slownik enumow i labeli UI; kontrakty `Encounter`, `VisitArtifact`, `VisitSummary`, `PostVisitPlan`, `CareTask`. |
| A0-02 | A0 | Przygotowac prototyp `AgentPolicy` dla agentow `safe` i `caution` | active | A0-01 | Kazdy agent ma allowed/forbidden outputs. |
| A0-03 | A0 | Zaprojektowac walidator zakazanych outputow i slow klinicznych | active | A0-01 | Testy negatywne blokuja diagnoze, triage, pilnosc, terapie. |
| A0-04 | A0 | Zbudowac syntetyczne fixtures demo dla pacjenta, opiekuna, lekarza, dokumentu, lekow i transkrypcji wizyty | active | brak | Zero realnych danych i zero historii prywatnych. |
| A0-05 | A0 | Dopisac ryzyka LLM do `RISKS.md` i procedury review do `SECURITY.md` | active | `SSOT.md` | Risk register zawiera halucynacje, leakage, prompt injection i ton autorytatywny. |
| A0-06 | A0 | Zrobic go/no-go review A0 przed jakimkolwiek UI dry-run | active | A0-01..A0-05 | Decyzja: continue, redesign albo no-go. |
| A1-01 | A1 | Manual Agent Dry-Run UI | blocked | A0 complete | Dry-run bez zapisu i bez realnych danych. |
| A2-01 | A2 | `DataQualityAgent` + `SourceGroundingAgent` | blocked | A1 complete | 100% source coverage albo `source_missing`. |
| A3-01 | A3 | `VisitChecklistAgent` + `DITLQuestionAgent` | blocked | A2 complete | Pytania neutralne, bez odpowiedzi klinicznej. |
| A4-01 | A4 | `ConsentGuardAgent` + zakresy opiekuna | blocked | A2 complete | Brak leakage poza zakresem zgody. |
| A5-01 | A5 | `MedicationSupportAgent` dry-run | blocked | A4 complete | Brak dawkowania, odstawiania, interakcji jako wniosku klinicznego. |
| A6-01 | A6 | `ReportDraftingAgent` + walidacja | blocked | A5 complete | Draft raportu z review i metrykami walidacji. |
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

## Sprint A1 Manual Agent Dry-Run UI

Klasa: infrastruktura safety; kazdy uruchamiany agent musi byc oznaczony jako `safe`, `caution` albo `forbidden` zgodnie z `SSOT.md`.

### Cel

Zbudowac reczny tryb dry-run, w ktorym zespol moze wkleic syntetyczne wejscie, uruchomic lub zasymulowac asystenta i obejrzec wynik bez zapisu produkcyjnego.

### Zakres

- Panel dry-run dla danych demo i fixtures.
- Widok wejscia, wyniku, zrodel, statusow DITL i walidacji safety.
- Manualny wybor agenta i wersji promptu.
- Oznaczenie kazdej odpowiedzi jako `draft`.
- Brak automatycznego wplywu na glowny stan pacjenta.
- Eksport wyniku dry-run jako JSON do review.

### DoD

- Uzytkownik testowy moze przejsc pelny dry-run bez realnych danych.
- Wynik pokazuje zrodla, braki zrodel i status DITL.
- UI jasno oddziela dry-run od funkcji aplikacyjnych.
- Nie ma zapisu do profilu pacjenta, localStorage z danymi realnymi ani zewnetrznych wysylek danych.
- Walidator blokuje output poza kontraktem.

### Testy

- Testy UI dla pustego wejscia, poprawnego wejscia i outputu poza kontraktem.
- Testy braku mutacji glownego stanu aplikacji.
- Testy eksportu JSON bez danych identyfikujacych.
- Testy copy: brak slow diagnoza, triage, terapia, zalecenie.
- Manualny scenariusz: reviewer odrzuca output i widzi przyczyne.

### Clinical Safety Gate

Dry-run moze byc dostepny tylko dla syntetycznych przypadkow i musi miec widoczne oznaczenie, ze wynik nie jest porada medyczna ani decyzja kliniczna. Kazdy wynik wymaga recznego zatwierdzenia jako material testowy.

### No-Go

- UI pozwala wpisac albo zachowac realne dane pacjenta.
- Output przenosi sie automatycznie do raportu pacjenta.
- Brakuje widocznego statusu `draft` albo DITL.
- Walidator safety jest opcjonalny lub mozna go pominac.
- UI sugeruje, ze asystent cos rozstrzygnal klinicznie.

## Sprint A2 DataQualityAgent + SourceGroundingAgent

Klasa: `safe` dla `DataQualityAgent` i `SourceGroundingAgent`.

### Cel

Wdrozyc pierwsze dwa asystenty operacyjne: wykrywanie brakow/jakosci danych oraz przypinanie twierdzen do zrodel.

### Zakres

- `DataQualityAgent`: identyfikuje puste pola, duplikaty, niespojne daty, niepelne wpisy i brak potwierdzenia.
- `SourceGroundingAgent`: laczy kazde twierdzenie z dokumentem, wywiadem, transkrypcja, wynikiem albo statusem `source_missing`.
- Raport rozbieznosci: co wiadomo, czego brakuje, co jest niepewne.
- Brak interpretacji medycznej wartosci wynikow.
- Blokada outputow bez zrodla, chyba ze sa jawnie oznaczone jako `source_missing`.

### DoD

- Agent jakosci danych zwraca tylko problemy operacyjne i kompletacyjnosc.
- Agent zrodel nie tworzy nowych faktow bez referencji.
- Kazde twierdzenie ma `source_id` albo `source_status: source_missing`.
- UI pokazuje roznice miedzy faktem ze zrodla, brakiem danych i hipoteza niedozwolona.
- Wyniki sa w pelni odtwarzalne na fixtures demo.

### Testy

- Fixtures z brakujacymi datami, duplikatami dokumentow i niespojnymi nazwami lekow.
- Testy halucynacji: agent nie moze dopisac nieobecnych faktow.
- Testy source coverage: 100% twierdzen ma zrodlo albo `source_missing`.
- Testy regresji na pustych i sprzecznych danych.
- Manual clinical safety review 20 outputow.

### Clinical Safety Gate

Agent moze powiedziec, ze brakuje danych albo zrodla. Nie moze powiedziec, co brak oznacza klinicznie, jaka jest pilnosc ani jaka decyzja powinna nastapic.

### No-Go

- Agent interpretuje wynik jako prawidlowy, nieprawidlowy albo alarmowy.
- Agent sugeruje dzialanie terapeutyczne.
- Agent generuje twierdzenia bez zrodla i bez jawnej etykiety braku zrodla.
- Agent miesza dane pacjenta, opiekuna i lekarza bez kontroli zakresu.
- Test source coverage spada ponizej 100%.

## Sprint A3 VisitChecklistAgent + DITLQuestionAgent

Klasa: `caution` dla `VisitChecklistAgent` i `DITLQuestionAgent`.

### Cel

Przygotowac operacyjne wsparcie przed wizyta: checklisty dokumentow oraz pytania do omowienia z lekarzem.

### Zakres

- `VisitChecklistAgent`: lista dokumentow, wynikow, list lekow, zgod i pytan do przygotowania.
- `DITLQuestionAgent`: generowanie neutralnych pytan do lekarza na podstawie brakow, rozbieznosci i niepewnosci.
- Priorytety tylko organizacyjne: do przygotowania, do sprawdzenia, do omowienia.
- Grupowanie pytan wedlug zrodel i statusow: known, unknown, uncertain, to verify.
- Tryb pacjent/opiekun/lekarz z tym samym kontraktem safety.

### DoD

- Checklista nie zawiera diagnoz, porad terapeutycznych ani oceny pilnosci.
- Kazde pytanie ma zrodlo lub powod braku zrodla.
- Pytania sa sformulowane jako material do rozmowy z lekarzem, nie jako sugestie decyzji.
- UI pozwala oznaczyc punkt jako przygotowany, odrzucony albo wymagajacy omowienia.
- Output nadaje sie do walidacji w protokole DITL.

### Testy

- Testy copy dla pytan neutralnych i niedyrektywnych.
- Testy scenariuszy: brak dokumentu, sprzeczne daty, niepotwierdzona lista lekow, pytanie od opiekuna.
- Testy zakresow widoku pacjent/opiekun/lekarz.
- Testy zakazanych slow i sformulowan.
- Sesja walidacyjna z fikcyjnym raportem wedlug protokolu walidacji.

### Clinical Safety Gate

Pytanie jest dopuszczalne tylko wtedy, gdy pomaga przygotowac rozmowe z lekarzem i nie sugeruje odpowiedzi klinicznej. Checklisty moga porzadkowac zadania, ale nie moga wskazywac pilnosci medycznej.

### No-Go

- Pytanie brzmi jak rekomendacja, np. "czy nalezy wdrozyc...".
- Checklista ustawia medyczna pilnosc.
- Agent sugeruje, ze pacjent powinien zmienic leczenie, dawke albo zachowanie zdrowotne.
- Output nie wskazuje zrodla rozbieznosci.
- Opiekun widzi informacje poza swoim zakresem zgody.

## Sprint A4 ConsentGuard + Caregiver scopes

Klasa: `safe` dla `ConsentGuardAgent`; sprint jest bramka prywatnosci przed funkcjami dla opiekuna.

### Cel

Wprowadzic bramke zgody i zakresy opiekuna, zanim asystenci zaczna wspierac zadania dla rodziny lub opiekunow.

### Zakres

- `ConsentGuard`: walidacja, czy dany output moze byc pokazany danej roli.
- Zakresy opiekuna: wizyty, leki, dokumenty, zadania organizacyjne, raport tylko-do-omowienia.
- Widoczne statusy zgody: aktywna, brak zgody, wygasla, ograniczona, do potwierdzenia.
- Audit trail dla dry-run i decyzji widocznosci.
- Blokada generowania podsumowan poza zakresem zgody.

### DoD

- Kazdy agent sprawdza zakres odbiorcy przed pokazaniem outputu.
- Opiekun widzi tylko dane objete zgoda pacjenta w syntetycznym scenariuszu.
- Brak zgody skutkuje neutralnym komunikatem o braku dostepu, nie ujawnieniem faktu klinicznego.
- Audit pokazuje, kto, kiedy i na jakiej podstawie zobaczyl output.
- Cofniecie zgody ukrywa przyszle outputy dla danego zakresu.

### Testy

- Testy macierzy rol i zakresow: pacjent, opiekun lekowy, opiekun wizyt, lekarz demo.
- Testy negatywne dla wygaslej i ograniczonej zgody.
- Testy leakage: komunikat odmowy nie moze ujawniac danych.
- Testy audit trail na syntetycznych eventach.
- Manual privacy review scenariuszy opiekuna.

### Clinical Safety Gate

Zakres zgody jest warunkiem pokazania outputu. Asystent nie moze obchodzic zgody przez streszczenie, parafraze, komunikat bledu albo eksport.

### No-Go

- Jakikolwiek output ujawnia dane poza zakresem zgody.
- Odmowa dostepu zdradza tresc ukrytej informacji.
- Agent laczy role pacjenta i opiekuna bez jawnej zgody.
- Audit jest niekompletny albo niemozliwy do odtworzenia.
- Test leakage wykrywa obejscie przez streszczenie.

## Sprint A5 MedicationSupport dry-run

Klasa: `caution` dla `MedicationSupportAgent`; tylko dry-run i tylko output operacyjny.

### Cel

Przetestowac asystenta lekowego jako dry-run operacyjny: harmonogram, potwierdzenia, rozbieznosci i pytania do lekarza lub farmaceuty.

### Zakres

- `MedicationSupportAgent` tylko w dry-run.
- Porownanie: leki przepisane, wykupione, zgloszone jako przyjmowane, OTC/suplementy, odstawione.
- Zadania operacyjne: potwierdz liste, uzupelnij brakujaca informacje o dawce ze zrodla albo oznacz `do potwierdzenia`, sprawdz opakowanie, przygotuj pytanie.
- Pytania do lekarza/farmaceuty bez rekomendacji zmiany leczenia.
- Brak przypomnien produkcyjnych i brak realnego harmonogramu pacjenta.

### DoD

- Agent wykrywa rozbieznosci formalne bez oceny klinicznej.
- Wszystkie elementy lekowe maja zrodlo albo status braku potwierdzenia.
- Output jest widoczny jako dry-run i nie zmienia planu leczenia.
- Pytania sa kierowane do rozmowy z lekarzem lub farmaceuta.
- Brak integracji z apteka, IKP/P1 lub realnymi receptami.

### Testy

- Fixtures: lek przepisany ale niepotwierdzony, OTC bez dawki, odstawienie z wywiadu, rozne nazwy tego samego leku.
- Testy zakazu: brak sugestii zmiany dawki, odstawienia, zamiany lub rozpoczecia leczenia.
- Testy source grounding dla kazdego wpisu lekowego.
- Testy roli opiekuna lekowego i cofniecia zgody.
- Manual review przez osobe z kompetencja clinical safety.

### Clinical Safety Gate

Asystent lekowy moze wskazac rozbieznosc i przygotowac pytanie. Nie moze rekomendowac dawki, pory przyjmowania, odstawienia, zamiany, interakcji ani oceny ryzyka. Wszystko zostaje w trybie dry-run.

### No-Go

- Agent sugeruje zmiane leczenia, dawki, pory przyjmowania albo odstawienie.
- Agent opisuje interakcje jako kliniczny wniosek.
- Output jest pokazany jako plan leczenia.
- Dry-run zapisuje sie jako rzeczywisty harmonogram.
- Do testow zostaja uzyte realne recepty, opakowania lub dane pacjentow.

## Sprint A6 ReportDrafting + validation

Klasa: `caution` dla `ReportDraftingAgent`; draft raportu nie jest dokumentacja medyczna ani rekomendacja.

### Cel

Pozwolic asystentom stworzyc wersje robocza raportu kontekstowego i przejsc walidacje uzytecznosci oraz clinical safety na danych fikcyjnych.

### Zakres

- `ReportDraftingAgent`: draft one-pagera `Known / Unknown / Uncertain / To verify`.
- Wymagane przypisy do zrodel i statusy DITL.
- Walidator safety przed pokazaniem draftu.
- Workflow review: wygenerowano, odrzucono, poprawiono recznie, zaakceptowano do testu.
- Sesja walidacyjna wedlug protokolu z lekarzami, pacjentami lub opiekunami na fikcyjnych przypadkach.

### DoD

- Draft raportu nie zawiera diagnozy, triage, terapii ani oceny pilnosci.
- 100% twierdzen ma zrodlo albo jawny status `source_missing`.
- Raport pokazuje tylko kontekst i pytania do wyjasnienia.
- Wyniki walidacji sa zapisane jako feedback produktowy, nie jako dowod klinicznej skutecznosci.
- Decyzja kontynuuj/pivot/no-go jest podjeta na podstawie metryk walidacji.

### Testy

- Testy kontraktowe calego raportu.
- Testy regresji na fixtures z A0-A5.
- Testy czerwonych flag jezykowych: zakazane slowa i dyrektywne sformulowania.
- Walidacja z uzytkownikami na danych fikcyjnych.
- Review privacy/security/clinical safety przed jakimkolwiek pokazem publicznym.

### Clinical Safety Gate

Raport jest dopuszczalny tylko jako draft kontekstowy do rozmowy z lekarzem. Jesli uczestnicy walidacji odczytuja raport jako diagnoze, triage albo zalecenie, funkcja wraca do projektowania.

### No-Go

- Mniej niz 100% source coverage.
- Raport sugeruje decyzje kliniczna.
- Dwie lub wiecej osob w walidacji interpretuja raport jako diagnoze, triage albo zalecenie.
- Jakikolwiek realny przypadek lub realne dane trafiaja do walidacji.
- Nie ma podpisanej decyzji safety dla pokazania wynikow poza zespolem.
