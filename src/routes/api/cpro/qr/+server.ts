import { json, type RequestHandler } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const GET: RequestHandler = async ({ url }) => {
	const serial = url.searchParams.get('serialnummer');
	if (!serial) {
		return json({ error: 'serialnummer fehlt' }, { status: 400 });
	}

	try {
		const item = await prisma.singleItem.findUnique({
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
};
