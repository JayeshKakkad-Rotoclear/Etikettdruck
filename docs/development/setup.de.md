# Einrichtung der Entwicklungsumgebung

Vollständige Anleitung zur Einrichtung einer Entwicklungsumgebung für das **Etikettdrucker**-System.

## Voraussetzungen

### Erforderliche Software

* **Node.js**: Version 20.x (in `package.json` festgelegt)
* **PostgreSQL**: Version 14+ empfohlen
* **Git**: Für Versionsverwaltung
* **VS Code**: Empfohlener Editor mit Erweiterungen

### Empfohlene VS Code-Erweiterungen

* **Svelte for VS Code**: Syntax-Highlighting und IntelliSense
* **TypeScript and JavaScript**: Verbesserte TypeScript-Unterstützung
* **Prisma**: Unterstützung für Datenbankschemata
* **ESLint**: Code-Linting
* **Prettier**: Code-Formatierung
* **GitLens**: Git-Integration

## Ersteinrichtung

### 1. Repository einrichten

```bash
# Repository klonen
git clone <repository-url>
cd etikettendruck

# Abhängigkeiten installieren
npm install
```

### 2. Umgebungsvariablen konfigurieren

```bash
# Template für Umgebungsvariablen kopieren
cp .env.example .env
```

Konfiguriere deine `.env`-Datei:

```properties
# Entwicklungs-Datenbank
DATABASE_URL="postgresql://postgres:password@localhost:5432/etikettdrucker_dev"

# Sicherheitseinstellungen für Entwicklung
JWT_SECRET="development-secret-change-in-production"
SESSION_DURATION="7d"
COOKIE_SECURE=false

# Entwicklungs-Flags
NODE_ENV=development
```

### 3. Datenbank einrichten

```bash
# PostgreSQL starten (falls Docker genutzt wird)
docker run --name postgres-dev -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:14

# Entwicklungs-Datenbank erstellen
createdb etikettdrucker_dev

# Schema anwenden und Seed-Daten laden
npm run db:setup
```

### 4. Admin-Konto anlegen

```bash
# Entwicklungs-Admin erstellen
npm run create-admin:simple
```

Dies erzeugt einen Admin mit:

* Benutzername: `admin`
* Passwort: `AdminP@ssw0rd2024!`

## Entwicklungs-Workflow

### Dev-Server starten

```bash
# Dev-Server mit Hot Reload
npm run dev
```

Applikation erreichbar unter `http://localhost:5173`.

### Verfügbare Skripte (aus `package.json`)

```bash
# Entwicklung
npm run dev               # Dev-Server starten
npm run check             # TypeScript-Prüfung
npm run check:watch       # Kontinuierliche Typprüfung

# Datenbank
npm run db:setup          # Schema + Seed-Daten
npm run db:seed           # Nur Seed-Daten

# Build
npm run build             # Produktionsbuild
npm run preview           # Produktionsbuild lokal prüfen

# Admin
npm run create-admin          # Interaktiver Admin
npm run create-admin:simple   # Schnell-Admin

# Sicherheit
npm run test:security     # Sicherheitstests
```

## Code-Qualität

### TypeScript-Konfiguration

Das Projekt nutzt strikte TypeScript-Einstellungen (aus `tsconfig.json`):

* Strict-Mode aktiviert
* Keine impliziten `any`
* Exakte optionale Property-Typen
* Strikte `null`-Prüfungen

### Linting & Formatierung

```bash
# Typprüfung
npm run check

# Rechtschreibprüfung (in cspell.json konfiguriert)
npx cspell "src/**/*.{ts,js,svelte}"
```

### Sicherheitstests

```bash
# Sicherheitstest-Suite ausführen
npm run test:security

# Standalone-Security-Tests
npm run test:security:standalone
```

## Entwicklungs-Patterns

### Projektstruktur

```
src/
├── lib/                    # Geteilte Utilities und Komponenten
│   ├── components/         # Wiederverwendbare Svelte-Komponenten
│   ├── stores/             # Svelte Stores (State-Management)
│   ├── auth.ts             # Authentifizierungs-Utilities
│   ├── security.ts         # Security-Middleware
│   └── input-validator.ts  # Helpers zur Eingabevalidierung
├── routes/                 # SvelteKit-Routen
│   ├── api/                # API-Endpunkte (+server.ts)
│   ├── (products)/         # Produktseiten
│   └── admin/              # Admin-Seiten
├── app.html                # HTML-Template
└── app.css                 # Globale Styles
```

### SvelteKit-Konventionen

* **Page-Routen**: `+page.svelte`
* **Layouts**: `+layout.svelte` für geteilte Layouts
* **API-Routen**: `+server.ts` für Backend-Handler
* **Type Safety**: `$types`-Imports für Request/Response-Typen

### Auth-Entwicklung

```typescript
// Auth in Komponenten verwenden
import { user } from '$lib/stores/auth';
import { hasRole } from '$lib/auth';

// Prüfen, ob Rolle ausreicht
$: canAccess = $user && hasRole($user.role, 'ADMIN');
```

### API-Entwicklung

```typescript
// Beispiel-Struktur eines API-Endpunkts (aus src/routes/api/)
import type { RequestHandler } from './$types';
import { SecurityMiddleware } from '$lib/security-middleware';

export const POST: RequestHandler = async (event) => {
  const { context } = await SecurityMiddleware.secureEndpoint(event, {
    requiredRole: 'ADMIN',
    validateCSRF: true,
    validateInput: true
  });
  
  // API-Logik
  return json({ success: true, data: result });
};
```

## Datenbank-Entwicklung

### Prisma-Workflow

```bash
# Schema im Browser ansehen
npx prisma studio

# Schema-Änderungen anwenden
npx prisma db push

# TypeScript-Client generieren
npx prisma generate

# DB zurücksetzen (nur Entwicklung)
npx prisma db push --force-reset
npm run db:seed
```

### Multi-Schema-Entwicklung

Das System verwendet mehrere PostgreSQL-Schemas:

* `user_management` – Benutzerkonten & Auth
* `cpro_steuerrechner` – C-Pro-Daten
* `c2_steuerrechner` – C2-Daten
* `cbasic_steuerrechner` – C-Basic-Daten
* `kk_kamerakopf` – KK-Kamerakopf-Daten

### Datenbank-Seeding

```typescript
// Beispiel-Seed (aus prisma/seed.ts)
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Entwicklungsdaten seeden
  await prisma.user.createMany({
    data: [
      // Entwicklungs-Benutzer
    ]
  });
}
```

## Testen

### Sicherheitstests

```bash
# Sicherheitstests ausführen
npm run test:security
```

Aktuelle Tests (aus `tests/security-simple.test.cjs`):

* Authentifizierungs-Endpunkte
* Rate-Limiting
* Eingabevalidierung
* Sitzungs-Sicherheit

### Tests hinzufügen

> TODO: Testframework über Security-Tests hinaus erweitern
> TODO: Unit-Tests für Komponenten & Utilities
> TODO: Integrations-Tests für API-Endpunkte

## Debugging

### VS Code-Debugging

Erstelle `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch SvelteKit",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/@sveltejs/kit/src/exports/vite/dev/index.js",
      "args": ["--", "--mode", "development"],
      "console": "integratedTerminal",
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

### Häufige Debug-Tasks

```bash
# Prisma-Queries loggen
DEBUG=prisma:query npm run dev

# Auth-Logging
DEBUG=auth npm run dev

# Ausführliches Logging
NODE_ENV=development DEBUG=* npm run dev
```

## Hot Reload & Dev-Server

### Funktionen

* **Hot Module Replacement**: Sofortige Updates für Svelte-Komponenten
* **Type Checking**: Echtzeit-TypeScript-Validierung
* **Error Overlay**: Fehleranzeige im Browser
* **API-Route-Updates**: Automatischer Neustart bei API-Änderungen

### Entwicklungs-URLs

* **App**: `http://localhost:5173`
* **Prisma Studio**: `http://localhost:5555` (bei `npx prisma studio`)

## Performance-Hinweise

### Entwicklungs-Optimierungen

* `npm run check:watch` für kontinuierliche Typprüfung
* Prisma Studio für DB-Inspektion geöffnet lassen
* Browser-DevTools für Frontend-Debugging nutzen

### Build-Performance

```bash
# Bundle-Größe analysieren
npm run build
npx vite-bundle-analyzer dist
```

## Häufige Entwicklungsprobleme

### Datenbankverbindung

```bash
# Verbindung testen
npx prisma db pull

# Connection-String prüfen
echo $DATABASE_URL
```

### Probleme mit Node-Modules

```bash
# Clean Install
rm -rf node_modules package-lock.json
npm install

# Prisma-Client neu generieren
npx prisma generate
```

### Port-Konflikte

```bash
# Prozess auf Port 5173 beenden
npx kill-port 5173

# Alternativen Port nutzen
npm run dev -- --port 3001
```

## Nächste Schritte

### Beitragen

1. [Contributing Guide](./contributing.md) lesen
2. [Entwicklungs-Standards](../architecture/06-development-standards.md) prüfen
3. [API-Dokumentation](../api/README.md) für Endpunkt-Entwicklung ansehen

### Deployment

1. Produktionsbuild testen: `npm run build && npm run preview`
2. [Deployment-Guide](../operations/deployment.md) prüfen
3. Staging-Umgebung für Tests aufsetzen

---

*Für Troubleshooting siehe **Development Issues** im [Runbook](../operations/runbooks/troubleshooting.md).*

---