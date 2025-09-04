# Admin Einrichtung

Erstbenutzer (Administrator) wird benötigt, um weitere Rollen zu vergeben.

## Voraussetzungen
- Datenbank migriert (`npx prisma migrate deploy`)
- ENV Variable `JWT_SECRET` gesetzt (in Produktion zwingend)

## Erstellung per Skript
Es stehen mehrere Varianten im Verzeichnis `scripts/` zur Verfügung:

| Skript | Zweck |
| ------ | ----- |
| `create-admin-simple.js` | Schneller einfacher Admin (interaktiv) |
| `create-admin-direct.js` | Nicht-interaktiv mit Parametern |
| `create-admin.js` | Erweiterte Validierungen |

Beispiel:
```bash
node scripts/create-admin-simple.js
```

## Manuelle Erstellung (SQL – nicht empfohlen)
Direktes Einfügen in Tabellen nur falls Skripte ausfallen; Passwort muss sicher gehasht werden (bcrypt, 14 Rounds).

## Prüfung
Nach Anlage: Login durchführen, Rolle = ADMIN überprüfen, anschließend zweite Admin‑Person definieren (Redundanz).

