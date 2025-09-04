# Security Incident Runbook

Guidance for detecting, triaging, responding to, and recovering from security incidents.

## Incident Categories
| Category | Examples | Severity Potential |
|----------|----------|--------------------|
| Authentication Abuse | Brute force, credential stuffing | High |
| Privilege Escalation | Unauthorized role change | Critical |
| Data Exposure | Sensitive data in logs | Critical |
| Integrity Attack | Tampered JWT/session | Critical |
| Availability | Targeted DoS of auth / DB | High |

## Detection Signals
| Signal | Source | Action |
|--------|--------|--------|
| Repeated failed logins | Auth logs / metric | Threshold alert & IP correlation |
| Sudden role changes | Audit log | Verify initiator legitimacy |
| Suspicious geo/IP pattern | Aggregated logs | Correlate with user history |
| Token validation failures | Auth module | Inspect for tampering attempt |
| Rate limit spikes | Security middleware | Determine abuse vs load |

## Initial Triage (First 15 Minutes)
1. Confirm alert fidelity (false positive?)
2. Determine scope: single user / system-wide
3. Preserve volatile evidence (logs, session states)
4. If active exploitation: contain (isolate service / block IP / disable account)
5. Assign incident commander and scribe

## Containment Actions
| Scenario | Action |
|----------|--------|
| Compromised account | Invalidate sessions + force password reset |
| Token forging attempt | Rotate signing secret (invalidate all tokens) |
| Privilege misuse | Revoke elevated roles + audit changes |
| Coordinated brute force | Temporary IP block + CAPTCHA/wait step |
| Data leakage in logs | Pull offending logs, purge from searchable index |

## Evidence Collection
| Artifact | Method |
|---------|--------|
| Auth logs | Export filtered time window |
| Audit events | Query `security_audit` store (if implemented) |
| DB changes | Compare snapshots / transaction logs |
| Network flows | Firewall / reverse proxy logs |
| JWT samples | Capture raw header/body for validation |

## Communication Templates
### Internal Alert (Slack / Email)
```
Incident: Potential privilege escalation detected
Time: 2025-09-04 14:22 UTC
Scope: 1 user account elevated from ROLE_USER to ROLE_ADMIN
Actions Taken: Session invalidated, account locked pending review
Next Steps: Review audit chain, confirm initiator legitimacy
Lead: <name>
```

### Stakeholder Summary (Post-Containment)
```
Summary: Unauthorized role escalation attempt contained.
Impact: No confirmed data access beyond original permissions.
Remediation: Added alert on role change burst, rotated token secret.
Follow-up: Implement additional confirmation step for admin elevation.
```

## Eradication & Recovery
| Step | Action |
|------|--------|
| 1 | Patch exploited vulnerability / misconfiguration |
| 2 | Rotate credentials / secrets |
| 3 | Rebuild compromised components (if required) |
| 4 | Restore clean DB snapshot (data corruption scenarios) |
| 5 | Re-enable user access incrementally |
| 6 | Increase monitoring temporarily |

## Root Cause Analysis (RCA)
Include:
- Timeline of events
- Detection vector
- Impact assessment
- Containment success factors
- Preventative gaps
- Action items (owner + due date)

## Preventative Controls Checklist
| Control | Status |
|---------|--------|
| Strong password policy enforcement | TODO |
| Rate limiting on auth endpoints | Implemented |
| Audit logging for role changes | Implemented |
| JWT signing key rotation schedule | TODO |
| Session inactivity timeout | Implemented |
| Brute force IP throttling | Implemented |
| Admin action confirmation (step-up auth) | TODO |

## Post-Incident Hardening Ideas
- Add anomaly detection for session geography shifts
- Implement WebAuthn for privileged roles
- Add honey tokens / decoy accounts
- Automatic session revocation on password change

## Escalation Matrix
| Escalate To | When |
|-------------|------|
| Development Lead | Technical containment complexity |
| Security Officer | Data exposure suspected |
| Legal / Compliance | Personal data exposure confirmed |
| Management | Incident > 2 hours unresolved |

---
**Status:** Draft (Customize contact & escalation policy)
