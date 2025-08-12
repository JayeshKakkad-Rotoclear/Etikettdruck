import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET({ url }: RequestEvent) {
	try {
		const lieferschein = url.searchParams.get('lieferschein');
		
		if (!lieferschein) {
			return json({ success: false, error: 'Lieferschein parameter is required' }, { status: 400 });
		}

		const item = await prisma.outerKarton.findFirst({
			where: {
				lieferscheinNumber: lieferschein
			},
			include: { entries: true }
		});

		return json({ success: true, item });
	} catch (err) {
		console.error('OuterKarton search error:', err);
		return json({ success: false, error: 'Internal server error' }, { status: 500 });
	}
}
