# API: Benutzerverwaltung

| Methode | Pfad            | Beschreibung           |
| ------- | --------------- | ---------------------- |
| GET     | /api/users      | Benutzer auflisten     |
| POST    | /api/users      | Benutzer anlegen       |
| GET     | /api/users/\:id | Benutzer abrufen       |
| PATCH   | /api/users/\:id | Benutzer aktualisieren |
| DELETE  | /api/users/\:id | Soft-Delete Benutzer   |

Autorisierung: **ADMIN** für Anlage/Löschung; **Management**-Rollen für Lesezugriff.

---
