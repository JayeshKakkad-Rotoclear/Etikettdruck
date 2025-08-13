import { json } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);
const prisma = new PrismaClient();

export async function GET({ url }) {
	try {
		const lieferscheinnummer = url.searchParams.get('lieferscheinnummer');

		if (!lieferscheinnummer) {
			return json({ success: false, error: 'Lieferschein-Nummer ist erforderlich' }, { status: 400 });
		}

		// Find the existing entry
		const existingEntry = await prisma.zubehoerEtikett.findFirst({
			where: { lieferscheinnummer: lieferscheinnummer.trim() }
		});

		if (!existingEntry) {
			return json({ success: false, error: 'Keine Einträge mit dieser Lieferschein-Nummer gefunden' }, { status: 404 });
		}

		const items = existingEntry.entries as any[];
		const serialnummer = existingEntry.serialnummer;

		// Generate the label content
		const tableText = items.map((item) =>
			`${item.artikelnummer.padEnd(10)} ${item.artikelbezeichnung.padEnd(40)} Menge: ${item.menge}`
		).join('\n');

        const qrContent = [
            `Lieferschein: ${lieferscheinnummer.trim()}`,
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

		// Print the label
		const tempPath = path.join(os.tmpdir(), `etikett-zubehoer-reprint-${Date.now()}.zpl`);
		await fs.writeFile(tempPath, zpl);
		await execAsync(`notepad /p "${tempPath}"`);
		await fs.unlink(tempPath);

		return json({ success: true });
	} catch (err) {
		return json({ success: false, error: 'Internal server error' }, { status: 500 });
	}
}
