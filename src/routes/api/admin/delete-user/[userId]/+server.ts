/* cSpell:disable */
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SecurityMiddleware } from '$lib/security-middleware.js';
import { InputValidator } from '$lib/input-validator.js';
import { SecurityAuditLogger } from '$lib/security.js';
import { PrismaClient } from '@prisma/client';

// cSpell:ignore userid

const prisma = new PrismaClient();

export const DELETE: RequestHandler = async (event) => {
  try {
    const { context } = await SecurityMiddleware.secureEndpoint(event, {
      requiredRole: 'ADMIN',
      validateCSRF: true,
      validateInput: false // No body for DELETE request
    });

    // Get user ID from params
    const userIdResult = InputValidator.validateNumber(event.params.userId, {
      required: true,
      min: 1,
      integer: true,
      fieldName: 'Benutzer-ID'
    });

    if (!userIdResult.isValid) {
      return json({
        success: false,
        errors: {
          userId: userIdResult.error
        }
      }, { status: 400 });
    }

    const userId = userIdResult.number!;

    // Prevent self-deletion
    if (userId === context!.user.id) {
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
      SecurityAuditLogger.logEvent({
        type: 'SUSPICIOUS_ACTIVITY',
        userId: context!.user.id,
        username: context!.user.username,
        ipAddress: context!.ipAddress,
        userAgent: context!.userAgent,
        risk: 'MEDIUM',
        details: { 
          action: 'DELETE_USER_NOT_FOUND',
          targetUserId: userId
        }
      });

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

    SecurityAuditLogger.logEvent({
      type: 'LOGIN_SUCCESS', // Using existing type
      userId: context!.user.id,
      username: context!.user.username,
      ipAddress: context!.ipAddress,
      userAgent: context!.userAgent,
      risk: 'LOW',
      details: { 
        action: 'USER_DELETED',
        targetUserId: targetUser.id,
        targetUsername: targetUser.username
      }
    });

    const response = json({
      success: true,
      message: `Benutzer ${targetUser.username} wurde erfolgreich gelöscht`
    });

    return SecurityMiddleware.addSecurityHeaders(response);
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }
    
    SecurityAuditLogger.logEvent({
      type: 'LOGIN_FAILURE', // Using existing type
      ipAddress: event.getClientAddress(),
      userAgent: event.request.headers.get('user-agent') || 'unknown',
      risk: 'HIGH',
      details: { 
        action: 'DELETE_USER_ERROR',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
    
    return json({ 
      success: false, 
      error: 'Fehler beim Löschen des Benutzers' 
    }, { status: 500 });
  }
};
