/* cSpell:disable */
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// cSpell:ignore bruteforce failedattempts lastfailedattempt

export interface SecurityEvent {
  id: string;
  type: 'LOGIN_ATTEMPT' | 'LOGIN_SUCCESS' | 'LOGIN_FAILURE' | 'LOGOUT' | 'PASSWORD_CHANGE' | 
        'UNAUTHORIZED_ACCESS' | 'SUSPICIOUS_ACTIVITY' | 'RATE_LIMIT_EXCEEDED' | 'ACCOUNT_LOCKED' |
        'USER_CREATED' | 'USER_CREATION_FAILED' | 'PASSWORD_CHANGED' | 'USER_UPDATED' | 'USER_DELETED';
  userId?: number;
  username?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  details?: Record<string, any>;
  risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface LoginAttempt {
  identifier: string;
  ipAddress: string;
  attempts: number;
  lastAttempt: Date;
  lockedUntil?: Date;
}

// Rate limiting configuration
export const RATE_LIMITS = {
  LOGIN_ATTEMPTS: {
    maxAttempts: 5,
    windowMinutes: 15,
    lockoutMinutes: 30
  },
  API_REQUESTS: {
    maxRequests: 100,
    windowMinutes: 1
  },
  PASSWORD_RESET: {
    maxAttempts: 3,
    windowMinutes: 60
  }
} as const;

// Security policies
export const SECURITY_POLICIES = {
  PASSWORD: {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    preventReuse: 5, // Last 5 passwords
    maxAge: 90, // Force change after 90 days
    preventCommonPasswords: true
  },
  SESSION: {
    maxDuration: 8 * 60 * 60 * 1000, // 8 hours
    renewalThreshold: 30 * 60 * 1000, // Renew if < 30 minutes left
    maxConcurrentSessions: 3,
    ipBindingEnabled: true
  },
  ACCOUNT: {
    autoLockAfterDays: 90,
    requireEmailVerification: true,
    maxLoginAttempts: 5,
    lockoutDuration: 30 * 60 * 1000 // 30 minutes
  }
} as const;

/**
 * Enhanced password validation with comprehensive security checks
 */
export class PasswordValidator {
  private static commonPasswords = new Set([
    'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
    'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'Password',
    'Password1', 'password1', 'Password123', 'admin123', 'root', 'toor',
    'pass', 'test', 'guest', 'user', 'rotoclear', 'etikettdrucker'
  ]);

  static validatePassword(password: string, username?: string): { 
    isValid: boolean; 
    errors: string[]; 
    strength: 'WEAK' | 'FAIR' | 'GOOD' | 'STRONG' | 'VERY_STRONG';
  } {
    const errors: string[] = [];
    let score = 0;

    // Length check
    if (password.length < SECURITY_POLICIES.PASSWORD.minLength) {
      errors.push(`Passwort muss mindestens ${SECURITY_POLICIES.PASSWORD.minLength} Zeichen lang sein`);
    } else {
      score += Math.min(password.length - SECURITY_POLICIES.PASSWORD.minLength, 8);
    }

    // Character type requirements
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (SECURITY_POLICIES.PASSWORD.requireUppercase && !hasUppercase) {
      errors.push('Passwort muss mindestens einen Großbuchstaben enthalten');
    } else if (hasUppercase) {
      score += 2;
    }

    if (SECURITY_POLICIES.PASSWORD.requireLowercase && !hasLowercase) {
      errors.push('Passwort muss mindestens einen Kleinbuchstaben enthalten');
    } else if (hasLowercase) {
      score += 2;
    }

    if (SECURITY_POLICIES.PASSWORD.requireNumbers && !hasNumbers) {
      errors.push('Passwort muss mindestens eine Zahl enthalten');
    } else if (hasNumbers) {
      score += 2;
    }

    if (SECURITY_POLICIES.PASSWORD.requireSpecialChars && !hasSpecialChars) {
      errors.push('Passwort muss mindestens ein Sonderzeichen enthalten');
    } else if (hasSpecialChars) {
      score += 3;
    }

    // Advanced security checks
    if (username && password.toLowerCase().includes(username.toLowerCase())) {
      errors.push('Passwort darf nicht den Benutzernamen enthalten');
      score -= 5;
    }

    // Common passwords check
    if (this.commonPasswords.has(password.toLowerCase())) {
      errors.push('Passwort ist zu häufig verwendet und unsicher');
      score -= 10;
    }

    // Sequential characters check
    if (this.hasSequentialChars(password)) {
      errors.push('Passwort darf keine aufeinanderfolgenden Zeichen enthalten (z.B. 123, abc)');
      score -= 3;
    }

    // Repeated characters check
    if (this.hasRepeatedChars(password)) {
      errors.push('Passwort darf nicht zu viele wiederholte Zeichen enthalten');
      score -= 2;
    }

    // Determine strength
    let strength: 'WEAK' | 'FAIR' | 'GOOD' | 'STRONG' | 'VERY_STRONG';
    if (score < 5) strength = 'WEAK';
    else if (score < 10) strength = 'FAIR';
    else if (score < 15) strength = 'GOOD';
    else if (score < 20) strength = 'STRONG';
    else strength = 'VERY_STRONG';

    return {
      isValid: errors.length === 0 && score >= 10,
      errors,
      strength
    };
  }

  private static hasSequentialChars(password: string): boolean {
    const sequences = [
      'abcdefghijklmnopqrstuvwxyz',
      '0123456789',
      'qwertyuiop',
      'asdfghjkl',
      'zxcvbnm'
    ];

    for (const seq of sequences) {
      for (let i = 0; i <= seq.length - 3; i++) {
        const subseq = seq.substring(i, i + 3);
        if (password.toLowerCase().includes(subseq) || 
            password.toLowerCase().includes(subseq.split('').reverse().join(''))) {
          return true;
        }
      }
    }
    return false;
  }

  private static hasRepeatedChars(password: string): boolean {
    const charCounts = new Map<string, number>();
    for (const char of password) {
      charCounts.set(char, (charCounts.get(char) || 0) + 1);
    }

    const maxRepeats = Math.max(...charCounts.values());
    const totalRepeats = Array.from(charCounts.values())
      .reduce((sum, count) => sum + Math.max(0, count - 1), 0);

    return maxRepeats > password.length / 3 || totalRepeats > password.length / 2;
  }

  /**
   * Generate a secure password meeting all requirements
   */
  static generateSecurePassword(length: number = 16): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*(),.?":{}|<>';
    
    let password = '';
    
    // Ensure at least one character from each required category
    password += this.getRandomChar(uppercase);
    password += this.getRandomChar(lowercase);
    password += this.getRandomChar(numbers);
    password += this.getRandomChar(special);
    
    // Fill remaining length with random characters from all categories
    const allChars = uppercase + lowercase + numbers + special;
    for (let i = 4; i < length; i++) {
      password += this.getRandomChar(allChars);
    }
    
    // Shuffle the password to randomize character positions
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  private static getRandomChar(chars: string): string {
    const randomIndex = Math.floor(Math.random() * chars.length);
    return chars.charAt(randomIndex);
  }
}

/**
 * Rate limiting service to prevent abuse
 */
export class RateLimitService {
  private static attempts = new Map<string, LoginAttempt>();
  private static apiRequests = new Map<string, { count: number; resetTime: number }>();

  /**
   * Check if login attempt is allowed
   */
  static isLoginAllowed(identifier: string, ipAddress: string): { 
    allowed: boolean; 
    remainingAttempts?: number; 
    lockedUntil?: Date;
    reason?: string;
  } {
    const key = `${identifier}:${ipAddress}`;
    const attempt = this.attempts.get(key);
    const now = new Date();

    if (!attempt) {
      return { allowed: true, remainingAttempts: RATE_LIMITS.LOGIN_ATTEMPTS.maxAttempts };
    }

    // Check if account is locked
    if (attempt.lockedUntil && attempt.lockedUntil > now) {
      return { 
        allowed: false, 
        lockedUntil: attempt.lockedUntil,
        reason: 'Account temporarily locked due to too many failed attempts'
      };
    }

    // Check if window has expired (reset attempts)
    const windowExpiry = new Date(attempt.lastAttempt.getTime() + 
                                  RATE_LIMITS.LOGIN_ATTEMPTS.windowMinutes * 60000);
    if (now > windowExpiry) {
      this.attempts.delete(key);
      return { allowed: true, remainingAttempts: RATE_LIMITS.LOGIN_ATTEMPTS.maxAttempts };
    }

    // Check if max attempts reached
    if (attempt.attempts >= RATE_LIMITS.LOGIN_ATTEMPTS.maxAttempts) {
      const lockUntil = new Date(now.getTime() + RATE_LIMITS.LOGIN_ATTEMPTS.lockoutMinutes * 60000);
      attempt.lockedUntil = lockUntil;
      this.attempts.set(key, attempt);
      
      return { 
        allowed: false, 
        lockedUntil: lockUntil,
        reason: 'Too many failed login attempts'
      };
    }

    return { 
      allowed: true, 
      remainingAttempts: RATE_LIMITS.LOGIN_ATTEMPTS.maxAttempts - attempt.attempts 
    };
  }

  /**
   * Record a failed login attempt
   */
  static recordFailedLogin(identifier: string, ipAddress: string): void {
    const key = `${identifier}:${ipAddress}`;
    const attempt = this.attempts.get(key) || {
      identifier,
      ipAddress,
      attempts: 0,
      lastAttempt: new Date()
    };

    attempt.attempts++;
    attempt.lastAttempt = new Date();
    this.attempts.set(key, attempt);
  }

  /**
   * Record a successful login (clear failed attempts)
   */
  static recordSuccessfulLogin(identifier: string, ipAddress: string): void {
    const key = `${identifier}:${ipAddress}`;
    this.attempts.delete(key);
  }

  /**
   * Check API rate limit
   */
  static isApiRequestAllowed(ipAddress: string): { allowed: boolean; resetTime?: number } {
    const now = Date.now();
    const request = this.apiRequests.get(ipAddress);

    if (!request || now > request.resetTime) {
      this.apiRequests.set(ipAddress, {
        count: 1,
        resetTime: now + (RATE_LIMITS.API_REQUESTS.windowMinutes * 60000)
      });
      return { allowed: true };
    }

    if (request.count >= RATE_LIMITS.API_REQUESTS.maxRequests) {
      return { allowed: false, resetTime: request.resetTime };
    }

    request.count++;
    this.apiRequests.set(ipAddress, request);
    return { allowed: true };
  }

  /**
   * Clean up expired entries
   */
  static cleanup(): void {
    const now = new Date();
    
    // Clean up login attempts
    for (const [key, attempt] of this.attempts.entries()) {
      const expiry = new Date(attempt.lastAttempt.getTime() + 
                             RATE_LIMITS.LOGIN_ATTEMPTS.windowMinutes * 60000);
      if (now > expiry && (!attempt.lockedUntil || now > attempt.lockedUntil)) {
        this.attempts.delete(key);
      }
    }

    // Clean up API requests
    const currentTime = Date.now();
    for (const [key, request] of this.apiRequests.entries()) {
      if (currentTime > request.resetTime) {
        this.apiRequests.delete(key);
      }
    }
  }
}

/**
 * Security audit logging service
 */
export class SecurityAuditLogger {
  private static events: SecurityEvent[] = [];

  static logEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): void {
    const securityEvent: SecurityEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      ...event
    };

    this.events.push(securityEvent);
    
    // Keep only last 1000 events in memory
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }

    // Log to console for server-side monitoring
    if (!browser) {
      console.log('[SECURITY AUDIT]', JSON.stringify(securityEvent));
      
      // Log high-risk events with more detail
      if (event.risk === 'HIGH' || event.risk === 'CRITICAL') {
        console.warn('[SECURITY ALERT]', securityEvent);
      }
    }
  }

  static getEvents(filter?: {
    type?: SecurityEvent['type'];
    userId?: number;
    risk?: SecurityEvent['risk'];
    since?: Date;
  }): SecurityEvent[] {
    let filtered = this.events;

    if (filter) {
      if (filter.type) {
        filtered = filtered.filter(e => e.type === filter.type);
      }
      if (filter.userId) {
        filtered = filtered.filter(e => e.userId === filter.userId);
      }
      if (filter.risk) {
        filtered = filtered.filter(e => e.risk === filter.risk);
      }
      if (filter.since) {
        filtered = filtered.filter(e => e.timestamp >= filter.since!);
      }
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  static getSecuritySummary(): {
    totalEvents: number;
    criticalEvents: number;
    highRiskEvents: number;
    recentEvents: number;
    suspiciousActivity: number;
  } {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    return {
      totalEvents: this.events.length,
      criticalEvents: this.events.filter(e => e.risk === 'CRITICAL').length,
      highRiskEvents: this.events.filter(e => e.risk === 'HIGH').length,
      recentEvents: this.events.filter(e => e.timestamp >= last24Hours).length,
      suspiciousActivity: this.events.filter(e => 
        e.type === 'SUSPICIOUS_ACTIVITY' || 
        e.type === 'UNAUTHORIZED_ACCESS' ||
        e.type === 'RATE_LIMIT_EXCEEDED'
      ).length
    };
  }
}

// Initialize cleanup intervals
if (browser) {
  // Clean up rate limiting data every 5 minutes
  setInterval(() => {
    RateLimitService.cleanup();
  }, 5 * 60 * 1000);
}

export default {
  PasswordValidator,
  RateLimitService,
  SecurityAuditLogger,
  RATE_LIMITS,
  SECURITY_POLICIES
};
