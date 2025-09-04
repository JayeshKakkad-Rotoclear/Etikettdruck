# Datenarchitektur

Das System nutzt mehrere PostgreSQL Schemas zur logischen Segmentierung (z.B. `core`, produktspezifische Bereiche). Vorteile: Übersichtlichkeit, differenzierte Migrationen, Berechtigungsgrenzen.

## Prinzipien
- Strikte Namenskonventionen
- Alle Beziehungen klar typisiert über Prisma
- Änderungen nur via Migrationen

## Integrität
- Foreign Keys & Constraints
- Validierungen serverseitig zusätzlich zur Client Prüfung

## Migrationsprozess
Siehe Datei `migrations.de.md`.

