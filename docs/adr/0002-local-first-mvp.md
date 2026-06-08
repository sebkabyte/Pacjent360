# ADR 0002: Local-first MVP

Status: zaakceptowany

## Decyzja

MVP pozostaje statycznym prototypem działającym lokalnie w przeglądarce, bez backendu i bez realnych danych pacjentów.

## Uzasadnienie

Local-first pozwala walidować model kontekstu, raport i workflow bez ryzyka przetwarzania danych medycznych na serwerze.

## Konsekwencje

- Demo używa fikcyjnych danych.
- Nie należy wpisywać realnych danych pacjentów.
- Integracje z IKP/P1 są wyłącznie przyszłą ścieżką, możliwą tylko przez oficjalne mechanizmy.
