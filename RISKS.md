# Risk Register

Rejestr ryzyk jest żywym dokumentem. Aktualizujemy go przy każdym sprincie, szczególnie po feedbacku lekarzy, pacjentów, prawników i osób od bezpieczeństwa.

| ID | Ryzyko | Prawdopodobieństwo | Wpływ | Mitygacja | Status | Sprint |
| --- | --- | --- | --- | --- | --- | --- |
| R-001 | Projekt zostanie pomylony z CeZ, NFZ, IKP albo e-Profilem Pacjenta | średnie | wysokie | Widoczny komunikat niezależności, brak używania oficjalnych znaków, jasna ścieżka integracji | aktywne | Sprint 0 |
| R-002 | Demo zostanie odebrane jako CDSS albo wyrób medyczny | średnie | wysokie | DITL, brak zaleceń, intended purpose, disclaimer, neutralne nazewnictwo | aktywne | Sprint 0 |
| R-003 | Flagi kolorystyczne zostaną odebrane jako triage | średnie | średnie | Wyjaśnienie, że flagi są markerami uwagi, nie oceną pilności | aktywne | Sprint 0 |
| R-004 | Prywatne pliki trafią na hosting albo do repo | średnie | wysokie | `.gitignore`, czysty katalog publikacyjny, check przed publikacją | aktywne | Sprint 0 |
| R-005 | Dane demo zostaną odebrane jako realne przypadki | niskie | średnie | Fikcyjne kompozyty, disclaimer, brak danych identyfikujących | monitorowane | Sprint 0 |
| R-006 | Asystenci operacyjni zostaną odebrani jako AI kliniczna | średnie | wysokie | Publicznie mówić "asystent operacyjny", każdy output jako zadanie/pytanie DITL | planowane | Sprint 6 |
| R-007 | Brak polityki prywatności osłabi wiarygodność | średnie | średnie | `privacy.html` i `PRIVACY.md` | zamknięte po wdrożeniu | Sprint 0 |
| R-008 | Zewnętrzny CDN zmieni kod ikon | niskie | średnie | Przypięta wersja i SRI albo lokalny vendor | zamknięte po wdrożeniu | Sprint 0 |
| R-009 | LLM dopowie fakt bez źródła albo z pamięci modelu | średnie | wysokie | `SourceGroundingAgent`, `source_missing`, 100% source coverage albo blokada outputu | aktywne | Sprint A0 |
| R-010 | Output LLM zabrzmi jak diagnoza, triage, pilność albo terapia | średnie | wysokie | Walidator zakazanych outputów, preview, ręczna akceptacja, `SSOT.md` jako bramka | aktywne | Sprint A0 |
| R-011 | Realne dane pacjenta trafią do promptu, dry-run, fixture, logu albo eksportu | średnie | wysokie | Tylko dane fikcyjne/syntetyczne, review privacy/security, brak zewnętrznych LLM dla realnych danych | aktywne | Sprint A0 |
| R-012 | Prompt injection w dokumencie lub transkrypcji ominie zasady DITL | średnie | wysokie | Testy prompt-injection, separacja treści źródłowej od instrukcji, walidator policy po wygenerowaniu | aktywne | Sprint A0 |
| R-013 | Opiekun zobaczy dane poza zakresem zgody przez streszczenie, błąd albo eksport | średnie | wysokie | `ConsentGuardAgent`, macierz zgód, testy leakage, audit dostępu i eksportu | aktywne | Sprint A4 |
| R-014 | Podsumowanie po wizycie zmieni sens wypowiedzi lekarza | średnie | wysokie | `VisitPlainLanguageAgent` tylko jako draft, link do transkrypcji, oznaczanie niepewności, ręczna akceptacja | planowane | Sprint A7 |
| R-015 | Nagranie lub transkrypcja wizyty zostanie przetworzona bez jasnej zgody, retencji albo możliwości usunięcia | średnie | wysokie | `VisitArtifact.consentStatus`, minimalizacja, lokalne przechowywanie, usuwanie audio, review privacy/security | planowane | Sprint A7 |
| R-016 | Wyszukanie apteki, specjalisty albo terminu zostanie odebrane jako rekomendacja kliniczna | średnie | wysokie | `MedicationAccessAgent` i `CareNavigationAgent` tylko jako handoff organizacyjny, bez wyboru terapii, pilności lub specjalizacji | planowane | Sprint A8 |
| R-017 | Agent wykona zakup, booking lub kontakt z placówką bez świadomej decyzji pacjenta/opiekuna | niskie | wysokie | MVP bez autonomicznego bookingu i zakupów; tylko preview, zadanie, potwierdzenie człowieka i audyt | planowane | Sprint A8 |
