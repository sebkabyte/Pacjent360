# ADR 0003: Granica DITL

Status: zaakceptowany

## Decyzja

Pacjent 360 stosuje zasadę DITL: Doctor in the Loop. System może porządkować dane, braki, pytania, źródła i zadania organizacyjne. System nie może diagnozować, oceniać pilności, rekomendować terapii ani zastępować decyzji lekarza.

## Clinical Safety Checklist

1. Output jest pytaniem, zadaniem, statusem albo brakiem danych.
2. Output ma źródło.
3. Pytania i flagi mają status DITL.
4. Wording nie zawiera sugestii terapii, diagnozy, pilności ani wskazania.
5. Informacje od pacjenta/opiekuna są oznaczone jako wywiad lub obserwacja, nie fakt kliniczny.

## Konsekwencje

Każda nowa flaga, reguła, raport albo automatyzacja musi przejść tę checklistę przed publikacją.
