# Pacjent360 Governance V2 - Standing Delegation

Status: **ACTIVE AND RATIFIED**
Ratified by: Sebastian Kalisz, Founder (`P360-FOUNDER-SEBASTIAN-KALISZ-01`)
Ratified at: `2026-07-10T17:58:26+02:00`
Reviewer-separation amendment: direct Founder decision, `2026-07-10`; recorded in `docs/governance/DECISION_LOG.md`

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

## 1. Cel

Governance V2 oddziela strategiczną kontrolę Foundera od odwracalnej realizacji technicznej. Founder zatwierdza kierunek, granice produktu i działania nieodwracalne. Codex samodzielnie prowadzi wykonanie aktywnego work orderu do technicznego wyniku.

## 2. Standing mandate Codexa

W granicach aktywnego work orderu Codex może bez każdorazowej zgody:

- analizować repo i dokumentację;
- tworzyć, edytować i usuwać artefakty należące do zatwierdzonego zakresu;
- aktualizować manifesty, allowlisty, Decision Log, evidence i testy;
- wykonywać stage, commit i amend na bieżącej gałęzi;
- tworzyć i usuwać bezpieczne tymczasowe worktree do walidacji;
- naprawiać testy, guardy, dokumentację i niespójności ujawnione przez review;
- rozszerzać path set, gdy jest to konieczne do spełnienia aktywnego celu i nie wchodzi w obszar wymagający decyzji Foundera;
- wykonywać serię kontroli i przedstawić jeden zbiorczy Decision Pack na końcu.

Codex zachowuje istniejące, niepowiązane zmiany użytkownika i nie przypisuje ich do własnego commita.

## 3. Decyzje zastrzeżone dla Foundera

Osobnej, uprzedniej zgody wymagają wyłącznie:

1. zmiana product boundary;
2. użycie realnych danych zdrowotnych;
3. aktywacja funkcji regulowanych, w tym AI/LLM/OCR, CDSS, diagnozy, triage, interpretacji klinicznej albo lekarza jako current user;
4. destrukcyjne operacje Git;
5. push, PR, release i deployment.

Brak odpowiedzi Foundera nie jest zgodą dla tych pięciu kategorii.

## 4. Kontrole bez mikrobramek

- Testy, guardy i clean-checkout proof pozostają obowiązkowe, ale Codex wykonuje je autonomicznie.
- Allowlista jest dowodem zakresu po wykonaniu, a nie mechanizmem proszenia o zgodę na każdy plik.
- Odwracalne korekty techniczne są dokumentowane w Decision Logu zbiorczo.
- Codex może wydać `TECHNICAL PASS`, `FIX` albo `BLOCKED`; nie podpisuje opinii prawnej, clinical-safety acceptance ani human-owned gate.

### Rozdział implementacji, review i G0

- Codex pozostaje implementerem aktywnego work orderu.
- GPT 5.6 SOL jest oddzielnym, read-only technical S0 reviewerem i może wydać techniczny werdykt `GO-S1`, `FIX` albo `NO-GO`.
- Sebastian Kalisz pozostaje Founderem i nie pełni roli reviewera S0.
- Akt review GPT 5.6 SOL i późniejszy akt Foundera dotyczący G0 są dwoma odrębnymi zapisami. GPT 5.6 SOL nie może podpisać G0 ani zastąpić podpisu Foundera.
- Wpis o powołaniu modelu jest repozytoryjną decyzją governance; nie jest kwalifikowanym podpisem, model attestation ani human assurance.

## 5. Precedencja

Ten dokument supersedes wszystkie wcześniejsze bezwzględne zakazy oraz wymagania osobnej zgody na read/edit/stage/commit/amend w aktywnym work orderze, w tym odpowiadające im klauzule w Founder Control Pack, WO-S0, Execution Plan, Product Constitution, Definition of Ready/Done i wcześniejszych evidence packach. Autonomiczne stage, commit i amend w aktywnym work orderze są dozwolone.

Nie zmienia D1-D8, current wedge, granicy No-CDSS, statusu `synthetic-only`, G0 ani katalogu decyzji zastrzeżonych dla Foundera. Push, PR, release, deployment i destrukcyjne operacje Git nadal wymagają uprzedniej zgody Foundera.

## 6. Ratyfikacja

Founder ratyfikował:

> Ratyfikuję Pacjent360 Governance V2 i udzielam Codexowi stałego mandatu do autonomicznej realizacji, edycji, stage, commit i amend w granicach aktywnego work orderu. Osobnej zgody wymagają wyłącznie product-boundary changes, realne dane, funkcje regulowane, destrukcyjne operacje Git oraz push, PR, release i deployment.
