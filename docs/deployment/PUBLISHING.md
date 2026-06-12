# Publikacja pacjent360.com.pl

## Pliki do publikacji

Nie wrzucaj na hosting całego folderu projektu. Przygotuj czysty katalog publikacyjny i skopiuj wyłącznie pliki strony:

Pełną lokalną bramkę przed publikacją uruchom jedną komendą:

```powershell
.\tools\validate-go-live.ps1
```

Ten skrypt odpala walidatory danych, buduje paczki `dist/public` i `dist/repo`, uruchamia verify, HTTP smoke, browser smoke, zapisuje manifest release, sprawdza ZIP-y release, przygotowuje `dist/upload-ready`, smoke-testuje katalog uploadu, uruchamia lokalny post-deploy compare, zapisuje `dist/upload-ready-manifest.json`, zapisuje `dist/deployment-handoff.txt`, zapisuje `dist/go-live-status.txt` przez `tools/release-readiness.js` oraz wykonuje check whitespace. Jeśli na maszynie nie ma Chrome/Edge, użyj `-SkipBrowser` tylko z jawną adnotacją w handoverze.

Lekki status bez pełnego rebuildu:

```powershell
node tools\release-readiness.js
```

Ten skrypt pokazuje, co jest gotowe lokalnie i co nadal blokuje go-live: manifest release, manifest plików uploadu, `dist/upload-ready`, deployment handoff, upload domeny, verifier domeny, ekspozycję artefaktów pomocniczych oraz ręczne potwierdzenie aliasów kontaktowych.

Jeśli chcesz zachować dowód statusu do handoveru albo rozmowy z reviewerem, dopisz:

```powershell
node tools\release-readiness.js -ReportPath "dist/go-live-status.txt"
```

Po przejściu bramki powstaje też `dist/release-manifest.json` oraz pliki `.sha256` dla paczek ZIP. Przed uploadem sprawdź, że publikujesz aktualny artefakt:

- `dist/pacjent360-public.zip` - paczka hostingowa,
- `dist/pacjent360-upload-root.zip` - ten sam upload w nazwie przyjaznej operatorowi; rozpakuj bezposrednio w document root, jesli panel hostingu wspiera ZIP extract,
- `dist/upload-ready` - katalog rozpakowany z hosting ZIP-a, gotowy do wgrania na hosting,
- `dist/pacjent360-public-repo.zip` - paczka publicznego repo,
- `dist/release-manifest.json` - rozmiary, SHA256 i zewnętrzne bramki release,
- `dist/upload-ready-manifest.json` - rozmiar i SHA256 każdego pliku z `dist/upload-ready`,
- `dist/deployment-handoff.txt` - krótka instrukcja uploadu z hashami, lista plików i komendami po publikacji,
- `dist/document-root-checklist.txt` - najprostsza lista kontrolna: co ma lezec bezposrednio w document root po uploadzie.

Na hosting trafia zawartosc `dist/upload-ready`. ZIP-y, pliki `.sha256`, `release-manifest.json`, `upload-ready-manifest.json`, `deployment-handoff.txt`, `go-live-status.txt`, `domain-diagnostics.txt` i `document-root-checklist.txt` sa artefaktami pomocniczymi. Jesli uzywasz opcji rozpakowania ZIP-a w panelu hostingu, usun ZIP i nie zostawiaj manifestow ani raportow w publicznym document root.

Artefakty ZIP są dodatkowo sprawdzane przez:

```powershell
.\tools\verify-release-artifacts.ps1
```

Ten verifier potwierdza, że ZIP-y zgadzają się z `dist/public` i `dist/repo`, zawierają wymagane pliki, nie zawierają prywatnych materiałów, a `.sha256` i `dist/release-manifest.json` pasują do bieżących plików. Dodatkowo rozpakowuje hosting ZIP do tymczasowego katalogu w `dist` i uruchamia na nim `tools\verify-public.ps1`.

Aktualny lokalny release candidate po audycie council:

- hosting: `dist/pacjent360-public.zip`; aktualny SHA256 jest w `dist/release-manifest.json` i `dist/pacjent360-public.zip.sha256`;
- public repo: `dist/pacjent360-public-repo.zip`; aktualny SHA256 jest w `dist/release-manifest.json` i `dist/pacjent360-public-repo.zip.sha256`;
- `dist/release-manifest.json` musi zaczynać się od `{` i parsować jako JSON.

Po pierwszym wdrożeniu domena `https://pacjent360.com.pl` powinna przechodzić pełną bramkę:

```powershell
.\tools\verify-deployed-site.ps1 -BaseUrl "https://pacjent360.com.pl" -CompareLocalPackage -LocalPublicPath "dist/upload-ready"
```

Jeśli verifier zwraca 404 dla `index.html` albo `health.txt`, sprawdź, czy domena wskazuje na właściwy katalog dokumentów i czy na hosting trafiła zawartość `dist/upload-ready`, a nie sam folder `upload-ready`, całe repo lub ZIP pozostawiony bez rozpakowania.

Jeśli po uploadzie nadal widzisz 404 albo inne zachowanie dla `www`, uruchom diagnostykę domeny. Raport sprawdzi też `health.txt` oraz publiczne artefakty pomocnicze zostawione przypadkiem w document root:

```powershell
node tools\domain-diagnostics.js -ReportPath "dist/domain-diagnostics.txt"
```

```powershell
.\tools\prepare-public.ps1 -Zip
```

Skrypt przygotuje katalog `dist/public` oraz archiwum `dist/pacjent360-public.zip`. Pełny gate przygotuje też `dist/upload-ready`; na hosting powinny trafić pliki z `dist/upload-ready`, nie cały katalog roboczy projektu.

Po każdym buildzie uruchom:

```powershell
.\tools\verify-public.ps1
```

Nastepnie uruchom lekki HTTP smoke test paczki publicznej:

```powershell
.\tools\smoke-public.ps1
```

Ten test startuje lokalny serwer dla `dist/public`, sprawdza statusy stron, obraz hero, kluczowe markery safety/UI i potwierdza, ze prywatne pliki robocze nie sa serwowane.

Po przygotowaniu katalogu uploadu ten sam test mozna uruchomic na dokladnie tej paczce, ktora trafi na hosting:

```powershell
.\tools\smoke-public.ps1 -PackageDir "dist/upload-ready" -Port 4194
```

Pelny `tools\validate-go-live.ps1` wykonuje ten krok automatycznie po `tools\prepare-hosting-upload.ps1`.

Mozna tez lokalnie przetestowac sciezke post-deploy verifiera:

```powershell
.\tools\smoke-deployed-compare.ps1 -PackageDir "dist/upload-ready" -Port 4196
```

Ten test serwuje `dist/upload-ready` i uruchamia `tools\verify-deployed-site.ps1 -AllowHttp -CompareLocalPackage`, czyli lokalnie sprawdza komende uzywana pozniej po realnym uploadzie.

Po zmianach UI uruchom takze klikalny smoke test w headless Chrome/Edge:

```powershell
.\tools\smoke-browser.ps1
```

Ten test wykonuje JavaScript w przegladarce, przechodzi przez kokpit pacjenta, dialog dokumentu, raport kontekstowy i wariant mobile. Wymaga Chrome albo Edge; jesli przegladarka nie jest wykryta automatycznie, ustaw `BROWSER_PATH`.

Uwaga CSP: dyrektywa `frame-ancestors` nie dziala z poziomu meta tagu. Paczka zawiera `.htaccess` dla Apache/nazwa.pl, ktory ustawia CSP, `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, wylacza listing katalogow oraz przekierowuje HTTP i `www` do `https://pacjent360.com.pl`. Jesli hosting nie respektuje `.htaccess`, skonfiguruj te naglowki i przekierowania w panelu hostingu lub inna metoda.

Nie utrzymujemy recznej listy plikow do uploadu w tym dokumencie. Zawsze wgrywaj cala zawartosc `dist/upload-ready` i porownuj hosting z automatycznie wygenerowanymi plikami:

- `dist/document-root-checklist.txt`,
- `dist/upload-ready-manifest.json`.

`index.html` jest publiczną stroną projektu. `demo.html` jest działającym prototypem MVP. `disclaimer.html` jest publicznym ograniczeniem medycznym prototypu. `privacy.html` opisuje prywatność i lokalne działanie demo. `maintenance.html` służy do szybkiego rollbacku. `health.txt` jest neutralnym plikiem kontrolnym do potwierdzenia poprawnego document root po uploadzie.

## Warunki przed aktualizacją repo i publikacją

Nie aktualizuj repozytorium publicznego ani nie publikuj domeny produkcyjnie, jeśli w `README.md` lub `SECURITY.md` tekst sugeruje stan, którego nie potrafisz potwierdzić testem.

Wymagane kanały kontaktu:

- `security@pacjent360.com.pl` - prywatne zgłoszenia podatności, incydentów prywatności i ryzyk clinical safety.
- `kontakt@pacjent360.com.pl` - ogólny kontakt projektowy i współpraca.

Po każdej większej zmianie konfiguracji poczty potwierdź, że te adresy nadal działają.

Po skonfigurowaniu poczty wykonaj najpierw techniczny precheck DNS:

```powershell
.\tools\verify-contact-gate.ps1 -DnsOnly
```

Następnie wyślij testowe wiadomości z zewnętrznej skrzynki na oba aliasy, potwierdź odbiór i odpowiedź zwrotną. Dopiero wtedy oznacz contact gate jako gotowy:

```powershell
.\tools\verify-contact-gate.ps1 -ReceiptConfirmed -MonitorOwner "imię/nazwa osoby monitorującej"
```

Nie publikuj na hostingu:

- prywatne notatki i materiały źródłowe autora.
- szkice komunikacji, w tym osobne materiały na LinkedIn, które nie są treścią strony WWW.
- `.git/` - repozytorium lokalne.
- robocze materiały AI, lokalne zrzuty, artefakty smoke testów i paczki builda; nie trafiają do publicznego GitHuba domyślnie.
- `docs/ARCHITECTURE.md`, `README.md`, `docs/legal/DISCLAIMER.md`, `docs/deployment/PUBLISHING.md`, `docs/governance/RISKS.md` - dokumenty repozytorium; mogą trafić do publicznego GitHuba tylko zgodnie z allowlistą D-002 w `docs/PROGRAM_PLAN.md`.

## Szybka ścieżka w nazwa.pl

Szczegółowy runbook pierwszego uploadu jest w `docs/deployment/DEPLOYMENT_RUNBOOK_NAZWA.md`.

Według centrum pomocy nazwa.pl domenę i hosting konfiguruje się w Panelu Klienta pod adresem `https://nazwa.pl/panel`. Dla domeny zarejestrowanej w nazwa.pl przejdź do `Usługi -> Domeny`, wybierz `pacjent360.com.pl` i skonfiguruj przekierowanie domeny na usługę hostingową. Dla CloudHosting można też wskazać katalog, z którego ma być serwowana strona.

Oficjalne instrukcje:

- Przekierowanie domeny na hosting w nazwa.pl: https://www.nazwa.pl/pomoc/baza-wiedzy/jak-przekierowac-domene-na-hosting-w-nazwa-pl/
- Dodanie obsługi domeny na serwerze: https://www.nazwa.pl/pomoc/baza-wiedzy/jak-dodac-obsluge-nowej-domeny-na-serwerze/
- Ręczna konfiguracja DNS domeny: https://www.nazwa.pl/pomoc/baza-wiedzy/jak-wlaczyc-reczna-konfiguracje-strefy-dns-domeny-zarejestrowanej-w-nazwa-pl/

## Minimalny check po publikacji

1. Przejdź przez `docs/deployment/GO_LIVE_CHECKLIST.md`.
2. Uruchom verifier domeny:

```powershell
.\tools\verify-deployed-site.ps1 -BaseUrl "https://pacjent360.com.pl"
```

Po pierwszym udanym verifierze możesz potwierdzić, że domena serwuje dokładnie lokalną paczkę:

```powershell
.\tools\verify-deployed-site.ps1 -BaseUrl "https://pacjent360.com.pl" -CompareLocalPackage
```

3. Otwórz `https://pacjent360.com.pl`.
4. Sprawdź, czy widać stronę główną i obraz hero.
5. Kliknij `Zobacz demo MVP`.
6. Sprawdź, czy otwiera się `demo.html`.
7. W demo kliknij `Raporty` i potwierdź, że jest sekcja `Known / Unknown / Uncertain / To verify`.
8. W stopce kliknij `Disclaimer` i potwierdź, że otwiera się `disclaimer.html`.
9. Kliknij `Prywatność` i potwierdź, że otwiera się `privacy.html`.
10. Potwierdź, że `maintenance.html` jest dostępny, ale nigdzie nie jest linkowany jako główna strona.
11. Potwierdź, że publicznie nie są dostępne prywatne notatki, szkice komunikacji ani robocze pliki autora.
