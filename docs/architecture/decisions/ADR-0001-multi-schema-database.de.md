# ADR-0001: Multi-Schema Datenbank

Status: Akzeptiert
Datum: 2025-01-15

## Kontext
Benötigt wurde eine Möglichkeit, Daten domänenspezifisch zu segmentieren ohne mehrere physische Datenbanken zu betreiben.

## Entscheidung
Nutzung mehrerer PostgreSQL Schemas (z.B. `core`, produkt‑spezifisch) mit zentral verwaltetem Prisma Schema.

## Konsequenzen
| Kategorie | Plus | Minus |
| --------- | ---- | ----- |
| Sicherheit | Isoliertere Abfragen | Rechteverwaltung komplexer |
| Betrieb | Selektive Backups möglich | Migrationen sorgfältiger |

