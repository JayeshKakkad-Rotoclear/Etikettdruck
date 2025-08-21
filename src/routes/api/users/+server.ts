import { json } from '@sveltejs/kit';
import { hashPassword, hasRole } from '$lib/auth.js';
import { SecurityMiddleware } from '$lib/security-middleware.js';
import { InputValidator } from '$lib/input-validator.js';
import { SecurityAuditLogger } from '$lib/security.js';
import { PrismaClient } from '@prisma/client';
import type { RequestHandler } from './$types';
import type { UserRole } from '@prisma/client';

const prisma = new PrismaClient();

// GET - List all users (Admin only)
export const GET: RequestHandler = async (event) => {
  try {
    const { context } = await SecurityMiddleware.secureEndpoint(event, {
      requiredRole: 'ADMIN',
      validateCSRF: false, // GET requests don't need CSRF
      validateInput: false // No input for GET
    });

    const { url } = event;
    
    // Validate query parameters
    const pageResult = InputValidator.validateNumber(url.searchParams.get('page'), {
      required: false,
      min: 1,
      max: 1000,
      integer: true,
      fieldName: 'Seite'
    });

    const limitResult = InputValidator.validateNumber(url.searchParams.get('limit'), {
      required: false,
      min: 1,
      max: 100,
      integer: true,
      fieldName: 'Limit'
    });

    const searchResult = InputValidator.validateText(url.searchParams.get('search') || '', {
      required: false,
      maxLength: 100,
      fieldName: 'Suchbegriff'
    });

    if (!pageResult.isValid || !limitResult.isValid || !searchResult.isValid) {
      return json({
        success: false,
        errors: {
          page: pageResult.error,
          limit: limitResult.error,
          search: searchResult.error
        }
      }, { status: 400 });
    }

    const page = pageResult.number || 1;
    const limit = limitResult.number || 20;
    const search = searchResult.sanitized || '';

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
          // failedLoginAttempts: true, // Uncomment after Prisma client regeneration
          // lockedUntil: true, // Uncomment after Prisma client regeneration
          createdAt: true,
          createdBy: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    SecurityAuditLogger.logEvent({
      type: 'LOGIN_SUCCESS', // Using existing type, could add 'DATA_ACCESS'
      userId: context!.user.id,
      username: context!.user.username,
      ipAddress: context!.ipAddress,
      userAgent: context!.userAgent,
      risk: 'LOW',
      details: { 
        action: 'LIST_USERS',
        recordsReturned: users.length,
        totalRecords: total,
        searchTerm: search
      }
    });

    const response = json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
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
        action: 'LIST_USERS_ERROR',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
    
    return json({ 
      success: false, 
      error: 'Fehler beim Laden der Benutzerliste' 
    }, { status: 500 });
  }
};

// POST - Create new user (Admin only)
export const POST: RequestHandler = async (event) => {
  try {
    const { context, body } = await SecurityMiddleware.secureEndpoint(event, {
      requiredRole: 'ADMIN',
      validateCSRF: true,
      validateInput: true
    });

    // Define validation schema
    const userSchema = {
      username: {
        type: 'username' as const,
        required: true
      },
      email: {
        type: 'email' as const,
        required: true
      },
      password: {
        type: 'string' as const,
        required: true,
        minLength: 12, // Restored original requirement
        maxLength: 128,
        skipDangerousPatterns: true // Allow special characters in passwords
      },
      firstName: {
        type: 'string' as const,
        required: true,
        minLength: 1,
        maxLength: 50
      },
      lastName: {
        type: 'string' as const,
        required: true,
        minLength: 1,
        maxLength: 50
      },
      role: {
        type: 'string' as const,
        required: true,
        custom: (value: any) => {
          const validRoles: UserRole[] = ['VIEWER', 'PRUEFER_B', 'PRUEFER_A', 'PRUEFER_AB', 'MANAGEMENT', 'ADMIN'];
          if (!validRoles.includes(value)) {
            return { isValid: false, error: 'Ungültige Benutzerrolle' };
          }
          return { isValid: true };
        }
      }
    };

    // Validate input
    const validation = InputValidator.validateObject(body, userSchema);
    if (!validation.isValid) {
      SecurityAuditLogger.logEvent({
        type: 'SUSPICIOUS_ACTIVITY',
        userId: context!.user.id,
        username: context!.user.username,
        ipAddress: context!.ipAddress,
        userAgent: context!.userAgent,
        risk: 'MEDIUM',
        details: { 
          action: 'CREATE_USER_VALIDATION_FAILED',
          errors: validation.errors
        }
      });

      return json({
        success: false,
        errors: validation.errors
      }, { status: 400 });
    }

    const { username, email, password, firstName, lastName, role } = validation.sanitized!;

    // Additional password validation using enhanced security
    const { PasswordValidator } = await import('$lib/security.js');
    const passwordValidation = PasswordValidator.validatePassword(password, username);
    
    if (!passwordValidation.isValid) {
      return json({
        success: false,
        errors: {
          password: passwordValidation.errors.join(', ')
        }
      }, { status: 400 });
    }

    // Check if username or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    });

    if (existingUser) {
      SecurityAuditLogger.logEvent({
        type: 'SUSPICIOUS_ACTIVITY',
        userId: context!.user.id,
        username: context!.user.username,
        ipAddress: context!.ipAddress,
        userAgent: context!.userAgent,
        risk: 'MEDIUM',
        details: { 
          action: 'CREATE_USER_DUPLICATE',
          existingUsername: existingUser.username,
          attemptedUsername: username,
          existingEmail: existingUser.email,
          attemptedEmail: email
        }
      });

      return json({
        success: false,
        errors: {
          username: existingUser.username === username ? 'Benutzername bereits vergeben' : undefined,
          email: existingUser.email === email ? 'E-Mail-Adresse bereits vergeben' : undefined
        }
      }, { status: 409 });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        firstName,
        lastName,
        role: role as UserRole,
        createdBy: context!.user.username,
        // passwordChangedAt: new Date(), // Uncomment after Prisma client regeneration
        // mustChangePassword: false // Uncomment after Prisma client regeneration
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        createdAt: true,
        createdBy: true
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
        action: 'USER_CREATED',
        newUserId: newUser.id,
        newUsername: newUser.username,
        newUserRole: newUser.role
      }
    });

    const response = json({
      success: true,
      data: { user: newUser },
      message: `Benutzer ${newUser.username} wurde erfolgreich erstellt`
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
        action: 'CREATE_USER_ERROR',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
    
    return json({ 
      success: false, 
      error: 'Fehler beim Erstellen des Benutzers' 
    }, { status: 500 });
  }
};
