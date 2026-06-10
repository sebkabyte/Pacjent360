# CASE-01: Opiekun przygotowuje wizyte

Status: fikcyjny case walidacyjny M5. Nie uzywac realnych danych.

## Cel

Sprawdzic, czy opiekun potrafi uzyc widoku pacjenta do przygotowania rozmowy przed wizyta: dokumenty, leki, pytania, braki danych i zakres dostepu.

## Persona

- Opiekun rodzinny przygotowuje osobe bliska do konsultacji.
- Nie ma wyksztalcenia medycznego.
- Ma dostep tylko do obszarow pokazanych w demo.

## Kontekst demo

- Uzyj aktualnego demo Pacjent360.
- Przejdz do widoku pacjenta lub opiekuna.
- Nie wpisuj danych osobowych ani realnych wynikow.
- Traktuj wszystkie dane jako fikcyjne materialy testowe.

## Scenariusz krok po kroku

1. Popros uczestnika, aby powiedzial, gdzie widzi najblizszy kontakt medyczny.
2. Popros, aby wskazal, jakie dokumenty i wyniki trzeba przygotowac.
3. Popros, aby wskazal, ktore leki wymagaja potwierdzenia z pacjentem lub lekarzem.
4. Popros, aby znalazl pytania do omowienia podczas wizyty.
5. Popros, aby powiedzial, czy widzi zakres swojego dostepu i co sie stanie po cofaniu zgody.
6. Zakoncz pytaniem: "Co zabralbys na wizyte po obejrzeniu tego widoku?".

## Pytania obserwacyjne

- Czy opiekun rozumie roznice miedzy informacja z dokumentu a obserwacja z rozmowy?
- Czy opiekun widzi, ktore informacje sa niepewne lub do potwierdzenia?
- Czy opiekun rozumie, ze system porzadkuje kontekst, ale nie rozstrzyga spraw medycznych?
- Czy uczestnik potrafi nazwac jeden nastepny krok organizacyjny?
- Czy jakis element wyglada jak instrukcja medyczna zamiast pytania lub braku danych?

## Metryki szkody

- H-001: czy uczestnik odczytal raport jako rozstrzygniecie kliniczne?
- H-008: czy kolor lub flaga zostaly odczytane jako ocena kolejnosci kontaktu?
- H-009: czy ktorykolwiek komunikat brzmial uspokajajaco w sposob, ktory moglby opoznic kontakt z lekarzem?

## Stop-go

- Continue: uczestnik rozumie role systemu i wskazuje nastepny krok organizacyjny bez pomocy.
- Iterate: uczestnik widzi wartosc, ale myli status z zadaniem lub nie widzi zrodel.
- No-go: uczestnik traktuje output jako rozstrzygniecie kliniczne, ocene kolejnosci kontaktu albo instrukcje leczenia.
