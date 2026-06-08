# Contributing

Dziękuję za zainteresowanie Pacjent 360. Projekt dotyczy danych i kontekstu medycznego, dlatego wkład musi być ostrożny, jawny i bezpieczny.

## Zasady wkładu

- Nie dodawaj realnych danych pacjentów.
- Nie dodawaj funkcji, które diagnozują, zalecają terapię, oceniają pilność albo zastępują decyzję lekarza.
- Każda flaga, pytanie i automatyzacja musi mieć źródło oraz status DITL.
- W UI używaj języka: pytanie, brak danych, zadanie, status. Unikaj: diagnoza, zalecenie, wskazanie, pilne, należy.
- Dla funkcji publicznych sprawdź `RISKS.md` i Clinical Safety Checklist z README.

## Workflow

1. Otwórz issue z celem, użytkownikiem i ryzykiem.
2. Opisz, czy zmiana dotyczy strony, demo, modelu danych, dokumentacji czy procesu.
3. Przed PR uruchom `node --check app.js`.
4. W PR opisz: co zmieniono, jak testowano, czy zmiana przechodzi Clinical Safety Checklist.

## Licencjonowanie wkładu

Wnosząc wkład do projektu, zgadzasz się, że:

- wkład w kod, skrypty, modele danych, testy i pliki techniczne jest udostępniany na warunkach Apache License 2.0,
- wkład w dokumentację, architekturę, roadmapę, opisy koncepcyjne i materiały projektowe jest udostępniany na warunkach Creative Commons Attribution 4.0 International (CC BY 4.0),
- masz prawo wnieść ten wkład i nie zawiera on materiałów, których nie możesz legalnie udostępnić,
- wkład nie zawiera realnych danych pacjentów, prywatnej dokumentacji medycznej ani danych pozwalających zidentyfikować osobę.

Licencje nie dają prawa do używania nazwy Pacjent 360, domeny, tożsamości projektu ani materiałów w sposób sugerujący oficjalną afiliację z CeZ, NFZ, IKP, P1, e-Profilem Pacjenta, certyfikację kliniczną albo gotowość do użycia medycznego.
