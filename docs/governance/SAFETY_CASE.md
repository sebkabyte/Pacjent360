# Safety Case — Pacjent360™

Status: obowiązuje od 2026-06-10 (milestone M14). Wersja dla prototypu alpha.

<!-- P360_PHASE_NOTE
Ten dokument opisuje architekturę bezpieczeństwa CAŁEJ powierzchni prototypu, w tym role i
mechanizmy późniejszych faz. Nie definiuje current scope i nie aktywuje żadnej roli.
Current scope wyznacza docs/governance/CURRENT_SCOPE_MANIFEST.json:
kompetentny dorosły pacjent + jedna nazwana dorosła osoba wspierająca + jedna planowana wizyta;
synthetic-only; lekarz = późniejszy odbiorca read-only, NIE current user;
dzieci i opiekunowie prawni = BLOCKED; AI/OCR/CDSS/backend = BLOCKED.
Wzmianki o lekarzu i opiekunie prawnym poniżej są warunkową przyszłością albo opisem
granicy DITL, nigdy deklaracją current phase.
-->

> **Zakres fazowy:** poniższe pod-twierdzenia opisują docelową architekturę bezpieczeństwa.
> W current phase (S0) nie ma lekarza jako użytkownika, nie ma ról dziecka ani opiekuna prawnego
> i nie ma backendu. Patrz `P360_PHASE_NOTE` powyżej.

Disclaimer mówi: „nie jesteśmy lekarzem". Safety Case pokazuje, **jak architektura wymusza, że system nie zachowuje się jak lekarz** — z dowodami w kodzie, kontraktach i walidatorach, nie tylko w deklaracjach.

## Twierdzenie główne

> Pacjent360™ nie podejmuje decyzji klinicznych. Każdy output systemu jest pytaniem, statusem, brakiem danych, rozbieżnością albo draftem do weryfikacji przez człowieka.

## Argumentacja: pod-twierdzenia i dowody

### C1. System nie wypowiada się językiem decyzji klinicznej

- `FORBIDDEN_CLAIM_PHRASES` we wspólnym kontrakcie (`public/patient360-contract.js`) — frozen, jeden słownik dla aplikacji i walidatorów.
- Listy zakazanych fraz per domena: `FORBIDDEN_CAREGIVER_PHRASES` (model opiekuna), frazy pre-visit (model M4).
- `tools/validate-data-contract.js`: hard-fail, gdy zakazana fraza pojawia się w `claim.text`.
- `tools/validate-harm-gates.js`: etykiety flag i statusów osi czasu bez języka pilności i interpretacji (H-001, H-008).
- `tools/verify-public.ps1`: blokada historycznych fraz w paczce publikacyjnej.

### C2. Każde twierdzenie ma proweniencję

- Każdy claim ma `sourceRefs` albo kanoniczny `source_missing` (`SOURCE_MISSING_REF` w kontrakcie); brak źródła jest jawny, nie ukryty.
- `sourceQuality.sourceMissingCount` w eksporcie — liczba twierdzeń bez źródła jest metryką, nie wstydem.
- UI renderuje źródło obok twierdzenia (`sourceChips()` w każdym widoku).
- Weryfikacja: `tools/validate-data-contract.ps1` (source coverage dla p1/p2 i eksportu).

### C3. Pytania klinicznie istotne pozostają pytaniami do człowieka

- `DITL_STATUSES`: do wyjaśnienia / wyjaśnione / odrzucone / dalsza kontrola — statusu NIE nadaje system. W docelowej architekturze rozstrzyga je człowiek podczas wizyty; w current phase pozostają wyłącznie pytaniami użytkownika, bo lekarz nie jest current userem.
- `STATUS_MAP`/`personaStatus()`: pacjent widzi „Do omówienia", nigdy języka decyzyjnego. Etykiety odsyłające do weryfikacji podczas wizyty opisują intencję rozmowy, nie obecność lekarza w produkcie.
- Brak jakiejkolwiek auto-akcji medycznej w kodzie (brak bookingu, brak zmian terapii, brak przypomnień lekowych w rozumieniu MDCG 2019-11).

### C4. Wyniki badań nie są interpretowane klinicznie

- `observationStatus()` opisuje wartości wyłącznie względem zakresu referencyjnego („w zakresie referencyjnym", „powyżej/poniżej zakresu"), nigdy „w normie"/„poza normą".
- Relacje na mapie pacjenta mają `causality: not_asserted` — system nie twierdzi o przyczynowości.
- Weryfikacja: `tools/validate-harm-gates.js` (etykiety), `tools/validate-map-model.js` (negatywny test przyczynowości).

### C5. Dostęp opiekuna jest ograniczony zgodą i audytowany

- Modele `patient360-caregiver-model.js` + `patient360-consent-model.js`: zakresy obszarów (`areas`), statusy zgód, cofnięcie zmienia widoczność.
- Role kręgu opieki to relacje ludzi, nie funkcje systemu; asystenci to funkcje systemu (CC-01). **Current phase dopuszcza wyłącznie jedną nazwaną dorosłą osobę wspierającą.** Rodzic i opiekun prawny pozostają rolami późniejszej fazy i są BLOCKED (patrz `P360_PHASE_NOTE`).
- Weryfikacja: `tools/validate-caregiver-scope.ps1` i `tools/validate-consent-draft.ps1` + edge-case fixtures (wygasła/cofnięta zgoda, brak leakage przez komunikat).

### C6. Brak realnych danych pacjentów

- Dane wyłącznie fikcyjne/kompozytowe; trwały banner „PROTOTYP KONCEPCYJNY — DANE FIKCYJNE" w demo; `noindex,nofollow` na demo.
- Brak backendu: dane lokalne w `localStorage`, zero transmisji.
- Zakaz w `CONTRIBUTING.md` (Clinical Safety Checklist, pytanie 7).
- Weryfikacja: `tools/validate-harm-gates.js` (H-010), `tools/smoke-browser.ps1`.

### C7. AI, LLM i OCR są zablokowane przez current product boundary

- Runtime AI/LLM/OCR jest `no-go` na mocy `PRODUCT_SSOT.md` i `docs/product/PACJENT360_FOUNDER_CONTROL_PACK_V1_2026-07-10.md`. Zmiana wymaga osobnej decyzji Foundera, aktualizacji current scope manifestu i aktywnego work orderu oraz przejścia aktualnych bramek safety, privacy i security.
- `docs/governance/SAFETY_GATE_MATRIX.md` blokuje m.in. diagnozę, triage, terapię, ocenę pilności, scoring oraz ukryte wywołania zewnętrzne. Historyczne `docs/SSOT.md` i `docs/SPRINTS.md` nie są aktywną klasyfikacją ani ścieżką odblokowania.

## Czego ten Safety Case jeszcze NIE dowodzi

1. **Zrozumienia przez użytkowników** — walidacja z lekarzami i pacjentami/opiekunami (M5/M6) dopiero zmierzy, czy ktokolwiek odczytuje output jako diagnozę/triage (metryka no-go: ≥2 takie odczyty).
2. **Review klinicznego** — żadna osoba z uprawnieniami klinicznymi nie zrobiła jeszcze formalnego przeglądu copy.
3. **Parytetu UI↔eksport przy zgodach** (H-007) — test do dodania przy M7/M8.
4. **Odporności promptów** — threat model prompt injection wchodzi z A0 (M9).

## Utrzymanie

- Każdy commit: Clinical Safety Checklist (`CONTRIBUTING.md`).
- Każda publikacja: `tools/validate-go-live.ps1` (uruchamia walidatory + smoke), w tym `validate-harm-gates`.
- Każda zmiana w tym pliku wymaga przejrzenia `docs/governance/DEFINITION_OF_HARM.md` — Safety Case dowodzi blokad opisanych w DoH.
