# Deployment Architektur

## Ziele
- Reproduzierbare Builds
- Trennung von Umgebungen (Dev / Staging / Prod)

## Container Aufbau (Docs Beispiel)
| Stage | Zweck |
| ----- | ----- |
| Node | TypeDoc generieren |
| Python | MkDocs dienen |

## Betriebsmodi
- Dynamisch (aktuelles Setup)
- Optional statisch via `mkdocs build` + Nginx

## Konfiguration
- ENV Variablen injizieren (Secrets nicht ins Image backen)

## Observability
- Healthcheck Endpoint (Root der Docs Site / API künftiger Health)

