# Pierwszy wedge: pętla przygotowania wizyty

Status: zatwierdzony przez autora 2026-06-10. Obowiązuje dla M4-M6 (pre-visit, validation pack, pilot).

## Decyzja

Pierwsze ostre zastosowanie Pacjent360™ to **jedna pętla z dwoma końcami**:

```text
Wedge A: rodzic / opiekun / pacjent przygotowuje wizytę osoby zależnej (telefon)
Wedge B: lekarz dostaje „Pacjenta w 90 sekund" ze źródłami i pytaniami DITL (desktop)
```

Nie budujemy „Pacjent360™ dla wszystkich pacjentów, chorób i lekarzy". Budujemy jedną dobrze przećwiczoną ścieżkę.

## Dlaczego ten wedge

Testuje cały krytyczny rdzeń bez udawania systemu decyzji medycznych:

- krąg opieki i podstawę dostępu (rodzic/opiekun ≠ agent),
- mobilny workflow pacjenta/opiekuna przed wizytą,
- desktopowy workflow lekarza,
- źródła i claimy (`sourceRefs` / `source_missing`),
- medication story (przepisane vs faktycznie przyjmowane),
- pytania DITL i statusy,
- zgody i zakresy widoczności,
- audyt,
- język bezpieczeństwa.

## Zakres MVP wedge

- wyłącznie dane syntetyczne do czasu przejścia bramki legal/privacy;
- ręczne wprowadzanie dokumentów (bez OCR, bez integracji);
- zero scrapingu P1/IKP;
- zero diagnozy, triage, oceny pilności, rekomendacji terapii;
- raport jako kontekst, nie porada;
- agenci wyłącznie jako dry-run/draft (po A0).

## Przebieg, który musi działać dla recenzenta

```text
1. Rodzic/opiekun/pacjent przygotowuje kontekst na telefonie
   (dokumenty, leki faktycznie brane, obserwacje, pytania).
2. System tworzy zadania i pytania ugruntowane w źródłach.
3. Lekarz otwiera brief na desktopie.
4. Lekarz widzi niepewności, rozbieżności i źródła obok twierdzeń.
5. Lekarz oznacza pytania (wyjaśnione / odrzucone / dalsza kontrola).
```

## Metryki walidacji (z VALIDATION_PROTOCOL)

| Metryka | Kontynuuj | Pivotuj |
| --- | ---: | ---: |
| Przydatność raportu dla lekarza (1-5) | >= 3.5 | < 2.5 |
| Zrozumiałość dla pacjenta/opiekuna | >= 4/6 | < 2/6 |
| Odczyt jako diagnoza/triage | 0 | >= 2 |

## No-go wedge

- rola rodzica/opiekuna sugeruje odpowiedzialność kliniczną;
- agent wygląda, jakby „opiekował się" pacjentem;
- raport czytany jako diagnoza albo ocena pilności;
- dane poza zakresem zgody wyciekają przez podsumowanie/eksport/komunikat błędu;
- lekarz widzi nieugruntowany claim jako fakt.
