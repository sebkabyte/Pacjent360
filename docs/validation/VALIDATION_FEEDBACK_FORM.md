# Pacjent360™: formularz walidacji MVP

Status: szablon do rozmow z reviewerami. Uzywaj tylko na fikcyjnych case studies. Nie zapisuj realnych danych pacjentow.

Cel sesji: sprawdzic, czy raport kontekstowy pomaga szybciej zobaczyc, co trzeba wyjasnic przed kontaktem medycznym, a widok pacjenta/opiekuna pomaga przygotowac sie do wizyty.

## Zasady bezpieczenstwa sesji

- Nie wprowadzamy realnych danych medycznych ani danych osobowych.
- Reviewer ocenia format, workflow i jasnosc, nie realny przypadek kliniczny.
- Pacjent360™ nie diagnozuje, nie ustala pilnosci, nie zaleca terapii i nie zastepuje lekarza.
- Jesli reviewer mowi "to wyglada jak diagnoza / triage / zalecenie", zapisujemy to jako safety concern.

## Metadane sesji

| Pole | Wpis |
| --- | --- |
| Session ID | `VAL-YYYYMMDD-XX` |
| Data | |
| Persona reviewera | lekarz POZ / specjalista / pacjent / opiekun / UX / prawnik / techniczny |
| Case study | gotowosc do procedury / konsultacja specjalistyczna / nagla zmiana stanu / uzgodnienie lekow / przejscie opieki |
| Tryb | strona WWW / demo desktop / demo mobile / raport PDF/druk |
| Czy uzyto realnych danych? | NIE |

## Zadanie dla lekarza

Pokaz raport kontekstowy bez dodatkowego tlumaczenia.

1. Zmierz czas do pierwszej odpowiedzi na pytanie: "Co trzeba wyjasnic przed kontaktem medycznym?".
2. Popros o ocene 1-5:
   - przydatnosc raportu,
   - czytelnosc,
   - zaufanie do zrodel,
   - ryzyko mylnej interpretacji,
   - zrozumienie DITL.
3. Zapisz odpowiedzi otwarte:
   - Co pomoglo?
   - Co przeszkadzalo?
   - Czego brakuje?
   - Czy cos wyglada jak diagnoza, triage albo zalecenie?

## Zadanie dla pacjenta lub opiekuna

Pokaz widok pacjenta/opiekuna i flow przygotowania do wizyty.

1. Zapytaj, czy reviewer rozumie:
   - co wiadomo,
   - czego brakuje,
   - co trzeba przygotowac,
   - co trzeba omowic z lekarzem,
   - kto ma dostep do jakich danych.
2. Popros o ocene 1-5:
   - zrozumialosc,
   - poczucie kontroli,
   - jasnosc zakresu zgody/opiekuna,
   - pewnosc nastepnego kroku,
   - ryzyko nadinterpretacji.

## Skale

| Ocena | Znaczenie |
| ---: | --- |
| 1 | nie dziala / niezrozumiale / wysokie ryzyko |
| 2 | raczej nieprzydatne |
| 3 | neutralne, wymaga poprawek |
| 4 | przydatne, z drobnymi poprawkami |
| 5 | bardzo przydatne i jasne |

## Safety check

Zaznacz TAK/NIE:

| Pytanie | TAK/NIE | Notatka |
| --- | --- | --- |
| Czy raport wyglada jak diagnoza? | | |
| Czy raport wyglada jak triage albo ocena pilnosci? | | |
| Czy system brzmi, jakby zalecal leczenie? | | |
| Czy zrodla informacji sa jasne? | | |
| Czy widac, ze dane sa fikcyjne/demo? | | |
| Czy DITL jest zrozumiale? | | |
| Czy reviewer rozumie bez pomocy cel raportu i nastepny krok? | | |

## Decyzja po sesji

| Decyzja | Kiedy zaznaczyc |
| --- | --- |
| Continue | reviewer rozumie cel, brak serious safety concern, ocena przydatnosci >= 4 |
| Iterate | format ma wartosc, ale wymaga poprawek |
| Pivot | reviewer nie rozumie celu albo oceny sa niskie |
| No-go | pojawia sie serious safety concern: diagnoza, triage, zalecenie, realne dane |

## Notatki

- Najwazniejsza rzecz, ktora pomogla:
- Najwazniejsza rzecz do poprawy:
- Cytat/parafraza reviewera:
- Konkretna zmiana w backlogu:
