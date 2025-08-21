import { redirect } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import type { Handle } from '@sveltejs/kit';
import { canActAsProeferA, canActAsProeferB, canAccessDatabase } from '$lib/auth';

// Use the same JWT secret logic as auth.ts
const JWT_SECRET = process.env.JWT_SECRET || (() => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production environment');
  }
  console.warn('WARNING: Using fallback JWT secret. Set JWT_SECRET environment variable for production.');
  return 'fallback-secret-key-change-in-production';
})();

export const handle: Handle = async ({ event, resolve }) => {
  // Get the token from cookies
  const token = event.cookies.get('auth-token');
  
  if (token) {
    try {
      // Verify the token
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      // Add user info to event.locals so it's available in all routes
      event.locals.user = {
        id: decoded.userId,
        username: decoded.username,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        role: decoded.role
      };
    } catch (error) {
      // Invalid token, remove it
      event.cookies.delete('auth-token', { path: '/' });
    }
  }

  // Check if route requires authentication
  const url = event.url.pathname;
  
  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/api/auth/login', '/api/auth/me', '/api/auth/logout'];
  
  if (publicRoutes.some(route => url.startsWith(route))) {
    // Allow access to public routes
    return resolve(event);
  }
  
  // Check if user is authenticated
  if (!event.locals.user) {
    if (url.startsWith('/api/')) {
      // Return 401 for API routes
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Authentication required' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      // Redirect to login for page routes
      throw redirect(302, '/login');
    }
  }

  // Role-based route protection using our helper functions
  const userRole = event.locals.user.role;

  // Admin-only routes
  if (url.startsWith('/admin') || url.startsWith('/database')) {
    if (userRole !== 'ADMIN' && !(url.startsWith('/database') && userRole === 'MANAGEMENT')) {
      if (url.startsWith('/api/')) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Insufficient permissions' 
        }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        throw redirect(302, '/');
      }
    }
  }

  // Dashboard routes require MANAGEMENT or ADMIN
  if (url.startsWith('/dashboard')) {
    if (userRole !== 'MANAGEMENT' && userRole !== 'ADMIN') {
      if (url.startsWith('/api/')) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Management access required' 
        }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        throw redirect(302, '/');
      }
    }
  }

  // Prüfer A routes
  if (url.includes('/pruefer-a')) {
    if (!canActAsProeferA(userRole)) {
      if (url.startsWith('/api/')) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Prüfer A access required' 
        }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        throw redirect(302, '/');
      }
    }
  }

  // Prüfer B routes
  if (url.includes('/pruefer-b')) {
    if (!canActAsProeferB(userRole)) {
      if (url.startsWith('/api/')) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Prüfer B access required' 
        }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        throw redirect(302, '/');
      }
    }
  }

  // QR Preview routes require any prüfer role
  if (url.includes('/qr-preview')) {
    if (!canActAsProeferA(userRole) && !canActAsProeferB(userRole)) {
      if (url.startsWith('/api/')) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Prüfer access required' 
        }), {
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
