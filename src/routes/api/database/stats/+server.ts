import { json } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '$lib/auth';

const prisma = new PrismaClient();

export const GET = async ({ cookies }: any) => {
  try {
    // Verify authentication and authorization
    const token = cookies.get('auth-token');
    if (!token) {
      return json({ success: false, error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const tokenData = verifyToken(token);
    if (!tokenData) {
      return json({ success: false, error: 'Ungültiger Token' }, { status: 401 });
    }

    // Check if user has database access (MANAGEMENT or ADMIN)
    if (tokenData.role !== 'MANAGEMENT' && tokenData.role !== 'ADMIN') {
      return json({ success: false, error: 'Keine Berechtigung für Datenbankzugriff' }, { status: 403 });
    }

    // Get statistics from all tables
    const [
      singleItems,
      singleItemsC2,
      singleItemsCbasic,
      singleItemsKK,
      zubehoerEtiketten,
      outerKartons,
      outerKartonEntries,
      users,
      sessions
    ] = await Promise.all([
      prisma.singleItem.count(),
      prisma.singleItemC2.count(),
      prisma.singleItemCbasic.count(),
      prisma.singleItemKK.count(),
      prisma.zubehoerEtikett.count(),
      prisma.outerKarton.count(),
      prisma.outerKartonEntry.count(),
      prisma.user.count(),
      prisma.session.count()
    ]);

    const stats = {
      singleItems,
      singleItemsC2,
      singleItemsCbasic,
      singleItemsKK,
      zubehoerEtiketten,
      outerKartons,
      outerKartonEntries,
      users,
      sessions
    };

    return json({
      success: true,
      data: stats
    });

  } catch (error) {
    return json({
      success: false,
      error: 'Interner Serverfehler beim Laden der Datenbankstatistiken'
    }, { status: 500 });
  }
};
