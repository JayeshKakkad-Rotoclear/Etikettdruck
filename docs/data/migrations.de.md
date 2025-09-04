# Migrationen

Vorgehen:

1. Migration (Prisma) erstellen & SQL prüfen
2. In Staging anwenden
3. Smoke-Tests / Backfill-Skripte ausführen
4. In Wartungsfenster nach Produktion promoten

Rollback: **Forward-Fix** bevorzugen; destruktive Rücknahmen nur mit DBA-Freigabe.

---
