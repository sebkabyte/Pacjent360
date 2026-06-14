# Decision Log

Status: gotowy szablon do używania

## Jak używać

Każda ważna decyzja strategiczna, produktowa, prawna, techniczna albo komunikacyjna powinna trafić tutaj. Nie zapisujemy wszystkiego. Zapisujemy to, do czego trzeba będzie wrócić.

## Format decyzji

```markdown
## YYYY-MM-DD - Tytuł decyzji

Data:
Decyzja:
Kontekst:
Alternatywy:
Wybrany wariant:
Dlaczego:
Konsekwencje:
Ryzyka:
DoD:
DoE:
Kiedy wrócić do decyzji:
Owner:
```

## Decyzje startowe do uzupełnienia

### 2026-06-14 - Master Blueprint jako command center

Data: 2026-06-14  
Decyzja: `BLUEPRINT/` staje się centralnym miejscem strategicznego myślenia o projekcie.  
Kontekst: projekt ma wiele dokumentów, planów, promptów, materiałów TEMP i zmian WWW/demo.  
Alternatywy: zostawić rozproszone dokumenty; przepisać wszystko od zera; utrzymać tylko README.  
Wybrany wariant: master blueprint jako warstwa decyzyjna nad repo.  
Dlaczego: founder potrzebuje jasności, nie kolejnego backlogu bez hierarchii.  
Konsekwencje: nowe pomysły powinny być mapowane do blueprintu albo decision log.  
Ryzyka: blueprint stanie się zbyt długi albo nieaktualny.  
DoD: komplet plików w `BLUEPRINT/`.  
DoE: founder potrafi wskazać następny najlepszy ruch.  
Kiedy wrócić do decyzji: po pierwszej walidacji z użytkownikami.  
Owner: founder.

## DoD

- Każda ważna decyzja ma datę, kontekst, alternatywy i konsekwencje.
- Decyzje strategiczne nie zostają wyłącznie w rozmowach ani promptach.
- Founder może wrócić do decyzji i zrozumieć, dlaczego została podjęta.

## DoE

- Minimum jedna decyzja jest wpisana po każdym milestone review.
- Decyzje mają ownera i datę ponownego przeglądu.
- Roadmapa i priorytety odwołują się do zapisanych decyzji.

## FoR

Review decision log ma sprawdzać, czy decyzje są odwracalne, kiedy trzeba do nich wrócić i jakie ryzyko zamykają.
