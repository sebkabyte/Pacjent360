# Rollback po publikacji

Jeśli po publikacji pojawi się poważne ryzyko, że strona lub demo sugeruje diagnozę, triage, leczenie, afiliację z CeZ/NFZ/IKP albo przetwarza dane w sposób niezamierzony, wykonaj rollback.

## Procedura

1. Zastąp publiczny `index.html` zawartością `maintenance.html` albo ustaw przekierowanie na `maintenance.html`.
2. Wyłącz link do `demo.html`.
3. Zapisz incydent w `docs/governance/RISKS.md`.
4. Zapisz decyzję i czas reakcji w `CHANGELOG.md`.
5. Popraw problem lokalnie i wykonaj pełny check publikacyjny z `docs/deployment/PUBLISHING.md`.

## Czas reakcji

P0: tego samego dnia.
P1: przed kolejną publiczną komunikacją lub postem LinkedIn.
