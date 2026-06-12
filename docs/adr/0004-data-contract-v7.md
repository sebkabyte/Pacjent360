# ADR 0004: Data Contract v0.1 i migracja eksportu v6 -> v7

Status: zaakceptowany

Data: 2026-06-08

## Kontekst

MVP Pacjent 360 działa jako statyczna aplikacja lokalna. Stan demo jest przechowywany w `localStorage` pod kluczem `pacjent360-state-v7` i nadal używa płaskich tablic w `app.js`, takich jak `documents[]`, `interviews[]`, `timelineEvents[]`, `medications[]`, `flags[]`, `knownUnknowns[]` i `audit[]`.

Plan programu wymaga jednak stabilnego kontraktu eksportu, zanim projekt zacznie rozwijać Mapę Pacjenta 360, walidację raportu, zgody opiekuna i asystentów operacyjnych.

## Decyzja

Nie migrujemy jeszcze całego runtime MVP z `v6` na nową strukturę. Zamiast tego dodajemy warstwę kompatybilności przy eksporcie JSON:

```text
localStorage v6 / app.js flat arrays
  -> buildDataContractExport()
    -> schemaVersion: 7 / contractVersion: 0.1
```

Eksport v7 zawiera:

- `sources[]` - jawny rejestr źródeł z refami typu `doc:d1`, `interview:i1`, `transcript:i1`, `observation:o1`, `medication:m1`, `flag:f1`, `decision:dc1`, `report:rep1`, `consent:g1`,
- `claims[]` - twierdzenia, pytania DITL, flagi, elementy raportu i projekcje zdarzeń,
- `timelineEvents[]` - zdarzenia z `claimRefs`, `sourceRefs` i `schemaStatus`,
- `timelineEpisodes[]` - epizody z `eventRefs`,
- `timelineRelations[]` - neutralne powiązania bez przyczynowości,
- `consentScopes[]` - demonstracyjne zakresy zgód z `consent:{id}` jako lokalnym artefaktem zgody i dodatkowymi źródłami kontekstu,
- `audit[]` - lokalny ślad audytu z `actionType`,
- `sourceQuality` - metryka liczby źródeł, claims i `source_missing`,
- `domainData` - dotychczasowe dane domenowe dla kompatybilności.

## Reguły Migracji

1. `documents[]`, `interviews[]`, `observations[]`, `medications[]`, `flags[]`, `decisionContexts[]`, `reports[]` i `consents[]` są mapowane do `sources[]`.
2. `knownUnknowns[]`, `flags[]`, `decisionContexts[].ditlQuestions[]`, `timelineEvents[]` i `reports[]` są mapowane do `claims[]`.
3. `timelineEvents[]` pozostają główną projekcją osi czasu, ale dostają `claimRefs` i `schemaStatus`.
4. `timelineEpisodes[]` dostają `eventRefs` wyliczone z `timelineEvents[].episodeId`.
5. `timelineRelations[]` dostają `causality: not_asserted`.
6. Brak źródła jest oznaczany jawnie jako `source_missing`; jest to metryka jakości, nie automatyczny błąd P0.
7. `sourceRef` musi mieć zgodny prefix i typ źródła, np. `doc:* -> document`, `decision:* -> decisionContext`, `consent:* -> consent`.
8. `consentScopes[].sourceRefs` zawiera `consent:{id}` oraz, gdy są dostępne, kontekstowe źródła udostępnienia; `consent:{id}` nie oznacza realnego podpisu ani integracji z CeZ/NFZ/IKP.
9. Eksport nie może zawierać starych publicznych fraz typu `HITL`, `AI lekarz`, `Raport decyzyjny` ani `one-pager`.

## Walidacja

Każda zmiana danych demo, eksportu lub kontraktu musi przejść:

```powershell
powershell -ExecutionPolicy Bypass -File tools\validate-data-contract.ps1
```

Walidator sprawdza:

- `schemaVersion: 7` i `contractVersion: 0.1`,
- wymagane tablice kontraktu,
- unikalność ID,
- zgodność `patientId` z eksportowanym pacjentem,
- source coverage dla `claims`, `timelineEvents`, `timelineEpisodes`, `timelineRelations`, `consentScopes` i `domainData`,
- zgodność prefixu `sourceRef` z typem źródła,
- enumy claimów, statusów, tracków, relacji, zgód i audytu,
- brak przyczynowości w relacjach timeline,
- brak zakazanych fraz w `claim.text`.

## Konsekwencje

- Runtime pozostaje prosty i lokalny, ale eksport staje się stabilnym kontraktem do dalszej pracy.
- Refaktor `app.js` na moduły `state/renderers/validators/fixtures` jest nadal osobnym etapem M3/M7.
- Przyszłe asystenty operacyjne i walidacje nie powinny czytać surowych tablic `v6` bezpośrednio; powinny pracować na kontrakcie v7 albo na jego następcach.
- Publiczne repo może pokazać Data Contract jako dowód, że projekt ma kontrolowaną granicę między źródłem, claimem, zdarzeniem, epizodem i raportem.
