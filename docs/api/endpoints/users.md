# API: User Management

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | /api/users | List users |
| POST | /api/users | Create user |
| GET | /api/users/:id | Retrieve user |
| PATCH | /api/users/:id | Update user |
| DELETE | /api/users/:id | Soft delete user |

Authorization: ADMIN for creation/deletion; management roles for read.
