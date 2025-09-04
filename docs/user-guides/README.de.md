# Benutzerhandbuch – Übersicht

Dieses Kapitel erklärt die Nutzung der Anwendung für verschiedene Rollen (Viewer, Prüfer A/B, Management, Admin). Es fokussiert auf tägliche Abläufe statt Implementierungsdetails.

## Struktur
| Datei | Inhalt |
| ----- | ------ |
| `admin-setup.de.md` | Erstkonfiguration & Adminanlage |
| `user-roles.de.md` | Rechte & Rollenhierarchie |
| `quality-control-workflow.de.md` | Prüffluss vom Scan bis zum Label |
| `dashboard-analytics.de.md` | Metriken & Interpretationen |

## Grundprinzipien
- Minimal nötige Rechte pro Rolle
- Transparente Auditierung sicherheitsrelevanter Aktionen
- Konsistentes Feedback bei Validierungsfehlern

## Häufige Aktionen
| Aktion | Rolle | Beschreibung |
| ------ | ----- | ------------ |
| Login | Alle | Authentifizierung & Session Start |
| Scan/Erfassung | Prüfer A/B | Eingabe von Produktions- oder Batchdaten |
| Labeldruck | Prüfer | Erzeugung/Neudruck Etikett |
| Dashboard Sicht | Management | KPI Monitoring |
| Benutzerverwaltung | Admin | Rollen ändern / Benutzer sperren |

## Sicherheit für Anwender
- Keine Passwörter im Klartext speichern
- Abmelden bei Arbeitsplatzwechsel
- Verdächtiges Verhalten sofort melden (siehe Runbook Sicherheitsvorfälle)

