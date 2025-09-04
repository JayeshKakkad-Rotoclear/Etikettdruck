# Migrations

Process:
1. Create migration (Prisma) & review SQL
2. Apply in staging
3. Run smoke tests / backfill scripts
4. Promote to production during maintenance window

Rollback: Prefer forward-fix; destructive reversions require DBA approval.
