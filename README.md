# Pacjent 360

> Narzedzia publikacyjne: `tools/smoke-public.ps1` sprawdza paczke `dist/public` oraz `dist/upload-ready` przez lokalny HTTP, a `tools/smoke-browser.ps1` wykonuje klikalny smoke test demo w headless Chrome/Edge.

Pacjent przychodzi do systemu ochrony zdrowia z historią, nie z tabelą danych.

Ma wyniki badań, wypisy, listę leków, skierowania, objawy, wspomnienia z poprzednich wizyt, obserwacje rodziny i rzeczy, których sam nie potrafi dobrze nazwać. Lekarz ma kilka minut, przeciążony system i decyzję do podjęcia tu i teraz.

Problemem bardzo często nie jest brak danych. Problemem jest brak kontekstu.

**Pacjent 360** to otwarty projekt, który próbuje odpowiedzieć na jedno praktyczne pytanie:

> Co trzeba wyjaśnić przed dzisiejszą decyzją medyczną?

## Project status

- Status projektu: **alpha / v0.2.2-alpha**.
- To jest statyczny prototyp koncepcyjny i demonstracyjny, nie system gotowy do użycia klinicznego.
- Demo korzysta z fikcyjnych, kompozytowych przypadków i nie powinno przyjmować realnych danych pacjentów.
- Przed go-live domeny wymagane są osobne bramki: bezpieczeństwo, prywatność, clinical safety, dostępność, działające kanały kontaktu i publikacja czystej paczki hostingowej.

## O co chodzi

Pacjent 360 ma być warstwą porządkującą historię pacjenta: dokumenty, badania, leki, wizyty, wywiady, obserwacje, zgody, przypomnienia i pytania do lekarza.

Nie chodzi o to, żeby system zastąpił lekarza. Chodzi o to, żeby przed rozmową z lekarzem szybciej zobaczyć:

- co wiadomo,
- czego brakuje,
- co jest niepewne,
- co trzeba zweryfikować,
- jakie pytania nie powinny zginąć w pośpiechu.

To jest projekt o lepszym kontekście, nie o automatycznej diagnozie.

## Dlaczego to ważne

Polski pacjent coraz częściej ma dostęp do danych w IKP, mojeIKP, dokumentach PDF, wynikach badań i systemach placówek. Ale sam dostęp do informacji nie oznacza jeszcze, że da się ją szybko zrozumieć w sytuacji medycznej.

Pacjent 360 ma ułożyć tę historię w formę przydatną dla trzech stron:

- dla pacjenta, który chce rozumieć swoje badania, wizyty, leki i plan opieki,
- dla lekarza, który potrzebuje krótkiego kontekstu decyzyjnego,
- dla rodziny lub opiekuna, jeśli pacjent świadomie udzieli im dostępu.

## Dlaczego teraz

Tak. Pacjent 360 powinien iść z duchem aktualnych publikacji, ale bez udawania, że jest częścią państwowego systemu, certyfikowanym wyrobem medycznym albo narzędziem podejmującym decyzje kliniczne.

Aktualny kierunek jest spójny w kilku miejscach:

- **EHDS i europejska wymiana danych zdrowotnych** wzmacniają dostęp pacjenta do elektronicznych danych zdrowotnych, kontrolę nad ich użyciem oraz interoperacyjność systemów.
- **International Patient Summary / HL7 FHIR IPS** pokazuje, że krótkie, przenośne i możliwie standardowe podsumowanie pacjenta jest naturalnym formatem wymiany kontekstu.
- **Polska dyskusja o IKP, EDM, P1 i e-Profilu Pacjenta** przesuwa się w stronę pytania: jak lekarz i pacjent mają szybko zobaczyć pełniejszy, praktyczny kontekst w chwili wizyty.
- **Publikacje WHO o AI w zdrowiu** podkreślają, że automatyzacja w ochronie zdrowia wymaga jasnego celu, transparentności, ochrony danych, nadzoru człowieka i odpowiedzialności za użycie.

Wniosek dla projektu jest prosty: Pacjent 360 nie powinien budować "AI lekarza" ani obchodzić IKP. Powinien rozwijać się jako niezależna, open source warstwa porządkowania kontekstu:

- źródła i proweniencja danych,
- oś czasu i epizody opieki,
- leki przepisane, wykupione i faktycznie przyjmowane,
- zgody pacjenta i krąg wsparcia,
- `Known / Unknown / Uncertain / To verify`,
- pytania DITL,
- raport kontekstowy przed wizytą,
- asystenci operacyjni jako wsparcie organizacyjne, nie kliniczne.

To oznacza, że roadmapa powinna być inspirowana aktualnymi standardami i publikacjami, ale wdrażana ostrożnie: najpierw lokalny prototyp, fikcyjne dane, walidacja z lekarzami i pacjentami, a dopiero później rozmowa o oficjalnych integracjach.

## Wizja

Docelowo Pacjent 360 powinien działać jak **open source companion dla IKP/P1**.

Nie zastępuje IKP. Nie obchodzi IKP. Nie przechowuje loginów pacjenta. Nie udaje systemu państwowego.

Może natomiast stać się warstwą, która pomaga pacjentowi i lekarzowi lepiej wykorzystać dane: zbudować oś czasu, uporządkować leki, zobaczyć braki, przygotować pytania i wygenerować krótki raport przed wizytą lub decyzją medyczną.

W tej wizji jest też miejsce na asystentów operacyjnych: asystenta lekowego i asystenta wizyt. Ich rola nie polega na decyzjach klinicznych, tylko na pilnowaniu harmonogramu, checklist, brakujących dokumentów, zgód i pytań do lekarza.

## Co pokazuje obecne MVP

Prototyp jest lokalny i demonstracyjny. Pokazuje kierunek produktu:

- trzy kokpity oparte o te same dane: **Lekarz**, **Pacjent** i **Opiekun**,
- widok lekarza **Pacjent w 90 sekund**,
- widok pacjenta **Mój Pacjent 360**,
- wywiad i transkrypcję rozmowy jako ważne źródło danych,
- multi-track timeline od ogółu do szczegółu,
- Medication Story: leki przepisane vs faktycznie przyjmowane,
- flagi red, amber, green i blue jako sygnały do wyjaśnienia,
- raport one-pager w stylu `Known / Unknown / Uncertain / To verify`,
- zgody, audyt i eksport JSON.

MVP używa fikcyjnych, kompozytowych przypadków. Nie opisuje historii choroby żadnej konkretnej osoby.

## Co jest w planie

Najbliższy rozwój projektu powinien odpowiadać na potrzeby trzech osób patrzących na tę samą historię: pacjenta, opiekuna i lekarza.

1. **Przed wizytą: przygotowanie kontekstu**
   - pacjent lub opiekun zbiera dokumenty, leki, wyniki, objawy, pytania i transkrypcję wywiadu,
   - system pokazuje, czego brakuje przed rozmową z lekarzem,
   - raport nie daje zaleceń, tylko porządkuje pytania DITL.

2. **W trakcie wizyty: krótki raport dla lekarza**
   - lekarz widzi `Known / Unknown / Uncertain / To verify`,
   - każde pytanie ma źródło: dokument, wynik, wywiad, lek albo transkrypcja,
   - lekarz może oznaczyć pytania i flagi jako wyjaśnione, odrzucone albo wymagające kontroli.

3. **Po wizycie: zamknięcie pętli**
   - system zapisuje, co lekarz rozstrzygnął,
   - pacjent widzi, co ma przygotować, sprawdzić lub omówić przy kolejnym kontakcie,
   - opiekun może pilnować tylko tych zadań, do których pacjent dał mu dostęp.

4. **Krąg wsparcia i zadania**
   - pacjent świadomie udostępnia wybrane dane rodzicowi, opiekunowi lub rodzinie,
   - człowiek z dostępem do obszaru leków widzi harmonogram i może oznaczać zadania jako wykonane,
   - człowiek z dostępem do obszaru wizyt widzi terminy, checklisty i dokumenty potrzebne na wizytę,
   - asystenci (funkcje systemu) pomagają porządkować te obszary; decyzje podejmuje człowiek.

5. **Medication Story z udziałem farmaceuty**
   - projekt powinien lepiej rozróżniać leki przepisane, wykupione i faktycznie przyjmowane,
   - OTC, suplementy, odstawienia i objawy po zmianie leku powinny trafiać do pytań dla lekarza lub farmaceuty,
   - system nie powinien samodzielnie sugerować zmiany leczenia.

6. **Asystenci operacyjni**
   - asystent lekowy może pilnować harmonogramu, braków potwierdzenia i rozbieżności,
   - asystent wizyt może przygotować checklistę dokumentów i pytań,
   - asystenci nie są narzędziami klinicznymi: nie diagnozują, nie oceniają pilności i nie rekomendują terapii.

7. **Integracje dopiero po walidacji**
   - najpierw import ręczny i eksport JSON,
   - potem model gotowy na oficjalne standardy,
   - dopiero na końcu legalna, oficjalna integracja z IKP/P1/e-Profilem Pacjenta, bez scrapingu i bez przechowywania loginów.

Pierwsza hipoteza do walidacji jest prosta: **czy taki one-pager pomaga lekarzowi szybciej zobaczyć, co trzeba wyjaśnić, a pacjentowi i opiekunowi lepiej przygotować się do wizyty.**

## Czego ten projekt nie robi

Pacjent 360 nie jest systemem medycznym gotowym do użycia klinicznego.

Nie diagnozuje. Nie rekomenduje leczenia. Nie mówi lekarzowi ani pacjentowi, co mają zrobić terapeutycznie. Nie zastępuje IKP, P1, EDM ani systemów placówek.

System może zapytać:

> Czy aktualna lista leków została potwierdzona z pacjentem lub opiekunem?

Ale nie powinien powiedzieć:

> Odstaw lek X albo zastosuj leczenie Y.

Każda decyzja kliniczna musi pozostać po stronie uprawnionego profesjonalisty medycznego. To jest zasada **DITL: Doctor in the Loop**.

## Clinical Safety Checklist

Ta lista jest obowiązkową bramką dla zmian publicznych i PR, zgodnie z `CONTRIBUTING.md`.

- Czy zmiana nie dodaje realnych danych pacjentów, dokumentacji medycznej ani danych możliwych do identyfikacji?
- Czy zmiana nie diagnozuje, nie rekomenduje leczenia, nie ocenia pilności, nie robi triage i nie zastępuje decyzji lekarza?
- Czy każda flaga, pytanie, automatyzacja i informacja wyjściowa ma źródło oraz jawny status DITL?
- Czy UI używa języka: pytanie, brak danych, zadanie, status, kontekst, do wyjaśnienia?
- Czy UI unika języka: diagnoza, zalecenie, wskazanie, pilne, należy, leczenie, terapia, w normie, poza normą?
- Czy użytkownik widzi, że Pacjent 360 nie jest IKP, P1, CeZ, NFZ ani e-Profilem Pacjenta?
- Czy zmiana jest spójna z `docs/legal/DISCLAIMER.md`, `docs/governance/RISKS.md`, `docs/legal/PRIVACY.md` i `SECURITY.md`?

Jeśli odpowiedź na którekolwiek pytanie jest negatywna albo niepewna, zmiana jest **no-go** do czasu wyjaśnienia przez review kliniczne, prawne lub bezpieczeństwa.

## Dlaczego open source

Taki projekt nie powinien powstawać w zamkniętym pokoju.

Potrzeba tu wiedzy lekarzy, pacjentów, opiekunów, prawników, ekspertów ochrony danych, projektantów usług publicznych, inżynierów, osób od dostępności i ludzi, którzy znają realne ścieżki pacjenta.

Open source jest tu nie tylko modelem pracy nad kodem. Jest sposobem na jawność:

- jawny model danych,
- jawne ograniczenia,
- jawne źródła,
- jawne pytania kliniczne,
- jawny audyt decyzji projektowych.

## Dla kogo

Szukamy rozmowy i współpracy z osobami, które mogą pomóc odpowiedzieć na pytania:

- czy taki raport pomógłby lekarzowi w realnej pracy,
- jak pacjent powinien widzieć swoje dane, żeby ich nie zgubić i nie przecenić,
- jak bezpiecznie włączyć opiekuna lub rodzinę,
- gdzie przebiega granica między kontekstem a rekomendacją medyczną,
- jak projektować integrację z IKP/P1 bez obchodzenia oficjalnych mechanizmów,
- jak przygotować projekt do walidacji klinicznej, prawnej i bezpieczeństwa.

## Kontakt

Kanały kontaktu dla projektu nie są jeszcze potwierdzone jako skonfigurowane.

**DO UZUPEŁNIENIA PRZED GO-LIVE DOMENY I PRYWATNYM OBSŁUGIWANIEM ZGŁOSZEŃ:** trzeba skonfigurować, przetestować i opisać działające aliasy:

- `security@pacjent360.com.pl` - prywatne zgłoszenia podatności, incydentów prywatności i ryzyk clinical safety.
- `kontakt@pacjent360.com.pl` - ogólny kontakt projektowy, współpraca i pytania organizacyjne.

Te adresy są proponowanym modelem kontaktu; ten dokument nie deklaruje, że skrzynki już działają. Do czasu potwierdzenia kanałów nie publikuj szczegółów podatności, danych pacjentów ani ryzyk prywatności w publicznych issue.

Po skonfigurowaniu poczty użyj `tools/verify-contact-gate.ps1`: najpierw `-DnsOnly`, a po ręcznym teście wysyłka-odbiór-odpowiedź `-ReceiptConfirmed -MonitorOwner "..."`.

## Quick start

1. Otwórz `public/index.html` w przeglądarce.
2. Opcjonalnie uruchom lokalny serwer:

```powershell
python -m http.server 4173 --bind 127.0.0.1 --directory public
```

3. Wejdź na:

```text
http://127.0.0.1:4173/index.html
```

4. Demo aplikacji jest w:

```text
http://127.0.0.1:4173/demo.html
```

Nie wpisuj do demo realnych danych pacjentów. Zmiany w demo mogą być zapisane lokalnie w przeglądarce przez `localStorage`.

## Mapa projektu

Root repozytorium ma być czytelny. Szczegółowe dokumenty są w `docs/`, żeby publiczny widok projektu nie mieszał strony, demo, governance i planów roboczych w jednym miejscu.

- `public/` - źródła statycznej strony, demo i plików publikowanych w document root hostingu.
- `public/app.js`, `public/styles.css`, `public/patient360-*.js`, `schema/`, `fixtures/` - prototyp MVP, modele i fikcyjne dane testowe.
- `README.md`, `LICENSE`, `NOTICE`, `SECURITY.md`, `CONTRIBUTING.md`, `CHANGELOG.md` - podstawowe dokumenty open source.
- `PRODUCT_SSOT.md` - nadrzędne źródło prawdy o produkcie: czym jest, czym nie jest, kanoniczny model, no-go.
- `docs/PROGRAM_PLAN.md` - nadrzędny plan strategiczny i harmonogram rzeczowo-techniczny.
- `docs/ARCHITECTURE.md` - architektura Pacjent 360 jako warstwy kontekstu nad IKP/P1.
- `docs/SSOT.md` - źródło prawdy dla roli LLM i asystentów operacyjnych (podrzędne wobec `PRODUCT_SSOT.md`).
- `docs/product/FIRST_WEDGE.md` - pierwszy wedge produktu: pętla przygotowania wizyty (opiekun mobile + lekarz desktop).
- `docs/TIMELINE_VISION.md` - docelowa mapa pacjenta, warstwy, epizody i zasilanie danymi.
- `docs/ROADMAP.md`, `docs/SPRINTS.md` - roadmapa i aktywny backlog rozwoju.
- `docs/legal/` - disclaimer, prywatność i licencja dokumentacji.
- `docs/governance/` - risk register, komunikacja kryzysowa i dostępność.
- `docs/governance/DEFINITION_OF_HARM.md` - katalog szkód H-001..H-010 i bramki, które je blokują.
- `docs/governance/SAFETY_CASE.md` - argumentacja bezpieczeństwa: jak architektura wymusza granicę DITL.
- `docs/deployment/` - publikacja, rollback, GitHub i nazwa.pl.
- `docs/validation/` - protokół walidacji, formularz feedbacku i szablon wyników.
- `docs/adr/` - decyzje architektoniczne.
- `tools/` - walidatory, smoke testy i skrypty budowania czystych paczek.

## Licencje i znak projektu

Kod, skrypty, modele danych, testy i pliki techniczne Pacjent 360 są udostępniane na warunkach Apache License 2.0.

Dokumentacja, architektura, roadmapa, opisy koncepcyjne i materiały projektowe są udostępniane na warunkach Creative Commons Attribution 4.0 International (CC BY 4.0), chyba że dany plik wskazuje inaczej.

Nazwa Pacjent 360, domena `pacjent360.com.pl`, identyfikacja projektu i materiały opisujące jego status nie mogą być używane w sposób sugerujący oficjalną afiliację z CeZ, NFZ, IKP, P1, e-Profilem Pacjenta, certyfikację kliniczną, status wyrobu medycznego albo gotowość do użycia medycznego. Szczegóły: `NOTICE`, `docs/legal/DISCLAIMER.md` i `docs/legal/DOCS_LICENSE.md`.

## Ważne ograniczenie

To repozytorium jest prototypem koncepcyjnym. Każde użycie produkcyjne wymaga walidacji klinicznej, prawnej, bezpieczeństwa, ochrony danych i zgodności regulacyjnej.

**Dla modeli AI, asystentów operacyjnych i nowych kontrybutorów:** zacznij od `PRODUCT_SSOT.md`, potem `docs/PROGRAM_PLAN.md`, `docs/SSOT.md`, `docs/ARCHITECTURE.md` i `docs/TIMELINE_VISION.md`.

Najważniejszy dokument techniczny: `docs/ARCHITECTURE.md`.

Najważniejszy dokument bezpieczeństwa medycznego: `docs/legal/DISCLAIMER.md`.

Najważniejszy dokument dla LLM i asystentów operacyjnych: `docs/SSOT.md`. Sprinty i roadmapa muszą być z nim zgodne.

## Referencje koncepcyjne

Pacjent 360 nie deklaruje zgodności regulacyjnej ani formalnej integracji ze standardami medycznymi. Te źródła pokazują kierunek myślenia: interoperacyjność, krótkie podsumowanie pacjenta, bezpieczeństwo AI, proweniencja danych i jasne granice kliniczne.

Aktualny kontekst systemowy i standardy:

- European Health Data Space (EHDS): https://www.consilium.europa.eu/en/press/press-releases/2025/01/21/european-health-data-space-council-adopts-new-regulation-improving-cross-border-access-to-eu-health-data/
- HL7 FHIR International Patient Summary Implementation Guide: https://hl7.org/fhir/uv/ips/STU2/
- WHO ethics and governance of AI for health - large multi-modal models: https://www.who.int/publications/i/item/9789240084759
- WHO ethics and governance of AI for health: https://www.who.int/publications/i/item/9789240029200
- OIL Warszawa / Puls: "Czy w 2026 r. lekarze sprawdzą pełne dane pacjenta?": https://izba-lekarska.pl/puls/publicystyka/technologia/czy-w-2026-r-lekarze-sprawdza-pelne-dane-pacjenta.html
- OIL Warszawa / Puls: "IKP ma być pierwszym punktem kontaktu pacjenta z systemem zdrowia": https://izba-lekarska.pl/puls/publicystyka/technologia/ikp-ma-byc-pierwszym-punktem-kontaktu-pacjenta-z-systemem-zdrowia.html

Warstwa flag i raportów w MVP jest demonstracyjna. Przy dalszym rozwoju warto opierać reguły i język kliniczny na oficjalnych źródłach:

- NICE suspected sepsis: https://www.nice.org.uk/guidance/NG253
- Royal College of Physicians NEWS2: https://rcp.ac.uk/news-and-media/news-and-opinion/nhs-england-approves-use-of-national-early-warning-score-news-2-to-improve-detection-of-acutely-ill-patients/
- NICE routine preoperative tests: https://www.nice.org.uk/guidance/ng45
- AHRQ MATCH medication reconciliation: https://www.ahrq.gov/patient-safety/settings/hospital/match/index.html
- British Geriatrics Society CGA: https://www.bgs.org.uk/CGA
