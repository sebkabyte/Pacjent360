# ADR 0006: Timeline lanes jako warstwa prezentacji

Data: 2026-06-11

Status: PROPOSED

## Kontekst

Mapa Pacjenta 360 ma pokazac historie pacjenta od ogolu do szczegolu. Kontrakt danych v0.1 ma 9 trackow timeline, ktore sa dobre dla modelu i walidatorow, ale w UI sa zbyt drobne jako glowna os narracyjna.

W redesignie v0.3 dodano 6 lane'ow prezentacyjnych nad istniejacymi trackami. Nie zmieniono kontraktu danych ani `patient360-map-model.js`.

## Mapowanie

| Track kontraktu | Lane prezentacyjny |
|---|---|
| `konsultacje` | Kontakty z opieka |
| `hospitalizacje` | Kontakty z opieka |
| `objawy` | Objawy i funkcjonowanie |
| `funkcjonowanie` | Objawy i funkcjonowanie |
| `badania` | Badania i wyniki |
| `leki` | Leki |
| `decyzje medyczne` | Ustalenia i plan |
| `obserwacje z wywiadu` | Zrodla i wywiad |
| `kontekst medyczny` | Zrodla i wywiad |

## Opcje

### Wariant A: lane'y tylko w prezentacji

`PRESENTATION_LANES` zyje w `public/patient360-map-view.js`. Model i kontrakt nadal uzywaja 9 trackow.

Zalety:

- brak migracji danych,
- brak zmiany snapshotow p1/p2,
- mniejsze ryzyko regresji w walidatorach,
- mozna szybko walidowac UI z lekarzem, pacjentem i opiekunem.

Wady:

- inne slownictwo w kontrakcie i UI,
- przyszle raporty moga potrzebowac mapowania lane -> track.

### Wariant B: lane'y jako czesc kontraktu

Kontrakt danych dostaje osobne pole `lane` albo migruje tracki do 6 lane'ow.

Zalety:

- prostsze API dla przyszlych klientow,
- jedna semantyka dla UI i danych.

Wady:

- wymaga migracji danych i snapshotow,
- zmienia publiczny kontrakt,
- moze ukryc precyzje obecnych trackow.

## Rekomendacja

Przyjac wariant A na etap alpha. Lane'y maja byc jezykiem prezentacji, a tracki zostaja jezykiem danych.

Wariant B wrocic do decyzji dopiero po walidacji z uzytkownikami i po zebraniu dowodow, ze 6 lane'ow jest stabilniejszym modelem mentalnym niz 9 trackow.

## Konsekwencje

- `patient360-contract.js` pozostaje bez zmian.
- `patient360-map-model.js` pozostaje bez zmian.
- `patient360-map-view.js` odpowiada za mapowanie track -> lane.
- Walidatory testuja tracki kontraktu oraz rendering lane'ow przez browser smoke.
- Decyzja autora: do potwierdzenia po walidacji mapy v0.3.
