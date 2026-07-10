# Pacjent360 — Founder Control Pack v1

**Data:** 2026-07-10
**Status:** RATIFIED BY FOUNDER - D1-D8 ACTIVE
**Ratyfikacja:** 2026-07-10; aktywny wyłącznie Sprint 0 do bramki G0 24.07.2026
**Ratyfikujący:** Sebastian Kalisz (`P360-FOUNDER-SEBASTIAN-KALISZ-01`)
**Attestation ID:** `P360-ATT-D1-D8-20260710-001`; rekord: `docs/governance/FOUNDER_ATTESTATION_D1_D8_2026-07-10.md`
**Charakter:** skonsolidowana decyzja produktowo-programowa; nie jest opinią prawną, medyczną ani niezależnym audytem bezpieczeństwa
**Źródła:** `FOUNDER_DECISION_PACK_2026-07-10.md`, `ROADMAP_2026_2027.md`, `EXECUTION_PLAN_2026_2027.md`

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

---

## 1. Werdykt po przeczytaniu trzech raportów

Trzy raporty dochodzą do tego samego rdzenia:

> **Pacjent360 ma najpierw pomóc kompetentnemu dorosłemu pacjentowi i jednej nazwanej dorosłej osobie wspierającej przygotować jedną planowaną wizytę z ręcznie wybranych, źródłowych informacji — bez interpretacji klinicznej.**

Najbliższym celem nie jest publiczne MVP, backend ani konto lekarza. Najbliższym celem jest zdobycie prawa do bezpiecznego, moderowanego testu Alphy na danych syntetycznych, a następnie zdobycie dowodu, że problem jest rzeczywisty i powtarzalny.

### Decyzja ogólna

| Obszar | Decyzja |
|---|---|
| Alpha na danych syntetycznych | **CONDITIONAL GO po G1** |
| Demo poza zespołem przed G1 | **NO-GO** |
| Publiczny showcase | **HOLD; możliwy dopiero po G1 i tylko bez realnych danych/persistencji** |
| Backend produkcyjny | **NO-GO przed G2 i formalnym G3** |
| Przetwarzanie realnych danych zdrowotnych | **NO-GO przed G5/G6** |
| Lekarz jako użytkownik produktu v1 | **NO-GO** |
| AI/LLM/OCR/RAG/embeddings | **NO-GO w bazowej roadmapie 2026–2027** |
| Publiczny launch | **nie jest planowany w 2026–2027** |

---

## 2. Decyzje ratyfikowane przez Foundera

### D1. Definicja produktu

Pacjent360 jest **Sekretariatem Kontekstu Zdrowotnego**: prowadzi historię źródłową, pozwala wybrać informacje do jednej wizyty, zapisać maksymalnie trzy pytania i utworzyć wersjonowany pakiet wizyty.

Nie jest EHR-em, oficjalną dokumentacją medyczną, AI-lekarzem, systemem kompletności klinicznej ani CDSS.

### D2. Pierwszy wedge

Pierwszy scenariusz to:

> **kompetentny dorosły pacjent + jedna nazwana dorosła osoba wspierająca + jedna planowana wizyta.**

Główny case badawczy: dorosłe dziecko pomaga starszemu rodzicowi przygotować wizytę, przy jawnym zakresie pomocy. W pierwszej fazie używamy określenia **„osoba wspierająca”**, a nie „opiekun prawny”, ponieważ produkt nie potwierdza umocowania prawnego.

### D3. Granica Alphy

Do formalnego Real-Data Gate:

- wyłącznie dane syntetyczne;
- wyłącznie moderowane sesje;
- brak binarnych dokumentów, OCR, LLM i integracji;
- brak kont lekarzy;
- brak clinical scoring, alertów, priorytetów, interpretacji i automatycznych zaleceń;
- brak twierdzenia, że pakiet jest kompletny klinicznie.

### D4. Rola lekarza

Lekarz nie jest produktem v1. Jest późniejszym odbiorcą ręcznie wybranego, read-only pakietu. Najpierw należy sprawdzić, czy PDF/print rozwiązuje problem. Osobny Doctor Context View powstaje tylko wtedy, gdy dowód wykaże, że sam pakiet jest niewystarczający.

### D5. B2C versus B2B2C — rozwiązanie

Nie należy dziś wymuszać jednej odpowiedzi na dwa różne pytania.

- **Hipoteza użytkowa 2026:** B2C — pacjent/osoba wspierająca korzysta bezpośrednio z produktu podczas badań syntetycznych.
- **Hipoteza komercyjna 2026:** równoległe discovery B2B2C z placówkami, organizacjami senioralnymi lub innym przyszłym kanałem.
- **Decyzja biznesowa i tenancy:** po G2/Expert Gate, najpóźniej 06.11.2026.
- **Bezpieczny domyślny model danych:** patient vault; organizacja nie staje się automatycznie właścicielem całej historii pacjenta.

To pozwala sprawdzić zachowanie użytkownika bez przedwczesnego zabetonowania modelu sprzedaży i ról RODO.

### D6. Model zespołu

Do Evidence Gate obowiązuje:

> **solo founder + AI/Codex/Founder OS + fractional human reviewers.**

Pełny mały zespół 3–5 osób jest uruchamiany dopiero po:

1. zamknięciu G2 wynikiem `continue` lub `narrow`;
2. potwierdzeniu finansowania i obsady;
3. nazwaniu niezależnych właścicieli QA, security, privacy/legal i medical safety.

AI może przygotowywać analizę, kod, testy i dokumenty, ale nie może podpisać opinii prawnej, DPIA, clinical-safety acceptance, security acceptance ani niezależnego pentestu.

### D7. Znaczenie dat

Daty są **datami bramek**, nie obietnicami wydania funkcji. Brak dowodu lub otwarty P0 przesuwa datę; granica bezpieczeństwa nie jest negocjowana kalendarzem.

### D8. Hierarchia prawdy w repo

Po ratyfikacji:

1. `PRODUCT_SSOT.md` oraz `docs/product/FIRST_WEDGE.md` — definicja produktu i pierwszego wedge’a;
2. `docs/governance/DECISION_LOG.md` oraz zatwierdzone ADR-y — decyzje i ich historia;
3. `docs/product/ROADMAP_2026_2027.md` — bramki, daty i program;
4. `docs/product/EXECUTION_PLAN_2026_2027.md` — aktywowane sprinty i work ordery;
5. Founder Control Pack — warstwa zarządcza i skrót, nie drugi Product SSOT;
6. starsze plany doctor-first, AI-first, child/guardian-first i backend-first — `SUPERSEDED` albo `REFERENCE_ONLY`.

`docs/product-delivery/` nie może pozostawać ukrytym, ignorowanym przez Git równoległym backlogiem.

---

## 3. Rozstrzygnięte sprzeczności pomiędzy raportami

### 3.1 „Opiekun” kontra „osoba wspierająca”

W Alpha i pierwszym pilocie modelujemy tylko kompetentnego dorosłego pacjenta i nazwaną dorosłą osobę wspierającą. Dzieci, opiekun prawny, utrata zdolności i spory rodzinne pozostają poza zakresem do osobnej opinii i architektury.

### 3.2 B2C kontra B2B2C

B2C służy do sprawdzenia produktu i zachowania użytkownika. B2B2C jest równoległą hipotezą kanału i płatnika. Ostateczna decyzja zapada po Evidence/Expert Gate, nie przed pierwszym testem.

### 3.3 „Jeden kanoniczny model” we wrześniu kontra ponowna decyzja w P7

- S3 tworzy **kanoniczny kontrakt prototypu syntetycznego**.
- P7-02 zatwierdza **kanoniczny kontrakt produkcyjny i granice tenancy** po zebraniu dowodu i opinii.

To nie są dwa równoległe modele, lecz dwie bramki dojrzałości tego samego modelu.

### 3.4 Demo rodzinne kontra Evidence Gate

Demo rodzinne do 28.08 jest filtrem podstawowej zrozumiałości. Nie otwiera backendu. Evidence Gate 09.10 opiera się na całej zamrożonej rundzie badań i dopiero on może otworzyć formalne projektowanie następnego etapu.

### 3.5 Publiczny showcase kontra moderowana Alpha

Publiczny showcase nie jest potrzebny do walidacji pierwszego wedge’a. Może powstać dopiero po G1, jako read-only/fixture-only artefakt bez trwałego zapisu danych użytkownika i po udowodnieniu source-build-runtime parity.

### 3.6 Roadmapa kontra backlog

Roadmapa zawiera warunkowy program do końca 2027. **Aktywnym backlogiem jest wyłącznie obecnie zatwierdzony sprint.** Dzisiaj jest nim Sprint 0. P7 nie jest bieżącym backlogiem ani zgodą na budowę backendu.

---

## 4. Roadmapa jako system zdobywania prawa do następnego kroku

| Bramka | Data realistyczna | Co musi być dowiedzione | Jakie prawo daje GO |
|---|---:|---|---|
| **G0 Scope** | 24.07.2026 | jeden wedge, SSOT, RACI, superseded docs | prawo do rozpoczęcia S1 |
| **G1 Alpha Safety** | 07.08.2026 | zero P0, fixture-only, hard-disable, czysty runtime/reset | prawo do moderowanych sesji syntetycznych |
| **Founder/Family Demo** | 28.08.2026 | podstawowa zrozumiałość; zero pomyłki osoby i advice misread | prawo do kontynuacji researchu, nie do backendu |
| **G2 Evidence** | 09.10.2026 | użyteczność, powtarzalny problem, zero safety/scope misread | `continue/narrow/pivot/stop`; ewentualne otwarcie formalnego designu |
| **Expert Gate** | 06.11.2026 | niezależna ocena pakietu i wybór kanału/modelu | prawo do finalizacji modelu produkcyjnego |
| **G3 Real-Data Build** | 18.12.2026 | legal/privacy/security mema, DPIA draft, delegation i capacity | prawo do budowy backendu **synthetic-first** |
| **G4 Secure Staging** | 30.06.2027 | identity, vault isolation, policy, audit, lifecycle i drills | prawo do niezależnego assurance/pentestu |
| **G5 Real-Data Readiness** | 15.08.2027 | retest, zero Critical/High, finalne dokumenty i operacje | prawo do przygotowania wejścia pilota |
| **G6 Pilot Entry** | 15.09.2027 | podpisany charter, partner, operatorzy, support i dry run | prawo do ograniczonego closed pilot |
| **G7 Pilot Checkpoint** | 31.10.2027 | brak disclosure/advice/incydentów; użyteczność | prawo do dokończenia pilota bez rozszerzania scope |
| **G8 Pilot Exit** | 15.12.2027 | closeout, deletion/DSAR, metryki i incydenty | prawo do decyzji o dalszym kierunku |
| **G9 MVP Decision** | 22.12.2027 | wszystkie human sign-offs i wymagany soak | decyzja 2028; nie automatyczny public launch |

### Rebase zdolności

- Do 14.08.2026: fractional ownerzy muszą być przynajmniej zarezerwowani.
- Do 30.11.2026: finansowanie i kluczowa obsada małego zespołu muszą być realne.
- Brak capacity automatycznie przesuwa real-data pilot na 2028.

---

## 5. Aktywny plan: Sprint 0 — Governance Freeze

**Daty:** 10–24.07.2026
**Status:** ACTIVE; jedyny aktywny sprint do G0
**Cel:** jedna aktywna prawda o produkcie, zanim powstanie kolejny patch UI lub architektury.

### Zakres

- ratyfikacja D1–D8;
- aktualizacja Product SSOT, First Wedge i Decision Log;
- mapa `ACTIVE / SUPERSEDED / REFERENCE_ONLY`;
- rozstrzygnięcie statusu ignorowanego `docs/product-delivery/`;
- Owner/RACI Matrix;
- Definition of Ready/Done;
- scope validator z testem pozytywnym i kontrolowaną negatywną mutacją;
- brak zmian produktowego UI i brak architektury backendowej.

### Plan dni

| Termin | Wynik |
|---|---|
| **10–11.07** | ratyfikacja decyzji, freeze nowych funkcji i zapis jednego wedge’a |
| **12–14.07** | inwentaryzacja dokumentów i mapa statusów |
| **15–17.07** | aktualizacja SSOT/First Wedge/Decision Log/RACI |
| **20–22.07** | scope validator, przypadek PASS i negatywna mutacja doctor/AI/child-first |
| **23.07** | GPT 5.6 SOL: oddzielny read-only technical review S0 |
| **24.07** | decyzja G0: `GO-S1`, `FIX` albo `NO-GO` |

### Artefakty wymagane do G0 i ich stan

| Artefakt | Stan |
|---|---|
| Ratyfikacja D1-D8 i Scope Freeze | `DONE`, identyfikator i hashe w rekordzie attestation |
| Jedna hierarchia SSOT | `DONE`, ADR 0008 supersedes hierarchie ADR 0005 |
| Founder Decision Record D1-D8 | `DONE` |
| Closed-world mapa aktywnych i historycznych dokumentów | `DONE` po korekcie S0 |
| RACI ze statusem każdej funkcji | `DONE`, wakaty pozostają jawne |
| Scope validator | `DONE` po korekcie S0 |
| Dowód PASS i end-to-end CLI FAIL/non-zero | `DONE` po korekcie S0 |
| GPT 5.6 SOL: oddzielny read-only technical review S0 | `PENDING`; techniczny werdykt nie jest podpisem G0 ani model attestation |
| Osobny zapis G0 w Decision Log | `PENDING`, dopiero po review i w odrębnym akcie Foundera Sebastiana Kalisza |

### Stop conditions

- brak ratyfikacji wedge’a;
- aktywny dokument nadal stawia lekarza, dziecko/opiekuna prawnego albo AI w current scope;
- próba zmiany UI/backendu „przy okazji”;
- próba oznaczenia human gate jako zatwierdzonego przez AI;
- próba push, PR, release, deploymentu albo destrukcyjnej operacji Git bez uprzedniej zgody Foundera; edit/stage/commit/amend w aktywnym WO są dozwolone przez Governance V2.

---

## 6. P0 do zamknięcia przed G1 — 07.08.2026

Po przejściu G0 aktywowany jest wyłącznie Sprint 1. P0:

1. zachowanie `REGULATED_FEATURES_ENABLED=false`, nie tylko tekst flagi;
2. fizyczne wykluczenie doctor/clinical/tech modules z normalnego artefaktu;
3. skan wszystkich indeksowanych HTML/JS pod kątem No-CDSS i claims;
4. usunięcie ryzykownego publicznego copy;
5. brak fabrykowanej bieżącej daty — `unknown` pozostaje `unknown`;
6. naprawa Service Workera, cache N→N+1 i source-build-runtime parity;
7. fixture-only showcase i pełny reset local/session/IndexedDB/CacheStorage;
8. domknięty syntetyczny flow „Dodaj wpis” albo uczciwe oznaczenie fixture-only;
9. brak wycieku materiałów counsel/internal w public artifact/repo;
10. naprawa 320 px/400% reflow dla flow osoby wspierającej;
11. Research Safety SOP i Evidence Ledger bez PII/PHI;
12. nazwani albo jawnie `VACANT-BLOCKING` właściciele QA, security, legal/privacy i medical safety.

---

## 7. Evidence Gate — jak rozumieć metryki

Minimalne progi do 09.10.2026:

- co najmniej 10/15 osób kończy pakiet bez pomocy w 8 minut;
- zero pomyłki osoby lub zakresu;
- zero odczytania systemu jako porady, triage lub interpretacji;
- 100% elementów pakietu ma autora, źródło/status i datę/unknown;
- co najmniej 70% ocenia użyteczność 4/5+;
- co najmniej 8/15 potwierdza powtarzalny problem organizacyjny;
- trzy niezależne oceny pakietu.

Te progi są **heurystyką decyzyjną**, a nie statystycznym dowodem PMF ani walidacją kliniczną. Ich rolą jest tanio zatrzymać zły kierunek przed inwestycją w backend.

---

## 8. Backlog warunkowy

### P1 — dopiero po G2 `continue/narrow`

- kanoniczny model prototypu i VisitPacket;
- adult supporter UX i syntetyczny `DemoAccessGrant`;
- expert packet review;
- decyzja B2C/B2B2C i patient-vault tenancy;
- formalne MDR/CDSS, AI Act, GDPR/DPIA, delegation i claims mema;
- threat model, security architecture, retention i vendor plan;
- capacity/funding decision.

### P2 — dopiero po G3

- OIDC/PKCE, recovery, MFA/step-up;
- server-side ABAC/PDP, patient vault/RLS i object isolation;
- append-only transactional audit i PHI-safe observability;
- retention, deletion, DSAR, backup/restore;
- secure SDLC, SBOM, SAST/SCA/IaC/secrets;
- independent pentest i remediation;
- closed-pilot operations;
- syntetyczny Doctor Context research;
- oficjalne integration discovery na danych syntetycznych.

### Zablokowane bez osobnego RFC Level C

AI/LLM/OCR/RAG/embeddings, diagnoza, triage, pilność, interpretacja wyników, interakcje lekowe, rekomendacje leczenia, dzieci/guardian cases, produkcyjne konto lekarza, public self-service oraz produkcyjne integracje IKP/P1/EHDS.

---

## 9. RACI na dziś

| Funkcja | Status do G0 | Uprawnienie |
|---|---|---|
| Founder / Product accountable | Sebastian Kalisz | podpisuje scope i gates; nie pełni roli reviewera S0 |
| Delivery coordination | Founder OS / PM support | organizuje, nie zatwierdza human gates |
| Implementer | Codex w Governance V2 | implementuje aktywny WO i może autonomicznie edit/stage/commit/amend; bez push/PR/release/deployment/destructive Git |
| Independent technical S0 Reviewer | GPT 5.6 SOL | wyłącznie read-only technical review; wydaje `GO-S1`/`FIX`/`NO-GO`, ale nie podpisuje G0 |
| Tech Lead | do nazwania | zatwierdza architekturę techniczną; nie pentestuje własnej pracy |
| QA Lead | `VACANT-BLOCKING` najpóźniej przed G1 | niezależny evidence/test review |
| Medical Safety | fractional human do rezerwacji | klasyfikuje safety misreads i podpisuje właściwe bramki |
| Security Lead | fractional human do rezerwacji | threat model, design i security acceptance |
| Privacy/Legal/DPO | external/fractional do rezerwacji | role, podstawy, DPIA i mema; AI nie zastępuje opinii |
| Release Manager | do nazwania przed candidate build | source/build/runtime parity i artefakt |

Nie trzeba dziś zatrudniać pełnego zespołu. Trzeba natomiast jawnie zapisać, które role są nazwane, planowane i blokujące.

---

## 10. Jednozdaniowa ratyfikacja

Wpis Foundera ratyfikowany 2026-07-10 i zapisany w rekordzie `P360-ATT-D1-D8-20260710-001`:

> **Ratyfikuję decyzje D1–D8 Founder Control Pack v1 z 10.07.2026, aktywuję wyłącznie Sprint 0 do bramki G0 24.07.2026 i utrzymuję wszystkie późniejsze fazy jako warunkowe do czasu wymaganych dowodów oraz ludzkich podpisów.**

Zmiana D1–D5 po ratyfikacji wymaga osobnego RFC i aktualizacji Decision Logu.

---

## 11. Najbliższa decyzja wykonawcza

Nie uruchamiać teraz pełnej roadmapy. Nie zlecać kolejnego redesignu. Nie budować backendu.

**Uruchomić WO-P360-S0.**
Jego jedynym celem jest doprowadzenie repo do jednej, podpisanej prawdy o produkcie i zwrócenie decyzji `GO-S1`, `FIX` albo `NO-GO`.
