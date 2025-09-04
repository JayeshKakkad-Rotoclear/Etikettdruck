# API: Authentifizierung

| Methode | Pfad              | Beschreibung                                  |
| ------- | ----------------- | --------------------------------------------- |
| POST    | /api/auth/login   | Benutzer authentifizieren & Session erstellen |
| POST    | /api/auth/logout  | Session ungültig machen                       |
| POST    | /api/auth/refresh | JWT-Token erneuern                            |

Sicherheit: JWT + Session-Hybrid (siehe **ADR-0003**). Rate Limiting aktiv.

---

## Authentifizierungs-Endpunkte

Endpunkte für Authentifizierung und Sitzungsverwaltung.

### POST /api/auth/login

Authentifiziert einen Benutzer und erstellt eine Session.

#### Request

```http
POST /api/auth/login
Content-Type: application/json

{
  "identifier": "admin",
  "password": "securepassword",
  "stayLoggedIn": false
}
```

#### Request-Body Schema

```typescript
interface LoginRequest {
  identifier: string;     // Benutzername oder E-Mail
  password: string;       // Benutzerpasswort
  stayLoggedIn?: boolean; // Optional: Sessiondauer verlängern
}
```

#### Response – Erfolg

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@company.com",
      "firstName": "Admin",
      "lastName": "User",
      "role": "ADMIN",
      "status": "ACTIVE"
    },
    "sessionId": "sess_12345",
    "expiresAt": "2025-09-11T10:30:00Z"
  },
  "meta": {
    "timestamp": "2025-09-04T10:30:00Z"
  }
}
```

#### Response – Fehler

```json
{
  "success": false,
  "error": "Invalid credentials",
  "meta": {
    "timestamp": "2025-09-04T10:30:00Z"
  }
}
```

#### Gesetze Cookies

Der Endpunkt setzt folgende **HTTP-only** Cookies:

* `auth-token`: JWT mit Benutzerinfo und Session
* `session-id`: Sitzungskennung zur serverseitigen Nachverfolgung

#### Rate Limiting

* **IP-basiertes Rate Limiting** (aus `src/lib/security.ts`)
* Antwort **429 Too Many Requests** bei Überschreitung
* Enthält `Retry-After` Header

#### Sicherheitsfunktionen

* Passwortvalidierung
* Logging fehlgeschlagener Login-Versuche
* Tracking von IP-Adresse und User-Agent
* Sitzungsdauer abhängig von `stayLoggedIn`

---

## POST /api/auth/logout

Macht die aktuelle Session ungültig und löscht Auth-Cookies.

#### Request

```http
POST /api/auth/logout
Cookie: auth-token=<jwt>; session-id=<session>
```

#### Response – Erfolg

```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  },
  "meta": {
    "timestamp": "2025-09-04T10:30:00Z"
  }
}
```

#### Seiteneffekte

* Session wird in der Datenbank invalidiert
* Authentifizierungs-Cookies werden gelöscht
* Eintrag im Security-Audit-Log

---

## GET /api/auth/me

Gibt Informationen zum aktuell authentifizierten Benutzer zurück.

#### Request

```http
GET /api/auth/me
Cookie: auth-token=<jwt>; session-id=<session>
```

#### Response – Erfolg

```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@company.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "ADMIN",
    "status": "ACTIVE",
    "lastLoginAt": "2025-09-04T10:30:00Z",
    "createdAt": "2025-08-01T09:00:00Z"
  },
  "meta": {
    "timestamp": "2025-09-04T10:30:00Z"
  }
}
```

#### Response – Nicht autorisiert

```json
{
  "success": false,
  "error": "Authentication required",
  "meta": {
    "timestamp": "2025-09-04T10:30:00Z"
  }
}
```

---

## Beispiel: Auth-Flow

### 1. Login

```bash
curl -X POST http://localhost:5173/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "admin",
    "password": "password",
    "stayLoggedIn": false
  }' \
  -c cookies.txt
```

### 2. Authentifizierte Anfrage

```bash
curl -X GET http://localhost:5173/api/auth/me \
  -b cookies.txt
```

### 3. Logout

```bash
curl -X POST http://localhost:5173/api/auth/logout \
  -b cookies.txt
```

---

## Sicherheitsimplementierung

### JWT-Token-Struktur (aus `src/lib/auth.ts`)

```typescript
interface JWTPayload {
  userId: number;
  username: string;
  role: string;
  sessionId: string;
  ipAddress: string;
  exp: number; // Ablaufzeitpunkt (Unix-Timestamp)
}
```

### Sitzungsverwaltung

* Sessions in DB mit Metadaten gespeichert
* IP-Validierung bei jeder Anfrage
* Automatisches Aufräumen abgelaufener Sessions
* Handhabung paralleler Sitzungen

### Rate-Limiting-Details

Aus `src/lib/security.ts`:

> TODO: Konkrete Limits und Zeitfenster dokumentieren

### Security-Audit-Logging

Alle Auth-Ereignisse werden geloggt mit:

* Zeitstempel
* IP-Adresse
* User-Agent
* Ereignistyp (LOGIN\_ATTEMPT, LOGIN\_SUCCESS, LOGOUT, …)
* Risikobewertung

*Implementierungsdetails: `src/routes/api/auth/` und `src/lib/auth.ts`.*

---
