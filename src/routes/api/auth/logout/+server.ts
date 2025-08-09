import { json } from '@sveltejs/kit';
import { deleteSession } from '$lib/auth.js';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
  try {
    const sessionId = cookies.get('session-id');
    
    if (sessionId) {
      await deleteSession(sessionId);
    }

    // Clear cookies
    cookies.delete('auth-token', { path: '/' });
    cookies.delete('session-id', { path: '/' });

    return json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return json({ 
      success: false, 
      error: 'Abmeldung fehlgeschlagen' 
    }, { status: 500 });
  }
};
