# AI Assistants Blueprint

## Cel dokumentu

Opisać asystentów AI jako funkcje pomocnicze porządkujące materiały, bez wchodzenia w decyzje kliniczne.

## Zasada nadrzędna

Agenci nie są opiekunami. Opiekunowie to ludzie. Agenci AI są funkcjami systemu, które przygotowują, porządkują, wskazują braki i tworzą szkice do zatwierdzenia.

## Minimalny katalog

### 1. Asystent dokumentów

| Obszar | Treść |
|---|---|
| Co robi | układa dokumenty, rozpoznaje typy, daty i brakujące metadane |
| Czego nie robi | nie interpretuje klinicznie wyniku |
| Kiedy używać | przy wielu PDF/JPG/TXT |
| Output | lista dokumentów, daty, typy, braki |
| Kto zatwierdza | pacjent/opiekun, później lekarz jako reviewer źródła |
| Ryzyka | błędna data, mylenie dokumentu z faktem |
| DoD | każdy dokument ma typ, datę i status |
| DoE | source coverage i test fixture |

### 2. Asystent leków

| Obszar | Treść |
|---|---|
| Co robi | porównuje leki z dokumentu i leki faktycznie przyjmowane |
| Czego nie robi | nie zaleca dawki, odstawienia ani zmiany |
| Kiedy używać | przed wizytą, kwalifikacją, kontrolą |
| Output | rozbieżności i pytania do potwierdzenia |
| Kto zatwierdza | pacjent/opiekun, lekarz rozstrzyga |
| Ryzyka | sugestia terapii przez język |
| DoD | output jest pytaniem, nie zaleceniem |
| DoE | validator blokuje frazy terapii |

### 3. Asystent wizyty

| Obszar | Treść |
|---|---|
| Co robi | tworzy checklistę dokumentów, pytań i spraw organizacyjnych |
| Czego nie robi | nie decyduje o potrzebie wizyty |
| Kiedy używać | przygotowanie wizyty |
| Output | checklista i braki |
| Kto zatwierdza | pacjent/opiekun |
| Ryzyka | brzmi jak triage |
| DoD | brak języka pilności |
| DoE | test pierwszego kliknięcia |

### 4. Asystent pytań

| Obszar | Treść |
|---|---|
| Co robi | zamienia braki i niepewności w pytania do rozmowy |
| Czego nie robi | nie sugeruje odpowiedzi |
| Kiedy używać | przed wizytą i raportem |
| Output | 5-7 pytań do rozmowy |
| Kto zatwierdza | pacjent/opiekun, lekarz odpowiada w rozmowie |
| Ryzyka | pytanie może brzmieć jak sugestia diagnozy |
| DoD | pytania neutralne i źródłowe |
| DoE | copy safety review |

### 5. Strażnik źródeł

| Obszar | Treść |
|---|---|
| Co robi | sprawdza, czy twierdzenia mają źródła albo jawny brak źródła |
| Czego nie robi | nie ocenia prawdziwości klinicznej |
| Kiedy używać | przed raportem i publikacją demo |
| Output | lista braków source coverage |
| Kto zatwierdza | reviewer produktu |
| Ryzyka | fałszywe poczucie “prawdy” |
| DoD | każda informacja ma status źródła |
| DoE | validator source coverage |

### 6. Strażnik zgód

| Obszar | Treść |
|---|---|
| Co robi | pilnuje zakresu dostępu opiekuna i widoczności danych |
| Czego nie robi | nie decyduje o prawnej podstawie dostępu |
| Kiedy używać | Opiekun360 i eksport |
| Output | zakres widoczności, blokady, audyt |
| Kto zatwierdza | owner produktu + legal/privacy reviewer |
| Ryzyka | leakage danych |
| DoD | brak dostępu pokazuje powód |
| DoE | test opiekun z zgodą / bez zgody |

### 7. Strażnik języka

| Obszar | Treść |
|---|---|
| Co robi | wykrywa język diagnozy, triage, pilności, terapii |
| Czego nie robi | nie zastępuje review człowieka |
| Kiedy używać | przed publikacją strony, demo, raportu |
| Output | lista fraz do poprawy |
| Kto zatwierdza | founder / safety reviewer |
| Ryzyka | false negative |
| DoD | zero zakazanych fraz w UI |
| DoE | validate-harm-gates + manual review |

## No-go dla agentów

- Runtime na realnych danych bez DPIA/security/legal.
- Ukryty output bez podglądu.
- Automatyczne akcje bez akceptacji.
- Kontakt z placówką bez użytkownika.
- Zakup leków albo booking jako automatyczna decyzja.
- Kliniczne słowa: diagnoza, pilne, wskazanie, terapia, dawka.

## DoD

- Każdy asystent ma zakres, output i osobę zatwierdzającą.
- Każdy output jest pytaniem, brakiem, statusem albo zadaniem organizacyjnym.
- Nie ma agentów-opiekunów.

## DoE

- Katalog agentów przechodzi safety review.
- Walidator blokuje forbidden outputs.
- Dry-run działa na danych fikcyjnych.
- Każdy output ma źródło albo `source_missing`.

## FoR

Review agentów ma sprawdzać, czy agent zmniejsza chaos, a nie przejmuje decyzję.
