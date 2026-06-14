# User And Persona Blueprint

## Cel dokumentu

Opisać osoby, dla których budujemy Pacjent360, ich ból, potrzeby, ekrany i CTA.

## Persona: lekarz

| Obszar | Treść |
|---|---|
| Problem | krótka wizyta, rozproszone dane, niepewne źródła |
| Próbuje zrobić | szybko zrozumieć kontekst rozmowy |
| Frustracje | PDF-y bez chronologii, leki “chyba takie”, brak źródeł |
| Potrzebuje | brief, źródła, braki, pytania, lista leków do potwierdzenia |
| Pacjent360 daje | Lekarz360: kontekst, historia, źródła, pytania |
| Nie obiecywać | diagnozy, priorytetu klinicznego, rekomendacji terapii |
| Ekrany | brief, historia pacjenta, źródła, raport |
| CTA | “Zobacz źródła”, “Przejdź do historii”, “Zobacz pytania do rozmowy” |

## Persona: pacjent dorosły

| Obszar | Treść |
|---|---|
| Problem | nie wie, co zabrać i jak opowiedzieć historię |
| Próbuje zrobić | przygotować wizytę i pytania |
| Frustracje | wyniki w kilku miejscach, lista leków w głowie, stres przed wizytą |
| Potrzebuje | checklisty, dokumentów, leków, prostego języka, zgód |
| Pacjent360 daje | Pacjent360: przygotowanie wizyty i własna historia |
| Nie obiecywać | interpretacji wyników ani decyzji medycznych |
| Ekrany | co teraz, dokumenty, leki, wyniki, pytania, zgody |
| CTA | “Przygotuj wizytę”, “Dodaj pytanie”, “Sprawdź, czego brakuje” |

## Persona: rodzic dziecka

| Obszar | Treść |
|---|---|
| Problem | dziecko nie opisze pełnej historii, rodzic jest głównym źródłem |
| Próbuje zrobić | zebrać objawy, obserwacje, wyniki, wizyty |
| Frustracje | wiele wizyt, pamięć objawów, rozbieżne informacje |
| Potrzebuje | miejsca na obserwacje i pytania, historii dziecka |
| Pacjent360 daje | rolę rodzica jako źródła obserwacji |
| Nie obiecywać | oceny stanu dziecka ani pilności |
| Ekrany | historia dziecka, obserwacje rodzica, dokumenty, pytania |
| CTA | “Dodaj obserwację”, “Przygotuj pytania”, “Pokaż historię” |

## Persona: opiekun prawny

| Obszar | Treść |
|---|---|
| Problem | musi działać w imieniu pacjenta, ale zakres musi być formalny |
| Próbuje zrobić | zarządzać dokumentami, wizytami, lekami w zakresie uprawnień |
| Frustracje | niejasne zgody i brak audytu dostępu |
| Potrzebuje | widocznej podstawy dostępu i zakresu |
| Pacjent360 daje | Opiekun360 z zakresem zgody/podstawy |
| Nie obiecywać | pełnego wglądu bez podstawy |
| Ekrany | zakres dostępu, zadania, dokumenty, leki, historia w zakresie |
| CTA | “Zobacz zakres dostępu”, “Dodaj obserwację”, “Przejdź do zadań” |

## Persona: osoba wspierająca dorosłego pacjenta

| Obszar | Treść |
|---|---|
| Problem | chce pomóc, ale nie powinna widzieć wszystkiego |
| Próbuje zrobić | przypomnieć o dokumencie, wizycie, lekach organizacyjnie |
| Frustracje | chaos komunikacji rodzinnej |
| Potrzebuje | ograniczonego dostępu i jasnych zadań |
| Pacjent360 daje | wsparcie w zakresie zgody |
| Nie obiecywać | dostępu do całej historii bez zgody |
| Ekrany | zakres zgody, zadania, wizyty, dokumenty |
| CTA | “Sprawdź zadania”, “Zobacz, co udostępniono” |

## Persona: inwestor / partner

| Obszar | Treść |
|---|---|
| Problem | musi ocenić wedge, ryzyko i potencjał skali |
| Próbuje zrobić | zrozumieć, czy projekt ma realny rynek |
| Frustracje | healthtechy obiecujące za dużo za wcześnie |
| Potrzebuje | jasnego etapu, planu walidacji, granic safety |
| Pacjent360 daje | transparentny alpha + roadmapę do produktu |
| Nie obiecywać | gotowości klinicznej bez dowodu |
| Ekrany | investors, roadmap, validation, safety |
| CTA | “Porozmawiajmy o pilocie”, “Zobacz demo”, “GitHub” |

## Persona: współtwórca / contributor

| Obszar | Treść |
|---|---|
| Problem | chce pomóc, ale musi wiedzieć, gdzie projekt ma granice |
| Próbuje zrobić | znaleźć zadanie i standard pracy |
| Frustracje | chaos dokumentów, brak decyzji, brak governance |
| Potrzebuje | SSOT, backlog, DoD, safety rules |
| Pacjent360 daje | repo, blueprint, governance, issue templates |
| Nie obiecywać | nieformalnych udziałów ani roli bez procesu |
| Ekrany | README, BLUEPRINT, CONTRIBUTING, SECURITY |
| CTA | “Wybierz obszar wkładu”, “Zgłoś issue”, “Przejdź przez safety checklist” |

## DoD

- Każda persona ma problem, potrzebę, ekran i CTA.
- Opiekunowie-ludzie są rozdzieleni od agentów AI.
- Żadna persona nie dostaje obietnicy klinicznej decyzji systemu.

## DoE

- Demo ma ścieżki dla lekarza, pacjenta i opiekuna.
- Strona ma sekcje lub podstrony dla głównych person.
- Walidacja mierzy osobno lekarzy i pacjentów/opiekunów.

## FoR

Review ma sprawdzać, czy UI i copy mówią językiem danej persony, a nie językiem architektury.
