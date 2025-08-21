/* cSpell:disable */
import { json } from '@sveltejs/kit';
import { verifyToken, getUserById } from '$lib/auth.js';
import { SecurityAuditLogger, RateLimitService } from '$lib/security.js';
import type { RequestEvent } from '@sveltejs/kit';
import type { UserRole } from '@prisma/client';

// cSpell:ignore middleware authz csrf xsrf

export interface SecurityContext {
  user: any;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  csrfToken?: string;
}

/**
 * Enhanced authentication middleware with comprehensive security checks
 */
export class SecurityMiddleware {
  /**
   * Require authentication for API routes
   */
  static async requireAuth(event: RequestEvent): Promise<SecurityContext> {
    const { request, cookies, getClientAddress } = event;
    const ipAddress = getClientAddress();
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Check API rate limiting
    const rateLimit = RateLimitService.isApiRequestAllowed(ipAddress);
    if (!rateLimit.allowed) {
      SecurityAuditLogger.logEvent({
        type: 'RATE_LIMIT_EXCEEDED',
        ipAddress,
        userAgent,
        risk: 'HIGH',
        details: { endpoint: request.url }
      });
      
      throw new Response(JSON.stringify({
        success: false,
        error: 'Too many requests',
        retryAfter: rateLimit.resetTime
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((rateLimit.resetTime! - Date.now()) / 1000).toString()
        }
      });
    }

    // Get tokens from cookies
    const token = cookies.get('auth-token');
    const sessionId = cookies.get('session-id');

    if (!token || !sessionId) {
      SecurityAuditLogger.logEvent({
        type: 'UNAUTHORIZED_ACCESS',
        ipAddress,
        userAgent,
        risk: 'MEDIUM',
        details: { 
          reason: 'Missing authentication tokens',
          endpoint: request.url,
          hasToken: !!token,
          hasSession: !!sessionId
        }
      });
      
      throw new Response(JSON.stringify({
        success: false,
        error: 'Authentication required'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify JWT token
    const payload = verifyToken(token, ipAddress);
    if (!payload) {
      SecurityAuditLogger.logEvent({
        type: 'UNAUTHORIZED_ACCESS',
        ipAddress,
        userAgent,
        risk: 'HIGH',
        details: { 
          reason: 'Invalid JWT token',
          endpoint: request.url
        }
      });
      
      throw new Response(JSON.stringify({
        success: false,
        error: 'Invalid authentication token'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify session ID matches
    if (payload.sessionId !== sessionId) {
      SecurityAuditLogger.logEvent({
        type: 'SUSPICIOUS_ACTIVITY',
        userId: payload.userId,
        username: payload.username,
        ipAddress,
        userAgent,
        risk: 'HIGH',
        details: { 
          reason: 'Session ID mismatch',
          endpoint: request.url,
          tokenSessionId: payload.sessionId,
          cookieSessionId: sessionId
        }
      });
      
      throw new Response(JSON.stringify({
        success: false,
        error: 'Session validation failed'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get current user data
    const user = await getUserById(payload.userId);
    if (!user) {
      SecurityAuditLogger.logEvent({
        type: 'UNAUTHORIZED_ACCESS',
        userId: payload.userId,
        username: payload.username,
        ipAddress,
        userAgent,
        risk: 'HIGH',
        details: { 
          reason: 'User not found',
          endpoint: request.url
        }
      });
      
      throw new Response(JSON.stringify({
        success: false,
        error: 'User account not found'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return {
      user,
      ipAddress,
      userAgent,
      sessionId,
      csrfToken: cookies.get('csrf-token')
    };
  }

  /**
   * Require specific role for API access
   */
  static async requireRole(event: RequestEvent, requiredRole: UserRole): Promise<SecurityContext> {
    const context = await this.requireAuth(event);
    
    const roleHierarchy: Record<UserRole, number> = {
      'VIEWER': 1,
      'PRUEFER_B': 2,
      'PRUEFER_A': 3,
      'PRUEFER_AB': 4,
      'MANAGEMENT': 5,
      'ADMIN': 6
    };

    const userLevel = roleHierarchy[context.user.role as UserRole];
    const requiredLevel = roleHierarchy[requiredRole];

    if (userLevel < requiredLevel) {
      SecurityAuditLogger.logEvent({
        type: 'UNAUTHORIZED_ACCESS',
        userId: context.user.id,
        username: context.user.username,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        risk: 'MEDIUM',
        details: { 
          reason: 'Insufficient privileges',
          endpoint: event.request.url,
          userRole: context.user.role,
          requiredRole
        }
      });
      
      throw new Response(JSON.stringify({
        success: false,
        error: 'Insufficient privileges'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return context;
  }

  /**
   * Validate CSRF token for state-changing operations
   */
  static validateCSRF(event: RequestEvent, context: SecurityContext): void {
    const { request } = event;
    const method = request.method.toUpperCase();

    // Only check CSRF for state-changing operations
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const csrfHeader = request.headers.get('x-csrf-token');
      const csrfCookie = context.csrfToken;

      if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
        SecurityAuditLogger.logEvent({
          type: 'SUSPICIOUS_ACTIVITY',
          userId: context.user.id,
          username: context.user.username,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          risk: 'HIGH',
          details: { 
            reason: 'CSRF token validation failed',
            endpoint: request.url,
            method,
            hasHeader: !!csrfHeader,
            hasCookie: !!csrfCookie,
            tokensMatch: csrfHeader === csrfCookie
          }
        });
        
        throw new Response(JSON.stringify({
          success: false,
          error: 'CSRF validation failed'
        }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
  }

  /**
   * Validate request content and structure
   */
  static async validateRequest(event: RequestEvent): Promise<any> {
    const { request } = event;
    const contentType = request.headers.get('content-type');

    // Validate content type for POST/PUT requests
    if (['POST', 'PUT', 'PATCH'].includes(request.method.toUpperCase())) {
      if (!contentType || !contentType.includes('application/json')) {
        throw new Response(JSON.stringify({
          success: false,
          error: 'Invalid content type. Expected application/json'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    try {
      const body = request.method !== 'GET' ? await request.json() : {};
      
      // Basic input validation
      if (body && typeof body === 'object') {
        // Check for potential injection attempts
        const jsonString = JSON.stringify(body);
        const suspiciousPatterns = [
          /<script/i,
          /javascript:/i,
          /vbscript:/i,
          /onload=/i,
          /onerror=/i,
          /expression\(/i,
          /eval\(/i,
          /function\(/i
        ];

        for (const pattern of suspiciousPatterns) {
          if (pattern.test(jsonString)) {
            SecurityAuditLogger.logEvent({
              type: 'SUSPICIOUS_ACTIVITY',
              ipAddress: event.getClientAddress(),
              userAgent: request.headers.get('user-agent') || 'unknown',
              risk: 'HIGH',
              details: { 
                reason: 'Potential XSS attempt detected',
                endpoint: request.url,
                pattern: pattern.source
              }
            });
            
            throw new Response(JSON.stringify({
              success: false,
              error: 'Invalid request data detected'
            }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        }
      }

      return body;
    } catch (error) {
      if (error instanceof Response) {
        throw error;
      }
      
      throw new Response(JSON.stringify({
        success: false,
        error: 'Invalid JSON format'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  /**
   * Add security headers to response
   */
  static addSecurityHeaders(response: Response): Response {
    const headers = new Headers(response.headers);
    
    // Security headers
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('X-Frame-Options', 'DENY');
    headers.set('X-XSS-Protection', '1; mode=block');
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    
    // Content Security Policy
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'", // Note: In production, remove 'unsafe-inline'
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'none'"
    ].join('; ');
    
    headers.set('Content-Security-Policy', csp);
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }

  /**
   * Complete security check for API endpoints
   */
  static async secureEndpoint(
    event: RequestEvent,
    options: {
      requireAuth?: boolean;
      requiredRole?: UserRole;
      validateCSRF?: boolean;
      validateInput?: boolean;
    } = {}
  ): Promise<{ context?: SecurityContext; body?: any }> {
    const {
      requireAuth = true,
      requiredRole,
      validateCSRF = true,
      validateInput = true
    } = options;

    let context: SecurityContext | undefined;
    let body: any;

    // Authentication check
    if (requireAuth) {
      if (requiredRole) {
        context = await this.requireRole(event, requiredRole);
      } else {
        context = await this.requireAuth(event);
      }
    }

    // CSRF protection
    if (validateCSRF && context) {
      this.validateCSRF(event, context);
    }

    // Input validation
    if (validateInput) {
      body = await this.validateRequest(event);
    }

    return { context, body };
  }
}

export default SecurityMiddleware;
