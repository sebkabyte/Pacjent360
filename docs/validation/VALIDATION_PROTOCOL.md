# Protokół walidacji raportu kontekstowego

Cel: sprawdzić, czy raport Pacjent360™ pomaga lekarzowi szybciej zobaczyć, co trzeba wyjaśnić, a pacjentowi lub opiekunowi lepiej przygotować się do wizyty.

## Uczestnicy

- 2 lekarzy POZ.
- 1 lekarz specjalista.
- 3 pacjentów lub opiekunów.
- Razem: 6 sesji walidacyjnych.

## Materiał testowy

- Tylko fikcyjne case studies.
- Brak realnych danych pacjentów.
- Jeden raport kontekstowy na uczestnika.

## Procedura dla lekarza

1. Pokaż lekarzowi raport bez dodatkowego tłumaczenia.
2. Zmierz czas do pierwszej odpowiedzi na pytanie: "Co trzeba wyjaśnić przed decyzją?".
3. Poproś o ocenę w skali 1-5:
   - przydatność,
   - czytelność,
   - zaufanie do źródeł,
   - ryzyko mylnej interpretacji.
4. Zadaj pytania otwarte:
   - Co pomogło?
   - Co przeszkadzało?
   - Czego brakuje?
   - Czy raport wygląda jak zalecenie lub diagnoza?

## Procedura dla pacjenta/opiekuna

1. Pokaż widok pacjenta i checklistę przygotowania do wizyty.
2. Zapytaj, czy uczestnik rozumie:
   - co wiadomo,
   - czego brakuje,
   - co trzeba przygotować,
   - co ma omówić z lekarzem.
3. Zapisz, gdzie pojawiła się niepewność lub nadinterpretacja.

## Artefakty sesji

- Formularz sesji: `VALIDATION_FEEDBACK_FORM.md`.
- Tabela wynikow bez danych osobowych: `VALIDATION_RESULTS_TEMPLATE.csv`.
- Test klikalnego prototypu, pierwszego klikniecia i sciezek: `CLICKABLE_PROTOTYPE_TEST.md`.
- Tabela wynikow dla testu klikalnosci: `CLICKABLE_PROTOTYPE_RESULTS_TEMPLATE.csv`.
- Jeden wiersz wynikow na jedna sesje walidacyjna.
- Osobny wpis safety concern, jesli reviewer zglasza diagnoze, triage, zalecenie albo ryzyko uzycia realnych danych.

## Metryki

| Metryka | Kontynuuj | Pivotuj |
| --- | ---: | ---: |
| Przydatność raportu, skala 1-5 | średnia >= 3.5 | średnia < 2.5 |
| Zrozumiałość celu dla wszystkich reviewerów | >= 4/6 rozumie bez pomocy | < 2/6 |
| Zrozumiałość pacjent/opiekun | >= 2/3 rozumie bez pomocy | < 1/3 |
| Zgłoszenia "to wygląda jak diagnoza/triage" | 0 | >= 2 |
