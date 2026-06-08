# Pacjent 360: runbook publikacji na nazwa.pl

Status: praktyczny runbook dla pierwszego uploadu `pacjent360.com.pl`.

Zasada glowna: na hosting trafia zawartosc `dist/upload-ready`, a nie caly katalog roboczy projektu.

## 1. Warunki startowe

Przed uploadem lokalnie musi przejsc:

```powershell
powershell -ExecutionPolicy Bypass -File tools\validate-go-live.ps1
```

Po przejsciu gate sprawdz:

- `dist/public` - katalog builda uzywany do stworzenia hosting ZIP-a,
- `dist/upload-ready` - katalog przygotowany z hosting ZIP-a; najbezpieczniejszy katalog do uploadu,
- `dist/pacjent360-public.zip` - paczka hostingowa,
- `dist/pacjent360-upload-root.zip` - ZIP do rozpakowania bezposrednio w document root, jesli panel hostingu wspiera rozpakowanie archiwum,
- `dist/release-manifest.json` - aktualny manifest release,
- `dist/document-root-checklist.txt` - krotka lista 19 plikow, ktore po uploadzie maja lezec bezposrednio w document root,
- `dist/pacjent360-public.zip.sha256` - aktualny hash paczki hostingowej.

Pelny gate uruchamia tez `tools\verify-release-artifacts.ps1`, ktory rozpakowuje hosting ZIP i sprawdza go tak, jak katalog gotowy do uploadu.

Nie publikuj `dist/repo`, `prints`, `.git`, `CLAUDE.md`, `CODEX_*`, `HANDOVER.md`, `1.txt`, `linkedin-story.md`, `.env` ani calego katalogu projektu.

Nie zostawiaj tez w publicznym document root ZIP-ow, manifestow, checklist ani raportow pomocniczych: `pacjent360-public.zip`, `pacjent360-upload-root.zip`, `pacjent360-public-repo.zip`, plikow `.sha256`, `release-manifest.json`, `upload-ready-manifest.json`, `deployment-handoff.txt`, `go-live-status.txt`, `domain-diagnostics.txt` i `document-root-checklist.txt`. Sa to artefakty dla autora/reviewera, nie czesc strony.

## 2. Panel nazwa.pl

Oficjalne instrukcje nazwa.pl istotne dla tego projektu:

- Przekierowanie domeny na hosting: https://www.nazwa.pl/pomoc/baza-wiedzy/jak-przekierowac-domene-na-hosting-w-nazwa-pl/
- Dodanie obslugi domeny na serwerze: https://www.nazwa.pl/pomoc/baza-wiedzy/jak-dodac-obsluge-nowej-domeny-na-serwerze/
- Reczna konfiguracja strefy DNS: https://www.nazwa.pl/pomoc/baza-wiedzy/jak-wlaczyc-reczna-konfiguracje-strefy-dns-domeny-zarejestrowanej-w-nazwa-pl/

Minimalna sciezka:

1. Zaloguj sie do Panelu Klienta: `https://nazwa.pl/panel`.
2. Sprawdz, czy `pacjent360.com.pl` jest przekierowana na wlasciwa usluge hostingowa.
3. Sprawdz, czy domena jest dodana do obslugi na serwerze/CloudHosting.
4. Ustal katalog dokumentow domeny, czyli miejsce, z ktorego serwowany jest `index.html`.
5. Wgraj zawartosc `dist/upload-ready` do katalogu dokumentow domeny.

Jesli po uploadzie `https://pacjent360.com.pl/index.html` zwraca 404, najczestsze przyczyny sa dwie:

- pliki zostaly wgrane do zlego katalogu,
- domena nie wskazuje na katalog, do ktorego wgrano `index.html`.

## 3. Co dokladnie wgrac

Wgraj wszystkie pliki i katalogi z `dist/upload-ready`, w tym:

- `.htaccess`,
- `index.html`,
- `demo.html`,
- `disclaimer.html`,
- `privacy.html`,
- `maintenance.html`,
- `health.txt`,
- `site.css`,
- `site.js`,
- `styles.css`,
- `app.js`,
- `patient360-contract.js`,
- `patient360-map-model.js`,
- `patient360-previsit-model.js`,
- `patient360-caregiver-model.js`,
- `patient360-consent-model.js`,
- `robots.txt`,
- `sitemap.xml`,
- `assets/`.

Alternatywa, jesli panel hostingu pozwala rozpakowac ZIP na serwerze:

1. Wgraj `dist/pacjent360-upload-root.zip` do document root domeny.
2. Rozpakuj archiwum bezposrednio w tym katalogu.
3. Po rozpakowaniu upewnij sie, ze `index.html`, `demo.html` i `.htaccess` leza bezposrednio w document root, a nie w dodatkowym folderze.
4. Usun ZIP z hostingu po rozpakowaniu, jesli panel zostawia go jako plik publiczny.
5. Nie wgrywaj ani nie zostawiaj w document root manifestow i raportow z `dist/`; verifier domeny potraktuje je jako blad publikacji.

Uwaga: `.htaccess` jest plikiem ukrytym. Niektore klienty FTP lub menedzery plikow nie pokazuja albo nie wysylaja plikow zaczynajacych sie od kropki. Po uploadzie upewnij sie, ze `.htaccess` realnie jest na serwerze.

Jesli musisz odtworzyc katalog uploadu recznie, uruchom:

```powershell
powershell -ExecutionPolicy Bypass -File tools\prepare-hosting-upload.ps1
```

Skrypt rozpakowuje `dist/pacjent360-public.zip` do `dist/upload-ready` i sprawdza wynik przez `tools\verify-public.ps1`.

Przed uploadem mozna tez sprawdzic dokladnie katalog, ktory trafi na hosting:

```powershell
powershell -ExecutionPolicy Bypass -File tools\smoke-public.ps1 -PackageDir "dist/upload-ready" -Port 4194
```

Pelny `tools\validate-go-live.ps1` wykonuje ten smoke automatycznie.

Przed uploadem mozna tez lokalnie przetestowac verifier domeny w trybie porownania:

```powershell
powershell -ExecutionPolicy Bypass -File tools\smoke-deployed-compare.ps1 -PackageDir "dist/upload-ready" -Port 4196
```

Ten smoke serwuje `dist/upload-ready` lokalnie i uruchamia `tools\verify-deployed-site.ps1 -AllowHttp -CompareLocalPackage`.

Lekki status calej publikacji bez przebudowy paczek:

```powershell
node tools\release-readiness.js
```

Przed uploadem wynik powinien pokazywac lokalne artefakty jako `GO`, ekspozycje artefaktow pomocniczych jako `GO` oraz domenę jako `NO-GO`, jesli pliki nie sa jeszcze wgrane.

Jesli chcesz zapisac wynik statusu do pliku dla handoveru albo review:

```powershell
node tools\release-readiness.js -ReportPath "dist/go-live-status.txt"
```

Pelny `tools\validate-go-live.ps1` zapisuje ten raport automatycznie po wygenerowaniu handoffu.

Krotki handoff uploadu z hashami, lista plikow i komendami po publikacji:

```powershell
powershell -ExecutionPolicy Bypass -File tools\write-upload-manifest.ps1
```

Wynik: `dist/upload-ready-manifest.json`, `dist/document-root-checklist.txt` oraz `dist/deployment-handoff.txt`. To pliki pomocnicze dla autora/reviewera; nie wgrywaj ich na hosting.

## 4. Szybki test po uploadzie

Najpierw uruchom:

```powershell
powershell -ExecutionPolicy Bypass -File tools\verify-deployed-site.ps1 -BaseUrl "https://pacjent360.com.pl"
```

Po pierwszym udanym verifierze uruchom mocniejszy test zgodnosci z lokalna paczka:

```powershell
powershell -ExecutionPolicy Bypass -File tools\verify-deployed-site.ps1 -BaseUrl "https://pacjent360.com.pl" -CompareLocalPackage -LocalPublicPath "dist/upload-ready"
```

Ten wariant porownuje wdrozone pliki bajt-po-bajcie z `dist/upload-ready` z wyjatkiem `.htaccess`, ktory powinien byc chroniony przed publicznym odczytem.

Jesli verifier przejdzie, sprawdz recznie:

1. `https://pacjent360.com.pl/`
2. `https://pacjent360.com.pl/index.html`
3. `https://pacjent360.com.pl/demo.html`
4. `https://pacjent360.com.pl/disclaimer.html`
5. `https://pacjent360.com.pl/privacy.html`
6. `https://pacjent360.com.pl/maintenance.html`
7. `https://pacjent360.com.pl/health.txt`

W demo sprawdz widoki: Lekarz, Pacjent, Opiekun, Mapa, Sygnaly, Wyniki, Raporty, Zgody, Audyt.

Jesli po uploadzie domena nadal zwraca 404 albo `www.pacjent360.com.pl` zachowuje sie inaczej niz domena bez `www`, uruchom:

```powershell
node tools\domain-diagnostics.js -ReportPath "dist/domain-diagnostics.txt"
```

Raport pokazuje DNS, HTTP/HTTPS, statusy root/index/demo/health oraz podpowiada, czy problem wyglada na brak uploadu, zly document root, placeholder hostingu, brak aliasu `www`, brak przekierowania HTTP -> HTTPS albo publicznie zostawione artefakty pomocnicze.

## 5. Oczekiwane zachowanie verifiera

Verifier powinien potwierdzic:

- `index.html` zwraca 200,
- `demo.html`, `disclaimer.html`, `privacy.html`, `maintenance.html` zwracaja 200,
- `health.txt` zwraca 200 i zawiera `project=pacjent360`,
- obraz hero istnieje i ma sensowny rozmiar,
- skrypty modeli i `app.js` sa dostepne,
- publiczne markery safety sa obecne,
- prywatne pliki zwracaja 403 albo 404,
- ZIP-y, manifesty, checklisty, handoff/status reporty i diagnostyka lokalna zwracaja 403 albo 404, jesli ktos przypadkiem zostawil je w document root,
- naglowki z `.htaccess` sa aktywne: CSP z `frame-ancestors 'none'`, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`,
- przekierowanie z HTTP oraz `www` prowadzi do kanonicznego `https://pacjent360.com.pl`.
- przy `-CompareLocalPackage` wszystkie publiczne pliki oprocz `.htaccess` maja ten sam SHA256 co lokalne `dist/upload-ready`.

Jesli verifier zatrzyma sie na brakujacych naglowkach albo diagnostyka nadal pokazuje brak przekierowania HTTP -> HTTPS, hosting prawdopodobnie nie respektuje `.htaccess`, modulu `headers` albo `rewrite`. Wtedy ustaw naglowki/przekierowania w panelu hostingu albo skontaktuj sie z supportem hostingu.

## 6. Contact gate

DNS/MX precheck nie wystarcza.

```powershell
powershell -ExecutionPolicy Bypass -File tools\verify-contact-gate.ps1 -DnsOnly
```

Przed produkcyjnym go-live i prywatna obsluga zgloszen wykonaj recznie:

1. Wyslij neutralny test na `security@pacjent360.com.pl`.
2. Potwierdz odbior w monitorowanej skrzynce.
3. Odpowiedz z tej skrzynki i potwierdz, ze odpowiedz doszla do zewnetrznego nadawcy.
4. Powtorz dla `kontakt@pacjent360.com.pl`.
5. Dopiero wtedy uruchom:

```powershell
powershell -ExecutionPolicy Bypass -File tools\verify-contact-gate.ps1 -ReceiptConfirmed -MonitorOwner "..."
```

## 7. Rollback

Jesli po publikacji pojawi sie P0 safety/privacy:

1. Zastap publiczny `index.html` zawartoscia `maintenance.html` albo ustaw przekierowanie na `maintenance.html`.
2. Wylacz publiczny link do `demo.html`.
3. Zapisz incydent w `docs/governance/RISKS.md`.
4. Zapisz decyzje w `CHANGELOG.md`.
5. Popraw lokalnie i ponownie uruchom `tools\validate-go-live.ps1`.
