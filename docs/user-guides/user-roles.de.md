# Benutzerrollen

Die Plattform verwendet ein hierarchisches Rollenmodell. Rechte sind kumulativ – höhere Rollen beinhalten untergeordnete Fähigkeiten.

| Rolle | Primäre Fähigkeiten | Beispiele |
| ----- | ------------------ | --------- |
| VIEWER | Read-only UI & Dashboards | KPI Ansicht |
| PRUEFER_B | Grundlegende Prüfungen & Etikettendruck | Scan & Druck |
| PRUEFER_A | Erweiterte Prüf- & Freigabeschritte | Freigabe komplexer Fälle |
| PRUEFER_AB | Kombiniert A + B | Alle Prüfschritte |
| MANAGEMENT | Analysen, Trend-Dashboards | Produktions KPI |
| ADMIN | Vollzugriff + Benutzer/Rollen Verwaltung | Sperren, Passwort Reset |

## Rollenhierarchie (Absteigend)
`ADMIN > MANAGEMENT > PRUEFER_AB > PRUEFER_A > PRUEFER_B > VIEWER`

## Sicherheitsprinzipien
- Geringste notwendige Rechte
- Trennung von Verwaltung und operativer Prüfung
- Protokollierung kritischer Änderungen (Audit Log)

