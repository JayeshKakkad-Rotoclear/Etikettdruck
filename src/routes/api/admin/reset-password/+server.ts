/* cSpell:disable */
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { hashPassword } from '$lib/auth.js';
import { SecurityMiddleware } from '$lib/security-middleware.js';
import { InputValidator } from '$lib/input-validator.js';
import { SecurityAuditLogger } from '$lib/security.js';
import { PrismaClient } from '@prisma/client';

// cSpell:ignore userid newpassword passwordhash

const prisma = new PrismaClient();

export const POST: RequestHandler = async (event) => {
  try {
    const { context, body } = await SecurityMiddleware.secureEndpoint(event, {
      requiredRole: 'ADMIN',
      validateCSRF: true,
      validateInput: true
    });

    // Validate input
    const userIdResult = InputValidator.validateNumber(body.userId, {
      required: true,
      min: 1,
      integer: true,
      fieldName: 'Benutzer-ID'
    });

    const passwordResult = InputValidator.validateText(body.newPassword, {
      required: true,
      minLength: 12,
      maxLength: 128,
      skipDangerousPatterns: true, // Allow special characters in passwords
      fieldName: 'Neues Passwort'
    });

    if (!userIdResult.isValid || !passwordResult.isValid) {
      return json({
        success: false,
        errors: {
          userId: userIdResult.error,
          newPassword: passwordResult.error
        }
      }, { status: 400 });
    }

    const userId = userIdResult.number!;
    const newPassword = passwordResult.sanitized!;

    // Additional password validation using enhanced security
    const { PasswordValidator } = await import('$lib/security.js');
    const passwordValidation = PasswordValidator.validatePassword(newPassword);
    
    if (!passwordValidation.isValid) {
      return json({
        success: false,
        errors: {
          newPassword: passwordValidation.errors.join(', ')
        }
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
          action: 'RESET_PASSWORD_USER_NOT_FOUND',
          targetUserId: userId
        }
      });

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

    SecurityAuditLogger.logEvent({
      type: 'LOGIN_SUCCESS', // Using existing type
      userId: context!.user.id,
      username: context!.user.username,
      ipAddress: context!.ipAddress,
      userAgent: context!.userAgent,
      risk: 'LOW',
      details: { 
        action: 'PASSWORD_RESET',
        targetUserId: targetUser.id,
        targetUsername: targetUser.username
      }
    });

    const response = json({
      success: true,
      message: `Passwort für Benutzer ${targetUser.username} wurde erfolgreich zurückgesetzt`
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
        action: 'RESET_PASSWORD_ERROR',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
    
    return json({ 
      success: false, 
      error: 'Fehler beim Zurücksetzen des Passworts' 
    }, { status: 500 });
  }
};
