# Pacjent360™ SSOT: LLM i agenci operacyjni

Status: decyzja produktowa po council. Zakres: wyłącznie rola LLM i agentów operacyjnych.

Nadrzędnym źródłem prawdy o produkcie jest `PRODUCT_SSOT.md` w katalogu głównym repo (ADR 0005). Ten dokument jest pojedynczym źródłem prawdy **dla roli LLM i agentów** w Pacjent360™ i działa w granicach wyznaczonych przez `PRODUCT_SSOT.md`. Obowiązuje dla backlogu, prototypów, demo, przyszłych PR oraz rozmów z partnerami. W razie konfliktu języka lub zakresu agentów z innymi materiałami produktowymi ten dokument ma pierwszeństwo do czasu formalnej aktualizacji; w razie konfliktu o to, czym jest produkt, rozstrzyga `PRODUCT_SSOT.md`.

## Decyzja główna

LLM w Pacjent360™ działa jako **sekretariat kontekstu**, nie jako doradca medyczny.

System może porządkować informacje, wskazywać braki, zadawać pytania DITL, sprawdzać źródła, przygotowywać checklisty i pomagać w audycie danych. System nie diagnozuje, nie rekomenduje leczenia, nie ocenia pilności, nie prowadzi triage i nie zastępuje decyzji lekarza ani innego uprawnionego profesjonalisty medycznego.

## Intended Purpose

Pacjent360™ ma pomagać pacjentowi, opiekunowi i lekarzowi szybciej zobaczyć kontekst potrzebny przed wizytą lub decyzją medyczną.

Dozwolony cel użycia:

- uporządkowanie osi czasu, dokumentów, wyników, leków, objawów, wywiadu, zgód i zadań;
- wskazanie brakujących, sprzecznych lub niepotwierdzonych informacji;
- przygotowanie pytań do wyjaśnienia z lekarzem, farmaceutą lub innym właściwym profesjonalistą;
- przygotowanie checklist przed wizytą, bez interpretacji klinicznej;
- utrzymanie śladu źródeł, zgód, statusów i audytu;
- wsparcie demo oraz walidacji produktu na fikcyjnych, kompozytowych przypadkach.

Niedozwolony cel użycia:

- automatyczna diagnoza, różnicowanie lub predykcja kliniczna;
- rekomendowanie terapii, dawkowania, odstawienia, zamiany leku lub postępowania medycznego;
- ocena pilności, ryzyka nagłego pogorszenia, triage lub kierowanie pacjenta do konkretnej ścieżki leczenia;
- zastępowanie konsultacji, dokumentacji medycznej, IKP/P1, EDM albo decyzji klinicznej.

## Zasady DITL

DITL oznacza **Doctor in the Loop**. Każdy agent, przepływ i output musi wspierać decyzję człowieka, nie wykonywać jej za niego.

Zasady obowiązkowe:

- Każda flaga, sugestia pytania, luka danych, rozbieżność i zadanie musi mieć źródło albo jawny status `source_missing`.
- `source_missing` jest kanoniczną wartością techniczną dla braku źródła. UI może pokazać label `brak źródła`, ale modele, testy i backlog używają `source_missing`.
- Każdy output LLM musi mieć status decyzyjny: `draft`, `needs_review`, `accepted`, `rejected` albo `superseded`.
- Output LLM nie może być prezentowany jako fakt kliniczny bez przypisanego źródła i akceptacji człowieka.
- Agent może używać języka: `pytanie`, `brak danych`, `rozbieżność`, `do wyjaśnienia`, `do potwierdzenia`, `źródło`, `zadanie`, `status`.
- Agent nie może używać języka sugerującego samodzielną decyzję kliniczną: `diagnoza`, `zalecenie`, `terapia`, `należy`, `pilne`, `w normie`, `poza normą`, `leczenie wybrane przez system`.
- Lekarz lub inny uprawniony profesjonalista medyczny pozostaje jedyną osobą, która może podjąć decyzję kliniczną.
- Pacjent i opiekun mogą widzieć przygotowanie kontekstu, ale nie mogą otrzymywać od systemu instrukcji medycznych udających poradę.
- Każda automatyzacja musi być odwracalna, audytowalna i widoczna przed akceptacją.

## Klasy Agentów

### Safe Agents

Agenci bezpieczni wykonują pracę sekretariatu kontekstu. Mogą działać w demo i w przyszłych prototypach po spełnieniu walidatora DITL.

Przykłady:

- sprawdzanie kompletności danych i metadanych;
- wykrywanie braków źródeł;
- przygotowanie checklist dokumentów;
- grupowanie informacji według wizyty, dokumentu, leku, objawu lub zgody;
- generowanie pytań DITL bez odpowiedzi klinicznej;
- lint języka demo pod kątem zakazanych sformułowań;
- przygotowanie podglądu zmian do akceptacji.

Wymagania:

- output zawsze jako szkic lub zadanie do akceptacji;
- pełna ścieżka źródeł;
- brak ukrytego zapisu produkcyjnego;
- brak realnych danych pacjentów w demo.

### Caution Agents

Agenci ostrożnościowi dotykają danych medycznie wrażliwych albo mogą łatwo zostać źle zinterpretowani. Mogą istnieć wyłącznie za walidatorem, preview i ręczną akceptacją.

Przykłady:

- porównywanie listy leków z wywiadem pacjenta;
- wskazywanie niespójności między dokumentami, wynikami i deklaracjami;
- priorytetyzacja checklist operacyjnych bez oceny klinicznej pilności;
- streszczanie wypisu lub wyniku jako materiału do rozmowy;
- streszczanie transkrypcji wizyty prostym językiem jako draft do weryfikacji;
- tworzenie zadań organizacyjnych po wizycie na podstawie zaakceptowanego źródła;
- przypomnienia dla pacjenta lub opiekuna związane z wizytą, dokumentem albo zadaniem.

Wymagania dodatkowe:

- zakaz formułowania interpretacji klinicznych;
- jawne ograniczenie: `do omówienia z lekarzem / farmaceutą`;
- ręczna akceptacja przed zapisem do rekordu projektu;
- log w `AgentRun` i ślad w audycie.

### Forbidden Agents

Agenci zakazani nie mogą być implementowani w Pacjent360™ bez zmiany intended purpose, pełnej walidacji klinicznej, prawnej i regulacyjnej oraz odrębnej decyzji council.

Zakazani są agenci, którzy:

- diagnozują lub różnicują choroby;
- rekomendują leczenie, dawkowanie, zmianę, odstawienie albo rozpoczęcie leku;
- oceniają pilność stanu pacjenta, ryzyko zgonu, ryzyko sepsy, ryzyko zawału, udaru lub innego zdarzenia klinicznego;
- wykonują triage;
- generują plan leczenia;
- interpretują wynik jako `w normie`, `poza normą`, `bezpieczny`, `niebezpieczny` albo `alarmowy`;
- sugerują, że konsultacja medyczna nie jest potrzebna;
- komunikują się z pacjentem jak lekarz, farmaceuta lub ratownik;
- podejmują automatyczne działania poza systemem bez akceptacji człowieka.

## Pierwszy Pakiet Do Implementacji

Pierwszy pakiet agentów ma służyć walidacji wzorca: dry-run, walidator, preview, akceptacja, commit i audit. Nie ma rozszerzać zakresu medycznego produktu.

### DataQualityAgent

Cel: wykrywać braki, duplikaty, niespójne daty, brakujące źródła, puste pola i niepewne statusy danych.

Dozwolone outputy:

- lista braków danych;
- lista rozbieżności technicznych;
- propozycja zadania `CareTask` typu `data_check`;
- status `source_missing`, `needs_confirmation` lub `needs_review`.

Zakazy:

- brak interpretacji klinicznej;
- brak stwierdzeń o bezpieczeństwie lub pilności;
- brak sugerowania terapii.

### VisitChecklistAgent

Cel: przygotować checklistę przed wizytą z dokumentów, pytań, leków, zgód i zadań do potwierdzenia.

Dozwolone outputy:

- lista dokumentów do zabrania lub sprawdzenia;
- lista pytań do lekarza;
- lista informacji do potwierdzenia przez pacjenta lub opiekuna;
- zadania `CareTask` typu `visit_preparation`.

Zakazy:

- brak odpowiedzi na pytania kliniczne;
- brak oceny, które pytanie jest medycznie ważniejsze;
- brak instrukcji postępowania.

### SourceGroundingAgent

Cel: sprawdzić, czy elementy raportu, flagi, pytania i zadania mają przypisane źródła.

Dozwolone outputy:

- mapa `claim -> source`;
- lista elementów bez źródła;
- oznaczenie elementu jako `ungrounded`;
- propozycja cofnięcia elementu do statusu `draft`.

Zakazy:

- brak uzupełniania faktów z pamięci modelu;
- brak tworzenia źródeł zastępczych;
- brak dopowiadania danych medycznych.

### DITLQuestionAgent

Cel: zamieniać braki, rozbieżności i niepewności w neutralne pytania do wyjaśnienia z lekarzem, farmaceutą lub właściwą osobą.

Dozwolone outputy:

- pytania w języku nieterapeutycznym;
- wskazanie, z czego wynika pytanie;
- przypisanie pytania do wizyty, dokumentu, leku, objawu albo zgody;
- status `needs_doctor_review`, `needs_pharmacist_review` albo `needs_patient_confirmation`.

Zakazy:

- brak odpowiedzi klinicznej;
- brak sugestii rozpoznania;
- brak rekomendowania działania pacjentowi.

### DemoSafetyLintAgent

Cel: pilnować, aby demo i treści publiczne nie używały języka klinicznej decyzji, nie przyjmowały realnych danych pacjentów i nie sugerowały gotowości produkcyjnej.

Dozwolone outputy:

- lista naruszeń języka;
- lista miejsc wymagających disclaimera;
- propozycje neutralnych sformułowań;
- status `demo_safe`, `needs_copy_review` albo `blocked`.

Zakazy:

- brak zmian automatycznie publikowanych bez review;
- brak łagodzenia realnych ryzyk przez samą zmianę copy;
- brak dopuszczenia demo do danych realnych.

### ConsentGuardAgent

Cel: pilnować zakresu zgody, widoczności danych i audytu, zanim output agenta zostanie pokazany pacjentowi, opiekunowi, rodzinie, lekarzowi albo reviewerowi.

Dozwolone outputy:

- decyzja polityki widoczności: `allowed`, `blocked`, `needs_consent_review`;
- lista brakujących albo wygasłych zakresów zgody;
- propozycja zadania `CareTask` typu `consent_review`;
- wpis audytu opisujący, kto próbował zobaczyć jaki zakres danych i na jakiej podstawie.

Zakazy:

- brak streszczania danych, do których odbiorca nie ma zgody;
- brak ujawniania ukrytej informacji przez komunikat błędu;
- brak poszerzania zgody albo roli bez jawnej akceptacji pacjenta;
- brak obchodzenia zgody przez eksport, raport, prompt albo parafrazę.

## Planowane Agenty After Visit Loop

Te agenty są klasą `caution`. Mogą powstać dopiero po Sprint A0 Safety & Contracts, dry-run UI, walidatorze DITL, preview, ręcznej akceptacji i review privacy/security/clinical safety.

### VisitPlainLanguageAgent

Cel: przekształcić transkrypcję wizyty, notatkę pacjenta albo dokument po wizycie w prosty draft podsumowania dla pacjenta i opiekuna.

Dozwolone outputy:

- prosty opis tego, co znajduje się w źródle;
- rozdzielenie wypowiedzi lekarza, pacjenta i opiekuna;
- lista fragmentów niejasnych albo wymagających potwierdzenia;
- pytania DITL wynikające z niejasności transkrypcji;
- status `draft`, `needs_review` albo `source_missing`.

Zakazy:

- brak dopowiadania faktów, których nie ma w źródle;
- brak zmiany sensu wypowiedzi lekarza;
- brak diagnozy, triage, terapii, oceny pilności albo instrukcji medycznej;
- brak tworzenia dokumentacji medycznej udającej wpis lekarza;
- brak pracy na realnym nagraniu lub transkrypcji bez osobnej zgody, retencji i review privacy/security.

### PostVisitTaskRouter

Cel: zamienić zaakceptowane ustalenia po wizycie w zadania organizacyjne dla pacjenta lub opiekuna.

Dozwolone outputy:

- `CareTask` typu: `medication_purchase`, `medication_confirmation`, `lab_test_to_schedule`, `lab_result_to_deliver`, `referral_booking`, `appointment_booking`, `document_upload`, `question_to_confirm`, `caregiver_followup`;
- przypisanie właściciela zadania zgodnie z zakresem zgody;
- link do źródła, z którego wynika zadanie;
- status `draft`, `open`, `blocked`, `done`, `dismissed` albo `superseded`.

Zakazy:

- brak automatycznego umawiania wizyty, zakupu, zmiany terapii albo kontaktu z placówką bez jawnego potwierdzenia człowieka;
- brak decyzji, czy badanie, wizyta lub specjalista są klinicznie potrzebne albo pilne;
- brak tworzenia zadania bez źródła;
- brak pokazywania opiekunowi zadania poza zakresem zgody.

### MedicationAccessAgent

Cel: wesprzeć logistykę realizacji recepty albo kontaktu z apteką na podstawie źródła, np. e-recepty, dokumentu lub ustalenia po wizycie.

Dozwolone outputy:

- zadanie sprawdzenia e-recepty albo kodu recepty;
- zadanie zapytania apteki o dostępność;
- lista informacji, które pacjent lub opiekun powinien mieć przy odbiorze leku;
- pytanie do farmaceuty lub lekarza, jeśli brakuje danych ze źródła.

Zakazy:

- brak wyboru zamiennika;
- brak rekomendowania leku, dawki, pory przyjmowania lub terapii;
- brak oceny interakcji jako wniosku klinicznego;
- brak zamówienia lub zakupu bez akceptacji człowieka.

### CareNavigationAgent

Cel: pomóc pacjentowi lub opiekunowi znaleźć organizacyjne ścieżki po wizycie: placówkę, specjalistę, termin, dokumenty do rejestracji albo checklistę kontaktu.

Dozwolone outputy:

- lista danych potrzebnych do rejestracji;
- zadanie sprawdzenia terminu lub placówki;
- checklisty dokumentów do umówienia wizyty;
- linki lub źródła do samodzielnego sprawdzenia przez pacjenta.

Zakazy:

- brak decyzji, jaka specjalizacja jest klinicznie właściwa;
- brak oceny pilności terminu;
- brak odwoływania lub umawiania wizyty bez potwierdzenia człowieka;
- brak sugestii, że konsultacja nie jest potrzebna.

## Pipeline Agentów

Każdy agent działa w tym samym kontrolowanym pipeline:

1. `dry-run` - agent analizuje dane i generuje propozycję bez zapisu do stanu trwałego.
2. `walidator` - system sprawdza politykę DITL, źródła, zgody, zakazane outputy i zakres agenta.
3. `preview` - użytkownik widzi różnice, źródła, statusy, ryzyka i powód wygenerowania propozycji.
4. `akceptacja` - uprawniony człowiek akceptuje, odrzuca albo odsyła propozycję do poprawy.
5. `commit` - zaakceptowana zmiana trafia do modelu danych jako jawny rekord z autorem i źródłem.
6. `audit` - `AgentRun`, decyzja akceptacyjna, źródła i zmienione rekordy są zapisywane do audytu.

Wymogi pipeline:

- brak pomijania `validator`;
- brak ukrytego commitu po samym dry-run;
- brak zapisu outputu bez statusu;
- brak akceptacji przez ten sam proces, który wygenerował output;
- każda akcja agenta musi mieć identyfikowalne wejście, politykę, wersję promptu i wersję walidatora.

## Modele Docelowe

Modele są opisem kontraktu produktowego. Implementacja może użyć innych struktur technicznych, ale musi zachować te pola semantyczne.

### AgentTask

Reprezentuje pracę zleconą agentowi.

Minimalne pola:

- `id`;
- `agentType`;
- `requestedBy`;
- `requestedAt`;
- `inputRefs`;
- `consentScopeId`;
- `policyId`;
- `mode`: `dry_run` albo `commit_requested`;
- `status`: `queued`, `running`, `validator_blocked`, `preview_ready`, `accepted`, `rejected`, `committed`, `failed`;
- `purpose`;
- `constraints`;
- `createdCareTaskIds`;

### AgentRun

Reprezentuje konkretne wykonanie agenta.

Minimalne pola:

- `id`;
- `taskId`;
- `agentType`;
- `modelName`;
- `promptVersion`;
- `validatorVersion`;
- `startedAt`;
- `finishedAt`;
- `inputRefs`;
- `outputRefs`;
- `policyResult`;
- `blockedReasons`;
- `humanDecision`;
- `auditHash`;

### AgentPolicy

Reprezentuje zasady bezpieczeństwa dla agenta.

Minimalne pola:

- `id`;
- `agentType`;
- `version`;
- `allowedInputs`;
- `allowedOutputs`;
- `forbiddenOutputs`;
- `requiredSourceTypes`;
- `requiredConsentScopes`;
- `ditlStatusRequired`;
- `requiresHumanAcceptance`;
- `maxAutonomyLevel`;
- `validatorRules`;

### CareTask

Reprezentuje zadanie opieki lub przygotowania kontekstu, nie decyzję kliniczną.

Minimalne pola:

- `id`;
- `type`: `data_check`, `visit_preparation`, `source_review`, `question_review`, `consent_review`, `demo_safety_review`;
- `title`;
- `description`;
- `status`: `draft`, `open`, `done`, `dismissed`, `superseded`;
- `ownerRole`: `patient`, `caregiver`, `doctor`, `pharmacist`, `project_reviewer`;
- `sourceRefs`;
- `createdBy`;
- `createdFromAgentRunId`;
- `dueContext`;
- `ditlStatus`;

### ConsentScope

Reprezentuje zakres zgody na przetwarzanie i udostępnienie informacji.

Minimalne pola:

- `id`;
- `subjectId`;
- `grantedToRole`;
- `grantedToId`;
- `scopeType`: `view`, `prepare_context`, `manage_checklist`, `export`, `audit_review`;
- `dataCategories`;
- `validFrom`;
- `validUntil`;
- `revokedAt`;
- `source`;
- `auditTrailRefs`;

## Zakazane Outputy

Żaden agent ani UI korzystające z agentów nie może generować ani prezentować następujących outputów:

- diagnoza lub podejrzenie diagnozy;
- lista możliwych chorób jako odpowiedź systemu;
- rekomendacja leczenia, terapii, badania, dawkowania, zmiany, odstawienia lub rozpoczęcia leku;
- informacja, że objaw, wynik lub stan jest pilny, niepilny, bezpieczny, niebezpieczny, alarmowy, w normie albo poza normą;
- decyzja, czy pacjent ma iść do SOR, POZ, specjalisty, farmaceuty albo pozostać w domu;
- triage, scoring ryzyka lub ranking klinicznej ważności;
- interpretacja wyniku badania bez źródła i decyzji człowieka;
- reassurance medyczne, np. że nie ma powodu do niepokoju;
- instrukcja postępowania medycznego dla pacjenta lub opiekuna;
- automatycznie wygenerowany wpis udający dokumentację medyczną lekarza;
- komunikat sugerujący, że LLM przejął odpowiedzialność kliniczną.

Dozwolona alternatywa językowa:

> To jest pytanie do wyjaśnienia z lekarzem. System wskazuje brak lub rozbieżność w danych, ale nie rozstrzyga znaczenia klinicznego.

## Kryteria Gotowości PR

Każdy PR dodający lub zmieniający agentów musi spełnić następujące warunki:

- agent jest zaklasyfikowany jako `safe`, `caution` albo `forbidden`;
- istnieje `AgentPolicy` lub jej prototyp opisujący dozwolone i zakazane outputy;
- każdy output ma źródło, status DITL i preview;
- istnieje walidator blokujący zakazane sformułowania;
- istnieje audit `AgentRun`;
- demo nie przyjmuje realnych danych pacjentów;
- copy nie sugeruje porady medycznej ani gotowości klinicznej;
- reviewer może odtworzyć wejścia, decyzję walidatora i zaakceptowany commit.

## Decyzje Otwarte

Następujące elementy wymagają osobnej decyzji przed implementacją produkcyjną:

- dokładny model ról i uprawnień dla pacjenta, opiekuna, lekarza, farmaceuty i reviewera projektu;
- polityka retencji danych agentów i logów audytowych;
- standard eksportu/importu dla przyszłej zgodności z oficjalnymi integracjami;
- procedura clinical safety review dla agentów ostrożnościowych;
- sposób oznaczania treści zaakceptowanych przez lekarza bez udawania EDM.

Do czasu rozstrzygnięcia tych decyzji obowiązuje zasada minimalnego zakresu: demo, fikcyjne dane, dry-run, preview, ręczna akceptacja i pełny audyt.
