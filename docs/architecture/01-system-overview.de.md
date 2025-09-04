# System Überblick

Das System verbindet Bediener (Prüfer) mit einer Weboberfläche, die sowohl UI Rendering als auch API-Endpunkte bereitstellt. Eine PostgreSQL Datenbank speichert Benutzer‑, Produktions‑ und Prüfdaten. Etiketten werden an Netzwerkdrucker gesendet.

## Hauptakteure
| Akteur | Beschreibung |
| ------ | ------------ |
| Prüfer A/B | Führen Prüfungen & Drucken Labels |
| Management | Betrachtet KPIs & Trends |
| Admin | Benutzer & Rollen Verwaltung |

## Datenfluss (vereinfacht)
```
Scanner → Browser (SvelteKit) → Endpoint → Service (lib) → Prisma → PostgreSQL
													 ↓
												 Drucker
```

