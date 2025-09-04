# Sicherheitsarchitektur

## Ziele
- Vertraulichkeit, Integrität, Nachvollziehbarkeit
- Minimierung lateraler Bewegungen durch eingeschränkte Rollen

## Authentifizierung
- Hybrides Modell: JWT mit serverseitiger Sitzungsvalidierung (Revokation, IP Binding optional)

## Autorisierung
- Rollenbasiert (siehe Benutzerrollen)
- Kontext in Middleware aufgebaut (SecurityMiddleware)

## Überwachung & Audit
- `SecurityAuditLogger` protokolliert sicherheitsrelevante Ereignisse (Rate Limit, Token Fehler, IP Mismatch)

## Schutzmechanismen
| Bereich | Mechanismus |
| ------- | ----------- |
| Passwörter | Bcrypt 14 Rounds |
| Sitzungen | Ablauf + optional IP Bindung |
| Login | Rate Limiting & Sperrfristen |
| Eingaben | Zentrale Validierung (InputValidator) |
| CSRF | Tokens & sichere Header |

## Risiken & Gegenmaßnahmen (Auszug)
| Risiko | Maßnahme |
| ------ | -------- |
| Token Diebstahl | Kurze Laufzeit + Session Revokation |
| Brute Force | Rate Limit + Sperre |
| Injektionen | Parametrisierte Queries über Prisma |

