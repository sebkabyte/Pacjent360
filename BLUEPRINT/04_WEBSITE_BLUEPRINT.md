# Website Blueprint

## Cel dokumentu

Zaprojektować stronę Pacjent360 jako nowoczesną, prostą stronę startupową, która w 10 sekund wyjaśnia produkt i prowadzi do demo, walidacji albo kontaktu.

## Odpowiedź w 10 sekund

Strona ma natychmiast odpowiadać:

1. Pacjent360 porządkuje historię pacjenta przed wizytą.
2. Pomaga pacjentowi, rodzicowi, opiekunowi i lekarzowi zobaczyć kontekst.
3. Nie diagnozuje i nie zastępuje lekarza.
4. Demo pokazuje historię, dokumenty, leki, pytania i raport.
5. Następny krok: zobacz demo albo napisz do projektu.

## Struktura strony głównej

| Sekcja | Cel | Główny przekaz | CTA |
|---|---|---|---|
| Hero | sprzedaż 5 sekund | jedna historia pacjenta zamiast chaosu dokumentów | Zobacz demo / Napisz |
| Problem | ból codzienny | wyniki, wypisy, leki i pytania są rozproszone | brak |
| Rozwiązanie | mechanika | dokumenty -> historia -> pytania -> brief | Zobacz jak działa |
| Dla kogo | persony | lekarz, pacjent, rodzic/opiekun widzą tę samą historię inaczej | Wybierz perspektywę |
| Demo alpha | dowód | można kliknąć fikcyjne przypadki | Uruchom demo |
| Droga produktu | wiarygodność | MVP teraz, produkt po walidacji | Zobacz roadmapę |
| Zaufanie | granice | źródła, zgody, decyzja lekarza | Przeczytaj granice |
| CTA | konwersja | sprawdź demo i daj feedback | Demo / Kontakt / GitHub |

## Zasady copy

- Krótkie zdania.
- Jeden cel na sekcję.
- Zero ciężkiej architektury na stronie głównej.
- AI tylko jako funkcje porządkujące materiały.
- Care Circle to ludzie: rodzic, opiekun prawny, osoba wspierająca.
- Nie pisać “pętla” w polskim publicznym copy.
- DITL można wyjaśniać jako “decyzja zawsze należy do lekarza”.

## Podstrony

### Lekarz

- Cel: pokazać brief i źródła.
- Użytkownik: lekarz POZ, specjalista, reviewer.
- Przekaz: szybciej wejść w kontekst bez automatycznej diagnozy.
- Sekcje: problem wizyty, brief, źródła, pytania, przykład ekranu, granice.
- CTA: “Przejdź demo jako Lekarz360”.
- Nie mówić: że system ocenia, diagnozuje albo priorytetyzuje klinicznie.
- DoD: lekarz rozumie w 30 sekund, co dostaje.
- DoE: reviewer potrafi wskazać, które źródło wspiera które twierdzenie.

### Pacjent

- Cel: pokazać przygotowanie wizyty.
- Użytkownik: dorosły pacjent.
- Przekaz: wiesz, co przygotować i o co zapytać.
- Sekcje: dokumenty, leki, pytania, zgody, historia.
- CTA: “Przejdź demo jako Pacjent360”.
- Nie mówić: interpretacja wyników.
- DoD: pacjent wie, co zrobić przed wizytą.
- DoE: pacjent w teście wybiera poprawny pierwszy krok.

### Opiekunowie

- Cel: pokazać pomoc w zakresie zgody.
- Użytkownik: rodzic, opiekun prawny, osoba wspierająca.
- Przekaz: pomagasz bliskiej osobie, widząc tylko to, co udostępniono.
- Sekcje: role, zgody, zadania, dokumenty, obserwacje.
- CTA: “Przejdź demo jako Opiekun360”.
- Nie mówić: pełny dostęp bez podstawy.
- DoD: zakres dostępu jest zrozumiały.
- DoE: użytkownik rozumie, dlaczego brak zgody blokuje dane.

### Agenci AI

- Cel: pokazać przyszłe funkcje pomocnicze.
- Użytkownik: inwestor, techniczny reviewer, contributor.
- Przekaz: agenci porządkują, nie decydują.
- Sekcje: katalog agentów, outputy, zatwierdzanie, no-go.
- CTA: “Zobacz granice AI”.
- Nie mówić: agent kliniczny, diagnoza, terapia, triage.
- DoD: każdy agent ma output i człowieka zatwierdzającego.
- DoE: safety review nie znajduje autonomicznych decyzji.

### DITL / Decyzja lekarza

- Cel: wyjaśnić zasadę bezpieczeństwa.
- Użytkownik: lekarz, prawnik, inwestor.
- Przekaz: system przygotowuje kontekst, lekarz rozstrzyga.
- Sekcje: co system robi, czego nie robi, przykłady wordingów, DoH.
- CTA: “Zobacz zastrzeżenie medyczne”.
- Nie mówić: “pętla” po polsku jako główna metafora.
- DoD: nietechniczny użytkownik rozumie granicę.
- DoE: nikt w walidacji nie czyta tego jako diagnozy.

### Engineering

- Cel: pokazać repo, kontrakty i walidatory.
- Użytkownik: inżynier, contributor, partner techniczny.
- Przekaz: publiczne claimy mają techniczne pokrycie.
- Sekcje: architektura, schema, fixtures, walidatory, testy, release.
- CTA: “GitHub”.
- Nie mówić: produkcyjna skala bez dowodu.
- DoD: inżynier wie, gdzie zacząć.
- DoE: linki do plików działają.

### Inwestorzy

- Cel: pokazać wedge, rynek i plan kapitału.
- Użytkownik: angel, VC, partner strategiczny.
- Przekaz: zaczynamy od kontekstu wizyty, skala jest w warstwie danych i zgód.
- Sekcje: teza, wedge, rynek, model, kamienie milowe, potrzeby kapitałowe.
- CTA: “Porozmawiajmy o inwestycji lub pilocie”.
- Nie mówić: gotowa poradnia online, IPO, pełna kliniczna gotowość.
- DoD: inwestor zna etap i najbliższy dowód.
- DoE: strona nie obiecuje więcej niż roadmapa.

### Zaufanie

- Cel: zebrać safety, privacy i granice.
- Użytkownik: każdy.
- Przekaz: źródła, zgody, audyt i brak decyzji klinicznych.
- CTA: “Przeczytaj privacy / disclaimer”.

### Walidacja

- Cel: zaprosić do feedbacku.
- Użytkownik: lekarz, pacjent, opiekun, partner.
- Przekaz: sprawdzamy, czy brief realnie pomaga.
- CTA: “Napisz do projektu”.

### Współpraca

- Cel: zebrać ludzi do budowy.
- Użytkownik: lekarz, UX, inżynier, security, legal, growth.
- Przekaz: dołącz do konkretnego obszaru, z zasadami safety.
- CTA: “Zgłoś obszar wkładu”.

## DoD

- Strona główna jest krótka, startupowa i zrozumiała.
- Każda podstrona ma jeden cel.
- Ciężka architektura jest poza stroną główną.
- Safety copy jest widoczne, ale nie dominuje wartości produktu.

## DoE

- Test 10 sekund: użytkownik wie, co to jest i co kliknąć.
- Linki do demo, GitHub, privacy, disclaimer i kontaktu działają.
- Claim registry potwierdza publiczne obietnice.
- Mobile nie wymaga czytania długich bloków.

## FoR

Review strony ma sprawdzać konwersję i jasność, nie ilość informacji.
