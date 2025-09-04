# Betriebsumgebung Einrichtung

Checkliste für das Aufsetzen einer neuen Umgebung (z.B. Staging, Test, Produktion).

## Infrastruktur
- Kubernetes Namespace / Server Provisionierung
- Netzwerk / Firewall Regeln
- TLS Zertifikate

## Anwendung
- Container Registry Zugriff
- `DATABASE_URL` gesetzt
- Secrets (JWT Keys, CSRF Salt, Admin Benutzer)

## Observability
- Logging Ziel (z.B. Loki / ELK / CloudWatch)
- Metrics (Prometheus Endpoint scrape konfiguriert)
- Alerts (CPU, Fehlerquote, Latenz, DB Verfügbarkeit)

## Sicherheit
- Least-Privilege Service Accounts
- Netzwerksegmentierung
- Backup Jobs aktiv

## Validierung
| Bereich | Prüfung | Status |
|--------|---------|--------|
| DB | Verbindung & Rechte | |
| Auth | Login / Session / JWT | |
| Druck | Testlabel erfolgreich | |
| QR | Scan & Validierung | |

## Abnahme
Environment gilt als bereit wenn alle Prüfungen erfolgreich und dokumentiert.
