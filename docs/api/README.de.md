# API Übersicht

Diese Sektion beschreibt grundlegende Prinzipien, Authentifizierung und Struktur der REST‑ähnlichen Endpunkte.

## Authentifizierung
- Login erzeugt JWT + Session (DB) – beide werden geprüft
- Token in `Authorization: Bearer <token>` Header
- CSRF Schutz bei mutierenden Requests über Sicherheitsheader / Token

## Antwortformat (Standard)
```json
{ "success": true, "data": { }, "error": null }
```
Fehler:
```json
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "Fehler" } }
```

## Versionierung
Aktuell implizit (v1). Breaking Changes werden über Release Notes / Migration Guides kommuniziert.

## Rate Limiting
Login und sicherheitsrelevante Pfade sind limitiert – bei Überschreitung Audit Event.

## Endpunkt Kategorien
| Kategorie | Beschreibung |
| --------- | ------------ |
| Auth | Anmeldung / Sitzungsverwaltung |
| Benutzer | CRUD für Benutzer & Rollen |
| Produkte | Produkt- / Labelrelevante Daten |
| Dashboard | Aggregierte KPI Abfragen |
| Druck | Etikett Druck / Status |
| Management | Administrative Operationen |

