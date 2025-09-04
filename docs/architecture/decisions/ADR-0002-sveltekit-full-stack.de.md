# ADR-0002: SvelteKit Full-Stack

**Status:** Angenommen
**Datum:** 20.07.2025

## Kontext

Wir benötigen ein einheitliches Framework für SSR, Routing, API-Endpunkte und SPA-Interaktivität.

## Entscheidung

Verwendung von SvelteKit sowohl für die UI als auch für leichtgewichtige Server-Endpunkte (interne APIs) anstelle getrennter Frontend/Backend-Repos.

## Konsequenzen

Vorteile: Schnellere Entwicklung, gemeinsame Typen, vereinfachtes Deployment.
Nachteile: Gekoppeltes Deployment, potenzielle Skalierungsgrenzen für schwere APIs.
