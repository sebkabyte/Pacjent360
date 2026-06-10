# Definition of Harm (DoH)

Status: obowiązuje od 2026-06-10 (milestone M14). Uzupełnia `docs/governance/RISKS.md`.

Disclaimer mówi, czym system nie jest. Definition of Harm mówi, **jakich szkód system ma nie powodować** — i jak każdą z nich blokujemy. Każda zmiana produktu powinna odpowiedzieć: których szkód może dotknąć i czy bramki nadal działają.

Weryfikacja techniczna: `tools/validate-harm-gates.ps1` (część bramki publikacyjnej).

## Katalog szkód

| ID | Szkoda | Jak blokujemy | Weryfikacja | Status |
| --- | --- | --- | --- | --- |
| H-001 | Pacjent zrozumiał raport jako diagnozę | Zakazane frazy w outputach (`FORBIDDEN_CLAIM_PHRASES`), język „pytanie/brak danych/do omówienia", disclaimer przy raporcie | `validate-data-contract` (hard-fail na frazach w `claim.text`), `validate-harm-gates` | aktywne |
| H-002 | Opiekun zobaczył dane poza zakresem zgody | Zakresy `areas` per zgoda, filtrowanie widoku opiekuna, cofnięcie zgody ukrywa dane, audyt dostępu | `validate-caregiver-scope` (edge cases: wygasła/cofnięta zgoda, leakage przez komunikat) | aktywne |
| H-003 | Lekarz zaufał twierdzeniu bez źródła | Każdy claim ma `sourceRefs` albo jawny `source_missing`; źródło renderowane obok twierdzenia (`sourceChips`) | `validate-data-contract` (source coverage, `sourceQuality`) | aktywne |
| H-004 | Rodzic/opiekun prawny potraktowany bez podstawy dostępu | Role relacyjne (`rodzic`, `opiekun prawny`, `osoba wspierająca`) + zakresy; macierz authority w kierunku M13 | `validate-caregiver-scope`; macierz authority: praca M13 | częściowe (M13) |
| H-005 | System ukrył niepewność albo sprzeczność | Statusy `do potwierdzenia`/`rozbieżność`, DITL statusy, Known/Unknown/Uncertain/To verify w raporcie | review + `validate-map-model` (statusy zdarzeń); ocena czytelności w walidacji M5 | częściowe |
| H-006 | AI wygenerowało fakt bez źródła | LLM runtime = no-go do zamknięcia A0 (kontrakty, walidator outputów, dry-run, audyt) | bramka A0 w `docs/SPRINTS.md`; do czasu A0 brak runtime | aktywne (przez no-go) |
| H-007 | Eksport ujawnił dane ukryte w UI | Eksport przez kontrakt v0.1; zakresy zgód w eksporcie do wzmocnienia przy M7/M8 | `validate-data-contract` (kształt eksportu); test parytetu UI↔eksport: backlog M7/M8 | częściowe |
| H-008 | Kolor flagi odebrany jako ocena pilności | Etykiety flag bez języka pilności („Sygnał do sprawdzenia", nie „pilne"), brak triage | `validate-harm-gates` (etykiety `FLAG_META` vs frazy pilności); metryka „odczyt jako triage" w pilocie M6 | aktywne |
| H-009 | Pacjent opóźnił kontakt z lekarzem, bo raport brzmiał uspokajająco | Zakaz sugerowania, że konsultacja nie jest potrzebna; copy „do omówienia z lekarzem" | review copy (Clinical Safety Checklist) + pytanie w formularzu walidacji M5 | częściowe (wymaga walidacji z ludźmi) |
| H-010 | Demo przyjęło realne dane pacjenta | Trwały banner „DANE FIKCYJNE", disclaimer, brak backendu (localStorage), zakaz w CONTRIBUTING | `validate-harm-gates` (obecność bannera i disclaimerów), `smoke-browser` | aktywne |

## Reguły użycia

1. **Przy każdym PR/commicie**: Clinical Safety Checklist (CONTRIBUTING) odpowiada pośrednio na H-001, H-003, H-009, H-010.
2. **Przy zmianach zgód/opiekuna**: przejść edge cases H-002 i H-004.
3. **Przy każdej pracy nad eksportem/raportem**: sprawdzić H-007 (parytet UI↔eksport).
4. **Przy projektowaniu agentów (A0+)**: H-006 staje się głównym gate'em; walidator outputów agenta musi pokrywać H-001, H-003, H-006, H-008.
5. **W walidacji z użytkownikami (M5/M6)**: metryki szkody poznawczej — czy ktokolwiek odczytał output jako diagnozę, triage albo „nie musisz iść do lekarza" (H-001, H-008, H-009). Próg no-go: ≥2 takie odczyty.

## Czego ta lista nie obejmuje (świadomie, na ten etap)

Szkody operacyjne skali produkcyjnej (utrata danych, dostępność, ransomware, klucze) — poza zakresem statycznego prototypu bez realnych danych; wejdą do DoH przy decyzji o backendzie (M12+).
