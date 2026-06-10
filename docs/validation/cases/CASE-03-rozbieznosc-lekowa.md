# CASE-03: Rozbieznosc lekowa

Status: fikcyjny case walidacyjny M5. Nie uzywac realnych danych.

## Cel

Sprawdzic, czy pacjent, opiekun i lekarz widza roznice miedzy lekiem przepisanym, lekiem faktycznie przyjmowanym i informacja wymagajaca potwierdzenia.

## Persona

- Pacjent lub opiekun przygotowuje liste lekow przed kontaktem medycznym.
- Lekarz-reviewer ocenia, czy raport pokazuje rozbieznosc bez narzucania odpowiedzi.
- Wszystkie nazwy lekow w sesji sa fikcyjne lub zastapione neutralnymi etykietami.

## Kontekst demo

- Uzyj modulu lekow i raportu kontekstowego.
- Pokaz statusy: przepisane, przyjmowane, do potwierdzenia, odstawione albo niejasne.
- Nie wpisuj nazw realnych lekow z zycia uczestnika.

## Scenariusz krok po kroku

1. Popros uczestnika, aby wskazal aktualna liste lekow w demo.
2. Popros, aby znalazl roznice miedzy dokumentem a wywiadem.
3. Popros, aby wskazal, kto jest zrodlem informacji: dokument, pacjent, opiekun albo lekarz.
4. Popros, aby wskazal pytanie do omowienia podczas kontaktu medycznego.
5. Zapytaj, czy system wyglada, jakby sam rozstrzygal, ktora wersja listy jest prawidlowa.
6. Zapytaj, jaki element pomoglby lepiej przygotowac liste lekow.

## Pytania obserwacyjne

- Czy uczestnik widzi, ze rozbieznosc jest statusem do wyjasnienia?
- Czy uczestnik rozumie, ze wywiad nie jest faktem laboratoryjnym ani dokumentem?
- Czy lekarz widzi, skad pochodzi kazda informacja?
- Czy etykiety lekowe sa logistyczne, a nie medycznie rozstrzygajace?
- Czy uczestnik probuje wpisac realne dane mimo instrukcji?

## Metryki szkody

- H-001: czy uczestnik odczytal rozbieznosc jako rozstrzygniecie kliniczne?
- H-008: czy kolor statusu zostal odczytany jako ocena kolejnosci kontaktu?
- H-009: czy tekst sugerowal, ze brak potwierdzenia nie wymaga rozmowy z lekarzem?

## Stop-go

- Continue: uczestnik potrafi wskazac zrodlo informacji i pytanie do omowienia.
- Iterate: uczestnik rozumie cel, ale statusy wymagaja prostszych nazw lub lepszego kontrastu.
- No-go: uczestnik traktuje status leku jako instrukcje zmiany leczenia albo pewna odpowiedz systemu.
