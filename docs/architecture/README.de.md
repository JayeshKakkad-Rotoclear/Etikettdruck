# Architektur – Übersicht

Diese Sektion beschreibt die strukturellen und technischen Grundlagen des Systems. Ziel ist ein klarer Kontext für Entwickler, Betreiber und Auditoren.

## Schichtenmodell
| Schicht | Technologie | Verantwortung |
| ------- | ----------- | ------------- |
| Präsentation | SvelteKit (Svelte Components) | UI, Interaktion, Client-Validierung |
| Server (Endpoints) | SvelteKit Endpoints | Auth, Geschäftslogik leichtgewichtig |
| Domain / Library | `src/lib` (TS Module) | Wiederverwendbare Services & Security Utils |
| Datenzugriff | Prisma Client | DB Abstraktion, Migrationsunterstützung |
| Infrastruktur | Docker / PostgreSQL | Laufzeit & Persistenz |

## Hauptkomponenten
- Auth Modul (`auth.ts`): Passwort Hashing, JWT Erzeugung, Session Management
- Security Middleware (`security-middleware.ts`): Kontextaufbau & Prüfungen
- CSRF & Header Utilities (`csrf.ts`)
- Input Validator (`input-validator.ts`): Konsistente Validierung
- Printer Utilities (`printer.ts`): IP Verwaltung & Formatkontrolle

## Caching & Performance
Derzeit minimal gehalten; zukünftige Optionen: In‑Memory Cache für Rollen, Materialized Views für Dashboards.

## Schnittstellen
- HTTP API (JSON)
- Drucker (ZPL via Netzwerk)

## Sicherheitsgrundlagen
- Prinzip der minimalen Rechte
- Audit Logging sicherheitsrelevanter Events
- Rate Limiting bei Login

## Entscheidungen
Siehe ADR Dateien für nachvollziehbare Alternativen & Konsequenzen.

