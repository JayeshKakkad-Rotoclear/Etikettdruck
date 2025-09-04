# Deployment

Standard Prozess für Ausrollen einer neuen Version.

## Pipeline Übersicht
1. Build (Node + TypeDoc + MkDocs Preview)
2. Container Image Build & Security Scan
3. Automatische Tests (Unit / Integration / Lint)
4. Staging Deployment (manueller Approve für Produktion)
5. Produktion Deployment (rolling)

## Voraussetzungen
- Aktuelle `.env` Variablen gepflegt
- Datenbank erreichbar (Healthcheck grün)
- Migrationsstrategie bestätigt

## Schritte
| Schritt | Aktion | Verantwortlich |
|--------|--------|----------------|
| Planung | Ticket / Scope finalisieren | Product / Tech Lead |
| Tagging | SemVer Tag erstellen | Maintainer |
| Build | CI führt Build & Scans aus | CI |
| Staging Deploy | Image nach Staging | DevOps |
| Smoke Tests | Basisfunktion prüfen | QA |
| Produktion Deploy | Rolling Update | DevOps |
| Post-Deploy Verify | Metriken / Logs | QA + DevOps |

## Rollback
1. Vorherigen Tag re-deployen
2. Falls DB Migration destruktiv war: manuelles Restore (siehe Backup & Recovery)

## Risiken & Mitigation
- Schema Änderung inkompatibel → Vorwärts-kompatible Migrationen einsetzen
- Performance Einbruch → Canary & Metriken überwachen
- Fehlende Assets → Build-Artefakte verifizieren vor Promotion

## Checks vor Go-Live
- [ ] Datenbank Migration angewandt
- [ ] Feature Flags richtig gesetzt
- [ ] Security Headers aktiv
- [ ] Error Rate < definiertem Schwellwert
