# Teil 4: Sicherheitsarchitektur & Implementierung

---

## 14. Überblick über die Sicherheitsarchitektur

### 14.1 Sicherheitsprinzipien im Design

#### Defense in Depth (Tiefenverteidigung)

Mehrere Sicherheitsebenen schützen gegen unterschiedliche Angriffsvektoren:

* **Applikationsebene**: Erweiterte Eingabevalidierung, Authentifizierung, Autorisierung
* **Netzwerkebene**: HTTPS-Verschlüsselung, Netzwerksegmentierung
* **Datenebene**: Verschlüsselung „at rest“, abgesicherte DB-Verbindungen
* **Infrastrukturebene**: Server-Härtung, Zugriffskontrollen

#### Least Privilege (Prinzip der geringsten Rechte)

Benutzer und Prozesse erhalten nur den minimal notwendigen Zugriff:

* **Rollenbasierte Zugriffskontrolle (RBAC)**: Granulare Berechtigungen pro Rolle
* **API-Endpunktschutz**: Autorisierung auf Routenebene
* **Datenbankzugriff**: Limitierte Connection-Pools mit eingeschränkten Rechten
* **Dashboard-Analytik**: Rollenbasierter Zugriff auf sensible Produktionsdaten

#### Security by Design

Sicherheitsaspekte sind von Beginn an integriert:

* **Sichere Defaults**: Neue Features benötigen explizite Berechtigungen
* **Erweiterte Eingabevalidierung**: Umfassende Bereinigung und Validierung mit Zod-Schemata
* **Fehlerbehandlung**: Sichere Fehlermeldungen ohne Leaken sensibler Infos
* **Formularvalidierung**: Fortgeschrittene Änderungsdetektion und Datenintegritäts-Checks

### 14.2 Bedrohungsmodell

#### Identifizierte Bedrohungen

1. **Unautorisierter Zugriff**: Angreifer versuchen, ins System zu gelangen
2. **Datenmanipulation**: Veränderung von Qualitätskontrolldatensätzen
3. **Informationsabfluss**: Offenlegung sensibler Produktdaten
4. **Rechteausweitung**: Benutzer überschreiten ihre Berechtigungen
5. **Session Hijacking**: Diebstahl von Authentifizierungstoken
6. **SQL-Injection**: DB-Angriffe über Eingabefelder
7. **Cross-Site Scripting (XSS)**: Clientseitige Code-Injection

#### Risikobewertungsmatrix

```
Hohes Risiko:
- Datenmanipulation bei Qualitätsaufzeichnungen
- Unautorisierter Zugriff auf Admin-Funktionen
- Offenlegung von Produktspezifikationen

Mittleres Risiko:
- Session Hijacking
- Informationsweitergabe an Unberechtigte
- Versuche der Rechteausweitung

Niedriges Risiko:
- Geringfügige Datenlecks
- Zugriff auf nicht-kritische Funktionen
```

---

## 15. Authentifizierungsarchitektur

### 15.1 Authentifizierungsstrategie

#### Sitzungsbasierte Authentifizierung

Verwendung sicherer **HTTP-only** Cookies für das Sitzungsmanagement:

```typescript
// src/lib/auth/SessionManager.ts
export class SessionManager {
  private readonly sessionSecret = process.env.SESSION_SECRET!;
  private readonly sessionDuration = 8 * 60 * 60 * 1000; // 8 Stunden
  
  async createSession(user: User): Promise<string> {
    const sessionData = {
      userId: user.id,
      username: user.username,
      role: user.role,
      createdAt: Date.now(),
      expiresAt: Date.now() + this.sessionDuration
    };
    
    const sessionToken = this.signJWT(sessionData);
    await this.storeSession(sessionToken, sessionData);
    
    return sessionToken;
  }
  
  async validateSession(token: string): Promise<SessionData | null> {
    try {
      const decoded = this.verifyJWT(token);
      const stored = await this.getStoredSession(token);
      
      if (!stored || stored.expiresAt < Date.now()) {
        await this.invalidateSession(token);
        return null;
      }
      
      return stored;
    } catch {
      return null;
    }
  }
  
  private signJWT(data: any): string {
    return jwt.sign(data, this.sessionSecret, {
      algorithm: 'HS256',
      expiresIn: '8h'
    });
  }
  
  private verifyJWT(token: string): any {
    return jwt.verify(token, this.sessionSecret);
  }
}
```

#### Passwortsicherheit

```typescript
// src/lib/auth/PasswordService.ts
export class PasswordService {
  private readonly saltRounds = 12;
  private readonly minPasswordLength = 8;
  
  async hashPassword(plaintext: string): Promise<string> {
    this.validatePasswordStrength(plaintext);
    return bcrypt.hash(plaintext, this.saltRounds);
  }
  
  async verifyPassword(plaintext: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plaintext, hash);
  }
  
  private validatePasswordStrength(password: string): void {
    if (password.length < this.minPasswordLength) {
      throw new ValidationError('Passwort muss mindestens 8 Zeichen lang sein');
    }
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const criteriaMet = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar]
      .filter(Boolean).length;
    
    if (criteriaMet < 3) {
      throw new ValidationError(
        'Passwort muss mind. 3 der Kategorien enthalten: Großbuchstaben, Kleinbuchstaben, Ziffern, Sonderzeichen'
      );
    }
  }
  
  generateSecurePassword(): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*';
    
    const allChars = uppercase + lowercase + numbers + special;
    let password = '';
    
    // Mindestens je ein Zeichen aus jeder Kategorie
    password += this.getRandomChar(uppercase);
    password += this.getRandomChar(lowercase);
    password += this.getRandomChar(numbers);
    password += this.getRandomChar(special);
    
    // Restliche Länge zufällig auffüllen
    for (let i = 4; i < 12; i++) {
      password += this.getRandomChar(allChars);
    }
    
    // Passwort mischen
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
  
  private getRandomChar(chars: string): string {
    return chars.charAt(Math.floor(Math.random() * chars.length));
  }
}
```

### 15.2 Cookie-Sicherheitskonfiguration

```typescript
// src/lib/auth/CookieConfig.ts
export const cookieConfig = {
  name: 'etikettdrucker_session',
  httpOnly: true,           // XSS: Kein Zugriff per JS
  secure: true,             // Nur über HTTPS senden
  sameSite: 'strict',       // CSRF-Schutz
  maxAge: 8 * 60 * 60,      // 8 Stunden
  path: '/',
  domain: process.env.COOKIE_DOMAIN
};

// Verwendung in SvelteKit
export async function POST({ request, cookies }: RequestEvent) {
  const { username, password } = await request.json();
  
  const user = await authenticateUser(username, password);
  if (!user) {
    return json({ success: false, error: 'Ungültige Zugangsdaten' }, { status: 401 });
  }
  
  const sessionToken = await sessionManager.createSession(user);
  
  cookies.set(cookieConfig.name, sessionToken, {
    ...cookieConfig,
    secure: process.env.NODE_ENV === 'production'
  });
  
  return json({ success: true, user: sanitizeUser(user) });
}
```

---

## 16. Autorisierungsarchitektur

### 16.1 Rollenbasierte Zugriffskontrolle (RBAC)

#### Design des Berechtigungssystems

```typescript
// src/lib/auth/Permissions.ts
export enum Permission {
  // Benutzerverwaltung
  USER_CREATE = 'user:create',
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  USER_RESET_PASSWORD = 'user:reset_password',
  
  // Produkt-Tests
  TESTING_PRUEFER_A_READ = 'testing:pruefer_a:read',
  TESTING_PRUEFER_A_WRITE = 'testing:pruefer_a:write',
  TESTING_PRUEFER_B_READ = 'testing:pruefer_b:read',
  TESTING_PRUEFER_B_WRITE = 'testing:pruefer_b:write',
  
  // Label-Management
  LABEL_PRINT = 'label:print',
  LABEL_REPRINT = 'label:reprint',
  
  // Outer Karton
  OUTER_KARTON_CREATE = 'outer_karton:create',
  OUTER_KARTON_READ = 'outer_karton:read',
  
  // Systemadministration
  SYSTEM_ADMIN = 'system:admin',
  AUDIT_READ = 'audit:read'
}

export const rolePermissions: Record<UserRole, Permission[]> = {
  ADMIN: [
    // Vollzugriff
    Permission.USER_CREATE,
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,
    Permission.USER_RESET_PASSWORD,
    Permission.TESTING_PRUEFER_A_READ,
    Permission.TESTING_PRUEFER_A_WRITE,
    Permission.TESTING_PRUEFER_B_READ,
    Permission.TESTING_PRUEFER_B_WRITE,
    Permission.LABEL_PRINT,
    Permission.LABEL_REPRINT,
    Permission.OUTER_KARTON_CREATE,
    Permission.OUTER_KARTON_READ,
    Permission.SYSTEM_ADMIN,
    Permission.AUDIT_READ
  ],
  
  MANAGEMENT: [
    Permission.USER_READ,
    Permission.TESTING_PRUEFER_A_READ,
    Permission.TESTING_PRUEFER_B_READ,
    Permission.OUTER_KARTON_READ,
    Permission.AUDIT_READ
  ],
  
  PRUEFER_AB: [
    Permission.TESTING_PRUEFER_A_READ,
    Permission.TESTING_PRUEFER_A_WRITE,
    Permission.TESTING_PRUEFER_B_READ,
    Permission.TESTING_PRUEFER_B_WRITE,
    Permission.LABEL_PRINT,
    Permission.OUTER_KARTON_CREATE,
    Permission.OUTER_KARTON_READ
  ],
  
  PRUEFER_A: [
    Permission.TESTING_PRUEFER_A_READ,
    Permission.TESTING_PRUEFER_A_WRITE,
    Permission.OUTER_KARTON_READ
  ],
  
  PRUEFER_B: [
    Permission.TESTING_PRUEFER_A_READ,
    Permission.TESTING_PRUEFER_B_READ,
    Permission.TESTING_PRUEFER_B_WRITE,
    Permission.LABEL_PRINT,
    Permission.OUTER_KARTON_CREATE,
    Permission.OUTER_KARTON_READ
  ],
  
  VIEWER: [
    Permission.TESTING_PRUEFER_A_READ,
    Permission.TESTING_PRUEFER_B_READ,
    Permission.OUTER_KARTON_READ
  ]
};
```

#### Autorisierungs-Middleware

```typescript
// src/lib/auth/AuthorizationMiddleware.ts
export class AuthorizationMiddleware {
  static requirePermission(permission: Permission) {
    return async (event: RequestEvent) => {
      const user = await this.getCurrentUser(event);
      
      if (!user) {
        throw new AuthenticationError('Authentifizierung erforderlich');
      }
      
      if (!this.hasPermission(user, permission)) {
        throw new AuthorizationError(`Zugriff verweigert: ${permission}`);
      }
      
      return user;
    };
  }
  
  static requireRole(role: UserRole) {
    return async (event: RequestEvent) => {
      const user = await this.getCurrentUser(event);
      
      if (!user) {
        throw new AuthenticationError('Authentifizierung erforderlich');
      }
      
      if (user.role !== role && !this.isHigherRole(user.role, role)) {
        throw new AuthorizationError(`Erforderliche Rolle: ${role}`);
      }
      
      return user;
    };
  }
  
  private static hasPermission(user: User, permission: Permission): boolean {
    const userPermissions = rolePermissions[user.role];
    return userPermissions.includes(permission) || 
           userPermissions.includes(Permission.SYSTEM_ADMIN);
  }
  
  private static isHigherRole(userRole: UserRole, requiredRole: UserRole): boolean {
    const roleHierarchy = {
      ADMIN: 6,
      MANAGEMENT: 5,
      PRUEFER_AB: 4,
      PRUEFER_B: 3,
      PRUEFER_A: 2,
      VIEWER: 1
    };
    
    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  }
}

// Verwendung in API-Routen
export async function POST(event: RequestEvent) {
  const user = await AuthorizationMiddleware.requirePermission(
    Permission.USER_CREATE
  )(event);
  
  // Erstellung der Benutzerlogik ...
}
```

### 16.2 Routen-Schutz

#### Seitenbasierte Route Guards

```svelte
<!-- src/lib/components/RouteGuard.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth';
  import type { UserRole, Permission } from '$lib/auth/types';
  
  export let requiredRole: UserRole | undefined = undefined;
  export let requiredPermission: Permission | undefined = undefined;
  export let redirectTo = '/login';
  
  let isAuthorized = false;
  let isLoading = true;
  
  onMount(() => {
    const unsubscribe = authStore.subscribe(({ user, isLoading: loading }) => {
      isLoading = loading;
      
      if (loading) return;
      
      if (!user) {
        goto(redirectTo);
        return;
      }
      
      if (requiredRole && !hasRole(user, requiredRole)) {
        goto('/unauthorized');
        return;
      }
      
      if (requiredPermission && !hasPermission(user, requiredPermission)) {
        goto('/unauthorized');
        return;
      }
      
      isAuthorized = true;
    });
    
    return unsubscribe;
  });
  
  function hasRole(user: User, role: UserRole): boolean {
    // Implementierung der Rollenprüfung
    return checkUserRole(user, role);
  }
  
  function hasPermission(user: User, permission: Permission): boolean {
    // Implementierung der Berechtigungsprüfung
    return checkUserPermission(user, permission);
  }
</script>

{#if isLoading}
  <div class="loading">Lade...</div>
{:else if isAuthorized}
  <slot />
{:else}
  <div class="unauthorized">
    <h1>Zugriff verweigert</h1>
    <p>Du hast keine Berechtigung für diese Seite.</p>
  </div>
{/if}
```

#### API-Routen-Schutz

```typescript
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  // User-Kontext zu allen Requests hinzufügen
  const sessionToken = event.cookies.get('etikettdrucker_session');
  
  if (sessionToken) {
    const sessionData = await sessionManager.validateSession(sessionToken);
    if (sessionData) {
      const user = await getUserById(sessionData.userId);
      event.locals.user = user;
    }
  }
  
  // API-Routen schützen
  if (event.url.pathname.startsWith('/api/')) {
    const protection = getRouteProtection(event.url.pathname);
    
    if (protection) {
      if (!event.locals.user) {
        return new Response(
          JSON.stringify({ success: false, error: 'Authentifizierung erforderlich' }),
          { status: 401, headers: { 'content-type': 'application/json' } }
        );
      }
      
      if (!hasRequiredPermission(event.locals.user, protection)) {
        return new Response(
          JSON.stringify({ success: false, error: 'Zugriff verweigert' }),
          { status: 403, headers: { 'content-type': 'application/json' } }
        );
      }
    }
  }
  
  return resolve(event);
};

function getRouteProtection(pathname: string): Permission | null {
  const routeProtections: Record<string, Permission> = {
    '/api/users': Permission.USER_READ,
    '/api/admin/users': Permission.USER_CREATE,
    '/api/admin/delete-user': Permission.USER_DELETE,
    '/api/admin/reset-password': Permission.USER_RESET_PASSWORD,
    // Weitere Routen ergänzen
  };
  
  return routeProtections[pathname] || null;
}
```

---

## 17. Eingabevalidierung & -Bereinigung

### 17.1 Validierungsarchitektur

#### Zentraler Validierungsservice

```typescript
// src/lib/validation/ValidationService.ts
import { z } from 'zod';

export class ValidationService {
  // Validierungsschemata für Benutzer
  static readonly createUserSchema = z.object({
    username: z.string()
      .min(3, 'Benutzername muss mindestens 3 Zeichen haben')
      .max(50, 'Benutzername darf max. 50 Zeichen haben')
      .regex(/^[a-zA-Z0-9_]+$/, 'Benutzername darf nur Buchstaben, Ziffern und Unterstriche enthalten'),
    
    email: z.string()
      .email('Ungültiges E-Mail-Format')
      .max(255, 'E-Mail darf max. 255 Zeichen haben'),
    
    password: z.string()
      .min(8, 'Passwort muss mindestens 8 Zeichen haben')
      .max(128, 'Passwort darf max. 128 Zeichen haben'),
    
    firstName: z.string()
      .min(1, 'Vorname ist erforderlich')
      .max(100, 'Vorname darf max. 100 Zeichen haben')
      .regex(/^[a-zA-ZäöüÄÖÜß\s-]+$/, 'Vorname enthält ungültige Zeichen'),
    
    lastName: z.string()
      .min(1, 'Nachname ist erforderlich')
      .max(100, 'Nachname darf max. 100 Zeichen haben')
      .regex(/^[a-zA-ZäöüÄÖÜß\s-]+$/, 'Nachname enthält ungültige Zeichen'),
    
    role: z.enum(['ADMIN', 'MANAGEMENT', 'PRUEFER_AB', 'PRUEFER_A', 'PRUEFER_B', 'VIEWER'])
  });
  
  // Validierungsschemata für Produktprüfungen
  static readonly prueferASchema = z.object({
    serialnummer: z.string()
      .min(1, 'Seriennummer ist erforderlich')
      .max(100, 'Seriennummer darf max. 100 Zeichen haben')
      .regex(/^[A-Z0-9]+$/, 'Seriennummer darf nur Großbuchstaben und Ziffern enthalten'),
    
    datum: z.string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Datum muss im Format JJJJ-MM-TT sein'),
    
    jahr: z.string()
      .regex(/^\d{4}$/, 'Jahr muss 4-stellig sein'),
    
    pruefer: z.string()
      .min(1, 'Name des Prüfers ist erforderlich')
      .max(100, 'Name des Prüfers darf max. 100 Zeichen haben')
  });
  
  static validateInput<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T> {
    try {
      const validated = schema.parse(data);
      return { success: true, data: validated };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string[]> = {};
        
        error.issues.forEach((issue) => {
          const path = issue.path.join('.');
          if (!fieldErrors[path]) fieldErrors[path] = [];
          fieldErrors[path].push(issue.message);
        });
        
        return { success: false, errors: fieldErrors };
      }
      return { success: false, errors: { general: ['Validierung fehlgeschlagen'] } };
    }
  }
}

interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string[]>;
}
```

#### Schutz vor SQL-Injection

```typescript
// Immer parametrisierte Queries über Prisma verwenden
export class SafeDatabaseService {
  async findUserByUsername(username: string): Promise<User | null> {
    // Prisma parametrisiert automatisch
    return this.prisma.user.findUnique({
      where: { username }
    });
  }
  
  async searchProducts(searchTerm: string): Promise<Product[]> {
    // Auch hier kümmert sich Prisma um Parametrisierung
    return this.prisma.product.findMany({
      where: {
        OR: [
          { serialNumber: { contains: searchTerm, mode: 'insensitive' } },
          { articleDescription: { contains: searchTerm, mode: 'insensitive' } }
        ]
      }
    });
  }
  
  // Falls Raw SQL nötig ist, strikt parametriert arbeiten
  async customQuery(serialNumber: string): Promise<any[]> {
    return this.prisma.$queryRaw`
      SELECT * FROM products 
      WHERE serial_number = ${serialNumber}
      AND status = 'ACTIVE'
    `;
  }
}
```

### 17.2 XSS-Prävention

#### Output-Bereinigung

```typescript
// src/lib/security/Sanitization.ts
import DOMPurify from 'dompurify';

export class SanitizationService {
  static sanitizeHtml(html: string): string {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
      ALLOWED_ATTR: []
    });
  }
  
  static escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  static sanitizeForUrl(input: string): string {
    return encodeURIComponent(input);
  }
  
  static sanitizeFilename(filename: string): string {
    return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  }
}
```

#### Content Security Policy

```html
<!-- src/app.html – CSP-Header -->
<script>
  // Content Security Policy Konfiguration
  const cspPolicy = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'", // Eingeschränkte Inline-Skripte
    "style-src 'self' 'unsafe-inline'",  // Komponentenstile erlauben
    "img-src 'self' data:",               // data:-URLs z. B. für SVG-Icons
    "font-src 'self'",
    "connect-src 'self'",                 // API-Calls zur gleichen Origin
    "frame-ancestors 'none'",             // Schutz vor Clickjacking
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');
  
  document.addEventListener('DOMContentLoaded', () => {
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = cspPolicy;
    document.head.appendChild(meta);
  });
</script>
```

---

## 18. Datenschutz & Privatsphäre

### 18.1 Datenverschlüsselung

#### Datenbank-Verschlüsselung

```typescript
// src/lib/security/EncryptionService.ts
import crypto from 'crypto';

export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly tagLength = 16;
  private readonly key: Buffer;
  
  constructor() {
    const keyString = process.env.ENCRYPTION_KEY;
    if (!keyString) {
      throw new Error('ENCRYPTION_KEY Umgebungsvariable ist erforderlich');
    }
    this.key = Buffer.from(keyString, 'hex');
  }
  
  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipher(this.algorithm, this.key, iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    // iv + tag + Ciphertext kombinieren
    return iv.toString('hex') + tag.toString('hex') + encrypted;
  }
  
  decrypt(encryptedData: string): string {
    const ivHex = encryptedData.slice(0, this.ivLength * 2);
    const tagHex = encryptedData.slice(this.ivLength * 2, (this.ivLength + this.tagLength) * 2);
    const encrypted = encryptedData.slice((this.ivLength + this.tagLength) * 2);
    
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    
    const decipher = crypto.createDecipher(this.algorithm, this.key, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}

// Verwendung für sensible Daten
export class SecureUserService {
  private encryption = new EncryptionService();
  
  async createUser(userData: CreateUserData): Promise<User> {
    return this.prisma.user.create({
      data: {
        ...userData,
        // Sensible personenbezogene Daten verschlüsseln
        email: this.encryption.encrypt(userData.email),
        firstName: this.encryption.encrypt(userData.firstName),
        lastName: this.encryption.encrypt(userData.lastName),
        passwordHash: await this.hashPassword(userData.password)
      }
    });
  }
  
  async findUser(id: number): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    
    if (user) {
      // Vor Rückgabe entschlüsseln
      return {
        ...user,
        email: this.encryption.decrypt(user.email),
        firstName: this.encryption.decrypt(user.firstName),
        lastName: this.encryption.decrypt(user.lastName)
      };
    }
    
    return null;
  }
}
```

### 18.2 Audit-Logging

#### Umfassender Audit-Trail

```typescript
// src/lib/security/AuditService.ts
export class AuditService {
  constructor(private prisma: PrismaClient) {}
  
  async logUserAction(action: AuditAction): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        userId: action.userId,
        action: action.type,
        resource: action.resource,
        resourceId: action.resourceId,
        details: action.details,
        ipAddress: action.ipAddress,
        userAgent: action.userAgent,
        timestamp: new Date()
      }
    });
  }
  
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    await this.prisma.securityLog.create({
      data: {
        eventType: event.type,
        severity: event.severity,
        description: event.description,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        userId: event.userId,
        timestamp: new Date()
      }
    });
    
    // Bei hoher Schwere Alarm auslösen
    if (event.severity === 'HIGH') {
      await this.sendSecurityAlert(event);
    }
  }
  
  private async sendSecurityAlert(event: SecurityEvent): Promise<void> {
    // Implementierung für Security-Alerts
    // E-Mail, SMS oder Integration ins Monitoring
  }
}

// Verwendung in Middleware
export const auditMiddleware = async (event: RequestEvent, next: () => Promise<Response>) => {
  const startTime = Date.now();
  const response = await next();
  const duration = Date.now() - startTime;
  
  // API-Zugriff protokollieren
  await auditService.logUserAction({
    userId: event.locals.user?.id,
    type: 'API_ACCESS',
    resource: event.url.pathname,
    details: {
      method: event.request.method,
      statusCode: response.status,
      duration,
      timestamp: new Date().toISOString()
    },
    ipAddress: getClientIP(event.request),
    userAgent: event.request.headers.get('user-agent')
  });
  
  return response;
};
```

---
