# Monitoring & Observability

Comprehensive guidance for monitoring the Etikettdrucker application when deployed in production.

## Objectives
- Availability tracking
- Performance metrics
- Error visibility & alerting
- Security event auditing
- Capacity planning

## Core Monitoring Pillars
| Pillar | Tooling | Key Metrics |
|--------|---------|-------------|
| Application | Prometheus + Grafana | Request rate, latency (p50/p95/p99), error rate, active sessions |
| Infrastructure | Node exporter / cAdvisor | CPU, memory, disk IO, container restarts |
| Logs | Loki / ELK | Structured app logs, audit logs, error stack traces |
| Security | Custom audit logger + SIEM | Login attempts, role changes, failed auth, suspicious patterns |
| Database | pg_stat_statements / exporter | Query latency, connections, locks, dead tuples |

## Exported Metrics (Suggested)
Expose a `/metrics` endpoint (behind auth) or sidecar collector:

| Metric | Type | Description |
|--------|------|-------------|
| `app_http_requests_total` | counter | Total handled HTTP requests |
| `app_http_request_duration_seconds` | histogram | Request latency buckets |
| `app_http_requests_in_flight` | gauge | Concurrent active requests |
| `app_auth_login_attempts_total` | counter | Login attempts (labeled by result) |
| `app_auth_sessions_active` | gauge | Active user sessions |
| `app_security_rate_limited_total` | counter | Total rate-limited events |
| `app_prisma_query_duration_seconds` | histogram | DB query execution time |
| `app_printer_jobs_total` | counter | Print jobs dispatched |
| `app_qr_generated_total` | counter | QR codes generated |

## Log Structure
Use structured JSON logging in production:
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

### Recommended Log Categories
- `auth` – login, logout, session refresh, failed attempts
- `security` – permission denied, role changes, suspicious activity
- `db` – slow query warnings (>500ms)
- `printer` – job dispatch, failures
- `qr` – generation stats and failures
- `api` – rate limiting, validation failures

## Alerting Strategy
| Alert | Condition | Severity |
|-------|-----------|----------|
| High error rate | 5xx > 2% over 5m | High |
| Auth failures spike | failed logins > (baseline * 3) over 10m | High |
| DB latency | p95 query time > 750ms over 10m | Medium |
| Memory pressure | container memory > 85% for 15m | Medium |
| Disk nearing full | disk usage > 90% | High |
| No traffic anomaly | requests drop to 0 for 3m (during business hours) | Critical |
| Printer failure loop | >5 failed jobs in 2m | High |
| QR generation failures | >10% failures in 10m | Medium |

## Security Event Monitoring
Capture and forward these to SIEM:

- Privilege escalation (role changes)
- Repeated failed logins from same IP
- Token tampering detection events
- Rate-limited abuse patterns
- CSRF validation failures (if abnormally high)

## Dashboards (Grafana Layout)
1. **Overview:**

   - Requests: total, by route, success vs error
   - Latency heatmap
   - Active sessions
   - Top 5 slow endpoints

2. **Authentication:**

   - Login success/failure trends
   - Rate limiting counters
   - Active sessions per role

3. **Database:**

   - Query latency histogram
   - Connections over time
   - Top slow queries (pg_stat_statements)

4. **Printing & QR:**

   - Print jobs per product line
   - Failed jobs trend
   - QR generation throughput

5. **System Health:**

   - CPU / memory / restarts
   - Node.js event loop lag (if instrumented)

## Implementation Snippet (Metrics)
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

## Node.js Event Loop Lag (Optional)
```ts
import { monitorEventLoopDelay } from 'node:perf_hooks';
const h = monitorEventLoopDelay();
h.enable();
setInterval(()=>{
  const p95 = h.percentile(95) / 1e6; // ms
  // push to gauge
}, 10000);
```

## Retention Policies
| Data Type | Retention | Rationale |
|-----------|-----------|-----------|
| Application logs | 30 days (hot), 180 days (archive) | Audit & debugging |
| Metrics | 15 days high-res, 13 months rollup | Trend & capacity |
| Audit/security logs | 1 year | Compliance |
| Trace samples (if enabled) | 7 days | Performance triage |

## Capacity Planning Inputs
Track:

- Users active per hour
- Peak request concurrency
- DB connections & pool saturation
- Print job volume growth rate
- QR generation volume growth rate

## Runbook References
- See `operations/runbooks/troubleshooting.md` (create) for remediation flows
- See `operations/runbooks/security-incidents.md` for escalation

## Future Enhancements
- Distributed tracing (OpenTelemetry)
- Anomaly detection for process deviations
- Synthetic canary jobs for printer/QR subsystems
- Frontend RUM (web vitals) collection

---