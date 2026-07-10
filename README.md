# Pacjent360™

<!-- P360_CURRENT_SCOPE_V1
contract_id=FCV1-D1-D8-2026-07-10
current_sprint=S0
gate=G0_PENDING
primary_user=competent_adult_patient
support_user=one_named_adult_supporter
wedge=one_planned_visit
data=synthetic_only
doctor=later_read_only_recipient
children_guardians=blocked
runtime_ai_ocr_cdss=blocked
backend=blocked
public_launch=blocked_2026_2027
-->

Pacjent przychodzi do systemu ochrony zdrowia z historią, nie z tabelą danych. Pacjent360 porządkuje źródła i przygotowanie do rozmowy. Nie interpretuje klinicznie ich znaczenia.

Ma wyniki badań, wypisy, listę leków, skierowania, objawy, wspomnienia z poprzednich wizyt, obserwacje rodziny i rzeczy, których sam nie potrafi dobrze nazwać. Lekarz ma kilka minut, przeciążony system i decyzję do podjęcia tu i teraz.

Problemem bardzo często nie jest brak danych. Problemem jest brak kontekstu.

**Pacjent360™** to otwarty projekt, który próbuje odpowiedzieć na jedno praktyczne pytanie:

> Co warto zebrać i wyjaśnić przed dzisiejszą rozmową z lekarzem?

## Bieżący status i zakres

- Status projektu: **alpha / v0.2.2-alpha**.
- Strona projektu: https://pacjent360.com.pl/
- Demo MVP: https://pacjent360.com.pl/demo.html?start=1&lang=pl
- To jest statyczny prototyp koncepcyjny i demonstracyjny, nie system gotowy do użycia klinicznego.
- Demo korzysta z fikcyjnych, kompozytowych przypadków i nie powinno przyjmować realnych danych pacjentów.
- Ratyfikowany current wedge: **kompetentny dorosły pacjent + jedna nazwana dorosła osoba wspierająca + jedna planowana wizyta**.
- Bieżący przepływ: źródłowa historia → ręczny wybór informacji → maksymalnie 3 pytania użytkownika → wersjonowany pakiet wizyty.
- Aktywny jest wyłącznie Sprint 0 Governance Freeze. Wszystkie późniejsze sprinty pozostają warunkowe do odpowiedniej bramki i podpisu człowieka.
- Lekarz nie jest bieżącym użytkownikiem produktu. Może zostać późniejszym odbiorcą read-only pakietu po osobnej decyzji i walidacji.
- Dzieci, opiekunowie prawni, runtime AI/LLM/OCR, backend, realne dane i publiczny self-service pozostają zablokowane.

## O co chodzi

Pacjent360™ ma być warstwą porządkującą historię pacjenta: dokumenty, badania, leki do potwierdzenia, wizyty, obserwacje i pytania zapisane przez użytkownika.

Nie chodzi o to, żeby system zastąpił lekarza. Chodzi o to, żeby przed rozmową z lekarzem szybciej zobaczyć:

- co wiadomo,
- czego brakuje,
- co jest niepewne,
- co trzeba zweryfikować,
- jakie pytania nie powinny zginąć w pośpiechu.

To jest projekt o lepszym kontekście, nie o automatycznej diagnozie.

## Pierwszy problem do zbadania

Czy dorosły pacjent, wspierany przez jedną wybraną osobę, potrafi na fikcyjnych danych przygotować jedną planowaną wizytę bez pomylenia źródła, osoby, uprawnienia albo statusu informacji?

Current Alpha może pokazywać wyłącznie:

- źródłową historię i neutralne statusy informacji;
- ręczny wybór wpisów do jednej wizyty;
- maksymalnie trzy pytania zapisane przez pacjenta lub osobę wspierającą;
- zakres widoczności osoby wspierającej;
- wersjonowany pakiet przygotowany przez użytkownika.

Techniczne lub historyczne widoki lekarza, agentów i wcześniejszych sprintów mogą pozostawać wyłącznie materiałem laboratoryjnym `REFERENCE_ONLY`. Nie definiują bieżącego produktu ani backlogu.

Hipoteza użytkowa 2026 to B2C. B2B2C pozostaje oddzielnym, równoległym discovery komercyjnym i nie zmienia current wedge.

## Czego ten projekt nie robi

Pacjent360™ nie jest systemem medycznym gotowym do użycia klinicznego.

Nie diagnozuje. Nie rekomenduje leczenia. Nie mówi lekarzowi ani pacjentowi, co mają zrobić terapeutycznie. Nie zastępuje IKP, P1, EDM ani systemów placówek.

System może zapytać:

> Czy aktualna lista leków została potwierdzona z pacjentem lub opiekunem?

Ale nie powinien powiedzieć:

> Odstaw lek X albo zastosuj leczenie Y.

Każda decyzja kliniczna musi pozostać po stronie uprawnionego profesjonalisty medycznego. To jest zasada **DITL: lekarz w procesie decyzyjnym**.

## Clinical Safety Checklist

Ta lista jest obowiązkową bramką dla zmian publicznych i PR, zgodnie z `CONTRIBUTING.md`.

- Czy zmiana nie dodaje realnych danych pacjentów, dokumentacji medycznej ani danych możliwych do identyfikacji?
- Czy zmiana nie diagnozuje, nie rekomenduje leczenia, nie ocenia pilności i nie zastępuje decyzji lekarza?
- Czy każda flaga, pytanie, automatyzacja i informacja wyjściowa ma źródło oraz jawny status DITL?
- Czy UI używa języka: pytanie, brak danych, zadanie, status, kontekst, do wyjaśnienia?
- Czy UI unika języka: diagnoza, zalecenie, wskazanie, pilne, należy, leczenie, terapia, w normie, poza normą?
- Czy użytkownik widzi, że Pacjent360™ nie jest IKP, P1, CeZ, NFZ ani e-Profilem Pacjenta?
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

Kanały kontaktu dla projektu są skonfigurowane i monitorowane:

- `security@pacjent360.com.pl` - prywatne zgłoszenia podatności, incydentów prywatności i ryzyk clinical safety.
- `kontakt@pacjent360.com.pl` - ogólny kontakt projektowy, współpraca i pytania organizacyjne.

Nie publikuj szczegółów podatności, danych pacjentów, dokumentacji medycznej ani ryzyk prywatności w publicznych issue. W takich sprawach użyj `security@pacjent360.com.pl`.

Ostatnia bramka kontaktowa została potwierdzona przez `tools/verify-contact-gate.ps1 -ReceiptConfirmed -MonitorOwner "Sebastian Kalisz"`.

## Quick start

Najprostsza ścieżka:

- strona publiczna: https://pacjent360.com.pl/
- demo MVP: https://pacjent360.com.pl/demo.html

Lokalnie:

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
- `README.md`, `LICENSE`, `NOTICE`, `SECURITY.md`, `CONTRIBUTING.md`, `CHANGELOG.md` - podstawowe dokumenty open source; `CHANGELOG.md` jest zapisem historycznym, nie current scope authority.
- `PRODUCT_SSOT.md` - nadrzędne źródło prawdy o produkcie: czym jest, czym nie jest, kanoniczny model, no-go.
- `docs/PROGRAM_PLAN.md` - nadrzędny plan strategiczny i harmonogram rzeczowo-techniczny.
- `docs/ARCHITECTURE.md` - `REFERENCE_ONLY`: historyczna architektura docelowa, nie current SSOT ani aktywny backlog.
- `docs/product/FIRST_WEDGE.md` - ratyfikowany current wedge: dorosły pacjent, jedna dorosła osoba wspierająca i jedna planowana wizyta.
- `docs/governance/CURRENT_SCOPE_MANIFEST.json` - zamknięta klasyfikacja aktywnych, wspierających i referencyjnych powierzchni sterujących.
- `docs/governance/GOVERNANCE_V2_STANDING_DELEGATION.md` - aktywny mandat wykonawczy Codexa i katalog decyzji zastrzeżonych dla Foundera.
- `docs/product/WO_P360_S0_GOVERNANCE_FREEZE_2026-07-10.md` - jedyny aktywny work order.
- `docs/TIMELINE_VISION.md` - `REFERENCE_ONLY`: historyczna wizja mapy, nie zakres bieżącej Alphy.
- `docs/ROADMAP.md` - aktywny widok bramek. `docs/SSOT.md` i `docs/SPRINTS.md` są historycznymi materiałami `SUPERSEDED / REFERENCE_ONLY`; nie sterują aktywnym backlogiem.
- `docs/PROJECT_CHRONICLE.md` - `REFERENCE_ONLY`: kronika historyczna; decyzje wiążące są wyłącznie w ADR/Decision Logu.
- `docs/legal/` - disclaimer, prywatność i licencja dokumentacji.
- `docs/governance/` - risk register, komunikacja kryzysowa i dostępność.
- `docs/governance/DEFINITION_OF_HARM.md` - katalog szkód H-001..H-010 i bramki, które je blokują.
- `docs/governance/SAFETY_CASE.md` - argumentacja bezpieczeństwa: jak architektura wymusza granicę DITL.
- `docs/deployment/` - publikacja, rollback, GitHub i nazwa.pl.
- `docs/validation/` - protokół walidacji, formularz opinii i szablon wyników.
- `docs/adr/` - decyzje architektoniczne.
- `tools/` - walidatory, smoke testy i skrypty budowania czystych paczek.

## Licencje i znak projektu

Kod, skrypty, modele danych, testy i pliki techniczne Pacjent360™ są udostępniane na warunkach Apache License 2.0.

Dokumentacja, architektura, roadmapa, opisy koncepcyjne i materiały projektowe są udostępniane na warunkach Creative Commons Attribution 4.0 International (CC BY 4.0), chyba że dany plik wskazuje inaczej.

Nazwa Pacjent360™, domena `pacjent360.com.pl`, identyfikacja projektu i materiały opisujące jego status nie mogą być używane w sposób sugerujący oficjalną afiliację z CeZ, NFZ, IKP, P1, e-Profilem Pacjenta, certyfikację kliniczną, status wyrobu medycznego albo gotowość do użycia medycznego. Szczegóły: `NOTICE`, `docs/legal/DISCLAIMER.md` i `docs/legal/DOCS_LICENSE.md`.

Według deklaracji foundera z 2026-07-06 wniosek dotyczący ochrony znaku Pacjent360 został złożony. Repozytorium nie publikuje numeru zgłoszenia ani nie twierdzi, że ochrona została już udzielona; status formalny powinien być potwierdzany w odpowiednim rejestrze lub przez kancelarię.

## Ważne ograniczenie

To repozytorium jest prototypem koncepcyjnym. Każde użycie produkcyjne wymaga walidacji klinicznej, prawnej, bezpieczeństwa, ochrony danych i zgodności regulacyjnej.

**Dla Codexa, innych narzędzi i nowych kontrybutorów:** zacznij od `docs/governance/CURRENT_SCOPE_MANIFEST.json`, następnie `PRODUCT_SSOT.md`, `docs/product/FIRST_WEDGE.md`, ADR 0008 i jedynego aktywnego work orderu.

Aktualne granice techniczne wynikają z `PRODUCT_SSOT.md`, ADR 0008, manifestu current scope i aktywnego work orderu. `docs/ARCHITECTURE.md` pozostaje wyłącznie historyczną referencją.

Najważniejszy dokument bezpieczeństwa medycznego: `docs/legal/DISCLAIMER.md`.

<!-- P360_IGNORED_CONTROL_PLANE: docs/product-delivery/ REFERENCE_ONLY -->

`docs/ARCHITECTURE.md`, `docs/TIMELINE_VISION.md`, `docs/PROJECT_CHRONICLE.md`, `CHANGELOG.md`, `docs/SSOT.md`, `docs/SPRINTS.md`, `BLUEPRINT/`, `docs/product-delivery/` i prywatne prompty `CODEX_*.md` są `REFERENCE_ONLY` dla current scope. Nie mogą sterować bieżącym backlogiem bez nowego ADR i aktualizacji manifestu.

## Referencje koncepcyjne

Pacjent360™ nie deklaruje zgodności regulacyjnej ani formalnej integracji ze standardami medycznymi. Te źródła pokazują kierunek myślenia: interoperacyjność, krótkie podsumowanie pacjenta, bezpieczeństwo AI, proweniencja danych i jasne granice kliniczne.

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
