# Risk Register

Status: aktywny dokument wspierający. Zakres produktu i aktywny backlog wyznaczają `PRODUCT_SSOT.md`, `docs/product/PACJENT360_FOUNDER_CONTROL_PACK_V1_2026-07-10.md`, current scope manifest i jeden aktywny work order.

Rejestr obejmuje także ryzyka odłożonych pomysłów, ale ich obecność nie aktywuje AI/LLM/OCR, lekarza, backendu ani dawnych sprintów A0-A8. Current gate dla tych obszarów to blokada opisana w `PRODUCT_SSOT.md` i `docs/governance/SAFETY_GATE_MATRIX.md`.

| ID | Ryzyko | Prawdopodobieństwo | Wpływ | Mitygacja | Status | Current gate / źródło historyczne |
| --- | --- | --- | --- | --- | --- | --- |
| R-001 | Projekt zostanie pomylony z CeZ, NFZ, IKP albo e-Profilem Pacjenta | średnie | wysokie | Widoczny komunikat niezależności, brak używania oficjalnych znaków, jasna ścieżka integracji | aktywne | Sprint 0 |
| R-002 | Demo zostanie odebrane jako CDSS albo wyrób medyczny | średnie | wysokie | DITL, brak zaleceń, intended purpose, disclaimer, neutralne nazewnictwo | aktywne | Sprint 0 |
| R-003 | Flagi kolorystyczne zostaną odebrane jako triage | średnie | średnie | Wyjaśnienie, że flagi są markerami uwagi, nie oceną pilności | aktywne | Sprint 0 |
| R-004 | Prywatne pliki trafią na hosting albo do repo | średnie | wysokie | `.gitignore`, czysty katalog publikacyjny, check przed publikacją | aktywne | Sprint 0 |
| R-005 | Dane demo zostaną odebrane jako realne przypadki | niskie | średnie | Fikcyjne kompozyty, disclaimer, brak danych identyfikujących | monitorowane | Sprint 0 |
| R-006 | Asystenci operacyjni zostaną odebrani jako AI kliniczna | średnie | wysokie | Current scope blokuje runtime AI; każda przyszła propozycja wymaga osobnej decyzji Foundera i przejścia aktualnych safety gates | odłożone | future gate / blocked |
| R-007 | Brak polityki prywatności osłabi wiarygodność | średnie | średnie | `privacy.html` i `PRIVACY.md` | zamknięte po wdrożeniu | Sprint 0 |
| R-008 | Zewnętrzny CDN zmieni kod ikon | niskie | średnie | Przypięta wersja i SRI albo lokalny vendor | zamknięte po wdrożeniu | Sprint 0 |
| R-009 | LLM dopowie fakt bez źródła albo z pamięci modelu | średnie | wysokie | Runtime AI/LLM/OCR pozostaje zablokowany przez `PRODUCT_SSOT.md`; ewentualna przyszła propozycja podlega `source_gate` i `runtime_gate` | aktywne przez blokadę | S0 No-AI gate |
| R-010 | Output LLM zabrzmi jak diagnoza, triage, pilność albo terapia | średnie | wysokie | Current product boundary blokuje runtime AI oraz outputy kliniczne; obowiązuje `forbidden_output_gate` w Safety Gate Matrix | aktywne przez blokadę | S0 No-AI/No-CDSS gate |
| R-011 | Realne dane pacjenta trafią do promptu, dry-run, fixture, logu albo eksportu | średnie | wysokie | Synthetic-only, brak runtime AI i brak zewnętrznych modeli; zmiana wymaga osobnego Real-Data Gate oraz decyzji Foundera | aktywne przez blokadę | S0 Synthetic-Only gate |
| R-012 | Prompt injection w dokumencie lub transkrypcji ominie zasady DITL | średnie | wysokie | Runtime AI i import binarnych dokumentów są zablokowane; testy prompt-injection stają się wymagane dopiero po osobnym otwarciu takiego zakresu | odłożone | future gate / blocked |
| R-013 | Opiekun zobaczy dane poza zakresem zgody przez streszczenie, błąd albo eksport | średnie | wysokie | Current wedge dopuszcza jedną nazwaną dorosłą osobę wspierającą tylko w jawnym zakresie; przyszłe mechanizmy wymagają consent i leakage gates | aktywne | current wedge / future gate blocked |
| R-014 | Podsumowanie po wizycie zmieni sens wypowiedzi lekarza | średnie | wysokie | Automatyczne przepisywanie jest poza current scope; ewentualna przyszła propozycja wymaga osobnej decyzji i zachowania źródła | odłożone | future gate / blocked |
| R-015 | Nagranie lub transkrypcja wizyty zostanie przetworzona bez jasnej zgody, retencji albo możliwości usunięcia | średnie | wysokie | Nagrania, transkrypcje i realne dane są poza current scope; otwarcie wymaga osobnych privacy, security i consent gates | odłożone | future gate / blocked |
| R-016 | Wyszukanie apteki, specjalisty albo terminu zostanie odebrane jako rekomendacja kliniczna | średnie | wysokie | Nawigacja, dobór i booking są poza current scope; nie mogą wejść bez osobnej decyzji produktowej i safety review | odłożone | future gate / blocked |
| R-017 | Agent wykona zakup, booking lub kontakt z placówką bez świadomej decyzji pacjenta/opiekuna | niskie | wysokie | Autonomiczne działania zewnętrzne są poza current scope; future gate musi zachować preview, świadome potwierdzenie i audyt | odłożone | future gate / blocked |
