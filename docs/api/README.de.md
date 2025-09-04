Deutsche Übersetzung der Datei **README.md** (API-Dokumentation). Quelle:&#x20;

# API-Dokumentation

REST-API-Referenz für das Etikettdrucker-System.

## Basis-URL

* **Entwicklung**: `http://localhost:5173/api`
* **Produktion**: `https://your-domain.com/api`

## Authentifizierung

Die API verwendet ein hybrides Authentifizierungssystem aus **JWT + Session** (siehe `src/lib/auth.ts`).

### Authentifizierungs-Ablauf

1. **Login**: `POST /api/auth/login` mit Zugangsdaten
2. **Erhalt**: JWT-Token und Session-ID als **HTTP-only** Cookies
3. **Zugriff**: Cookies bei Folgeanfragen mitsenden
4. **Logout**: `POST /api/auth/logout`, um die Session zu invalidieren

### Sicherheitsfunktionen

* **Rate Limiting**: Anfragen werden IP-basiert begrenzt
* **CSRF-Schutz**: Zustandsändernde Requests erfordern CSRF-Validierung
* **Security Logging**: Alle Auth-Ereignisse werden auditiert
* **Sitzungsverwaltung**: Sessions können serverseitig invalidiert werden

## Request/Response-Format

### Standard-Response-Struktur

Alle Endpunkte liefern Antworten in diesem Format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
  meta?: {
    timestamp: string;
    requestId: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
    };
  };
}
```

### Erfolgsbeispiel

```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "admin",
    "role": "ADMIN"
  },
  "meta": {
    "timestamp": "2025-09-04T10:30:00Z"
  }
}
```

### Fehlerbeispiel

```json
{
  "success": false,
  "error": "Invalid credentials",
  "meta": {
    "timestamp": "2025-09-04T10:30:00Z"
  }
}
```

### Validierungsfehler-Beispiel

```json
{
  "success": false,
  "error": "Validation failed",
  "errors": {
    "username": ["Username is required"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

## Fehlercodes

| HTTP-Status | Bedeutung             | Häufige Ursachen                       |
| ----------- | --------------------- | -------------------------------------- |
| 400         | Bad Request           | Ungültige Eingaben, Validierungsfehler |
| 401         | Unauthorized          | Fehlende/ungültige Authentifizierung   |
| 403         | Forbidden             | Unzureichende Berechtigungen           |
| 404         | Not Found             | Ressource nicht gefunden               |
| 409         | Conflict              | Ressource existiert bereits            |
| 429         | Too Many Requests     | Rate-Limit überschritten               |
| 500         | Internal Server Error | Serverseitiger Fehler                  |

## Rate Limiting

Anfragen werden IP-basiert begrenzt:

* **Limit**: > TODO: Aus `src/lib/security.ts` übernehmen
* **Zeitfenster**: > TODO: Aus `src/lib/security.ts` übernehmen
* **Headers**: `Retry-After` ist in 429-Antworten enthalten

## Sicherheits-Header

Erforderliche Header für authentifizierte Requests:

```http
Content-Type: application/json
Cookie: auth-token=<jwt>; session-id=<session>
```

CSRF-geschützte Endpunkte benötigen zusätzlich:

```http
X-CSRF-Token: <csrf-token>
```

## Endpunkt-Kategorien

### [Authentifizierung](./endpoints/auth.md)

* `POST /api/auth/login` – Benutzerlogin
* `POST /api/auth/logout` – Benutzerlogout
* `GET /api/auth/me` – Aktuellen Benutzer abrufen

### [Benutzerverwaltung](./endpoints/users.md)

* `GET /api/users` – Alle Benutzer (nur Admin)
* `POST /api/users` – Benutzer anlegen (nur Admin)
* `GET /api/users/{id}` – Benutzerdetails
* `PUT /api/users/{id}` – Benutzer aktualisieren
* `DELETE /api/users/{id}` – Benutzer löschen

### [Produktverwaltung](./endpoints/products.md)

* `POST /api/c2` – C2-Produktoperationen
* `POST /api/cpro` – C-Pro-Produktoperationen
* `POST /api/cbasic` – C-Basic-Produktoperationen
* `POST /api/kk` – KK-Produktoperationen

### [Dashboard-Analytik](./endpoints/dashboard.md)

* `GET /api/dashboard-stats` – Produktionsstatistiken
* `GET /api/{product}/stats` – Produktspezifische Analysen

### [Drucken & Etiketten](./endpoints/printing.md)

* `POST /api/printer/test` – Druckerverbindung testen
* `POST /api/{product}/qr` – QR-Codes erzeugen

### [Systemmanagement](./endpoints/management.md)

* `POST /api/outerkarton` – Außenkarton-Management
* `POST /api/zubehoer` – Zubehör-Management
* `GET /api/database/stats` – Datenbankstatistiken

## Wiederkehrende Muster

### Paginierung

List-Endpunkte unterstützen Paginierung:

```http
GET /api/users?page=1&limit=20
```

Die Response enthält Metadaten:

```json
{
  "success": true,
  "data": [...],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150
    }
  }
}
```

### Filtern und Suche

> TODO: Filtermuster anhand realer Endpunkte dokumentieren

### Datei-Uploads

> TODO: Upload-Endpunkte und Formate dokumentieren

## API testen

### Mit curl

```bash
# Login
curl -X POST http://localhost:5173/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier": "admin", "password": "password"}'

# Authentifizierte Anfrage (Cookies aus dem Login)
curl -X GET http://localhost:5173/api/users \
  -b "auth-token=<token>; session-id=<session>"
```

### Mit Postman/Insomnia

1. Collection für die API anlegen
2. Umgebungsvariablen für die Basis-URL setzen
3. Cookie-Auth für die Sitzungsverwaltung verwenden

## Hinweise für die Entwicklung

### Neue Endpunkte hinzufügen

Alle API-Routen liegen unter `src/routes/api/` gemäß SvelteKit-Konventionen:

* `+server.ts`-Dateien definieren HTTP-Handler
* Ordnerstruktur entspricht der URL-Struktur
* TypeScript für Typsicherheit verwenden

### Security-Middleware

Alle geschützten Endpunkte nutzen `SecurityMiddleware.secureEndpoint()` für:

* Authentifizierungsprüfung
* Rollenbasierte Autorisierung
* CSRF-Schutz
* Eingabevalidierung
* Security-Audit-Logging

Beispiel (aus `src/routes/api/users/+server.ts`):

```typescript
const { context } = await SecurityMiddleware.secureEndpoint(event, {
  requiredRole: 'ADMIN',
  validateCSRF: true,
  validateInput: true
});
```

---

*Für detaillierte Endpunktbeschreibungen siehe die einzelnen Dateien im Verzeichnis [endpoints/](./endpoints/).*
