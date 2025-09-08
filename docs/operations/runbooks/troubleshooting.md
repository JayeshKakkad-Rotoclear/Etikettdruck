# Troubleshooting Runbook

Operational guide for diagnosing and resolving common production issues.

## Quick Diagnostic Checklist
1. Is the app responding to health check? (`/health` if implemented)
2. Error rate spike? (Check metrics dashboard)
3. Any recent deploys? (Check CI/CD history)
4. Database connectivity healthy? (pg connections, latency)
5. Authentication failures unusual? (audit log)
6. Resource saturation? (CPU, memory, disk, file descriptors)

## Common Issues

### 1. High Error Rate (5xx)
| Step | Action | Command/Tool |
|------|--------|--------------|
| 1 | Identify top failing routes | Metrics dashboard |
| 2 | Inspect recent deploy diff | `git show` |
| 3 | Check logs for stack traces | Loki / tail logs |
| 4 | Verify DB connectivity | `psql` simple query |
| 5 | Roll back if regression | CI/CD rollback |

### 2. Slow Responses

1. Check latency histogram p95/p99
2. Identify if DB bound (query time)
3. Look for blocking logs or long queries
4. Add temporary profiling (enable detailed logging)
5. Scale horizontally if saturation present

### 3. Authentication Failures Spike
| Cause | Remediation |
|-------|------------|
| Incorrect secret rotation | Sync env vars across nodes |
| Session store inconsistency | Flush old sessions / restart cluster |
| Brute force attempt | Temporarily block offending IP, raise security event |

### 4. Printer Subsystem Failures
| Symptom | Action |
|---------|--------|
| Jobs not dispatching | Check network reachability to printer IP |
| High retry counts | Inspect job queue handler logs |
| Wrong label format | Validate ZPL template versions |

### 5. QR Generation Failures
| Symptom | Action |
|---------|--------|
| Null QR codes | Check DB rows for missing `qr_code_automatiktest` field |
| Incorrect content | Validate encoding logic & input sanitizer |
| High latency | Cache repeated generations if applicable |

### 6. Database Connection Saturation

1. Check active vs max connections 
2. Identify long-running queries 
3. Increase pool size cautiously
4. Add indexing if repetitive scans

### 7. Memory Leak Suspected

1. Enable heap snapshot (if safe)
2. Check object retention via inspector
3. Verify large in-memory caches not unbounded
4. Restart process as temporary mitigation

## Log Patterns
| Pattern | Meaning | Action |
|---------|---------|--------|
| `rate_limited` | Flood or abuse attempts | Inspect source IPs |
| `auth_failed` | Invalid login | Monitor for brute force |
| `db_slow_query` | Query > threshold | Analyze execution plan |
| `printer_dispatch_error` | Printer unreachable | Network / config check |
| `qr_generation_error` | Input invalid or encode failure | Validate upstream input |

## Escalation Matrix
| Severity | Criteria | Action | Notify |
|----------|----------|--------|--------|
| Critical | Outage > 5m / data risk | Engage incident channel | Dev + Security |
| High | Error rate > 5% sustained | Hotfix or rollback | Dev |
| Medium | Performance regression | Schedule fix | Product |
| Low | Minor defect / cosmetic | Backlog item | Product |

## Temporary Mitigations
| Issue | Mitigation |
|-------|-----------|
| Hot path DB latency | Add in-memory cache layer |
| Printer overload | Queue with rate control |
| High auth load | Add exponential backoff to login UI |
| Elevated brute force | Add IP deny rule / WAF rule |

## Forensic Capture (When Needed)
1. Export error logs (time window)
2. Capture DB state: active connections, slow queries
3. Archive configuration snapshot
4. Preserve failing payload examples

## Post-Incident Actions
- Root cause analysis (RCA) within 48h
- Remediation tasks ticketed
- Update runbook if gap discovered
- Communicate summary to stakeholders

## Tooling Wishlist
- Automated anomaly detection
- Distributed tracing (OpenTelemetry)
- Canary transaction script
- Synthetic printer subsystem health check

---
