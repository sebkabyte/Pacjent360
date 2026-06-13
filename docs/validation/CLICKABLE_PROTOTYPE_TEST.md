# Pacjent360: test klikalnego prototypu, pierwszego klikniecia i sciezek

Status: material do walidacji alpha na fikcyjnych danych. Nie uzywac realnych danych pacjentow.

Cel: sprawdzic, czy osoba spoza projektu rozumie strone WWW i demo bez tlumaczenia autora:

- gdzie kliknac, zeby zaczac,
- czy rozumie wybor perspektywy: Lekarz360, Pacjent360, Opiekun360,
- czy potrafi przejsc przez jedna historie pacjenta,
- czy widzi tylko taki zakres danych, jaki pasuje do wybranej perspektywy,
- czy nie odczytuje Pacjent360 jako diagnozy, triage albo zalecenia medycznego.

## Zasady sesji

- Czas: 20-30 minut.
- Dane: tylko fikcyjne scenariusze demo.
- Prowadzacy nie tlumaczy interfejsu przed zadaniem.
- Uczestnik mowi na glos, co chce kliknac i dlaczego.
- Prowadzacy zapisuje pierwszy klik, czas, pomylki, cytaty i momenty zawahania.
- Nie zapisujemy danych medycznych ani danych osobowych uczestnika.
- Jesli uczestnik mowi, ze system diagnozuje, ocenia pilnosc albo zaleca leczenie, zapisujemy to jako safety concern.

## Role w tescie

Minimalny pierwszy pakiet:

- 2 lekarzy lub osoby znajace realny workflow wizyty,
- 2 pacjentow,
- 2 opiekunow lub rodzicow,
- 1 osoba nietechniczna, ktora nie zna projektu.

Docelowo po poprawkach: 8-12 sesji, aby zobaczyc powtarzalne problemy, nie pojedyncze opinie.

## Metryki

| Metryka | Jak mierzyc | Prog alpha |
| --- | --- | --- |
| Pierwszy klik poprawny | pierwszy klik pasuje do zadania | >= 70% |
| Czas do pierwszego klikniecia | sekundy od przeczytania zadania | <= 8 s |
| Ukonczenie zadania | uczestnik dochodzi do oczekiwanego miejsca | >= 80% |
| Pomylki klikniecia | klik w zle miejsce albo powrot z dezorientacji | <= 2 na sciezke |
| Pomoc prowadzacego | czy uczestnik potrzebowal podpowiedzi | <= 1 podpowiedz na sciezke |
| Pewnosc uczestnika | skala 1-5 po zadaniu | srednia >= 3.5 |
| Safety concern | diagnoza, triage, zalecenie, realne dane | 0 serious concern |

## Test 1: pierwszy klik na stronie WWW

Cel: sprawdzic, czy strona prowadzi do demo i nie rozprasza planami.

Start: `index.html` albo `https://pacjent360.com.pl/`.

Nie mow: "kliknij demo". Zadaj pytania jak uzytkownikowi, ktory wszedl z linku.

| ID | Zadanie | Oczekiwany pierwszy klik | Sukces |
| --- | --- | --- | --- |
| FC-WWW-01 | Chcesz zobaczyc, jak to dziala. Gdzie klikniesz? | CTA do demo / start demo / demo alpha | Trafia do `demo.html?start=1` |
| FC-WWW-02 | Chcesz sprawdzic, czym projekt nie jest. Gdzie klikniesz? | disclaimer / ograniczenia / safety copy | Uczestnik znajduje ograniczenia bez nadinterpretacji |
| FC-WWW-03 | Chcesz powiedziec autorowi, co jest niezrozumiale. Gdzie klikniesz? | kontakt / walidacja / repozytorium | Uczestnik znajduje kanal informacji zwrotnej |

Pytanie po zadaniu:

- Jednym zdaniem: co wedlug Ciebie robi Pacjent360?
- Czego wedlug Ciebie Pacjent360 nie robi?

## Test 2: pierwszy klik w demo

Cel: sprawdzic, czy ekran startowy demo jest jasny bez instrukcji.

Start: `demo.html?start=1`.

| ID | Zadanie | Oczekiwany pierwszy klik | Sukces |
| --- | --- | --- | --- |
| FC-DEMO-01 | Jestes lekarzem i masz szybko zobaczyc kontekst wizyty. Gdzie klikniesz? | Lekarz360 | Pokazuje wybor scenariusza dla lekarza |
| FC-DEMO-02 | Jestes pacjentem i chcesz przygotowac wizyte. Gdzie klikniesz? | Pacjent360 | Pokazuje wybor scenariusza dla pacjenta |
| FC-DEMO-03 | Pomagasz bliskiej osobie w dokumentach i lekach. Gdzie klikniesz? | Opiekun360 | Pokazuje wybor scenariusza dla opiekuna |
| FC-DEMO-04 | Chcesz zobaczyc przypadek Andrzeja jako pacjent. Gdzie klikniesz? | Andrzej K. po wyborze Pacjent360 | Otwiera Pacjent360 dla Andrzeja |
| FC-DEMO-05 | Jestes opiekunem Andrzeja i chcesz sprawdzic dokumenty. Co robisz? | Zauwaza brak aktywnej zgody / przechodzi do Zgody | Nie widzi dokumentow, lekow, mapy ani wynikow bez zgody |

Pytanie po zadaniu:

- Czy rozumiesz, dlaczego najpierw wybierasz perspektywe, a dopiero potem pacjenta?
- Czy nazwy Lekarz360, Pacjent360 i Opiekun360 sa jasne?

## Test 3: klikalny prototyp

Cel: sprawdzic, czy kazdy widoczny element interaktywny prowadzi tam, gdzie uczestnik sie spodziewa.

Prowadzacy ma prosic uczestnika o myslenie na glos. Nie poprawiac go od razu.

### Minimalna lista klikow

| Obszar | Co kliknac | Oczekiwany efekt |
| --- | --- | --- |
| Start demo | Lekarz360 / Pacjent360 / Opiekun360 | Zmienia perspektywe i prowadzi do wyboru scenariusza |
| Wybor scenariusza | Jan S. / Andrzej K. / Maja N. | Otwiera kokpit tej samej perspektywy dla wybranego pacjenta |
| Kokpity | Lekarz360 / Pacjent360 / Opiekun360 w sidebarze | Zmienia jezyk, zakres danych i sciezke, zachowuje pacjenta |
| Nawigacja krokow | Wroc / Dalej | Przechodzi w logicznym ciagu, bez utraty pacjenta |
| Mapa | Zobacz mape / Mapa | Otwiera historie pacjenta w zakresie danej perspektywy |
| Zrodla | chip zrodla / Skad to wiemy | Otwiera zrodlo aktywnego pacjenta |
| Zgody | Zgody / Zakres zgody | Pokazuje kto ma dostep i dlaczego |
| Opiekun bez zgody | Opiekun360 + Andrzej K. | Pokazuje brak dostepu i przejscie do zgody, bez kafli danych |
| Podsumowanie | Zakoncz podsumowaniem | Pokazuje krotkie podsumowanie bez diagnozy i zalecen |

Pytania po prototypie:

- Co bylo najbardziej oczywiste?
- Gdzie pierwszy raz poczules/poczulas niepewnosc?
- Czy widziales/widzialas cos, co wygladalo jak decyzja medyczna?
- Czy wiesz, skad pochodza informacje?

## Test 4: sciezki uzytkownika

Cel: sprawdzic pelne przejscie przez najwazniejsze drogi w produkcie.

### Sciezka A: lekarz

Start: `index.html` lub domena.

Zadanie dla uczestnika:

> Wyobraz sobie, ze jestes lekarzem. Chcesz w 90 sekund zobaczyc, co trzeba omowic przed kontaktem z pacjentem Jan S. Przejdz przez demo tak, jak zrobilbys/zrobilabys to samodzielnie.

Oczekiwany przebieg:

1. Strona WWW -> Start demo.
2. Lekarz360.
3. Jan S.
4. Brief kontekstu.
5. Pytania i niepewnosci.
6. Zrodla.
7. Mapa.
8. Raport / podsumowanie.

Sukces: uczestnik potrafi powiedziec, co jest znane, czego brakuje i co trzeba omowic, bez odczytania systemu jako diagnozy.

### Sciezka B: pacjent

Zadanie:

> Wyobraz sobie, ze jestes Andrzejem i przygotowujesz kontrole. Znajdz, co masz przygotowac, jakie leki i wyniki sa pokazane oraz komu udostepniasz dane.

Oczekiwany przebieg:

1. Pacjent360.
2. Andrzej K.
3. Co teraz.
4. Dokumenty / Leki / Wyniki.
5. Pytania do rozmowy.
6. Zgody.
7. Podsumowanie.

Sukces: uczestnik rozumie nastepny krok organizacyjny i widzi, ze system nie zmienia leczenia.

### Sciezka C: opiekun z dostepem

Zadanie:

> Wyobraz sobie, ze pomagasz Janowi jako osoba bliska. Sprawdz, do czego masz dostep i co mozesz przygotowac przed wizyta.

Oczekiwany przebieg:

1. Opiekun360.
2. Jan S.
3. Zakres zgody.
4. Zadania.
5. Dokumenty / leki / wizyty w zakresie dostepu.
6. Obserwacje opiekuna.
7. Mapa w zakresie zgody.

Sukces: uczestnik rozumie, kto udzielil dostepu, do czego i po co.

### Sciezka D: opiekun bez dostepu

Zadanie:

> Wyobraz sobie, ze chcesz pomoc Andrzejowi, ale nie masz aktywnej zgody. Sprawdz, co widzisz.

Oczekiwany przebieg:

1. Opiekun360.
2. Andrzej K.
3. Ekran braku aktywnego dostepu.
4. Przejscie do Zgody.

Sukces: uczestnik nie widzi dokumentow, lekow, wynikow, wywiadu ani mapy Andrzeja.

### Sciezka E: rodzic/opiekun dziecka

Zadanie:

> Wyobraz sobie, ze jestes rodzicem Mai. Sprawdz, jak wyglada historia dziecka i co mozesz przygotowac.

Oczekiwany przebieg:

1. Opiekun360.
2. Maja N.
3. Jasny opis, ze pacjentka jest dzieckiem.
4. Rodzic jako glowne zrodlo informacji.
5. Dokumenty, leki, wyniki, obserwacje i mapa w zakresie opieki.

Sukces: uczestnik rozumie relacje dziecko-rodzic i nie myli obserwacji rodzica z faktem klinicznym.

## Formularz notatek w trakcie sesji

| Pole | Wpis |
| --- | --- |
| Session ID | |
| Data | |
| Urzadzenie | mobile / tablet / laptop / desktop |
| Uczestnik | lekarz / pacjent / opiekun / rodzic / osoba nietechniczna |
| Start URL | |
| Zadanie ID | |
| Pierwszy klik | |
| Czy pierwszy klik byl poprawny? | tak / nie |
| Czas do pierwszego klikniecia | |
| Czy zadanie ukonczone? | tak / nie / czesciowo |
| Liczba pomylek | |
| Czy potrzebna byla pomoc? | tak / nie |
| Pewnosc 1-5 | |
| Cytat lub parafraza | |
| Safety concern | brak / diagnoza / triage / zalecenie / realne dane / inne |
| Najmniejsza poprawka, ktora pomoglaby | |

## Kryteria decyzji po rundzie testow

### Kontynuuj

- wiekszosc uczestnikow zaczyna demo poprawnie,
- kazda persona rozumie swoj kokpit,
- brak serious safety concern,
- bledy dotycza glownie copy, kolejnosci lub etykiet.

### Iteruj przed publikacja

- uczestnicy myla start demo albo wybor perspektywy,
- sidebar wyglada jak zwykla lista, nie jak zmiana kokpitu,
- opiekun nie rozumie zakresu zgody,
- mapa jest atrakcyjna, ale nie pomaga zrozumiec historii.

### No-go

- uczestnicy widza w Pacjent360 diagnoze, triage albo zalecenie,
- pacjent/opiekun mysli, ze system mowi, co medycznie zrobic,
- opiekun bez zgody widzi dane poza zakresem,
- przelaczenie pacjenta pokazuje tresci innego scenariusza,
- nikt bez pomocy nie potrafi zaczac demo.

## Artefakty po sesji

- Wyniki wpisz do `CLICKABLE_PROTOTYPE_RESULTS_TEMPLATE.csv`.
- Safety concern przenies do backlogu jako P0/P1.
- Problemy nawigacji i copy przenies do backlogu UX.
- Nie traktuj pozytywnej opinii jako walidacji klinicznej. To jest walidacja zrozumienia i uzytecznosci alpha.
