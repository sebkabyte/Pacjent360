# ADR 0005: Product SSOT nad agent SSOT

Data: 2026-06-10

Status: **SUPERSEDED BY ADR 0008 FOR CURRENT GOVERNANCE HIERARCHY**

Superseded: 2026-07-10
Owner: Sebastian Kalisz, Founder
Replacement: `docs/adr/0008-founder-control-pack-v1-scope-freeze.md`

Ten ADR pozostaje historycznym uzasadnieniem utworzenia `PRODUCT_SSOT.md`. Nie definiuje już kolejności aktywnych planów, sprintów ani agentowego SSOT. W przypadku konfliktu obowiązuje ADR 0008 i `CURRENT_SCOPE_MANIFEST.json`.

## Kontekst

`docs/SSOT.md` nosił tytuł „Pacjent360™ SSOT: LLM Agents" i opisywał wyłącznie rolę LLM/agentów, ale w hierarchii dokumentów funkcjonował jak nadrzędne źródło prawdy całego produktu. Brakowało dokumentu odpowiadającego na pytania: czym jest produkt, kto jest użytkownikiem, jaki jest kanoniczny model danych, co jest no-go, jak ma się krąg opieki (ludzie) do agentów (funkcje systemu). Problem wskazała analiza zewnętrzna (materiały koncepcyjne autora, 2026-06-09); ocena potwierdziła, że krytyka jest trafna.

## Decyzja

1. Powstaje `PRODUCT_SSOT.md` w katalogu głównym repo jako nadrzędne źródło prawdy o produkcie: definicja, czym produkt nie jest, kanoniczny model `Source -> Claim -> Event -> Episode -> Report`, perspektywy użytkowników, rozdział krąg opieki vs agenci operacyjni, DITL jako zasada architektoniczna, zasada traceability strona↔repo, lista no-go.
2. `docs/SSOT.md` zostaje przemianowany tytułem na „SSOT: LLM i agenci operacyjni" i jawnie podporządkowany `PRODUCT_SSOT.md`. Treść zasad agentowych pozostaje bez zmian.
3. Historyczna hierarchia z 2026-06-10 została zastąpiona 2026-07-10 przez hierarchię ADR 0008. `docs/SSOT.md` i stare sprinty są obecnie `REFERENCE_ONLY`.
4. Nie zmienia się żaden kod, UI ani dane demo w ramach tej decyzji.

## Konsekwencje

- Pytania o produkt (role, dostęp, model, raport, no-go) mają jedno miejsce odpowiedzi.
- Dokumenty agentowe nie muszą już udawać dokumentów produktowych.
- Strona publiczna podlega zasadzie traceability z `PRODUCT_SSOT.md` sekcja 7.
- Przyszłe rozszerzenia modelu (Identity/Authority, Consent Policy, Report Version, Correction) mają zdefiniowane miejsce docelowe w `PRODUCT_SSOT.md` sekcja 3.
