# Security Policy

Pacjent 360 jest prototypem koncepcyjnym przeznaczonym wyłącznie do pracy z fikcyjnymi danymi pacjentów.

## Zgłaszanie problemów

Jeśli znajdziesz podatność, ryzyko ujawnienia danych, problem z prywatnością albo możliwość użycia demo w sposób wykraczający poza pytanie, zadanie, status albo brak danych, nie publikuj szczegółów w publicznym zgłoszeniu.

## Bezpieczny kontakt

Zgłoszenia podatności, ryzyk prywatności i problemów bezpieczeństwa klinicznego powinny być obsługiwane prywatnie.

Aktualny status: projekt jest publicznym prototypem alpha. Nie przyjmuje zgłoszeń zawierających realne dane pacjentów, dokumentację medyczną ani dane możliwe do identyfikacji.

Kanały prywatne:

- `security@pacjent360.com.pl`
- alternatywnie `kontakt@pacjent360.com.pl` z tematem `[SECURITY]`

Kanały zostały potwierdzone testem odbioru i bramką `tools/verify-contact-gate.ps1 -ReceiptConfirmed -MonitorOwner "Sebastian Kalisz"`.

Zasady zgłoszeń:

- nie publikuj szczegółów podatności ani danych wrażliwych w publicznym zgłoszeniu,
- użyj GitHub Security Advisory / private vulnerability reporting, jeśli jest dostępne w repozytorium,
- jeśli musisz użyć publicznego zgłoszenia, przekaż wyłącznie krótki sygnał bez szczegółów technicznych i bez danych pacjenta.

Po większej zmianie konfiguracji poczty powtórz techniczny precheck przez `tools/verify-contact-gate.ps1 -DnsOnly`, ręczny test wysyłka-odbiór-odpowiedź dla obu adresów oraz `tools/verify-contact-gate.ps1 -ReceiptConfirmed -MonitorOwner "..."`.

Oczekiwany czas odpowiedzi: 72 godziny.

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

Każda przyszła funkcja LLM musi przejść przez `docs/SSOT.md`, Sprint A0 Safety & Contracts, przegląd prywatności i przegląd bezpieczeństwa. Szczególne ryzyka bezpieczeństwa i prywatności:

- prompt injection w dokumentach, transkrypcjach, wynikach lub notatkach;
- leakage danych przez podsumowanie, błąd walidatora, log, eksport albo telemetrykę;
- output bez źródła albo bez statusu DITL;
- ton autorytatywny wykraczający poza pytanie, zadanie, status albo brak danych;
- wysyłka danych poza zakres zgody pacjenta.

Jeśli którakolwiek z tych sytuacji wystąpi, funkcja LLM jest no-go do czasu poprawki, testów negatywnych i ponownego review.
