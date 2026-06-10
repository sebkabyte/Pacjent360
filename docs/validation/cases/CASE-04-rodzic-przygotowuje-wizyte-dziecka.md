# CASE-04: Rodzic przygotowuje wizyte dziecka

Status: fikcyjny case walidacyjny M5. Nie uzywac realnych danych.

## Cel

Sprawdzic, czy rodzic potrafi uzyc Pacjent360 do przygotowania kontroli dziecka po infekcji: dokumenty, wyniki, leki faktycznie podane w domu, obserwacje rodzica, pytania do lekarza i zakres dostepu drugiego rodzica.

## Persona

- Rodzic przygotowuje dziecko do kontroli pediatrycznej.
- Rodzic ma dokumenty, wynik kontrolny i wlasne obserwacje z domu.
- Drugi rodzic ma ograniczony zakres dostepu: wizyty, dokumenty i zadania organizacyjne.

## Kontekst demo

- Uzyj pacjenta `Przypadek pediatryczny C`.
- Przejdz do widoku pacjenta, mapy, lekow, zgody i kokpitu opiekuna.
- Nie wpisuj danych osobowych ani realnych wynikow.
- Traktuj wszystkie dane jako fikcyjne materialy testowe.

## Scenariusz krok po kroku

1. Popros uczestnika, aby wskazal termin kontroli pediatrycznej.
2. Popros, aby znalazl dokumenty i wyniki, ktore rodzic ma przygotowac.
3. Popros, aby wskazal roznice miedzy lekiem zapisanym w dokumencie a tym, co rodzic zglasza jako faktycznie podane.
4. Popros, aby odnalazl obserwacje rodzica i powiedzial, czy sa opisane jako wywiad/obserwacja, a nie jako fakt laboratoryjny.
5. Popros, aby sprawdzil, co widzi drugi rodzic w ograniczonym zakresie dostepu.
6. Zakoncz pytaniem: "Co zabralbys na wizyte dziecka po obejrzeniu tego widoku?".

## Pytania obserwacyjne

- Czy rodzic rozumie roznice miedzy dokumentem, wynikiem, wywiadem i obserwacja opiekuna?
- Czy rodzic widzi, ktore informacje sa do potwierdzenia z lekarzem?
- Czy rodzic rozumie, ze system porzadkuje kontekst, ale nie rozstrzyga spraw medycznych?
- Czy uczestnik potrafi nazwac jeden nastepny krok organizacyjny?
- Czy ograniczony dostep drugiego rodzica jest zrozumialy?
- Czy jakis element wyglada jak instrukcja medyczna zamiast pytania, zadania albo braku danych?

## Metryki szkody

- H-001: czy uczestnik odczytal raport jako rozstrzygniecie kliniczne?
- H-008: czy kolor lub flaga zostaly odczytane jako ocena kolejnosci kontaktu?
- H-009: czy ktorykolwiek komunikat brzmial uspokajajaco w sposob, ktory moglby opoznic kontakt z lekarzem?

## Stop-go

- Continue: uczestnik rozumie role systemu i wskazuje nastepny krok organizacyjny bez pomocy.
- Iterate: uczestnik widzi wartosc, ale myli obserwacje rodzica z wynikiem albo nie widzi zakresu zgody.
- No-go: uczestnik traktuje output jako rozstrzygniecie kliniczne, ocene kolejnosci kontaktu albo instrukcje leczenia.
