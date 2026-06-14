# Pacjent360: Guard Rails dla Sprintu Demo PL/EN

Status: obowiązujący protokół wykonania goal
Dotyczy: pełny sprint Demo PL/EN
Cel: wykonać angielską ścieżkę demo bez utraty bezpieczeństwa, spójności ról, zgód i wiarygodności produktu

## Zasada nadrzędna

Nie wygrywa szybkość tłumaczenia. Wygrywa spójność doświadczenia i bezpieczeństwo klinicznego przekazu.

Jeśli EN demo jest częściowo gotowe, ale miesza języki w głównej ścieżce, nie publikujemy go jako gotowego. Lepiej opublikować mniejszy, spójny zakres niż pełny, rozjechany produkt.

## Kolejność wykonania

1. Routing i język strony.
2. Silnik języka demo.
3. Start demo: perspektywa -> pacjent.
4. Kokpity: Lekarz360, Pacjent360, Opiekun360.
5. Historia pacjenta.
6. Źródła, zgody, raport.
7. Testy i go-live.

Nie wolno przechodzić do kolejnego kroku, jeśli poprzedni nie ma dowodu.

## Twarde Stop Rules

Sprint zatrzymuje się natychmiast, jeśli:

- EN copy sugeruje diagnozę, triage, pilność, rekomendację terapii albo zmianę leczenia.
- PL copy przywraca słowo "pętla" jako nazwę mechanizmu.
- Opiekun bez zgody widzi dane pacjenta.
- Zmiana języka resetuje pacjenta, rolę, widok albo zakres zgody.
- `?lang=en` prowadzi do PL głównej ścieżki demo.
- `?lang=pl` pokazuje EN w głównej ścieżce demo.
- Źródło lub pytanie pacjenta przecieka między pacjentami.
- Testy reactivity albo caregiver scope padają.
- Trzeba zmieniać model danych tylko po to, żeby przetłumaczyć copy.

## Zakres dozwolony

Wolno:

- dodać `activeLanguage`,
- dodać helper tłumaczeń,
- dodać słownik PL/EN dla UI,
- dodać tłumaczenia warstwy prezentacyjnej,
- zmienić linki `demo.html` tak, aby miały jawny `lang`,
- dodać testy i sentinel phrases,
- dodać atrybuty `data-*` wspierające testy,
- poprawić copy, jeśli bramka safety tego wymaga.

Nie wolno:

- dodawać backendu,
- dodawać LLM runtime,
- zmieniać zakresów zgód,
- zmieniać scenariuszy klinicznych tylko po to, żeby lepiej brzmiały po EN,
- robić osobnego `demo-en.html`,
- mieszać ludzi z asystentami AI,
- zmieniać `patient360-contract.js` bez osobnego uzasadnienia,
- usuwać disclaimerów i safety copy,
- publikować EN demo bez testu PL regresji.

## Słownik Safety PL/EN

| PL | EN | Uwagi |
|---|---|---|
| Decyzja należy do lekarza | The doctor makes the clinical decision | Preferowane publicznie |
| Do oceny lekarza | For doctor review | Bez pilności |
| Pytania do rozmowy | Questions to discuss | Bez rekomendacji |
| Do potwierdzenia | To confirm | Bez alarmowania |
| Brak dostępu | No access | Dla opiekuna bez zgody |
| Zakres zgody | Consent scope | Czytelne dla opiekuna |
| Źródło | Source | Blisko twierdzenia |
| Obserwacja opiekuna | Caregiver observation | Nie fakt kliniczny |
| Nie diagnozuje | Does not diagnose | Musi zostać |
| Nie prowadzi triage | Does not triage | Musi zostać |
| Nie rekomenduje terapii | Does not recommend treatment | Musi zostać |

## Zakazane i ryzykowne słowa

### PL

- zalecamy,
- należy,
- powinien/powinna w sensie medycznym,
- pilne,
- wskazanie do,
- rozpoznanie jako output systemu,
- diagnoza jako output systemu,
- pętla jako nazwa mechanizmu.

### EN

- we recommend,
- should w sensie medycznym,
- urgent,
- emergency,
- diagnosis jako output systemu,
- treatment recommendation,
- indicated for,
- triage result,
- risk score, jeśli brzmi jak ocena kliniczna.

## Minimalne bramki po każdym etapie

```powershell
node --check public/app.js
node tools/verify-click-routes.js
node tools/verify-reactivity.js
node tools/validate-demo-coherence.js
node tools/validate-caregiver-scope.js
node tools/validate-glossary.js
powershell -ExecutionPolicy Bypass -File tools\validate-harm-gates.ps1
```

Jeśli etap dotyka strony WWW:

```powershell
node --check public/assets/story.js
node tools/validate-site-consistency.js
node tools/validate-i18n-coverage.js
powershell -ExecutionPolicy Bypass -File tools\smoke-public.ps1 -PackageDir public
```

Jeśli etap dotyka paczki publikacyjnej:

```powershell
powershell -ExecutionPolicy Bypass -File tools\validate-go-live.ps1
```

## Dowody wymagane przed publikacją

- Screenshot PL strony i PL demo start.
- Screenshot EN strony i EN demo start.
- Screenshot EN: wybór perspektywy.
- Screenshot EN: wybór pacjenta.
- Screenshot EN: Doctor / Patient / Caregiver.
- Screenshot EN: Patient history.
- Screenshot EN: No access dla caregiver bez zgody.
- Log `verify-click-routes`.
- Log `verify-reactivity`.
- Log `validate-caregiver-scope`.
- Log `validate-harm-gates`.
- Log `verify-deployed-site` po uploadzie.

## Commity

Każdy etap ma mieć osobny commit:

1. `feat(demo-i18n): add demo language engine`
2. `feat(demo-i18n): translate guided start path`
3. `feat(demo-i18n): translate role cockpits`
4. `feat(demo-i18n): translate patient history view`
5. `feat(demo-i18n): translate sources reports and consent`
6. `test(demo-i18n): add PL EN regression gates`

Nie robić jednego ogromnego commita.

## Kryterium "publikuj"

Publikujemy, jeśli:

- PL nadal działa.
- EN działa w głównej ścieżce.
- EN strona prowadzi do EN demo.
- Opiekun bez zgody nie widzi danych.
- Lekarz widzi pełny kontekst.
- Pacjent widzi prosty język.
- Historia pacjenta jest zrozumiała.
- Raport nie brzmi jak diagnoza.
- Go-live package przechodzi.

## Kryterium "nie publikuj"

Nie publikujemy, jeśli:

- EN wygląda jak tłumaczenie w połowie.
- UI miesza PL/EN w pierwszych 60 sekundach.
- Angielskie copy brzmi jak system kliniczny.
- Użytkownik po EN trafia w polskie dane bez wyjaśnienia.
- Testy są zielone tylko dlatego, że osłabiono asercje.

## Następny bezpieczny krok

Wykonać najpierw pionowy slice:

`index.html?lang=en -> demo.html?start=1&lang=en -> English start -> perspective -> patient -> Doctor cockpit shell`

Dopiero po tym rozszerzać zakres na pozostałe kokpity i Historię pacjenta.
