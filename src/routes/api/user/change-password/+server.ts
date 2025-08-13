/* cSpell:disable */
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { verifyToken, hashPassword, verifyPassword } from '$lib/auth.js';
import { PrismaClient } from '@prisma/client';

// cSpell:ignore currentpassword newpassword passwordhash

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
    const { currentPassword, newPassword } = await request.json();

    // Validate input
    if (!currentPassword || !newPassword) {
      return json({ 
        success: false, 
        error: 'Aktuelles und neues Passwort sind erforderlich' 
      }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return json({ 
        success: false, 
        error: 'Neues Passwort muss mindestens 6 Zeichen lang sein' 
      }, { status: 400 });
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    });

    if (!user) {
      return json({ 
        success: false, 
        error: 'Benutzer nicht gefunden' 
      }, { status: 404 });
    }

    // Verify current password
    const isCurrentPasswordValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      return json({ 
        success: false, 
        error: 'Aktuelles Passwort ist falsch' 
      }, { status: 400 });
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        passwordHash: newPasswordHash,
        updatedAt: new Date()
      }
    });


    return json({
      success: true,
      message: 'Passwort erfolgreich geändert'
    });

  } catch (error) {
    return json({ 
      success: false, 
      error: 'Interner Serverfehler' 
    }, { status: 500 });
  }
};
