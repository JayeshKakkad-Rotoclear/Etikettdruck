# Part 4: Security Architecture & Implementation

---

## 14. Security Architecture Overview

### 14.1 Security Design Principles

#### Defense in Depth
Multiple layers of security controls to protect against various threat vectors:
- **Application Layer**: Enhanced input validation, authentication, authorization
- **Network Layer**: HTTPS encryption, network segmentation
- **Data Layer**: Encryption at rest, secure database connections
- **Infrastructure Layer**: Server hardening, access controls

#### Principle of Least Privilege
Users and processes have only the minimum access required:
- **Role-Based Access Control (RBAC)**: Granular permissions per user role
- **API Endpoint Protection**: Route-level authorization checks
- **Database Access**: Limited connection pools with restricted permissions
- **Dashboard Analytics**: Role-based access to sensitive production data

#### Security by Design
Security considerations integrated from the beginning:
- **Secure Defaults**: All new features require explicit permission grants
- **Enhanced Input Validation**: Comprehensive sanitization and validation with Zod schemas
- **Error Handling**: Secure error messages that don't leak sensitive information
- **Form Validation**: Advanced change detection and data integrity checks

### 14.2 Threat Model

#### Identified Threats
1. **Unauthorized Access**: Malicious actors attempting system access
2. **Data Tampering**: Modification of quality control records
3. **Information Disclosure**: Exposure of sensitive product data
4. **Privilege Escalation**: Users attempting to exceed authorized permissions
5. **Session Hijacking**: Theft of authentication tokens
6. **SQL Injection**: Database attacks through input vectors
7. **Cross-Site Scripting (XSS)**: Client-side code injection

#### Risk Assessment Matrix
```
High Risk:
- Data tampering of quality records
- Unauthorized access to admin functions
- Exposure of product specifications

Medium Risk:
- Session hijacking
- Information disclosure to unauthorized users
- Privilege escalation attempts

Low Risk:
- Minor data leakage
- Non-critical function access
```

---

## 15. Authentication Architecture

### 15.1 Authentication Strategy

#### Session-Based Authentication
Using secure HTTP-only cookies for session management:

```typescript
// src/lib/auth/SessionManager.ts
export class SessionManager {
  private readonly sessionSecret = process.env.SESSION_SECRET!;
  private readonly sessionDuration = 8 * 60 * 60 * 1000; // 8 hours
  
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
    } catch (error) {
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

#### Password Security
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
      throw new ValidationError('Password must be at least 8 characters long');
    }
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const criteriaMet = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar]
      .filter(Boolean).length;
    
    if (criteriaMet < 3) {
      throw new ValidationError(
        'Password must contain at least 3 of: uppercase, lowercase, numbers, special characters'
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
    
    // Ensure at least one character from each category
    password += this.getRandomChar(uppercase);
    password += this.getRandomChar(lowercase);
    password += this.getRandomChar(numbers);
    password += this.getRandomChar(special);
    
    // Fill remaining length with random characters
    for (let i = 4; i < 12; i++) {
      password += this.getRandomChar(allChars);
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
  
  private getRandomChar(chars: string): string {
    return chars.charAt(Math.floor(Math.random() * chars.length));
  }
}
```

### 15.2 Cookie Security Configuration

```typescript
// src/lib/auth/CookieConfig.ts
export const cookieConfig = {
  name: 'etikettdrucker_session',
  httpOnly: true,           // Prevent XSS access
  secure: true,             // HTTPS only
  sameSite: 'strict',       // CSRF protection
  maxAge: 8 * 60 * 60,      // 8 hours
  path: '/',
  domain: process.env.COOKIE_DOMAIN
};

// Usage in SvelteKit
export async function POST({ request, cookies }: RequestEvent) {
  const { username, password } = await request.json();
  
  const user = await authenticateUser(username, password);
  if (!user) {
    return json({ success: false, error: 'Invalid credentials' }, { status: 401 });
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

## 16. Authorization Architecture

### 16.1 Role-Based Access Control (RBAC)

#### Permission System Design
```typescript
// src/lib/auth/Permissions.ts
export enum Permission {
  // User Management
  USER_CREATE = 'user:create',
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  USER_RESET_PASSWORD = 'user:reset_password',
  
  // Product Testing
  TESTING_PRUEFER_A_READ = 'testing:pruefer_a:read',
  TESTING_PRUEFER_A_WRITE = 'testing:pruefer_a:write',
  TESTING_PRUEFER_B_READ = 'testing:pruefer_b:read',
  TESTING_PRUEFER_B_WRITE = 'testing:pruefer_b:write',
  
  // Label Management
  LABEL_PRINT = 'label:print',
  LABEL_REPRINT = 'label:reprint',
  
  // Outer Karton
  OUTER_KARTON_CREATE = 'outer_karton:create',
  OUTER_KARTON_READ = 'outer_karton:read',
  
  // System Administration
  SYSTEM_ADMIN = 'system:admin',
  AUDIT_READ = 'audit:read'
}

export const rolePermissions: Record<UserRole, Permission[]> = {
  ADMIN: [
    // Full system access
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

#### Authorization Middleware
```typescript
// src/lib/auth/AuthorizationMiddleware.ts
export class AuthorizationMiddleware {
  static requirePermission(permission: Permission) {
    return async (event: RequestEvent) => {
      const user = await this.getCurrentUser(event);
      
      if (!user) {
        throw new AuthenticationError('Authentication required');
      }
      
      if (!this.hasPermission(user, permission)) {
        throw new AuthorizationError(`Permission denied: ${permission}`);
      }
      
      return user;
    };
  }
  
  static requireRole(role: UserRole) {
    return async (event: RequestEvent) => {
      const user = await this.getCurrentUser(event);
      
      if (!user) {
        throw new AuthenticationError('Authentication required');
      }
      
      if (user.role !== role && !this.isHigherRole(user.role, role)) {
        throw new AuthorizationError(`Role required: ${role}`);
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

// Usage in API routes
export async function POST({ request }: RequestEvent) {
  const user = await AuthorizationMiddleware.requirePermission(
    Permission.USER_CREATE
  )(event);
  
  // Proceed with user creation logic
}
```

### 16.2 Route Protection

#### Page-Level Route Guards
```typescript
// src/lib/components/RouteGuard.svelte
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
    // Implementation of role checking logic
    return checkUserRole(user, role);
  }
  
  function hasPermission(user: User, permission: Permission): boolean {
    // Implementation of permission checking logic
    return checkUserPermission(user, permission);
  }
</script>

{#if isLoading}
  <div class="loading">Loading...</div>
{:else if isAuthorized}
  <slot />
{:else}
  <div class="unauthorized">
    <h1>Access Denied</h1>
    <p>You don't have permission to access this page.</p>
  </div>
{/if}
```

#### API Route Protection
```typescript
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  // Add user context to all requests
  const sessionToken = event.cookies.get('etikettdrucker_session');
  
  if (sessionToken) {
    const sessionData = await sessionManager.validateSession(sessionToken);
    if (sessionData) {
      const user = await getUserById(sessionData.userId);
      event.locals.user = user;
    }
  }
  
  // Check API route protection
  if (event.url.pathname.startsWith('/api/')) {
    const protection = getRouteProtection(event.url.pathname);
    
    if (protection) {
      if (!event.locals.user) {
        return new Response(
          JSON.stringify({ success: false, error: 'Authentication required' }),
          { status: 401, headers: { 'content-type': 'application/json' } }
        );
      }
      
      if (!hasRequiredPermission(event.locals.user, protection)) {
        return new Response(
          JSON.stringify({ success: false, error: 'Permission denied' }),
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
    // Add more route protections as needed
  };
  
  return routeProtections[pathname] || null;
}
```

---

## 17. Input Validation & Sanitization

### 17.1 Validation Architecture

#### Centralized Validation Service
```typescript
// src/lib/validation/ValidationService.ts
import { z } from 'zod';

export class ValidationService {
  // User validation schemas
  static readonly createUserSchema = z.object({
    username: z.string()
      .min(3, 'Username must be at least 3 characters')
      .max(50, 'Username must not exceed 50 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    
    email: z.string()
      .email('Invalid email format')
      .max(255, 'Email must not exceed 255 characters'),
    
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must not exceed 128 characters'),
    
    firstName: z.string()
      .min(1, 'First name is required')
      .max(100, 'First name must not exceed 100 characters')
      .regex(/^[a-zA-ZäöüÄÖÜß\s-]+$/, 'First name contains invalid characters'),
    
    lastName: z.string()
      .min(1, 'Last name is required')
      .max(100, 'Last name must not exceed 100 characters')
      .regex(/^[a-zA-ZäöüÄÖÜß\s-]+$/, 'Last name contains invalid characters'),
    
    role: z.enum(['ADMIN', 'MANAGEMENT', 'PRUEFER_AB', 'PRUEFER_A', 'PRUEFER_B', 'VIEWER'])
  });
  
  // Product testing validation schemas
  static readonly prueferASchema = z.object({
    serialnummer: z.string()
      .min(1, 'Serial number is required')
      .max(100, 'Serial number must not exceed 100 characters')
      .regex(/^[A-Z0-9]+$/, 'Serial number must contain only uppercase letters and numbers'),
    
    datum: z.string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    
    jahr: z.string()
      .regex(/^\d{4}$/, 'Year must be 4 digits'),
    
    pruefer: z.string()
      .min(1, 'Prüfer name is required')
      .max(100, 'Prüfer name must not exceed 100 characters')
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
          if (!fieldErrors[path]) {
            fieldErrors[path] = [];
          }
          fieldErrors[path].push(issue.message);
        });
        
        return {
          success: false,
          errors: fieldErrors
        };
      }
      
      return {
        success: false,
        errors: { general: ['Validation failed'] }
      };
    }
  }
}

interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string[]>;
}
```

#### SQL Injection Prevention
```typescript
// Always use parameterized queries through Prisma
export class SafeDatabaseService {
  async findUserByUsername(username: string): Promise<User | null> {
    // Prisma automatically parameterizes queries
    return this.prisma.user.findUnique({
      where: { username } // Safe - automatically parameterized
    });
  }
  
  async searchProducts(searchTerm: string): Promise<Product[]> {
    // Even with user input, Prisma handles parameterization
    return this.prisma.product.findMany({
      where: {
        OR: [
          { serialNumber: { contains: searchTerm, mode: 'insensitive' } },
          { articleDescription: { contains: searchTerm, mode: 'insensitive' } }
        ]
      }
    });
  }
  
  // If raw SQL is absolutely necessary, use parameterized queries
  async customQuery(serialNumber: string): Promise<any[]> {
    return this.prisma.$queryRaw`
      SELECT * FROM products 
      WHERE serial_number = ${serialNumber}
      AND status = 'ACTIVE'
    `;
  }
}
```

### 17.2 XSS Prevention

#### Output Sanitization
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
```typescript
// src/app.html - CSP Headers
<script>
  // Content Security Policy configuration
  const cspPolicy = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'", // Limited inline scripts
    "style-src 'self' 'unsafe-inline'",   // Allow component styles
    "img-src 'self' data:",               // Allow data URLs for SVG icons
    "font-src 'self'",
    "connect-src 'self'",                 // API calls to same origin
    "frame-ancestors 'none'",             // Prevent clickjacking
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

## 18. Data Protection & Privacy

### 18.1 Data Encryption

#### Database Encryption
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
      throw new Error('ENCRYPTION_KEY environment variable is required');
    }
    this.key = Buffer.from(keyString, 'hex');
  }
  
  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipher(this.algorithm, this.key, iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    // Combine iv + tag + encrypted data
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

// Usage for sensitive data
export class SecureUserService {
  private encryption = new EncryptionService();
  
  async createUser(userData: CreateUserData): Promise<User> {
    return this.prisma.user.create({
      data: {
        ...userData,
        // Encrypt sensitive personal information
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
      // Decrypt sensitive data before returning
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

### 18.2 Audit Logging

#### Comprehensive Audit Trail
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
    
    // Alert on high-severity events
    if (event.severity === 'HIGH') {
      await this.sendSecurityAlert(event);
    }
  }
  
  private async sendSecurityAlert(event: SecurityEvent): Promise<void> {
    // Implementation for security alerts
    // Could send email, SMS, or integrate with monitoring systems
  }
}

// Usage in middleware
export const auditMiddleware = async (event: RequestEvent, next: () => Promise<Response>) => {
  const startTime = Date.now();
  const response = await next();
  const duration = Date.now() - startTime;
  
  // Log API access
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