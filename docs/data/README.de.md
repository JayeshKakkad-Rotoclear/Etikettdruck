# Datenüberblick

Zweck: Überblick über Datendomänen, Verantwortlichkeiten und Lebenszyklus der Anwendung.

## Domänen

| Domäne   | Beschreibung                     | Zentrale Tabellen/Entities | Owner    |
| -------- | -------------------------------- | -------------------------- | -------- |
| Users    | Authentifizierung, Autorisierung | user, session              | Platform |
| Products | Produkt-/Varianten-Metadaten     | product\_\* Tabellen       | Product  |
| Quality  | Prüf- & Etikettierergebnisse     | inspection, label\_\*      | QA       |

## Datenlebenszyklus

1. Erfassung (User-Aktionen / Label-Scans)
2. Validierung (Fachlogik & Sicherheitsregeln)
3. Persistenz (PostgreSQL-Schemas)
4. Reporting (Dashboard-Aggregationen)
5. Archivierung & Aufbewahrung (siehe Backup & Recovery)

## Governance

* Zugriff über Rollen gesteuert (siehe `user-guides/user-roles.md`).
* Alle Mutationen werden auditiert (siehe Sicherheitsarchitektur).
* Schema-Änderungen folgen ADR- und Migrationsprozess.

## Verwandte Dokumente

* `data/schema.md`
* `data/migrations.md`
* `data/seeding.md`
* Verträge (QR / ZPL / Dateiformate)

---
