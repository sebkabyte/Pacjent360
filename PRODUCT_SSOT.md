# Pacjent360 - Product SSOT

Status: **ACTIVE AND RATIFIED**
Ratyfikacja: Founder, 2026-07-10
Podstawa: ADR 0008 i Founder Control Pack v1
Zakres zmian: D1-D5 wymagają RFC Level C oraz wpisu w Decision Logu

<!-- P360_CURRENT_SCOPE_V1
contract_id=FCV1-D1-D8-2026-07-10
current_sprint=S0
gate=G0_PENDING
primary_user=competent_adult_patient
support_user=one_named_adult_supporter
wedge=one_planned_visit
data=synthetic_only
doctor=later_read_only_recipient
children_guardians=blocked
runtime_ai_ocr_cdss=blocked
backend=blocked
public_launch=blocked_2026_2027
-->

## 1. Definicja produktu

Pacjent360 jest **Sekretariatem Kontekstu Zdrowotnego**. Prowadzi źródłową historię, pozwala ręcznie wybrać informacje do jednej planowanej wizyty, zapisać maksymalnie trzy pytania i utworzyć wersjonowany Pakiet wizyty.

Produkt nie odpowiada na pytanie "co mi jest?". Pomaga odpowiedzieć na pytanie "co chcę zabrać i omówić podczas wizyty oraz skąd pochodzi ta informacja?".

## 2. Pierwszy wedge

Jedyny current wedge:

> kompetentny dorosły pacjent + jedna nazwana dorosła osoba wspierająca + jedna planowana wizyta.

Główny case badawczy: dorosłe dziecko pomaga starszemu rodzicowi przygotować wizytę przy jawnym, ograniczonym zakresie pomocy. Określenie "osoba wspierająca" nie oznacza opiekuna prawnego ani automatycznego upoważnienia medycznego.

## 3. Current phase

Aktywny jest wyłącznie Sprint 0 - Governance Freeze, do bramki G0 24.07.2026.

Current phase obejmuje tylko:

- porządkowanie kanonu produktu i governance;
- dane syntetyczne;
- historię źródłową jako rdzeń przyszłej Alphy;
- ręczne przygotowanie jednej wizyty;
- pacjenta oraz jedną nazwaną dorosłą osobę wspierającą.

S1-P7 są warunkowe. Nie są aktywnym backlogiem ani zgodą na implementację.

## 4. Model produktu

Docelowa sekwencja informacyjna narrow Core:

```text
SourceRecord
-> typed record
-> HistoryItem projection
-> manual VisitDraft selection
-> immutable VisitPacket
-> optional post-visit organizational write-back
```

Zasady:

- źródło jest prawdą; historia jest projekcją;
- każdy element ma osobę, autora, źródło/status oraz datę albo jawne `unknown`;
- Pakiet wizyty zawiera wyłącznie ręcznie wybrane elementy;
- pytania pochodzą od pacjenta lub osoby wspierającej, maksymalnie trzy;
- zmiana pakietu tworzy nową wersję;
- system nie tworzy klinicznego rankingu, kompletności ani wniosku.

## 5. Role

### Pacjent

Właściciel własnego kontekstu i osoba wybierająca informacje do wizyty.

### Nazwana dorosła osoba wspierająca

Pomaga w jawnym zakresie. Każdy jej wpis zachowuje autorstwo. Current Alpha nie udaje prawnej delegacji ani produkcyjnego mechanizmu dostępu.

### Lekarz

Nie jest current product ani użytkownikiem v1. Może być późniejszym odbiorcą ręcznie wybranego, read-only pakietu. Najpierw należy sprawdzić PDF/print. Osobny Doctor Context wymaga późniejszego dowodu i bramki.

### AI/Codex/Founder OS

Mogą przygotowywać analizę, kod, testy i drafty dokumentów. Nie mogą podpisywać opinii prawnej, DPIA, medical-safety acceptance, security acceptance, pentestu ani human-owned gate.

## 6. Granica danych

Do formalnego Real-Data Gate obowiązuje:

- synthetic-only;
- moderowane badania;
- brak binarnych dokumentów;
- brak OCR, LLM, RAG, embeddings i integracji;
- brak kont lekarzy;
- brak publicznego self-service;
- brak produkcyjnego backendu i auth.

## 7. Czym produkt nie jest

Pacjent360 nie jest:

- EHR ani oficjalną dokumentacją medyczną;
- AI-lekarzem;
- CDSS;
- systemem diagnozy, triage lub oceny pilności;
- narzędziem interpretacji wyników;
- systemem rekomendacji leczenia;
- systemem wykrywania interakcji lub konfliktów lekowych;
- usługą IKP/P1/CeZ/NFZ;
- wyrobem medycznym deklarowanym bez formalnej klasyfikacji.

## 8. Hipoteza rynku

- Hipoteza użytkowa 2026: B2C dla synthetic research.
- Hipoteza komercyjna 2026: równoległe discovery B2B2C.
- Decyzja biznesowa i tenancy: po G2/Expert Gate.
- Bezpieczny kierunek danych do oceny: patient vault; organizacja nie staje się automatycznie właścicielem całej historii.

## 9. Hierarchia prawdy

```text
PRODUCT_SSOT.md + dokumenty safety
-> FIRST_WEDGE.md
-> zatwierdzone ADR-y + DECISION_LOG.md
-> ROADMAP_2026_2027.md
-> EXECUTION_PLAN_2026_2027.md
-> jeden aktywny work order
-> evidence
```

`docs/PROGRAM_PLAN.md` i `docs/ROADMAP.md` są aktywnymi widokami tej samej ratyfikowanej struktury. Founder Control Pack jest skrótem zarządczym, nie drugim Product SSOT. `docs/product-delivery/`, starsze sprinty, blueprints, TEMP i raporty są `REFERENCE_ONLY`, chyba że ADR wyraźnie przywróci konkretny element.

## 10. Current state

Repo zawiera statyczny prototyp i liczne historyczne moduły. Nie dowodzi to current scope ani gotowości produkcyjnej. Do zamknięcia G0 nie wolno rozpoczynać nowego patcha UI, backendu, AI, doctor workflow ani release.

Stan bramki: `G0_PENDING`.
