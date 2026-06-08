# Go-Live Checklist

Ten dokument jest ostatnią bramką przed publikacją `pacjent360.com.pl`. Ma pomóc szybko odróżnić rzeczy gotowe od ryzyk, które powinny zatrzymać publikację.

## Aktualny status — 2026-06-08

Paczka techniczna `dist/public` po M0 przechodzi lokalny build, verifier i smoke w przeglądarce. Katalog `dist/upload-ready`, czyli faktyczny katalog do uploadu, przechodzi dodatkowy HTTP smoke w pełnej bramce. To oznacza, że artefakt strony jest gotowy do dalszego review.

Publiczne repo oraz produkcyjny go-live domeny pozostają **NO-GO**, dopóki aliasy `security@pacjent360.com.pl` i `kontakt@pacjent360.com.pl` nie zostaną skonfigurowane, przetestowane i opisane jako działające.

Ostatni lokalny release candidate po audycie council:

- `dist/pacjent360-public.zip` - paczka hostingowa; aktualny SHA256 sprawdzaj w `dist/release-manifest.json` albo `dist/pacjent360-public.zip.sha256`.
- `dist/pacjent360-upload-root.zip` - alias ZIP do rozpakowania bezposrednio w document root; aktualny SHA256 sprawdzaj w `dist/release-manifest.json` albo `dist/pacjent360-upload-root.zip.sha256`.
- `dist/upload-ready` - katalog do wgrania na hosting; generowany z `dist/pacjent360-public.zip`.
- `dist/pacjent360-public-repo.zip` - paczka public repo; aktualny SHA256 sprawdzaj w `dist/release-manifest.json` albo `dist/pacjent360-public-repo.zip.sha256`.
- `health.txt` - publiczny plik kontrolny; po uploadzie `https://pacjent360.com.pl/health.txt` ma zwracac 200 i `project=pacjent360`.
- `dist/document-root-checklist.txt` - krotka lista kontrolna 19 plikow, ktore maja lezec bezposrednio w document root po uploadzie.
- ZIP-y, pliki `.sha256`, manifesty, checklisty i raporty z `dist/` sa artefaktami pomocniczymi; po rozpakowaniu nie moga zostac publicznie w document root.
- `tools\validate-go-live.ps1` - pass lokalnie; dokładny czas i hashe są w `dist/release-manifest.json`.
- `tools\verify-contact-gate.ps1 -DnsOnly` - pass; znaleziono MX, ale to nadal nie potwierdza odbioru aliasów.
- `tools\verify-deployed-site.ps1 -BaseUrl "https://pacjent360.com.pl"` - NO-GO przed uploadem: domena zwraca `404` dla `index.html`.

## Go / No-Go

| Obszar | Kryterium Go | Status |
| --- | --- | --- |
| Prywatność | Na hosting trafia wyłącznie czysta paczka publiczna, bez `1.txt`, `linkedin-story.md`, `.git/`, `.env` i dokumentów roboczych | ✅ OK lokalnie — `tools/verify-public.ps1` pass (2026-06-08) |
| Granice kliniczne | Strona i demo nie sugerują diagnozy, triage, pilności, terapii ani decyzji klinicznej | ✅ OK lokalnie — neutralne DITL, raport kontekstowy, brak starych fraz w `dist/public` (2026-06-08) |
| Niezależność | Widać komunikat, że projekt nie jest usługą CeZ, NFZ, IKP ani e-Profilem Pacjenta | ✅ OK lokalnie — `index.html` i `demo.html` (2026-06-08) |
| Prawo i zaufanie | Działają `disclaimer.html` i `privacy.html` | ✅ OK lokalnie — link check i browser smoke (2026-06-08) |
| Kontakt bezpieczeństwa | Przed publicznym repo i produkcyjnym go-live działają oraz są monitorowane aliasy `security@pacjent360.com.pl` i `kontakt@pacjent360.com.pl` | ⛔ NO-GO — DNS/MX precheck OK, nadal brakuje ręcznego testu odbioru, odpowiedzi i monitoringu |
| Domena produkcyjna | `https://pacjent360.com.pl/index.html` zwraca 200 i przechodzi verifier domeny | ⛔ NO-GO — automatyczny verifier zwraca 404 przed uploadem paczki |
| Supply chain | Zewnętrzny CDN jest jawny w privacy, Lucide ma pinned version i SRI, brak `lucide@latest` | ✅ OK — `unpkg.com/lucide@0.468.0` + SRI w `index.html` i `demo.html` |
| Nagłówki i przekierowania hostingu | Hosting wysyła CSP z `frame-ancestors 'none'`, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` oraz przekierowuje HTTP/`www` do kanonicznego HTTPS | ⏳ gotowe w `.htaccess`; potwierdzić po uploadzie przez `tools\verify-deployed-site.ps1` i `tools\domain-diagnostics.js` |
| Artefakty pomocnicze | Po uploadzie publicznie dostepne sa tylko pliki strony; ZIP-y, `.sha256`, manifesty, checklisty, handoff i raporty statusu/diagnostyki zwracaja 403 albo 404 | ⏳ gotowe w verifierze domeny; potwierdzic po uploadzie |
| Dokumentacja publiczna | README zawiera status alpha, Quick start i Clinical Safety Checklist zgodną z `CONTRIBUTING.md` | ✅ OK — uzupełnione dla `v0.2.0-alpha` |
| Demo | Działa `demo.html`, raport kontekstowy i sekcje `Known / Unknown / Uncertain / To verify` | ✅ OK lokalnie — widoki Lekarz, Pacjent, Sygnały, Wyniki, Raporty mają watermark i neutralne copy (2026-06-08) |
| LLM / asystenci operacyjni | Runtime LLM nie jest publikowany; `SSOT.md`, `SPRINTS.md` i `ROADMAP.md` definiują tylko bezpieczny backlog dry-run/preview/review | ✅ OK jako dokumentacja roadmapy — funkcje LLM pozostają NO-GO do Sprint A0/A1 i review safety/privacy/security |
| Rollback | Działa `maintenance.html`, a procedura z `ROLLBACK.md` jest jasna | ✅ OK lokalnie — plik w `dist/public`, `ROLLBACK.md` opisuje 5-krokową procedurę (2026-06-08) |
| Repo | Publiczny GitHub dopiero po Sprint 0.5 repo setup i kontroli prywatnych plików; Sprint A0 dotyczy osobno kontraktów LLM | ⏳ czeka na Sprint 0.5 |

## Minimalny Smoke Test

Szczegółowy upload na nazwa.pl: `DEPLOYMENT_RUNBOOK_NAZWA.md`.

Preferowana lokalna bramka:

```powershell
powershell -ExecutionPolicy Bypass -File tools\validate-go-live.ps1
```

Lekki status bez pełnego rebuildu:

```powershell
node tools\release-readiness.js
```

Raport do zapisania jako dowód statusu:

```powershell
node tools\release-readiness.js -ReportPath "dist/go-live-status.txt"
```

Po ręcznym potwierdzeniu aliasów można dopisać:

```powershell
node tools\release-readiness.js -ReceiptConfirmed -MonitorOwner "..."
```

Przed sama rozmowa z reviewerem mozna uruchomic read-only gate bez budowania paczek:

```powershell
powershell -ExecutionPolicy Bypass -File tools\validate-pre-show.ps1
```

Poniższe kroki są rozbiciem tej samej bramki na pojedyncze komendy.

1. Uruchom `node --check patient360-contract.js`.
2. Uruchom `node --check patient360-map-model.js`.
3. Uruchom `node --check patient360-previsit-model.js`.
4. Uruchom `node --check patient360-caregiver-model.js`.
5. Uruchom `node --check patient360-consent-model.js`.
6. Uruchom `node --check app.js`.
7. Uruchom `powershell -ExecutionPolicy Bypass -File tools\validate-data-contract.ps1`.
8. Uruchom `powershell -ExecutionPolicy Bypass -File tools\validate-map-model.ps1`.
9. Uruchom `powershell -ExecutionPolicy Bypass -File tools\validate-previsit-workflow.ps1`.
10. Uruchom `powershell -ExecutionPolicy Bypass -File tools\validate-caregiver-scope.ps1`.
11. Uruchom `powershell -ExecutionPolicy Bypass -File tools\validate-consent-draft.ps1`.
12. Uruchom `powershell -ExecutionPolicy Bypass -File tools\validate-a11y.ps1`.
13. Uruchom `powershell -ExecutionPolicy Bypass -File tools\validate-validation-pack.ps1`.
14. Uruchom `powershell -ExecutionPolicy Bypass -File tools\prepare-public.ps1 -Zip`.
15. Uruchom `powershell -ExecutionPolicy Bypass -File tools\verify-public.ps1`.
16. Uruchom `powershell -ExecutionPolicy Bypass -File tools\smoke-public.ps1`.
17. Po zmianach UI uruchom `powershell -ExecutionPolicy Bypass -File tools\smoke-browser.ps1`.
18. Przed publicznym repo uruchom `powershell -ExecutionPolicy Bypass -File tools\prepare-public-repo.ps1 -Zip`.
19. Przed publicznym repo uruchom `powershell -ExecutionPolicy Bypass -File tools\verify-public-repo.ps1`.
20. Po zapisaniu manifestu uruchom `powershell -ExecutionPolicy Bypass -File tools\verify-release-artifacts.ps1`.
21. Przygotuj katalog uploadu: `powershell -ExecutionPolicy Bypass -File tools\prepare-hosting-upload.ps1`.
22. Uruchom HTTP smoke katalogu uploadu: `powershell -ExecutionPolicy Bypass -File tools\smoke-public.ps1 -PackageDir "dist/upload-ready" -Port 4194`.
23. Uruchom lokalny post-deploy compare: `powershell -ExecutionPolicy Bypass -File tools\smoke-deployed-compare.ps1 -PackageDir "dist/upload-ready" -Port 4196`.
24. Wygeneruj manifest plików uploadu, checklistę document root i handoff: `powershell -ExecutionPolicy Bypass -File tools\write-upload-manifest.ps1`.
25. Uruchom status publikacji: `node tools\release-readiness.js`.
26. Opcjonalnie uruchom lokalny serwer z paczki: `python -m http.server 4173 --bind 127.0.0.1 --directory dist/upload-ready`.
27. Otwórz `http://127.0.0.1:4173/index.html`.
28. Przejdź do `demo.html`, `disclaimer.html`, `privacy.html` i `maintenance.html`.
29. Otwórz `health.txt` i potwierdź `project=pacjent360`.
30. W demo sprawdź widoki: `Lekarz`, `Pacjent`, `Opiekun`, `Mapa`, `Sygnały`, `Wyniki`, `Raporty`, `Zgody`, `Audyt`.
31. Po konfiguracji poczty uruchom `powershell -ExecutionPolicy Bypass -File tools\verify-contact-gate.ps1 -DnsOnly`.
32. Po ręcznym teście wysyłka-odbiór-odpowiedź dla obu aliasów uruchom `powershell -ExecutionPolicy Bypass -File tools\verify-contact-gate.ps1 -ReceiptConfirmed -MonitorOwner "..."`.
33. Po publikacji uruchom `powershell -ExecutionPolicy Bypass -File tools\verify-deployed-site.ps1 -BaseUrl "https://pacjent360.com.pl"`.
34. Po pierwszym sukcesie uruchom `powershell -ExecutionPolicy Bypass -File tools\verify-deployed-site.ps1 -BaseUrl "https://pacjent360.com.pl" -CompareLocalPackage -LocalPublicPath "dist/upload-ready"`.
35. Jeśli verifier domeny nadal zwraca 404 albo `www` zachowuje się inaczej, uruchom `node tools\domain-diagnostics.js -ReportPath "dist/domain-diagnostics.txt"`.
36. Potwierdź, że verifier domeny nie zgłasza publicznie dostepnych ZIP-ow, `.sha256`, manifestow, handoffu ani raportow statusu/diagnostyki.
37. Potwierdź, że verifier domeny nie zgłasza brakujących nagłówków `.htaccess`, a diagnostyka nie zgłasza braku przekierowania HTTP -> HTTPS.
38. Po publikacji powtórz ręczny test na `https://pacjent360.com.pl`.

## Release Candidate Log - 2026-06-08 council validation pack

1. `node --check tools\validate-validation-pack.js` - pass.
2. `powershell -ExecutionPolicy Bypass -File tools\validate-validation-pack.ps1` - pass.
3. `powershell -ExecutionPolicy Bypass -File tools\validate-pre-show.ps1` - pass; read-only gate obejmuje node checks, Data Contract, Map Model, Pre-Visit, Caregiver, Consent, A11y, Validation Pack i browser smoke na working tree.
4. `powershell -ExecutionPolicy Bypass -File tools\validate-go-live.ps1` - pass; odświeżone `dist/public`, `dist/repo`, ZIP-y, `.sha256`, `dist/release-manifest.json`, `dist/upload-ready`, HTTP smoke katalogu uploadu, lokalny post-deploy compare, `dist/upload-ready-manifest.json`, `dist/deployment-handoff.txt` oraz `dist/go-live-status.txt`.
5. Manifest no-BOM - pass; pierwsze bajty `dist/release-manifest.json`: `123,13,10,32`.
6. Contact DNS precheck - pass; `tools\verify-contact-gate.ps1 -DnsOnly` znalazł MX dla `pacjent360.com.pl`.
7. Deployed-domain verifier - NO-GO przed uploadem; `tools\verify-deployed-site.ps1 -BaseUrl "https://pacjent360.com.pl"` zwrócił 404 dla `index.html`.
8. Local deployed compare smoke - pass; `tools\verify-deployed-site.ps1 -BaseUrl "http://127.0.0.1:4192" -AllowHttp -CompareLocalPackage` potwierdził zgodność lokalnego serwera z `dist/public`.
9. Release artifact verifier - pass; `tools\verify-release-artifacts.ps1` potwierdza ZIP-y, `.sha256`, manifest, wymagane pliki, brak prywatnych materiałów i rozpakowany hosting ZIP jako symulację uploadu.
10. Upload-ready HTTP smoke - pass w pełnym gate; `tools\smoke-public.ps1 -PackageDir "dist/upload-ready" -Port 4194` sprawdza katalog, który ma trafić na hosting.
11. Local deployed compare upload-ready - pass w pełnym gate; `tools\smoke-deployed-compare.ps1 -PackageDir "dist/upload-ready" -Port 4196` sprawdza lokalnie ścieżkę `verify-deployed-site.ps1 -CompareLocalPackage`.
12. Upload file manifest - pass w pełnym gate; `dist/upload-ready-manifest.json` zawiera rozmiar i SHA256 każdego pliku z `dist/upload-ready`.
13. Deployment handoff - pass w pełnym gate; `dist/deployment-handoff.txt` zawiera hashe, listę plików `dist/upload-ready`, SHA manifestu plików i komendy po uploadzie.
14. Release readiness report - pass w pełnym gate; `dist/go-live-status.txt` zapisuje aktualne `GO/NO-GO`, w tym checklistę document root, zewnętrzne blokery: upload domeny, ręczny test aliasów i osobny status ekspozycji artefaktów pomocniczych.

## Smoke Test Log — 2026-06-08 M3 Patient Map Core

1. `node --check patient360-contract.js` — ✅ pass.
2. `node --check patient360-map-model.js` — ✅ pass.
3. `node --check app.js` — ✅ pass.
4. `node --check tools\validate-map-model.js` — ✅ pass.
5. `powershell -ExecutionPolicy Bypass -File tools\validate-data-contract.ps1` — ✅ pass, `p1` i `p2`.
6. `powershell -ExecutionPolicy Bypass -File tools\validate-map-model.ps1` — ✅ pass: snapshot M3, edge cases, `p1` 6 display events / 6 clinical events, `p2` 3 display events / 3 clinical events.
7. `powershell -ExecutionPolicy Bypass -File tools\prepare-public.ps1 -Zip` — ✅ utworzone `dist/public` i `dist/pacjent360-public.zip`.
8. `powershell -ExecutionPolicy Bypass -File tools\verify-public.ps1` — ✅ pass; `patient360-map-model.js` jest w paczce i ładuje się między `patient360-contract.js` a `app.js`.
9. Browser smoke `http://127.0.0.1:4187/demo.html` — ✅ `Mapa`: 6 zdarzeń, widok `Od urodzenia`: 8 zdarzeń i 2 kotwice, filtr `badania`: 1 zdarzenie i 0 kotwic, inspektor pokazuje źródła/pytania DITL/relacje z modelu, brak błędów konsoli.
10. Relation smoke — ✅ zdarzenie `te4` pokazuje powiązanie źródłowe bez wnioskowania przyczynowego.
11. Mobile smoke 360x740 — ✅ brak poziomego overflow na `body`; przewijanie poziome jest w `.temporal-scroll`.

## Smoke Test Log — 2026-06-08 M4 Pre-Visit Workflow vertical slice

1. `node --check patient360-contract.js` — ✅ pass.
2. `node --check patient360-map-model.js` — ✅ pass.
3. `node --check patient360-previsit-model.js` — ✅ pass.
4. `node --check app.js` — ✅ pass.
5. `node --check tools\validate-data-contract.js` — ✅ pass.
6. `node --check tools\validate-map-model.js` — ✅ pass.
7. `node --check tools\validate-previsit-workflow.js` — ✅ pass.
8. `powershell -ExecutionPolicy Bypass -File tools\validate-data-contract.ps1` — ✅ pass.
9. `powershell -ExecutionPolicy Bypass -File tools\validate-map-model.ps1` — ✅ pass.
10. `powershell -ExecutionPolicy Bypass -File tools\validate-previsit-workflow.ps1` — ✅ pass: demo `p1/p2`, `previsit-empty` i `previsit-ready`.
11. `powershell -ExecutionPolicy Bypass -File tools\prepare-public.ps1 -Zip` — ✅ utworzone `dist/public` i `dist/pacjent360-public.zip`.
12. `powershell -ExecutionPolicy Bypass -File tools\verify-public.ps1` — ✅ pass.
13. Browser smoke `http://127.0.0.1:4188/demo.html?v=m4-dialog-fix` — ✅ kokpit pacjenta ma flow `Przygotowanie krok po kroku`, 6 kroków, checklist summary `3 gotowe / 2 do potwierdzenia / 1 brak danych`, dialog dokumentu otwiera się i zamyka, raport preview otwiera widok raportów, brak błędów konsoli.
14. Mobile smoke 360x740 — ✅ brak poziomego overflow na `body`; flow ma jedną kolumnę.

## Smoke Test Log — 2026-06-08 M0 po review

1. `powershell -ExecutionPolicy Bypass -File tools\prepare-public.ps1 -Zip` — ✅ utworzone `dist/public` i `dist/pacjent360-public.zip`.
2. `powershell -ExecutionPolicy Bypass -File tools\verify-public.ps1` — ✅ pass.
3. `powershell -ExecutionPolicy Bypass -File tools\validate-data-contract.ps1` — ✅ pass, `p1` i `p2`.
4. `node --check patient360-contract.js` — ✅ pass.
5. `node --check app.js` — ✅ pass.
6. `node --check dist/public/patient360-contract.js` i `node --check dist/public/app.js` — ✅ pass przez verifier.
7. Browser smoke `http://127.0.0.1:4182` — ✅ `index.html`, `demo.html` i widoki demo: Lekarz, Pacjent, Mapa, Sygnały, Wyniki, Raporty, Leki, Wywiad, Dokumenty, Zgody, Audyt.
8. Konsola przeglądarki — ✅ brak błędów `error`.
9. Sanitizer localStorage — ✅ stare nazewnictwo raportu usuwane także ze starego lokalnego audytu demo.
10. Council subagentów — ✅ brak P0 w `dist/public`; P1 poprawione: stare nazewnictwo raportu, etykieta Hb, blocklista, sitemap.

## Historyczny Smoke Test Log — 2026-06-07 po audycie council

1. `node --check app.js` — ✅ pass.
2. `node --check dist/public/app.js` — ✅ pass.
3. `tools/prepare-public.ps1 -Zip` — ✅ utworzone `dist/public` i `dist/pacjent360-public.zip`.
4. Skan `dist/public` — ✅ 12 plików publicznych, brak `1.txt`, `linkedin-story.md`, `.env`, `.git`, `.claude`.
5. Skan starych fraz w `dist/public` — ✅ brak: `Risk / Flag Radar`, `Red flag`, `Amber flag`, `Green flag`, `Blue flag`, `Główne ryzyka`, `Decyzja dziś`, `Dzisiejsza decyzja`, `Jakość kontekstu`, `Generuj wersję`, `Evidence-first`, `public-system friendly`, `NFZ one-pager`, `HITL`, `poza normą`, `w normie`, `pilnej oceny`, `Clinical Decision Context`, `Patient Story`, `Decision Context`.
6. Serwer `http://127.0.0.1:4176` z `dist/public`:
   - `index.html` — ✅ tytuł „Kontekst wizyty i pytań”, neutralne „Sygnały i pytania DITL”, independence-band.
   - `demo.html` Lekarz — ✅ watermark fikcyjnych danych, neutralny pasek sygnału DITL, źródła demo.
   - `demo.html` Pacjent — ✅ watermark, język pacjencki, brak starych fraz.
   - `demo.html` Sygnały — ✅ „Mapa pytań i sygnałów DITL”, brak `red flag`.
   - `demo.html` Wyniki — ✅ „zakresy podane przez źródła”, brak interpretacji klinicznej.
   - `demo.html` Raporty — ✅ badge „FIKCYJNA SOCZEWKA DEMO / DANE PACJENTA DEMO”, Known / Unknown / Uncertain / To verify.
   - `privacy.html` — ✅ `localStorage`, klucz `pacjent360-state-v6`, CDN `unpkg.com/lucide@0.468.0`, pinned version i SRI.
7. Browser DOM smoke — ✅ brak błędów konsoli, watermark obecny w testowanych widokach.
8. Printy/screenshoty — ✅ zapisane w `prints/`: desktop `index`, `Lekarz`, `Pacjent`, `Sygnały`, `Wyniki`, `Raporty`, `Privacy`; mobile `index`, `Lekarz`.

## Smoke Test Log - 2026-06-08 M4 Pre-Visit Workflow hardening

1. `node --check app.js` - pass.
2. `node --check patient360-contract.js` - pass.
3. `node --check patient360-map-model.js` - pass.
4. `node --check patient360-previsit-model.js` - pass.
5. `powershell -ExecutionPolicy Bypass -File tools\validate-map-model.ps1` - pass.
6. `powershell -ExecutionPolicy Bypass -File tools\validate-previsit-workflow.ps1` - pass: demo `p1/p2`, `previsit-empty`, `previsit-ready`, safety copy.
7. `powershell -ExecutionPolicy Bypass -File tools\prepare-public.ps1 -Zip` - pass; utworzone `dist/public` i `dist/pacjent360-public.zip`.
8. `powershell -ExecutionPolicy Bypass -File tools\verify-public.ps1` - pass; `patient360-previsit-model.js` jest w paczce i laduje sie przed `app.js`.
9. Browser smoke `http://127.0.0.1:4189/demo.html` - pass: kokpit pacjenta, 6 krokow flow, dialog dokumentu open/close, raport kontekstowy, brak bledow/warningow konsoli.
10. Mobile smoke 360x740 - pass: brak poziomego overflow, flow w jednej kolumnie.

## Smoke Test Log - 2026-06-08 Publication HTTP smoke

1. `powershell -ExecutionPolicy Bypass -File tools\prepare-public.ps1 -Zip` - pass.
2. `powershell -ExecutionPolicy Bypass -File tools\verify-public.ps1` - pass.
3. `powershell -ExecutionPolicy Bypass -File tools\smoke-public.ps1` - pass: `http://127.0.0.1:4190 -> dist/public`.
4. `node --check app.js`, `patient360-contract.js`, `patient360-map-model.js`, `patient360-previsit-model.js` - pass.
5. `powershell -ExecutionPolicy Bypass -File tools\validate-data-contract.ps1` - pass.
6. `powershell -ExecutionPolicy Bypass -File tools\validate-map-model.ps1` - pass.
7. `powershell -ExecutionPolicy Bypass -File tools\validate-previsit-workflow.ps1` - pass.

## Smoke Test Log - 2026-06-08 Browser smoke

1. `node --check tools\smoke-browser.js` - pass.
2. `powershell -ExecutionPolicy Bypass -File tools\prepare-public.ps1 -Zip` - pass.
3. `powershell -ExecutionPolicy Bypass -File tools\verify-public.ps1` - pass.
4. `powershell -ExecutionPolicy Bypass -File tools\smoke-public.ps1` - pass.
5. `powershell -ExecutionPolicy Bypass -File tools\smoke-browser.ps1` - pass: headless Chrome, kokpit pacjenta, 6 krokow pre-visit, dialog dokumentu open/close, raport kontekstowy, mobile 360x740 bez poziomego overflow.
6. Poprawki po smoke: `frame-ancestors` usuniete z meta CSP, bo musi byc naglowkiem HTTP; `demo.html` ma favicon i nie generuje 404.

## Smoke Test Log - 2026-06-08 Public repo package

1. `powershell -ExecutionPolicy Bypass -File tools\prepare-public-repo.ps1 -Zip` - pass.
2. `powershell -ExecutionPolicy Bypass -File tools\verify-public-repo.ps1` - pass.
3. Utworzono `dist/repo` i `dist/pacjent360-public-repo.zip`.
4. Repo package korzysta z `tools/public-repo-manifest.txt`, zawiera `.github/` issue templates i blokuje `CLAUDE.md`, `CODEX_*`, `HANDOVER.md`, `prints/`, `dist/`, `.env`, `.git/`, `.claude/`, `1.txt`, `linkedin-story.md`.
5. Pelna sekwencja po dodaniu repo package - pass: `validate-data-contract`, `validate-map-model`, `validate-previsit-workflow`, `prepare-public`, `verify-public`, `smoke-public`, `smoke-browser`.

## Smoke Test Log - 2026-06-08 M7 Caregiver Scope

1. `node --check patient360-caregiver-model.js` - pass.
2. `node --check tools\validate-caregiver-scope.js` - pass.
3. `powershell -ExecutionPolicy Bypass -File tools\validate-caregiver-scope.ps1` - pass: `p1` ma 2 aktywne zakresy, 1 cofnięty zakres, 4 zadania; fixture `caregiver-active` ma aktywnego opiekuna lekowego; fixture `caregiver-none` nie pokazuje zadań bez aktywnej zgody.
4. `powershell -ExecutionPolicy Bypass -File tools\prepare-public.ps1 -Zip` - pass.
5. `powershell -ExecutionPolicy Bypass -File tools\verify-public.ps1` - pass; paczka zawiera `patient360-caregiver-model.js`.
6. `powershell -ExecutionPolicy Bypass -File tools\smoke-public.ps1` - pass.
7. `powershell -ExecutionPolicy Bypass -File tools\smoke-browser.ps1` - pass: headless Chrome klika `Opiekun`, sprawdza scope, access cards, zadania i cofnięcie zgody.
8. `powershell -ExecutionPolicy Bypass -File tools\prepare-public-repo.ps1 -Zip` i `tools\verify-public-repo.ps1` - pass; manifest zawiera model, fixture i walidator M7.
9. Consent management hardening - pass: `Zgody` pokazują macierz co widzi/czego nie widzi opiekun, denied state `nie`, safety copy, skutki cofnięcia zgody i brak jednoklikowego przywracania dostępu.
10. Consent revoke confirmation - pass: cofnięcie aktywnej zgody wymaga modala z odbiorcą, rolą, zakresem, skutkiem organizacyjnym, anulowaniem bez zmiany i audytem po potwierdzeniu.
11. Consent area controls - pass: formularz `Dodaj zgodę` używa checkboxów obszarów, nie ma wolnego tekstu `areas`, nie ma domyślnych zaznaczeń, blokuje zapis bez obszaru i zapisuje tylko wybrane klucze `areas[]`.
12. Consent recipient type - pass: formularz rozróżnia `Opiekun lub osoba wspierająca` oraz `Pacjent`; ścieżka pacjenta zapisuje `role: pacjent`, stabilny `caregiverId: patient-self-{patientId}` i wybrane obszary bez ręcznego wpisywania odbiorcy.
13. Consent create preview - pass: zapis nowej zgody jest dwuetapowy; formularz tworzy preview odbiorcy, roli, pacjenta, daty i obszarów, a dopiero `Dodaj dostęp` zapisuje zgodę i audyt.
14. Consent preview edit loop - pass: preview dodawania zgody ma akcję `Wróć do edycji`, która otwiera wypełniony formularz bez zapisu zgody.
15. Consent draft model - pass: reguły szkicu zgody są w `patient360-consent-model.js`, a `tools\validate-consent-draft.ps1` sprawdza checkboxy jako SSOT, pacjenta, opiekuna, brak zakresu, brak odbiorcy i nieznany obszar.
16. Consent sourceRefs - pass: domyślne zgody demo mają jawne `sourceRefs`; Data Contract pokazuje `0 source_missing` dla `p1` i `p2`.
17. Consent source type - pass: Data Contract ma formalny typ źródła `consent`, zgody demo i nowe szkice zgód zawierają `consent:{id}`, widok `Zgody` renderuje klikalne chipy zgód, `tools\smoke-browser.ps1` sprawdza `consent:g1` i evidence card, a kontekst udostępnienia pozostaje w dodatkowych `sourceRefs`.
18. Full go-live runner - pass: `powershell -ExecutionPolicy Bypass -File tools\validate-go-live.ps1` uruchamia pełną lokalną bramkę: node checks, PowerShell syntax parse, JSON parse, walidatory, build `dist/public`, verify, HTTP smoke, browser smoke, build `dist/repo`, verify repo i `git diff --check`.
19. Contact gate tool - DNS-only pass / manual NO-GO: `tools\verify-contact-gate.ps1 -DnsOnly` znalazł MX dla `pacjent360.com.pl`; pełny gate nadal wymaga ręcznego potwierdzenia wysyłka-odbiór-odpowiedź dla `security@pacjent360.com.pl` oraz `kontakt@pacjent360.com.pl`.
20. Post-deploy verifier - ready: `tools\verify-deployed-site.ps1` sprawdza opublikowaną domenę, kluczowe strony, asset hero, markery safety, brak ryzykownych fraz i brak publicznego dostępu do prywatnych plików.
21. Release manifest - ready: `tools\validate-go-live.ps1` tworzy `dist/release-manifest.json` oraz `.sha256` dla `dist/pacjent360-public.zip` i `dist/pacjent360-public-repo.zip`.

## P0 No-Go Triggers z audytu

Publikację domeny albo otwarcie publicznego repo trzeba zatrzymać, jeśli wystąpi którekolwiek z P0:

- README nie pokazuje statusu **alpha / v0.2.0-alpha**, Quick start albo Clinical Safety Checklist zgodnej z `CONTRIBUTING.md`.
- W `SECURITY.md` lub README nadal brakuje jawnego modelu kontaktu albo nie ma informacji **DO UZUPEŁNIENIA PRZED PUBLICZNYM REPO** przy nieskonfigurowanej skrzynce.
- Aliasy `security@pacjent360.com.pl` i `kontakt@pacjent360.com.pl` nie są skonfigurowane, przetestowane i monitorowane przed publicznym repo.
- `PRIVACY.md` albo `privacy.html` nie ujawnia `localStorage` oraz zewnętrznego CDN `unpkg.com/lucide@0.468.0` z pinned version i SRI.
- Lucide zostaje zmienione na `lucide@latest`, CDN traci SRI albo pojawia się nowy zewnętrzny zasób bez review supply chain.
- Demo albo strona brzmią jak diagnoza, triage, rekomendacja terapeutyczna, ocena pilności albo decyzja kliniczna.
- Strona może wyglądać jak oficjalna usługa CeZ, NFZ, IKP, P1 albo e-Profil Pacjenta.
- Funkcja LLM/asystenta działa publicznie bez `SSOT.md`, bez Sprint A0 Safety & Contracts, bez walidatora DITL albo bez review privacy/security/clinical safety.
- Output LLM/asystenta trafia do raportu, localStorage, eksportu albo UI bez trybu dry-run, preview, źródła i ręcznej akceptacji.
- Jakikolwiek prompt, fixture, dry-run albo eksport LLM zawiera realne dane pacjenta lub dane możliwe do identyfikacji.
- W paczce publikacyjnej lub publicznym repo są prywatne pliki, historia `.git/`, `.env`, realne dane pacjentów albo materiały robocze przeznaczone poza publikacją.

## Pozostałe No-Go Triggers

Publikację trzeba zatrzymać, jeśli:

- demo brzmi jak diagnoza, triage albo rekomendacja terapeutyczna,
- strona może wyglądać jak oficjalna usługa CeZ, NFZ, IKP lub e-Profil Pacjenta,
- w paczce publikacyjnej są prywatne pliki albo historia repo,
- nie działa disclaimer, privacy albo demo,
- ktoś z reviewerów zgłasza poważne ryzyko komunikacyjne lub prawne.
