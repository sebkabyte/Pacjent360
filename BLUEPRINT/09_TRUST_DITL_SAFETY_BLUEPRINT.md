# Trust / DITL / Safety Blueprint

## Cel dokumentu

Utrzymać granice zaufania: Pacjent360 porządkuje kontekst, a decyzja medyczna należy do lekarza.

## Główna zasada

System może pokazywać:

- źródła;
- braki;
- niepewności;
- rozbieżności;
- pytania;
- zadania organizacyjne;
- statusy zgód.

System nie może pokazywać jako swojej decyzji:

- diagnozy;
- triage;
- pilności;
- terapii;
- dawkowania;
- rekomendacji klinicznej;
- rankingu ryzyka klinicznego.

## DITL

DITL oznacza Doctor in the Loop: lekarz pozostaje osobą rozstrzygającą. W polskim publicznym copy lepiej pisać:

> Decyzja zawsze należy do lekarza.

Nie używać metafory “pętli” jako głównego hasła.

## Źródła

Każda istotna informacja powinna mieć:

- źródło;
- datę;
- typ źródła;
- autora / rozmówcę, jeśli to wywiad;
- status: potwierdzone, do potwierdzenia, brak źródła.

Jeżeli źródła nie ma, system ma to pokazać, a nie ukrywać.

## Zgody

Zgody są funkcją zaufania. UI ma pokazywać:

- kto udostępnił;
- komu;
- na jaki zakres;
- na jak długo;
- co się dzieje po cofnięciu zgody.

Opiekun bez zgody widzi ekran braku dostępu, a nie pusty kokpit udający brak danych.

## Audyt

Audyt ma odpowiadać:

- kto dodał informację;
- kiedy;
- z jakiego źródła;
- kto ją widział;
- jaki status ma dostęp.

## Granice AI

AI może pomagać w:

- porządkowaniu dokumentów;
- wykrywaniu braków;
- streszczaniu materiałów źródłowych;
- przygotowaniu pytań;
- pilnowaniu języka;
- sprawdzaniu zgód.

AI nie może:

- diagnozować;
- decydować;
- oceniać pilności;
- rekomendować terapii;
- kontaktować się autonomicznie z placówką;
- wykonywać działań bez akceptacji.

## Co wolno mówić na stronie

- “porządkuje historię pacjenta”;
- “pomaga przygotować brief przed wizytą”;
- “pokazuje źródła i braki”;
- “wspiera rozmowę z lekarzem”;
- “decyzja należy do lekarza”;
- “demo używa danych fikcyjnych”.

## Czego nie wolno mówić

- “diagnozuje”;
- “ocenia pilność”;
- “wykrywa chorobę”;
- “ratuje życie” jako obietnica produktu;
- “zapobiega błędom medycznym” jako gwarancja;
- “pełna anonimizacja” bez formalnego procesu;
- “automatycznie zaleca”.

## Jak komunikować demo

Demo jest:

- publiczne;
- fikcyjne;
- alpha;
- do oceny workflow.

Demo nie jest:

- narzędziem dla realnych danych;
- systemem klinicznym;
- poradą medyczną;
- produkcyjną usługą.

## DoD

- Każdy output klinicznie istotny jest pytaniem, statusem, brakiem albo źródłem.
- AI jest opisane jako funkcja pomocnicza.
- Zgody są widoczne.
- Brak źródła jest jawny.

## DoE

- Harm gates przechodzą.
- Copy review nie znajduje języka diagnozy/triage/terapii.
- Walidacja z ludźmi daje 0 serious safety concern.
- UI rozdziela dokument, wywiad i obserwację.

## FoR

Review safety ma sprawdzać nie intencję autora, tylko możliwy odczyt przez pacjenta, opiekuna i lekarza.
