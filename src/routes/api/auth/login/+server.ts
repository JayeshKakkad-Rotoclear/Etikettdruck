import { json } from '@sveltejs/kit';
import { authenticateUser, generateToken, createSession } from '$lib/auth.js';
import { RateLimitService, SecurityAuditLogger } from '$lib/security.js';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies, getClientAddress }) => {
  const ipAddress = getClientAddress();
  const userAgent = request.headers.get('user-agent') || 'unknown';

  // Decide cookie "secure" correctly: allow env override, else infer from protocol/XFP
  const url = new URL(request.url);
  const isHttps = url.protocol === 'https:' || request.headers.get('x-forwarded-proto') === 'https';
  const envSecure = (process.env.COOKIE_SECURE ?? '').toLowerCase(); // "true" | "false" | ""
  const secure = envSecure === 'true' ? true : envSecure === 'false' ? false : isHttps;

  try {
    // API rate limit check
    const apiRateLimit = RateLimitService.isApiRequestAllowed(ipAddress);
    if (!apiRateLimit.allowed) {
      SecurityAuditLogger.logEvent({
        type: 'RATE_LIMIT_EXCEEDED',
        ipAddress,
        userAgent,
        risk: 'HIGH',
        details: { reason: 'API rate limit exceeded', resetTime: new Date(apiRateLimit.resetTime!) }
      });

      return json(
        {
          success: false,
          error: 'Too many requests. Please try again later.',
          retryAfter: apiRateLimit.resetTime
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((apiRateLimit.resetTime! - Date.now()) / 1000).toString()
          }
        }
      );
    }

    const { identifier, password, stayLoggedIn } = await request.json();

    // Basic validation
    if (!identifier || !password || typeof identifier !== 'string' || typeof password !== 'string') {
      SecurityAuditLogger.logEvent({
        type: 'LOGIN_ATTEMPT',
        ipAddress,
        userAgent,
        risk: 'LOW',
        details: { reason: 'Missing/invalid credentials' }
      });
      return json({ success: false, error: 'Benutzername/E-Mail und Passwort sind erforderlich' }, { status: 400 });
    }

    // Authenticate
    const authResult = await authenticateUser(identifier, password, ipAddress, userAgent);
    if (!authResult.user) {
      const statusCode = authResult.rateLimitInfo ? 429 : 401;
      const headers: Record<string, string> = {};
      if (authResult.rateLimitInfo?.lockedUntil) {
        headers['Retry-After'] = Math.ceil(
          (authResult.rateLimitInfo.lockedUntil.getTime() - Date.now()) / 1000
        ).toString();
      }
      return json(
        { success: false, error: authResult.securityAlert || 'Ungültige Anmeldedaten' },
        { status: statusCode, headers }
      );
    }

    const user = authResult.user;

    // Session duration
    const sessionDurationDays = stayLoggedIn ? 30 : 1;
    const tokenExpiration = stayLoggedIn ? '30d' : '8h';

    // Create session + token
    const sessionId = await createSession(user.id, ipAddress, userAgent, sessionDurationDays);
    const token = generateToken(user, sessionId, ipAddress, tokenExpiration);

    // Cookie duration (seconds)
    const cookieDuration = stayLoggedIn ? 60 * 60 * 24 * 30 : 60 * 60 * 8;

    // Set cookies (no domain on LAN/IP; secure only if HTTPS or explicitly forced)
    cookies.set('auth-token', token, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      maxAge: cookieDuration,
      path: '/'
    });

    cookies.set('session-id', sessionId, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      maxAge: cookieDuration,
      path: '/'
    });

    // CSRF token cookie (readable by JS)
    const csrfToken =
      typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : ('10000000-1000-4000-8000-100000000000').replace(/[018]/g, (c: string) =>
            ((parseInt(c) ^ (crypto.getRandomValues(new Uint8Array(1))[0] & 15)) >> (parseInt(c) / 4)).toString(16)
          );

    cookies.set('csrf-token', csrfToken, {
      httpOnly: false,
      secure,
      sameSite: 'lax',
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
      details: { sessionId, stayLoggedIn: !!stayLoggedIn, sessionDuration: sessionDurationDays }
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
      csrfToken,
      sessionInfo: { expiresIn: cookieDuration, stayLoggedIn: !!stayLoggedIn }
    });
  } catch (error) {
    SecurityAuditLogger.logEvent({
      type: 'LOGIN_FAILURE',
      ipAddress,
      userAgent,
      risk: 'HIGH',
      details: { reason: 'Server error during authentication', error: error instanceof Error ? error.message : 'Unknown' }
    });
    return json({ success: false, error: 'Anmeldung fehlgeschlagen' }, { status: 500 });
  }
};
