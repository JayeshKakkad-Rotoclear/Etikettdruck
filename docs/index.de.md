# Etikettdrucker Dokumentation

Willkommen zur umfassenden Dokumentation des Etikettdrucker Qualitäts‑ und Etikettiersystems. Diese Seite dient als Einstiegspunkt und verlinkt auf alle relevanten Bereiche: Installation, Architektur, API, Betrieb und Prozesse.

## Ziele der Dokumentation
- Schneller Start für Entwickler und Prüfer
- Einheitliche Sicherheits‑ und Betriebsstandards
- Nachvollziehbarkeit technischer Entscheidungen (ADRs)
- Transparente API- und Datenmodelle

## Inhaltsübersicht
| Bereich | Zweck |
| ------- | ----- |
| Einstieg | Schnelles Aufsetzen einer lokalen Umgebung |
| Benutzerhandbuch | Bedienung & Workflows für Rollen |
| Architektur | Technische & fachliche Struktur |
| API Referenz | Endpunkte, Auth & Schemas |
| Datenschicht | Modelle, Migrationen & Verträge |
| Entwicklung | Standards, Tests & Debugging |
| Betrieb | Deployment, Monitoring, Runbooks |
| Releases | Changelog, Prozesse, Migrationen |

## Technologie-Stack (Kurz)
- Frontend / Server Rendering: SvelteKit (TypeScript)
- Programmiersprache: TypeScript / Node.js 20
- Datenbank / ORM: PostgreSQL + Prisma
- Authentifizierung: Hybrid JWT + DB Session
- Dokumentation: MkDocs (Material), TypeDoc
- Container: Docker (mehrstufiger Build)

## Sicherheit – Kernpunkte
- Starke Passwortregeln & Hashing (bcrypt, 14 Rounds)
- Rate Limiting & Audit Events (SecurityAuditLogger)
- CSRF Schutz, IP‑Bindung optional
- Rollenkonzept (Viewer → Admin)

## Nächste Schritte
1. Lies „Einstieg“ / `getting-started.de.md`
2. Starte lokale Umgebung
3. Erstelle einen Admin (siehe Admin Einrichtung)
4. Prüfe Beispiel-Workflows (Qualitätskontrolle)

## Feedback
Verbesserungen oder Korrekturen bitte über Pull Request oder Issue im Repository einreichen.

