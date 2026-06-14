# Pacjent360: Sprinty PL/EN dla Demo

Status: plan do wykonania
Zakres: demo PL/EN, routing ze strony WWW do właściwej wersji językowej demo
Zasada: jedna aplikacja `demo.html`, dwa języki przez `?lang=pl|en`, bez duplikowania demo

Guard rails wykonania: `docs/product/DEMO_I18N_GOAL_GUARD.md`. Ten dokument jest obowiązkowy dla każdego etapu sprintu. Jeśli guard i sprint plan są w konflikcie, wygrywa guard.

## Cel

Po wejściu ze strony polskiej użytkownik trafia do polskiego demo. Po wejściu ze strony angielskiej użytkownik trafia do angielskiego demo. Demo zachowuje tę samą historię, te same fikcyjne dane i te same granice bezpieczeństwa, ale zmienia język, nazwy ról, CTA, komunikaty i narrację.

## Najważniejsza decyzja architektoniczna

Nie tworzymy `demo-en.html`. Utrzymujemy jedno `demo.html`, sterowane parametrem języka.

Powód:

- mniejsze ryzyko driftu między PL i EN,
- jedna logika reactivity,
- jeden zestaw testów,
- jedna paczka uploadu,
- łatwiejsze utrzymanie scenariuszy pacjentów.

## Reguły bezpieczeństwa języka

- PL: nie używać słowa "pętla" jako nazwy mechanizmu. Używać: "Decyzja lekarza", "Do oceny lekarza", "Pytania do rozmowy".
- EN: dopuszczalne `Doctor in the Loop` i `DITL`, jeśli występują w kontekście bezpieczeństwa.
- PL/EN: system nie diagnozuje, nie prowadzi triage, nie ocenia pilności, nie rekomenduje terapii.
- AI assistants / asystenci AI: porządkują materiały, nie podejmują decyzji medycznych.
- Care Circle / krąg opieki: ludzie, nie agenci.

## Globalne Definition of Done

- [ ] Strona PL prowadzi do `demo.html?start=1&lang=pl`.
- [ ] Strona EN prowadzi do `demo.html?start=1&lang=en`.
- [ ] `demo.html?start=1&lang=pl` startuje po polsku niezależnie od starego `localStorage`.
- [ ] `demo.html?start=1&lang=en` startuje po angielsku niezależnie od starego `localStorage`.
- [ ] Przełącznik języka w demo nie zmienia pacjenta, roli ani widoku.
- [ ] Główna ścieżka demo ma pełne PL i EN.
- [ ] 3 role x 3 pacjentów działają w PL i EN.
- [ ] Brak języka "gra" w UI.
- [ ] Brak polskich resztek w głównej ścieżce EN.
- [ ] Brak angielskich resztek w głównej ścieżce PL.
- [ ] Harm gates przechodzą dla PL i EN.
- [ ] `dist/upload-ready` zawiera aktualne pliki.

## Globalne Definition of Evidence

- [ ] Zrzuty ekranu: PL start, EN start.
- [ ] Zrzuty ekranu: Lekarz360/Doctor, Pacjent360/Patient, Opiekun360/Caregiver.
- [ ] Zrzuty ekranu: Historia pacjenta / Patient history.
- [ ] Log z `validate-i18n-coverage`.
- [ ] Log z testu routingowego WWW -> demo.
- [ ] Log z testu 3 role x 3 pacjentów.
- [ ] Log z `validate-harm-gates`.
- [ ] Log z `verify-deployed-site` po uploadzie.

---

# Sprint 0: Kontrakt Języka i Zakres

Czas: 0.5 dnia
Cel: ustalić, co dokładnie znaczy "demo po angielsku" w wersji alpha.

## Zakres

- [ ] Spisać kontrakt URL: `?lang=pl`, `?lang=en`, `?start=1`.
- [ ] Określić priorytet tłumaczenia: główna ścieżka demo przed technicznymi zakamarkami.
- [ ] Zdefiniować słownik PL/EN dla ról, widoków i CTA.
- [ ] Zdefiniować słownik safety PL/EN.
- [ ] Oznaczyć widoki debug/techniczne jako niższy priorytet.

## Słownik startowy

| PL | EN |
|---|---|
| Pacjent360™ | Patient360 |
| Lekarz360 | Doctor360 / Doctor cockpit |
| Pacjent360 | Patient360 / Patient cockpit |
| Opiekun360 | Caregiver360 / Caregiver cockpit |
| Historia pacjenta | Patient history |
| Mapa historii | History map |
| Źródła | Sources |
| Pytania do rozmowy | Questions to discuss |
| Do oceny lekarza | For doctor review |
| Decyzja należy do lekarza | The doctor makes the clinical decision |
| Brak dostępu | No access |
| Zakres zgody | Consent scope |

## DoD

- [ ] Jest zatwierdzony słownik PL/EN.
- [ ] Jest decyzja: jedno `demo.html`, nie `demo-en.html`.
- [ ] Jest lista widoków krytycznych dla EN.
- [ ] Jest lista widoków, które mogą poczekać.

## DoE

- [ ] Dokument zawiera słownik.
- [ ] Dokument zawiera listę widoków P0/P1.
- [ ] Founder może w 2 minuty wyjaśnić, jak działa routing PL/EN.

## Weryfikacja

```powershell
rg -n "demo.html\\?start=1|lang=en|lang=pl" public
```

## Decyzja na koniec sprintu

- [ ] Zatwierdzamy zakres EN jako "główna ścieżka demo".
- [ ] Rozszerzamy od razu EN na wszystkie widoki.
- [ ] Stop: brakuje decyzji o nazewnictwie.

---

# Sprint 1: Routing WWW -> Demo

Czas: 1 dzień
Cel: strona PL i EN kierują do właściwej wersji językowej demo.

## Zakres

- [ ] Zaktualizować wszystkie CTA do demo na stronie głównej.
- [ ] Zaktualizować CTA do demo w stopkach i podstronach.
- [ ] `story.js` aktualizuje linki demo po przełączeniu języka.
- [ ] `?lang=en` na stronie daje linki do `demo.html?start=1&lang=en`.
- [ ] `?lang=pl` albo brak parametru daje linki do `demo.html?start=1&lang=pl`.
- [ ] `start=1` w demo resetuje tylko ekran startowy, nie psuje języka.

## Pliki

- [ ] `public/index.html`
- [ ] `public/assets/story.js`
- [ ] podstrony `public/*.html`
- [ ] test routingowy w `tools/`

## DoD

- [ ] Każdy widoczny link "Demo" na PL prowadzi do PL demo.
- [ ] Każdy widoczny link "Demo" na EN prowadzi do EN demo.
- [ ] Linki działają po zmianie języka bez przeładowania.
- [ ] Nie ma linków do `demo.html?start=1` bez `lang`.

## DoE

- [ ] Log z wyszukania linków demo.
- [ ] Test automatyczny routingowy.
- [ ] Screenshot PL strony z linkiem do PL demo.
- [ ] Screenshot EN strony z linkiem do EN demo.

## Weryfikacja

```powershell
rg -n "demo.html\\?start=1(?!&lang=)" public
node tools/validate-site-consistency.js
node tools/smoke-browser.js --packageDir public
```

## Decyzja na koniec sprintu

- [ ] Routing gotowy.
- [ ] Routing wymaga poprawy na podstronach.
- [ ] Stop: demo nie obsługuje jeszcze `lang`.

---

# Sprint 2: Silnik Języka w Demo

Czas: 1-2 dni
Cel: demo przyjmuje język z URL, pamięta go i pozwala zmienić bez utraty kontekstu.

## Zakres

- [ ] Dodać model języka demo: `activeLanguage`.
- [ ] Priorytet języka: URL > localStorage > `pl`.
- [ ] Dodać przełącznik PL/EN w demo.
- [ ] Przełącznik zmienia copy bez resetowania pacjenta, roli i widoku.
- [ ] `start=1` nie przywraca starego języka z localStorage, jeśli URL ma `lang`.
- [ ] Dodać helper tłumaczeń, bez mieszania logiki medycznej z copy.

## Pliki

- [ ] `public/demo.html`
- [ ] `public/app.js`
- [ ] `public/styles.css`
- [ ] ewentualnie nowy `public/patient360-i18n.js`

## DoD

- [ ] `demo.html?start=1&lang=pl` pokazuje start po polsku.
- [ ] `demo.html?start=1&lang=en` pokazuje start po angielsku.
- [ ] Przełącznik PL/EN działa na ekranie startowym.
- [ ] Przełącznik PL/EN działa w kokpitach.
- [ ] Zmiana języka nie zmienia aktywnego pacjenta.
- [ ] Zmiana języka nie zmienia aktywnej roli.

## DoE

- [ ] Screenshot PL start.
- [ ] Screenshot EN start.
- [ ] Screenshot EN po wyborze roli i pacjenta.
- [ ] Log z testu: zachowanie `activePatientId` po zmianie języka.

## Weryfikacja

```powershell
node --check public/app.js
node tools/smoke-browser.js --packageDir public
node tools/verify-click-routes.js
```

## Decyzja na koniec sprintu

- [ ] Silnik języka gotowy.
- [ ] Potrzebna korekta stanu/localStorage.
- [ ] Stop: zmiana języka psuje reactivity.

---

# Sprint 3: Główna Ścieżka Demo PL/EN

Czas: 2-3 dni
Cel: przejście start -> perspektywa -> pacjent -> kokpit działa w obu językach.

## Zakres

- [ ] Przetłumaczyć ekran startowy.
- [ ] Przetłumaczyć wybór perspektywy.
- [ ] Przetłumaczyć wybór pacjenta.
- [ ] Przetłumaczyć nazwy kokpitów i role.
- [ ] Przetłumaczyć prowadzenie krok po kroku: Wróć, Dalej, Mapa, Źródła, Podsumowanie.
- [ ] Usunąć resztki języka "gra".
- [ ] Utrzymać prosty język EN, bez nadobietnic.

## DoD

- [ ] Start PL jest w pełni PL.
- [ ] Start EN jest w pełni EN.
- [ ] Wybór perspektywy PL/EN jest jasny.
- [ ] Wybór pacjenta PL/EN jest jasny.
- [ ] Brak mieszania języka w głównej ścieżce.
- [ ] CTA prowadzą do właściwych widoków.

## DoE

- [ ] Screenshoty PL: start, wybór perspektywy, wybór pacjenta.
- [ ] Screenshoty EN: start, perspective selection, patient selection.
- [ ] Log z testu pierwszego kliknięcia.
- [ ] Log z testu ścieżek użytkownika.

## Weryfikacja

```powershell
node tools/verify-click-routes.js
node tools/verify-reactivity.js
node tools/validate-glossary.js
```

## Decyzja na koniec sprintu

- [ ] Główna ścieżka gotowa.
- [ ] Trzeba skrócić EN copy.
- [ ] Stop: użytkownik nie rozumie, co kliknąć dalej.

---

# Sprint 4: Kokpity 360 w PL/EN

Czas: 3 dni
Cel: Lekarz360, Pacjent360 i Opiekun360 mają pełną warstwę językową i właściwy zakres danych.

## Zakres

### Lekarz360

- [ ] Brief po EN.
- [ ] Pytania do rozmowy / Questions to discuss.
- [ ] Źródła / Sources.
- [ ] Leki do potwierdzenia / Medications to confirm.
- [ ] Braki danych / Missing data.
- [ ] Brak diagnozy i triage w copy.

### Pacjent360

- [ ] "Co teraz?" / "What now?"
- [ ] Dokumenty, leki, wyniki, pytania, zgody.
- [ ] Opis wywiadu prostym językiem.
- [ ] Plan organizacyjny bez zaleceń leczenia.

### Opiekun360

- [ ] Zakres zgody / Consent scope.
- [ ] Kto udzielił dostępu.
- [ ] Nad kim sprawowana jest opieka.
- [ ] Brak dostępu po EN i PL.
- [ ] Brak kafli danych, gdy nie ma zgody.

## DoD

- [ ] 3 kokpity działają w PL.
- [ ] 3 kokpity działają w EN.
- [ ] Klik kokpitu zmienia język, zakres danych i CTA.
- [ ] Opiekun bez zgody nie widzi danych.
- [ ] Lekarz widzi pełny kontekst demo.
- [ ] Pacjent widzi prosty język.

## DoE

- [ ] Screenshot: Lekarz360 PL/EN.
- [ ] Screenshot: Pacjent360 PL/EN.
- [ ] Screenshot: Opiekun360 PL/EN.
- [ ] Screenshot: Opiekun360 + Andrzej K. = brak dostępu PL/EN.
- [ ] Log z testu 3 role x 3 pacjentów.

## Weryfikacja

```powershell
node tools/verify-reactivity.js
node tools/validate-caregiver-scope.js
node tools/validate-demo-coherence.js
node tools/validate-harm-gates.js
```

## Decyzja na koniec sprintu

- [ ] Kokpity gotowe.
- [ ] Potrzebne poprawki w zakresie opiekuna.
- [ ] Stop: EN copy sugeruje decyzję medyczną.

---

# Sprint 5: Historia Pacjenta / Patient History

Czas: 2-3 dni
Cel: najważniejszy widok demo jest zrozumiały w PL i EN.

## Zakres

- [ ] Header kontekstu pacjenta PL/EN.
- [ ] Panel "Tu i teraz" / "Here and now".
- [ ] 3 sprawy do wyjaśnienia / 3 points to clarify.
- [ ] Chronologia zdarzeń PL/EN.
- [ ] Typy zdarzeń PL/EN: wizyty, dokumenty, wyniki, leki, obserwacje, zgody, ustalenia po wizycie.
- [ ] Statusy PL/EN: potwierdzone źródłem, do potwierdzenia, planowane.
- [ ] Panel szczegółów PL/EN.
- [ ] Źródła blisko twierdzeń.

## DoD

- [ ] Użytkownik EN po 10 sekundach rozumie, czyją historię widzi.
- [ ] Chronologia działa w PL i EN.
- [ ] Klik zdarzenia pokazuje szczegóły w aktywnym języku.
- [ ] Klik źródła pokazuje źródło w aktywnym języku lub neutralny opis źródła.
- [ ] Nie ma języka diagnozy, pilności ani terapii.

## DoE

- [ ] Screenshot desktop PL/EN.
- [ ] Screenshot mobile PL/EN.
- [ ] Screenshot szczegółu zdarzenia PL/EN.
- [ ] Log z testu kliknięcia zdarzeń.

## Weryfikacja

```powershell
node tools/verify-reactivity.js
node tools/smoke-browser.js --packageDir public
node tools/validate-map-model.js
node tools/validate-harm-gates.js
```

## Decyzja na koniec sprintu

- [ ] Historia pacjenta gotowa do EN alpha.
- [ ] Potrzebny osobny sprint UI.
- [ ] Stop: historia nadal wygląda jak dokumentacja techniczna.

---

# Sprint 6: Raport, Źródła, Zgody i Eksport

Czas: 2 dni
Cel: drugorzędne, ale publicznie widoczne elementy demo nie psują doświadczenia EN.

## Zakres

- [ ] Raport kontekstowy PL/EN.
- [ ] Known / Unknown / Uncertain / To verify w EN bez polskich etykiet.
- [ ] Źródła PL/EN.
- [ ] Zgody PL/EN.
- [ ] Komunikaty eksportu PL/EN.
- [ ] Audyt techniczny nie dominuje głównej ścieżki.
- [ ] Jeżeli widok jest debug, oznaczyć go jako technical/debug.

## DoD

- [ ] Raport działa po EN.
- [ ] Źródła otwierają rekord aktywnego pacjenta.
- [ ] Zgody są czytelne po EN.
- [ ] Eksport nie miesza pacjentów.
- [ ] Widoki techniczne nie są mylone z produktem dla pacjenta.

## DoE

- [ ] Screenshot raportu PL/EN.
- [ ] Screenshot źródeł PL/EN.
- [ ] Screenshot zgód PL/EN.
- [ ] Log eksportu per pacjent.

## Weryfikacja

```powershell
node tools/verify-reactivity.js
node tools/validate-demo-coherence.js
node tools/validate-consent-draft.js
node tools/validate-glossary.js
```

## Decyzja na koniec sprintu

- [ ] Raport i źródła gotowe.
- [ ] Debug wymaga schowania.
- [ ] Stop: źródła przeciekają między pacjentami.

---

# Sprint 7: Automatyczne Bramki PL/EN

Czas: 2 dni
Cel: utrwalić PL/EN tak, żeby kolejne zmiany nie psuły demo.

## Zakres

- [ ] Dodać test routingowy `site -> demo`.
- [ ] Dodać test `demo.html?lang=en` bez polskich resztek w głównej ścieżce.
- [ ] Dodać test `demo.html?lang=pl` bez angielskich resztek w głównej ścieżce.
- [ ] Dodać test przełącznika języka w demo.
- [ ] Rozszerzyć `validate-i18n-coverage` albo dodać osobny `validate-demo-i18n`.
- [ ] Wpiąć bramkę do `validate-go-live`.

## DoD

- [ ] Testy PL/EN przechodzą lokalnie.
- [ ] Testy PL/EN są częścią go-live.
- [ ] Testy nie są oparte na kruchych screenshotach, tylko na DOM/sentinelach.
- [ ] Screenshoty są dowodem dodatkowym, nie jedyną bramką.

## DoE

- [ ] Log z nowej bramki demo i18n.
- [ ] Log z `validate-go-live`.
- [ ] Lista sentinel phrases PL/EN.
- [ ] Screenshoty finalne PL/EN.

## Weryfikacja

```powershell
node tools/validate-i18n-coverage.js
node tools/validate-demo-i18n.js
node tools/smoke-browser.js --packageDir public
powershell -ExecutionPolicy Bypass -File tools\validate-go-live.ps1
```

## Decyzja na koniec sprintu

- [ ] Bramki gotowe.
- [ ] Bramki zbyt kruche, wymagają uproszczenia.
- [ ] Stop: bramka przepuszcza mieszany język.

---

# Sprint 8: Release PL/EN Demo

Czas: 1 dzień
Cel: przygotować, opublikować i potwierdzić demo PL/EN na domenie.

## Zakres

- [ ] Pełne testy lokalne.
- [ ] Przygotować `dist/upload-ready`.
- [ ] Zweryfikować paczkę lokalnie.
- [ ] Commit i push.
- [ ] Upload na nazwa.pl.
- [ ] Weryfikacja domeny.
- [ ] Ręczny smoke test na telefonie i laptopie.

## DoD

- [ ] GitHub ma aktualny commit.
- [ ] `dist/upload-ready` odpowiada repo.
- [ ] Domena odpowiada lokalnej paczce.
- [ ] PL strona -> PL demo działa.
- [ ] EN strona -> EN demo działa.
- [ ] Brak publicznych artefaktów pomocniczych.
- [ ] Security headers nadal działają.

## DoE

- [ ] Hash / commit release.
- [ ] Log uploadu.
- [ ] Log `verify-deployed-site -CompareLocalPackage`.
- [ ] Screenshot domeny PL.
- [ ] Screenshot domeny EN.
- [ ] Screenshot demo PL.
- [ ] Screenshot demo EN.

## Weryfikacja

```powershell
node --check public/app.js
node tools/validate-i18n-coverage.js
node tools/validate-demo-i18n.js
node tools/validate-demo-coherence.js
node tools/validate-glossary.js
node tools/validate-harm-gates.js
node --test tests/
powershell -ExecutionPolicy Bypass -File tools\validate-go-live.ps1
.\upload-na-nazwa.cmd
powershell -ExecutionPolicy Bypass -File tools\verify-deployed-site.ps1 -BaseUrl "https://pacjent360.com.pl" -CompareLocalPackage -LocalPublicPath "dist\upload-ready"
```

## Decyzja na koniec sprintu

- [ ] Publikujemy.
- [ ] Publikujemy tylko PL, EN zostaje za flagą.
- [ ] Stop: EN demo miesza języki albo narusza safety.

---

# Macierz Ręcznej Weryfikacji

## PL

- [ ] Strona PL -> `demo.html?start=1&lang=pl`
- [ ] Lekarz360 + Jan S.
- [ ] Lekarz360 + Andrzej K.
- [ ] Lekarz360 + Maja N.
- [ ] Pacjent360 + Jan S.
- [ ] Pacjent360 + Andrzej K.
- [ ] Pacjent360 + Maja N.
- [ ] Opiekun360 + Jan S.
- [ ] Opiekun360 + Andrzej K. = brak aktywnej zgody
- [ ] Opiekun360 + Maja N.

## EN

- [ ] Strona EN -> `demo.html?start=1&lang=en`
- [ ] Doctor cockpit + Jan S.
- [ ] Doctor cockpit + Andrzej K.
- [ ] Doctor cockpit + Maja N.
- [ ] Patient cockpit + Jan S.
- [ ] Patient cockpit + Andrzej K.
- [ ] Patient cockpit + Maja N.
- [ ] Caregiver cockpit + Jan S.
- [ ] Caregiver cockpit + Andrzej K. = no active consent
- [ ] Caregiver cockpit + Maja N.

## Responsive

- [ ] Mobile 360x740 PL/EN
- [ ] Mobile 390x844 PL/EN
- [ ] Tablet 768x1024 PL/EN
- [ ] Laptop 1366x768 PL/EN
- [ ] Desktop 1440x900 PL/EN

---

# No-Go

Nie publikujemy EN demo, jeśli:

- [ ] Strona EN prowadzi do PL demo.
- [ ] Demo EN miesza polskie etykiety w głównej ścieżce.
- [ ] Przełącznik języka resetuje pacjenta lub rolę.
- [ ] Opiekun bez zgody widzi dane.
- [ ] EN copy sugeruje diagnozę, triage, pilność albo terapię.
- [ ] AI assistants brzmią jak system decyzyjny.
- [ ] Raport brzmi jak rekomendacja kliniczna.
- [ ] Źródła przeciekają między pacjentami.
- [ ] `verify-deployed-site` nie zgadza się z `dist/upload-ready`.

---

# Kolejność Najbliższego Wykonania

1. Sprint 0: kontrakt języka.
2. Sprint 1: routing WWW -> demo.
3. Sprint 2: silnik języka w demo.
4. Sprint 3: główna ścieżka demo.
5. Sprint 4: kokpity 360.
6. Sprint 5: Historia pacjenta.
7. Sprint 6: raport, źródła, zgody.
8. Sprint 7: bramki automatyczne.
9. Sprint 8: release.

Najlepszy następny ruch: zacząć od Sprintu 1 i 2 razem jako jeden mały vertical slice: `index.html?lang=en -> demo.html?start=1&lang=en -> ekran startowy demo po angielsku`.
