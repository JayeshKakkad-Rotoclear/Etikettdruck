# Technische Architektur

| Bereich | Technologie | Begründung |
| ------- | ----------- | ---------- |
| UI / SSR | SvelteKit | Einheitliches Full‑Stack Modell |
| Sprache | TypeScript | Statische Typisierung, DX |
| ORM | Prisma | Migrationsfluss & Typen |
| DB | PostgreSQL | ACID, Erweiterbarkeit |
| Auth | JWT + Session | Sicherheit + Revokation |
| Dokumentation | MkDocs + TypeDoc | Einheitliche Referenz |
| Container | Docker Multi-Stage | Schlanke Runtime |

## Build Pipeline (Dokumentation)
1. TypeDoc generiert Markdown API Referenz
2. MkDocs rendert komplette Site (inkl. i18n)
3. Container dient dynamisch

## Erweiterungen Geplant
- Security Headers Hardening Proxy
- Optionale Caching Ebene

