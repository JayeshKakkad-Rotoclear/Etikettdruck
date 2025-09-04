# API: Benutzerverwaltung

| Methode | Pfad | Beschreibung | Rolle |
| ------- | ---- | ------------ | ----- |
| GET | /api/users | Benutzerliste | MANAGEMENT / ADMIN |
| POST | /api/users | Benutzer anlegen | ADMIN |
| GET | /api/users/:id | Benutzer anzeigen | MANAGEMENT / ADMIN |
| PATCH | /api/users/:id | Benutzer aktualisieren | ADMIN |
| DELETE | /api/users/:id | Benutzer deaktivieren | ADMIN |

Soft Delete statt Hard Delete zur Nachvollziehbarkeit.

