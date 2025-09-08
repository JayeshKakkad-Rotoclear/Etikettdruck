# Monitoring & Observability

Umfassende Anleitung für das Monitoring der Etikettdrucker-Anwendung im Produktivbetrieb.

## Ziele

* Verfügbarkeit nachverfolgen
* Performance-Metriken
* Fehlersichtbarkeit & Alarmierung
* Auditing von Sicherheitsereignissen
* Kapazitätsplanung

## Kernpfeiler des Monitorings

| Säule         | Tooling                         | Wichtige Metriken                                                          |
| ------------- | ------------------------------- | -------------------------------------------------------------------------- |
| Anwendung     | Prometheus + Grafana            | Request-Rate, Latenz (p50/p95/p99), Fehlerrate, aktive Sessions            |
| Infrastruktur | Node exporter / cAdvisor        | CPU, Speicher, Disk-I/O, Container-Restarts                                |
| Logs          | Loki / ELK                      | Strukturierte App-Logs, Audit-Logs, Fehler-Stacktraces                     |
| Sicherheit    | Custom Audit Logger + SIEM      | Login-Versuche, Rollenänderungen, fehlgeschlagene Auth, verdächtige Muster |
| Datenbank     | pg\_stat\_statements / Exporter | Query-Latenz, Verbindungen, Locks, Dead Tuples                             |

## Exportierte Metriken (Vorschlag)

Expose einen `/metrics`-Endpunkt (hinter Auth) oder nutze einen Sidecar-Collector:

| Metrik                              | Typ       | Beschreibung                          |
| ----------------------------------- | --------- | ------------------------------------- |
| `app_http_requests_total`           | counter   | Gesamtzahl bearbeiteter HTTP-Requests |
| `app_http_request_duration_seconds` | histogram | Verteilung der Request-Latenzen       |
| `app_http_requests_in_flight`       | gauge     | Gleichzeitige aktive Requests         |
| `app_auth_login_attempts_total`     | counter   | Login-Versuche (mit Ergebnis-Labels)  |
| `app_auth_sessions_active`          | gauge     | Aktive Benutzersitzungen              |
| `app_security_rate_limited_total`   | counter   | Rate-Limited-Ereignisse gesamt        |
| `app_prisma_query_duration_seconds` | histogram | DB-Query-Laufzeiten                   |
| `app_printer_jobs_total`            | counter   | Abgesetzte Druckaufträge              |
| `app_qr_generated_total`            | counter   | Generierte QR-Codes                   |

## Log-Struktur

In Produktion strukturierte JSON-Logs verwenden:

```json
{
  "ts": "2025-09-04T12:33:12.123Z",
  "level": "info",
  "component": "auth",
  "event": "login_success",
  "user": "jdoe",
  "ip": "192.168.1.10",
  "latency_ms": 182
}
```

### Empfohlene Log-Kategorien

* `auth` – Login, Logout, Session-Refresh, Fehlversuche
* `security` – Permission denied, Rollenänderungen, verdächtige Aktivitäten
* `db` – Warnungen bei langsamen Queries (>500 ms)
* `printer` – Job-Dispatch, Fehler
* `qr` – Generierungsstatistiken und Fehler
* `api` – Rate Limiting, Validierungsfehler

## Alarmierungsstrategie

| Alarm                   | Bedingung                                        | Schweregrad |
| ----------------------- | ------------------------------------------------ | ----------- |
| Hohe Fehlerrate         | 5xx > 2 % über 5 Min                             | Hoch        |
| Auth-Fehlerspitze       | Fehl-Logins > (Baseline × 3) über 10 Min         | Hoch        |
| DB-Latenz               | p95 Query-Zeit > 750 ms über 10 Min              | Mittel      |
| Speicherdruck           | Container-RAM > 85 % für 15 Min                  | Mittel      |
| Platte fast voll        | Belegung > 90 %                                  | Hoch        |
| Kein Traffic (Anomalie) | Requests = 0 für 3 Min (während Geschäftszeiten) | Kritisch    |
| Drucker-Fehlschleife    | >5 fehlgeschlagene Jobs in 2 Min                 | Hoch        |
| QR-Fehlerrate           | >10 % Fehlschläge in 10 Min                      | Mittel      |

## Security-Event-Monitoring

Erfassen & an das SIEM weiterleiten:

* Privileg-Esklation (Rollenänderungen)
* Wiederholte Fehl-Logins von derselben IP
* Erkennung von Token-Manipulation
* Rate-Limited-Missbrauchsmuster
* Auffällig hohe CSRF-Validierungsfehler

## Dashboards (Grafana-Layout)

1. **Overview:**

  * Requests (gesamt/Route)
  * Erfolgs- vs. Fehlerquote 
  * Latenz-Heatmap
  * aktive Sessions 
  * Top 5 langsame Endpunkte

2. **Authentication:**

  * Login-Trends Erfolg/Fehlschlag 
  * Rate-Limiting-Zähler 
  * aktive Sessions pro Rolle

3. **Database:** 

  * Query-Latenz-Histogramm
  * Verbindungen über Zeit 
  * Top-Slow-Queries (pg\_stat\_statements)

4. **Printing & QR:** 

  * Druckjobs pro Produktlinie
  * Fehlertrend
  * QR-Durchsatz

5. **System Health:** 
  
  * CPU/Speicher/Restarts
  * Node.js-Event-Loop-Lag (falls instrumentiert)

## Implementierungs-Snippet (Metriken)

```ts
// metrics.ts
import client from 'prom-client';

export const registry = new client.Registry();
client.collectDefaultMetrics({ register: registry });

export const httpRequestDuration = new client.Histogram({
  name: 'app_http_request_duration_seconds',
  help: 'Request latency distribution',
  buckets: [0.05,0.1,0.2,0.5,1,2,5],
  labelNames: ['method','route','status']
});
registry.registerMetric(httpRequestDuration);
```

## Node.js Event-Loop-Lag (optional)

```ts
import { monitorEventLoopDelay } from 'node:perf_hooks';
const h = monitorEventLoopDelay();
h.enable();
setInterval(()=>{
  const p95 = h.percentile(95) / 1e6; // ms
  // push to gauge
}, 10000);
```

## Aufbewahrungsrichtlinien

| Datentyp                 | Retention                               | Begründung         |
| ------------------------ | --------------------------------------- | ------------------ |
| Applikations-Logs        | 30 Tage (hot), 180 Tage (Archiv)        | Audit & Debugging  |
| Metriken                 | 15 Tage hochauflösend, 13 Monate Rollup | Trend & Kapazität  |
| Audit/Security-Logs      | 1 Jahr                                  | Compliance         |
| Trace-Samples (optional) | 7 Tage                                  | Performance-Triage |

## Inputs für Kapazitätsplanung

Nachverfolgen:

* Aktive Nutzer pro Stunde
* Spitzen-Konkurrenz (gleichzeitige Requests)
* DB-Verbindungen & Pool-Sättigung
* Wachstum Druckjobs
* Wachstum QR-Generierung

## Runbook-Referenzen

* Siehe `operations/runbooks/troubleshooting.md` (erstellen) für Gegenmaßnahmen
* Siehe `operations/runbooks/security-incidents.md` für Eskalationen

## Zukünftige Erweiterungen

* Distributed Tracing (OpenTelemetry)
* Anomalie-Erkennung für Prozessabweichungen
* Synthetische Canary-Jobs für Drucker/QR-Subsysteme
* Frontend-RUM (Web-Vitals)

---

**Status:** Entwurf (reale Metrik-Namen beim Implementieren ergänzen)

---
