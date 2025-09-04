# Qualitätskontroll-Workflow

Dieser Ablauf beschreibt den Kernprozess von der Erfassung bis zum gedruckten Etikett.

## Prozessschritte
| Nr | Schritt | Beschreibung | Verantwortlich |
| -- | ------ | ------------ | -------------- |
| 1 | Vorbereitung | Hardware & Netzwerk prüfen (Scanner, Drucker) | Prüfer |
| 2 | Eingabe / Scan | Produkt- oder Batchdaten erfassen | Prüfer |
| 3 | Validierung | Client: Format / Server: Geschäftsregeln | System |
| 4 | Persistenz | Datenbank schreibt Prüfdatensatz | System |
| 5 | Druck | ZPL Vorlage + IP aus Konfiguration | System |
| 6 | Review | Dashboards zeigen aggregierte Werte | Management |
| 7 | Audit Log | Sicherheits-/Anomalieereignisse speichern | System |

## Fehlerfälle & Behandlung
| Situation | Reaktion |
| --------- | -------- |
| Ungültige Eingabe | Validierungsfehler anzeigen, erneute Eingabe |
| Drucker nicht erreichbar | Retry & Hinweis an Bediener |
| Session abgelaufen | Re-Login erzwingen |

## Qualitätsmetriken
- Fehlerquote (Rejected / Gesamt)
- Reprint Rate
- Durchsatz pro Zeiteinheit

