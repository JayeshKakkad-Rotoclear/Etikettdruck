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
const DEFAULT_PRINTER_IP = '10.50.8.113';
const PRINTER_PORT = 9100; // Standard ZPL port

async function sendToPrinter(zplData: string, printerIp?: string): Promise<boolean> {
	const targetIp = printerIp || DEFAULT_PRINTER_IP;
	return new Promise((resolve, reject) => {
		const client = new net.Socket();
		
		client.connect(PRINTER_PORT, targetIp, () => {
			client.write(zplData);
			
			// Close connection immediately after sending data
			// Zebra printers often don't send responses for simple print jobs
			setTimeout(() => {
				client.destroy();
				resolve(true);
			}, 1000); // Wait 1 second then close
		});
		
		client.on('data', (data) => {
			client.destroy();
			resolve(true);
		});
		
		client.on('close', () => {
			resolve(true);
		});
		
		client.on('error', (err) => {
			client.destroy();
			reject(err);
		});
		
		// Reduce timeout and handle it better
		client.setTimeout(5000, () => {
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

		// Build table text for professional ZPL formatting (matching Zubehör style)
		const tableLines = outerKarton.entries.map((item) => {
			return `${item.menge} - ${item.artikelbezeichnung} - ${item.artikelnummer}${item.serialnummer ? ` (SN: ${item.serialnummer})` : ''}`;
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

		// Helper function to convert mm to ZPL dots (8 dots per mm)
		const mm = (millimeters: number) => Math.round(millimeters * 8);

		// Professional label dimensions and spacing (matching Zubehör style)
		const W = 1181; // Width
		const H = 1772; // Height  
		const M = mm(6); // Margin

		// Typography sizes
		const H12PT = 50;
		const H6PT = 25;

		// Professional spacing
		const sp6_67 = mm(9.67);
		const sp3_17 = mm(3.17);
		const sp3_295 = mm(3.295);
		const sp11_3 = mm(11.3);
		const sp2 = mm(2);
		const rowGap = mm(3.2);
		const tableTopGap = sp11_3;

		// Content positioning
		const X = M;
		let y = M;

		// Table column setup
		const rightColW = mm(28);
		const rightColX = W - M - rightColW + mm(5);
		const leftAreaW = rightColX - X;
		const qtyColW = mm(6);
		const rightGutter = mm(1);
		const descColX = X + qtyColW + mm(3);
		const descColW = leftAreaW - qtyColW - mm(3) - rightGutter;

		const zplParts: string[] = [
			'^XA', '^CI28', '^PON', '^FWN',
			'^LH0,0',
			`^PW${W}`, `^LL${H}`, '^LS0',
			'^CWZ,E:TT0003M_.TTF'
		];

		// Header with professional styling
		zplParts.push(`^AZN,${H12PT},${H12PT}`, `^FO${X},${y}^FDRotoclear Outer Karton^FS`);
		y += sp6_67;

		// Company address block
		zplParts.push(`^AZN,${H6PT},${H6PT}`, `^FO${X},${y}^FDRotoclear GmbH^FS`); y += sp2;
		zplParts.push(`^AZN,${H6PT},${H6PT}`, `^FO${X},${y}^FDCarl-Benz-Strasse 10–12^FS`); y += sp2;
		zplParts.push(`^AZN,${H6PT},${H6PT}`, `^FO${X},${y}^FD69115 Heidelberg^FS`); y += sp2;
		zplParts.push(`^AZN,${H6PT},${H6PT}`, `^FO${X},${y}^FDGermany^FS`); y += sp3_17;

		// Website
		zplParts.push(`^AZN,${H6PT},${H6PT}`, `^FO${X},${y}^FDwww.rotoclear.com^FS`);
		y += sp3_295;

		// Verpackungsdatum
		zplParts.push(`^AZN,${H6PT},${H6PT}`, `^FO${X},${y}^FDVerpackungsdatum: ${verpackungsdatum}^FS`);
		y += sp3_17;

		// Lieferschein if available
		if (outerKarton.lieferscheinNumber) {
			zplParts.push(`^AZN,${H6PT},${H6PT}`, `^FO${X},${y}^FDLieferschein: ${outerKarton.lieferscheinNumber}^FS`);
			y += sp3_17;
		}

		// QR code positioning (right side to match Zubehör layout)
		const qrSize = 320;
		const qrXRight = W - M - qrSize;
		const qrY = M + mm(9);
		zplParts.push(`^FO${qrXRight},${qrY}`, gfa + '^FS');

		// Tagline
		zplParts.push(`^AZN,${H6PT},${H6PT}`, `^FO${X},${y}^FDDesigned and made in Germany^FS`);
		y += tableTopGap;

		// Professional table header
		zplParts.push(
			`^AZN,${H6PT},${H6PT}`,
			`^FO${X},${y}^FB${qtyColW},1,0,L,0^FDMenge^FS`,
			`^FO${descColX},${y}^FB${descColW},1,0,L,0^FDArtikel^FS`,
			`^FO${rightColX},${y}^FB${rightColW},1,0,L,0^FDArtikelnummer^FS`,
			`^FO${X},${y + mm(3)}^GB${W - 2 * M},2,2^FS` // Header underline
		);
		y += mm(6);

		// Table content with proper formatting
		zplParts.push(`^AZN,${H6PT},${H6PT}`);
		tableLines.forEach((line, i) => {
			const ry = y + i * rowGap;
			const parts = line.split(' - ');
			if (parts.length >= 3) {
				const menge = parts[0];
				const bezeichnung = parts[1];
				const artikelnummer = parts[2];
				
				zplParts.push(
					`^FO${X},${ry}^FB${qtyColW},1,0,L,0^FD${menge}^FS`,
					`^FO${descColX},${ry}^FB${descColW},1,0,L,0^FD${bezeichnung}^FS`,
					`^FO${rightColX},${ry}^FB${rightColW},1,0,L,0^FD${artikelnummer}^FS`
				);
			} else {
				// Fallback for lines that don't follow expected format
				zplParts.push(`^FO${descColX},${ry}^FB${descColW + rightColW},1,0,L,0^FD${line}^FS`);
			}
		});

		zplParts.push('^XZ');
		const zpl = zplParts.join('\r\n');

		try {
			await sendToPrinter(zpl, body.printerIp);
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
