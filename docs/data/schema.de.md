# Datenbankschema Dokumentation

Multi-Schema PostgreSQL Datenbankdesign für das Etikettdrucker-System.

## Schema Überblick

Das System nutzt eine **Multi-Schema-Architektur** zur fachlichen Trennung (aus `prisma/schema.prisma`):

```mermaid
erDiagram
		USER_MANAGEMENT ||--o{ CPRO_STEUERRECHNER : verwaltet
		USER_MANAGEMENT ||--o{ C2_STEUERRECHNER : verwaltet
		USER_MANAGEMENT ||--o{ CBASIC_STEUERRECHNER : verwaltet
		USER_MANAGEMENT ||--o{ KK_KAMERAKOPF : verwaltet
		USER_MANAGEMENT ||--o{ ZUBEHOER_ETIKETT : verwaltet
		USER_MANAGEMENT ||--o{ OUTER_KARTON : verwaltet
```

### Datenbank Schemas
- `user_management` – Benutzerkonten, Rollen, Sessions
- `cpro_steuerrechner` – C-Pro Produktdaten
- `c2_steuerrechner` – C2 Produktdaten  
- `cbasic_steuerrechner` – C-Basic Produktdaten
- `kk_kamerakopf` – KK Kamerakopf Daten
- `zubehoer_etikett` – Zubehör Etikettierung
- `outer_karton` – Außenkarton Verwaltung
- `outer_karton_entry` – Karton Eintrags-Tracking

## Kernentitäten

### User Management Schema (`user_management`)

#### User Entität
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
	MANAGER  // Management Funktionen
	USER     // Standard Nutzung
	VIEWER   // Nur Lesen
}

enum UserStatus {
	ACTIVE
	INACTIVE
	SUSPENDED
}
```

## Produkt Schemas

### C-Pro Schema (`cpro_steuerrechner`)

#### SingleItemCPro Entität
Zentrale C-Pro Produktzeile mit Qualitätsdaten:

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `id` | Int | Primärschlüssel |
| `serialnummer` | String | Eindeutige Seriennummer |
| `konfiguration` | KonfigurationCPro | RC/DMG/DEMO/EDU |
| `datum` | DateTime | Produktionsdatum |
| `pruefer_a` | String | Prüfer A Name |
| `pruefer_b` | String | Prüfer B Name |
| `hardware_ok` | Boolean | Hardware Check Status |
| `hdmi_ok` | Boolean | HDMI Funktion |
| `web_ok` | Boolean | Webinterface Prüfung |
| `zoom_ok` | Boolean | Zoom Funktion |

#### Konfigurationstypen
```typescript
enum KonfigurationCPro {
	RC    // Standard Konfiguration
	DMG   // DMG Variante
	DEMO  // Demo Konfiguration
	EDU   // Education Version
}

enum Festplattengroesse {
	GB_256  // 256 GB Speicher
	TB_1    // 1 TB Speicher  
	TB_4    // 4 TB Speicher
}
```

### C2 Schema (`c2_steuerrechner`)

#### SingleItemC2 Entität
Ähnliche Struktur wie C-Pro mit C2-spezifischen Feldern:

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `id` | Int | Primärschlüssel |
| `serialnummer` | String | Eindeutige Seriennummer |
| `konfiguration` | KonfigurationC2 | RC/DMG/DEMO/EDU |
| `software_version` | String | Installierte Softwareversion |
| `seriennummer_elektronik` | String | Elektronik Seriennummer |
| `mac_adresse` | String | Netzwerk MAC Adresse |

### KK Schema (`kk_kamerakopf`)

#### SingleItemKK Entität  
Kamerakopf-spezifische Produktdaten:

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `id` | Int | Primärschlüssel |
| `serialnummer` | String | Eindeutige Seriennummer |
| `artikel_nummer` | String | Artikelnummer |
| `pruefer_a` | String | Prüfer A Name |
| `pruefer_b` | String | Prüfer B Name |
| `sichtpruefung_ok` | Boolean | Sichtprüfung Status |

## Datenbeziehungen

### User–Produkt Beziehungen
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
    
		User ||--o{ SingleItemCPro : prueft
```

### Qualitätsprüfungs-Workflow
```mermaid
sequenceDiagram
		participant PA as Prüfer A
		participant System as System
		participant PB as Prüfer B
		participant DB as Datenbank
    
		PA->>System: Erstprüfung anlegen
		System->>DB: Speichere Prüfer A Daten
		PB->>System: Prüfung abschließen
		System->>DB: Speichere Prüfer B Daten
		System->>System: Vergleiche A vs B
		System->>DB: Markiere als abgeschlossen
```

## Datenvalidierung & Constraints

### Eindeutigkeit
- Alle Produkt-Seriennummern eindeutig innerhalb ihres Schemas
- Benutzer Usernames & Emails global eindeutig
- MAC Adressen eindeutig wo vorhanden

### Pflichtfelder
Aus Schema Analyse:
- Produkte: `serialnummer`, `datum`
- Benutzer: `username`, `email`, `passwordHash`, `firstName`, `lastName`
- Qualitätsprozess: `pruefer_a` und `pruefer_b` für Abschluss

### Datentypen & Formate
- **Seriennummern**: String, herstellerspezifische Muster
- **Datumswerte**: PostgreSQL timestamptz (Zeitzonen bewusst)
- **MAC Adressen**: Standard Format Validierung
- **Boolean Checks**: Drei-Zustände (true/false/null) für unvollständige Prüfungen

## Datenbank Konfiguration

### Connection Setup (aus `.env`)
```properties
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
```

### Schema Verwaltung
```bash
# Schema Änderungen anwenden
npx prisma db push

# TypeScript Client generieren
npx prisma generate

# Daten im Browser ansehen
npx prisma studio
```

### Migrationen
> TODO: Migrationsstrategie dokumentieren – kein migrations/ Verzeichnis gefunden, aktueller Ansatz: db push

## Performance Überlegungen

### Index Strategie
Basierend auf häufigen Abfragen:
- Primärschlüssel (automatisch)
- Eindeutigkeit auf Seriennummern
- Foreign Key Beziehungen
- Datumsbasierte Abfragen fürs Reporting

### Empfohlene Indexe
```sql
-- Produktsuche nach Seriennummer (bereits unique)
-- Datumsbasierte Reporting Abfragen
CREATE INDEX idx_cpro_datum ON cpro_steuerrechner.single_item_cpro(datum);
CREATE INDEX idx_c2_datum ON c2_steuerrechner.single_item_c2(datum);

-- Qualitätsprüfungs Abfragen  
CREATE INDEX idx_cpro_pruefer ON cpro_steuerrechner.single_item_cpro(pruefer_a, pruefer_b);
```

## Datenschutz & Sicherheit

### Sensible Daten
- Benutzer Passwörter (bcrypt gehasht)
- Personenbezogene Prüfer Namen
- Produktions-Seriennummern (geschäftskritisch)

### Datenaufbewahrung
> TODO: Aufbewahrungsrichtlinien dokumentieren
> TODO: DSGVO Maßnahmen dokumentieren

## Backup & Recovery

### Backup Strategie
> TODO: Backup Prozeduren dokumentieren
> TODO: Point-in-Time Recovery dokumentieren

### Datenexport
```bash
# Gesamter Datenbank Dump
pg_dump $DATABASE_URL > backup.sql

# Schema-spezifischer Export
pg_dump $DATABASE_URL --schema=cpro_steuerrechner > cpro_backup.sql
```

---
*Schema Definition in `prisma/schema.prisma` | Generierte Typen in `node_modules/@prisma/client`*
