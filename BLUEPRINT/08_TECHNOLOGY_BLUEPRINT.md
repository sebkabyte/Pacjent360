# Technology Blueprint

## Cel dokumentu

Ustalić technologię etapami, bez projektowania dużego backendu przed walidacją.

## Obecny stan

Pacjent360 jest statycznym prototypem alpha:

- repo GitHub jako baza pracy;
- `public/` ze stroną i demo;
- fikcyjne dane;
- `localStorage`;
- schema i fixtures;
- walidatory;
- smoke testy;
- brak backendu;
- brak realnych danych;
- brak runtime LLM.

## Etap teraz

| Obszar | Status |
|---|---|
| Strona WWW | publiczna, wymaga stałego claim review |
| Demo | living prototype, wymaga prostoty i reaktywności |
| Data contract | istnieje vertical slice |
| Fixtures | istnieją, tylko dane fikcyjne |
| Walidatory | istnieją i trzeba je utrzymać |
| Repo hygiene | stale ważne |
| Backend | nie teraz |

## MVP techniczny

Najbliższy MVP techniczny powinien oznaczać:

- prostszy frontend;
- spójny Product SSOT;
- jasny podział strony, demo i dokumentacji;
- testy klików i reaktywności;
- historia pacjenta czytelna w 10-90 sekund;
- macierz widoczności roli;
- brak realnych danych;
- pełne claim-to-repo traceability.

## Później: backend-ready contracts

Zanim powstanie backend, muszą istnieć:

- stabilne modele: Source, Claim, Event, Episode, Encounter, Consent, CareTask;
- statusy źródeł i pewności;
- macierz zgód;
- eksport/import demo;
- testy parytetu UI ↔ dane;
- safety validator dla outputów agentów.

## Jeszcze później: backend

Backend ma sens dopiero po walidacji, gdy wiemy:

- kto jest użytkownikiem;
- kto płaci;
- jakie dane są naprawdę potrzebne;
- jaki jest minimalny model zgód;
- jaki jest model przechowywania;
- jaki jest wymóg audytu.

Backend będzie wymagał:

- auth;
- consent;
- audit log;
- storage;
- privacy/security review;
- incident response;
- data retention;
- export/delete flows.

## Znacznie później: integracje

Integracje są horyzontem:

- FHIR/IPS mapping;
- oficjalne ścieżki IKP/P1;
- brak scrapingu;
- brak przechowywania cudzych loginów;
- adapter boundary;
- partnerzy instytucjonalni.

## Co zostaje w obecnym repo

- statyczna strona;
- demo alpha;
- schema;
- fixtures;
- validators;
- docs;
- BLUEPRINT;
- release tooling;
- public demo data.

## Co warto przebudować kontrolowanie

- `public/app.js` jako monolit;
- renderer historii pacjenta;
- macierz widoczności per rola;
- public copy claim registry;
- testy klików strony i demo;
- podstrony, jeśli mają claimy bez pokrycia.

## Czego nie ruszać bez potrzeby

- data contract v7;
- frozen enums;
- `source_missing`;
- zasady DoH;
- privacy/disclaimer bez review;
- release gates;
- brak realnych danych.

## Czy frontend powinien być uproszczony

Tak, ale etapowo. Nie przepisywać od zera przed walidacją. Najpierw:

1. uprościć główną ścieżkę demo;
2. ograniczyć techniczne widoki w głównym UI;
3. oddzielić renderery;
4. dopiero potem rozważyć framework.

## Czy Historia / Mapa wymaga przebudowy

Tak, ale jako kontrolowany moduł. Historia pacjenta jest sercem produktu, więc musi być:

- pionowa;
- czytelna;
- źródłowa;
- z progresywnym ujawnianiem szczegółów;
- bez nadmiaru chipów, zoomów i technicznych torów.

## Czy backend teraz

Nie. Backend teraz zwiększy koszt i ryzyko przed dowodem wartości. Najpierw walidacja, potem contracts, potem backend.

## DoD

- Technologia wspiera pierwszy wedge.
- Backend jest świadomie odroczony.
- Wiadomo, co refaktorować i czego nie ruszać.
- Integracje są horyzontem, nie planem sprintu.

## DoE

- Walidatory przechodzą.
- Repo nie zawiera realnych danych.
- Publiczne claimy mają artefakty.
- Każda propozycja backendu wskazuje konkretny dowód walidacyjny.

## FoR

Review technologii ma sprawdzać, czy złożoność jest proporcjonalna do dowodu wartości.
