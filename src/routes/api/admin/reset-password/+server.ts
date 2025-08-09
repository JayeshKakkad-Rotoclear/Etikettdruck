/* cSpell:disable */
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { verifyToken, hashPassword } from '$lib/auth.js';
import { PrismaClient } from '@prisma/client';

// cSpell:ignore userid newpassword passwordhash

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

    // Check if user is admin
    const adminUser = await prisma.user.findUnique({
      where: { id: payload.userId }
    });

    if (!adminUser || adminUser.role !== 'ADMIN') {
      return json({ 
        success: false, 
        error: 'Keine Berechtigung - Nur Administratoren können Passwörter zurücksetzen' 
      }, { status: 403 });
    }

    // Parse request body
    const { userId, newPassword } = await request.json();

    // Validate input
    if (!userId || !newPassword) {
      return json({ 
        success: false, 
        error: 'Benutzer-ID und neues Passwort sind erforderlich' 
      }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return json({ 
        success: false, 
        error: 'Neues Passwort muss mindestens 6 Zeichen lang sein' 
      }, { status: 400 });
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!targetUser) {
      return json({ 
        success: false, 
        error: 'Benutzer nicht gefunden' 
      }, { status: 404 });
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: targetUser.id },
      data: { 
        passwordHash: newPasswordHash,
        updatedAt: new Date()
      }
    });

    console.log(`✅ Password reset by admin ${adminUser.username} for user: ${targetUser.username}`);

    return json({
      success: true,
      message: `Passwort für Benutzer ${targetUser.username} wurde erfolgreich zurückgesetzt`
    });

  } catch (error) {
    console.error('Admin password reset error:', error);
    return json({ 
      success: false, 
      error: 'Interner Serverfehler' 
    }, { status: 500 });
  }
};
