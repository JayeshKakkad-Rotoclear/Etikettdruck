# Schema: Benutzer Objekt

| Feld | Typ | Beschreibung |
| ---- | --- | ------------ |
| id | int | Primärschlüssel |
| username | string | Eindeutig |
| email | string | Eindeutig, validiert |
| role | enum(UserRole) | Autorisierungsrolle |
| status | enum(UserStatus) | ACTIVE / DISABLED |
| createdAt | timestamp | Erstellzeit |

Siehe Prisma Schema für Quelle.

