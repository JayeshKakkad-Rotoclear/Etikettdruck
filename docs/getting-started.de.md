# Einstieg

Diese Anleitung führt durch das lokale Aufsetzen der Entwicklungsumgebung.

## Voraussetzungen
| Komponente | Version | Hinweis |
| ---------- | ------- | ------- |
| Node.js | 20.x | LTS empfohlen |
| npm | >=10 | Automatisch bei Node enthalten |
| PostgreSQL | 14+ | Lokale oder Docker Instanz |
| Git | Aktuell | Für Klonen & Versionierung |
| Docker (optional) | Neueste | Für Container & Docs |

## Schritt 1: Repository klonen
```bash
git clone https://github.com/JayeshKakkad-Rotoclear/Etikettdruck.git
cd Etikettdruck/etikettendruck
```

## Schritt 2: Abhängigkeiten installieren
```bash
npm ci
```

## Schritt 3: Umgebungsvariablen konfigurieren
Kopiere `.env` oder erstelle `.env.local` mit mindestens:
```
DATABASE_URL=postgresql://user:pass@localhost:5432/etikett
JWT_SECRET=entwicklungs-geheimnis-nur-lokal
```

## Schritt 4: Datenbank migrieren & (optional) seeden
```bash
npx prisma migrate deploy
npx ts-node prisma/seed.ts   # wenn Seeds benötigt
```

## Schritt 5: Entwicklung starten
```bash
npm run dev
```
Anwendung erreichbar unter `http://localhost:5173` (Standard Vite Port) – abhängig von Konfiguration.

## Schritt 6: Admin anlegen
Nutze eines der Skripte in `scripts/` (siehe „Admin Einrichtung“).

## Fehlerbehebung
| Symptom | Lösung |
| ------- | ------ |
| Prisma Fehler „Schema nicht gefunden“ | Sicherstellen, dass im Container `prisma/schema.prisma` kopiert wird |
| DB Verbindung schlägt fehl | Credentials & Host prüfen |
| 401 bei Login | JWT_SECRET gesetzt? Session Tabelle vorhanden? |

## Nächste Schritte
- Lies Benutzerrollen
- Teste Qualitätskontroll-Workflow
- Konfiguriere Monitoring (später für Produktion)

