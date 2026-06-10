# CASE-02: Lekarz i kontekst w 90 sekund

Status: fikcyjny case walidacyjny M5. Nie uzywac realnych danych.

## Cel

Sprawdzic, czy lekarz potrafi w krotkim czasie zobaczyc: co wiadomo, czego brakuje, co jest niepewne i co warto wyjasnic z pacjentem lub opiekunem.

## Persona

- Lekarz POZ albo specjalista oceniajacy format raportu.
- Ma ograniczony czas i oglada demo bez dodatkowego tlumaczenia.
- Nie ocenia poprawnosci medycznej przypadku, tylko przydatnosc ukladu informacji.

## Kontekst demo

- Uzyj aktualnego raportu kontekstowego w demo.
- Pokaz widok lekarza i mape zdarzen.
- Nie dopowiadaj znaczenia flag, zanim lekarz sam opisze pierwsze wrazenie.

## Scenariusz krok po kroku

1. Pokaz raport i wlacz pomiar czasu.
2. Zapytaj: "Co wedlug Pani/Pana trzeba wyjasnic przed kontaktem medycznym?".
3. Po pierwszej odpowiedzi zatrzymaj czas.
4. Popros, aby lekarz wskazal zrodlo jednej informacji w raporcie.
5. Popros, aby lekarz wskazal jeden brak danych i jedna niepewnosc.
6. Pokaz mape zdarzen i zapytaj, czy pomaga odtworzyc historie przypadku.
7. Zapytaj, ktora sekcja powinna zniknac, zostac skrocona albo zmienic nazwe.

## Pytania obserwacyjne

- Czy lekarz rozumie sens Doctor in the Loop?
- Czy lekarz potrafi rozroznic dane potwierdzone, obserwacje i braki?
- Czy mapa zdarzen przyspiesza zrozumienie historii, czy przeszkadza?
- Czy lekarz widzi zrodla informacji bez szukania?
- Czy raport brzmi jak pytania do wyjasnienia, a nie jak gotowa odpowiedz?

## Metryki szkody

- H-001: czy lekarz odczytal raport jako rozstrzygniecie kliniczne?
- H-008: czy kolor lub flaga zostaly odczytane jako ocena kolejnosci kontaktu?
- H-009: czy jakikolwiek tekst sugerowal, ze kontakt z lekarzem moze byc mniej potrzebny?

## Stop-go

- Continue: lekarz w 90 sekund wskazuje najwazniejsze braki i rozumie, ze raport jest kontekstem.
- Iterate: lekarz widzi wartosc, ale potrzebuje prostszych etykiet, krotszego raportu albo lepszych zrodel.
- No-go: lekarz mowi, ze raport moze byc odebrany jako gotowe rozstrzygniecie kliniczne albo instrukcja leczenia.
