import { redirect } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import type { Handle } from '@sveltejs/kit';
import { canActAsProeferA, canActAsProeferB } from '$lib/auth';

// Reuse JWT secret logic (throw in prod if missing)
const JWT_SECRET =
  process.env.JWT_SECRET ||
  (() => {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be set in production environment');
    }
    console.warn('WARNING: Using fallback JWT secret. Set JWT_SECRET for production.');
    return 'fallback-secret-key-change-in-production';
  })();

export const handle: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get('auth-token');

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      event.locals.user = {
        id: decoded.userId,
        username: decoded.username,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        role: decoded.role
      };
    } catch {
      // Invalid token; clear cookies
      event.cookies.delete('auth-token', { path: '/' });
      event.cookies.delete('session-id', { path: '/' }); // ensure both are removed
    }
  }

  const url = event.url.pathname;

  // Public routes
  const publicRoutes = ['/login', '/api/auth/login', '/api/auth/me', '/api/auth/logout'];
  if (publicRoutes.some((route) => url.startsWith(route))) {
    return resolve(event);
  }

  // Require auth
  if (!event.locals.user) {
    if (url.startsWith('/api/')) {
      return new Response(JSON.stringify({ success: false, error: 'Authentication required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      throw redirect(302, '/login');
    }
  }

  const userRole = event.locals.user.role;

  // Admin-only routes (+ allow MANAGEMENT on /database)
  if (url.startsWith('/admin') || url.startsWith('/database')) {
    if (userRole !== 'ADMIN' && !(url.startsWith('/database') && userRole === 'MANAGEMENT')) {
      if (url.startsWith('/api/')) {
        return new Response(JSON.stringify({ success: false, error: 'Insufficient permissions' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        throw redirect(302, '/');
      }
    }
  }

  // Dashboard requires MANAGEMENT or ADMIN
  if (url.startsWith('/dashboard')) {
    if (userRole !== 'MANAGEMENT' && userRole !== 'ADMIN') {
      if (url.startsWith('/api/')) {
        return new Response(JSON.stringify({ success: false, error: 'Management access required' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        throw redirect(302, '/');
      }
    }
  }

  // Prüfer A
  if (url.includes('/pruefer-a')) {
    if (!canActAsProeferA(userRole)) {
      if (url.startsWith('/api/')) {
        return new Response(JSON.stringify({ success: false, error: 'Prüfer A access required' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        throw redirect(302, '/');
      }
    }
  }

  // Prüfer B
  if (url.includes('/pruefer-b')) {
    if (!canActAsProeferB(userRole)) {
      if (url.startsWith('/api/')) {
        return new Response(JSON.stringify({ success: false, error: 'Prüfer B access required' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        throw redirect(302, '/');
      }
    }
  }

  // QR Preview: needs A or B
  if (url.includes('/qr-preview')) {
    if (!canActAsProeferA(userRole) && !canActAsProeferB(userRole)) {
      if (url.startsWith('/api/')) {
        return new Response(JSON.stringify({ success: false, error: 'Prüfer access required' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        throw redirect(302, '/');
      }
    }
  }

  return resolve(event);
};
