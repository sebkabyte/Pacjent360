# GitHub Setup

Checklist przed otwarciem publicznego repozytorium.

## Przed publikacją repo

- Preferowana lokalna bramka: `powershell -ExecutionPolicy Bypass -File tools\validate-go-live.ps1`.
- Jeśli używasz pojedynczych komend zamiast pełnej bramki, przejdź przez poniższą listę.
- Upewnij się, że `1.txt` i `linkedin-story.md` nie są śledzone przez Git.
- Sprawdź `.gitignore`.
- Sprawdź, że nie ma `.env`, danych pacjentów ani prywatnych notatek.
- Uruchom `node --check patient360-contract.js`.
- Uruchom `node --check patient360-map-model.js`.
- Uruchom `node --check patient360-previsit-model.js`.
- Uruchom `node --check patient360-caregiver-model.js`.
- Uruchom `node --check patient360-consent-model.js`.
- Uruchom `node --check app.js`.
- Uruchom `powershell -ExecutionPolicy Bypass -File tools\validate-data-contract.ps1`.
- Uruchom `powershell -ExecutionPolicy Bypass -File tools\validate-map-model.ps1`.
- Uruchom `powershell -ExecutionPolicy Bypass -File tools\validate-previsit-workflow.ps1`.
- Uruchom `powershell -ExecutionPolicy Bypass -File tools\validate-caregiver-scope.ps1`.
- Uruchom `powershell -ExecutionPolicy Bypass -File tools\validate-consent-draft.ps1`.
- Uruchom `powershell -ExecutionPolicy Bypass -File tools\prepare-public.ps1 -Zip`.
- Uruchom `powershell -ExecutionPolicy Bypass -File tools\verify-public.ps1`.
- Uruchom `powershell -ExecutionPolicy Bypass -File tools\smoke-public.ps1`.
- Uruchom `powershell -ExecutionPolicy Bypass -File tools\prepare-hosting-upload.ps1`.
- Uruchom `powershell -ExecutionPolicy Bypass -File tools\smoke-deployed-compare.ps1 -PackageDir "dist/upload-ready" -Port 4196`.
- Uruchom `powershell -ExecutionPolicy Bypass -File tools\write-upload-manifest.ps1`.
- Po zmianach UI uruchom `powershell -ExecutionPolicy Bypass -File tools\smoke-browser.ps1`.
- Uruchom `powershell -ExecutionPolicy Bypass -File tools\prepare-public-repo.ps1 -Zip`.
- Uruchom `powershell -ExecutionPolicy Bypass -File tools\verify-public-repo.ps1`.
- Uruchom `powershell -ExecutionPolicy Bypass -File tools\verify-contact-gate.ps1 -DnsOnly` po konfiguracji poczty.
- Po ręcznym teście wysyłka-odbiór-odpowiedź uruchom `powershell -ExecutionPolicy Bypass -File tools\verify-contact-gate.ps1 -ReceiptConfirmed -MonitorOwner "..."`.
- Po publikacji domeny uruchom `powershell -ExecutionPolicy Bypass -File tools\verify-deployed-site.ps1 -BaseUrl "https://pacjent360.com.pl" -CompareLocalPackage -LocalPublicPath "dist/upload-ready"`.
- Uruchom status publikacji: `node tools\release-readiness.js`; po potwierdzeniu aliasów dodaj `-ReceiptConfirmed -MonitorOwner "..."`.
- Przejrzyj `RISKS.md`, `DISCLAIMER.md`, `PRIVACY.md` i `NOTICE`.
- Potwierdź w checklist/handover aliasy `security@pacjent360.com.pl` i `kontakt@pacjent360.com.pl`.
- Zastosuj allowlistę D-002 z `PROGRAM_PLAN.md`.
- Nie publikuj domyślnie: `CLAUDE.md`, `CODEX_*`, `HANDOVER.md`, `prints/`, `dist/`, `.env`, `.git/`, prywatnych notatek ani danych pacjentów.

## Ustawienia repo

- Repo publiczne dopiero po M0 Publication Ready i Sprint 0.5 Repo Setup.
- Branch protection na `main`.
- Wymagany pull request przed merge.
- Wymagany co najmniej jeden reviewer, gdy pojawi się zewnętrzny zespół.
- Dodać tag `v0.2.0-alpha` po pierwszej bezpiecznej publikacji.
- Dodać link do repo na stronie WWW po utworzeniu repo.

## Minimalny pierwszy release

- Strona publiczna.
- Demo MVP.
- Disclaimer i privacy.
- README, architecture, risks, contributing, security zgodnie z allowlistą D-002 w `PROGRAM_PLAN.md`.
- Bez prywatnych plików roboczych.
- Pierwszy upload repo powinien pochodzic z `dist/repo`, nie z calego katalogu roboczego.
