# Backup & Wiederherstellung

Strategie zur Sicherstellung von Datenhaltbarkeit und Wiederanlauf.

## Ziele
- Schutz vor Datenverlust (Fehler / menschliche Irrtümer)
- Wiederherstellung binnen definierter RTO/RPO

## Kennzahlen
| Begriff | Definition |
|---------|------------|
| RPO | Max. tolerierter Datenverlust (z.B. 15 Min) |
| RTO | Zeit bis System wieder voll funktionsfähig | 

## Backup Arten
- Vollbackup (täglich nachts)
- Inkrementell (alle 15 Min / WAL Streaming)
- Ad-hoc Pre-Deployment Snapshot

## Speicher
- Primär: Objekt-Storage (verschlüsselt)
- Sekundär: Replikation in zweite Region

## Ablauf (Vollbackup)
1. Konsistenz Check
2. Dump / Snapshot
3. Integritätsprüfung
4. Verschlüsselung & Upload
5. Katalog aktualisieren

## Recovery Ablauf
1. Incident Ticket eröffnen
2. Zeitpunkt wählen (<= RPO)
3. Restore in isolierte DB
4. Integritäts- & Sanity-Checks
5. Umschalten der Anwendung

## Testen
- Quartalsweise Restore-Übung dokumentieren

## Aufgaben & Ownership
| Aufgabe | Rolle |
|---------|------|
| Backup Jobs Monitoring | DevOps |
| Integritätsprüfungen | DevOps |
| Recovery Übung | DevOps + QA |

## Risiken / Mitigation
- Ungetestete Restores → Regelmäßige Übungen
- Korruption → Mehrere Versionen / Prüfsummen
- Zugriff auf Backups → Strikte IAM Policies
