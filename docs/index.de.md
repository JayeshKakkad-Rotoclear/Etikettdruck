# Etikettdrucker Dokumentations-Hub

Willkommen bei der umfassenden Dokumentation für das Qualitätsprüf- und Etikettiersystem **Etikettdrucker**.

## Schnelle Navigation

### Erste Schritte

* **[Setup Guide](./getting-started.md)** – Einrichtung der lokalen Entwicklungsumgebung
* **[User Guides](./user-guides/README.md)** – Endbenutzer-Dokumentation und Arbeitsabläufe

### Architektur & Design

* **[Architecture Overview](./architecture/README.md)** – Vollständige, sechsteilige technische Architektur
* **[API Documentation](./api/README.md)** – REST-API-Referenz und Beispiele
* **[Data Layer](./data/schema.md)** – Datenbankschemata und Datenverträge

### Entwicklung

* **[Development Setup](./development/setup.md)** – Konfiguration der Entwicklerumgebung
* **[Testing Guide](./development/testing.md)** – Teststrategie und -verfahren
* **[Contributing](./development/contributing.md)** – Beitragsrichtlinien

### Betrieb

* **[Deployment Guide](./operations/deployment.md)** – Verfahren für die Produktionsbereitstellung
* **[Monitoring](./operations/monitoring.md)** – Health-Checks und Beobachtbarkeit
* **[Runbooks](./operations/runbooks/README.md)** – Betriebliche Anleitungen

### Referenz

* **[Changelog](./releases/CHANGELOG.md)** – Versionshistorie und Änderungen
* **[Glossar](#glossar)** – Technische Begriffe und Abkürzungen

## Projektüberblick

**Etikettdrucker** ist eine umfassende Lösung für Qualitätsprüfung und Etikettierung in der Fertigung von Rotoclear, aktuell in der Version **v1.0.0-beta**. Das System verwaltet den gesamten Lebenszyklus der Produktqualitätsprüfung – von der Erstinspektion bis zur finalen Etikettierung.

### Hauptfunktionen

* Unterstützung mehrerer Produkte (C2, C-Pro, C-Basic, KK)
* Qualitätskontroll-Workflows (Prüfer-A/B-Prüfungen)
* Interaktive Dashboard-Analysen
* ZPL-Etikettendruck und QR-Code-Erzeugung
* Rollenbasierte Zugriffskontrolle (RBAC)
* PostgreSQL-Datenbank mit mehreren Schemata

### Technologiestack

* **Frontend**: SvelteKit 2.x mit TypeScript
* **Backend**: SvelteKit-API-Routen (Node.js)
* **Datenbank**: PostgreSQL mit Prisma ORM
* **Authentifizierung**: JWT + sichere Sitzungen
* **Bereitstellung**: Docker + Node.js

## Glossar

**ADR** – *Architectural Decision Record*: Dokumentiert wichtige Architekturentscheidungen und deren Begründung.

**API** – *Application Programming Interface*: Standardisierte Schnittstelle für die Systemkommunikation.

**CRUD** – *Create, Read, Update, Delete*: Grundlegende Datenbankoperationen.

**DoD** – *Definition of Done*: Kriterien, die erfüllt sein müssen, damit Arbeit als abgeschlossen gilt.

**DoR** – *Definition of Ready*: Kriterien, die erfüllt sein müssen, bevor Arbeit beginnen kann.

**ER-Diagramm** – *Entity Relationship Diagram*: Visuelle Darstellung von Datenbankbeziehungen.

**JWT** – *JSON Web Token*: Zustandsloses Authentifizierungs-Tokenformat.

**ORM** – *Object-Relational Mapping*: Datenbank-Abstraktionsschicht (in diesem Projekt: Prisma).

**Prüfer A/B** – Deutsch für „Inspector A/B“: Zweistufiger Qualitätsprüfprozess.

**RBAC** – *Role-Based Access Control*: Berechtigungssystem auf Basis von Benutzerrollen.

**SLA** – *Service Level Agreement*: Verpflichtung zu definierten Service-/Leistungsstandards.

**ZPL** – *Zebra Programming Language*: Programmiersprache für industrielle Etikettendrucker.

## Dokumentationsstandards

Diese Dokumentation folgt folgenden Grundsätzen:

* **Wiki-tauglich**: Reines Markdown mit relativen Links für hohe Portabilität
* **Code-basiert**: Informationen direkt aus dem tatsächlichen Quellcode abgeleitet
* **Wartbar**: Klare Struktur mit expliziten TODOs für fehlende Informationen
* **Praxisnah**: Reale Beispiele und lauffähige Code-Snippets

## Beiträge zur Dokumentation

Verbesserungen an der Dokumentation sind willkommen! Siehe die [Beitragsrichtlinien](./development/contributing.md) für Details zu:

* Dokumentationsstandards und Styleguide
* Review-Prozess für Änderungen an der Dokumentation
* Generierung der API-Dokumentation aus dem Code
* Verfahren zur Aktualisierung der Architekturdokumentation

---

*Zuletzt aktualisiert: 4. September 2025 | Version: v1.0.0-beta*
