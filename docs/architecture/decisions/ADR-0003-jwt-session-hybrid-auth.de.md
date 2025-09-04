# ADR-0003: Hybride Authentifizierung mit JWT und Session

**Status:** Angenommen
**Datum:** 25.07.2025

## Kontext

Wir benötigen die Vorteile zustandsloser JWTs (skalierbare Clients) sowie die Möglichkeit, Sitzungen aus Sicherheitsgründen zentral zu widerrufen und nachzuverfolgen.

## Entscheidung

Ausgabe signierter JWTs, die an einen serverseitigen Sitzungsdatensatz (Datenbank) gebunden sind; optional mit IP-Bindung zur Risikominderung.

## Konsequenzen

Vorteile: Widerruf, Auditing, horizontale Skalierung.
Nachteile: Zusätzliche Datenbankabfragen bei der Validierung.

---
