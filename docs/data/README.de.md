# Daten – Übersicht

Zweck: Hochlevel-Überblick über die Daten-Domänen der Anwendung, Verantwortlichkeiten und Lebenszyklus.

## Domänen
| Domäne | Beschreibung | Zentrale Tabellen / Entitäten | Owner |
| ------ | ------------ | ----------------------------- | ----- |
| Benutzer | Authentifizierung & Authorisierung | user, session | Plattform |
| Produkte | Produkt- / Varianten-Metadaten | product_* Tabellen | Produkt |
| Qualität | Prüf- & Etikettierergebnisse | inspection, label_* | QA |

## Daten-Lebenszyklus
1. Erfassung (Benutzeraktionen / Label-Scans)
2. Validierung (Business- & Sicherheitsregeln)
3. Persistenz (PostgreSQL Schemas)
4. Reporting (Dashboard Aggregation)
5. Archivierung & Aufbewahrung (siehe Backup & Recovery)

## Governance
- Zugriff über Rollen gesteuert (siehe `user-guides/user-roles.de.md`).
- Alle Mutationen werden auditiert (siehe Sicherheitsarchitektur).
- Schemaänderungen folgen ADR- & Migrationsprozess.

## Verwandte Dokumente
- `data/schema.de.md`
- `data/migrations.de.md`
- `data/seeding.de.md`
- Verträge (QR / ZPL / Dateiformate)
