# Etikettdrucker – System für Qualitätskontrolle & Etikettendruck

## Neueste Version: v1.0.0-beta

Dieses große Beta-Release umfasst umfassende UI/UX-Verbesserungen, erweiterte Formularvalidierung, fortgeschrittene Dashboard-Analysen mit interaktiven Charts, kritische Fehlerbehebungen für Prüfer-B-Workflows sowie eine konsolidierte API-Architektur. Die vollständigen Details findest du im Versionsverlauf weiter unten.

![Version](https://img.shields.io/badge/version-1.0.0--beta-orange.svg)
![SvelteKit](https://img.shields.io/badge/SvelteKit-FF3E00?logo=svelte\&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript\&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?logo=Prisma\&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?logo=postgresql\&logoColor=white)

Ein umfassendes System für Qualitätskontrolle und Etikettendruck, entwickelt für die **Rotoclear GmbH**, um Produkttests, Datenerfassung und Etikettenerzeugung für verschiedene Produktlinien zu vereinheitlichen und zu beschleunigen.

## Systemüberblick

Das Etikettdrucker-System steuert Qualitätskontrollprozesse für mehrere Produktfamilien über einen zweistufigen Prüfer-Workflow, vollständiges Daten-Tracking und automatisierte Etikettenerzeugung. Es unterstützt unterschiedliche Rotoclear-Produkte, darunter **Steuerrechner** (Control Units) und **Kamerakopf**.

### Kernfunktionen

* **Rollenbasierte Zugriffskontrolle (RBAC)** – Umfassendes 6-stufiges Rollensystem mit sicherer Authentifizierung
* **Benutzerverwaltung** – Vollständige Administration inkl. Profile & Rollenvergabe
* **Professionelles Benachrichtigungscenter** – Zentrales, mobilfreundliches System mit Wischgesten, Barrierefreiheit und localStorage-Persistenz
* **SVG-Icon-System** – Konsistente, professionelle Icons in allen Oberflächen
* **Mobile-First Responsive Design** – Optimierte Layouts, Barrierefreiheit und Touch-Gesten
* **Interaktive Dashboard-Analysen** – Erweiterte monatliche Produktionsdiagramme mit Hover-Tooltips, Echtzeitstatistiken und Performance-Metriken
* **Erweiterte Formularvalidierung** – Umfassende Client-Validierung aller QC-Formulare mit Pflichtfeld-Indikatoren und Fehlermeldungen
* **Umfassende Dokumentation** – Architektur, Sicherheit, Deployment und Entwicklungsstandards
* **Multiprodukt-Qualitätskontrolle** – Standardisierte Prüfprotokolle für C Pro, C2, C Basic und Kamerakopf
* **Dualer Prüfer-Workflow** – Sequenzielle Prüfungen durch Prüfer A und Prüfer B inkl. Änderungsdetektion und Bestätigungsdialogen
* **Fortgeschrittene Änderungsdetektion** – Intelligenter Vergleich zwischen Prüfer-A- und Prüfer-B-Daten mit Vorher/Nachher-Analyse
* **Erweiterte Etikettenerzeugung** – Automatische QR-Codes mit Firmenbranding, CE-Kennzeichnung und professionellem ZPL-Layout
* **Konsolidierte API-Architektur** – Vereinheitlichte Endpunkte mit konsistenten Mustern für alle Produkttypen
* **Datenbankverwaltung** – Vollständige Datenansicht, Suche und Management
* **Verpackungsunterstützung** – Außenkarton-Etikettierung mit Dual-Modus (Scan/Manuell)
* **Zubehörverwaltung** – Erstellung und Nachverfolgung von Zubehör-Etiketten
* **Sichere Authentifizierung** – JWT-basierte Auth mit HTTP-Only-Cookies und Sitzungsmanagement

## Technische Architektur

### Frontend-Stack

* **SvelteKit 2.22.0** – Modernes, reaktives Webframework mit erweiterter Interaktivität
* **TypeScript 5.0** – Typsichere Entwicklung mit verbesserter Fehlerbehandlung
* **Custom CSS** – Professionelles responsives Design mit Animationen & Transitions
* **Interaktive Charts** – Eigenentwickelte Dashboard-Analysen mit Hover-Tooltips und mobiler Optimierung
* **Vite 7.0** – Schnelles Build-Tooling & Dev-Server

### Backend-Stack

* **Prisma 6.13.0** – Typsicheres ORM mit optimierten Abfragen
* **PostgreSQL** – Multi-Schema-Architektur mit erweiterten Indizes
* **Node.js-APIs** – RESTful Endpunkte in konsolidierter Architektur
* **JWT-Authentifizierung** – Sichere Token-Auth mit HTTP-Only-Cookies
* **bcryptjs** – Passwort-Hashing & Sicherheit
* **Erweiterte Fehlerbehandlung** – Umfassendes Logging & verständliche Fehlermeldungen
* **Rollenbasierte Autorisierung** – Granulares Berechtigungssystem

### Aktuelle technische Verbesserungen

* **API-Konsolidierung** – Vereinheitlichte Endpunktmuster über alle Produkttypen
* **Erweiterte Datenvalidierung** – Verbesserungen auf Client- und Server-Seite
* **Optimierte DB-Abfragen** – Performance-Tuning für Dashboard-Analysen
* **Interaktive UI-Komponenten** – Professionelle Chart-Komponenten mit flüssigen Animationen
* **Mobile-First-Design** – Touch-optimierte Oberflächen mit Responsive Breakpoints

### Datenbankdesign

```
Schemas:
├── cpro_steuerrechner     (C Pro Steuerrechner)
├── c2_steuerrechner       (C2 Steuerrechner)
├── cbasic_steuerrechner   (C Basic Steuerrechner)
├── kk_kamerakopf          (Kamerakopf)
├── zubehoer_etikett       (Zubehör-Etiketten)
├── outer_karton           (Außenkarton-Etiketten)
├── outer_karton_entry     (Kartoninhalt)
└── User                   (Benutzerverwaltung & Authentifizierung)
```

## Authentifizierung & Sicherheit

### Rollenbasierte Zugriffskontrolle (RBAC)

Das System implementiert eine umfassende 6-stufige Rollenhierarchie:

1. **VIEWER** – Basis-Leserechte für berechtigte Inhalte
2. **PRUEFER\_B** – Prüfer-B-Rolle mit entsprechenden Testfähigkeiten
3. **PRUEFER\_A** – Prüfer-A-Rolle mit zugehörigen Prüfungen
4. **PRUEFER\_AB** – Kombinierte Prüfer-Rolle mit Zugriff auf A- und B-Workflows
5. **MANAGEMENT** – Management-Zugriff inkl. Dashboards & Reporting
6. **ADMIN** – Vollzugriff inkl. Benutzer- und Datenbankverwaltung

### Sicherheitsfunktionen

* **JWT-Authentifizierung** – Sichere Token-Auth mit automatischer Ablaufzeit
* **HTTP-Only-Cookies** – Schutz vor XSS, da Tokens nicht per JS zugreifbar sind
* **Passwort-Hashing** – Sichere Speicherung via bcryptjs
* **Routenschutz** – Layout-basierte Guards gegen unbefugten Zugriff
* **Sitzungsmanagement** – Automatische Sitzungsvalidierung & -erneuerung
* **Rollenvalidierung** – Serverseitige Prüfungen für alle geschützten Operationen

### Benutzerverwaltung

* **Administration** – Vollständige CRUD-Operationen für Benutzerkonten
* **Rollenvergabe** – Flexible, rollenbasierte Berechtigungen
* **Profilverwaltung** – Profilbearbeitung & Passwortänderung
* **Initiales Setup** – Einrichtungsassistent zur Erstellung des ersten Admin-Benutzers

## Neue Funktionen in v1.0.0-beta

### Verbesserte User Experience

* **Interaktive Dashboard-Charts** – Monatsstatistiken mit Hover-Tooltips und detaillierten Produktkennzahlen
* **Professionelles Chart-Design** – Saubere, responsive Charts mit flüssigen Animationen
* **Verbessertes visuelles Design** – Konsistente Typografie, Abstände und Styles

### Qualitäts­sicherungs-Verbesserungen

* **Umfassende Formularvalidierung** – Client-seitig in allen Prüfer-A/B-Formularen
* **Pflichtfeld-Indikatoren** – Visuelle Kennzeichnung & Meldungen für Pflichtfelder
* **Intelligente Änderungsdetektion** – Fortgeschrittener A/B-Datenvergleich
* **Bestätigungsdialoge** – Vorher/Nachher-Vergleiche mit kompakten Änderungsübersichten

### Kritische Fehlerbehebungen

* **Prüfer-B-Datenladen** – Behebung von API-Zugriffsproblemen („Nicht gesetzt“)
* **Änderungslogik** – Korrekturen bei der Erkennung geänderter Felder
* **Template-Konsistenz** – Vereinheitlichte Änderungsmuster über alle Produkttypen

### API-Architektur

* **Konsolidierte Außenkarton-API** – Vereinheitlichte GET/POST/PUT-Endpunkte nach Zubehör-Muster
* **Konsistente Antwortformate** – Einheitliche Responses über alle Produktendpunkte
* **Verbesserte Fehlerbehandlung** – Präziseres Logging & Nutzerfeedback

### Erweiterte Etikettenerzeugung

* **Branding-Integration** – Rotoclear-Logo & CE-Kennzeichnung auf allen Etiketten
* **Professionelles ZPL** – Konsistentes Layout & Typografie in allen Produktlabels
* **Dynamische Fußzeile** – Verbesserte Tabellenformatierung & visuelle Hierarchie

### Mobile & Accessibility

* **Responsives Chart-Design** – Touch-freundliche Interaktionen & mobiler Scroll
* **Verbesserte Mobilnavigation** – Größere Touch-Ziele & Gestenunterstützung
* **Erhöhte Barrierefreiheit** – Besserer Screenreader-Support & Tastaturbedienung

## Frühere Funktionen in v0.1.0

* Vereinheitlichte, modernisierte Etikettendruck-APIs für alle Produkttypen
* PUT-Endpunkte für Nachdrucke mit originalem ZPL-Layout
* QR-Code-Bildgenerierung mittels qrcode und pngjs
* Dynamische Fußzeilen-Positionierung & verbesserte Tabellenformatierung im ZPL-Output
* Doppelter Zubehör-Workflow (nur speichern / speichern & drucken)
* Lieferschein-Tracking für Zubehör & Außenkarton
* Datenbank-Frontend-Verbesserungen (Lieferschein-Spalte, erweiterte Filter, CSV-Export)

## Produktlinien

### 1. C Pro Steuerrechner

Leistungsfähige Steuerrechner mit mehreren Konfigurationen und HDD-Optionen.

**Qualitätskontrollpunkte:**

* Hardware-Integrität & Vollständigkeit
* HDMI-, Web- und Zoom-Funktionalität
* Menübedienung & IP-Adressprüfung
* Kameraeingangs-Tests
* Festplattenprüfung (256 GB, 1 TB, 4 TB)
* Automatiktest & Werksreset-Validierung

**Unterstützte Konfigurationen:**
RC, DMG, DEMO, EDU

### 2. C2 Steuerrechner

Kompakte Steuerrechner mit Kernfunktionalität.

**Qualitätskontrollpunkte:**

* Hardware-Vollständigkeit & Hutschienen-Clip
* HDMI-, Web- und Zoom-Bedienung
* Menüfunktionalität & Kameraeingänge
* Validierung der Systemzustandsdaten
* Automatiktests

### 3. C Basic Steuerrechner

Einstiegs-Steuerrechner mit Basisfunktionen.

**Qualitätskontrollpunkte:**

* Hardware-Integrität & Hutschienenmontage
* HDMI- und Zoom-Funktion
* Kameraeingangs-Validierung
* Sprachumschaltung
* Englisch-Konfiguration

### 4. Kamerakopf

Präzisions-Kamerasysteme mit optischen Komponenten.

**Qualitätskontrollpunkte:**

* Sauberkeit/Unversehrtheit des Optikglases
* Freier Rotorlauf & Klebequalität
* Pneumatikanschluss & Drucktest
* Lichtmodul- & Motorfunktion (je 10×)
* Druck- & Positionssensoren
* Fokusposition & Optikumschaltung (Dual-Optik)
* Siegellack-Auftrag

**Optik-Konfigurationen:**
Single: F1, F2, TFT • Dual: F1+F2, F1+TFT, F2+TFT

## Workflow der Qualitätskontrolle

### Prüfer A – Initialprüfung

1. **Produktidentifikation** – Seriennummer, Artikel, Produktionsdatum
2. **Basis-Hardwarechecks** – Physische Integrität, Komponentenpräsenz
3. **Initiale Funktionstests** – Grundfunktionen
4. **Dokumentation** – Ergebnisse & Auffälligkeiten
5. **Übergabe** – An Prüfer B zur Finalprüfung

### Prüfer B – Finalprüfung

1. **Datenprüfung** – Bestehende Testdaten per Seriennummer laden
2. **Erweiterte Tests** – Umfassende Funktionsvalidierung
3. **Abschlussprüfungen** – Integration & Performance
4. **QR-Code-Erzeugung** – Automatische Codierung der Testergebnisse
5. **Etikettendruck** – Finale Kennzeichnung & Dokumentation

## Dashboard & Analytik

### Produktionsübersicht

* **Gesamtstückzahlen** – Gesamt & 30-Tage-Statistik
* **Monatstrends** – 12-Monats-Historie mit Diagrammen
* **Produktverteilung** – Nach Typ & Konfiguration
* **Performance-Metriken** – Top-Prüfer nach Volumen

### Statistische Analysen

* **C Pro HDD-Verteilung** – Nach Speicherkapazität
* **C2 Konfigurations-Breakdown** – Typverteilung
* **Kamerakopf Optik-Analyse** – Optikkonfigurationen
* **Prüfer-Performance** – Produktivität & Qualitätsmetriken

### Echtzeit-Monitoring

* **Live-Updates** – Aktuelle Prüfaktivität
* **Qualitätstrends** – First-Pass/Fail-Raten & Issues
* **Ressourcennutzung** – Auslastung & Effizienz

## Etiketten-Management

### QR-Code-Erzeugung

* **Encoding der Testergebnisse** – Vollständige Testdaten im QR
* **SVG-Format** – Skalierbar für hochwertige Drucke
* **Batch-Verarbeitung** – Mehrfachetiketten mit konsistentem Layout

### Außenkarton-Etikettierung

**Dualer Modus:**

1. **Scan-Modus** – QR-Scan zur automatischen Identifikation
2. **Manueller Modus** – Auswahl aus verfügbarem Bestand

**Unterstützte Inhalte:**

* Alle geprüften Produkte (C Pro, C2, C Basic, Kamerakopf)
* Zubehör & Komponenten
* Gemischte Kartons mit detailliertem Packzettel

### Zubehör-Etiketten

* **Komponenten-Tracking** – Individuelle Identifikation
* **Kategorien** – Organisiert nach Produktfamilie
* **Mengensteuerung** – Präzises Bestandsmanagement

## Datenbankverwaltung

### Datenansicht & Suche

* **Umfassende Tabellen** – Sortierung & Filter
* **Erweiterte Suche** – Mehrkriteriensuche
* **Export** – Datenexport für Reporting & Analyse
* **Historie** – Vollständiger Audit-Trail

### Datenintegrität

* **Validierungsregeln** – Strikte Eingabe-Validierung
* **Referentielle Integrität** – Konsistente Beziehungen
* **Backup & Recovery** – Automatisierte Sicherung & Wiederherstellung

## Dokumentation & Architektur

Ausführliche Dokumente unter `docs/architecture/` zu Systemüberblick, Technik, Daten, Sicherheit, Deployment und Entwicklungsstandards.

## Erste Schritte

### Voraussetzungen

* Node.js 18+
* PostgreSQL 14+
* Git

### Installation

1. **Repository klonen:**

```bash
git clone https://github.com/JayeshKakkad-Rotoclear/Etikettdruck.git
cd etikettendruck
```

2. **Abhängigkeiten installieren:**

```bash
npm install
```

3. **Datenbank einrichten:**

```bash
# DATABASE_URL in .env konfigurieren
echo "DATABASE_URL=postgresql://username:password@localhost:5432/etikettdrucker" > .env

# Prisma-Client generieren
npx prisma generate

# DB-Schema anwenden & Seed-Daten laden
npx prisma db push
npm run db:seed
```

4. **Initiales Setup:**

```bash
# Entwicklungsserver starten
npm run dev

# Rufe http://localhost:5173/setup auf, um den ersten Admin-Benutzer anzulegen
# Einmalige Einrichtung – erforderlich, bevor das System nutzbar ist
```

5. **Zugriff auf die Anwendung:**

```bash
# Anwendung unter http://localhost:5173
# Mit Admin-Zugangsdaten anmelden, um das System zu verwenden
```

**Wichtig:** Die Anwendung erfordert Authentifizierung für alle Operationen. Nach dem Setup ist ein Login notwendig; Rollen steuern die verfügbaren Funktionen.

### Produktivbereitstellung

1. **Build erstellen:**

```bash
npm run build
```

2. **Produktions-Preview:**

```bash
npm run preview
```

3. **Deployment** auf der bevorzugten Plattform (Vercel, Netlify, Docker etc.)

## Projektstruktur

```
etikettendruck/
├── prisma/
│   ├── schema.prisma              # Datenbankschemata
│   ├── migrations/                # Migrationsdateien
│   └── seed.ts                    # Seed-Skript
├── src/
│   ├── lib/
│   │   ├── components/            # Wiederverwendbare Svelte-Komponenten
│   │   │   ├── header.svelte      # Navigationskopf
│   │   │   ├── footer.svelte      # Fußbereich
│   │   │   ├── booleanRadio.svelte # Boolean-Auswahlkomponente
│   │   │   ├── selectRadio.svelte  # Mehrfachauswahl-Komponente
│   │   │   └── RouteGuard.svelte   # Routen-Schutz
│   │   ├── stores/               # Svelte Stores
│   │   │   └── auth.ts           # Authentifizierungs-Store
│   │   ├── auth.ts               # Serverseitige Auth
│   │   ├── client-auth.ts        # Clientseitige Auth-Utilities
│   │   ├── roleUtils.ts          # Rollen-/Berechtigungs-Utilities
│   │   ├── index.ts              # Library-Exporte
│   │   └── version.ts            # Versionsverwaltung
│   ├── routes/
│   │   ├── api/                  # API-Endpunkte
│   │   │   ├── auth/             # Auth-APIs
│   │   │   │   ├── login/        # Login
│   │   │   │   ├── logout/       # Logout
│   │   │   │   └── check/        # Auth-Status
│   │   │   ├── users/            # Benutzerverwaltung (API)
│   │   │   ├── admin/            # Admin-spezifische APIs
│   │   │   ├── setup/            # Setup-API
│   │   │   ├── database/         # Datenbank-API
│   │   │   ├── cpro/             # C Pro APIs
│   │   │   ├── c2/               # C2 APIs
│   │   │   ├── cbasic/           # C Basic APIs
│   │   │   ├── kk/               # Kamerakopf APIs
│   │   │   ├── zubehoer/         # Zubehör APIs
│   │   │   ├── outerkarton/      # Außenkarton APIs
│   │   │   └── dashboard-stats/  # Dashboard-Statistiken
│   │   ├── admin/                # Admin-Seiten
│   │   │   └── users/            # Benutzer-UI
│   │   ├── login/                # Login-Seite
│   │   ├── setup/                # Initiales Setup
│   │   ├── profile/              # Profilverwaltung
│   │   ├── database/             # DB-Management-Oberfläche
│   │   ├── debug/                # System-Debug
│   │   ├── cpro/                 # C Pro Prüfformulare (geschützt)
│   │   │   ├── pruefer-a/        # Prüfer A
│   │   │   ├── pruefer-b/        # Prüfer B
│   │   │   └── qr-preview/       # QR-Vorschau
│   │   ├── c2/                   # C2 Prüfformulare (geschützt)
│   │   ├── cbasic/               # C Basic Prüfformulare (geschützt)
│   │   ├── kk/                   # Kamerakopf Prüfformulare (geschützt)
│   │   ├── dashboard/            # Analytik-Dashboards (geschützt)
│   │   │   ├── cpro/             # C Pro Dashboard
│   │   │   ├── c2/               # C2 Dashboard
│   │   │   └── cbasic/           # C Basic Dashboard
│   │   ├── zubehoer/             # Zubehör-Etiketten
│   │   ├── outer-karton/         # Außenkarton-Etiketten
│   │   ├── +layout.svelte        # Hauptlayout mit Auth
│   │   └── +page.svelte          # Dashboard-Startseite
│   │   ├── print-label/          # Nachdruck-Seiten
│   │   ├── qr-preview/           # QR-Vorschau-Seiten
│   │   ├── debug/icons/          # Icon-Preview & Tests
│   │   ├── admin/+layout.svelte  # Admin-Layout (Rollenschutz)
│   ├── hooks.server.ts           # Server-Hooks (Auth)
│   ├── app.html                  # HTML-Template
│   └── app.d.ts                  # TS-Definitionen (Auth-Typen)
├── static/                       # Statische Assets
├── scripts/                      # Dev- & Deploy-Skripte
├── .vscode/                      # VS Code Workspace
├── ROLES.md                      # Rollenhierarchie
├── package.json                  # Abhängigkeiten & Scripts
├── vite.config.ts               # Vite-Konfiguration
├── svelte.config.js             # SvelteKit-Konfiguration
├── tsconfig.json                # TypeScript-Konfiguration
└── README.md                    # Diese Datei
```

## Konfiguration

### Umgebungsvariablen

```bash
# Datenbank (erforderlich)
DATABASE_URL=postgresql://username:password@localhost:5432/etikettdrucker

# Authentifizierung (optional – Defaults vorhanden)
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Anwendung (optional)
VITE_APP_TITLE="Etikettdrucker"
VITE_API_BASE_URL="http://localhost:5173"
```

**Wichtig:** Wenn `JWT_SECRET` nicht gesetzt ist, generiert das System beim Start ein zufälliges Secret. Für Produktionsumgebungen unbedingt ein sicheres, persistentes Secret setzen.

### Datenbankschemata

Die Anwendung nutzt mehrere PostgreSQL-Schemas zur Datenorganisation:

* `cpro_steuerrechner` – C Pro Steuerrechner
* `c2_steuerrechner` – C2 Steuerrechner
* `cbasic_steuerrechner` – C Basic Steuerrechner
* `kk_kamerakopf` – Kamerakopf
* `zubehoer_etikett` – Zubehör-Etiketten
* `outer_karton` – Außenkarton
* `outer_karton_entry` – Kartoninhalt
* `User` – Benutzerkonten & Authentifizierung

## Verfügbare Skripte

```bash
npm run dev          # Entwicklungsserver starten
npm run build        # Produktionsbuild erstellen
npm run preview      # Produktionsbuild lokal ansehen
npm run check        # TypeScript-Checks
npm run check:watch  # TypeScript-Checks im Watch-Modus
npm run db:seed      # Seed-Daten einspielen
npm run db:setup     # DB einrichten (push + seed)
npx prisma studio    # Prisma-DB-UI öffnen
npx prisma generate  # Prisma-Client generieren
npx prisma db push   # Schema-Änderungen anwenden
```

## Testprotokolle

### Qualitätsstandards

Pro Produktlinie gelten standardisierte Prüfprotokolle mit Fokus auf:

* **Konsistenz** – Einheitliche Abläufe über alle Produkte
* **Nachverfolgbarkeit** – Vollständiger Audit-Trail vom Test bis zum Versand
* **Compliance** – Qualitätsnachweise nach Industriestandard
* **Dokumentation** – Lückenlose Ergebniserfassung

### Validierung von Testdaten

* **Pflichtfelder** – Strenge Prüfung auf erforderliche Angaben
* **Formatprüfungen** – Validierung von Seriennummern/IDs
* **Bereichsprüfungen** – Plausible Wertebereiche
* **Querverweise** – Komponenten-Kompatibilität

## Sicherheitsaspekte

### Authentifizierung & Autorisierung

* **JWT-Auth** – Sichere Token-Auth mit HTTP-Only-Cookies
* **Passwortsicherheit** – bcryptjs mit Salt
* **Sitzungsmanagement** – Automatische Token-Prüfung & -Erneuerung
* **XSS-Schutz** – HTTP-Only verhindert JS-Zugriff auf Tokens
* **CSRF-Schutz** – SvelteKit-Mechanismen
* **RBAC** – 6-stufige Hierarchie mit granularer Steuerung

### Datenschutz

* **Eingabevalidierung** – Alle Eingaben werden validiert & bereinigt
* **SQL-Injection-Schutz** – Prisma-ORM standardmäßig sicher
* **Type Safety** – TypeScript-Prüfungen zur Compile-Zeit
* **Routenschutz** – Serverseitige Auth-Prüfung
* **Sensible Daten** – Passwörter niemals im Klartext oder Log

### Audit-Trail

* **Auth-Logging** – Alle Logins & Sitzungen
* **User-Attribution** – Aktionen eindeutig Benutzer zuordenbar
* **Rollenänderungen** – Admin-Aktionen protokolliert
* **DB-Operationen** – CRUD mit User-Kontext
* **Zeitstempel** – Exakte Zeitführung
* **Änderungshistorie** – Vollständige Revisionen

## Mitwirken

### Entwicklungsrichtlinien

1. **Codestil** – TypeScript- & Svelte-Best Practices
2. **Tests** – Änderungen gründlich prüfen
3. **Dokumentation** – Doku bei Feature-Änderungen aktualisieren
4. **DB-Änderungen** – Prisma-Migrationen verwenden

### Pull-Request-Prozess

1. Repo forken
2. Feature-Branch erstellen (`git checkout -b feature/AmazingFeature`)
3. Änderungen committen (`git commit -m 'Add some AmazingFeature'`)
4. Pushen (`git push origin feature/AmazingFeature`)
5. Pull-Request eröffnen

## Support & Kontakt

### Technischer Support

* **Issues** – GitHub-Issues für Bugs & Feature-Requests
* **Dokumentation** – Diese README & Inline-Dokumentation
* **Datenbank** – Prisma-Doku für ORM-Fragen

### Business-Kontakt

* **Unternehmen** – Rotoclear GmbH
* **System** – Interne Qualitätskontrolle & Produktionsmanagement

## Lizenz

Dieses Projekt ist proprietäre Software, entwickelt für die Rotoclear GmbH. Alle Rechte vorbehalten.

---

## Versionsverlauf

### v0.1.0 (Aktuell)

## Neu in v1.0.0-beta

### Wichtige Funktionen & Verbesserungen

* **Professionelles Etiketten-Layout**
  Einheitliches ZPL-Design für Zubehör & Außenkarton, konsistente Ränder/Typografie/Tabellen, Branding & QR-Optimierungen.

* **Robustes QR-Parsing**
  Hybrides QR/Daten-Lookup, Einzelartikel-Anzeige für Zubehör, Fehlertoleranz bei beschädigten/unvollständigen QR-Scans.

* **Modernisierte UI**
  Überarbeitete Drucker-Einstellungen mit globalen Styles; neue Icons (wifi, rotate-ccw).

* **Docker & Deployment**
  Multi-Stage-Dockerfile, `.env.production`-Support, Port-Mapping & Restart-Policies.

* **Sicherheit & Automation**
  JWT-Auth mit Secret-Management, CodeQL/Dependabot vorbereitet, GitHub-Actions-Workflows für CI/CD, Lint & Build.

### Aktualisiertes Setup & Deployment

* **Umgebungsvariablen:**
  Alle Werte in `.env.production` **ohne** Anführungszeichen, z. B.:

  ```
  JWT_SECRET=your_secret
  DATABASE_URL=your_database_url
  SESSION_DURATION=7d
  ```

* **BODY\_SIZE\_LIMIT:**
  Reine Zahl (z. B. `1048576` für 1 MB).

* **Docker-Deployment:**

  ```
  docker build -t etikettendruck .
  docker run -d -p 4000:4000 --env-file .env.production --restart unless-stopped --name etikettendruck etikettendruck
  ```

* **GitHub-Integrationen:**
  CI/CD, Linting & Build via Actions; Dependabot-Updates; CodeQL-Security-Scanning.

### Release Notes

Siehe den neuesten Release auf GitHub für vollständigen Changelog und Deploy-Anleitung.

### v1.0.0-beta (September 2025)

* Interaktive Dashboard-Analysen (Hover-Tooltips, Animationen, mobil-responsive)
* Umfassende Formularvalidierung mit Pflichtfeld-Indikatoren
* Kritische Bugfixes (Prüfer-B-Daten, Änderungslogik, API-Konsistenz)
* Erweiterte Änderungsdetektion (A/B-Vergleich, Vorher/Nachher, Bestätigungen)
* Konsolidierte Außenkarton-APIs, verbessertes Fehlerhandling & Logging
* Erweiterte Etikettenerzeugung (Branding, CE, professionelles ZPL)
* UI/UX-Verbesserungen (Charts, Styling, Mobilnavigation, Accessibility)
* Quality-Assurance-Standards (Validierungsmuster, Templates, Feedback)

### v0.1.0 (Vorheriges Release)

* JWT-Auth mit HTTP-Only-Cookies
* 6-stufiges RBAC (VIEWER → PRUEFER\_B → PRUEFER\_A → PRUEFER\_AB → MANAGEMENT → ADMIN)
* Benutzerverwaltung (Rollen, Profile)
* Routen-Guards für alle sensiblen Operationen
* Sicherheit (Hashing, Session, XSS-Schutz)
* Setup-Wizard für ersten Admin
* Vollständige QC-Workflows (C Pro, C2, C Basic, Kamerakopf)
* Dashboard-Analytik (Echtzeit, Metriken, Performance)
* Etikettenerzeugung & Druck
* DB-Management (Ansicht, Suche, Admin-Tools)
* Außenkarton-Etikettierung (Scan/Manuell)
* Zubehör-Management
* Verbesserte UI/UX (Seitentitel, Navigation)

### v0.0.1 (Initial)

(Siehe v0.1.0 – Erstversion der oben genannten Kernfunktionen)

## Lizenz

Diese Software ist proprietär und vertraulich.
Copyright (c) 2025 Rotoclear GmbH. Alle Rechte vorbehalten.
Siehe [LICENSE](./LICENSE) und [NOTICE](./NOTICE) für Details.
