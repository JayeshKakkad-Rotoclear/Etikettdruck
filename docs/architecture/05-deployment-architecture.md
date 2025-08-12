# Part 5: Deployment Architecture & DevOps Strategy

---

## 19. Deployment Architecture Overview

### 19.1 Deployment Strategy

#### Target Environment: Windows Server
The Etikettdrucker system is designed for deployment on Windows Server infrastructure to integrate with existing Rotoclear systems and label printer hardware.

#### Deployment Models

##### Single-Server Deployment (Phase 1)
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

##### Multi-Server Deployment (Phase 2)
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

### 19.2 Infrastructure Requirements

#### Hardware Specifications

##### Production Server (Single Instance)
```yaml
Minimum Requirements:
  CPU: 4 cores @ 2.4 GHz
  RAM: 8 GB
  Storage: 100 GB SSD
  Network: 1 Gbps Ethernet

Recommended Requirements:
  CPU: 8 cores @ 3.2 GHz
  RAM: 16 GB
  Storage: 250 GB NVMe SSD
  Network: 1 Gbps Ethernet
  Backup: 500 GB Network Storage
```

##### Database Requirements
```yaml
PostgreSQL 14+:
  RAM: 4 GB dedicated
  Storage: 50 GB initial, 10 GB/year growth
  Connection Pool: 20 concurrent connections
  Backup: Daily automated backups
```

#### Network Requirements
```yaml
Network Connectivity:
  - Local LAN access for user workstations
  - Printer network connectivity (TCP/IP)
  - File server access for document storage
  - Internet access for updates (optional)

Security:
  - Windows Firewall configuration
  - HTTPS certificate (internal CA or self-signed)
  - Network segmentation for printer access
```

---

## 20. Build & Deployment Pipeline

### 20.1 Build Configuration

#### Package.json Build Scripts
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

#### Vite Production Configuration
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

### 20.2 Windows Server Deployment

#### IIS Configuration
```xml
<!-- web.config for IIS deployment -->
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="iisnode" path="index.js" verb="*" modules="iisnode" />
    </handlers>
    
    <rewrite>
      <rules>
        <!-- Redirect HTTP to HTTPS -->
        <rule name="Redirect to HTTPS" stopProcessing="true">
          <match url=".*" />
          <conditions>
            <add input="{HTTPS}" pattern="off" ignoreCase="true" />
          </conditions>
          <action type="Redirect" url="https://{HTTP_HOST}/{R:0}" 
                  redirectType="Permanent" />
        </rule>
        
        <!-- Handle SvelteKit routing -->
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

#### PowerShell Deployment Script
```powershell
# deploy.ps1 - Automated deployment script
param(
    [Parameter(Mandatory=$true)]
    [string]$Environment,
    
    [Parameter(Mandatory=$true)]
    [string]$Version,
    
    [string]$IISPath = "C:\inetpub\wwwroot\etikettdrucker",
    [string]$BackupPath = "C:\backups\etikettdrucker"
)

# Configuration
$AppPoolName = "EtikettdruckerAppPool"
$SiteName = "Etikettdrucker"
$BuildPath = ".\build"

Write-Host "Starting deployment of Etikettdrucker v$Version to $Environment"

try {
    # 1. Stop IIS Application Pool
    Write-Host "Stopping application pool: $AppPoolName"
    Stop-WebAppPool -Name $AppPoolName
    
    # 2. Create backup of current deployment
    if (Test-Path $IISPath) {
        $BackupName = "backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
        $FullBackupPath = Join-Path $BackupPath $BackupName
        
        Write-Host "Creating backup: $FullBackupPath"
        New-Item -ItemType Directory -Path $FullBackupPath -Force
        Copy-Item -Path "$IISPath\*" -Destination $FullBackupPath -Recurse
    }
    
    # 3. Deploy new build
    Write-Host "Deploying new build from: $BuildPath"
    if (Test-Path $IISPath) {
        Remove-Item -Path "$IISPath\*" -Recurse -Force
    } else {
        New-Item -ItemType Directory -Path $IISPath -Force
    }
    
    Copy-Item -Path "$BuildPath\*" -Destination $IISPath -Recurse
    
    # 4. Install/Update dependencies
    Write-Host "Installing Node.js dependencies"
    Set-Location $IISPath
    npm install --production
    
    # 5. Run database migrations
    Write-Host "Running database migrations"
    npx prisma migrate deploy
    
    # 6. Set file permissions
    Write-Host "Setting file permissions"
    $acl = Get-Acl $IISPath
    $accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule(
        "IIS_IUSRS", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow"
    )
    $acl.SetAccessRule($accessRule)
    Set-Acl -Path $IISPath -AclObject $acl
    
    # 7. Update configuration files
    Write-Host "Updating configuration for $Environment"
    Update-ConfigFiles -Environment $Environment -Path $IISPath
    
    # 8. Start application pool
    Write-Host "Starting application pool: $AppPoolName"
    Start-WebAppPool -Name $AppPoolName
    
    # 9. Verify deployment
    Write-Host "Verifying deployment..."
    $healthCheck = Test-ApplicationHealth
    
    if ($healthCheck) {
        Write-Host "Deployment successful!" -ForegroundColor Green
        
        # Clean up old backups (keep last 10)
        Get-ChildItem $BackupPath | Sort-Object CreationTime -Descending | 
            Select-Object -Skip 10 | Remove-Item -Recurse -Force
    } else {
        throw "Health check failed after deployment"
    }
    
} catch {
    Write-Error "Deployment failed: $($_.Exception.Message)"
    
    # Rollback if backup exists
    if ($FullBackupPath -and (Test-Path $FullBackupPath)) {
        Write-Host "Rolling back to previous version..."
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
            Write-Host "Health check attempt $($retryCount + 1) failed, retrying..."
            Start-Sleep -Seconds 10
        }
        $retryCount++
    } while ($retryCount -lt $maxRetries)
    
    return $false
}
```

### 20.3 Database Deployment

#### Migration Strategy
```typescript
// src/scripts/migrate.ts
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

async function runMigrations() {
  console.log('Starting database migration...');
  
  try {
    // 1. Check database connection
    await prisma.$connect();
    console.log('Database connection established');
    
    // 2. Run Prisma migrations
    console.log('Running Prisma migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    
    // 3. Generate Prisma client
    console.log('Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // 4. Seed data if needed
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

#### Backup Strategy
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
    # Create backup directory if it doesn't exist
    if (!(Test-Path $BackupPath)) {
        New-Item -ItemType Directory -Path $BackupPath -Force
    }
    
    # Create database backup
    Write-Host "Creating backup: $backupFile"
    & pg_dump -h localhost -U postgres -d $DatabaseName -f $backupFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Backup created successfully: $backupFile"
        
        # Compress backup
        $compressedFile = "$backupFile.gz"
        & gzip $backupFile
        Write-Host "Backup compressed: $compressedFile"
        
        # Clean up old backups
        $cutoffDate = (Get-Date).AddDays(-$RetentionDays)
        Get-ChildItem $BackupPath -Filter "*.sql.gz" | 
            Where-Object { $_.CreationTime -lt $cutoffDate } | 
            Remove-Item -Force
        
        Write-Host "Old backups cleaned up (older than $RetentionDays days)"
    } else {
        throw "pg_dump failed with exit code $LASTEXITCODE"
    }
    
} catch {
    Write-Error "Backup failed: $($_.Exception.Message)"
    exit 1
}
```

---

## 21. Monitoring & Maintenance

### 21.1 Application Monitoring

#### Health Check Endpoint
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
    // Database health check
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    checks.checks.database = {
      status: 'healthy',
      latency: Date.now() - dbStart
    };
    
    // Filesystem health check
    const stats = await import('fs').then(fs => fs.promises.stat('.'));
    checks.checks.filesystem = {
      status: 'healthy',
      freeSpace: await getFreeSpace()
    };
    
    // Memory health check
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
    // Parse free space from dir output
    return 0; // Simplified for example
  } catch {
    return 0;
  }
}
```

#### Performance Monitoring
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
    
    // Keep only last 1000 metrics per type
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

// Middleware to track response times
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
  
  // Log slow requests
  if (duration > 1000) {
    console.warn(`Slow request detected: ${event.request.method} ${event.url.pathname} took ${duration}ms`);
  }
  
  return response;
};
```

### 21.2 Logging Strategy

#### Structured Logging
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
          // Console output for development
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.colorize(),
              winston.format.simple()
            )
          }),
          
          // File output for production
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

// Usage throughout the application
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

### 21.3 Maintenance Procedures

#### Automated Maintenance Script
```powershell
# maintenance.ps1 - Daily maintenance tasks
param(
    [string]$LogPath = "C:\logs\etikettdrucker",
    [string]$BackupPath = "C:\backups\etikettdrucker",
    [int]$LogRetentionDays = 30,
    [int]$BackupRetentionDays = 90
)

Write-Host "Starting daily maintenance tasks..."

try {
    # 1. Clean up old log files
    Write-Host "Cleaning up old log files..."
    $logCutoff = (Get-Date).AddDays(-$LogRetentionDays)
    Get-ChildItem $LogPath -Recurse -File | 
        Where-Object { $_.CreationTime -lt $logCutoff } | 
        Remove-Item -Force
    
    # 2. Clean up old backups
    Write-Host "Cleaning up old backup files..."
    $backupCutoff = (Get-Date).AddDays(-$BackupRetentionDays)
    Get-ChildItem $BackupPath -Recurse -File | 
        Where-Object { $_.CreationTime -lt $backupCutoff } | 
        Remove-Item -Force
    
    # 3. Database maintenance
    Write-Host "Running database maintenance..."
    & psql -h localhost -U postgres -d etikettdrucker_production -c "VACUUM ANALYZE;"
    
    # 4. Check disk space
    Write-Host "Checking disk space..."
    $disk = Get-WmiObject -Class Win32_LogicalDisk -Filter "DeviceID='C:'"
    $freeSpaceGB = [math]::Round($disk.FreeSpace / 1GB, 2)
    $totalSpaceGB = [math]::Round($disk.Size / 1GB, 2)
    $freeSpacePercent = [math]::Round(($disk.FreeSpace / $disk.Size) * 100, 2)
    
    Write-Host "Disk C: - Free: $freeSpaceGB GB / Total: $totalSpaceGB GB ($freeSpacePercent%)"
    
    if ($freeSpacePercent -lt 10) {
        Write-Warning "Low disk space warning: Only $freeSpacePercent% free space remaining"
        # Send alert email or notification
    }
    
    # 5. Check application health
    Write-Host "Checking application health..."
    $healthResponse = Invoke-WebRequest -Uri "https://localhost/api/health" -UseBasicParsing
    
    if ($healthResponse.StatusCode -eq 200) {
        Write-Host "Application health check passed"
    } else {
        Write-Error "Application health check failed"
        # Restart application if needed
        Restart-WebAppPool -Name "EtikettdruckerAppPool"
    }
    
    Write-Host "Daily maintenance completed successfully"
    
} catch {
    Write-Error "Maintenance failed: $($_.Exception.Message)"
    exit 1
}
```

#### Update Procedure
```powershell
# update.ps1 - Application update procedure
param(
    [Parameter(Mandatory=$true)]
    [string]$UpdatePackagePath,
    
    [string]$ApplicationPath = "C:\inetpub\wwwroot\etikettdrucker",
    [string]$BackupPath = "C:\backups\etikettdrucker"
)

Write-Host "Starting application update process..."

try {
    # 1. Validate update package
    if (!(Test-Path $UpdatePackagePath)) {
        throw "Update package not found: $UpdatePackagePath"
    }
    
    # 2. Create backup
    $backupName = "pre_update_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    $fullBackupPath = Join-Path $BackupPath $backupName
    
    Write-Host "Creating backup: $fullBackupPath"
    Copy-Item -Path $ApplicationPath -Destination $fullBackupPath -Recurse
    
    # 3. Stop application
    Write-Host "Stopping application..."
    Stop-WebAppPool -Name "EtikettdruckerAppPool"
    
    # 4. Extract update
    Write-Host "Extracting update package..."
    Expand-Archive -Path $UpdatePackagePath -DestinationPath $ApplicationPath -Force
    
    # 5. Run database migrations
    Write-Host "Running database migrations..."
    Set-Location $ApplicationPath
    npm run migrate
    
    # 6. Start application
    Write-Host "Starting application..."
    Start-WebAppPool -Name "EtikettdruckerAppPool"
    
    # 7. Verify update
    Start-Sleep -Seconds 30
    $healthCheck = Invoke-WebRequest -Uri "https://localhost/api/health" -UseBasicParsing
    
    if ($healthCheck.StatusCode -eq 200) {
        Write-Host "Update completed successfully!" -ForegroundColor Green
    } else {
        throw "Health check failed after update"
    }
    
} catch {
    Write-Error "Update failed: $($_.Exception.Message)"
    
    # Rollback
    Write-Host "Rolling back to previous version..."
    Stop-WebAppPool -Name "EtikettdruckerAppPool"
    Remove-Item -Path "$ApplicationPath\*" -Recurse -Force
    Copy-Item -Path "$fullBackupPath\*" -Destination $ApplicationPath -Recurse
    Start-WebAppPool -Name "EtikettdruckerAppPool"
    
    exit 1
}
```

---

