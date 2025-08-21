import { json } from '@sveltejs/kit';
import { authenticateUser, generateToken, createSession } from '$lib/auth.js';
import { RateLimitService, SecurityAuditLogger } from '$lib/security.js';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies, getClientAddress }) => {
  const ipAddress = getClientAddress();
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  try {
    // Check API rate limiting first
    const apiRateLimit = RateLimitService.isApiRequestAllowed(ipAddress);
    if (!apiRateLimit.allowed) {
      SecurityAuditLogger.logEvent({
        type: 'RATE_LIMIT_EXCEEDED',
        ipAddress,
        userAgent,
        risk: 'HIGH',
        details: { 
          reason: 'API rate limit exceeded',
          resetTime: new Date(apiRateLimit.resetTime!)
        }
      });
      
      return json({ 
        success: false, 
        error: 'Too many requests. Please try again later.',
        retryAfter: apiRateLimit.resetTime
      }, { 
        status: 429,
        headers: {
          'Retry-After': Math.ceil((apiRateLimit.resetTime! - Date.now()) / 1000).toString()
        }
      });
    }

    const { identifier, password, stayLoggedIn } = await request.json();

    // Input validation
    if (!identifier || !password) {
      SecurityAuditLogger.logEvent({
        type: 'LOGIN_ATTEMPT',
        ipAddress,
        userAgent,
        risk: 'LOW',
        details: { reason: 'Missing credentials' }
      });
      
      return json({ 
        success: false, 
        error: 'Benutzername/E-Mail und Passwort sind erforderlich' 
      }, { status: 400 });
    }

    // Additional input validation
    if (typeof identifier !== 'string' || typeof password !== 'string') {
      SecurityAuditLogger.logEvent({
        type: 'SUSPICIOUS_ACTIVITY',
        ipAddress,
        userAgent,
        risk: 'MEDIUM',
        details: { reason: 'Invalid input types' }
      });
      
      return json({ 
        success: false, 
        error: 'Ungültige Eingabedaten' 
      }, { status: 400 });
    }

    // Authenticate user with enhanced security
    const authResult = await authenticateUser(identifier, password, ipAddress, userAgent);
    
    if (!authResult.user) {
      const errorResponse = {
        success: false,
        error: authResult.securityAlert || 'Ungültige Anmeldedaten'
      };

      const statusCode = authResult.rateLimitInfo ? 429 : 401;
      const headers: Record<string, string> = {};
      
      if (authResult.rateLimitInfo?.lockedUntil) {
        headers['Retry-After'] = Math.ceil(
          (authResult.rateLimitInfo.lockedUntil.getTime() - Date.now()) / 1000
        ).toString();
      }

      return json(errorResponse, { status: statusCode, headers });
    }

    const user = authResult.user;

    // Determine session duration
    const sessionDurationDays = stayLoggedIn ? 30 : 1; // Reduced from 7 days to 1 day for security
    const tokenExpiration = stayLoggedIn ? '30d' : '8h'; // Reduced token expiration

    // Create secure session
    const sessionId = await createSession(user.id, ipAddress, userAgent, sessionDurationDays);

    // Generate JWT token with session binding
    const token = generateToken(user, sessionId, ipAddress, tokenExpiration);

    // Calculate cookie duration
    const cookieDuration = stayLoggedIn 
      ? 60 * 60 * 24 * 30  // 30 days for "stay logged in"
      : 60 * 60 * 8;       // 8 hours for normal login

    // Set secure HTTP-only cookies
    const isProduction = process.env.NODE_ENV === 'production';
    
    cookies.set('auth-token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: cookieDuration,
      path: '/'
    });

    cookies.set('session-id', sessionId, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: cookieDuration,
      path: '/'
    });

    // Set CSRF token cookie (readable by JavaScript for CSRF protection)
    const csrfToken = crypto.randomUUID();
    cookies.set('csrf-token', csrfToken, {
      httpOnly: false, // Needs to be readable by frontend
      secure: isProduction,
      sameSite: 'strict',
      maxAge: cookieDuration,
      path: '/'
    });

    SecurityAuditLogger.logEvent({
      type: 'LOGIN_SUCCESS',
      userId: user.id,
      username: user.username,
      ipAddress,
      userAgent,
      risk: 'LOW',
      details: { 
        sessionId,
        stayLoggedIn: !!stayLoggedIn,
        sessionDuration: sessionDurationDays
      }
    });

    return json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      csrfToken, // Include CSRF token in response
      sessionInfo: {
        expiresIn: cookieDuration,
        stayLoggedIn: !!stayLoggedIn
      }
    });
  } catch (error) {
    SecurityAuditLogger.logEvent({
      type: 'LOGIN_FAILURE',
      ipAddress,
      userAgent,
      risk: 'HIGH',
      details: { 
        reason: 'Server error during authentication',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
    
    return json({ 
      success: false, 
      error: 'Anmeldung fehlgeschlagen' 
    }, { status: 500 });
  }
};
