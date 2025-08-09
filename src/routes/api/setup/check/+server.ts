import { json } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';
import type { RequestHandler } from './$types';

const prisma = new PrismaClient();

export const GET: RequestHandler = async () => {
  try {
    // Check if any admin users exist
    const adminCount = await prisma.user.count({
      where: { role: 'ADMIN' }
    });

    return json({
      success: true,
      needsSetup: adminCount === 0
    });
  } catch (error) {
    console.error('Setup check error:', error);
    return json({ 
      success: false, 
      error: 'Setup-Prüfung fehlgeschlagen' 
    }, { status: 500 });
  }
};
