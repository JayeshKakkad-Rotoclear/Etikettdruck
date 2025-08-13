import { json } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '$lib/auth.js';
import type { RequestHandler } from './$types';

const prisma = new PrismaClient();

export const POST: RequestHandler = async ({ request }) => {
  try {
    // First check if setup is still needed
    const adminCount = await prisma.user.count({
      where: { role: 'ADMIN' }
    });

    if (adminCount > 0) {
      return json({ 
        success: false, 
        error: 'Setup bereits abgeschlossen' 
      }, { status: 400 });
    }

    const { username, email, password, firstName, lastName } = await request.json();

    // Validate input
    if (!username || !email || !password || !firstName || !lastName) {
      return json({ 
        success: false, 
        error: 'Alle Felder sind erforderlich' 
      }, { status: 400 });
    }

    if (password.length < 6) {
      return json({ 
        success: false, 
        error: 'Passwort muss mindestens 6 Zeichen lang sein' 
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
      return json({ 
        success: false, 
        error: 'Benutzername oder E-Mail bereits vergeben' 
      }, { status: 400 });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        firstName,
        lastName,
        role: 'ADMIN',
        status: 'ACTIVE'
      }
    });

    return json({
      success: true,
      message: 'Administrator erfolgreich erstellt',
      user: {
        id: adminUser.id,
        username: adminUser.username,
        email: adminUser.email,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        role: adminUser.role
      }
    });
  } catch (error) {
    return json({ 
      success: false, 
      error: 'Fehler beim Erstellen des Administrators' 
    }, { status: 500 });
  }
};
