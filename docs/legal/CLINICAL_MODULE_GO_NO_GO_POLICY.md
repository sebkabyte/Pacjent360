# Pacjent360 — Clinical Assist: Go/No-Go Policy

Status: brama decyzyjna dla modułu Clinical Assist — aktualnie ZAMKNIĘTA  
Data: 2026-06-26  
Decyzja założycielska: D-Legal-001 z 2026-06-26 — Clinical Assist WYŁĄCZONY do czasu osobnej decyzji  
Charakter dokumentu: polityka wewnętrzna i brama decyzyjna; nie stanowi opinii prawnej

## 1. Status bieżący

**Clinical Assist jest WYŁĄCZONY.**

Clinical Assist nie jest częścią MVP Pacjent360. Nie jest oferowany, nie jest wdrażany, nie jest reklamowany jako dostępny lub planowany w krótkim terminie.

Decyzja może zostać zmieniona wyłącznie przez foundera, po spełnieniu **wszystkich** warunków z sekcji 4 i udokumentowaniu decyzji w sekcji 6.

## 2. Co kwalifikuje się jako Clinical Assist

Każda funkcja, która realizuje jedno lub więcej z poniższych działań, jest Clinical Assist i podlega tej bramce:

### 2.1 Interpretacja i ocena kliniczna

- interpretacja wartości wyników badań jako normalnych, anormalnych, niepokojących, alarmowych lub bezpiecznych;
- odpowiedź na pytania: „co to oznacza", „czy to groźne", „co powinienem zrobić", „jakie są ryzyka";
- porównanie trendu klinicznego w czasie: „wynik się pogarsza", „progresja", „ryzyko nawrotu";
- scoring ryzyka klinicznego lub predykcja przebiegu.

### 2.2 Rekomendacje i postępowanie

- sugestia specjalisty na podstawie objawów lub danych klinicznych;
- sugestia badania diagnostycznego jako następnego kroku;
- sugestia leczenia, dawki, zamiany lub odstawienia leku;
- generowanie planów działania zawierających elementy medyczne.

### 2.3 Triage i pilność

- ocena pilności lub klasyfikacja zadań/alertów według kryterium medycznego;
- rekomendacja trybu wizyty: SOR, NaVi, pilna, planowa;
- generowanie alertów klinicznych z priorytetem opartym na ocenie stanu zdrowia;
- automatyczny booking lub eskalacja oparta na ocenie AI.

### 2.4 Care navigation

- wybór ścieżki opieki na podstawie oceny klinicznej;
- „prowadzenie pacjenta" przez kolejne kroki leczenia;
- rekomendacja podmiotu leczniczego lub formy opieki na podstawie stanu zdrowia.

### 2.5 Graniczne przypadki — domyślnie Clinical Assist

W razie wątpliwości, czy funkcja jest AI Drafting czy Clinical Assist, domyślna odpowiedź to **Clinical Assist** i bramka pozostaje zamknięta. Odblokowanie wymaga pisemnej opinii kancelarii, że funkcja może pozostać w AI Drafting.

## 3. Reguły izolacji — jak Clinical Assist nie zakaża Core i AI Drafting

### 3.1 Zakaz w kodzie

Żadna funkcja Clinical Assist nie może być:

- zaimplementowana jako feature flag w istniejącym kodzie bez osobnej decyzji prawnej;
- ukryta za parametrem URL lub ustawieniem konta;
- dostępna dla jakiegokolwiek użytkownika w środowisku demo lub staging.

### 3.2 Zakaz w publicznym copy

Żadne publiczne materiały (strona, README, materiały inwestorskie, komunikacja z lekarzami) nie mogą:

- wymieniać Clinical Assist jako planowanej funkcji dostępnej w określonym terminie;
- opisywać funkcji interpretacji wyników, oceny pilności, rekomendacji jako „wkrótce";
- używać fraz z `CLAIMS_REGISTER.md` sekcja 2 w kontekście przyszłych planów produktu.

Dozwolone: ogólne stwierdzenie, że „zaawansowane funkcje kliniczne są poza zakresem MVP i wymagają osobnej ścieżki regulacyjnej".

### 3.3 Zakaz w roadmapie publicznej

Roadmapa publiczna nie może zawierać timelineu dla Clinical Assist. Wewnętrzna roadmapa może zawierać notatkę: „Clinical Assist — blocked do D-CA-001".

### 3.4 Zakaz w MDR filing

Intended purpose składany kancelarii, URPL lub jednostce notyfikowanej dla Core i AI Drafting nie może zawierać funkcji Clinical Assist. Każde rozszerzenie intended purpose wymaga nowego MDR Classification Memo.

## 4. Warunki uruchomienia Clinical Assist — lista P0

Clinical Assist może zostać odblokowany wyłącznie po pisemnym potwierdzeniu spełnienia **wszystkich** poniższych warunków:

### 4.1 Ścieżka prawna i regulacyjna

| ID | Warunek | Status |
| --- | --- | --- |
| CA-P0-01 | MDR Classification Memo od kancelarii: wskazanie klasy wyrobu i ścieżki zgodności dla konkretnych funkcji Clinical Assist | LOCKED |
| CA-P0-02 | AI Act Classification Memo: ocena high-risk, zakres obowiązków, human oversight plan | LOCKED |
| CA-P0-03 | Decyzja: czy konsultacja z URPL lub jednostką notyfikowaną jest wymagana przed pilotem | LOCKED |
| CA-P0-04 | Pisemna opinia kancelarii: Clinical Assist może być uruchomiony na następujących warunkach | LOCKED |

### 4.2 System zarządzania jakością (QMS)

| ID | Warunek | Status |
| --- | --- | --- |
| CA-P0-05 | QMS wdrożone lub roadmapa QMS zatwierdzona przez kancelarię i/lub jednostkę notyfikowaną | LOCKED |
| CA-P0-06 | Risk management process zgodny z ISO 14971 (lub odpowiednikiem) | LOCKED |
| CA-P0-07 | Software lifecycle process zgodny z IEC 62304 lub odpowiednikiem | LOCKED |
| CA-P0-08 | Usability engineering process (np. IEC 62366) dla funkcji Clinical Assist | LOCKED |
| CA-P0-09 | Cybersecurity plan dla Clinical Assist | LOCKED |

### 4.3 Dokumentacja kliniczna

| ID | Warunek | Status |
| --- | --- | --- |
| CA-P0-10 | Clinical Evaluation Report lub jego plan dla danych funkcji | LOCKED |
| CA-P0-11 | Post-Market Surveillance plan: jak monitorujemy outputy kliniczne po uruchomieniu | LOCKED |
| CA-P0-12 | Incident Reporting procedure dla zdarzeń związanych z błędami klinicznymi | LOCKED |
| CA-P0-13 | Human Review SOP: kto, kiedy i w jaki sposób weryfikuje output Clinical Assist | LOCKED |

### 4.4 RODO i DPIA dla Clinical Assist

| ID | Warunek | Status |
| --- | --- | --- |
| CA-P0-14 | DPIA dla operacji przetwarzania w Clinical Assist (oddzielna od DPIA dla AI Drafting) | LOCKED |
| CA-P0-15 | DPA z dostawcą LLM dla funkcji Clinical Assist | LOCKED |
| CA-P0-16 | Retencja danych dla outputów Clinical Assist — decyzja udokumentowana | LOCKED |
| CA-P0-17 | Prawa osób: dostęp, sprzeciw, usunięcie dla outputów klinicznych | LOCKED |

### 4.5 Pilot i walidacja kliniczna

| ID | Warunek | Status |
| --- | --- | --- |
| CA-P0-18 | Protokół pilotowy z placówką: zakres, uczestniczy, zgody, usuwanie danych | LOCKED |
| CA-P0-19 | Ocena: czy pilotowanie Clinical Assist wymaga zgody komisji bioetycznej | LOCKED |
| CA-P0-20 | Walidacja kliniczna: metryki, progi akceptacji, procedura eskalacji przy błędach | LOCKED |

### 4.6 Decyzja założycielska

| ID | Warunek | Status |
| --- | --- | --- |
| CA-P0-21 | Pisemna decyzja go/no-go foundera z datą i podstawą (warunki z CA-P0-01 do CA-P0-20 spełnione) | LOCKED |
| CA-P0-22 | Aktualizacja niniejszego dokumentu: zmiana statusu z LOCKED na OPEN z datą i referencją do opinii prawnej | LOCKED |

## 5. Definicja granic — czym nie jest Clinical Assist

Poniższe funkcje **nie są** Clinical Assist, jeżeli są właściwie ograniczone:

| Funkcja | Warunek pozostania poza Clinical Assist |
| --- | --- |
| Wyświetlenie wartości badania z zakresem referencyjnym ze źródła | Zakres referencyjny pochodzi wyłącznie ze źródła, nie jest oceniany przez system |
| Pytanie DITL: „Czy wynik X z dnia Y jest nadal aktualny?" | Pytanie nie sugeruje odpowiedzi ani postępowania |
| Task: „Sprawdź możliwość rejestracji zgodnie ze skierowaniem" | Task pochodzi wyłącznie ze źródła, nie z inferencji klinicznej |
| Plain language: „W dokumencie zapisano kontrolę u kardiologa za 6 miesięcy" | Nie interpretuje potrzeby, pilności ani wyboru |
| CITO jako cytat ze źródła z disclaimerem | Brak kolorów alertu, sortowania, scoringu |

Jeśli funkcja wykracza poza te warunki — jest Clinical Assist.

## 6. Historia decyzji

| Data | Decyzja | Opis | Autor |
| --- | --- | --- | --- |
| 2026-06-26 | D-Legal-001 | Clinical Assist WYŁĄCZONY. Founder przyjął Alternatywę C: Core + AI Drafting jako MVP; Clinical Assist jako wyłączony przyszły moduł regulowany. | Sebastian Kalisz |

## 7. Procedura odblokowania

Gdy founder uzna, że warunki z sekcji 4 zostały spełnione:

1. Aktualizuje tabelę warunków — każdy wiersz zmienia status z LOCKED na DONE z datą i referencją do dokumentu potwierdzającego.
2. Zapisuje decyzję w sekcji 6 jako nowy wpis D-CA-001.
3. Informuje kancelarię o zmianie statusu.
4. Aktualizuje `PROD_INTENDED_PURPOSE_BY_MODULE.md` sekcja 5.2.
5. Tworzy osobne repo lub komponent z dokumentacją MDR dla Clinical Assist.

**Do czasu decyzji D-CA-001 — Clinical Assist pozostaje WYŁĄCZONY.**
