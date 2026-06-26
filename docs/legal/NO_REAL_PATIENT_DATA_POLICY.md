# Pacjent360 — No Real Patient Data Policy

Status: polityka obowiązująca natychmiast  
Data: 2026-06-26  
Zakres: repo, demo, fixtures, testy, issues, PR, support, dokumentacja, zrzuty ekranu, walidacja, logi  
Charakter dokumentu: polityka wewnętrzna i zobowiązanie publiczne; nie stanowi opinii prawnej

## 1. Cel polityki

Ta polityka formalizuje bezwzględny zakaz używania realnych danych pacjentów we wszystkich warstwach projektu Pacjent360 do czasu uruchomienia produkcji z kompletną ścieżką RODO (DPIA, DPA, retencja, subprocesorzy, prawa osób).

Podstawa: analiza GPT PRO Extended (`docs/legal/FOUNDER z GPTPRO EXTENDED.txt`), RODO art. 9, MDCG 2019-11, decyzja D-Legal-001.

## 2. Zakres zakazu

### 2.1 Dane objęte zakazem

Zakazane jest używanie danych umożliwiających identyfikację osoby oraz danych zdrowotnych, w tym:

- imię, nazwisko, PESEL, data urodzenia, adres, numer telefonu, adres e-mail;
- dane z dokumentów medycznych: wypisy, wyniki badań, recepty, skierowania, transkrypcje wizyt, listy leków;
- dane diagnostyczne, terapeutyczne lub dotyczące stanu zdrowia;
- dane, które w połączeniu z innymi mogłyby identyfikować osobę (pseudonim, inicjały + data urodzenia itp.);
- zdjęcia lub skany dokumentów zawierające dane pacjenta;
- dane genetyczne i biometryczne.

### 2.2 Warstwy objęte zakazem

Zakaz obowiązuje bezwzględnie we wszystkich poniższych warstwach:

| Warstwa | Przykłady |
| --- | --- |
| Repozytorium kodu | commit, patch, branch, tag |
| Issues i Pull Requests | opis buga, reprodukcja, załącznik, komentarz |
| Fixtures i snapshoty testowe | `fixtures/`, `tests/`, `__fixtures__/` |
| Demo i środowisko lokalne | `public/demo.html`, localStorage, exported JSON |
| Prompty i odpowiedzi LLM | pliki z promptami, logi promptów, przykłady |
| Dokumentacja i README | przykłady w docs, zrzuty ekranu, mockupy |
| Support i komunikacja | e-mail, Slack, formularz kontaktowy |
| Sesje walidacyjne z lekarzami i pacjentami | materiały do oceny, formularze feedbacku |
| Logi i monitoring | error logs, audit logs, analytics |
| Backup i archiwum | backup lokalny, cloud storage repozytorium |
| Materiały inwestorskie | prezentacje, demo live, screenshots |

## 3. Wymagania dla danych testowych i demonstracyjnych

### 3.1 Dane fikcyjne — reguły tworzenia

Wszystkie dane testowe, fixture'y i dane demo muszą być:

- całkowicie fikcyjne — imiona, nazwiska, PESEL-e i daty bez podobieństwa do realnych osób;
- kompozytowe — tworzone syntetycznie, nie na podstawie realnych przypadków;
- wyraźnie oznaczone jako fikcyjne w pliku lub komentarzu;
- niemożliwe do pomylenia z realną osobą nawet w kombinacji z innymi danymi.

Zakazane jest:

- anonimizowanie realnych danych pacjentów i używanie ich jako fixtures;
- używanie realnych danych z usuniętym nazwiskiem (pseudoanonimizacja bez pełnej anonimizacji);
- używanie danych z rozmów supportowych lub sesji walidacyjnych jako fixture'ów testowych.

### 3.2 Oznaczenie danych fikcyjnych

Każdy plik fixtures lub danych demo musi zawierać na początku:

```json
{
  "_dataClassification": "SYNTHETIC_DEMO_ONLY",
  "_realDataForbidden": true,
  "_note": "Dane wyłącznie fikcyjne. Nie zawierają ani nie mogą zawierać danych realnych pacjentów."
}
```

lub odpowiedni komentarz w formacie pliku.

## 4. Bramka wejściowa demo

### 4.1 Wymaganie UI

Przed możliwością użycia demo aplikacja musi wyświetlić modal blokujący z następującą treścią:

> **Demo Pacjent360 — wyłącznie dane fikcyjne**
>
> To demo działa wyłącznie na danych fikcyjnych. Nie wpisuj imion, nazwisk, numerów PESEL, danych kontaktowych, dokumentacji medycznej, wyników badań ani żadnych danych umożliwiających identyfikację osoby.
>
> Demo nie jest przeznaczone do realnego użycia klinicznego. Jest prototypem koncepcyjnym na syntetycznych danych.

Wymagany checkbox:

> ☐ Potwierdzam, że używam wyłącznie danych fikcyjnych i nie wprowadzę danych osobowych ani zdrowotnych.

Modal nie może być zamknięty bez zaznaczenia checkboxa.

### 4.2 Stały baner w demo

Przez cały czas używania demo widoczny jest baner:

> „PROTOTYP KONCEPCYJNY — DANE FIKCYJNE — NIE DO UŻYTKU KLINICZNEGO"

### 4.3 Reset danych lokalnych

Demo musi zawierać widoczny przycisk: „Usuń wszystkie dane z tej przeglądarki" z potwierdzeniem.

## 5. Wymagania techniczne

### 5.1 Brak przechwytywania treści pól

- Telemetry i analytics nie mogą przechwytywać wartości pól formularzy.
- Session replay (np. Hotjar, FullStory) jest zakazany bez osobnej oceny prawnej.
- Error logging nie może zawierać payloadu z danymi z pól (tylko typy błędów, kody, stack trace bez danych).

### 5.2 Brak zewnętrznych skryptów czytających localStorage

- Content Security Policy musi blokować zewnętrzne skrypty przed dostępem do localStorage.
- Lista zewnętrznych skryptów na stronie demo musi być minimalna i udokumentowana.
- Każdy nowy zewnętrzny skrypt wymaga przeglądu przed dodaniem.

### 5.3 Sanitizer localStorage

Aplikacja musi zawierać mechanizm sprawdzający i usuwający stare dane z localStorage przy każdym uruchomieniu demo (istniejący sanitizer w app.js powinien obejmować pola mogące zawierać dane osobowe).

## 6. Procedura dla sesji walidacyjnych

### 6.1 Zakaz realnych danych w walidacji

Sesje walidacyjne z lekarzami i pacjentami/opiekunami muszą być prowadzone wyłącznie na fikcyjnych case studies.

Organizator sesji walidacyjnej musi:

- udostępnić uczestnikom wyłącznie fikcyjne scenariusze;
- poinstruować uczestników, że nie wolno wprowadzać realnych danych pacjentów;
- zapewnić, że formularz feedbacku nie zawiera pól na dane zdrowotne realnych pacjentów;
- usunąć wszelkie dane identyfikacyjne uczestników po zakończeniu analizy, zgodnie z deklarowanym okresem retencji.

### 6.2 Privacy notice dla uczestników walidacji

Przed udziałem w sesji walidacyjnej uczestnik musi otrzymać informację:

- kto jest administratorem danych osobowych uczestników (imię, e-mail, zawód);
- w jakim celu są przetwarzane;
- jak długo są przechowywane;
- jak uczestnik może poprosić o usunięcie danych.

## 7. Procedura dla repo i contributerów

### 7.1 Checklist przed commitem

Przed każdym commitem autor sprawdza:

- ☐ Czy żaden plik nie zawiera imion, nazwisk, PESEL lub danych kontaktowych realnych osób?
- ☐ Czy żaden fixture nie zawiera danych zdrowotnych realnych pacjentów?
- ☐ Czy żaden screenshot, mockup ani dokument nie pokazuje realnych danych pacjenta?
- ☐ Czy prompt systemowy lub przykłady promptów nie zawierają realnych danych zdrowotnych?
- ☐ Czy logi lub dane debugowania nie zawierają treści z pól danych?

### 7.2 Instrukcja dla contributerów

W `CONTRIBUTING.md` lub `SECURITY.md` musi znaleźć się wpis:

> „Nie wolno commitować realnych danych pacjentów, danych zdrowotnych ani danych osobowych umożliwiających identyfikację. Wszystkie dane testowe i demonstracyjne muszą być wyłącznie fikcyjne. Jeśli przypadkowo zobaczysz realne dane w repo — zgłoś to przez kanał security, nie komentuj w issuu ani PR."

### 7.3 Kanał bezpiecznego zgłoszenia

Każde wykrycie potencjalnych realnych danych w repo musi być zgłoszone przez `security@pacjent360.com.pl` (lub aktywny alias bezpieczeństwa), a nie przez publiczne issue lub komentarz PR.

## 8. Wyjątki i ścieżka produkcji

### 8.1 Kiedy ta polityka przestaje być bezwzględna

Ta polityka może zostać zmieniona wyłącznie po:

1. zatwierdzonej DPIA dla konkretnego zakresu przetwarzania;
2. podpisanej DPA z każdym dostawcą przetwarzającym dane (LLM, hosting, analytics, monitoring, support);
3. zatwierdzonej polityce retencji i usuwania danych;
4. wdrożeniu praw osób (dostęp, sprzeciw, usunięcie, przeniesienie);
5. pisemnej decyzji go/no-go foundera i kancelarii;
6. aktualizacji niniejszej polityki przez foundera z datą i podstawą zmiany.

### 8.2 Pilot z placówką

Nawet zamknięty pilot z placówką z realnymi danymi pacjentów wymaga spełnienia warunków z sekcji 8.1 oraz osobnego `PILOT_PROTOCOL_PRIVACY_PACK.md`.

## 9. Historia zmian

| Data | Zmiana | Autor |
| --- | --- | --- |
| 2026-06-26 | Pierwsza wersja — polityka P0 na podstawie decyzji D-Legal-001 | Claude (D-Legal-001) |
