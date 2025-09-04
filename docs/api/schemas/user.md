# Schema: User Objects

| Field | Type | Notes |
| ----- | ---- | ----- |
| id | int | Primary key |
| username | string | Unique |
| email | string | Unique, validated |
| role | enum(UserRole) | Authorization scope |
| status | enum(UserStatus) | ACTIVE / DISABLED |
| createdAt | timestamp | Audit |

See Prisma schema for authoritative definition.
