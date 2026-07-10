# Pierwszy wedge Pacjent360

Status: **ACTIVE AND RATIFIED**
Ratyfikacja: Founder, 2026-07-10
Podstawa: D2 Founder Control Pack v1 i ADR 0008

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

## Decyzja

Pierwszy i jedyny current wedge:

> **kompetentny dorosły pacjent + jedna nazwana dorosła osoba wspierająca + jedna planowana wizyta.**

Główny case badawczy: dorosłe dziecko pomaga starszemu rodzicowi przygotować wizytę. Pacjent pozostaje dorosłym właścicielem własnego kontekstu, a osoba wspierająca działa wyłącznie w jawnym, ograniczonym zakresie.

## Praca użytkownika

```text
1. Pacjent albo nazwana osoba wspierająca przegląda źródłową historię.
2. Wskazuje jedną planowaną wizytę i jej cel rozmowy.
3. Ręcznie wybiera elementy, które chce zabrać.
4. Zapisuje maksymalnie trzy własne pytania.
5. System tworzy wersjonowany Pakiet wizyty bez wniosków klinicznych.
6. Po wizycie użytkownik może zapisać własną notatkę lub zadanie organizacyjne jako nowy wpis źródłowy.
```

## Minimalny model informacji

Każdy element ma:

- osobę, której dotyczy;
- autora;
- źródło albo jawne `source_missing`;
- status;
- datę albo jawne `unknown`;
- zakres widoczności;
- stabilne ID użyte w Pakiecie wizyty.

## Granica badania

Do formalnego Real-Data Gate:

- wyłącznie dane syntetyczne;
- wyłącznie moderowane sesje;
- dokument jest co najwyżej metadanym fikcyjnego źródła;
- brak binary upload, OCR, LLM, RAG i integracji;
- brak kont lekarzy;
- brak produkcyjnej delegacji i auth;
- brak publicznego self-service.

## Lekarz

Lekarz nie jest current user ani drugim końcem current wedge. Może być późniejszym odbiorcą ręcznie wybranego PDF/print. Osobny Doctor Context jest warunkową hipotezą po dowodzie, nie częścią S0 ani Alphy v1.

## Kryteria Evidence Gate

Do G2 należy zebrać na jednym wersjonowanym bodźcu:

- co najmniej 10/15 ukończonych pakietów bez pomocy w maks. 8 minut;
- zero pomyłki osoby lub zakresu;
- zero odczytania systemu jako porady, triage lub interpretacji;
- 100% elementów pakietu z autorem, źródłem/statusem i datą/unknown;
- co najmniej 70% ocen użyteczności 4/5+;
- co najmniej 8/15 potwierdzeń powtarzalnego problemu organizacyjnego.

Metryki są heurystyką decyzji `continue/narrow/pivot/stop`, nie dowodem PMF ani walidacją kliniczną.

## No-go

- lekarz jako current primary user;
- dziecko, rodzic działający z mocy prawa albo guardian baseline;
- AI/OCR/CDSS w current phase;
- automatyczny wybór, ranking, scoring, kompletność kliniczna lub zalecenie;
- realne dane przed właściwą bramką;
- zmiana wedge bez RFC Level C i aktualizacji Decision Logu.
