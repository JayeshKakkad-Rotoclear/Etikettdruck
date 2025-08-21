import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';
import net from 'net';
import QRCode from 'qrcode';
import { PNG } from 'pngjs';

/** Render a QR to a PNG buffer (square) */
async function makeQrPng(data: string, sizePx = 350): Promise<Buffer> {
  // ECC 'M' is usually plenty; tweak margin to match ZPL ^BQN,2,4 appearance
  return QRCode.toBuffer(data, {
    type: 'png',
    errorCorrectionLevel: 'M',
    margin: 1,  // Smaller margin to match ZPL appearance
    width: sizePx
  });
}

/** Convert a 1‑bit monochrome PNG Buffer to ZPL ^GFA */
function pngToZplGFA(pngBuf: Buffer): { gfa: string; widthBytes: number; totalBytes: number } {
  const png = PNG.sync.read(pngBuf);
  const { width, height, data } = png; // RGBA
  const widthBytes = Math.ceil(width / 8);
  const totalBytes = widthBytes * height;

  let hexLines: string[] = [];
  for (let y = 0; y < height; y++) {
    let rowBits = '';
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx], g = data[idx + 1], b = data[idx + 2], a = data[idx + 3];

      // Convert to mono: treat transparent/white as 0, dark as 1
      // Simple luminance threshold; adjust if needed (128 is a good default)
      const lum = (r * 299 + g * 587 + b * 114) / 1000;
      const isDark = a > 0 && lum < 128;
      rowBits += isDark ? '1' : '0';

      // Pack every 8 bits → one hex byte
    }
    // Pad row to full bytes
    while (rowBits.length % 8) rowBits += '0';

    let hexRow = '';
    for (let i = 0; i < rowBits.length; i += 8) {
      const byte = parseInt(rowBits.slice(i, i + 8), 2);
      hexRow += byte.toString(16).padStart(2, '0').toUpperCase();
    }
    hexLines.push(hexRow);
  }

  const gfa = `^GFA,${totalBytes},${totalBytes},${widthBytes},${hexLines.join('')}`;
  return { gfa, widthBytes, totalBytes };
}

const prisma = new PrismaClient();

// Zebra printer configuration
const PRINTER_IP = '10.50.8.113';
const PRINTER_PORT = 9100; // Standard ZPL port

async function sendToPrinter(zplData: string): Promise<boolean> {
	return new Promise((resolve, reject) => {
		const client = new net.Socket();
		
		client.connect(PRINTER_PORT, PRINTER_IP, () => {
			console.log('Connected to printer');
			client.write(zplData);
			
			// Close connection immediately after sending data
			// Zebra printers often don't send responses for simple print jobs
			setTimeout(() => {
				client.destroy();
				resolve(true);
			}, 1000); // Wait 1 second then close
		});
		
		client.on('data', (data) => {
			console.log('Printer response:', data.toString());
			client.destroy();
			resolve(true);
		});
		
		client.on('close', () => {
			console.log('Connection to printer closed');
			resolve(true);
		});
		
		client.on('error', (err) => {
			console.error('Printer connection error:', err);
			client.destroy();
			reject(err);
		});
		
		// Reduce timeout and handle it better
		client.setTimeout(5000, () => {
			console.log('Printer timeout - closing connection (data likely sent successfully)');
			client.destroy();
			resolve(true); // Resolve instead of reject since data was likely sent
		});
	});
}

export async function POST({ request }: RequestEvent) {
	try {
		const body = await request.json();
		const { entries, lieferscheinNumber } = body;

		if (!entries || !Array.isArray(entries) || entries.length === 0) {
			return json({ success: false, error: 'No entries provided' }, { status: 400 });
		}

		// Save to database
		const outerKarton = await prisma.outerKarton.create({
			data: {
				lieferscheinNumber: lieferscheinNumber || null,
				entries: {
					create: entries
				}
			},
			include: { entries: true }
		});

		// Build table text for ZPL with better formatting
		const tableLines = outerKarton.entries.map((item) => {
			const artikel = `${item.artikelnummer} - ${item.artikelbezeichnung}`;
			const menge = `Menge: ${item.menge}`;
			const sn = item.serialnummer ? `  SN: ${item.serialnummer}` : '';
			return `${artikel}  ${menge}${sn}`;
		});

		// Build QR code content
		const qrContent = outerKarton.entries.map((item) =>
			`${item.artikelnummer} - ${item.artikelbezeichnung} - ${item.menge}${item.serialnummer ? ` (${item.serialnummer})` : ''}`
		).join('\n');

		// Format current date
		const date = new Date();
		const verpackungsdatum = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1)
			.toString()
			.padStart(2, '0')}.${date.getFullYear()}`;

		// Generate QR code as image
		const qrPng = await makeQrPng(qrContent, 350);
		const { gfa } = pngToZplGFA(qrPng);

		// Calculate dynamic positions
		const baseY = 500;
		const lieferscheinY = outerKarton.lieferscheinNumber ? baseY + 100 : baseY;
		const inhaltY = outerKarton.lieferscheinNumber ? lieferscheinY + 50 : baseY + 50;
		const tableY = outerKarton.lieferscheinNumber ? inhaltY + 50 : baseY + 100;
		
		// Calculate footer position based on actual table content length
		// const tableLines = outerKarton.entries.length;
		const lineHeight = 30; // Approximate height per line in ZPL units
		const tableContentHeight = tableLines.length * lineHeight;
		const marginBetweenTableAndFooter = 100; // Fixed margin between table end and footer
		const footerStartY = tableY + tableContentHeight + marginBetweenTableAndFooter;

		// Footer content as variable
		const footer = [
			'^CF0,25',
			`^FO50,${footerStartY}^FDwww.rotoclear.com^FS`,
			`^FO650,${footerStartY}^FDDesigned and made in Germany^FS`
		];

		// Add Lieferschein number to ZPL if available
		const lieferscheinText = outerKarton.lieferscheinNumber 
			? `^FO50,${lieferscheinY}^FDLieferschein: ${outerKarton.lieferscheinNumber}^FS` 
			: '';

		// Generate ZPL with QR image
		const zpl = [
			'^XA',
			'^CI28',
			'^PON',
			'^FWN',
			'^LH0,0',
			'^LT0',
			'^LS0',
			'^PW1181',
			'^LL1772',

			'^CF0,40',
			'^FO50,30^FDOuter Karton Etikett^FS',

			// QR code as image
			'^FO50,100',
			gfa + '^FS',

			'^CF0,30',
			`^FO50,${baseY}^FDVerpackungsdatum: ${verpackungsdatum}^FS`,

			'^CF0,25',
			lieferscheinText,

			'^CF0,25',
			`^FO50,${inhaltY}^FDInhalt:^FS`,

			'^CF0,25',
			...tableLines.map((line, i) =>
			`^FO50,${tableY + i * lineHeight}^FB1000,1,0,L,0^FD${line}^FS`
			),

			'^CF0,30',
			'^FO450,100^FDRotoclear GmbH^FS',
			'^FO450,140^FDCarl-Benz-Strasse 10-12^FS',
			'^FO450,180^FD69115 Heidelberg^FS',
			'^FO450,220^FDGermany^FS',

			// Dynamic footer
			...footer,

			'^XZ'
		].join('\r\n');

		// Send to Zebra printer
		try {
			await sendToPrinter(zpl);
			console.log('Outer karton label sent to printer successfully');
		} catch (error) {
			console.error('Failed to send outer karton label to printer:', error);
			throw error;
		}

		return json({ success: true });
	} catch (err) {
		return json({ 
			success: false, 
			error: err instanceof Error ? err.message : 'Internal server error' 
		}, { status: 500 });
	}
}

export async function GET({ }: RequestEvent) {
	try {
		const items = await prisma.outerKarton.findMany({
			orderBy: { createdAt: 'desc' },
			include: { entries: true }
		});
		return json({ success: true, items });
	} catch (err) {
		return json({ success: false, error: 'Internal server error' }, { status: 500 });
	}
}
