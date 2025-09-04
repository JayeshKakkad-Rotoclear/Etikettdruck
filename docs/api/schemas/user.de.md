# Schema: Benutzer-Objekte

| Feld      | Typ              | Hinweise             |
| --------- | ---------------- | -------------------- |
| id        | int              | Primärschlüssel      |
| username  | string           | Eindeutig            |
| email     | string           | Eindeutig, validiert |
| role      | enum(UserRole)   | Berechtigungsumfang  |
| status    | enum(UserStatus) | ACTIVE / DISABLED    |
| createdAt | timestamp        | Audit                |

Siehe das Prisma-Schema als maßgebliche Definition.

---
