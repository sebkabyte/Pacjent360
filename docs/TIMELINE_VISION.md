# Pacjent 360: Mapa Pacjenta 360

Status: vision SSOT
Zakres: docelowy timeline, warstwy, epizody, zasilanie danymi, asystenci operacyjni
Wersja: 0.1

## Teza

Timeline nie jest jedna z zakladek Pacjent 360. Timeline jest rdzeniem produktu.

Docelowo Pacjent 360 powinien byc wspolna, warstwowa mapa historii pacjenta. Lekarz, pacjent i opiekun patrza na te sama historie, ale z innym jezykiem, gestoscia informacji i zakresem dostepu.

Robocza nazwa:

> Mapa Pacjenta 360

Alternatywy:

- Historia Pacjenta 360
- Mapa Zdrowia Pacjenta
- Historia 360

## North Star

Pacjent 360 pomaga nie zgubic historii pacjenta.

System pokazuje:

- co sie wydarzylo,
- skad to wiemy,
- kto to powiedzial lub wpisal,
- co jest potwierdzone,
- co jest niejasne,
- co jest rozbiezne,
- co trzeba omowic z lekarzem,
- co jest kolejnym krokiem organizacyjnym.

System nie rozstrzyga klinicznie, nie diagnozuje, nie prowadzi triage, nie sugeruje terapii i nie zastepuje lekarza.

## Zasada Glowna

Jedna historia, wiele soczewek.

| Perspektywa | Widzi te sama mape, ale... |
|---|---|
| Pacjent | prostszy jezyk, sens zdarzen, przygotowanie wizyty, co dalej |
| Opiekun | tylko zakres zgody: leki, wizyty, dokumenty, zadania, obserwacje |
| Lekarz | zrodla, rozbieznosci, pytania DITL, gestosc danych, statusy pewnosci |

Nie tworzymy osobnego timeline pacjenta i osobnego timeline lekarza. To prowadzi do dwoch wersji prawdy.

## Model Mentalny

Obecny MVP ma `timelineEvents` jako liste zdarzen. To dobry zalazek, ale docelowo `TimelineEvent` nie powinien byc zrodlem prawdy.

Docelowo timeline jest projekcja z grafu:

```text
Sources -> Claims -> Events -> Episodes -> Views
```

Gdzie:

- `Source` to dokument, wynik, wywiad, transkrypcja, wpis pacjenta, wpis opiekuna, import z IKP/FHIR albo wpis reczny.
- `Claim` to twierdzenie pochodzace ze zrodla, np. "pacjent deklaruje przyjmowanie leku X".
- `Event` to zdarzenie lub kandydat zdarzenia na osi.
- `Episode` to pasmo znaczeniowe, np. "przygotowanie do zabiegu" albo "opieka po wypisie".
- `View` to soczewka dla pacjenta, opiekuna albo lekarza.

## Byty Zasilajace Mape

| Obszar | Byty Pacjent 360 | Odpowiedniki interop/FHIR |
|---|---|---|
| Kontakt z systemem | wizyta, teleporada, SOR, hospitalizacja | `Encounter`, `Appointment` |
| Epizod | ciag zdarzen wokol problemu, procedury lub okresu opieki | `EpisodeOfCare` |
| Dokumenty | wypis, opis wizyty, PDF, skan, notatka | `DocumentReference`, `Composition` |
| Badania | laboratorium, obrazowanie, opis diagnostyczny | `Observation`, `DiagnosticReport`, `ImagingStudy` |
| Procedury | zabieg, procedura, kwalifikacja | `Procedure`, `ServiceRequest` |
| Leki | przepisane, wykupione, deklarowane, faktycznie brane, odstawione | `MedicationRequest`, `MedicationDispense`, `MedicationStatement`, `MedicationAdministration` |
| Wywiad | formularz, rozmowa, transkrypcja, obserwacja rodziny | `QuestionnaireResponse`, `Communication` |
| Zadania | dokument do zebrania, badanie do umowienia, termin kontroli | `Task`, lokalnie `CareTask` |
| Zgody | dostep opiekuna, zakres widocznosci, cofniecie dostepu | `Consent`, `AuditEvent` |
| Pytania DITL | braki, konflikty danych, pytania do lekarza | lokalnie `DecisionContext` |

Kluczowa inspiracja z FHIR: rozdzielenie `Request` i `Event`.

Pacjent 360 powinien odroznic:

- co bylo zaplanowane,
- co zostalo zlecone,
- co faktycznie sie wydarzylo,
- co ma wynik,
- co nadal jest tylko kandydatem do potwierdzenia.

## Docelowy Model Danych

### TimelineEvent

```text
TimelineEvent
- id
- patientId
- type:
  - encounter
  - document
  - observation
  - diagnostic_report
  - medication
  - procedure
  - interview
  - transcript
  - care_task
  - ditl_question
  - consent
- layer
- title
- patientText
- clinicianText
- occurredAt
- periodStart?
- periodEnd?
- timePrecision: exact | day | month | year | unknown
- encounterId?
- episodeId?
- sourceRefs[]
- actorRefs[]
- relatedRequestIds[]
- relatedEventIds[]
- visibilityScopes[]
- confidence:
  - sourceReliability: high | medium | low | unknown
  - extractionConfidence: high | medium | low | manual
  - confirmationStatus: candidate | to_confirm | confirmed | rejected | superseded
- status:
  - planned
  - candidate
  - to_confirm
  - confirmed
  - rejected
  - superseded
```

### TimelineEpisode

```text
TimelineEpisode
- id
- patientId
- title
- kind:
  - life_period
  - chronic_condition
  - diagnostic_episode
  - procedure_path
  - hospitalization
  - post_visit_loop
  - medication_reconciliation
- periodStart
- periodEnd?
- status:
  - open
  - closed
  - paused
  - uncertain
  - needs_context
- triggerEventIds[]
- eventIds[]
- mainEncounterIds[]
- unresolvedQuestionIds[]
- sourceRefs[]
- confidence
```

### TimelineRelation

Relacja nie jest dowodem przyczynowosci.

```text
TimelineRelation
- id
- fromEventId
- toEventId
- relationType:
  - same_source
  - same_encounter
  - same_episode
  - follows_in_time
  - related_by_user
  - conflicting_sources
  - missing_confirmation
- certainty: high | medium | low
- sourceRefs[]
- labelPatient
- labelClinician
```

W UI nie wolno pisac "A spowodowalo B".

Dopuszczalne:

- "powiazane czasowo",
- "dotyczy tego samego okresu",
- "z tego samego dokumentu",
- "zrodla mowia rozne rzeczy",
- "do omowienia z lekarzem".

## Warstwy Mapy

Warstwy sa wazniejsze niz zakladki. Uzytkownik powinien moc nakladac dane na jedna mape.

Warstwy docelowe:

1. Wizyty i konsultacje.
2. Hospitalizacje.
3. Zabiegi i procedury.
4. Badania laboratoryjne.
5. Diagnostyka obrazowa i inne raporty.
6. Leki: przepisane, wykupione, deklarowane, faktycznie brane, odstawione, OTC/suplementy.
7. Objawy i funkcjonowanie.
8. Obserwacje pacjenta.
9. Obserwacje opiekuna lub rodziny.
10. Dokumenty i transkrypcje.
11. Pytania DITL.
12. Zadania po wizycie.
13. Zgody i dostep jako warstwa audytowa.

## Poziomy Zoomu

### 1. Life View

Cale zycie pacjenta. Widoczne sa tylko duze pasma:

- choroby przewlekle,
- hospitalizacje,
- zabiegi,
- dlugie terapie,
- wazne zmiany funkcjonowania,
- istotne okresy opieki.

### 2. Period View

Wybrany okres: rok, kwartal, miesiac. Widac:

- wizyty,
- badania,
- dokumenty,
- leki,
- obserwacje,
- zadania,
- pytania DITL.

### 3. Episode View

Najwazniejszy poziom MVP.

Przyklady:

- przygotowanie do zabiegu,
- kontrola kardiologiczna,
- opieka po wypisie,
- porzadkowanie listy lekow,
- pogorszenie funkcjonowania,
- przygotowanie drugiej opinii.

Epizod jest pasmem na osi, nie karta.

### 4. Encounter View

Jedna wizyta jako mini-os:

```text
przed wizyta -> rozmowa -> ustalenia -> braki -> zadania po wizycie -> kontrola
```

To powinno byc centralne dla "co dalej po wizycie".

### 5. Source View

Najglebszy poziom:

- dokument,
- wynik,
- fragment transkrypcji,
- odpowiedz z wywiadu,
- wpis pacjenta,
- obserwacja opiekuna,
- import z systemu.

## Model Ekranu Desktop

```text
┌─────────────────────────────────────────────────────────────────────┐
│ Pacjent / okres / tryb: Zycie | Okres | Epizod | Wizyta | Zrodlo    │
├───────────────┬───────────────────────────────────────┬─────────────┤
│ WARSTWY       │ MAPA PACJENTA 360                      │ INSPEKTOR   │
│               │                                       │             │
│ [ ] Wizyty    │  ───────────── glowna linia ─────────  │ Zdarzenie   │
│ [ ] Badania   │      ╲ badanie                         │ Zrodla      │
│ [ ] Leki      │       ╲ lek do potwierdzenia           │ Status      │
│ [ ] Zabiegi   │        ╲ obserwacja opiekuna           │ Powiazania  │
│ [ ] Objawy    │         ╲ pytanie DITL                 │ Co dalej    │
│ [ ] Dokumenty │                                       │             │
│ [ ] Zadania   │  pasmo epizodu: kwalifikacja / opieka  │             │
├───────────────┴───────────────────────────────────────┴─────────────┤
│ MINI-MAPA: narodziny - epizody - hospitalizacje - dzis - planowane   │
└─────────────────────────────────────────────────────────────────────┘
```

Lewy panel to warstwy. Srodek to mapa. Prawy panel to inspektor zdarzenia.

## Model Mobile

Mobile nie powinien udawac desktopu.

Domyslny widok mobile:

- Episode View,
- szybkie chipy warstw: Wizyty, Leki, Badania, Zadania, Zrodla,
- swipe lewo/prawo po czasie,
- pinch/slider do zoomu,
- tap w zdarzenie otwiera bottom sheet,
- long press pokazuje zrodla i status,
- mini-mapa jako sticky pasek na dole.

## Karta Zdarzenia

Karta na mapie ma byc krotka.

Zawiera:

- date,
- typ zdarzenia,
- krotki tytul,
- status: potwierdzone / do wyjasnienia / rozbieznosc / planowane,
- zrodlo: dokument / wywiad / pacjent / opiekun / lekarz,
- ikone warstwy.

Nie zawiera dlugiego opisu. Dlugie opisy zabijaja timeline. Szczegoly ida do inspektora.

## Inspektor Zdarzenia

Po kliknieciu zdarzenia inspektor pokazuje:

- co to jest,
- kiedy sie wydarzylo,
- skad to wiemy,
- kto to powiedzial, wpisal lub dostarczyl,
- z czym jest powiazane,
- jaki jest status pewnosci,
- co jest niejasne,
- pytania DITL,
- zadania organizacyjne,
- historia zmian,
- zakres widocznosci i zgody.

## Tryby Produktowe

Nad jedna mapa powinny istniec trzy glowne tryby:

### Widze historie

Cel: zrozumiec, co sie wydarzylo.

Pytania uzytkownika:

- Co sie ze mna dzialo?
- Kiedy byla ostatnia wizyta?
- Jakie byly wazne epizody?
- Skad pochodzi dana informacja?

### Przygotowuje wizyte

Cel: uporzadkowac kontekst przed kontaktem z lekarzem.

Pytania uzytkownika:

- Co zabrac?
- Jakie dokumenty sa potrzebne?
- Jakie leki trzeba potwierdzic?
- Co chce powiedziec lekarzowi?
- Czego brakuje?

### Wracam po wizycie

Cel: nie zgubic ustalen i krokow organizacyjnych po kontakcie.

Pytania uzytkownika:

- Co zrozumialem z wizyty?
- Co wymaga potwierdzenia?
- Jakie zadania powstaly?
- Jakie dokumenty trzeba zebrac?
- Kiedy jest kolejny kontakt?
- W czym moze pomoc opiekun?

## Asystenci Operacyjni

Asystenci dzialaja na timeline, ale nie podejmuja decyzji klinicznych.

Kazdy output asystenta musi miec:

- typ: pytanie, zadanie, status albo draft,
- zrodlo,
- poziom pewnosci,
- autora lub pochodzenie,
- status potwierdzenia,
- mozliwosc odrzucenia,
- slad audytu.

### Interpretator Wizyty

Input:

- transkrypcja,
- notatka pacjenta,
- dokument z wizyty.

Output:

- draft "co pacjent zrozumial",
- lista pojec do wyjasnienia,
- pytania do lekarza,
- zadania organizacyjne po wizycie.

### Ekstraktor Zdarzen z Transkrypcji

Input:

- rozmowa z lekarzem,
- rozmowa z pacjentem,
- rozmowa z opiekunem.

Output:

- kandydat zdarzenia,
- typ warstwy,
- cytat lub fragment zrodla,
- status `do potwierdzenia`,
- pytanie: "Czy to zdarzenie ma trafic na Mape Pacjenta 360?".

### Asystent Lekowy

Output:

- rozbieznosc: przepisany vs deklarowany jako przyjmowany,
- status: brak potwierdzenia godziny lub sposobu przyjmowania,
- zadanie: potwierdz aktualna liste lekow z lekarzem lub opiekunem,
- draft harmonogramu z dokumentu albo wpisu pacjenta.

Nie wolno:

- zmieniac dawki,
- sugerowac odstawienia,
- sugerowac zamiennika,
- wybierac terapii.

### Asystent Wizyt

Output:

- checklista dokumentow,
- lista pytan pacjenta,
- status przygotowania,
- zadanie: uzupelnij wynik, dokument lub date poprzedniej wizyty,
- po wizycie: zapisz termin kontroli, badanie, dokument lub pytanie do potwierdzenia.

### Asystent Dokumentow

Output:

- typ dokumentu,
- data dokumentu,
- data zdarzenia,
- powiazanie z wizyta lub epizodem,
- brakujace metadane,
- pytanie: "Czy ten dokument dotyczy tej wizyty lub epizodu?".

### Asystent Brakow Danych

Output:

- brak daty,
- brak zrodla,
- brak potwierdzenia leku,
- konflikt dokument vs wywiad,
- pytanie DITL,
- zadanie organizacyjne.

## Guardrails DITL

Twarde stop:

- brak automatycznej diagnozy,
- brak triage,
- brak decyzji terapeutycznych,
- brak zmiany lekow,
- brak oceny pilnosci,
- brak jezyka "system zaleca",
- brak ukrytych autonomicznych dzialan.

Dozwolone outputy:

- pytanie,
- zadanie organizacyjne,
- status,
- brak danych,
- rozbieznosc,
- draft do potwierdzenia,
- powiazanie zrodlowe,
- powiazanie czasowe.

## Co Zmienic w Obecnym MVP

### P0

1. Zmienic nazwe widoku z "Oś czasu" na "Mapa Pacjenta 360" albo "Historia Pacjenta 360".
2. Timeline pokazac jako centralny komponent kokpitu, nie tylko osobna zakladke.
3. Skrocic karty zdarzen i przeniesc szczegoly do inspektora.
4. Dodac statusy zdarzen: potwierdzone, do potwierdzenia, rozbieznosc, planowane.
5. Dodac pierwszy model `TimelineEpisode`.

### P1

1. Dodac pasma epizodow na osi.
2. Dodac panel warstw zamiast samej legendy.
3. Dodac relacje miedzy zdarzeniami jako neutralne powiazania, nie przyczynowosc.
4. Dodac Encounter View: przed wizyta, rozmowa, ustalenia, braki, zadania.
5. Dodac bottom-sheet inspektor na mobile.

### P2

1. Dodac kandydatow zdarzen z transkrypcji.
2. Dodac asystenta brakow danych.
3. Dodac asystenta dokumentow.
4. Dodac asystenta lekowego jako warstwe operacyjna.
5. Dodac consent-aware filtering dla opiekuna.

## Kryteria Sukcesu

Timeline jest gotowy do kolejnego poziomu MVP, gdy:

- pacjent rozumie swoja historie bez pomocy,
- lekarz w 90 sekund widzi najwazniejsze luki i pytania,
- opiekun wie, w czym moze pomoc i jaki ma zakres dostepu,
- kazde zdarzenie ma zrodlo albo status `do potwierdzenia`,
- leki odrozniaja przepisane od faktycznie przyjmowanych,
- wywiad i obserwacje rodziny nie sa prezentowane jako fakty laboratoryjne,
- system nie sugeruje diagnozy, triage ani terapii,
- mapa dziala od ogolu do szczegolu na desktop i mobile.

## Kierunek Po Redesign v0.3

Redesign v0.3 wdrozyl bezpieczna warstwe prezentacji nad obecnym kontraktem danych. Kontrakt nadal ma 9 trackow timeline, a widok mapy grupuje je w 6 lane'ow prezentacyjnych:

- Kontakty z opieka,
- Objawy i funkcjonowanie,
- Badania i wyniki,
- Leki,
- Ustalenia i plan,
- Zrodla i wywiad.

Co weszlo do MVP:

- semantic zoom: `Zycie / Okres / Epizod / Wizyta`,
- domyslny aktywny epizod zamiast calego zycia,
- panel `Film w skrocie` jako 5 etapow historii,
- pasma epizodow jako tlo mapy,
- krotkie karty zdarzen i inspektor szczegolow,
- minimapa z aktualnym oknem,
- trzeci fikcyjny case `p3`: dziecko + rodzic przygotowujacy kontrole.

Co zostaje otwarte:

- pelny scrubber minimapy z przeciaganiem okna czasu,
- osobny widok `Encounter` dla pojedynczej wizyty,
- source-aware relacje widoczne dopiero po zaznaczeniu zdarzenia,
- osobna lista alternatywna dla timeline na potrzeby a11y i walidacji,
- decyzja, czy lane'y maja zostac tylko prezentacja, czy wejsc do kontraktu danych.

Najwazniejsza decyzja projektowa:

> Na teraz lane'y sa prezentacja, nie kontrakt. Dzieki temu mapa moze wygladac jak film pacjenta bez migracji danych i bez naruszania walidatorow.

No-go po v0.3:

- nie zamieniac relacji czasowych w przyczynowosc,
- nie uzywac kolorow lane'ow jako pilnosci,
- nie ukrywac zrodel w trybie skroconym,
- nie robic osobnej historii dla lekarza i pacjenta.

## Antywzorce

- Jeden dlugi feed zdarzen bez warstw.
- Oddzielne timeline pacjenta i lekarza z roznymi historiami.
- Kolor czerwony jako sugestia oceny klinicznej.
- Wynik laboratoryjny i opinia opiekuna bez rozroznienia zrodla.
- "Aktualna lista lekow" bez rozroznienia: przepisane, deklarowane, faktycznie brane.
- Automatyczne podsumowania bez linkow do zrodel.
- Przyszle zdarzenia pokazane jak pewne fakty.
- Wnioski kliniczne bez statusu DITL.
- Timeline jako ozdobna wizualizacja zamiast narzedzia pracy.

## Zrodla Kierunkowe

- HL7 FHIR Workflow: https://hl7.org/fhir/R5/workflow.html
- HL7 FHIR Event Pattern: https://fhir.hl7.org/fhir/event.html
- HL7 FHIR Provenance: https://hl7.org/fhir/R4B/provenance.html
- AHRQ MATCH Toolkit: https://www.ahrq.gov/patient-safety/settings/hospital/match/index.html
- AHRQ Transitions of Care: https://www.ahrq.gov/topics/transitions-care.html
- NHS App GP Health Record: https://www.nhs.uk/nhs-app/help/health-records-in-the-nhs-app/gp-health-record/

## Decyzja Councilu

Pacjent 360 powinien przestac myslec o timeline jako o "module".

Docelowo:

> Pacjent 360 = Mapa Pacjenta 360 + soczewki: lekarz, pacjent, opiekun, dokumenty, leki, raport, zgody.

To jest produktowa roznica miedzy dashboardem a systemem, ktory naprawde pomaga spotkac sie przy tej samej historii.
