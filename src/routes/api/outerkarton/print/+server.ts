import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import util from 'util';

const prisma = new PrismaClient();
const execAsync = util.promisify(exec);

export async function POST({ request }: RequestEvent) {
	try {
		const body = await request.json();
		const { outerKartonId } = body;

		if (!outerKartonId) {
			return json({ success: false, error: 'outerKartonId is required' }, { status: 400 });
		}

		const outerKarton = await prisma.outerKarton.findUnique({
			where: { id: outerKartonId },
			include: { entries: true }
		});

		if (!outerKarton) {
			return json({ success: false, error: 'Outer Karton not found' }, { status: 404 });
		}

		const tableText = outerKarton.entries.map((item) => {
			const mengeText = `Menge: ${item.menge}`;
			const snText = item.serialnummer ? ` SN: ${item.serialnummer}` : '';
			return `${item.artikelnummer.padEnd(10)} ${item.artikelbezeichnung.padEnd(40)} ${mengeText}${snText}`;
		}).join('\n');

		const qrContent = outerKarton.entries.map((item) =>
			`${item.artikelnummer} - ${item.menge}${item.serialnummer ? ` (${item.serialnummer})` : ''}`
		).join('\n');

		const date = new Date(outerKarton.createdAt);
		const verpackungsdatum = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1)
			.toString()
			.padStart(2, '0')}.${date.getFullYear()}`;

		const lieferscheinText = outerKarton.lieferscheinNumber 
			? `^FO50,320^FDLieferschein: ${outerKarton.lieferscheinNumber}^FS` 
			: '';

		// Generate ZPL
		const zpl = `
^XA

^CF0,40
^FO50,30^FDOuter Karton Etikett^FS

^FO50,100^BQN,2,4^FDLA${qrContent}^FS

^CF0,30
^FO50,300^FDVerpackungsdatum: ${verpackungsdatum}^FS

^CF0,25
${lieferscheinText}

^CF0,25
^FO50,${outerKarton.lieferscheinNumber ? '370' : '350'}^FDInhalt:^FS

^CF0,25
^FO50,${outerKarton.lieferscheinNumber ? '410' : '390'}^FB700,10,0,L,0^FD${tableText}^FS

^CF0,25
^FO50,550^FDwww.rotoclear.com^FS
^FO750,550^FDDesigned and made in Germany^FS

^XZ
		`.trim();

		// Print ZPL via temp file
		const tempPath = path.join(os.tmpdir(), `etikett-outerkarton-reprint-${Date.now()}.zpl`);
		await fs.writeFile(tempPath, zpl);
		await execAsync(`notepad /p "${tempPath}"`);
		await fs.unlink(tempPath);

		return json({ success: true });
	} catch (err) {
		console.error('OuterKarton print error:', err);
		return json({ success: false, error: 'Internal server error' }, { status: 500 });
	}
}
