# Backup & Wiederherstellung

| Aspekt            | Vorgehen                                               |
| ----------------- | ------------------------------------------------------ |
| DB-Backups        | Nächtlicher logischer Dump + wöchentliches Base-Backup |
| Aufbewahrung      | 30 Tage rollierend                                     |
| Verifikation      | Monatlicher Restore-Test                               |
| Desaster-Recovery | Letztes Full + inkrementelle Logs einspielen           |

**Recovery-Schritte:**

1. Umfang des Ausfalls identifizieren
2. Jüngstes sauberes Backup wählen
3. Auf neue Instanz wiederherstellen
4. App auf die wiederhergestellte DB umschwenken
5. Post-Mortem & Präventionsmaßnahmen

---
