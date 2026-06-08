# Security Policy

Pacjent 360 jest prototypem koncepcyjnym przeznaczonym wyłącznie do pracy z fikcyjnymi danymi pacjentów.

## Zgłaszanie problemów

Jeśli znajdziesz podatność, ryzyko ujawnienia danych, problem z prywatnością albo możliwość użycia demo w sposób wykraczający poza pytanie, zadanie, status albo brak danych, nie publikuj szczegółów w publicznym issue.

## Bezpieczny kontakt

Zgłoszenia podatności, ryzyk prywatności i problemów clinical safety:

**DO UZUPEŁNIENIA PRZED PUBLICZNYM REPO:** poniższe aliasy są wymaganym modelem kontaktu, ale przed otwarciem repozytorium publicznego muszą zostać skonfigurowane, przetestowane i monitorowane.

- Email: security@pacjent360.com.pl
- Alternatywnie: kontakt@pacjent360.com.pl z tematem [SECURITY]

Po konfiguracji poczty techniczny precheck wykonaj przez `tools/verify-contact-gate.ps1 -DnsOnly`. Status kontaktu można oznaczyć jako gotowy dopiero po ręcznym teście wysyłka-odbiór-odpowiedź dla obu aliasów i uruchomieniu `tools/verify-contact-gate.ps1 -ReceiptConfirmed -MonitorOwner "..."`.

Oczekiwany czas odpowiedzi: 72 godziny.
Nie publikuj szczegółów podatności w publicznych issue do czasu naprawy.

Jeśli email nie działa, użyj GitHub Security Advisory po otwarciu publicznego repozytorium.

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

Każda przyszła funkcja LLM musi przejść przez `SSOT.md`, Sprint A0 Safety & Contracts, review prywatności i review bezpieczeństwa. Szczególne ryzyka security/privacy:

- prompt injection w dokumentach, transkrypcjach, wynikach lub notatkach;
- leakage danych przez podsumowanie, błąd walidatora, log, eksport albo telemetrykę;
- output bez źródła albo bez statusu DITL;
- ton autorytatywny wykraczający poza pytanie, zadanie, status albo brak danych;
- wysyłka danych poza zakres zgody pacjenta.

Jeśli którakolwiek z tych sytuacji wystąpi, funkcja LLM jest no-go do czasu poprawki, testów negatywnych i ponownego review.
