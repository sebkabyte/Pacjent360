# Founder Attestation: D1-D8 Founder Control Pack v1

<!-- P360_PHASE_NOTE
Wzmianki o dzieciach i opiekunach prawnych w tym dokumencie opisuja role ZABLOKOWANE
w current phase. Current scope: kompetentny doroslty pacjent + jedna nazwana dorosla
osoba wspierajaca + jedna planowana wizyta; lekarz = pozniejszy odbiorca read-only.
Zrodlo prawdy: docs/governance/CURRENT_SCOPE_MANIFEST.json.
-->

Attestation ID: `P360-ATT-D1-D8-20260710-001`
Signer ID: `P360-FOUNDER-SEBASTIAN-KALISZ-01`
Signer: Sebastian Kalisz
Role: Founder / Product accountable
Declared on: 2026-07-10
Recorded at: 2026-07-10T13:05:23+02:00
Contract ID: `FCV1-D1-D8-2026-07-10`
Status: **RATIFIED; G0 REMAINS A SEPARATE FOUNDER GATE**

## Attested statement

> Ratyfikuję decyzje D1-D8 Founder Control Pack v1 z 10.07.2026, aktywuję wyłącznie Sprint 0 do bramki G0 24.07.2026 i utrzymuję wszystkie późniejsze fazy jako warunkowe do czasu wymaganych dowodów oraz ludzkich podpisów.

Źródłem deklaracji jest bezpośrednie polecenie Foundera w zadaniu Codex dotyczącym repozytorium Pacjent360. Niniejszy rekord utrwala tę deklarację wraz z jednoznacznym identyfikatorem, czasem zapisu i hashami ratyfikowanych artefaktów.

## Ratified artifact hashes

| Path | SHA-256 |
|---|---|
| `PRODUCT_SSOT.md` | `C0FA979F5F2F95BCA629DE964FE50E5A972AEAC123E7EBA8DF5C16DD92EFF9EF` |
| `docs/product/PACJENT360_FOUNDER_CONTROL_PACK_V1_2026-07-10.md` | `E6684440FE4E18ACAEC535C345A888305B730E6B88856D2D4A67E883B50FF116` |
| `docs/product/WO_P360_S0_GOVERNANCE_FREEZE_2026-07-10.md` | `9BBE373DB4B074305EFCEBCBD56BA4AE0DB236D2CE52083334E742D9AA602D02` |

## Scope effect

Ratyfikacja zamraża:

1. kompetentnego dorosłego pacjenta jako primary user;
2. jedną nazwaną dorosłą osobę wspierającą;
3. jedną planowaną wizytę jako current wedge;
4. dane syntetyczne jako jedyny dopuszczony tryb;
5. lekarza jako późniejszego odbiorcę read-only, nie current product;
6. AI/LLM/OCR/CDSS, dzieci/guardian, backend i public launch jako blocked;
7. B2C jako hipotezę użytkową 2026, przy równoległym commercial discovery B2B2C;
8. wyłącznie Sprint 0 do osobnego G0.

## Verification

```powershell
Get-FileHash -Algorithm SHA256 PRODUCT_SSOT.md
Get-FileHash -Algorithm SHA256 docs/product/PACJENT360_FOUNDER_CONTROL_PACK_V1_2026-07-10.md
Get-FileHash -Algorithm SHA256 docs/product/WO_P360_S0_GOVERNANCE_FREEZE_2026-07-10.md
node tools/validate-current-scope.mjs
```

Ten rekord jest repozytoryjnym attestation governance. Nie jest kwalifikowanym podpisem elektronicznym, opinią prawną ani podpisem G0. G0 wymaga osobnego read-only review technicznego i późniejszej, odrębnej decyzji Sebastiana Kalisza jako Foundera.

## Reviewer separation addendum

Founder Sebastian Kalisz zdecydował 2026-07-10, że nie pełni roli reviewera własnej bramki. Role dla S0 są rozdzielone następująco:

- Codex wykonuje korekty techniczne;
- `GPT 5.6 SOL` jest wskazanym przez Foundera osobnym reviewerem technicznym działającym read-only na finalnym SHA;
- Sebastian Kalisz pozostaje jedyną osobą uprawnioną do późniejszej decyzji G0.

Werdykt reviewera technicznego nie jest podpisem G0. Ten addendum nie zmienia decyzji D1-D8 ani granic produktu.

Founder Sebastian Kalisz autoryzował 2026-07-10 odświeżenie hashy Control Pack i WO po tej korekcie governance. Zmiana dotyczy rozdziału ról i uprawnień Git; treść decyzji D1-D8 pozostała bez zmian.
