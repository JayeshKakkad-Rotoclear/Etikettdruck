# Data Overview

Purpose: High-level overview of application data domains, ownership, and lifecycle.

## Domains
| Domain | Description | Key Tables / Entities | Owner |
| ------ | ----------- | --------------------- | ----- |
| Users | Authentication, authorization | user, session | Platform |
| Products | Product / variant metadata | product_* tables | Product |
| Quality | Inspection & labeling results | inspection, label_* | QA |

## Data Lifecycle
1. Ingestion (user actions / label scans)
2. Validation (business & security rules)
3. Persistence (PostgreSQL schemas)
4. Reporting (dashboard aggregation)
5. Archival & retention (see Backup & Recovery)

## Governance
- Access controlled via roles (see `user-guides/user-roles.md`).
- All mutations audited (see security architecture).
- Schema changes follow ADR & migration process.

## Related Docs
- `data/schema.md`
- `data/migrations.md`
- `data/seeding.md`
- Contracts (QR / ZPL / File Formats)
