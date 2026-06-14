# Validation Blueprint

## Cel dokumentu

Ustalić, jak sprawdzić, czy Pacjent360 realnie pomaga, zanim zaczniemy budować większy produkt.

## Główna hipoteza

Raport kontekstowy i historia pacjenta pomagają lekarzowi szybciej zobaczyć, co trzeba wyjaśnić, a pacjentowi/opiekunowi lepiej przygotować się do wizyty.

## Hipotezy szczegółowe

| ID | Hipoteza | Jak sprawdzić |
|---|---|---|
| H1 | Lekarz rozumie brief bez tłumaczenia | 90 sekund, pytanie “co trzeba wyjaśnić?” |
| H2 | Pacjent wie, co przygotować | test pierwszego kliknięcia i zadanie przygotowania |
| H3 | Opiekun rozumie zakres dostępu | scenariusz z aktywną i brakującą zgodą |
| H4 | Źródła budują zaufanie | pytanie “skąd to wiemy?” |
| H5 | Demo nie wygląda jak diagnoza | check Definition of Harm |
| H6 | Strona jasno tłumaczy produkt | test 10 sekund |

## Z kim rozmawiać

| Grupa | Minimum | Cel |
|---|---:|---|
| Lekarz POZ | 2 | ocena briefu i workflow |
| Specjalista | 1 | ocena kontekstu i źródeł |
| Pacjent | 1-2 | przygotowanie wizyty |
| Rodzic/opiekun | 2 | zgody, zadania, historia |
| Inwestor/partner | 1-2 | wedge, ryzyko, finansowanie |
| Privacy/security reviewer | 1 | zaufanie, ryzyka danych |

## Pytania dla lekarza

- Co widzisz jako najważniejszą sprawę do wyjaśnienia?
- Czy wiesz, skąd pochodzi informacja?
- Czy coś wygląda jak diagnoza albo rekomendacja?
- Czy brief jest za długi, za krótki czy w sam raz?
- Czego brakuje, żeby zaufać takiemu widokowi?
- Czy przyjąłbyś taki brief przed wizytą?

## Pytania dla pacjenta/opiekuna

- Co kliknąłbyś jako pierwszy krok?
- Czy wiesz, co przygotować przed wizytą?
- Czy rozumiesz, co jest dokumentem, a co obserwacją?
- Czy rozumiesz zakres zgody opiekuna?
- Czy cokolwiek brzmi jak porada medyczna?
- Co jest najbardziej pomocne, a co zbędne?

## Pytania dla inwestora/partnera

- Czy wedge jest zrozumiały?
- Czy ryzyko regulacyjne jest nazwane wystarczająco wcześnie?
- Jaki dowód byłby potrzebny przed inwestycją/pilotem?
- Czy strona obiecuje za dużo?

## Metryki

| Metryka | Kontynuuj | Pivotuj / stop |
|---|---:|---:|
| Przydatność briefu dla lekarza 1-5 | średnia >= 3.5 | średnia < 2.5 |
| Zrozumienie celu przez pacjenta/opiekuna | >= 4/6 | < 2/6 |
| Odczyt jako diagnoza/triage | 0 | >= 2 poważne zgłoszenia |
| Zaufanie do źródeł 1-5 | >= 3.5 | < 2.5 |
| Pierwszy klik trafny | >= 70% | < 40% |
| Ukończenie ścieżki demo | >= 80% | < 50% |

## Definition of Harm

Szkody, których walidacja ma szukać:

- użytkownik myli raport z diagnozą;
- użytkownik myli flagi z triage;
- użytkownik odkłada kontakt z lekarzem przez uspokajający język;
- opiekun widzi za dużo;
- lekarz nie ufa źródłom;
- AI wygląda jak kliniczny decydent;
- strona obiecuje więcej niż repo;
- kolor jest czytany jako alarm kliniczny.

## Kiedy kontynuować

Kontynuujemy, jeśli:

- lekarze widzą wartość briefu;
- pacjent/opiekun rozumie pierwszy krok;
- nie ma odczytu jako diagnoza/triage;
- strona i demo są spójne;
- istnieje przynajmniej jeden potencjalny partner pilotażowy.

## Kiedy pivotować

Pivotujemy, jeśli:

- lekarze nie widzą wartości briefu;
- pacjenci nie rozumieją przygotowania wizyty;
- historia pacjenta jest zbyt trudna w 90 sekund;
- wartość jest większa w wąskim segmencie, np. rodzic dziecka, senior z opiekunem albo pre-op.

## Kiedy zatrzymać

Zatrzymujemy moduł lub kierunek, jeśli:

- użytkownicy czytają output jako diagnozę;
- opiekunowie widzą więcej niż powinni;
- produkt wymaga backendu/regulacji przed dowodem wartości;
- nie da się obronić claimów publicznych.

## DoD

- Jest protokół rozmów.
- Są hipotezy i progi decyzji.
- Walidacja jest oddzielona dla lekarza, pacjenta, opiekuna, inwestora i partnera.
- Definition of Harm jest częścią procesu.

## DoE

- Minimum 6 sesji walidacyjnych udokumentowanych.
- Każda sesja ma wynik, cytaty, ryzyka i decyzję.
- Jest tabela continue / pivot / stop.
- 0 realnych danych pacjentów w publicznej walidacji.

## FoR

Review walidacji ma sprawdzać dowody, nie opinie. Jeśli nie ma rozmów z ludźmi, nie ma walidacji produktu.
