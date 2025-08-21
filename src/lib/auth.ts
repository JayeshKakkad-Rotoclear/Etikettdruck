/* cSpell:disable */
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import type { User, UserRole, UserStatus } from '@prisma/client';
import { SecurityAuditLogger, RateLimitService, PasswordValidator, SECURITY_POLICIES } from './security.js';

// cSpell:ignore bcryptjs jsonwebtoken prisma userid passwordhash firstname lastname lastloginat createdat updatedat createdby sessionid expiresat

const prisma = new PrismaClient();

// Environment variables with secure defaults
const JWT_SECRET = process.env.JWT_SECRET || (() => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production environment');
  }
  console.warn('WARNING: Using fallback JWT secret. Set JWT_SECRET environment variable for production.');
  return 'fallback-secret-key-change-in-production';
})();

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

// Security configuration
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt?: Date;
  failedLoginAttempts?: number;
  lockedUntil?: Date;
}

export interface JWTPayload {
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  sessionId: string;
  ipAddress: string;
  iat?: number;
  exp?: number;
}

export interface SessionData {
  id: string;
  userId: number;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
}

/**
 * Hash a password using bcrypt with enhanced security
 */
export async function hashPassword(password: string): Promise<string> {
  // Validate password strength before hashing
  const validation = PasswordValidator.validatePassword(password);
  if (!validation.isValid) {
    throw new Error(`Password validation failed: ${validation.errors.join(', ')}`);
  }
  
  const saltRounds = 14; // Increased from 12 for better security
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verify a password against a hash with timing attack protection
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    // Ensure consistent timing even on error
    await bcrypt.compare('dummy', '$2b$14$dummy.hash.to.prevent.timing.attacks');
    return false;
  }
}

/**
 * Generate a JWT token for a user session
 */
export function generateToken(user: AuthUser, sessionId: string, ipAddress: string, expiresIn?: string): string {
  const payload: JWTPayload = {
    userId: user.id,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    sessionId,
    ipAddress
  };
  
  const tokenExpiration = expiresIn || JWT_EXPIRES_IN;
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: tokenExpiration,
    algorithm: 'HS256',
    issuer: 'etikettdrucker',
    audience: 'etikettdrucker-app'
  } as jwt.SignOptions);
}

/**
 * Verify and decode a JWT token with enhanced security checks
 */
export function verifyToken(token: string, expectedIpAddress?: string): JWTPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: 'etikettdrucker',
      audience: 'etikettdrucker-app'
    }) as JWTPayload;
    
    // Verify IP address if binding is enabled
    if (SECURITY_POLICIES.SESSION.ipBindingEnabled && expectedIpAddress && 
        payload.ipAddress !== expectedIpAddress) {
      SecurityAuditLogger.logEvent({
        type: 'SUSPICIOUS_ACTIVITY',
        userId: payload.userId,
        username: payload.username,
        ipAddress: expectedIpAddress || 'unknown',
        userAgent: 'unknown',
        risk: 'HIGH',
        details: { 
          reason: 'IP address mismatch',
          tokenIp: payload.ipAddress,
          requestIp: expectedIpAddress
        }
      });
      return null;
    }
    
    return payload;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      SecurityAuditLogger.logEvent({
        type: 'SUSPICIOUS_ACTIVITY',
        ipAddress: expectedIpAddress || 'unknown',
        userAgent: 'unknown',
        risk: 'MEDIUM',
        details: { reason: 'Invalid JWT token', error: error.message }
      });
    }
    return null;
  }
}

/**
 * Authenticate user with enhanced security checks
 */
export async function authenticateUser(
  identifier: string, 
  password: string, 
  ipAddress: string,
  userAgent: string
): Promise<{ user: AuthUser | null; rateLimitInfo?: any; securityAlert?: string }> {
  try {
    // Check rate limiting first
    const rateLimitCheck = RateLimitService.isLoginAllowed(identifier, ipAddress);
    if (!rateLimitCheck.allowed) {
      SecurityAuditLogger.logEvent({
        type: 'RATE_LIMIT_EXCEEDED',
        username: identifier,
        ipAddress,
        userAgent,
        risk: 'HIGH',
        details: { reason: rateLimitCheck.reason, lockedUntil: rateLimitCheck.lockedUntil }
      });
      
      return { 
        user: null, 
        rateLimitInfo: rateLimitCheck,
        securityAlert: 'Too many failed login attempts. Account temporarily locked.'
      };
    }

    // Find user by username or email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: identifier },
          { email: identifier }
        ],
        status: 'ACTIVE'
      }
    });

    if (!user) {
      // Record failed attempt even for non-existent users to prevent enumeration
      RateLimitService.recordFailedLogin(identifier, ipAddress);
      
      SecurityAuditLogger.logEvent({
        type: 'LOGIN_FAILURE',
        username: identifier,
        ipAddress,
        userAgent,
        risk: 'MEDIUM',
        details: { reason: 'User not found' }
      });
      
      // Use consistent timing to prevent user enumeration attacks
      await bcrypt.compare(password, '$2b$14$dummy.hash.to.prevent.user.enumeration');
      return { user: null };
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      SecurityAuditLogger.logEvent({
        type: 'LOGIN_FAILURE',
        userId: user.id,
        username: user.username,
        ipAddress,
        userAgent,
        risk: 'MEDIUM',
        details: { reason: 'Account locked', lockedUntil: user.lockedUntil }
      });
      
      return { 
        user: null,
        securityAlert: 'Account is temporarily locked due to security concerns.'
      };
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      // Increment failed attempts
      const failedAttempts = (user.failedLoginAttempts || 0) + 1;
      const shouldLock = failedAttempts >= MAX_LOGIN_ATTEMPTS;
      
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: failedAttempts,
          lockedUntil: shouldLock ? new Date(Date.now() + LOCKOUT_DURATION) : null
        }
      });
      
      RateLimitService.recordFailedLogin(identifier, ipAddress);
      
      SecurityAuditLogger.logEvent({
        type: 'LOGIN_FAILURE',
        userId: user.id,
        username: user.username,
        ipAddress,
        userAgent,
        risk: shouldLock ? 'HIGH' : 'MEDIUM',
        details: { 
          reason: 'Invalid password', 
          failedAttempts,
          accountLocked: shouldLock
        }
      });
      
      return { user: null };
    }

    // Successful authentication - reset failed attempts and record success
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        failedLoginAttempts: 0,
        lockedUntil: null
      }
    });
    
    RateLimitService.recordSuccessfulLogin(identifier, ipAddress);
    
    SecurityAuditLogger.logEvent({
      type: 'LOGIN_SUCCESS',
      userId: user.id,
      username: user.username,
      ipAddress,
      userAgent,
      risk: 'LOW'
    });

    // Return user without sensitive data
    const authUser: AuthUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
      lastLoginAt: user.lastLoginAt || undefined
    };

    return { user: authUser };
  } catch (error) {
    SecurityAuditLogger.logEvent({
      type: 'LOGIN_FAILURE',
      username: identifier,
      ipAddress,
      userAgent,
      risk: 'HIGH',
      details: { reason: 'Authentication error', error: error instanceof Error ? error.message : 'Unknown error' }
    });
    
    return { user: null };
  }
}

/**
 * Get user by ID
 */
export async function getUserById(id: number): Promise<AuthUser | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id, status: 'ACTIVE' }
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status
    };
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}

/**
 * Create a new secure user session
 */
export async function createSession(
  userId: number, 
  ipAddress: string,
  userAgent: string,
  durationDays: number = 1
): Promise<string> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + durationDays);

  // Limit concurrent sessions per user
  const existingSessions = await prisma.session.count({
    where: { userId, isActive: true }
  });

  if (existingSessions >= SECURITY_POLICIES.SESSION.maxConcurrentSessions) {
    // Remove oldest session
    const oldestSession = await prisma.session.findFirst({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'asc' }
    });

    if (oldestSession) {
      await prisma.session.update({
        where: { id: oldestSession.id },
        data: { isActive: false }
      });
    }
  }

  const session = await prisma.session.create({
    data: {
      userId,
      ipAddress,
      userAgent,
      expiresAt,
      isActive: true
    }
  });

  SecurityAuditLogger.logEvent({
    type: 'LOGIN_SUCCESS',
    userId,
    ipAddress,
    userAgent,
    risk: 'LOW',
    details: { sessionId: session.id }
  });

  return session.id;
}

/**
 * Delete a session
 */
export async function deleteSession(sessionId: string): Promise<void> {
  await prisma.session.delete({
    where: { id: sessionId }
  });
}

/**
 * Check if user has required role
 */
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy = {
    'VIEWER': 0,
    'PRUEFER_B': 1,
    'PRUEFER_A': 2,
    'PRUEFER_AB': 3,
    'MANAGEMENT': 4,
    'ADMIN': 5
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

/**
 * Check if user can act as Prüfer A
 */
export function canActAsProeferA(userRole: UserRole): boolean {
  return userRole === 'PRUEFER_A' || userRole === 'PRUEFER_AB' || hasRole(userRole, 'MANAGEMENT');
}

/**
 * Check if user can act as Prüfer B
 */
export function canActAsProeferB(userRole: UserRole): boolean {
  return userRole === 'PRUEFER_B' || userRole === 'PRUEFER_AB' || hasRole(userRole, 'MANAGEMENT');
}

/**
 * Check if user can access database management
 */
export function canAccessDatabase(userRole: UserRole): boolean {
  return hasRole(userRole, 'MANAGEMENT');
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions(): Promise<void> {
  await prisma.session.deleteMany({
    where: {
      expiresAt: {
        lt: new Date()
      }
    }
  });
}

/**
 * Create a new user with enhanced security validation
 */
export async function createUser(
  userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    createdBy?: string;
    mustChangePassword?: boolean;
  },
  creatorIpAddress?: string,
  creatorUserAgent?: string
): Promise<{ success: boolean; user?: AuthUser; errors?: string[] }> {
  try {
    const errors: string[] = [];

    // Validate password using our security policy
    const passwordValidation = PasswordValidator.validatePassword(userData.password, userData.username);
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      errors.push('Invalid email format');
    }

    // Validate username (alphanumeric + underscore, 3-50 chars)
    const usernameRegex = /^[a-zA-Z0-9_]{3,50}$/;
    if (!usernameRegex.test(userData.username)) {
      errors.push('Username must be 3-50 characters, alphanumeric and underscore only');
    }

    // Validate names
    if (userData.firstName.length < 2 || userData.firstName.length > 50) {
      errors.push('First name must be 2-50 characters');
    }
    if (userData.lastName.length < 2 || userData.lastName.length > 50) {
      errors.push('Last name must be 2-50 characters');
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    // Check if username or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: userData.username },
          { email: userData.email }
        ]
      }
    });

    if (existingUser) {
      const conflictError = existingUser.username === userData.username 
        ? 'Username already exists' 
        : 'Email already exists';
      return { success: false, errors: [conflictError] };
    }

    // Hash password with secure settings
    const passwordHash = await hashPassword(userData.password);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        username: userData.username,
        email: userData.email,
        passwordHash,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        status: 'ACTIVE',
        createdBy: userData.createdBy || 'system',
        mustChangePassword: userData.mustChangePassword || false,
        passwordChangedAt: new Date()
      }
    });

    // Log user creation event
    SecurityAuditLogger.logEvent({
      type: 'USER_CREATED',
      userId: newUser.id,
      username: newUser.username,
      ipAddress: creatorIpAddress || 'system',
      userAgent: creatorUserAgent || 'system',
      risk: 'LOW',
      details: {
        createdUser: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role
        },
        createdBy: userData.createdBy || 'system'
      }
    });

    const authUser: AuthUser = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: newUser.role,
      status: newUser.status
    };

    return { success: true, user: authUser };

  } catch (error) {
    console.error('User creation error:', error);
    
    SecurityAuditLogger.logEvent({
      type: 'USER_CREATION_FAILED',
      username: userData.username,
      ipAddress: creatorIpAddress || 'system',
      userAgent: creatorUserAgent || 'system',
      risk: 'MEDIUM',
      details: { 
        error: error instanceof Error ? error.message : 'Unknown error',
        attemptedData: {
          username: userData.username,
          email: userData.email,
          role: userData.role
        }
      }
    });

    return { 
      success: false, 
      errors: ['Failed to create user. Please try again or contact system administrator.'] 
    };
  }
}

/**
 * Update user password with security validation
 */
export async function updateUserPassword(
  userId: number,
  newPassword: string,
  updatedBy: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ success: boolean; errors?: string[] }> {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return { success: false, errors: ['User not found'] };
    }

    // Validate new password
    const passwordValidation = PasswordValidator.validatePassword(newPassword, user.username);
    if (!passwordValidation.isValid) {
      return { success: false, errors: passwordValidation.errors };
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        passwordChangedAt: new Date(),
        mustChangePassword: false,
        failedLoginAttempts: 0,
        lockedUntil: null
      }
    });

    // Log password change
    SecurityAuditLogger.logEvent({
      type: 'PASSWORD_CHANGE',
      userId: userId,
      username: user.username,
      ipAddress: ipAddress || 'system',
      userAgent: userAgent || 'system',
      risk: 'LOW',
      details: { updatedBy }
    });

    return { success: true };

  } catch (error) {
    console.error('Password update error:', error);
    return { success: false, errors: ['Failed to update password'] };
  }
}
