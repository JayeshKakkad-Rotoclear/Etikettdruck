# ADR-0003: JWT Session Hybrid Auth

Status: Akzeptiert
Datum: 2025-01-25

## Kontext
Nur JWT: schwer widerrufbar. Nur Session: höhere Serverlast bei Skalierung. Ziel: Beste Eigenschaften kombinieren.

## Entscheidung
JWT Tokens signieren und zusätzlich serverseitige Session mit Ablauf & optionaler IP Bindung pflegen.

## Konsequenzen
| Plus | Minus |
| ---- | ----- |
| Revokation möglich | Mehr DB Zugriffe |
| Prüfbarkeit / Audit | Komplexere Implementierung |

