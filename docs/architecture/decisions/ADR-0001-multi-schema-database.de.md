# ADR-0001: Multi-Schema-Datenbank

**Status:** Angenommen
**Datum:** 15.07.2025

## Kontext

Wir benötigen Isolation zwischen Produktlinien und gemeinsam genutzten Core-Tabellen, während nur eine einzelne PostgreSQL-Instanz verwendet wird.

## Entscheidung

Einsatz mehrerer PostgreSQL-Schemas zur logischen Partitionierung der Domänendaten (z. B. core, c2, cpro, cbasic); die Modelle werden durch Prisma verwaltet.

## Konsequenzen

Vorteile: Logische Isolation, einfachere Backups pro Schema.
Nachteile: Etwas komplexere Migrationen und Cross-Schema-Abfragen.

---
