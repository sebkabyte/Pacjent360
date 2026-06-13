# Prywatność

Pacjent360™ jest statycznym prototypem koncepcyjnym. Publiczna strona nie wymaga konta, a demo jest przeznaczone wyłącznie do pracy z fikcyjnymi danymi pacjentów.

## Administrator danych

Administratorem danych związanych z publiczną stroną projektu Pacjent360™ jest Sebastian Kalisz.

Kontakt w sprawach prywatności: `kontakt@pacjent360.com.pl`.

## Podstawa prawna i cel

Podstawą prawną ewentualnego przetwarzania danych technicznych jest Art. 6(1)(f) RODO, czyli uzasadniony interes administratora polegający na hostingu statycznej strony, zapewnieniu jej działania i podstawowym bezpieczeństwie technicznym.

## Zakres danych

Strona publiczna nie zbiera danych osobowych przez formularze, konta użytkowników, cookies analityczne ani tracking.

Demo MVP działa lokalnie w przeglądarce i korzysta z fikcyjnych danych. Dane wpisane w demo mogą zostać zapisane w `localStorage` przeglądarki, obecnie pod kluczem `pacjent360-state-v11`. Pozostają lokalne dla przeglądarki do czasu resetu demo albo wyczyszczenia danych strony.

## Zewnętrzny CDN

Strona publiczna i demo pobierają bibliotekę ikon Lucide z CDN `unpkg.com`:

```text
https://unpkg.com/lucide@0.468.0/dist/umd/lucide.min.js
```

Wersja jest przypięta do `0.468.0`, a skrypt ma atrybut SRI (`integrity`) i `crossorigin="anonymous"` w `index.html` oraz `demo.html`.

`unpkg.com` działa w oparciu o Cloudflare CDN. Adres IP odwiedzającego może być widoczny dla operatora CDN wraz ze standardowymi informacjami technicznymi, takimi jak user-agent, referer i czas żądania.

## Logi serwera

Hosting nazwa.pl może rejestrować standardowe logi HTTP, takie jak adres IP, user-agent, timestamp, ścieżka URL i kod odpowiedzi HTTP.

Retencja logów zależy od polityki hostingu nazwa.pl. Logi służą utrzymaniu działania strony i bezpieczeństwu technicznemu.

## Prawa użytkownika

W zakresie wynikającym z RODO możesz poprosić o dostęp do danych, sprostowanie, usunięcie, ograniczenie przetwarzania, przenoszenie danych albo wnieść sprzeciw wobec przetwarzania.

W sprawach prywatności napisz na `kontakt@pacjent360.com.pl`.

## Skarga do PUODO

Masz prawo wnieść skargę do Prezesa Urzędu Ochrony Danych Osobowych (PUODO), jeśli uważasz, że przetwarzanie danych narusza przepisy o ochronie danych osobowych.

## Brak profilowania i śledzenia

Strona nie profiluje użytkowników, nie używa cookies analitycznych i nie śledzi zachowań odwiedzających. Projekt nie korzysta z reklam ani narzędzi marketingowego trackingu.

## Brak integracji z IKP/P1

Pacjent360™ nie loguje się do IKP, nie przechowuje loginów, nie scrapuje danych i nie korzysta z oficjalnej integracji z P1. Ewentualne integracje mogą powstać wyłącznie legalną, oficjalną ścieżką.

## Dane realne

Do repozytorium, issue, pull requestów, publicznych komentarzy, formularzy feedbacku i demo nie wolno dodawać realnych danych pacjentów, dokumentacji medycznej ani danych pozwalających zidentyfikować osobę.

Feedback najlepiej odnosić do fikcyjnych case studies albo do ogólnych problemów workflow.
