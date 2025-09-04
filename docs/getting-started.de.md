# Erste Schritte

Kurzanleitung für die lokale Entwicklung des **Etikettdrucker**-Systems.

## Voraussetzungen

* **Node.js**: Version 20.x (laut `package.json`)
* **PostgreSQL**: Version 14+ empfohlen
* **Git**: Für Versionskontrolle
* **Docker** (optional): Für containerisierte Entwicklung

## Umgebungs­einrichtung

### 1. Repository klonen

```bash
git clone <repository-url>
cd etikettendruck
```

### 2. Abhängigkeiten installieren

```bash
npm install
```

### 3. Umgebungsvariablen

Beispieldatei kopieren und konfigurieren:

```bash
# Aus .env.example kopieren
cp .env.example .env
```

Erforderliche Umgebungsvariablen (aus `.env`):

```properties
# Datenbankverbindung
DATABASE_URL="postgresql://username:password@localhost:5432/etikettdrucker"

# JWT-Konfiguration
JWT_SECRET="your-secure-random-string-here"
SESSION_DURATION="7d"

# Cookie-Einstellungen
COOKIE_SECURE=false  # In Produktion mit HTTPS auf true setzen
```

### 4. Datenbank einrichten

```bash
# Datenbankschema anwenden und Anfangsdaten seeden
npm run db:setup
```

Dieser Befehl führt aus:

* `prisma db push` – Erstellt das Datenbankschema
* `npm run db:seed` – Füllt Anfangsdaten aus `prisma/seed.ts` ein

### 5. Admin-Benutzer anlegen

```bash
# Erstes Admin-Konto erstellen
npm run create-admin
```

Folge den interaktiven Eingabeaufforderungen, um deinen Admin-User anzulegen.

## Entwicklungsserver

### Entwicklungsserver starten

```bash
npm run dev
```

Die Anwendung ist erreichbar unter `http://localhost:5173`.

### Verfügbare Skripte (aus `package.json`)

```bash
npm run dev          # Entwicklungsserver mit Hot Reload
npm run build        # Produktionsbuild
npm run start        # Produktionsserver starten
npm run preview      # Produktionsbuild lokal ansehen
npm run check        # TypeScript- und Svelte-Prüfung
npm run check:watch  # Kontinuierliche Typprüfung
```

## Datenbankoperationen

### Schema-Verwaltung

```bash
# Schema-Änderungen in die DB pushen
npx prisma db push

# Prisma-Client generieren
npx prisma generate

# Datenbank in Prisma Studio ansehen
npx prisma studio
```

### Daten seeden

```bash
# Datenbank neu seeden
npm run db:seed
```

## Erste Anmeldung

1. Entwicklungsserver starten: `npm run dev`
2. Zu `http://localhost:5173/login` navigieren
3. Admin-Zugangsdaten aus Schritt 5 verwenden
4. Du wirst zum Dashboard weitergeleitet

## Entwicklungs-Workflow

### Code-Qualitätsprüfungen

```bash
# TypeScript-Prüfung
npm run check

# Rechtschreibprüfung (konfiguriert in cspell.json)
npx cspell "src/**/*.{ts,js,svelte}"
```

### Sicherheitstests

```bash
# Sicherheitstests ausführen
npm run test:security
```

## Docker-Entwicklung (optional)

### Mit Docker Compose

```bash
# Dienste bauen und starten
docker-compose up --build

# Im Hintergrund ausführen
docker-compose up -d
```

Die Anwendung ist erreichbar unter `http://localhost:4000`.

### Umgebung für Docker

Erstelle eine `.env`-Datei mit passenden Einstellungen:

```properties
DATABASE_URL="postgresql://postgres:password@host.docker.internal:5432/etikettdrucker"
JWT_SECRET="your-secure-secret"
COOKIE_SECURE=false
```

## Fehlerbehebung

### Häufige Probleme

**Datenbankverbindungsfehler**

* Prüfe, ob PostgreSQL läuft
* `DATABASE_URL`-Format und Zugangsdaten kontrollieren
* Sicherstellen, dass die Datenbank existiert

**Prisma-Client-Fehler**

```bash
# Prisma-Client neu generieren
npx prisma generate
```

**Port bereits belegt**

```bash
# Prozess auf Port 5173 finden und beenden
npx kill-port 5173
```

**Fehlende Umgebungsvariablen**

* Sicherstellen, dass alle erforderlichen Variablen in `.env` gesetzt sind
* Auf Tippfehler in Variablennamen prüfen

### Hilfe erhalten

* Siehe die [Architekturdokumentation](./architecture/README.md) für den Systemüberblick
* Lies die [API-Dokumentation](./api/README.md) für Endpunktdetails
* Siehe den [Development Guide](./development/setup.md) für erweiterte Einrichtung

## Nächste Schritte

1. **System erkunden**: Einloggen und durch verschiedene Produkttypen navigieren (C2, C-Pro, C-Basic, KK)
2. **Architektur prüfen**: Die [technische Architektur](./architecture/README.md) lesen
3. **API erkunden**: Endpunkte mit der [API-Dokumentation](./api/README.md) testen
4. **Entwicklung**: [Beitragsrichtlinien](./development/contributing.md) für Mitarbeit beachten

---

*Benötigst du Hilfe? Sieh dir das [Troubleshooting-Runbook](./operations/runbooks/troubleshooting.md) an oder erstelle ein Issue.*
