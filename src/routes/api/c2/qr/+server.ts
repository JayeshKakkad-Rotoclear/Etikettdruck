import { json } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET({ url }) {
    const serial = url.searchParams.get('serialnummer');
    if (!serial) {
        return json({ error: 'serialnummer fehlt' }, { status: 400 });
    }

    try {
        const item = await prisma.singleItemC2.findUnique({
            where: { serialnummer: serial },
            select: { qr_code_automatiktest: true }
        });

        if (!item || !item.qr_code_automatiktest) {
            return json({ qr_code: null });
        }

        return json({ qr_code: item.qr_code_automatiktest });
    } catch (error) {
        return json({ error: 'Interner Fehler' }, { status: 500 });
    }
}
