# API: Produkte

| Methode | Pfad | Beschreibung | Rolle |
| ------- | ---- | ------------ | ----- |
| GET | /api/products | Produkte auflisten | Prüfer / höher |
| POST | /api/products | Produkt anlegen | MANAGEMENT / ADMIN |
| GET | /api/products/:id | Produkt anzeigen | Prüfer / höher |
| PATCH | /api/products/:id | Produkt aktualisieren | MANAGEMENT / ADMIN |

Änderungen auditierbar; Validierung auf Eindeutigkeit von Codes.

