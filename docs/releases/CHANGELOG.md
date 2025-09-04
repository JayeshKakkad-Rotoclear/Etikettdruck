# Changelog

Alle bedeutsamen Änderungen am Projekt **Etikettdrucker** werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) und dieses Projekt folgt der [Semantischen Versionierung](https://semver.org/spec/v2.0.0.html).

## \[1.0.0-beta] – 2025-09-04

### Hauptfunktionen

* **Interaktive Dashboard-Analysen**: Monats-Produktionsdiagramme mit Hover-Tooltips und professioneller Gestaltung
* **Erweiterte Qualitätskontroll-Workflows**: Verbesserte Prüfer-A/B-Abläufe mit fortschrittlicher Änderungsdetektion
* **QR-Code-Erzeugung**: Dynamische QR-Codes für Rückverfolgbarkeit aller Produkttypen
* **Multi-Produkt-Support**: Vollständige Workflows für C2, C-Pro, C-Basic und KK
* **Rollenbasierte Zugriffskontrolle**: Umfassendes RBAC-System mit 6 Berechtigungsstufen

### Verbesserungen der Benutzererfahrung

* **Mobil-optimiertes Design**: Oberfläche vollständig für Mobil- und Tablet-Geräte optimiert
* **Professionelles UI/UX**: Aufgeräumtes, modernes Interface mit besserer Navigation und visueller Hierarchie
* **Interaktive Diagramme**: Chart.js-Integration mit Hover-Tooltips und responsivem Layout
* **Verbesserte Formularvalidierung**: Echtzeit-Validierung mit aussagekräftigen Fehlermeldungen

### Technische Verbesserungen

* **Multi-Schema-Datenbank**: PostgreSQL mit domänengetrennter Schema-Struktur
* **Härtung der Sicherheit**: Verbesserte Authentifizierung, Rate Limiting und Audit-Logging
* **API-Konsolidierung**: Strukturierte REST-API mit einheitlichen Antwortformaten
* **Docker-Support**: Produktionsreife Containerisierung mit Multi-Stage-Builds

### Sicherheitsfunktionen

* **Hybrid-Authentifizierung (JWT + Session)**: Sicheres tokenbasiertes Login mit serverseitigem Sitzungsmanagement
* **Rate Limiting**: API-Schutz gegen Missbrauch und DoS-Angriffe
* **Security-Audit-Logging**: Umfassende Protokollierung aller Auth- und Sicherheitsereignisse
* **CSRF-Schutz**: Schutz vor Cross-Site-Request-Forgery für statusändernde Operationen
* **Eingabevalidierung**: Serverseitige Validierung mit durchgesetzten TypeScript-Schemata

### Fehlerbehebungen

* **Prüfer-B-Änderungsdetektion**: Kritischen Fehler behoben, bei dem stets „keine Änderungen“ angezeigt wurde
* **Formular-State-Management**: Probleme mit Datenpersistenz und Validierung behoben
* **Dashboard-Tooltips**: Positionierung und Interaktivität der Tooltips korrigiert
* **Mobile Navigation**: Menüfunktion und responsives Verhalten auf Mobilgeräten verbessert

### Daten & Analysen

* **Produktionsstatistiken**: Monatliches Tracking und Reporting
* **Qualitätsmetriken**: First-Pass-Rate, Nacharbeitsquote und Fehlertracking
* **Dashboard-Visualisierungen**: Interaktive Diagramme zur Produktionsüberwachung
* **Exportfunktionen**: PDF- und Datenexport

### API-Verbesserungen

* **Standardisiertes Antwortformat**: Konsistente API-Responses für alle Endpunkte
* **Fehlerbehandlung**: Verbesserte Fehlerantworten mit detaillierten Informationen
* **Authentifizierungs-Endpunkte**: Umfassende Auth-API mit Sitzungsverwaltung
* **Produktspezifische APIs**: Dedizierte Endpunkte je Produkttyp inkl. Analytik

### Plattform-Support

* **Windows-Server-Deployment**: Optimiert für Windows-Infrastruktur
* **Docker-Deployment**: Containerisierte Bereitstellung via Docker Compose
* **PostgreSQL 14+**: Datenbankkompatibilität und Performance-Optimierungen
* **Node.js 20**: Moderner JavaScript-Runtime mit verbesserter Performance

---

## \[Frühere Versionen]

### Vor-1.0.0-Entwicklung

* Initiales SvelteKit-Setup
* Basis-Authentifizierungssystem
* Prisma-Integration
* Multi-Schema-Datenbankdesign
* Basis-Produktworkflows
* Security-Middleware-Implementierung

---

## Versionshistorie (Kurzüberblick)

| Version    | Veröffentlichungsdatum | Kernfeatures                                          |
| ---------- | ---------------------- | ----------------------------------------------------- |
| 1.0.0-beta | 2025-09-04             | Dashboard-Analysen, verbessertes UX, Security-Härtung |
| 0.x.x      | 2025-08-xx             | Initiale Entwicklung, Kernfunktionalitäten            |

## Inkompatible Änderungen (Breaking Changes)

### 1.0.0-beta

* **Datenbankschema**: Migration auf Multi-Schema für bestehende Installationen erforderlich
* **API-Antwortformat**: Vereinheitlichtes Format kann Client-Updates notwendig machen
* **Authentifizierung**: Verbesserte Sicherheit kann Session-Refresh erfordern
* **Umgebungsvariablen**: Neue Konfigurationsoptionen für das Deployment notwendig

## Migrationsleitfaden

### Upgrade auf 1.0.0-beta

1. **DB-Migration**: `npm run db:setup` ausführen, um Schema-Änderungen anzuwenden
2. **Umgebung aktualisieren**: Neue Variablen aus `.env.example` übernehmen
3. **Admin-Konto**: Neues Admin-Konto mit verschärften Sicherheitsanforderungen anlegen
4. **Abhängigkeiten**: Auf Node.js 20.x und PostgreSQL 14+ wechseln

## Sicherheitshinweise

### Sicherheitsverbesserungen in 1.0.0-beta

* **Passwortrichtlinie**: Mindestens 12 Zeichen mit Komplexitätsanforderungen
* **Sitzungssicherheit**: Verbesserte Verwaltung inkl. IP-Validierung
* **Rate Limiting**: Schutz gegen Brute Force und DoS
* **Audit-Logging**: Umfassende Protokollierung von Sicherheitsereignissen

## Danksagungen

### Mitwirkende

* Entwicklungsteam: Kernsystem & Architektur
* Qualitätssicherung: Tests & Validierung
* Security-Review: Bewertung & Härtung

### Abhängigkeiten

* **SvelteKit 2.x**: Full-Stack-Framework
* **Prisma**: Typsicherer DB-Client
* **PostgreSQL**: Robuste relationale Datenbank
* **Chart.js**: Interaktive Datenvisualisierung
* **bcryptjs**: Sicheres Passwort-Hashing

---

*Ausführliche technische Änderungen: siehe [Architekturdokumentation](../architecture/README.md).*
*Deployment-Anleitung: siehe [Deployment Guide](../operations/deployment.md).*

---
