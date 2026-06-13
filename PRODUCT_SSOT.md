# Pacjent360™ — Product SSOT

Status: nadrzędne źródło prawdy o produkcie. Obowiązuje od 2026-06-10 (ADR 0005).

Ten dokument mówi, **czym jest produkt**. Dokument `docs/SSOT.md` mówi wyłącznie, **jak wolno działać LLM i agentom operacyjnym** i jest podrzędny wobec tego pliku. Harmonogram prac prowadzi `docs/PROGRAM_PLAN.md`.

## 1. Definicja jednozdaniowa

Pacjent360™ jest warstwą kontekstu pacjenta, która pomaga pacjentowi, rodzicowi/opiekunowi i lekarzowi zobaczyć, co wiadomo, czego brakuje, co jest niepewne, co jest rozbieżne i co trzeba wyjaśnić z uprawnionym profesjonalistą medycznym.

## 2. Czym Pacjent360™ nie jest

- systemem diagnozującym;
- systemem oceny pilności;
- rekomendatorem terapii, dawkowania ani postępowania medycznego;
- zamiennikiem IKP/P1/EDM/HIS ani usługą CeZ/NFZ;
- miejscem przechowywania loginów do IKP ani kanałem scrapingu systemów państwowych;
- autonomicznym agentem opieki medycznej;
- systemem gotowym do użycia klinicznego (status: prototyp alpha, dane fikcyjne).

## 3. Kanoniczny model produktu

```text
Source -> Claim -> Event -> Episode / Encounter -> DITL Question / CareTask -> Report / View -> Audit
```

Docelowo (po walidacji i decyzjach M13+) model rozszerza się o warstwy zaufania:

```text
Identity + Authority -> Consent / Access Policy -> [model powyżej] -> Report Version -> Correction / Supersede
```

UI jest soczewką nad modelem, nie źródłem prawdy. Implementacja modelu: `public/patient360-contract.js`, `schema/patient360.schema.json`, walidatory w `tools/`.

## 4. Perspektywy użytkowników

Główny użytkownik MVP: pacjent, rodzic albo opiekun przygotowujący kontekst przed wizytą. Lekarz jest głównym odbiorcą i osobą weryfikującą raport kontekstowy. Szerszy produkt nadal obejmuje trzy perspektywy, ale walidacja wersji alfa zaczyna się od pętli przygotowania wizyty.

### Lekarz (desktop)
Szybki, źródłowy kontekst przed decyzją: „Pacjent w 90 sekund", oś czasu, leki do potwierdzenia, braki, rozbieżności i pytania DITL. Źródło zawsze obok twierdzenia. Lekarz pozostaje decydentem.

### Pacjent (mobile-first)
Przygotowanie wizyty: dokumenty, leki faktycznie przyjmowane, pytania, zgody, zadania organizacyjne po wizycie. Prosty język bez żargonu klinicznego.

### Rodzic / opiekun / osoba wspierająca (mobile-first)
Człowiek w kręgu opieki — nie agent. Ma relację z pacjentem, podstawę dostępu, zakres zgody i audyt. Rodzic dziecka lub opiekun prawny wymaga innej semantyki dostępu niż osoba wspierająca dorosłego pacjenta (macierz authority: kierunek M13).

## 5. Krąg opieki vs agenci operacyjni

```text
Krąg opieki         = ludzie: relacje, podstawa dostępu, zgody, zakres widoczności
Agenci operacyjni   = funkcje systemu: drafty, checklisty, walidacje, pytania, zadania
CareTask            = pomost między człowiekiem, źródłem i agentem
```

Nie nazywamy ludzi „opiekunem lekowym" czy „opiekunem wizyt" tam, gdzie chodzi o automatyzację. Wzorzec językowy:

> Człowiek ma dostęp do obszaru leków. System pomaga uporządkować listę. Człowiek decyduje.

Agent nigdy nie jest właścicielem decyzji, nie sprawuje opieki i nie występuje jako osoba.

## 6. DITL jako zasada architektoniczna

DITL = lekarz w procesie decyzyjnym. Każda informacja klinicznie istotna pozostaje pytaniem, kontekstem, brakiem danych, rozbieżnością albo szkicem do weryfikacji, dopóki nie oceni jej lekarz lub inny właściwy profesjonalista.

Konsekwencje techniczne:

- każdy claim ma `sourceRefs` albo jawny `source_missing`;
- pytania i flagi mają status DITL (`do wyjaśnienia` / `wyjaśnione` / `odrzucone` / `dalsza kontrola`);
- zakazane słownictwo outputu systemowego jest egzekwowane przez `FORBIDDEN_CLAIM_PHRASES` w kontrakcie i walidatory CLI;
- relacje na osi czasu mają `causality: not_asserted` — system nie twierdzi o przyczynowości;
- wyniki opisywane są względem zakresu referencyjnego, nigdy jako „w normie"/„poza normą".

Pełne zasady dla LLM/agentów: `docs/SSOT.md`.

## 7. Zasada traceability (repo ↔ strona)

Każda deklaracja na stronie publicznej musi mieć odpowiednik w repo: dokument produktowy, kontrakt danych, fixture, walidator albo milestone. Jeżeli artefakt nie istnieje, strona może opisywać funkcję wyłącznie jako `kierunek` / `w planie` / `w walidacji` — nigdy jako istniejącą.

## 8. Hierarchia dokumentów

```text
PRODUCT_SSOT.md (ten plik)
  / docs/legal/DISCLAIMER.md / SECURITY.md / docs/governance/RISKS.md  (safety — zawsze wygrywają)
    -> docs/PROGRAM_PLAN.md          (nadrzędny harmonogram M0-M12+)
      -> docs/ARCHITECTURE.md / docs/TIMELINE_VISION.md
        -> docs/ROADMAP.md / docs/SPRINTS.md
          -> docs/SSOT.md            (zakres: LLM i agenci operacyjni)
```

Przy konflikcie zakresu LLM/agentów rozstrzyga `docs/SSOT.md` w ramach granic tego pliku. Przy konflikcie harmonogramów rozstrzyga `docs/PROGRAM_PLAN.md`.

## 9. No-go produktu

- realne dane pacjentów w demo, fixtures, promptach lub walidacji publicznej;
- output brzmiący jak diagnoza, ocena pilności albo zalecenie;
- agent występujący jako osoba sprawująca opiekę;
- dostęp poza zakresem zgody (w UI, eksporcie, raporcie lub komunikacie błędu);
- claim bez źródła prezentowany jak fakt;
- scraping IKP/P1 albo przechowywanie loginów;
- deklaracja funkcji na stronie bez artefaktu w repo.

## 10. Status wdrożenia (2026-06-10)

Prototyp alpha v0.2.x: statyczny SPA (`public/`), dane fikcyjne w `localStorage`, Data Contract v0.1 (`schemaVersion: 7`), modele mapy/pre-visit/kręgu opieki/zgód z walidatorami i fixtures. Publiczne repo: GitHub `sebkabyte/Pacjent360`. Domena w przygotowaniu. Walidacja z lekarzami i pacjentami/opiekunami: przed nami (M5/M6). LLM/agenci: no-go do zamknięcia A0 (kontrakty, walidator, dry-run, audyt).
