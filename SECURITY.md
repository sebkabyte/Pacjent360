# Security Policy

Pacjent 360 jest prototypem koncepcyjnym przeznaczonym wyłącznie do pracy z fikcyjnymi danymi pacjentów.

## Zgłaszanie problemów

Jeśli znajdziesz podatność, ryzyko ujawnienia danych, problem z prywatnością albo możliwość użycia demo w sposób wykraczający poza pytanie, zadanie, status albo brak danych, nie publikuj szczegółów w publicznym issue.

## Bezpieczny kontakt

Zgłoszenia podatności, ryzyk prywatności i problemów clinical safety powinny być obsługiwane prywatnie.

Aktualny status: projekt jest publicznym prototypem alpha. Nie przyjmuje zgłoszeń zawierających realne dane pacjentów, dokumentację medyczną ani dane możliwe do identyfikacji.

Docelowy kanał prywatny po konfiguracji poczty:

- `security@pacjent360.com.pl`
- alternatywnie `kontakt@pacjent360.com.pl` z tematem `[SECURITY]`

Do czasu potwierdzenia tych aliasów:

- nie publikuj szczegółów podatności ani danych wrażliwych w publicznym issue,
- użyj GitHub Security Advisory / private vulnerability reporting, jeśli jest dostępne w repozytorium,
- jeśli musisz użyć publicznego issue, zgłoś wyłącznie krótki sygnał bez szczegółów technicznych i bez danych pacjenta.

Po konfiguracji poczty techniczny precheck wykonaj przez `tools/verify-contact-gate.ps1 -DnsOnly`. Status kontaktu można oznaczyć jako gotowy dopiero po ręcznym teście wysyłka-odbiór-odpowiedź dla obu aliasów i uruchomieniu `tools/verify-contact-gate.ps1 -ReceiptConfirmed -MonitorOwner "..."`.

Oczekiwany czas odpowiedzi po uruchomieniu kanału prywatnego: 72 godziny.

W zgłoszeniu podaj:

- opis problemu,
- kroki odtworzenia,
- potencjalny wpływ,
- proponowaną mitigację, jeśli jest znana.

## Zakres bezpieczeństwa

Priorytetowe obszary:

- prywatność i brak danych realnych,
- brak scrapingu IKP/P1,
- brak przechowywania loginów,
- brak automatycznych decyzji klinicznych po stronie systemu,
- supply chain strony publicznej,
- dostępność i czytelność ostrzeżeń.

## LLM i asystenci operacyjni

Do czasu osobnej walidacji Pacjent 360 nie wysyła realnych danych pacjentów do zewnętrznych modeli LLM. Prompt, fixture, dry-run, eksport testowy i log agenta mogą używać wyłącznie danych fikcyjnych, kompozytowych albo syntetycznych.

Każda przyszła funkcja LLM musi przejść przez `docs/SSOT.md`, Sprint A0 Safety & Contracts, review prywatności i review bezpieczeństwa. Szczególne ryzyka security/privacy:

- prompt injection w dokumentach, transkrypcjach, wynikach lub notatkach;
- leakage danych przez podsumowanie, błąd walidatora, log, eksport albo telemetrykę;
- output bez źródła albo bez statusu DITL;
- ton autorytatywny wykraczający poza pytanie, zadanie, status albo brak danych;
- wysyłka danych poza zakres zgody pacjenta.

Jeśli którakolwiek z tych sytuacji wystąpi, funkcja LLM jest no-go do czasu poprawki, testów negatywnych i ponownego review.
