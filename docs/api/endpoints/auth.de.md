# API: Authentifizierung

| Methode | Pfad | Beschreibung | Hinweise |
| ------- | ---- | ------------ | -------- |
| POST | /api/auth/login | Benutzer anmelden | Rate Limit, Audit bei Fehlversuchen |
| POST | /api/auth/logout | Sitzung beenden | Session ungültig + Token verworfen |
| POST | /api/auth/refresh | Token erneuern | Nur gültige aktive Session |

## Login Ablauf
1. Credentials prüfen
2. Rate Limit aktualisieren
3. Session erzeugen (DB)
4. JWT signieren & zurückgeben

## Sicherheitsaspekte
- IP Bindung optional verifizierbar
- Fehlversuche erhöhen Zähler → Sperre möglich

