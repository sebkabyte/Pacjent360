# Pacjent360 — Claims Register

Status: rejestr roboczy do copy review i potwierdzenia przez kancelarię  
Data: 2026-06-26  
Decyzja założycielska: D-Legal-001 z 2026-06-26 — Alternatywa C, hybryda modułowa  
Charakter dokumentu: materiał roboczy; nie stanowi opinii prawnej

## 1. Cel rejestru

Ten rejestr zawiera każdą frazę używaną lub planowaną w publicznym copy produktu — stronach, demo, README, materiałach inwestorskich, komunikacji z lekarzami i wszelkich claimach opisujących produkt. Każda fraza otrzymuje jedno z trzech oznaczeń:

- **APPROVED** — fraza bezpieczna, może być używana
- **BANNED** — fraza zakazana, musi być usunięta lub zmieniona
- **REVIEW** — fraza wymagająca oceny kancelarii przed użyciem

Rejestr jest dokumentem żywym. Nowa fraza powinna trafić tutaj przed użyciem w publicznym kanale.

Podstawa: analiza GPT PRO Extended (`docs/legal/FOUNDER z GPTPRO EXTENDED.txt`), MDCG 2019-11 rev.1, MDR 2017/745, AI Act 2024/1689, CLAUDE.md sekcja 2.

## 2. Frazy zakazane — BANNED

Frazy w tej sekcji są zakazane we wszystkich kanałach publicznych, materiałach inwestorskich, README, dokumentacji dla lekarzy i komunikatach systemowych.

### 2.1 Frazy kliniczne — ryzyko MDR/CDSS

| Fraza | Powód zakazu | Zastępstwo |
| --- | --- | --- |
| `asystent medyczny` | Sugeruje autonomię i kompetencję medyczną; ryzyko MDR/CDSS | `narzędzie administracyjno-kontekstowe` |
| `inteligentny asystent medyczny` | Jak wyżej; wzmocnione przez „inteligentny" | `narzędzie administracyjno-kontekstowe` |
| `AI wyjaśnia wyniki` | Bezpośrednio interpretacja kliniczna | `AI tworzy robocze uproszczenie tekstu źródłowego` |
| `AI powie co robić` | Rekomendacja postępowania | `narzędzie organizuje zadania wynikające ze źródła` |
| `wykrywa ryzyka` | Kliniczny risk detection | `pokazuje brakujące źródła lub nieuzupełnione pola` |
| `sprawdza wyniki` | Interpretacja wyników | `wyświetla wartości ze źródeł bez oceny medycznej` |
| `co trzeba wyjaśnić przed decyzją` | Fraza może brzmieć jak wsparcie decyzji klinicznej | `co warto omówić z lekarzem lub placówką na podstawie widocznych źródeł` |
| `szybsza decyzja lekarza` | Fraza może sugerować, że system wpływa na decyzje terapeutyczne | `mniej szukania przez lekarza; decyzje wyłącznie po stronie profesjonalisty` |
| `lekarz dostaje gotową ocenę` | Sugeruje ocenę kliniczną | `lekarz widzi zebrane źródła i pytania od pacjenta` |
| `prowadzenie pacjenta` | Care navigation | `porządkowanie zadań administracyjnych pacjenta` |
| `opieka po wizycie` | Care management — świadczenie zdrowotne | `sprawy organizacyjne po wizycie na podstawie dokumentów` |
| `opieka nad pacjentem` | Jak wyżej | `kontekst i organizacja dokumentów pacjenta` |
| `monitorowanie zdrowia` | MDCG 2019-11 — ryzyko MDR | `przechowywanie dokumentów i ślad źródeł` |
| `monitoring zdrowia` | Jak wyżej | `przechowywanie dokumentów i ślad źródeł` |
| `pilne zadania` | Triage / priorytetyzacja | `zadania z etykietą przepisaną ze źródła, bez oceny systemu` |
| `pilne` (jako kategoria systemowa) | Triage systemowy | _(nie używać jako kategorii; tylko jako cytat ze źródła z obligatoryjnym disclaimerem)_ |
| `wyniki w normie` | Interpretacja kliniczna — zakazane | `wartości w zakresie referencyjnym podanym w źródle` |
| `wyniki poza normą` | Interpretacja kliniczna — zakazane | `wartości poniżej/powyżej zakresu referencyjnego podanego w źródle` |
| `diagnoza` (jako output systemu) | Zakazane — CLAUDE.md §2 | _(nie używać)_ |
| `rozpoznanie` (jako output systemu) | Zakazane — CLAUDE.md §2 | _(nie używać)_ |
| `zalecenie` (jako rada) | Rekomendacja terapeutyczna | `zadanie organizacyjne wynikające ze źródła` |
| `rekomendacja` (jako rada) | Jak wyżej | `zadanie organizacyjne wynikające ze źródła` |
| `triage` | Kliniczne — zakazane | _(nie używać)_ |
| `clinical decision support` | Zakazane — CLAUDE.md §2 | _(nie używać)_ |
| `przypomnienie o leku` | MDCG 2019-11 — ryzyko MDR | `zadanie: sprawdzenie kodu recepty lub kontakt z apteką według informacji w źródle` |

### 2.2 Frazy publiczne — ryzyko overclaim / CDSS

| Fraza | Powód zakazu | Zastępstwo |
| --- | --- | --- |
| `Pacjent w 90 sekund` | Sugeruje szybkie kliniczne zrozumienie; może brzmieć jak skrót do decyzji | `szybki roboczy przegląd źródeł i pytań — demo na fikcyjnych danych` |
| `brief przed wizytą` (bez kwalifikatora) | „Brief" brzmi jak materiał decyzyjny | `robocza lista źródeł, braków i pytań do omówienia` |
| `brief dla lekarza` (bez kwalifikatora) | Jak wyżej | `roboczy pakiet kontekstu pacjenta — niezweryfikowany klinicznie` |
| `decision brief` | Bezpośrednio decision support | _(nie używać)_ |
| `kliniczny brief` | Jak wyżej | _(nie używać)_ |
| `asystenci AI` (bez zastrzeżeń) | Sugeruje autonomię medyczną AI | `eksperymentalne narzędzia porządkowania treści — bez porad medycznych` |
| `AI prowadzi pacjenta po systemie` | Care navigation / AI autonomy | _(nie używać)_ |

### 2.3 Frazy afiliacyjne IKP/P1/EHDS — ryzyko fałszywej afiliacji

| Fraza | Powód zakazu | Zastępstwo |
| --- | --- | --- |
| `towarzysz IKP/P1` | Sugeruje oficjalne powiązanie lub endorsement | `niezależne narzędzie do porządkowania dokumentów` |
| `companion dla IKP` | Jak wyżej | _(jak wyżej)_ |
| `P1-ready` | Sugeruje certyfikowaną zgodność lub integrację | `kierunek techniczny — brak integracji na tym etapie` |
| `EHDS-ready` | Sugeruje formalną zgodność bez jej potwierdzenia | `kierunek techniczny / projektowana kompatybilność — wymaga formalnej oceny` |
| `współpracuje z IKP` | Sugeruje integrację | _(nie używać — Pacjent360 nie integruje się z IKP)_ |
| `integracja z P1` | Jak wyżej | _(nie używać bez formalnej integracji)_ |
| `e-Profil Pacjenta` | Może brzmieć jak oficjalna usługa publiczna | _(nie używać)_ |

### 2.4 Frazy zakazane w output systemowym (komunikaty UI)

| Fraza | Powód |
| --- | --- |
| `diagnoza` | Zakazane — CLAUDE.md §2 |
| `rozpoznanie` | Zakazane — CLAUDE.md §2 |
| `zalecenie` | Zakazane — CLAUDE.md §2 |
| `pilnej oceny` | Zakazane — CLAUDE.md §2 |
| `wymaga natychmiastowej` | Zakazane — CLAUDE.md §2 |
| `poza normą` | Zakazane — CLAUDE.md §2 |
| `w normie` | Zakazane — CLAUDE.md §2 |
| `triage` | Zakazane — CLAUDE.md §2 |
| `ryzyko kliniczne` | Sugeruje ocenę kliniczną |
| `alarm` | Sugeruje triage |
| `działaj natychmiast` | Triage systemowy |
| `wysoki priorytet medyczny` | Triage systemowy |
| `pilne` (jako kategoria systemowa, nie cytat) | Triage systemowy |

## 3. Frazy zatwierdzone — APPROVED

Frazy w tej sekcji mogą być używane bez dodatkowego przeglądu prawnego, pod warunkiem zachowania kontekstu.

### 3.1 Opis produktu i funkcji

| Fraza | Kontekst użycia |
| --- | --- |
| `organizator dokumentów zdrowotnych` | Opis Core w każdym kanale |
| `warstwa źródeł i kontekstu` | Opis architektury |
| `Sekretariat Kontekstu` | Główna teza produktu, z definicją: „robocze porządkowanie źródeł, braków, pytań i spraw organizacyjnych. Bez diagnozy, triage i porad medycznych." |
| `narzędzie administracyjno-kontekstowe` | Opis dla lekarzy i inwestorów |
| `źródła, braki, rozbieżności, audyt` | Opis funkcji Core |
| `robocze podsumowania do weryfikacji` | Opis outputu AI Drafting |
| `pytania do omówienia z lekarzem` | Opis outputu AI Drafting |
| `zadania organizacyjne wynikające z dokumentów` | Opis outputu AI Drafting i Core |
| `roboczy pakiet kontekstu pacjenta — niezweryfikowany klinicznie` | Opis raportu przed wizytą |
| `narzędzie do przygotowania rozmowy z lekarzem` | Opis dla pacjentów |
| `przechowywanie i indeksowanie dokumentów` | Opis Core |
| `oś czasu źródeł` | Opis funkcji |
| `lista brakujących dokumentów` | Opis funkcji |
| `sprawy organizacyjne po wizycie na podstawie dokumentów` | Opis AI Drafting / A8 |

### 3.2 Disclaimery — obligatoryjne

Następujące disclaimery muszą być widoczne w odpowiednich kontekstach:

**Na stronie głównej i demo:**
> „Pacjent360 jest prototypem administracyjno-kontekstowym. Nie diagnozuje, nie ocenia pilności, nie interpretuje wyników, nie rekomenduje leczenia i nie zastępuje konsultacji z lekarzem. Demo działa na danych fikcyjnych i nie jest przeznaczone do realnych danych pacjentów."

**Na outputach AI Drafting:**
> „Treść robocza wygenerowana na podstawie wskazanego źródła. Niezweryfikowana klinicznie. Do omówienia z uprawnionym profesjonalistą."

**Na każdej stronie z opisem funkcji:**
> „Pacjent360 jest niezależnym narzędziem do porządkowania dokumentów zdrowotnych przekazanych przez użytkownika. Nie jest usługą IKP, P1, CeZ ani NFZ i nie jest przez nie autoryzowany."

### 3.3 Statusy dozwolone w UI

| Status | Użycie |
| --- | --- |
| `znane` / `known` | Informacja potwierdzona w źródle |
| `brakujące` / `missing` | Brak dokumentu lub danych |
| `niepewne` / `uncertain` | Niepewność wskazana w źródle lub brak źródła |
| `do wyjaśnienia` / `to verify` | Wymaga rozmowy z lekarzem lub placówką |
| `do omówienia z lekarzem` | DITL question |
| `brudnopis` / `draft` | Status outputu AI Drafting |
| `niezweryfikowane klinicznie` | Status każdego outputu AI |
| `źródło` + wskazanie dokumentu | Proweniencja danych |
| `rozbieżność` | Konflikt między źródłami |
| `brak źródła` | Dane bez wskazanego dokumentu |
| `w zakresie referencyjnym` | Wartość mieszcząca się w zakresie podanym w źródle |
| `poniżej zakresu referencyjnego` | Jak wyżej — poniżej |
| `powyżej zakresu referencyjnego` | Jak wyżej — powyżej |

## 4. Frazy do przeglądu przez kancelarię — REVIEW

Frazy, co do których istnieje wątpliwość; nie należy ich używać do czasu opinii kancelarii.

| Fraza | Wątpliwość |
| --- | --- |
| `Pacjent360 nie jest wyrobem medycznym` | Zbyt kategoryczne — zamiast tego używać wersji kwalifikowanej z sekcji 3 WHOLE_PROJECT_BRIEF |
| `No-CDSS` (publicznie) | Tylko wewnętrznie jako robocze stanowisko; publicznie tylko z kwalifikatorem |
| `brief przed wizytą` (z disclaimerem) | Z mocnym disclaimerem może być dopuszczalne — do oceny kancelarii |
| `asystenci AI` (z mocnym zastrzeżeniem) | Wymaga zastrzeżenia, że AI jest wyłączone dla realnych danych lub ograniczone do draftów |
| `FHIR/IPS jako kierunek techniczny` | Użycie „FHIR-inspired" lub „projektowany z myślą o kompatybilności" wymaga oceny |
| `Pacjent360™` i nazwa domeny | Czy sugeruje oficjalny lub publiczny charakter usługi |
| wyniki walidacji z lekarzami w materiałach marketingowych | Ryzyko tworzenia claimów skuteczności klinicznej |

## 5. Procedura dodawania nowych fraz

1. Nowa fraza pojawia się w copy, roadmapie lub komunikacji.
2. Autor sprawdza ten rejestr.
3. Jeśli frazy nie ma — wpisuje jako REVIEW i informuje foundera.
4. Founder lub kancelaria decyduje o statusie.
5. Fraza trafia do rejestru z odpowiednim statusem.

## 6. Historia zmian

| Data | Zmiana | Autor |
| --- | --- | --- |
| 2026-06-26 | Pierwsza wersja — wypełnienie z red-team review GPT PRO Extended | Claude (D-Legal-001) |
