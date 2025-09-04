# Datenbankschema-Dokumentation

Multi-Schema-PostgreSQL-Design für das Etikettdrucker-System.

## Schema-Überblick

Das System nutzt eine **Multi-Schema-Architektur**, um Domänen sauber zu trennen (aus `prisma/schema.prisma`):

```mermaid
erDiagram
    USER_MANAGEMENT ||--o{ CPRO_STEUERRECHNER : manages
    USER_MANAGEMENT ||--o{ C2_STEUERRECHNER : manages
    USER_MANAGEMENT ||--o{ CBASIC_STEUERRECHNER : manages
    USER_MANAGEMENT ||--o{ KK_KAMERAKOPF : manages
    USER_MANAGEMENT ||--o{ ZUBEHOER_ETIKETT : manages
    USER_MANAGEMENT ||--o{ OUTER_KARTON : manages
```

### Datenbank-Schemas

* `user_management` – Benutzerkonten, Rollen, Sitzungen
* `cpro_steuerrechner` – Produktdaten C-Pro
* `c2_steuerrechner` – Produktdaten C2
* `cbasic_steuerrechner` – Produktdaten C-Basic
* `kk_kamerakopf` – Produktdaten KK-Kamerakopf
* `zubehoer_etikett` – Zubehör-Etikettierung
* `outer_karton` – Außenkarton-Verwaltung
* `outer_karton_entry` – Zuordnung/Einträge zu Außenkartons

## Kerndomäne(n)

### User-Management-Schema (`user_management`)

#### Entity „User“

```typescript
model User {
  id          Int       @id @default(autoincrement())
  username    String    @unique @db.VarChar(50)
  email       String    @unique @db.VarChar(255)
  passwordHash String   @map("password_hash") @db.VarChar(255)
  firstName   String    @map("first_name") @db.VarChar(100)
  lastName    String    @map("last_name") @db.VarChar(100)
  role        UserRole  @default(VIEWER)
  status      UserStatus @default(ACTIVE)
  lastLoginAt DateTime? @map("last_login_at") @db.Timestamptz
  createdAt   DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt   DateTime  @updatedAt @map("updated_at") @db.Timestamptz
}
```

#### Benutzerrollen

```typescript
enum UserRole {
  ADMIN    // Vollzugriff
  MANAGER  // Management-Funktionen
  USER     // Standard-Operationen
  VIEWER   // Nur-Lese-Zugriff
}

enum UserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
}
```

## Produkt-Schemas

### C-Pro-Schema (`cpro_steuerrechner`)

#### Entity „SingleItemCPro“

Zentrales C-Pro-Produktobjekt mit QC-Daten:

| Feld            | Typ               | Beschreibung            |
| --------------- | ----------------- | ----------------------- |
| `id`            | Int               | Primärschlüssel         |
| `serialnummer`  | String            | Eindeutige Seriennummer |
| `konfiguration` | KonfigurationCPro | RC/DMG/DEMO/EDU         |
| `datum`         | DateTime          | Produktionsdatum        |
| `pruefer_a`     | String            | Name Prüfer A           |
| `pruefer_b`     | String            | Name Prüfer B           |
| `hardware_ok`   | Boolean           | Hardware-Check          |
| `hdmi_ok`       | Boolean           | HDMI-Funktion           |
| `web_ok`        | Boolean           | Web-Interface geprüft   |
| `zoom_ok`       | Boolean           | Zoom-Funktion           |

#### Konfigurationstypen

```typescript
enum KonfigurationCPro {
  RC
  DMG
  DEMO
  EDU
}

enum Festplattengroesse {
  GB_256  // 256 GB
  TB_1    // 1 TB
  TB_4    // 4 TB
}
```

### C2-Schema (`c2_steuerrechner`)

#### Entity „SingleItemC2“

Strukturell ähnlich C-Pro, mit C2-spezifischen Feldern:

| Feld                      | Typ             | Beschreibung                 |
| ------------------------- | --------------- | ---------------------------- |
| `id`                      | Int             | Primärschlüssel              |
| `serialnummer`            | String          | Eindeutige Seriennummer      |
| `konfiguration`           | KonfigurationC2 | RC/DMG/DEMO/EDU              |
| `software_version`        | String          | Installierte Softwareversion |
| `seriennummer_elektronik` | String          | Seriennummer Elektronik      |
| `mac_adresse`             | String          | Netzwerk-MAC-Adresse         |

### KK-Schema (`kk_kamerakopf`)

#### Entity „SingleItemKK“ – Kamerakopf

Produktdaten für den Kamerakopf:

| Feld               | Typ     | Beschreibung            |
| ------------------ | ------- | ----------------------- |
| `id`               | Int     | Primärschlüssel         |
| `serialnummer`     | String  | Eindeutige Seriennummer |
| `artikel_nummer`   | String  | Artikelnummer           |
| `pruefer_a`        | String  | Name Prüfer A           |
| `pruefer_b`        | String  | Name Prüfer B           |
| `sichtpruefung_ok` | Boolean | Status Sichtprüfung     |

## Datenbeziehungen

### User-Produkt-Beziehungen

```mermaid
erDiagram
    User {
        int id PK
        string username UK
        string email UK
        enum role
        enum status
        datetime lastLoginAt
        datetime createdAt
    }
    
    SingleItemCPro {
        int id PK
        string serialnummer UK
        enum konfiguration
        datetime datum
        string pruefer_a FK
        string pruefer_b FK
    }
    
    User ||--o{ SingleItemCPro : inspects
```

### Qualitätskontroll-Ablauf

```mermaid
sequenceDiagram
    participant PA as Prüfer A
    participant System as System
    participant PB as Prüfer B
    participant DB as Database
    
    PA->>System: Initiale Prüfung anlegen
    System->>DB: Daten Prüfer A speichern
    PB->>System: Prüfung abschließen
    System->>DB: Daten Prüfer B speichern
    System->>System: A- vs. B-Daten vergleichen
    System->>DB: Status „abgeschlossen“ setzen
```

## Datenvalidierung & Constraints

### Eindeutigkeit

* Seriennummern sind je Schema eindeutig
* User-`username` und `email` sind global eindeutig
* MAC-Adressen dort eindeutig, wo relevant

### Pflichtfelder (aus Schema-Analyse)

* Produkte: `serialnummer`, `datum`
* Benutzer: `username`, `email`, `passwordHash`, `firstName`, `lastName`
* Qualitätskontrolle: Für „abgeschlossen“ sind `pruefer_a` **und** `pruefer_b` erforderlich

### Datentypen & Formate

* **Seriennummern:** String, hersteller-/produktabhängige Muster
* **Datumswerte:** `timestamptz` (Zeitzonen-bewusst)
* **MAC-Adresse:** Standardformat-Validierung
* **Boolesche Checks:** Dreiwertig (true/false/null) zur Abbildung unvollständiger Prüfungen

## Datenbank-Konfiguration

### Verbindungs-Setup (aus `.env`)

```properties
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
```

### Schema-Management

```bash
# Schema-Änderungen anwenden
npx prisma db push

# TypeScript-Client generieren
npx prisma generate

# Daten im Browser ansehen
npx prisma studio
```

### Migrationen

> TODO: Migrationsstrategie dokumentieren – kein `migrations/`-Ordner gefunden, derzeit „db push“-Ansatz

## Performance-Aspekte

### Index-Strategie (empfohlen)

* PKs (automatisch)
* Unique-Constraints auf Seriennummern
* FK-Beziehungen
* Datumsindizes für Reporting

### Empfohlene Indizes

```sql
-- Datumsgesteuerte Auswertungen
CREATE INDEX idx_cpro_datum ON cpro_steuerrechner.single_item_cpro(datum);
CREATE INDEX idx_c2_datum ON c2_steuerrechner.single_item_c2(datum);

-- QC-Abfragen (A/B)
CREATE INDEX idx_cpro_pruefer ON cpro_steuerrechner.single_item_cpro(pruefer_a, pruefer_b);
```

## Datenschutz & Sicherheit

### Sensible Daten

* Benutzerpasswörter (bcrypt-Hashes)
* Personennamen der Prüfer
* Produktions-Seriennummern (betriebsrelevant)

### Aufbewahrung

> TODO: Richtlinien zur Datenaufbewahrung
> TODO: DSGVO-Maßnahmen für personenbezogene Daten

## Backup & Recovery

### Backup-Strategie

> TODO: Backup-Prozesse beschreiben
> TODO: Point-in-Time-Recovery dokumentieren

### Datenexport

```bash
# Gesamtdump
pg_dump $DATABASE_URL > backup.sql

# Schema-spezifischer Export
pg_dump $DATABASE_URL --schema=cpro_steuerrechner > cpro_backup.sql
```

---

*Definitionen in `prisma/schema.prisma` · Generierte Typen in `@prisma/client`.*

---
