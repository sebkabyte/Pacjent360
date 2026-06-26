# Pacjent360 — Legal Review Package Index

Status: pakiet wejściowy dla kancelarii  
Data: 2026-06-26  
Przygotowany przez: Sebastian Kalisz (founder)  
Charakter dokumentu: indeks materiałów do przeglądu prawnego; nie stanowi opinii prawnej

---

## 1. Kontekst zlecenia

Pacjent360 jest otwartym prototypem narzędzia do porządkowania kontekstu pacjenta przed, w trakcie i po wizycie lekarskiej. Projekt działa jako warstwa administracyjno-kontekstowa — nie jako system diagnostyczny, terapeutyczny ani kliniczny.

Founder zlecił kancelarii formalny przegląd w zakresie:

- MDR 2017/745 i kwalifikacji Medical Device Software / CDSS;
- RODO/GDPR dla danych zdrowotnych, ról przetwarzania i DPIA;
- AI Act 2024/1689 dla planowanych modułów LLM;
- EHDS i polskiego kontekstu IKP/P1/CeZ/NFZ;
- publicznych claimów i komunikacji produktowej.

Projekt jest w fazie alpha: statyczny frontend, dane fikcyjne, brak backendu produkcyjnego, brak runtime LLM na realnych danych, brak integracji z IKP/P1. Jednocześnie roadmapa zakłada pełny produkt z backendem, LLM i realnymi danymi zdrowotnymi — i to jest główny zakres niniejszego przeglądu.

---

## 2. Kluczowa decyzja architektoniczna (D-Legal-001, 2026-06-26)

Founder przyjął modułową strategię produktową i prawną. Produkt jest podzielony na trzy moduły z różnym statusem regulacyjnym:

| Moduł | Opis | Status produkcyjny | Robocza pozycja prawna |
| --- | --- | --- | --- |
| **Pacjent360 Core** | Dokumenty, timeline, braki, rozbieżności, eksport, audyt | Aktywny w MVP | Intencja: poza MDR — do potwierdzenia przez kancelarię |
| **Pacjent360 AI Drafting** | LLM source-bound, draft-only, plain language, zadania organizacyjne | Zablokowany — wymaga DPIA/DPA/walidatorów | Szara strefa — do potwierdzenia przez kancelarię |
| **Pacjent360 Clinical Assist** | Interpretacja, pilność, ryzyko, triage, rekomendacje | **WYŁĄCZONY** — nie jest oferowany | Potencjalny MDR/CDSS/AI Act high-risk |

Kancelaria jest proszona o weryfikację tej klasyfikacji i wskazanie, czy jest obronna, czy wymaga korekty.

---

## 3. Kolejność czytania dokumentów

### Krok 1 — Zrozumienie produktu i granic (przeczytaj najpierw)

| Dokument | Lokalizacja | Widoczność | Opis |
| --- | --- | --- | --- |
| Intended Purpose by Module | `docs/legal/PROD_INTENDED_PURPOSE_BY_MODULE.md` | publiczny | Definicja dozwolonego i wyłączonego zakresu per moduł; główny dokument intended purpose |
| Claims Register | `docs/legal/CLAIMS_REGISTER.md` | publiczny | Rejestr fraz: approved / banned / needs legal review; do copy review |
| Clinical Assist Go/No-Go | `docs/legal/CLINICAL_MODULE_GO_NO_GO_POLICY.md` | publiczny | 22 warunki LOCKED przed odblokowanim Clinical Assist; definicja izolacji |

### Krok 2 — Bezpieczeństwo danych i techniczne bramki

| Dokument | Lokalizacja | Widoczność | Opis |
| --- | --- | --- | --- |
| A7/A8 Validation Protocol | `docs/legal/A7_A8_VALIDATION_PROTOCOL.md` | publiczny | Output schema LLM, 8 deterministycznych walidatorów, 18 red-team testów negatywnych, bramka go/no-go dla AI Drafting |
| No Real Patient Data Policy | `docs/legal/NO_REAL_PATIENT_DATA_POLICY.md` | publiczny | Bezwzględny zakaz realnych danych: repo, demo, fixtures, issues, support, walidacja |

### Krok 3 — Pytania do kancelarii (załącznik poza repo)

| Dokument | Lokalizacja | Widoczność | Opis |
| --- | --- | --- | --- |
| MDR Classification Memo Request | przekazany osobno (poza repo) | **prywatny** | Zorganizowane pytania do kancelarii per moduł i per funkcja: MDR, RODO, AI Act, EHDS |
| Whole Project Legal Compliance Brief | przekazany osobno (poza repo) | **prywatny** | Pełny brief opisujący aktualny status, intended purpose, mapę ryzyk i artefakty repo |
| Phase 2 Legal Brief | przekazany osobno (poza repo) | **prywatny** | Aneks specjalistyczny dla A7/A8: mechanizmy bramek, szczegóły techniczne |

### Krok 4 — Governance i safety (uzupełniające)

| Dokument | Lokalizacja | Opis |
| --- | --- | --- |
| Safety Case | `docs/governance/SAFETY_CASE.md` | Uzasadnienie bezpieczeństwa systemu |
| Safety Gate Matrix | `docs/governance/SAFETY_GATE_MATRIX.md` | Matryca bramek safety |
| Definition of Harm | `docs/governance/DEFINITION_OF_HARM.md` | Definicja szkody i granic systemu |
| Risks | `docs/governance/RISKS.md` | Rejestr ryzyk |

### Krok 5 — Public copy do copy review

Kancelaria powinna przejrzeć jako jeden zestaw claimów wszystkie pliki z katalogu `public/`, w tym:

- `public/index.html` — strona główna
- `public/demo.html` — demo alpha
- `public/dla-lekarzy.html` — strona dla lekarzy
- `public/agents.html` — opis asystentów
- `public/investors.html` — strona dla inwestorów
- `public/privacy.html`, `public/disclaimer.html`
- `docs/legal/DISCLAIMER.md`, `docs/legal/PRIVACY.md`

---

## 4. Checklist decyzji — czego oczekuje founder od kancelarii

### 4.1 MDR / CDSS

- [ ] **D-MDR-01** Czy Pacjent360 Core (dokumenty, timeline, braki, audyt, eksport) może być kwalifikowany poza MDR?
- [ ] **D-MDR-02** Czy raport Known/Unknown/Uncertain/To verify, pytania DITL, checklisty i oś czasu mogą zostać uznane za CDSS mimo braku zaleceń?
- [ ] **D-MDR-03** Czy AI Drafting z No-New-Clinical-Meaning Gate może pozostać poza MDR Medical Device Software?
- [ ] **D-MDR-04** Czy plain language na realnych danych zdrowotnych jest transformacją językową, czy interpretacją medyczną w rozumieniu MDCG 2019-11?
- [ ] **D-MDR-05** Jakie dowody techniczne są minimalnie wymagane do wykazania braku nowego znaczenia klinicznego?
- [ ] **D-MDR-06** Czy zadania organizacyjne tworzone ze źródła mogą być generowane automatycznie bez wejścia w care navigation?
- [ ] **D-MDR-07** Czy etykieta CITO przepisana dosłownie ze źródła (bez koloru alertu, sortowania, scoringu) może być wyświetlana bez kwalifikacji jako triage?
- [ ] **D-MDR-08** Które funkcje roadmapy automatycznie uruchamiają MDR Rule 11?
- [ ] **D-MDR-09** Czy Clinical Assist powinien być od początku projektowany jako MDR class IIa/IIb candidate?
- [ ] **D-MDR-10** Czy należy skonsultować kwalifikację z URPL lub jednostką notyfikowaną przed pilotem?

### 4.2 RODO / DPIA / DPA

- [ ] **D-RODO-01** Jaki model ról przetwarzania: B2C (administrator), B2B z placówką (procesor), self-host?
- [ ] **D-RODO-02** Jaka jest właściwa podstawa z art. 6 i wyjątek z art. 9 RODO dla każdego modelu?
- [ ] **D-RODO-03** Czy wyraźna zgoda z art. 9 ust. 2 lit. a RODO wystarczy dla modelu B2C?
- [ ] **D-RODO-04** Czy DPIA jest obligatoryjna już przed zamkniętym pilotem z AI Drafting?
- [ ] **D-RODO-05** Jakie minimalne elementy musi mieć DPA z dostawcą LLM (zero-training, EU/EEA, retencja, logowanie)?
- [ ] **D-RODO-06** Czy zewnętrzny LLM z DPA, zero-training, EU/EEA data boundary jest dopuszczalny dla danych zdrowotnych?
- [ ] **D-RODO-07** Jakie okresy retencji są akceptowalne dla: źródeł, draftów, promptów, odpowiedzi LLM, audytu, backupów?
- [ ] **D-RODO-08** Czy demo z edytowalnymi polami i localStorage wymaga osobnej bramki/notice/reset?
- [ ] **D-RODO-09** Jakie telemetry/analytics są dopuszczalne na publicznym demo?
- [ ] **D-RODO-10** Czy wymagana jest prior consultation z UODO, jeżeli DPIA pozostawi wysokie ryzyko rezydualne?

### 4.3 Opiekunowie / zgody / prawa pacjenta

- [ ] **D-OPK-01** Jak rozdzielić: zgodę RODO, upoważnienie do informacji medycznej, techniczną delegację konta, władzę rodzicielską i opiekę prawną?
- [ ] **D-OPK-02** Jak obsłużyć osobę wspierającą dorosłego pacjenta (zakres view-only, eksport, udostępnienie)?
- [ ] **D-OPK-03** Jak obsłużyć rodzica dziecka i opiekuna prawnego bez ujawniania danych poza zakresem?
- [ ] **D-OPK-04** Co dzieje się z dostępem rodzica/opiekuna po osiągnięciu pełnoletności przez pacjenta?
- [ ] **D-OPK-05** Jak zaprojektować eksport/share, aby zachowywał ograniczenia widoczności?

### 4.4 AI Act

- [ ] **D-AI-01** Czy A7/A8 (plain language + router) są systemami AI w rozumieniu AI Act?
- [ ] **D-AI-02** Czy A7/A8 mogą zostać uznane za high-risk przez MDR route lub Annex III (healthcare access, triage)?
- [ ] **D-AI-03** Czy wejście w MDR automatycznie zmienia analizę AI Act dla tych modułów?
- [ ] **D-AI-04** Jakie obowiązki transparency, logging i human oversight obowiązują nawet dla non-high-risk AI?
- [ ] **D-AI-05** Czy Pacjent360 będzie providerem, deployerem czy oboma, jeśli używa zewnętrznego GPAI/LLM pod własną marką?
- [ ] **D-AI-06** Jak dokumentować non-high-risk assessment dla A7/A8?

### 4.5 IKP / P1 / CeZ / NFZ / EHDS

- [ ] **D-IKP-01** Czy jakakolwiek fraza referująca do IKP/P1 jest dopuszczalna przy mocnym disclaimerze?
- [ ] **D-IKP-02** Jaka fraza non-affiliation jest minimalna i wystarczająca dla CeZ/NFZ/IKP/P1?
- [ ] **D-IKP-03** Czy „Bring Your Own Data" jest bezpiecznym opisem modelu bez integracji i bez scrapingu?
- [ ] **D-IKP-04** Jakie warunki prawne muszą poprzedzać integrację z IKP/P1 lub systemem placówki?
- [ ] **D-IKP-05** Czy wolno mówić o FHIR/IPS/EHDS jako „kierunku architektury" bez claimu formalnej zgodności?

### 4.6 Public copy i marketing

- [ ] **D-COPY-01** Które frazy z `CLAIMS_REGISTER.md` sekcja BANNED są absolutnie zakazane, a które dopuszczalne z disclaimerem?
- [ ] **D-COPY-02** Czy fraza „Pacjent w 90 sekund" jest dopuszczalna po doprecyzowaniu kontekstu?
- [ ] **D-COPY-03** Czy wyniki walidacji z lekarzami można używać w materiałach marketingowych lub inwestorskich?
- [ ] **D-COPY-04** Jak sformułować disclaimer, który będzie skuteczny prawnie, a nie tylko dekoracyjny?
- [ ] **D-COPY-05** Czy znak Pacjent360™ i domena mogą sugerować publiczny lub systemowy charakter usługi?

---

## 5. Oczekiwany output od kancelarii

Founder oczekuje następujących deliverables:

### 5.1 MDR Classification Memo

Per moduł (Core / AI Drafting / Clinical Assist) i per kluczowa funkcja:

- kwalifikacja: poza MDR / szara strefa / MDSW, z podstawą prawną;
- wskazanie klasy MDR, jeśli dotyczy;
- lista trigger points zmieniających kwalifikację;
- warunki wejścia w AI Drafting na realnych danych.

### 5.2 RODO/DPIA Readiness Memo

- rekomendowany model ról per wariant wdrożenia;
- minimalne warunki DPIA przed pilotem;
- minimalne wymagania DPA z dostawcą LLM;
- rekomendacja retencji per kategoria danych;
- ocena demo alpha i localStorage.

### 5.3 AI Act Screening

- klasyfikacja A7/A8 per funkcja;
- obowiązki transparency i human oversight dla non-high-risk;
- warunki, przy których AI Act high-risk się uruchamia.

### 5.4 Copy Review

- lista fraz do bezwzględnego usunięcia;
- lista fraz dopuszczalnych z disclaimerem;
- rekomendowany tekst disclaimer na stronie, demo i outputach AI.

### 5.5 Lista dokumentów do dodania

Które dokumenty prawne / techniczne są obowiązkowe przed:

- pilotem z placówką;
- uruchomieniem AI Drafting na realnych danych;
- jakimkolwiek wdrożeniem produkcyjnym.

---

## 6. Co NIE jest częścią tego commitu / repo publicznego

Następujące dokumenty są przekazywane kancelarii kanałem prywatnym (poza repozytorium):

| Dokument | Powód prywatności |
| --- | --- |
| `MDR_CLASSIFICATION_MEMO_REQUEST.md` | Strategia prawna i pytania wymagające poufności |
| `WHOLE_PROJECT_LEGAL_COMPLIANCE_BRIEF_FOR_REVIEW.md` | Pełna mapa ryzyk — materiał wewnętrzny |
| `PHASE_2_LEGAL_BRIEF_FOR_REVIEW.md` | Szczegóły techniczne A7/A8 — materiał wewnętrzny |
| Pełne opinie i odpowiedzi kancelarii | Chronione tajemnicą adwokacką |
| DPIA, DPA, vendor due diligence | Prywatne dane kontrahentów i strategii bezpieczeństwa |

---

## 7. Punkty odniesienia regulacyjne

- MDR 2017/745: <https://eur-lex.europa.eu/eli/reg/2017/745/oj/eng>
- MDCG 2019-11 rev.1 (czerwiec 2025): <https://health.ec.europa.eu/document/download/b45335c5-1679-4c71-a91c-fc7a4d37f12b_en>
- RODO/GDPR 2016/679: <https://eur-lex.europa.eu/eli/reg/2016/679/oj/pol>
- AI Act 2024/1689: <https://eur-lex.europa.eu/eli/reg/2024/1689/oj/pol>
- EHDS 2025/327: <https://eur-lex.europa.eu/eli/reg/2025/327/oj/pol>
- UODO — systemy SI i RODO: <https://uodo.gov.pl/pl/file/4380>
- Centrum e-Zdrowia — System P1: <https://cez.gov.pl/pl/nasze-produkty/e-zdrowie-p1>

---

*Dokument przygotowany: 2026-06-26. Projekt: Pacjent360, branch: codex/sh0-contracts. Kontakt: sebastian.kalisz@gmail.com*
