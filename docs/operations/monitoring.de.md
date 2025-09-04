# Monitoring

Überwachung stellt Betriebsfähigkeit, Performance und Sicherheit sicher.

## Ziele
- Früherkennung von Problemen
- Messung gegen SLOs
- Grundlage für Kapazitätsplanung

## Kernmetriken
| Kategorie | Metrik | Beschreibung | Schwelle |
|-----------|-------|--------------|----------|
| System | CPU Usage | Auslastung Container/Host | >80% 5m |
| System | Memory RSS | Arbeitsspeicherverbrauch | >85% |
| App | Request Error Rate | 5xx / Gesamt | >2% |
| App | P95 Latenz | Antwortzeit | >800ms |
| DB | Verbindungsanzahl | Aktive Connections | >90% Pool |
| Security | Fehlgeschl. Logins | Brute Force Indikator | Spike > 3x Median |

## Dashboards
- Übersicht: System & App Health
- Qualität: Durchsatz Prüfungen / Etiketten
- Sicherheit: Login Muster & Rate Limits

## Alerting
| Alert | Bedingung | Aktion |
|-------|-----------|--------|
| Hohe Fehlerquote | 5xx >2% 5m | Investigate Logs |
| Latenz Anstieg | P95 >800ms 10m | Profiling / Skalierung |
| DB Pool Sättigung | >90% 5m | Pool erhöhen / Leaks prüfen |
| Login Spike | Fehlversuche > Schwelle | Account Schutz / Rate Limit prüfen |

## Logs
- Strukturierte JSON Logs
- Korrelation mit Trace/Request ID (falls vorhanden)

## Metrik Export
Prometheus Endpoint `/metrics` (weiterer Ausbau möglich).

## Kapazitätsplanung
Monatliche Auswertung Trends (CPU, Speicher, Throughput) → Skalierungsentscheidungen.
