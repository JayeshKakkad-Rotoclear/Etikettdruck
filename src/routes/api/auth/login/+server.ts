import { json } from '@sveltejs/kit';
import { authenticateUser, generateToken, createSession } from '$lib/auth.js';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const { identifier, password, stayLoggedIn } = await request.json();

    if (!identifier || !password) {
      return json({ 
        success: false, 
        error: 'Benutzername/E-Mail und Passwort sind erforderlich' 
      }, { status: 400 });
    }

    // Authenticate user
    const user = await authenticateUser(identifier, password);
    if (!user) {
      return json({ 
        success: false, 
        error: 'Ungültige Anmeldedaten' 
      }, { status: 401 });
    }

    // Generate JWT token with appropriate expiration
    const tokenExpiration = stayLoggedIn ? '30d' : '7d';
    const token = generateToken(user, tokenExpiration);

    // Create session with appropriate duration
    const sessionDurationDays = stayLoggedIn ? 30 : 7;
    const sessionId = await createSession(user.id, sessionDurationDays);

    // Determine session duration based on "stay logged in" preference
    const sessionDuration = stayLoggedIn 
      ? 60 * 60 * 24 * 30  // 30 days for "stay logged in"
      : 60 * 60 * 24 * 7;   // 7 days for normal login

    // Set HTTP-only cookie
    cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: sessionDuration,
      path: '/'
    });

    cookies.set('session-id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: sessionDuration,
      path: '/'
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
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return json({ 
      success: false, 
      error: 'Anmeldung fehlgeschlagen' 
    }, { status: 500 });
  }
};
