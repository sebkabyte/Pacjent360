# Changelog

## Unreleased

- Brak zmian po `v0.2.2-alpha`.

## v0.2.2-alpha - aktualny release candidate

- Dodano bramkę R1 reaktywności demo: pacjent, widoki, scenariusz, źródła i eksport są sprawdzane automatycznie.
- Wzmocniono GitHub Actions o testy jednostkowe, bramkę reaktywności i browser smoke.
- Ujednolicono dokumentację prywatności z faktycznym kluczem `pacjent360-state-v7`.
- Oznaczono historyczną analizę luk kokpitów jako archiwalny backlog, nie aktualny opis MVP.
- Uporządkowano publiczny wording kontaktu bez roboczych komunikatów przed go-live.
- Przebudowano publiczną stronę projektu: nowy design „story" (samowystarczalny, bez zewnętrznych skryptów), uczciwa roadmapa bez deklaracji skali i budżetów, sekcja współpracy zamiast inwestorskiej, zasada traceability strona-repo.
- Dodano `PRODUCT_SSOT.md` jako nadrzędne źródło prawdy o produkcie (ADR 0005); `docs/SSOT.md` zawężony do roli LLM/agentów.
- Dodano `docs/product/FIRST_WEDGE.md`: zatwierdzony pierwszy wedge (przygotowanie wizyty przez opiekuna + lekarz 90 sekund).
- Dodano milestony M13 (język kręgu opieki) i M14 (Definition of Harm + Safety Case) oraz status adopcji zewnętrznych materiałów koncepcyjnych w `docs/PROGRAM_PLAN.md`.
- Poprawki UI demo: kafelki pełnych danych bez ucinania tekstu, czytelniejsza tabela rozbieżności lekowych, spójny promień kart i typografia nagłówków.
- Walidator a11y: elastyczniejszy check etykiety nawigacji; landing dostał style focus-visible.

## v0.2.0-alpha - przygotowanie go-live

- Uporządkowano model DITL: Doctor in the Loop.
- Dodano publiczny disclaimer medyczny.
- Dodano roadmapę i plan rozwoju w README.
- Dodano architekturę jako warstwę kontekstu nad IKP/P1.
- Dodano założenia asystentów operacyjnych.
- Dodano pliki governance: privacy, security, contributing, risks.
