# Database Schema Documentation

Multi-schema PostgreSQL database design for the Etikettdrucker system.

## Schema Overview

The system uses a **multi-schema architecture** to separate concerns by domain (from `prisma/schema.prisma`):

```mermaid
erDiagram
    USER_MANAGEMENT ||--o{ CPRO_STEUERRECHNER : manages
    USER_MANAGEMENT ||--o{ C2_STEUERRECHNER : manages
    USER_MANAGEMENT ||--o{ CBASIC_STEUERRECHNER : manages
    USER_MANAGEMENT ||--o{ KK_KAMERAKOPF : manages
    USER_MANAGEMENT ||--o{ ZUBEHOER_ETIKETT : manages
    USER_MANAGEMENT ||--o{ OUTER_KARTON : manages
```

### Database Schemas
- `user_management` - User accounts, roles, sessions
- `cpro_steuerrechner` - C-Pro product data
- `c2_steuerrechner` - C2 product data  
- `cbasic_steuerrechner` - C-Basic product data
- `kk_kamerakopf` - KK camera head data
- `zubehoer_etikett` - Accessories labeling
- `outer_karton` - Outer carton management
- `outer_karton_entry` - Carton entry tracking

## Core Entities

### User Management Schema (`user_management`)

#### User Entity
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

#### User Roles
```typescript
enum UserRole {
  ADMIN    // Full system access
  MANAGER  // Management functions
  USER     // Standard operations
  VIEWER   // Read-only access
}

enum UserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
}
```

## Product Schemas

### C-Pro Schema (`cpro_steuerrechner`)

#### SingleItemCPro Entity
Core C-Pro product record with quality control data:

| Field | Type | Description |
|-------|------|-------------|
| `id` | Int | Primary key |
| `serialnummer` | String | Unique serial number |
| `konfiguration` | KonfigurationCPro | RC/DMG/DEMO/EDU |
| `datum` | DateTime | Production date |
| `pruefer_a` | String | Inspector A name |
| `pruefer_b` | String | Inspector B name |
| `hardware_ok` | Boolean | Hardware check status |
| `hdmi_ok` | Boolean | HDMI functionality |
| `web_ok` | Boolean | Web interface check |
| `zoom_ok` | Boolean | Zoom functionality |

#### Configuration Types
```typescript
enum KonfigurationCPro {
  RC    // Standard configuration
  DMG   // DMG variant
  DEMO  // Demo configuration
  EDU   // Educational version
}

enum Festplattengroesse {
  GB_256  // 256 GB storage
  TB_1    // 1 TB storage  
  TB_4    // 4 TB storage
}
```

### C2 Schema (`c2_steuerrechner`)

#### SingleItemC2 Entity
Similar structure to C-Pro with C2-specific fields:

| Field | Type | Description |
|-------|------|-------------|
| `id` | Int | Primary key |
| `serialnummer` | String | Unique serial number |
| `konfiguration` | KonfigurationC2 | RC/DMG/DEMO/EDU |
| `software_version` | String | Installed software version |
| `seriennummer_elektronik` | String | Electronics serial number |
| `mac_adresse` | String | Network MAC address |

### KK Schema (`kk_kamerakopf`)

#### SingleItemKK Entity  
Camera head specific product data:

| Field | Type | Description |
|-------|------|-------------|
| `id` | Int | Primary key |
| `serialnummer` | String | Unique serial number |
| `artikel_nummer` | String | Article number |
| `pruefer_a` | String | Inspector A name |
| `pruefer_b` | String | Inspector B name |
| `sichtpruefung_ok` | Boolean | Visual inspection status |

## Data Relationships

### User-Product Relationships
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

### Quality Control Workflow
```mermaid
sequenceDiagram
    participant PA as Prüfer A
    participant System as System
    participant PB as Prüfer B
    participant DB as Database
    
    PA->>System: Create initial inspection
    System->>DB: Store Prüfer A data
    PB->>System: Complete inspection
    System->>DB: Store Prüfer B data
    System->>System: Compare A vs B data
    System->>DB: Mark as complete
```

## Data Validation & Constraints

### Unique Constraints
- All product serial numbers must be unique within their schema
- User usernames and emails are globally unique
- MAC addresses are unique where applicable

### Required Fields
From schema analysis:
- All products require: `serialnummer`, `datum`
- Users require: `username`, `email`, `passwordHash`, `firstName`, `lastName`
- Quality control requires both `pruefer_a` and `pruefer_b` for completion

### Data Types & Formats
- **Serial Numbers**: String format, vendor-specific patterns
- **Dates**: PostgreSQL timestamptz for timezone awareness
- **MAC Addresses**: Standard MAC address format validation
- **Boolean Checks**: Three-state logic (true/false/null) for incomplete inspections

## Database Configuration

### Connection Setup (from `.env`)
```properties
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
```

### Schema Management
```bash
# Apply schema changes
npx prisma db push

# Generate TypeScript client
npx prisma generate

# View data in browser
npx prisma studio
```

### Migrations
> TODO: Document migration strategy - no migrations/ folder found, using db push approach

## Performance Considerations

### Indexing Strategy
Based on common query patterns:
- Primary keys (automatic)
- Unique constraints on serial numbers
- Foreign key relationships
- Date-based queries for reporting

### Recommended Indexes
```sql
-- Product lookup by serial number (already unique)
-- Date-based reporting queries
CREATE INDEX idx_cpro_datum ON cpro_steuerrechner.single_item_cpro(datum);
CREATE INDEX idx_c2_datum ON c2_steuerrechner.single_item_c2(datum);

-- Quality control queries  
CREATE INDEX idx_cpro_pruefer ON cpro_steuerrechner.single_item_cpro(pruefer_a, pruefer_b);
```

## Data Privacy & Security

### Sensitive Data
- User passwords (hashed with bcrypt)
- Personal inspector names
- Production serial numbers (business sensitive)

### Data Retention
> TODO: Document data retention policies
> TODO: Document GDPR compliance measures for personal data

## Backup & Recovery

### Backup Strategy
> TODO: Document backup procedures
> TODO: Document point-in-time recovery

### Data Export
```bash
# Full database dump
pg_dump $DATABASE_URL > backup.sql

# Schema-specific export
pg_dump $DATABASE_URL --schema=cpro_steuerrechner > cpro_backup.sql
```

---
*Schema definition in `prisma/schema.prisma` | Generated types in `node_modules/@prisma/client`*
