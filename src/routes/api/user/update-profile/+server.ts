/* cSpell:disable */
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { verifyToken } from '$lib/auth.js';
import { PrismaClient } from '@prisma/client';

// cSpell:ignore firstname lastname

const prisma = new PrismaClient();

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    // Verify authentication
    const token = cookies.get('auth-token');
    if (!token) {
      return json({ 
        success: false, 
        error: 'Nicht authentifiziert' 
      }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return json({ 
        success: false, 
        error: 'Ungültiger Token' 
      }, { status: 401 });
    }

    // Parse request body
    const { email, firstName, lastName } = await request.json();

    // Validate input
    if (!email || !firstName || !lastName) {
      return json({ 
        success: false, 
        error: 'E-Mail, Vorname und Nachname sind erforderlich' 
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return json({ 
        success: false, 
        error: 'Ungültige E-Mail-Adresse' 
      }, { status: 400 });
    }

    // Check if email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email: email,
        NOT: {
          id: payload.userId
        }
      }
    });

    if (existingUser) {
      return json({ 
        success: false, 
        error: 'E-Mail-Adresse wird bereits von einem anderen Benutzer verwendet' 
      }, { status: 400 });
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: payload.userId },
      data: { 
        email,
        firstName,
        lastName,
        updatedAt: new Date()
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true
      }
    });

    console.log(`✅ Profile updated for user: ${updatedUser.username}`);

    return json({
      success: true,
      message: 'Profil erfolgreich aktualisiert',
      data: {
        user: updatedUser
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return json({ 
      success: false, 
      error: 'Interner Serverfehler' 
    }, { status: 500 });
  }
};
