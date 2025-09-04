# Migrationen

Prozess:
1. Migration erstellen (Prisma) & SQL prüfen
2. In Staging anwenden
3. Smoke Tests / Backfill Skripte ausführen
4. In Produktion während Wartungsfenster promoten

Rollback: Bevorzugt Forward-Fix; destruktive Rücknahmen benötigen DBA Freigabe.
