# Product Blueprint

## Cel dokumentu

Ustalić, czym jest Pacjent360 jako produkt, czym nie jest i jaki pierwszy fragment warto pokazać użytkownikom.

## Czym jest produkt

Pacjent360 jest narzędziem do przygotowania kontekstu przed wizytą. Porządkuje historię pacjenta z materiałów dostarczonych przez pacjenta, rodzica, opiekuna, lekarza albo dokument.

Produkt ma odpowiadać na pytania:

- co wiadomo;
- czego brakuje;
- co jest niepewne;
- skąd pochodzi informacja;
- kto ją dodał;
- co trzeba omówić z lekarzem.

## Czym produkt nie jest

Pacjent360 nie jest:

- diagnozą;
- triage;
- oceną pilności;
- rekomendacją leczenia;
- zamiennikiem lekarza;
- EHR/HIS;
- zamiennikiem IKP/P1;
- kanałem przechowywania realnych danych w publicznym demo.

## Główne use case'y

| Use case | Opis | Priorytet |
|---|---|---|
| Przygotowanie wizyty | pacjent/opiekun zbiera dokumenty, leki, pytania | P0 |
| Brief dla lekarza | lekarz widzi kontekst, źródła i pytania | P0 |
| Historia pacjenta | zdarzenia medyczne w chronologii | P1 |
| Zgody i opiekunowie | kto widzi co i dlaczego | P1 |
| Co po wizycie | zadania organizacyjne po kontakcie | P2 |
| Asystenci porządkowania | dry-run bez decyzji klinicznych | P3 |

## Pierwszy MVP

Pierwszy MVP to działający przepływ:

1. Wybór perspektywy: Lekarz360 / Pacjent360 / Opiekun360.
2. Wybór fikcyjnego pacjenta.
3. Widok kokpitu zgodny z perspektywą.
4. Historia pacjenta z wydarzeniami i źródłami.
5. Pytania i braki do rozmowy.
6. Raport kontekstowy.

## Docelowy produkt

Docelowo Pacjent360 może stać się warstwą kontekstu nad danymi pacjenta:

- aplikacja pacjenta i opiekuna;
- desktop lekarza;
- workflow przed i po wizycie;
- źródła, zgody, audyt;
- asystenci AI porządkujący materiały;
- backend-ready contracts;
- legalne integracje z oficjalnymi źródłami.

## Demo vs MVP vs produkt

| Poziom | Co znaczy | Czego nie znaczy |
|---|---|---|
| Demo alpha | pokazuje koncepcję na danych fikcyjnych | nie jest produktem klinicznym |
| MVP | pierwszy użyteczny flow do walidacji | nie jest pełną platformą |
| Produkt | bezpieczny system dla realnego workflow | wymaga backendu, privacy, security, legal, walidacji |

## Główny flow produktu

```text
materiały wejściowe
-> źródła i twierdzenia
-> historia pacjenta
-> braki / niepewności / rozbieżności
-> pytania do rozmowy
-> raport przed wizytą
-> zadania organizacyjne po wizycie
```

## Role

| Rola | Produktowy sens |
|---|---|
| Lekarz | szybkie wejście w kontekst i źródła |
| Pacjent | przygotowanie wizyty i kontrola zgód |
| Rodzic | zebranie historii dziecka i pytań |
| Opiekun prawny | dostęp zgodny z podstawą opieki |
| Osoba wspierająca | pomoc w dokumentach, lekach, wizytach |
| Farmaceuta / koordynator | przyszły reviewer organizacyjny, nie kliniczny decydent w MVP |

## Decyzje produktowe

- Najpierw brief przed wizytą, potem pełna aplikacja.
- Historia pacjenta jest sercem produktu, ale w MVP musi być prosta.
- DITL jest granicą: pytania i braki, nie decyzje.
- Zgody są częścią produktu, nie dodatkiem.
- Asystenci AI są funkcjami porządkowania, nie opiekunami.

## DoD

- Produkt ma jedną definicję i jeden pierwszy wedge.
- Role są rozdzielone.
- Demo, MVP i produkt nie mieszają się w komunikacji.
- Główny flow da się opowiedzieć bez żargonu technicznego.

## DoE

- Każdy use case ma priorytet.
- Każda rola ma przypisany sens produktowy.
- Nie ma obietnic diagnozy, triage ani terapii.
- W review można wskazać, co jest teraz, co później, co poza zakresem.

## FoR

Sprawdzać, czy każda nowa funkcja wzmacnia pierwszy flow przed wizytą. Jeśli nie, trafia do horyzontu.
