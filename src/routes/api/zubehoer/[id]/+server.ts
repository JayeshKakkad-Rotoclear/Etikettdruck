import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET({ params }: RequestEvent) {
	try {
		const id = params.id;
		
		if (!id) {
			return json({ success: false, error: 'Zubehör ID is required' }, { status: 400 });
		}

		const zubehoerId = parseInt(id);
		
		if (isNaN(zubehoerId)) {
			return json({ success: false, error: 'Invalid Zubehör ID' }, { status: 400 });
		}

		const item = await prisma.zubehoerEtikett.findUnique({
			where: { id: zubehoerId }
		});

		if (!item) {
			return json({ success: false, error: 'Zubehör item not found' }, { status: 404 });
		}

		return json({ success: true, item });
	} catch (err) {
		console.error('Zubehoer individual GET error:', err);
		return json({ success: false, error: 'Internal server error' }, { status: 500 });
	}
}
