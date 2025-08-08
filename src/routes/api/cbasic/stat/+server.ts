import { json } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
	try {
		const prueferAGroup = await prisma.singleItemCbasic.groupBy({
			by: ['pruefer_a'],
			_count: { id: true },
			where: { pruefer_a: { not: null } }
		});

		const prueferBGroup = await prisma.singleItemCbasic.groupBy({
			by: ['pruefer_b'],
			_count: { id: true },
			where: { pruefer_b: { not: null } }
		});

		return json({ prueferA: prueferAGroup, prueferB: prueferBGroup });
	} catch (error) {
		console.error('CBasic Stats Error:', error);
		return json({ error: 'Failed to fetch C Basic stats' }, { status: 500 });
	}
}
