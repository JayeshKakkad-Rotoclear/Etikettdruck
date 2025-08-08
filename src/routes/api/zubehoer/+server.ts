import { json } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);
const prisma = new PrismaClient();

export async function GET() {
	try {
		const allItems = await prisma.zubehoerEtikett.findMany({
			orderBy: { id: 'asc' }
		});

		return json({ success: true, items: allItems });
	} catch (err) {
		console.error('Zubehoer GET error:', err);
		return json({ success: false, error: 'Internal server error' }, { status: 500 });
	}
}


export async function POST({ request }) {
	try {
		const body = await request.json();
		const { serialnummer, items } = body;

		if (!items || !Array.isArray(items) || items.length === 0) {
			return json({ success: false, error: 'No items provided' }, { status: 400 });
		}

		await prisma.zubehoerEtikett.create({
			data: {
				serialnummer: serialnummer || null,
				entries: items
			}
		});

		const tableText = items.map((item) =>
			`${item.artikelnummer.padEnd(10)} ${item.artikelbezeichnung.padEnd(40)} Menge: ${item.menge}`
		).join('\n');

        const qrContent = [
            ...(serialnummer ? [`Serialnummer: ${serialnummer}`] : []),
            ...items.map(i => `${i.artikelnummer} - ${i.artikelbezeichnung} - ${i.menge}`)
        ].join('\n');

		const zpl = `
^XA

^CF0,40
^FO50,30^FDZubehör Etikett^FS

^FO50,100^BQN,2,4^FDMA${qrContent}^FS

^CF0,25
^FO350,90^FB700,10,0,L,0^FD${tableText}^FS

^CF0,25
^FO50,550^FDwww.rotoclear.com^FS
^FO750,550^FDDesigned and made in Germany^FS

^XZ
		`.trim();

		const tempPath = path.join(os.tmpdir(), `etikett-zubehoer-${Date.now()}.zpl`);
		await fs.writeFile(tempPath, zpl);
		await execAsync(`notepad /p "${tempPath}"`);
		await fs.unlink(tempPath);

		return json({ success: true });
	} catch (err) {
		console.error('Zubehoer POST error:', err);
		return json({ success: false, error: 'Internal server error' }, { status: 500 });
	}
}
