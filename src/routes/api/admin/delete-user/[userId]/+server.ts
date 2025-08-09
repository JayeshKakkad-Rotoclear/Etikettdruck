/* cSpell:disable */
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { verifyToken } from '$lib/auth.js';
import { PrismaClient } from '@prisma/client';

// cSpell:ignore userid

const prisma = new PrismaClient();

export const DELETE: RequestHandler = async ({ params, cookies }) => {
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
        error: 'Keine Berechtigung - Nur Administratoren können Benutzer löschen' 
      }, { status: 403 });
    }

    // Get user ID from params
    const userId = parseInt(params.userId || '');
    if (!userId || isNaN(userId)) {
      return json({ 
        success: false, 
        error: 'Ungültige Benutzer-ID' 
      }, { status: 400 });
    }

    // Prevent self-deletion
    if (userId === adminUser.id) {
      return json({ 
        success: false, 
        error: 'Sie können sich nicht selbst löschen' 
      }, { status: 400 });
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!targetUser) {
      return json({ 
        success: false, 
        error: 'Benutzer nicht gefunden' 
      }, { status: 404 });
    }

    // Delete related sessions first (if any)
    await prisma.session.deleteMany({
      where: { userId: userId }
    });

    // Delete the user
    await prisma.user.delete({
      where: { id: userId }
    });

    console.log(`✅ User deleted by admin ${adminUser.username}: ${targetUser.username} (ID: ${targetUser.id})`);

    return json({
      success: true,
      message: `Benutzer ${targetUser.username} wurde erfolgreich gelöscht`
    });

  } catch (error) {
    console.error('Admin user deletion error:', error);
    return json({ 
      success: false, 
      error: 'Interner Serverfehler' 
    }, { status: 500 });
  }
};
