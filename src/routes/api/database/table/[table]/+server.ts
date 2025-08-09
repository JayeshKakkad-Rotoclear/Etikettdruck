import { json } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '$lib/auth';

const prisma = new PrismaClient();

export const GET = async ({ params, url, cookies }: any) => {
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

    const { table } = params;
    const page = parseInt(url.searchParams.get('page') || '1');
    const size = parseInt(url.searchParams.get('size') || '50');
    const search = url.searchParams.get('search') || '';
    
    const skip = (page - 1) * size;

    let items: any[] = [];
    let totalCount = 0;

    // Build search filter
    const searchFilter = search ? {
      OR: [
        { serialnummer: { contains: search, mode: 'insensitive' as const } },
        { artikel_bezeichnung: { contains: search, mode: 'insensitive' as const } },
        { artikel_nummer: { contains: search, mode: 'insensitive' as const } }
      ]
    } : {};

    switch (table) {
      case 'cpro':
        [items, totalCount] = await Promise.all([
          prisma.singleItem.findMany({
            where: searchFilter,
            skip,
            take: size,
            orderBy: { id: 'desc' },
            select: {
              id: true,
              serialnummer: true,
              artikel_bezeichnung: true,
              artikel_nummer: true,
              konfiguration: true,
              pruefer_a: true,
              pruefer_b: true,
              datum: true
            }
          }),
          prisma.singleItem.count({ where: searchFilter })
        ]);
        // Map to consistent format
        items = items.map((item: any) => ({
          ...item,
          createdAt: item.datum,
          updatedAt: item.datum
        }));
        break;

      case 'c2':
        [items, totalCount] = await Promise.all([
          prisma.singleItemC2.findMany({
            where: searchFilter,
            skip,
            take: size,
            orderBy: { id: 'desc' },
            select: {
              id: true,
              serialnummer: true,
              artikel_bezeichnung: true,
              artikel_nummer: true,
              konfiguration: true,
              pruefer_a: true,
              pruefer_b: true,
              datum: true
            }
          }),
          prisma.singleItemC2.count({ where: searchFilter })
        ]);
        // Map to consistent format
        items = items.map((item: any) => ({
          ...item,
          createdAt: item.datum,
          updatedAt: item.datum
        }));
        break;

      case 'cbasic':
        [items, totalCount] = await Promise.all([
          prisma.singleItemCbasic.findMany({
            where: searchFilter,
            skip,
            take: size,
            orderBy: { id: 'desc' },
            select: {
              id: true,
              serialnummer: true,
              artikel_bezeichnung: true,
              artikel_nummer: true,
              pruefer_a: true,
              pruefer_b: true,
              datum: true
            }
          }),
          prisma.singleItemCbasic.count({ where: searchFilter })
        ]);
        // Map to consistent format
        items = items.map((item: any) => ({
          ...item,
          konfiguration: 'C Basic',
          createdAt: item.datum,
          updatedAt: item.datum
        }));
        break;

      case 'kk':
        [items, totalCount] = await Promise.all([
          prisma.singleItemKK.findMany({
            where: searchFilter,
            skip,
            take: size,
            orderBy: { id: 'desc' },
            select: {
              id: true,
              serialnummer: true,
              artikel_bezeichnung: true,
              artikel_nummer: true,
              konfiguration: true,
              pruefer_a: true,
              pruefer_b: true,
              datum: true
            }
          }),
          prisma.singleItemKK.count({ where: searchFilter })
        ]);
        // Map to consistent format
        items = items.map((item: any) => ({
          ...item,
          createdAt: item.datum,
          updatedAt: item.datum
        }));
        break;

      case 'zubehoer':
        [items, totalCount] = await Promise.all([
          prisma.zubehoerEtikett.findMany({
            where: search ? {
              serialnummer: { contains: search, mode: 'insensitive' as const }
            } : {},
            skip,
            take: size,
            orderBy: { id: 'desc' },
            select: {
              id: true,
              serialnummer: true,
              created_at: true,
              entries: true
            }
          }),
          prisma.zubehoerEtikett.count({ 
            where: search ? {
              serialnummer: { contains: search, mode: 'insensitive' as const }
            } : {}
          })
        ]);
        // Map to consistent format
        items = items.map((item: any) => ({
          id: item.id,
          serialnummer: item.serialnummer || 'N/A',
          artikel_bezeichnung: 'Zubehör Etikett',
          artikel_nummer: 'N/A',
          konfiguration: 'Etikett',
          pruefer_a: null,
          pruefer_b: null,
          createdAt: item.created_at,
          updatedAt: item.created_at
        }));
        break;

      case 'kartons':
        [items, totalCount] = await Promise.all([
          prisma.outerKarton.findMany({
            skip,
            take: size,
            orderBy: { id: 'desc' },
            select: {
              id: true,
              createdAt: true
            }
          }),
          prisma.outerKarton.count()
        ]);
        // Map to consistent format
        items = items.map((item: any) => ({
          id: item.id,
          serialnummer: `Karton-${item.id}`,
          artikel_bezeichnung: 'Äußerer Karton',
          artikel_nummer: 'N/A',
          konfiguration: 'Karton',
          pruefer_a: null,
          pruefer_b: null,
          createdAt: item.createdAt,
          updatedAt: item.createdAt
        }));
        break;

      case 'karton_entries':
        [items, totalCount] = await Promise.all([
          prisma.outerKartonEntry.findMany({
            where: search ? {
              OR: [
                { serialnummer: { contains: search, mode: 'insensitive' as const } },
                { artikelnummer: { contains: search, mode: 'insensitive' as const } }
              ]
            } : {},
            skip,
            take: size,
            orderBy: { id: 'desc' },
            select: {
              id: true,
              serialnummer: true,
              artikelnummer: true,
              artikelbezeichnung: true,
              menge: true
            }
          }),
          prisma.outerKartonEntry.count({
            where: search ? {
              OR: [
                { serialnummer: { contains: search, mode: 'insensitive' as const } },
                { artikelnummer: { contains: search, mode: 'insensitive' as const } }
              ]
            } : {}
          })
        ]);
        // Map to consistent format
        items = items.map((item: any) => ({
          id: item.id,
          serialnummer: item.serialnummer || 'N/A',
          artikel_bezeichnung: item.artikelbezeichnung,
          artikel_nummer: item.artikelnummer,
          konfiguration: `Menge: ${item.menge}`,
          pruefer_a: null,
          pruefer_b: null,
          createdAt: null,
          updatedAt: null
        }));
        break;

      default:
        return json({ success: false, error: 'Unbekannte Tabelle' }, { status: 400 });
    }

    const totalPages = Math.ceil(totalCount / size);

    return json({
      success: true,
      data: {
        items,
        totalPages,
        currentPage: page,
        totalCount
      }
    });

  } catch (error) {
    console.error('Database table error:', error);
    return json({
      success: false,
      error: 'Interner Serverfehler beim Laden der Tabellendaten'
    }, { status: 500 });
  }
};
