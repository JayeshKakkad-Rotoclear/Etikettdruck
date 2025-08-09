import { json } from '@sveltejs/kit';
import { verifyToken, getUserById } from '$lib/auth.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies }) => {
  try {
    const token = cookies.get('auth-token');
    
    if (!token) {
      return json({ 
        success: false, 
        error: 'Nicht angemeldet' 
      }, { status: 401 });
    }

    // Verify token
    const payload = verifyToken(token);
    if (!payload) {
      return json({ 
        success: false, 
        error: 'Ungültiger Token' 
      }, { status: 401 });
    }

    // Get current user data
    const user = await getUserById(payload.userId);
    if (!user) {
      return json({ 
        success: false, 
        error: 'Benutzer nicht gefunden' 
      }, { status: 401 });
    }

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
    console.error('Me endpoint error:', error);
    return json({ 
      success: false, 
      error: 'Benutzerinformationen konnten nicht abgerufen werden' 
    }, { status: 500 });
  }
};
