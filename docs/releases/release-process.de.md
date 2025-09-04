# Release Prozess

Definierter Ablauf zur Veröffentlichung produktionsreifer Versionen.

## Branching & Versionierung
- `main` immer releasbar
- Feature Branch → PR → Code Review → Merge
- SemVer Tags (`vMAJOR.MINOR.PATCH`)

## Kriterien für Release
- Alle Tests grün
- Keine kritischen offenen Bugs
- Sicherheits-Scans bestanden
- Dokumentation (Änderungen + Migrationshinweise) aktualisiert

## Schritt-für-Schritt
| Schritt | Beschreibung | Artefakt |
|---------|--------------|----------|
| Plan | Scope & Ziel definieren | Ticket / ADR |
| Freeze | Nur Fixes / keine neuen Features | Ankündigung |
| Tag | Git Tag setzen | vX.Y.Z |
| Build | CI Build & Scans | Images / Docs |
| Deploy Staging | Automatisch nach Tag | Staging URL |
| Verify | Smoke + Regression Checks | Testprotokoll |
| Deploy Produktion | Manueller Approve | Live |
| Post Monitoring | 24h erhöhte Überwachung | Dashboard |

## Kommunikation
- Changelog Eintrag
- Interner Broadcast (Mail/Chat)
- Optional Release Notes extern

## Hotfix Prozess
- Branch von Tag (`hotfix/x.y.z+1`)
- Fix + Tests
- Neuer Patch Tag

## Automatisierung
- CI generiert Changelog (konventionelle Commits optional)
- Release Validation Checkliste in Pipeline

## Nach Release
- Technische Schulden einplanen
- Metriken analysieren (Fehler, Performance)
