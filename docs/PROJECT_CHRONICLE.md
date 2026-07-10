# Kronika projektu Pacjent360

<!-- P360_CONTROL_STATUS: REFERENCE_ONLY -->

> **REFERENCE_ONLY dla current scope:** kronika zachowuje historię, ale nie ustanawia aktywnego wedge'a, backlogu ani gate'u. Wiążące decyzje znajdują się w ADR i `docs/governance/DECISION_LOG.md`.

Status: historyczna publiczna kronika najwazniejszych decyzji i kamieni milowych projektu.
Cel: utrzymac sladowalnosc tego, co powstalo, kiedy i na jakim poziomie pewnosci.

> Kronika nie zastepuje roadmapy ani changeloga. Roadmapa mowi, dokad idziemy. Changelog mowi, co zmienilo sie w kodzie i dokumentacji. Kronika zapisuje decyzje founder/product/legal, ktore latwo zgubic w rozmowach.

## Zasady zapisu

- Nie wpisujemy danych pacjentow, numerow dokumentow prywatnych, sekretow, kluczy ani szczegolow operacyjnych security.
- Fakty urzedowe oznaczamy jako urzedowo potwierdzone dopiero wtedy, gdy repo moze wskazac publiczny rejestr albo bezpieczny dowod.
- Fakty przekazane przez foundera, ktore nie maja publicznego dowodu w repo, oznaczamy jako `deklaracja foundera`.
- Status prawny i regulacyjny nie jest samodzielnie interpretowany przez repo. Wymaga potwierdzenia kancelarii albo odpowiedniego rejestru.

## 2026-07-06 - Wniosek o ochrone znaku Pacjent360

Status: `deklaracja foundera`  
Obszar: marka, IP, wiarygodnosc publiczna  

Founder przekazal, ze wniosek dotyczacy ochrony znaku Pacjent360 zostal zlozony.

Znaczenie dla projektu:

- luka strategiczna "czy w ogole zlozono wniosek o znak" zostaje zamknieta na poziomie founder-declared;
- dalsze ryzyko dotyczy juz monitorowania statusu, zakresu ochrony, klas, ewentualnych sprzeciwow oraz domen;
- repo nadal nie twierdzi, ze znak ma udzielona ochrone, dopoki nie zostanie to potwierdzone przez wlasciwy rejestr lub kancelarie;
- numer zgloszenia, dokumenty urzedowe i korespondencja z pelnomocnikiem nie powinny byc publikowane w repo, chyba ze founder i prawnik zdecyduja inaczej.

Powiazane miejsca:

- `README.md` - licencje i znak projektu;
- `NOTICE` - ograniczenia uzycia nazwy i tozsamosci projektu;
- `docs/adr/0001-license.md` - model licencyjny i rozdzial licencji od nazwy projektu;
- `BLUEPRINT/27_STRATEGIC_DECISION_BOARD.md` - prywatna tablica decyzji strategicznych przed S3.

Nastepne kroki:

- potwierdzic, czy ochrona dotyczy UPRP, EUIPO czy obu sciezek;
- uzupelnic prywatna notatke o numer zgloszenia i klasach, poza publicznym repo;
- sprawdzic domeny defensywne, w szczegolnosci `pacjent360.pl`;
- ustalic z kancelaria, jak publicznie opisywac status znaku przed rejestracja.
