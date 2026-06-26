# 7. Phase 2 remains blocked until legal/privacy/clinical review

Date: 2026-06-26

## Status

Proposed

## Context

Rozpoczęcie prac nad Sprintami A7 (Plain Language) oraz A8 (Post Visit Router) wprowadza do systemu mechanizmy NLP przetwarzające nieustrukturyzowane dane medyczne (audio, notatki lekarskie) w celu przygotowania roboczych notatek, pytań lub zadań organizacyjnych dla pacjenta (tzw. After-Visit Loop).

Krok ten niesie ze sobą drastyczny wzrost ryzyka w dwóch kluczowych obszarach:
1. **Medycznym (MDR):** Ryzyko przekroczenia granicy "intended purpose" i wejścia w klasyfikację Wyrobu Medycznego, jeśli uproszczony przez model tekst zostanie zinterpretowany jako nowa rekomendacja, diagnoza lub ocena stanu zdrowia (np. system zmieniający tryb przypuszczający lekarza na pewnik).
2. **Prawnym (RODO/GDPR):** Przetwarzanie wysoce wrażliwych danych zdrowotnych przez zewnętrzne modele LLM rodzi pytania o rezydencję danych (Data Residency), retencję oraz wykorzystanie danych do trenowania innych modeli (No-training clause).

Jako organizacja budująca bezpieczny "Sekretariat Kontekstu", a nie autonomicznego robota medycznego, musimy utrzymać nasze *intended purpose* twardo poza decyzją kliniczną.

## Decision

Zdecydowaliśmy o całkowitym zablokowaniu (tzw. Code Freeze) prac inżynieryjnych nad modułami A7 i A8 w środowisku produkcyjnym/runtime, dopóki nie zostaną spełnione następujące warunki brzegowe:

1. **Zabezpieczenie Prawne (Privacy/GDPR):** 
   - Wymagane jest podpisanie formalnej umowy powierzenia przetwarzania danych (DPA) zgodnie z art. 28 RODO z dostawcą infrastruktury LLM.
   - Umowa musi twardo gwarantować: EU Data Residency, zakaz trenowania modeli na naszych danych (no-training), procedury usuwania (deletion) oraz powiadamiania o wyciekach.
   - Należy przeprowadzić formalną Ocenę Skutków dla Ochrony Danych (DPIA) oraz ew. TIA w przypadku transferów poza EOG. Zwykłe deklaracje na stronach FAQ dostawców nie są uznawane za wiążące zabezpieczenie.
2. **Zabezpieczenie Kliniczne (MDR Boundary):** 
   - Otrzymanie formalnej, wiążącej opinii prawnej (Legal Memo), która potwierdzi, że zaprojektowana przez nas logika "tłumaczenia żargonu" (ze ścisłym zachowaniem *No-New-Clinical-Meaning Gate*) nie przekracza granicy MDR.
3. **Wymogi Architektoniczne (UX/Gates):** 
   - Wdrożenie obowiązkowej bramki "Human Review Gate". Jakikolwiek output wygenerowany w Fazie 2 może istnieć wyłącznie jako brudnopis (`draft`). Zapis do głównej historii pacjenta wymaga manualnego kliknięcia w neutralny przycisk: *"Potwierdzam, że chcę zapisać to jako notatkę roboczą"*. 

## Consequences

*   **Pozytywne:** Redukujemy ryzyko konsekwencji prawnych związanych z przetwarzaniem danych pacjentów lub odczytaniem outputu modelu jako nowej decyzji klinicznej. Zachowujemy bezpieczny profil intended purpose do czasu formalnej decyzji prawno-regulacyjnej.
*   **Negatywne:** Wstrzymanie dostarczenia funkcji "After-Visit" do użytkowników do czasu rozwiązania problemów prawno-infrastrukturalnych.
*   **Mitygacja:** Na obecnym etapie biznes i zespół inżynieryjny skupiają się na Fazy 1 (Pre-Visit), która ma lokalnie przechodzące bramki bezpieczeństwa. Operacyjny go-live pozostaje zależny od zewnętrznych gate'ów wdrożeniowych i kontaktowych.
