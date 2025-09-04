# Teil 3: Datenarchitektur & Datenbankdesign

---

## 10. Überblick über die Datenarchitektur

### 10.1 Strategie der Datenarchitektur

#### Grundprinzipien

* **Datenintegrität**: ACID-Konformität für alle qualitätskritischen Transaktionen
* **Nachverfolgbarkeit**: Vollständiger Audit-Trail für alle Produktprüfaktivitäten
* **Performance**: Optimierte Abfragen für Echtzeitbetrieb und Analytik
* **Skalierbarkeit**: Ausgelegt auf zukünftiges Wachstum bei Stückzahlen und Komplexität
* **Analytik**: Eingebaute Unterstützung für Business Intelligence und Reporting&#x20;

#### Datenfluss-Architektur

```mermaid
graph TD
    subgraph "Data Sources"
        UI[User Input Forms]
        FILES[File Uploads]
        QR[QR Code Scans]
        ANALYTICS[Dashboard Analytics]
    end
    
    subgraph "Application Layer"
        VALID[Validation Layer]
        BL[Business Logic]
        AUDIT[Audit Service]
        STATS[Statistics Engine]
    end
    
    subgraph "Data Layer"
        PRISMA[Prisma ORM]
        DB[(PostgreSQL)]
        BACKUP[(Backup System)]
    end
    
    UI --> VALID
    FILES --> VALID
    QR --> VALID
    VALID --> BL
    BL --> AUDIT
    BL --> PRISMA
    PRISMA --> DB
    DB --> BACKUP
```



### 10.2 Begründung der Datenbanktechnologie

#### Auswahl von PostgreSQL

**Vorteile:**

* **ACID-Konformität**: Kritisch für qualitätsrelevante Daten
* **Erweiterte Features**: JSON-Unterstützung, Volltextsuche, fortgeschrittenes Indexing
* **Skalierbarkeit**: Bewährte Performance im Enterprise-Umfeld
* **Typsicherheit**: Starkes Typensystem passt zu TypeScript in der Anwendung
* **Ökosystem**: Exzellente Prisma-Integration und Tooling&#x20;

#### Vorteile von Prisma ORM

* **Typsicherheit**: End-to-End-Typsicherheit vom DB-Layer bis zum Frontend
* **Migrationsmanagement**: Versionskontrollierte Schema-Weiterentwicklung
* **Abfrage-Optimierung**: Intelligente Query-Generierung und Optimierung
* **Developer Experience**: Intuitive API mit hervorragender TypeScript-Unterstützung&#x20;

---

## 11. Datenbankschema-Design

### 11.1 Zentrale Entitätsbeziehungen

```mermaid
erDiagram
    User {
        int id PK
        string username UK
        string email UK
        string firstName
        string lastName
        enum role
        enum status
        datetime lastLoginAt
        datetime createdAt
        datetime updatedAt
    }
    
    Product {
        int id PK
        string serialNumber UK
        string articleNumber
        string articleDescription
        enum productType
        enum status
        datetime createdAt
        datetime updatedAt
    }
    
    TestingRecord {
        int id PK
        string serialNumber FK
        enum stage
        json testData
        enum status
        int createdBy FK
        datetime createdAt
        datetime updatedAt
    }
    
    OuterKarton {
        int id PK
        string outerKartonId UK
        string lieferscheinNumber
        datetime createdAt
        int createdBy FK
    }
    
    OuterKartonEntry {
        int id PK
        int outerKartonId FK
        string serialNumber
        string articleNumber
        string articleDescription
        int quantity
        datetime addedAt
    }
    
    User ||--o{ TestingRecord : creates
    Product ||--o{ TestingRecord : tests
    User ||--o{ OuterKarton : creates
    OuterKarton ||--o{ OuterKartonEntry : contains
```



### 11.2 Detaillierte Schema-Spezifikationen

#### User-Management-Schema

```sql
-- Users-Tabelle mit umfassender rollenbasierter Zugriffskontrolle
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'VIEWER',
    status user_status NOT NULL DEFAULT 'ACTIVE',
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by INTEGER REFERENCES users(id)
);

-- Enumeration: Benutzerrollen
CREATE TYPE user_role AS ENUM (
    'ADMIN',
    'MANAGEMENT', 
    'PRUEFER_AB',
    'PRUEFER_A',
    'PRUEFER_B',
    'VIEWER'
);

-- Enumeration: Benutzerstatus
CREATE TYPE user_status AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'SUSPENDED'
);
```



#### Produkt-/Test-Schema

```sql
-- Produkt-Stammtabelle
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    article_number VARCHAR(50) NOT NULL,
    article_description TEXT NOT NULL,
    product_type product_type_enum NOT NULL,
    configuration VARCHAR(50), -- Für C2: DMG/RC/EDU/DEMO
    storage_size VARCHAR(20),  -- Für C-Pro: 256GB/1TB/4TB
    status product_status NOT NULL DEFAULT 'IN_TESTING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Testdatensätze mit flexibler JSON-Speicherung
CREATE TABLE testing_records (
    id SERIAL PRIMARY KEY,
    serial_number VARCHAR(100) NOT NULL REFERENCES products(serial_number),
    stage testing_stage NOT NULL,
    test_data JSONB NOT NULL,
    status record_status NOT NULL DEFAULT 'PENDING',
    qr_code TEXT, -- Generierter QR-Inhalt
    label_data JSONB, -- ZPL-Templatedaten
    created_by INTEGER NOT NULL REFERENCES users(id),
    approved_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Sicherstellen: 1 Datensatz pro Stufe je Produkt
    UNIQUE(serial_number, stage)
);

-- Enumeration: Produkttyp
CREATE TYPE product_type_enum AS ENUM (
    'CBASIC',
    'C2', 
    'CPRO',
    'KK'
);

-- Enumeration: Teststufe
CREATE TYPE testing_stage AS ENUM (
    'PRUEFER_A',
    'PRUEFER_B'
);

-- Enumeration: Record-Status
CREATE TYPE record_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'COMPLETED'
);
```



#### „Outer Karton“-Schema

```sql
-- „Outer Karton“-Stammdatensätze
CREATE TABLE outer_kartons (
    id SERIAL PRIMARY KEY,
    outer_karton_id VARCHAR(100) UNIQUE NOT NULL,
    lieferschein_number VARCHAR(100),
    total_entries INTEGER DEFAULT 0,
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Einzelne Einträge innerhalb von „Outer Kartons“
CREATE TABLE outer_karton_entries (
    id SERIAL PRIMARY KEY,
    outer_karton_id INTEGER NOT NULL REFERENCES outer_kartons(id) ON DELETE CASCADE,
    serial_number VARCHAR(100), -- Darf NULL sein für nicht-serialisierte Artikel
    article_number VARCHAR(50) NOT NULL,
    article_description TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indizes für effiziente Suchvorgänge
    INDEX idx_outer_karton_entries_karton_id (outer_karton_id),
    INDEX idx_outer_karton_entries_serial (serial_number)
);
```



### 11.3 Datenmodell-Muster

#### Flexible Speicherung von Testdaten

Die Nutzung von JSONB für Testdaten erlaubt Schema-Flexibilität bei gleichzeitig guter Abfrageperformance:

```typescript
// TypeScript-Interfaces für Testdaten
interface PrueferAData {
  // Gemeinsame Felder über alle Produkttypen
  serialnummer: string;
  datum: string;
  jahr: string;
  pruefer: string;
  
  // Produktspezifische Felder als zusätzliche Properties
  [key: string]: any;
}

interface PrueferBData extends PrueferAData {
  // Zusätzliche Felder für Prüfer B
  final_approval: boolean;
  approval_notes?: string;
  // Produktspezifische Testergebnisse
}
```



#### Implementierung des Audit-Trails

```sql
-- Audit-Log zur Nachverfolgung aller Änderungen
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    record_id INTEGER NOT NULL,
    action audit_action NOT NULL,
    old_values JSONB,
    new_values JSONB,
    changed_by INTEGER NOT NULL REFERENCES users(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

CREATE TYPE audit_action AS ENUM (
    'INSERT',
    'UPDATE', 
    'DELETE'
);

-- Trigger-Funktion für automatisches Audit-Logging
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (table_name, record_id, action, new_values, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', to_jsonb(NEW), NEW.created_by);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), NEW.updated_by);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_values, changed_by)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD), current_user_id());
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```



---

## 12. Datenzugriffsmuster

### 12.1 Prisma-Schema-Definition

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

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
  createdById Int?      @map("created_by")
  
  // Relationen
  createdBy      User?           @relation("UserCreatedBy", fields: [createdById], references: [id])
  createdUsers   User[]          @relation("UserCreatedBy")
  testingRecords TestingRecord[]
  outerKartons   OuterKarton[]
  
  @@map("users")
}

model Product {
  id                 Int           @id @default(autoincrement())
  serialNumber       String        @unique @map("serial_number") @db.VarChar(100)
  articleNumber      String        @map("article_number") @db.VarChar(50)
  articleDescription String        @map("article_description")
  productType        ProductType   @map("product_type")
  configuration      String?       @db.VarChar(50)
  storageSize        String?       @map("storage_size") @db.VarChar(20)
  status             ProductStatus @default(IN_TESTING)
  createdAt          DateTime      @default(now()) @map("created_at") @db.Timestamptz
  updatedAt          DateTime      @updatedAt @map("updated_at") @db.Timestamptz
  
  // Relationen
  testingRecords TestingRecord[]
  
  @@map("products")
}

model TestingRecord {
  id           Int           @id @default(autoincrement())
  serialNumber String        @map("serial_number") @db.VarChar(100)
  stage        TestingStage
  testData     Json          @map("test_data") @db.JsonB
  status       RecordStatus  @default(PENDING)
  qrCode       String?       @map("qr_code")
  labelData    Json?         @map("label_data") @db.JsonB
  createdById  Int           @map("created_by")
  approvedById Int?          @map("approved_by")
  createdAt    DateTime      @default(now()) @map("created_at") @db.Timestamptz
  updatedAt    DateTime      @updatedAt @map("updated_at") @db.Timestamptz
  
  // Relationen
  product     Product @relation(fields: [serialNumber], references: [serialNumber])
  createdBy   User    @relation(fields: [createdById], references: [id])
  approvedBy  User?   @relation(fields: [approvedById], references: [id])
  
  @@unique([serialNumber, stage])
  @@map("testing_records")
}

// Enumerationen
enum UserRole {
  ADMIN
  MANAGEMENT
  PRUEFER_AB
  PRUEFER_A
  PRUEFER_B
  VIEWER
}

enum UserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
}

enum ProductType {
  CBASIC
  C2
  CPRO
  KK
}

enum TestingStage {
  PRUEFER_A
  PRUEFER_B
}

enum RecordStatus {
  PENDING
  APPROVED
  REJECTED
  COMPLETED
}
```



### 12.2 Implementierung der Datenzugriffsschicht

#### Repository-Pattern

```typescript
// src/lib/repositories/BaseRepository.ts
export abstract class BaseRepository<T> {
  constructor(protected prisma: PrismaClient) {}
  
  abstract create(data: any): Promise<T>;
  abstract findById(id: number): Promise<T | null>;
  abstract findMany(filter?: any): Promise<T[]>;
  abstract update(id: number, data: any): Promise<T>;
  abstract delete(id: number): Promise<void>;
}

// src/lib/repositories/UserRepository.ts
export class UserRepository extends BaseRepository<User> {
  async create(data: CreateUserData): Promise<User> {
    return this.prisma.user.create({
      data: {
        ...data,
        passwordHash: await this.hashPassword(data.password)
      }
    });
  }
  
  async findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { username }
    });
  }
  
  async findActiveUsers(): Promise<User[]> {
    return this.prisma.user.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' }
    });
  }
  
  async updateLastLogin(id: number): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() }
    });
  }
}
```



#### Abfrage-Optimierungsmuster

```typescript
// Effiziente Abfragen mit passenden Indizes und Includes
export class TestingRecordRepository extends BaseRepository<TestingRecord> {
  async findBySerialNumber(serialNumber: string): Promise<TestingRecord[]> {
    return this.prisma.testingRecord.findMany({
      where: { serialNumber },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        },
        approvedBy: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
  }
  
  async findPendingApprovals(userId: number): Promise<TestingRecord[]> {
    return this.prisma.testingRecord.findMany({
      where: {
        status: 'PENDING',
        stage: 'PRUEFER_B'
      },
      include: {
        product: true,
        createdBy: {
          select: { username: true, firstName: true, lastName: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
  }
}
```



---

## 13. Strategie für Datenmigration

### 13.1 Migrationsverwaltung

#### Versionskontrollierte Migrationen

```sql
-- migrations/001_initial_schema.sql
-- Initiale User-Management-Tabellen
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Benutzerrollen und Berechtigungen
CREATE TABLE user_roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Standardrollen einfügen
INSERT INTO user_roles (name, permissions) VALUES
('ADMIN', '["*"]'::jsonb),
('MANAGEMENT', '["read:*", "write:reports"]'::jsonb),
('PRUEFER_AB', '["read:*", "write:testing"]'::jsonb),
('PRUEFER_A', '["read:products", "write:pruefer_a"]'::jsonb),
('PRUEFER_B', '["read:products", "write:pruefer_b"]'::jsonb),
('VIEWER', '["read:products"]'::jsonb);
```



#### Strategie für Migration-Rollbacks

```typescript
// src/lib/migrations/MigrationRunner.ts
export class MigrationRunner {
  constructor(private prisma: PrismaClient) {}
  
  async runMigration(migrationName: string): Promise<void> {
    const migration = await import(`./migrations/${migrationName}`);
    
    try {
      await this.prisma.$transaction(async (tx) => {
        await migration.up(tx);
        await this.recordMigration(migrationName);
      });
    } catch (error) {
      console.error(`Migration ${migrationName} fehlgeschlagen:`, error);
      throw error;
    }
  }
  
  async rollbackMigration(migrationName: string): Promise<void> {
    const migration = await import(`./migrations/${migrationName}`);
    
    if (!migration.down) {
      throw new Error(`Migration ${migrationName} hat kein definiertes Rollback`);
    }
    
    await this.prisma.$transaction(async (tx) => {
      await migration.down(tx);
      await this.removeMigrationRecord(migrationName);
    });
  }
}
```



### 13.2 Strategie für Daten-Seeding

#### Seed-Daten für Entwicklung

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Admin-Benutzer anlegen
  const adminPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@rotoclear.com',
      passwordHash: adminPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: 'ADMIN',
      status: 'ACTIVE'
    }
  });
  
  // Beispiel-Testdaten erzeugen
  await createSampleProducts();
  await createSampleTestingRecords();
  
  console.log('Database seeded successfully');
}

async function createSampleProducts() {
  const products = [
    {
      serialNumber: 'CPRO001',
      articleNumber: '10651',
      articleDescription: 'Steuerrechner 4TB fuer Rotoclear C Pro',
      productType: 'CPRO',
      storageSize: 'TB_4'
    },
    {
      serialNumber: 'C2001', 
      articleNumber: '10052',
      articleDescription: 'Steuerrechner für RotoLENS DMG',
      productType: 'C2',
      configuration: 'DMG'
    }
  ];
  
  for (const product of products) {
    await prisma.product.upsert({
      where: { serialNumber: product.serialNumber },
      update: {},
      create: product
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```



## 13. Analytik & Datenarchitektur des Dashboards

### 13.1 Abfragen für Dashboard-Analytik

#### Monatliche Produktionsstatistiken

```typescript
// Monatliche Produktionsaggregation für Dashboard-Charts
interface MonthlyProductionStats {
  month: string;
  year: number;
  totalProduction: number;
  productTypeBreakdown: {
    C2: number;
    CPRO: number;
    CBASIC: number;
    KK: number;
  };
  qualityMetrics: {
    firstPassRate: number;
    reworkRate: number;
    defectRate: number;
  };
}

// Optimierte Abfrage für monatliche Produktionsdaten
const getMonthlyProductionStats = async (year: number) => {
  return await prisma.$queryRaw`
    SELECT 
      EXTRACT(MONTH FROM created_at) as month,
      EXTRACT(YEAR FROM created_at) as year,
      product_type,
      COUNT(*) as production_count,
      AVG(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as first_pass_rate
    FROM testing_records 
    WHERE EXTRACT(YEAR FROM created_at) = ${year}
    GROUP BY EXTRACT(YEAR FROM created_at), EXTRACT(MONTH FROM created_at), product_type
    ORDER BY year, month;
  `;
};
```



### 13.2 Leistungsoptimierung für Analytik

#### Datenbankindizes für Dashboard-Abfragen

```sql
-- Indizes zur Performance-Optimierung
CREATE INDEX idx_testing_records_created_at ON testing_records(created_at);
CREATE INDEX idx_testing_records_product_type ON testing_records(product_type);
CREATE INDEX idx_testing_records_status ON testing_records(status);
CREATE INDEX idx_testing_records_created_by ON testing_records(created_by);

-- Zusammengesetzte Indizes für häufige Dashboard-Abfragen
CREATE INDEX idx_testing_records_dashboard ON testing_records(created_at, product_type, status);
CREATE INDEX idx_monthly_stats ON testing_records(date_trunc('month', created_at), product_type);
```



#### Caching-Strategie für das Dashboard

* **In-Memory-Cache**: Monatliche Statistiken für 1 Stunde zwischenspeichern
* **Query-Optimierung**: Aggregatabfragen mit passenden Indizes
* **Echtzeit-Updates**: WebSocket-Verbindungen für Live-Dashboard-Updates&#x20;

---
