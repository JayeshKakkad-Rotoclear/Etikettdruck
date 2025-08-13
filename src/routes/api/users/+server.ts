import { json } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';
import { hashPassword, verifyToken, hasRole } from '$lib/auth.js';
import type { RequestHandler } from './$types';

const prisma = new PrismaClient();

// GET - List all users (Admin only)
export const GET: RequestHandler = async ({ cookies, url }) => {
  try {
    const token = cookies.get('auth-token');
    if (!token) {
      return json({ success: false, error: 'Nicht angemeldet' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !hasRole(payload.role, 'ADMIN')) {
      return json({ success: false, error: 'Keine Berechtigung' }, { status: 403 });
    }

    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const search = url.searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    const where = search ? {
      OR: [
        { username: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { firstName: { contains: search, mode: 'insensitive' as const } },
        { lastName: { contains: search, mode: 'insensitive' as const } }
      ]
    } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          lastLoginAt: true,
          createdAt: true,
          createdBy: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    return json({
      success: true,
      data: {
        users,
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return json({ success: false, error: 'Fehler beim Laden der Benutzer' }, { status: 500 });
  }
};

// POST - Create new user (Admin only)
export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const token = cookies.get('auth-token');
    if (!token) {
      return json({ success: false, error: 'Nicht angemeldet' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !hasRole(payload.role, 'ADMIN')) {
      return json({ success: false, error: 'Keine Berechtigung' }, { status: 403 });
    }

    const { username, email, password, firstName, lastName, role } = await request.json();

    // Validation
    if (!username || !email || !password || !firstName || !lastName || !role) {
      return json({ 
        success: false, 
        error: 'Alle Felder sind erforderlich' 
      }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    });

    if (existingUser) {
      return json({ 
        success: false, 
        error: 'Benutzername oder E-Mail bereits vergeben' 
      }, { status: 400 });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        firstName,
        lastName,
        role,
        createdBy: payload.username
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        createdAt: true
      }
    });

    return json({ success: true, data: user });
  } catch (error) {
    return json({ success: false, error: 'Fehler beim Erstellen des Benutzers' }, { status: 500 });
  }
};
