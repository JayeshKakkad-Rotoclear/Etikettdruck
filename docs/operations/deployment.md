# Production Deployment Guide

Comprehensive guide for deploying the Etikettdrucker system to production.

## Deployment Architecture

The system is designed for deployment on **Windows Server** infrastructure with Docker support (from `Dockerfile` and `docs/architecture/05-deployment-architecture.md`).

### Deployment Options
1. **Docker Deployment** (Recommended)
2. **Direct Node.js Deployment**
3. **Windows Service Deployment**

## Docker Deployment (Recommended)

### Prerequisites
- Docker Engine 20.x+
- PostgreSQL 14+ (separate instance or Docker)
- Windows Server 2019+ or Docker-compatible host

### Build & Deploy
```bash
# 1. Clone repository
git clone <repository-url>
cd etikettendruck

# 2. Build Docker image
docker build -t etikettdrucker:latest .

# 3. Run with Docker Compose
docker-compose up -d
```

### Docker Configuration

#### Dockerfile Analysis (multi-stage build)
```dockerfile
# Builder stage - Node.js 20 bookworm-slim
FROM node:20-bookworm-slim AS builder
# - Installs OS dependencies (openssl, ca-certificates)
# - Copies package files and prisma schema
# - Runs npm ci for production dependencies
# - Generates Prisma client
# - Builds SvelteKit application

# Runtime stage - Node.js 20 bookworm-slim  
FROM node:20-bookworm-slim AS runner
# - Minimal runtime environment
# - Copies built application from builder
# - Exposes port 3000
# - Runs with node user for security
```

#### Docker Compose Configuration
```yaml
# From docker-compose.yml
services:
  app:
    build: .
    ports:
      - "4000:3000"    # External:Internal
    env_file: .env
    restart: unless-stopped
```

### Environment Configuration
Create production `.env` file:
```properties
# Database
DATABASE_URL="postgresql://username:password@db-host:5432/etikettdrucker?sslmode=require"

# Security
JWT_SECRET="secure-random-256-bit-string"
SESSION_DURATION="7d"
COOKIE_SECURE=true

# Application
NODE_ENV=production
PORT=3000
```

## Direct Node.js Deployment

### Prerequisites
- Node.js 20.x (from `package.json` engines)
- PostgreSQL 14+ database
- Process manager (PM2 recommended)

### Deployment Steps
```bash
# 1. Install dependencies
npm ci --production

# 2. Generate Prisma client
npx prisma generate

# 3. Setup database
npm run db:setup

# 4. Build application
npm run build

# 5. Start production server
npm start
```

### Process Management with PM2
```bash
# Install PM2 globally
npm install -g pm2

# Create PM2 ecosystem file
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

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Database Setup

### PostgreSQL Configuration
```sql
-- Create database and user
CREATE DATABASE etikettdrucker;
CREATE USER etikettdrucker_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE etikettdrucker TO etikettdrucker_user;

-- Enable required extensions (if needed)
\c etikettdrucker;
-- Add any required PostgreSQL extensions
```

### Schema Initialization
```bash
# Apply schema
npx prisma db push

# Seed initial data
npm run db:seed

# Create admin user
npm run create-admin
```

## Reverse Proxy Configuration

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    # SSL Configuration
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    
    # Proxy to application
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
    
    # Static file caching
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### IIS Configuration (Windows Server)
```xml
<!-- web.config for IIS with URL Rewrite -->
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

## SSL/TLS Configuration

### Certificate Setup
```bash
# Using Let's Encrypt (Linux/Docker)
certbot certonly --webroot -w /var/www/html -d your-domain.com

# Using Windows Certificate Store
# Import certificate through IIS Manager or PowerShell
```

### Environment Variables for SSL
```properties
# Force HTTPS cookies
COOKIE_SECURE=true

# Trust proxy headers
TRUST_PROXY=true
```

## Health Checks

### Application Health Endpoint
> TODO: Add health check endpoint to application

### Docker Health Check
```dockerfile
# Add to Dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
```

### Monitoring Script
```bash
#!/bin/bash
# health-check.sh
curl -f http://localhost:3000/api/auth/me > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "Application health check failed"
    # Add notification logic here
    exit 1
fi
echo "Application is healthy"
```

## Backup & Recovery

### Database Backup
```bash
#!/bin/bash
# backup-db.sh
BACKUP_DIR="/backups/etikettdrucker"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Full database backup
pg_dump $DATABASE_URL > "$BACKUP_DIR/backup_$DATE.sql"

# Compress backup
gzip "$BACKUP_DIR/backup_$DATE.sql"

# Retention (keep 30 days)
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

### Application Backup
```bash
#!/bin/bash
# backup-app.sh
BACKUP_DIR="/backups/etikettdrucker"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup configuration
cp .env "$BACKUP_DIR/env_$DATE"

# Backup uploaded files (if any)
tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" uploads/
```

## Rollback Procedures

### Docker Rollback
```bash
# Tag current version before deployment
docker tag etikettdrucker:latest etikettdrucker:backup

# Deploy new version
docker build -t etikettdrucker:latest .
docker-compose up -d

# Rollback if needed
docker tag etikettdrucker:backup etikettdrucker:latest
docker-compose up -d
```

### Database Rollback
```bash
# Restore from backup
gunzip -c backup_20250904_100000.sql.gz | psql $DATABASE_URL
```

## Security Considerations

### Environment Security
- Store secrets in secure environment variables
- Use strong JWT secrets (256-bit minimum)
- Enable HTTPS in production
- Configure firewall rules

### Application Security
- Regular security updates
- Monitor security audit logs
- Implement rate limiting
- Use secure session management

### Network Security
- Database access restricted to application server
- VPN access for administration
- Regular security audits

## Performance Optimization

### Database Optimization
```sql
-- Add indexes for common queries
CREATE INDEX idx_cpro_datum ON cpro_steuerrechner.single_item_cpro(datum);
CREATE INDEX idx_user_last_login ON user_management.users(last_login_at);
```

### Application Tuning
```properties
# Node.js optimization
NODE_OPTIONS="--max-old-space-size=2048"

# Database connection pooling
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=20"
```

## Troubleshooting

### Common Issues
1. **Database connection errors**: Check DATABASE_URL and network connectivity
2. **Permission errors**: Verify file permissions and user context
3. **Port conflicts**: Ensure port 3000 is available
4. **SSL certificate issues**: Verify certificate paths and validity

### Log Locations
- **Application logs**: `docker logs <container_id>` or PM2 logs
- **Database logs**: PostgreSQL log directory
- **Web server logs**: Nginx/IIS log directories

---
*For detailed troubleshooting, see [Runbooks](./runbooks/troubleshooting.md)*
