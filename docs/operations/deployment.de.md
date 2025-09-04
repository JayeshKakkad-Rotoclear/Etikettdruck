# Leitfaden für die Produktionsbereitstellung

Umfassende Anleitung für das Deployment des Etikettdrucker-Systems in Produktion.

## Deploy­ment-Architektur

Das System ist für **Windows-Server**-Infrastruktur mit Docker-Support ausgelegt (siehe `Dockerfile` und `docs/architecture/05-deployment-architecture.md`).

### Deployment-Optionen

1. **Docker-Deployment** (empfohlen)
2. **Direktes Node.js-Deployment**
3. **Windows-Service-Deployment**

## Docker-Deployment (empfohlen)

### Voraussetzungen

* Docker Engine 20.x+
* PostgreSQL 14+ (separate Instanz oder Docker)
* Windows Server 2019+ oder Docker-fähiger Host

### Build & Deploy

```bash
# 1. Repository klonen
git clone <repository-url>
cd etikettendruck

# 2. Docker-Image bauen
docker build -t etikettdrucker:latest .

# 3. Mit Docker Compose starten
docker-compose up -d
```

### Docker-Konfiguration

#### Dockerfile-Analyse (Multi-Stage-Build)

```dockerfile
# Builder-Stage – Node.js 20 bookworm-slim
FROM node:20-bookworm-slim AS builder
# - Installiert OS-Dependencies (openssl, ca-certificates)
# - Kopiert package-Dateien und Prisma-Schema
# - Führt npm ci (Production-Dependencies) aus
# - Generiert Prisma-Client
# - Baut SvelteKit-Anwendung

# Runtime-Stage – Node.js 20 bookworm-slim
FROM node:20-bookworm-slim AS runner
# - Minimale Runtime-Umgebung
# - Kopiert Build-Artefakte aus dem Builder
# - Exposed Port 3000
# - Läuft mit 'node'-User (Security)
```

#### Docker-Compose-Konfiguration

```yaml
# Aus docker-compose.yml
services:
  app:
    build: .
    ports:
      - "4000:3000"    # Extern:Intern
    env_file: .env
    restart: unless-stopped
```

### Umgebungs-Konfiguration

Erstelle eine Produktions-`.env`:

```properties
# Datenbank
DATABASE_URL="postgresql://username:password@db-host:5432/etikettdrucker?sslmode=require"

# Sicherheit
JWT_SECRET="secure-random-256-bit-string"
SESSION_DURATION="7d"
COOKIE_SECURE=true

# Anwendung
NODE_ENV=production
PORT=3000
```

## Direktes Node.js-Deployment

### Voraussetzungen

* Node.js 20.x (laut `package.json`)
* PostgreSQL 14+
* Prozessmanager (PM2 empfohlen)

### Schritte

```bash
# 1. Dependencies installieren
npm ci --production

# 2. Prisma-Client generieren
npx prisma generate

# 3. Datenbank einrichten
npm run db:setup

# 4. Anwendung bauen
npm run build

# 5. Produktionsserver starten
npm start
```

### Prozessverwaltung mit PM2

```bash
# PM2 global installieren
npm install -g pm2

# PM2-Ecosystem-Datei
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'etikettdrucker',
    script: 'build/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# Start & Persistenz
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Datenbank-Setup

### PostgreSQL-Konfiguration

```sql
-- Datenbank und User anlegen
CREATE DATABASE etikettdrucker;
CREATE USER etikettdrucker_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE etikettdrucker TO etikettdrucker_user;

-- Erforderliche Extensions (falls benötigt)
\c etikettdrucker;
-- Extensions hier hinzufügen
```

### Schema-Initialisierung

```bash
# Schema anwenden
npx prisma db push

# Seed-Daten
npm run db:seed

# Admin anlegen
npm run create-admin
```

## Reverse-Proxy-Konfiguration

### Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### IIS (Windows Server)

```xml
<!-- web.config für IIS mit URL Rewrite -->
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="Reverse Proxy" stopProcessing="true">
          <match url="(.*)" />
          <action type="Rewrite" url="http://localhost:3000/{R:1}" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```

## SSL/TLS

### Zertifikate

```bash
# Let's Encrypt (Linux/Docker)
certbot certonly --webroot -w /var/www/html -d your-domain.com

# Windows-Zertifikatsspeicher
# Import via IIS Manager oder PowerShell
```

### SSL-bezogene Umgebungsvariablen

```properties
# HTTPS-Cookies erzwingen
COOKIE_SECURE=true

# Proxy-Header vertrauen
TRUST_PROXY=true
```

## Health-Checks

### Application-Health-Endpoint

> TODO: Health-Check-Endpoint zur Anwendung hinzufügen

### Docker Healthcheck

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
```

### Monitoring-Skript

```bash
#!/bin/bash
# health-check.sh
curl -f http://localhost:3000/api/auth/me > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "Application health check failed"
    # Notification-Logik ergänzen
    exit 1
fi
echo "Application is healthy"
```

## Backup & Recovery

### Datenbank-Backup

```bash
#!/bin/bash
# backup-db.sh
BACKUP_DIR="/backups/etikettdrucker"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

pg_dump $DATABASE_URL > "$BACKUP_DIR/backup_$DATE.sql"
gzip "$BACKUP_DIR/backup_$DATE.sql"
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

### Applikations-Backup

```bash
#!/bin/bash
# backup-app.sh
BACKUP_DIR="/backups/etikettdrucker"
DATE=$(date +%Y%m%d_%H%M%S)

cp .env "$BACKUP_DIR/env_$DATE"
tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" uploads/
```

## Rollback-Verfahren

### Docker-Rollback

```bash
docker tag etikettdrucker:latest etikettdrucker:backup
docker build -t etikettdrucker:latest .
docker-compose up -d

# Rollback
docker tag etikettdrucker:backup etikettdrucker:latest
docker-compose up -d
```

### Datenbank-Rollback

```bash
# Backup einspielen
gunzip -c backup_20250904_100000.sql.gz | psql $DATABASE_URL
```

## Sicherheitsaspekte

### Umgebungssicherheit

* Secrets sicher in Umgebungsvariablen speichern
* Starke JWT-Secrets (mind. 256-bit)
* HTTPS in Produktion aktivieren
* Firewall-Regeln konfigurieren

### Anwendungssicherheit

* Regelmäßige Sicherheitsupdates
* Security-Audit-Logs überwachen
* Rate Limiting aktiv halten
* Sichere Sitzungsverwaltung

### Netzwerksicherheit

* DB-Zugriff auf App-Server beschränken
* Administration nur über VPN
* Regelmäßige Security-Audits

## Performance-Optimierung

### Datenbank

```sql
-- Häufige Abfragen beschleunigen
CREATE INDEX idx_cpro_datum ON cpro_steuerrechner.single_item_cpro(datum);
CREATE INDEX idx_user_last_login ON user_management.users(last_login_at);
```

### Anwendung

```properties
# Node.js
NODE_OPTIONS="--max-old-space-size=2048"

# DB-Connection-Pooling
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=20"
```

## Troubleshooting

### Häufige Probleme

1. **DB-Verbindungsfehler**: `DATABASE_URL` & Netzwerk prüfen
2. **Berechtigungsfehler**: Dateisystem-Rechte & User-Kontext prüfen
3. **Port-Konflikte**: Port 3000 freimachen
4. **SSL-Zertifikatsprobleme**: Pfade & Gültigkeit prüfen

### Log-Orte

* **App-Logs**: `docker logs <container_id>` oder PM2-Logs
* **DB-Logs**: PostgreSQL-Logverzeichnis
* **Webserver-Logs**: Nginx/IIS-Logverzeichnisse

---

*Für detailliertes Troubleshooting siehe [Runbooks](./runbooks/troubleshooting.md).*
