/* cSpell:disable */
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import type { User, UserRole, UserStatus } from '@prisma/client';

// cSpell:ignore bcryptjs jsonwebtoken prisma userid passwordhash firstname lastname lastloginat createdat updatedat createdby sessionid expiresat

const prisma = new PrismaClient();

// Environment variables with defaults for development
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
}

export interface JWTPayload {
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(user: AuthUser, expiresIn?: string): string {
  const payload: JWTPayload = {
    userId: user.id,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role
  };
  
  const tokenExpiration = expiresIn || JWT_EXPIRES_IN;
  return jwt.sign(payload, JWT_SECRET, { expiresIn: tokenExpiration } as jwt.SignOptions);
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Authenticate user with username/email and password
 */
export async function authenticateUser(identifier: string, password: string): Promise<AuthUser | null> {
  try {
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
      return null;
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return null;
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Return user without password hash
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
    console.error('Authentication error:', error);
    return null;
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
 * Create a new user session
 */
export async function createSession(userId: number, durationDays: number = 7): Promise<string> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + durationDays);

  const session = await prisma.session.create({
    data: {
      userId,
      expiresAt
    }
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
