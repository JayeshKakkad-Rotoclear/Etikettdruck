# Admin-Setup-Guide

Vollständige Anleitung für die Ersteinrichtung des Systems und das Anlegen eines Admin-Kontos.

## Initiale Systemeinrichtung

### Voraussetzungen

* Laufende PostgreSQL-Datenbank (14+)
* Installiertes Node.js 20.x
* System bereitgestellt gemäß [Deployment-Guide](../operations/deployment.md)

### Datenbankinitialisierung

```bash
# 1. Datenbankschema anwenden
npx prisma db push

# 2. Anfangsdaten seeden
npm run db:seed
```

## Admin-Konto erstellen

### Option 1: Quick-Setup (für die erste Einrichtung empfohlen)

```bash
npm run create-admin:simple
```

**Erstellt Standard-Admin mit:**

* **Benutzername:** `admin`
* **Passwort:** `AdminP@ssw0rd2024!`
* **Erzwingt Passwortänderung beim ersten Login**
* Ideal für die Ersteinrichtung

### Option 2: Interaktives Setup (benutzerdefinierte Zugangsdaten)

```bash
npm run create-admin
```

**Interaktiver Assistent mit Abfragen zu:**

* Benutzerdefiniertem Benutzernamen
* E-Mail-Adresse
* Sicherem Passwort (inkl. Stärkeprüfung)
* Vor- und Nachname

### Option 3: Direkte Skriptausführung

```bash
# Standard-Admin-Konto
node scripts/create-admin-direct.js

# Interaktiver Assistent
node scripts/create-admin.js
```

## Sicherheitsanforderungen

### Passwort-Richtlinie (automatisch erzwungen)

Alle Passwörter müssen folgende Anforderungen erfüllen:

* **Mindestens 12 Zeichen**
* **Mindestens ein Großbuchstabe (A-Z)**
* **Mindestens ein Kleinbuchstabe (a-z)**
* **Mindestens eine Ziffer (0-9)**
* **Mindestens ein Sonderzeichen (!@#\$%^&\*)**
* **Darf den Benutzernamen nicht enthalten**
* **Darf kein häufiges/schwaches Passwort sein**

### Anforderungen an Benutzernamen

* **3–50 Zeichen lang**
* **Nur Buchstaben, Zahlen, Unterstrich und Minus**
* **Systemweit eindeutig**

### Anforderungen an E-Mails

* **Gültiges E-Mail-Format**
* **Systemweit eindeutig**
* **Wird für Passwort-Wiederherstellung genutzt (wenn implementiert)**

## Erster Login-Vorgang

### 1. Zugriff auf das System

Navigiere zur System-URL:

* **Entwicklung:** `http://localhost:5173/login`
* **Produktion:** `https://your-domain.com/login`

### 2. Login mit Admin-Zugangsdaten

Nutze die beim Anlegen vergebenen Zugangsdaten.

### 3. Erzwungene Passwortänderung

Wenn du die Quick-Setup-Option verwendet hast, wirst du beim ersten Login zur Passwortänderung aufgefordert.

### 4. Profil vervollständigen

Aktualisiere deine Profilinformationen:

* Vor- und Nachname
* Kontaktinformationen
* Bevorzugte Einstellungen

## Benutzerverwaltung

### Weitere Benutzer anlegen

#### Über das Admin-Panel

1. **Admin** → **Benutzerverwaltung** öffnen
2. **Neuen Benutzer anlegen** klicken
3. Erforderliche Daten ausfüllen:

   * Benutzername (eindeutig)
   * E-Mail-Adresse (eindeutig)
   * Vor- und Nachname
   * Anfangsrolle zuweisen
4. System generiert ein temporäres Passwort
5. Zugangsdaten an den neuen Benutzer übermitteln

#### Über die Kommandozeile

```bash
# Interaktive Benutzeranlage
npm run create-user

# Oder direktes Skript
node scripts/create-user.js
```

### Rollenzuweisung

#### Verfügbare Rollen (aus `ROLES.md`)

1. **VIEWER** (Level 0) – Nur-Lese-Zugriff
2. **PRUEFER\_B** (Level 1) – Prüfer-B-Workflows
3. **PRUEFER\_A** (Level 2) – Prüfer-A-Workflows
4. **PRUEFER\_AB** (Level 3) – Beide Prüfer-Workflows
5. **MANAGEMENT** (Level 4) – Dashboard & Reporting
6. **ADMIN** (Level 5) – Vollzugriff

#### Prozess der Rollenzuweisung

1. **Admin** → **Benutzerverwaltung** öffnen
2. Benutzer auswählen
3. Passende Rolle im Dropdown wählen
4. Änderungen speichern
5. Benutzer muss sich ab- und wieder anmelden, damit die Änderungen aktiv werden

### Passwortverwaltung

#### Passwortänderung erzwingen

```bash
# Passwortänderung für spezifischen Benutzer erzwingen
node scripts/force-password-change.js --username <username>
```

#### Passwort zurücksetzen

```bash
# Passwort zurücksetzen (generiert temporäres Passwort)
node scripts/reset-password.js --username <username>
```

## Systemkonfiguration

### Umgebungsvariablen

Wichtige Einstellungen in `.env`:

```properties
# Datenbank
DATABASE_URL="postgresql://username:password@host:port/database"

# Sicherheit
JWT_SECRET="secure-256-bit-random-string"
SESSION_DURATION="7d"
COOKIE_SECURE=true  # true in Produktion (HTTPS)

# Applikation
NODE_ENV=production
PORT=3000
```

### Sicherheitskonfiguration

#### JWT-Einstellungen

* **Secret:** Kryptographisch sicherer Zufallsstring (mind. 256 Bit)
* **Dauer:** Standard 7 Tage; je nach Sicherheitsanforderung anpassen
* **Rotation:** > TODO: Verfahren zur Rotation des JWT-Secrets dokumentieren

#### Sitzungsverwaltung

* **Dauer:** Über `SESSION_DURATION` konfigurierbar
* **Speicherung:** Datenbankgestützt mit automatischer Bereinigung
* **Sicherheit:** IP-Validierung und Umgang mit parallelen Sitzungen

#### Ratenbegrenzung

Aus `src/lib/security.ts`:

> TODO: Konkrete Rate-Limit-Werte extrahieren und dokumentieren

### Audit-Logging

Alle administrativen Aktionen werden protokolliert mit:

* Zeitstempel
* Ausführendem Benutzer
* Aktionstyp
* IP-Adresse
* Ergebnis (Erfolg/Fehlschlag)

#### Audit-Logs einsehen

> TODO: Vorgehen zum Einsehen der Audit-Logs dokumentieren
> TODO: Aufbewahrungsrichtlinien für Audit-Logs hinzufügen

## Backup & Wiederherstellung

### Datenbank-Backup

```bash
# Vollständiges DB-Backup erstellen
pg_dump $DATABASE_URL > admin_backup_$(date +%Y%m%d).sql
```

### Konfigurations-Backup

```bash
# Backup der Umgebungsvariablen
cp .env config_backup_$(date +%Y%m%d).env
```

### Admin-Kontowiederherstellung

Falls Admin-Zugriff verloren geht:

1. **Direkter Datenbankzugriff:**

```sql
-- Admin-Passworthash zurücksetzen (bcrypt-Hash verwenden)
UPDATE user_management.users 
SET password_hash = '$2b$12$hash...' 
WHERE role = 'ADMIN';
```

2. **Skriptbasierte Wiederherstellung:**

```bash
# Notfall-Admin anlegen
node scripts/emergency-admin.js
```

## Überwachung & Wartung

### Health-Checks

```bash
# Systemstatus prüfen
curl http://localhost:3000/api/auth/me

# Datenbankverbindung prüfen
npx prisma db pull
```

### Überwachung der Benutzeraktivität

> TODO: Verfahren zur Überwachung der Benutzeraktivität dokumentieren
> TODO: Erkennung verdächtiger Aktivitäten ergänzen

### Regelmäßige Wartung

* **Wöchentlich:** Benutzerkonten und Berechtigungen prüfen
* **Monatlich:** Audit-Logs prüfen und bereinigen
* **Vierteljährlich:** Sicherheits-Settings überprüfen
* **Jährlich:** Passwort-Richtlinien aktualisieren

## Fehlerbehebung

### Häufige Probleme

#### „Admin already exists“-Fehler

```bash
# Bestehende Admin-Konten prüfen
npx prisma studio
# In der Users-Tabelle nach role='ADMIN' suchen
```

#### Datenbankverbindungsprobleme

```bash
# DB-Verbindung testen
npx prisma db pull

# DATABASE_URL-Format prüfen
echo $DATABASE_URL
```

#### Berechtigungsfehler

* Prüfen, ob der Benutzer die korrekte Rolle hat
* Prüfen, ob sich der Benutzer nach der Rollenänderung neu angemeldet hat
* Rollenmatrix im [Benutzerrollen-Guide](./user-roles.md) prüfen

### Notfallverfahren

#### System-Lockout beheben

Wenn alle Admin-Konten unzugänglich sind:

1. Mit administrativen Rechten auf den Server zugreifen
2. Notfall-Admin-Skript ausführen
3. Falls nötig, direkten Datenbankzugriff nutzen
4. Sicherheitslogs auf Anzeichen eines Verstoßes prüfen

#### Reaktion auf Sicherheitsvorfälle

1. Betroffene Konten sofort deaktivieren
2. Audit-Logs auf unautorisierte Zugriffe prüfen
3. Passwortänderungen für alle Benutzer erzwingen
4. JWT-Secrets aktualisieren
5. Sicherheitskonfigurationen überprüfen und anpassen

---

*Bei technischen Problemen siehe das [Troubleshooting-Runbook](../operations/runbooks/troubleshooting.md).*

---