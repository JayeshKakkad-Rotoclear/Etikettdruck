// File: src/routes/api/cpro/stats/+server.ts
import { json } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
	try {
		const prueferAGroup = await prisma.singleItemC2.groupBy({
			by: ['pruefer_a'],
			_count: { id: true },
			where: { pruefer_a: { not: null } }
		});

		const prueferBGroup = await prisma.singleItemC2.groupBy({
			by: ['pruefer_b'],
			_count: { id: true },
			where: { pruefer_b: { not: null } }
		});

		return json({ prueferA: prueferAGroup, prueferB: prueferBGroup });
	} catch (error) {
		console.error('C2 Stats Error:', error);
		return json({ error: 'Failed to fetch C2 stats' }, { status: 500 });
	}
}
