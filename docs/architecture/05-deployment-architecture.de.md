# Teil 5: Deployment-Architektur & DevOps-Strategie

---

## 19. Überblick über die Deployment-Architektur

### 19.1 Bereitstellungsstrategie

#### Zielumgebung: Windows Server

Das Etikettdrucker-System ist für die Bereitstellung auf **Windows-Server**-Infrastruktur ausgelegt, um sich in bestehende Rotoclear-Systeme und die Etikettendrucker-Hardware zu integrieren. Das System hat den Status **v1.0.0-beta** erreicht – mit erweiterten Dashboard-Funktionen und verbesserten Qualitätskontroll-Workflows.&#x20;

#### Bereitstellungsmodelle

##### Single-Server-Deployment (Phase 1)

```
┌─────────────────────────────────────┐
│         Windows Server 2019+        │
├─────────────────────────────────────┤
│  IIS / Node.js Application Server   │
│  ├─ SvelteKit Application           │
│  ├─ Static File Serving             │
│  └─ API Endpoints                   │ 
├─────────────────────────────────────┤
│       PostgreSQL Database           │
│  ├─ Application Database            │
│  ├─ Session Storage                 │
│  └─ File Upload Storage             │
├─────────────────────────────────────┤
│      Network Infrastructure         │
│  ├─ Local Network Access            │
│  ├─ Printer Network Integration     │
│  └─ File Share Access               │
└─────────────────────────────────────┘
```

##### Multi-Server-Deployment (Phase 2)

```
                Load Balancer
                     │
    ┌────────────────┼────────────────┐
    │                │                │
App Server 1    App Server 2    App Server 3
    │                │                │
    └────────────────┼────────────────┘
                     │
              Database Server
         (PostgreSQL with Replication)
                     │
              Shared File Storage
              (Windows File Server)
```

### 19.2 Infrastruktur-Anforderungen

#### Hardware-Spezifikationen

##### Produktionsserver (Einzelinstanz)

```yaml
Mindestanforderungen:
  CPU: 4 Kerne @ 2.4 GHz
  RAM: 8 GB
  Storage: 100 GB SSD
  Network: 1 Gbps Ethernet

Empfehlung:
  CPU: 8 Kerne @ 3.2 GHz
  RAM: 16 GB
  Storage: 250 GB NVMe SSD
  Network: 1 Gbps Ethernet
  Backup: 500 GB Netzwerkspeicher
```

##### Datenbank-Anforderungen

```yaml
PostgreSQL 14+:
  RAM: 4 GB dediziert
  Storage: 50 GB initial, 10 GB/Jahr Wachstum
  Connection Pool: 20 gleichzeitige Verbindungen
  Backup: Tägliche automatische Backups
```

#### Netzwerkanforderungen

```yaml
Netzwerkkonnektivität:
  - LAN-Zugriff für Anwender-Workstations
  - Drucker-Netzwerkanbindung (TCP/IP)
  - Dateiserver-Zugriff für Dokumentenspeicher
  - Internetzugang für Updates (optional)

Sicherheit:
  - Windows-Firewall-Konfiguration
  - HTTPS-Zertifikat (interne CA oder self-signed)
  - Netzwerksegmentierung für Druckerzugriffe
```

---

## 20. Build- & Deployment-Pipeline

### 20.1 Build-Konfiguration

#### Build-Skripte in `package.json`

```json
{
  "name": "etikettdrucker",
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "build:production": "npm run build && npm run optimize",
    "optimize": "npm run compress && npm run minify",
    "preview": "vite preview",
    "test": "npm run test:unit && npm run test:integration",
    "test:unit": "vitest run",
    "test:integration": "playwright test",
    "lint": "eslint src --ext .ts,.svelte",
    "format": "prettier --write src",
    "migrate": "prisma migrate deploy",
    "migrate:dev": "prisma migrate dev",
    "seed": "prisma db seed",
    "generate": "prisma generate",
    "deploy:staging": "npm run build && npm run deploy:copy:staging",
    "deploy:production": "npm run build:production && npm run deploy:copy:production"
  }
}
```

#### Vite-Produktionskonfiguration

```typescript
// vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  
  build: {
    target: 'node18',
    outDir: 'build',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['svelte', '@sveltejs/kit'],
          database: ['@prisma/client'],
          auth: ['jsonwebtoken', 'bcrypt'],
          icons: ['lucide-svelte']
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  
  server: {
    port: 3000,
    host: '0.0.0.0'
  },
  
  preview: {
    port: 3000,
    host: '0.0.0.0'
  }
});
```

### 20.2 Windows-Server-Deployment

#### IIS-Konfiguration

```xml
<!-- web.config für IIS-Deployment -->
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="iisnode" path="index.js" verb="*" modules="iisnode" />
    </handlers>
    
    <rewrite>
      <rules>
        <!-- HTTP auf HTTPS umleiten -->
        <rule name="Redirect to HTTPS" stopProcessing="true">
          <match url=".*" />
          <conditions>
            <add input="{HTTPS}" pattern="off" ignoreCase="true" />
          </conditions>
          <action type="Redirect" url="https://{HTTP_HOST}/{R:0}" 
                  redirectType="Permanent" />
        </rule>
        
        <!-- SvelteKit-Routing behandeln -->
        <rule name="SvelteKit">
          <match url=".*" />
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="index.js" />
        </rule>
      </rules>
    </rewrite>
    
    <iisnode
      nodeProcessCountPerApplication="1"
      maxConcurrentRequestsPerProcess="1024"
      maxNamedPipeConnectionRetry="3"
      namedPipeConnectionRetryDelay="2000"
      maxNamedPipeConnectionPoolSize="512"
      maxNamedPipePooledConnectionAge="30000"
      asyncCompletionThreadCount="0"
      initialRequestBufferSize="4096"
      maxRequestBufferSize="65536"
      uncFileChangesPollingInterval="5000"
      gracefulShutdownTimeout="60000"
      loggingEnabled="true"
      logDirectory="logs"
    />
    
    <security>
      <requestFiltering removeServerHeader="true">
        <requestLimits maxAllowedContentLength="10485760" /> <!-- 10MB -->
      </requestFiltering>
    </security>
    
    <httpProtocol>
      <customHeaders>
        <add name="X-Frame-Options" value="DENY" />
        <add name="X-Content-Type-Options" value="nosniff" />
        <add name="X-XSS-Protection" value="1; mode=block" />
        <add name="Strict-Transport-Security" value="max-age=31536000; includeSubDomains" />
      </customHeaders>
    </httpProtocol>
  </system.webServer>
</configuration>
```

#### PowerShell-Deployment-Skript

```powershell
# deploy.ps1 - Automatisiertes Deployment-Skript
param(
    [Parameter(Mandatory=$true)]
    [string]$Environment,
    
    [Parameter(Mandatory=$true)]
    [string]$Version,
    
    [string]$IISPath = "C:\inetpub\wwwroot\etikettdrucker",
    [string]$BackupPath = "C:\backups\etikettdrucker"
)

# Konfiguration
$AppPoolName = "EtikettdruckerAppPool"
$SiteName = "Etikettdrucker"
$BuildPath = ".\build"

Write-Host "Starte Deployment von Etikettdrucker v$Version nach $Environment"

try {
    # 1. Application Pool stoppen
    Write-Host "Stoppe Application Pool: $AppPoolName"
    Stop-WebAppPool -Name $AppPoolName
    
    # 2. Backup des aktuellen Deployments
    if (Test-Path $IISPath) {
        $BackupName = "backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
        $FullBackupPath = Join-Path $BackupPath $BackupName
        
        Write-Host "Erstelle Backup: $FullBackupPath"
        New-Item -ItemType Directory -Path $FullBackupPath -Force
        Copy-Item -Path "$IISPath\*" -Destination $FullBackupPath -Recurse
    }
    
    # 3. Neues Build deployen
    Write-Host "Deploye neues Build von: $BuildPath"
    if (Test-Path $IISPath) {
        Remove-Item -Path "$IISPath\*" -Recurse -Force
    } else {
        New-Item -ItemType Directory -Path $IISPath -Force
    }
    
    Copy-Item -Path "$BuildPath\*" -Destination $IISPath -Recurse
    
    # 4. Dependencies installieren/aktualisieren
    Write-Host "Installiere Node.js-Dependencies"
    Set-Location $IISPath
    npm install --production
    
    # 5. Datenbankmigrationen ausführen
    Write-Host "Führe Datenbankmigrationen aus"
    npx prisma migrate deploy
    
    # 6. Dateirechte setzen
    Write-Host "Setze Dateiberechtigungen"
    $acl = Get-Acl $IISPath
    $accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule(
        "IIS_IUSRS", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow"
    )
    $acl.SetAccessRule($accessRule)
    Set-Acl -Path $IISPath -AclObject $acl
    
    # 7. Konfigurationsdateien aktualisieren
    Write-Host "Aktualisiere Konfiguration für $Environment"
    Update-ConfigFiles -Environment $Environment -Path $IISPath
    
    # 8. Application Pool starten
    Write-Host "Starte Application Pool: $AppPoolName"
    Start-WebAppPool -Name $AppPoolName
    
    # 9. Deployment verifizieren
    Write-Host "Verifiziere Deployment..."
    $healthCheck = Test-ApplicationHealth
    
    if ($healthCheck) {
        Write-Host "Deployment erfolgreich!" -ForegroundColor Green
        
        # Alte Backups bereinigen (nur letzte 10 behalten)
        Get-ChildItem $BackupPath | Sort-Object CreationTime -Descending | 
            Select-Object -Skip 10 | Remove-Item -Recurse -Force
    } else {
        throw "Health Check nach Deployment fehlgeschlagen"
    }
    
} catch {
    Write-Error "Deployment fehlgeschlagen: $($_.Exception.Message)"
    
    # Rollback, falls Backup vorhanden
    if ($FullBackupPath -and (Test-Path $FullBackupPath)) {
        Write-Host "Rollback auf vorherige Version..."
        Copy-Item -Path "$FullBackupPath\*" -Destination $IISPath -Recurse -Force
        Start-WebAppPool -Name $AppPoolName
    }
    
    exit 1
}

function Update-ConfigFiles {
    param($Environment, $Path)
    
    $envFile = Join-Path $Path ".env.production"
    
    switch ($Environment) {
        "staging" {
            @"
NODE_ENV=production
DATABASE_URL=postgresql://etikettdrucker:password@localhost:5432/etikettdrucker_staging
SESSION_SECRET=staging_secret_key_change_this
ENCRYPTION_KEY=staging_encryption_key_change_this
LOG_LEVEL=debug
"@ | Set-Content $envFile
        }
        "production" {
            @"
NODE_ENV=production
DATABASE_URL=postgresql://etikettdrucker:password@localhost:5432/etikettdrucker_production
SESSION_SECRET=production_secret_key_change_this
ENCRYPTION_KEY=production_encryption_key_change_this
LOG_LEVEL=info
"@ | Set-Content $envFile
        }
    }
}

function Test-ApplicationHealth {
    $maxRetries = 5
    $retryCount = 0
    
    do {
        try {
            $response = Invoke-WebRequest -Uri "https://localhost/api/health" -UseBasicParsing
            if ($response.StatusCode -eq 200) {
                return $true
            }
        } catch {
            Write-Host "Health-Check-Versuch $($retryCount + 1) fehlgeschlagen, neuer Versuch..."
            Start-Sleep -Seconds 10
        }
        $retryCount++
    } while ($retryCount -lt $maxRetries)
    
    return $false
}
```

### 20.3 Datenbank-Deployment

#### Migrationsstrategie

```typescript
// src/scripts/migrate.ts
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

async function runMigrations() {
  console.log('Starting database migration...');
  
  try {
    // 1. Datenbankverbindung prüfen
    await prisma.$connect();
    console.log('Database connection established');
    
    // 2. Prisma-Migrationen ausführen
    console.log('Running Prisma migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    
    // 3. Prisma-Client generieren
    console.log('Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // 4. Seed-Daten bei Bedarf
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      console.log('Seeding initial data...');
      execSync('npx prisma db seed', { stdio: 'inherit' });
    }
    
    console.log('Database migration completed successfully');
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runMigrations();
```

#### Backup-Strategie

```powershell
# backup-database.ps1
param(
    [string]$DatabaseName = "etikettdrucker_production",
    [string]$BackupPath = "C:\backups\database",
    [int]$RetentionDays = 30
)

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = Join-Path $BackupPath "$DatabaseName_$timestamp.sql"

try {
    # Backup-Verzeichnis anlegen, falls nicht vorhanden
    if (!(Test-Path $BackupPath)) {
        New-Item -ItemType Directory -Path $BackupPath -Force
    }
    
    # Datenbank-Backup erstellen
    Write-Host "Erstelle Backup: $backupFile"
    & pg_dump -h localhost -U postgres -d $DatabaseName -f $backupFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Backup erfolgreich erstellt: $backupFile"
        
        # Backup komprimieren
        $compressedFile = "$backupFile.gz"
        & gzip $backupFile
        Write-Host "Backup komprimiert: $compressedFile"
        
        # Alte Backups bereinigen
        $cutoffDate = (Get-Date).AddDays(-$RetentionDays)
        Get-ChildItem $BackupPath -Filter "*.sql.gz" | 
            Where-Object { $_.CreationTime -lt $cutoffDate } | 
            Remove-Item -Force
        
        Write-Host "Alte Backups bereinigt (älter als $RetentionDays Tage)"
    } else {
        throw "pg_dump failed with exit code $LASTEXITCODE"
    }
    
} catch {
    Write-Error "Backup fehlgeschlagen: $($_.Exception.Message)"
    exit 1
}
```

---

## 21. Monitoring & Wartung

### 21.1 Anwendungsmonitoring

#### Health-Check-Endpunkt

```typescript
// src/routes/api/health/+server.ts
import { json } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    checks: {
      database: { status: 'unknown', latency: 0 },
      filesystem: { status: 'unknown', freeSpace: 0 },
      memory: { status: 'unknown', usage: 0 }
    }
  };
  
  try {
    // Datenbank-Health-Check
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    checks.checks.database = {
      status: 'healthy',
      latency: Date.now() - dbStart
    };
    
    // Filesystem-Health-Check
    const stats = await import('fs').then(fs => fs.promises.stat('.'));
    checks.checks.filesystem = {
      status: 'healthy',
      freeSpace: await getFreeSpace()
    };
    
    // Speicher-Health-Check
    const memUsage = process.memoryUsage();
    checks.checks.memory = {
      status: memUsage.heapUsed < 500 * 1024 * 1024 ? 'healthy' : 'warning',
      usage: Math.round(memUsage.heapUsed / 1024 / 1024)
    };
    
  } catch (error) {
    checks.status = 'unhealthy';
    checks.checks.database.status = 'error';
  }
  
  const httpStatus = checks.status === 'healthy' ? 200 : 503;
  return json(checks, { status: httpStatus });
}

async function getFreeSpace(): Promise<number> {
  try {
    const { execSync } = await import('child_process');
    const output = execSync('dir C:\\ /-c', { encoding: 'utf8' });
    // Freien Speicher aus der dir-Ausgabe parsen
    return 0; // Für das Beispiel vereinfacht
  } catch {
    return 0;
  }
}
```

#### Performance-Monitoring

```typescript
// src/lib/monitoring/PerformanceMonitor.ts
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, MetricData[]> = new Map();
  
  static getInstance(): PerformanceMonitor {
    if (!this.instance) {
      this.instance = new PerformanceMonitor();
    }
    return this.instance;
  }
  
  recordMetric(name: string, value: number, tags?: Record<string, string>) {
    const metric: MetricData = {
      timestamp: Date.now(),
      value,
      tags: tags || {}
    };
    
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const metrics = this.metrics.get(name)!;
    metrics.push(metric);
    
    // Nur die letzten 1000 Metriken pro Typ behalten
    if (metrics.length > 1000) {
      metrics.shift();
    }
  }
  
  getMetrics(name: string, timeRange?: { start: number; end: number }): MetricData[] {
    const metrics = this.metrics.get(name) || [];
    
    if (!timeRange) {
      return metrics;
    }
    
    return metrics.filter(m => 
      m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
    );
  }
  
  getAverageResponseTime(route: string): number {
    const metrics = this.getMetrics('response_time')
      .filter(m => m.tags.route === route);
    
    if (metrics.length === 0) return 0;
    
    const sum = metrics.reduce((acc, m) => acc + m.value, 0);
    return sum / metrics.length;
  }
}

interface MetricData {
  timestamp: number;
  value: number;
  tags: Record<string, string>;
}

// Middleware zur Messung der Antwortzeiten
export const performanceMiddleware = async (
  event: RequestEvent, 
  resolve: (event: RequestEvent) => Response | Promise<Response>
) => {
  const start = Date.now();
  const response = await resolve(event);
  const duration = Date.now() - start;
  
  const monitor = PerformanceMonitor.getInstance();
  monitor.recordMetric('response_time', duration, {
    route: event.url.pathname,
    method: event.request.method,
    status: response.status.toString()
  });
  
  // Langsame Requests protokollieren
  if (duration > 1000) {
    console.warn(`Slow request detected: ${event.request.method} ${event.url.pathname} took ${duration}ms`);
  }
  
  return response;
};
```

### 21.2 Logging-Strategie

#### Strukturiertes Logging

```typescript
// src/lib/logging/Logger.ts
import winston from 'winston';

export class Logger {
  private static instance: winston.Logger;
  
  static getInstance(): winston.Logger {
    if (!this.instance) {
      this.instance = winston.createLogger({
        level: process.env.LOG_LEVEL || 'info',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.json()
        ),
        defaultMeta: {
          service: 'etikettdrucker',
          version: process.env.APP_VERSION || '1.0.0'
        },
        transports: [
          // Konsole (Entwicklung)
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.colorize(),
              winston.format.simple()
            )
          }),
          
          // Datei (Produktion)
          new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5
          }),
          
          new winston.transports.File({
            filename: 'logs/combined.log',
            maxsize: 10485760, // 10MB
            maxFiles: 10
          })
        ]
      });
    }
    
    return this.instance;
  }
  
  static info(message: string, meta?: any) {
    this.getInstance().info(message, meta);
  }
  
  static error(message: string, error?: Error, meta?: any) {
    this.getInstance().error(message, { error: error?.stack, ...meta });
  }
  
  static warn(message: string, meta?: any) {
    this.getInstance().warn(message, meta);
  }
  
  static debug(message: string, meta?: any) {
    this.getInstance().debug(message, meta);
  }
}

// Einsatz in der Anwendung
export const auditLogger = {
  logUserAction: (userId: number, action: string, resource: string, meta?: any) => {
    Logger.info('User action', {
      userId,
      action,
      resource,
      timestamp: new Date().toISOString(),
      ...meta
    });
  },
  
  logSecurityEvent: (event: string, severity: 'low' | 'medium' | 'high', meta?: any) => {
    const logLevel = severity === 'high' ? 'error' : 'warn';
    Logger[logLevel](`Security event: ${event}`, {
      severity,
      timestamp: new Date().toISOString(),
      ...meta
    });
  }
};
```

### 21.3 Wartungs-Prozeduren

#### Automatisiertes Wartungsskript

```powershell
# maintenance.ps1 - Tägliche Wartungsaufgaben
param(
    [string]$LogPath = "C:\logs\etikettdrucker",
    [string]$BackupPath = "C:\backups\etikettdrucker",
    [int]$LogRetentionDays = 30,
    [int]$BackupRetentionDays = 90
)

Write-Host "Starte tägliche Wartungsaufgaben..."

try {
    # 1. Alte Logdateien bereinigen
    Write-Host "Bereinige alte Logdateien..."
    $logCutoff = (Get-Date).AddDays(-$LogRetentionDays)
    Get-ChildItem $LogPath -Recurse -File | 
        Where-Object { $_.CreationTime -lt $logCutoff } | 
        Remove-Item -Force
    
    # 2. Alte Backups bereinigen
    Write-Host "Bereinige alte Backups..."
    $backupCutoff = (Get-Date).AddDays(-$BackupRetentionDays)
    Get-ChildItem $BackupPath -Recurse -File | 
        Where-Object { $_.CreationTime -lt $backupCutoff } | 
        Remove-Item -Force
    
    # 3. Datenbank-Wartung
    Write-Host "Führe Datenbank-Wartung aus..."
    & psql -h localhost -U postgres -d etikettdrucker_production -c "VACUUM ANALYZE;"
    
    # 4. Speicherplatz prüfen
    Write-Host "Prüfe Speicherplatz..."
    $disk = Get-WmiObject -Class Win32_LogicalDisk -Filter "DeviceID='C:'"
    $freeSpaceGB = [math]::Round($disk.FreeSpace / 1GB, 2)
    $totalSpaceGB = [math]::Round($disk.Size / 1GB, 2)
    $freeSpacePercent = [math]::Round(($disk.FreeSpace / $disk.Size) * 100, 2)
    
    Write-Host "Laufwerk C: - Frei: $freeSpaceGB GB / Gesamt: $totalSpaceGB GB ($freeSpacePercent%)"
    
    if ($freeSpacePercent -lt 10) {
        Write-Warning "Warnung: Weniger als 10% freier Speicher"
        # Alarm (E-Mail/Benachrichtigung) senden
    }
    
    # 5. Health-Check der Anwendung
    Write-Host "Prüfe Health der Anwendung..."
    $healthResponse = Invoke-WebRequest -Uri "https://localhost/api/health" -UseBasicParsing
    
    if ($healthResponse.StatusCode -eq 200) {
        Write-Host "Health-Check erfolgreich"
    } else {
        Write-Error "Health-Check fehlgeschlagen"
        # Anwendung neu starten, falls nötig
        Restart-WebAppPool -Name "EtikettdruckerAppPool"
    }
    
    Write-Host "Tägliche Wartung erfolgreich abgeschlossen"
    
} catch {
    Write-Error "Wartung fehlgeschlagen: $($_.Exception.Message)"
    exit 1
}
```

#### Update-Prozedur

```powershell
# update.ps1 - Update-Prozess der Anwendung
param(
    [Parameter(Mandatory=$true)]
    [string]$UpdatePackagePath,
    
    [string]$ApplicationPath = "C:\inetpub\wwwroot\etikettdrucker",
    [string]$BackupPath = "C:\backups\etikettdrucker"
)

Write-Host "Starte Update-Prozess..."

try {
    # 1. Update-Paket validieren
    if (!(Test-Path $UpdatePackagePath)) {
        throw "Update-Paket nicht gefunden: $UpdatePackagePath"
    }
    
    # 2. Backup anlegen
    $backupName = "pre_update_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    $fullBackupPath = Join-Path $BackupPath $backupName
    
    Write-Host "Erstelle Backup: $fullBackupPath"
    Copy-Item -Path $ApplicationPath -Destination $fullBackupPath -Recurse
    
    # 3. Anwendung stoppen
    Write-Host "Stoppe Anwendung..."
    Stop-WebAppPool -Name "EtikettdruckerAppPool"
    
    # 4. Update entpacken
    Write-Host "Entpacke Update-Paket..."
    Expand-Archive -Path $UpdatePackagePath -DestinationPath $ApplicationPath -Force
    
    # 5. Datenbankmigrationen ausführen
    Write-Host "Führe Datenbankmigrationen aus..."
    Set-Location $ApplicationPath
    npm run migrate
    
    # 6. Anwendung starten
    Write-Host "Starte Anwendung..."
    Start-WebAppPool -Name "EtikettdruckerAppPool"
    
    # 7. Update verifizieren
    Start-Sleep -Seconds 30
    $healthCheck = Invoke-WebRequest -Uri "https://localhost/api/health" -UseBasicParsing
    
    if ($healthCheck.StatusCode -eq 200) {
        Write-Host "Update erfolgreich abgeschlossen!" -ForegroundColor Green
    } else {
        throw "Health-Check nach Update fehlgeschlagen"
    }
    
} catch {
    Write-Error "Update fehlgeschlagen: $($_.Exception.Message)"
    
    # Rollback
    Write-Host "Rollback auf vorherige Version..."
    Stop-WebAppPool -Name "EtikettdruckerAppPool"
    Remove-Item -Path "$ApplicationPath\*" -Recurse -Force
    Copy-Item -Path "$fullBackupPath\*" -Destination $ApplicationPath -Recurse
    Start-WebAppPool -Name "EtikettdruckerAppPool"
    
    exit 1
}
```

---
