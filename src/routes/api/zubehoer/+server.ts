import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PrismaClient } from '@prisma/client';
import QRCode from 'qrcode';
import { PNG } from 'pngjs';
import net from 'node:net';

/** Render a QR to a PNG buffer (square) */
async function makeQrPng(data: string, sizePx = 350): Promise<Buffer> {
  // ECC 'M' is usually plenty; tweak margin to match ZPL ^BQN,2,4 appearance
  return QRCode.toBuffer(data, {
    type: 'png',
    errorCorrectionLevel: 'M',
    margin: 1,
    width: sizePx
  });
}

/** Convert a 1-bit monochrome PNG Buffer to ZPL ^GFA */
function pngToZplGFA(pngBuf: Buffer): { gfa: string; widthBytes: number; totalBytes: number } {
  const png = PNG.sync.read(pngBuf);
  const { width, height, data } = png; // RGBA
  const widthBytes = Math.ceil(width / 8);
  const totalBytes = widthBytes * height;

  const hexLines: string[] = [];
  for (let y = 0; y < height; y++) {
    let rowBits = '';
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx], g = data[idx + 1], b = data[idx + 2], a = data[idx + 3];

      // Convert to mono: transparent/white -> 0, dark -> 1
      const lum = (r * 299 + g * 587 + b * 114) / 1000;
      const isDark = a > 0 && lum < 128;
      rowBits += isDark ? '1' : '0';
    }
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
const DEFAULT_PRINTER_IP = process.env.PRINTER_IP || '10.50.8.113';
const PRINTER_PORT = Number(process.env.PRINTER_PORT || 9100);

async function sendToPrinter(zplData: string, printerIp?: string): Promise<boolean> {
  const targetIp = printerIp || DEFAULT_PRINTER_IP;
  return new Promise((resolve, reject) => {
    const client = new net.Socket();

    client.connect(PRINTER_PORT, targetIp, () => {
      console.log(`Connected to printer at ${targetIp}`);
      client.write(zplData);
      setTimeout(() => {
        client.destroy();
        resolve(true);
      }, 1000);
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

    client.setTimeout(5000, () => {
      console.log('Printer timeout - closing connection (data likely sent successfully)');
      client.destroy();
      resolve(true);
    });
  });
}

// --- Small helper ---
const mm = (n: number) => Math.round(n * 12);

// Inline ^GFA icons (same assets/style as other endpoints)
const iconWdots = Math.round(3.395 * 12); // ≈41 dots
const iconHdots = Math.round(3.295 * 12); // ≈39 dots
const HEAD_WDOTS = 6 * 8;
const HEAD_HDOTS = 39;

const HEAD_GFA =
  '^GFA,246,246,6,0001FFC00000000FFFF80000003FFFFE0000007F80FF000001FC001FC00003F00007E00007C00001F0000F800000F8000F00000078001E0000003C003C0000001E003C0000001E00780000000F00780000000F00700000000700F00000000780F00000000780E0001C000380E0003E000380E0007F000380E0007F000380E0007F000380E0003E000380E0001C000380F00000000780F00000000780700000000700780000000F00780000000F003C0000001E003C0000001E001E0000003C000F00000078000F800000F80007C00001F00003F00007E00001FC001FC000007F80FF0000003FFFFE0000000FFFF800000001FFC00000';

const CE_GFA =
  '^GFA,480,480,8,0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000FF0000001FF00007FF0000007FF0001FFF000001FFF0003FFF000007FFF000FFFF00000FFFF001FFFF00001FFFF003FFFA00003FFFF007FF0000007FF8000FFC000000FFC0000FF8000001FF80001FE0000001FF00003FC0000003FE00003FC0000003FC00003F80000003F800007F00000007F000007F00000007F000007F00000007F00000FE00000007E00000FE0000000FFFFE00FE0000000FFFFE00FE0000000FFFFE00FE0000000FFFFE00FE0000000FFFFE00FE0000000FFFFE00FE00000007FFFE00FF00000007E000007F00000007F000007F00000007F000007F80000003F800003FC0000003FC00003FE0000001FC00001FE0000001FE00001FF8000000FF80000FFC000000FFC00007FF0000007FF00003FFFE00003FFFA001FFFF00001FFFF000FFFF00000FFFF0007FFF000007FFF0001FFF000001FFF00007FF0000007FF00001FF0000001FF0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';

const INFO_GFA =
  '^GFA,480,480,8,000000000000000000100000000080000018000000018000000C0000000300000004003F80060000000207F0F80C000000010FDFC79800000000BDFFFFF0000000003FFFFFF0000000000FFFFFE0000000000E0003C0000000000E0003C0000000000600034000000000060007C00000000007000E0000000000059FF6000000000004FFF60000000000046026000000000004704600000000000438860000000000021D060000000000020E040000000000020E040000000000021F04000000000002398C00000000000270CC000000000002606C000000000002C03C000000000003801C000000000003000C000000000007003E00000000000F007300000000001B006180000000003300618000000000630061C000000000C1FFF3500000000180C01E100000000100000018000000020000000C00000004000000060000000800000003000000180000000100000010000000008000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000007FFFFFFFE00000007FFFFFFFE00000007FFFFFFFE00000007FFFFFFFE00000007FFFFFFFE00000007FFFFFFFE00000007FFFFFFFE00000007FFFFFFFE00000007FFFFFFFC0000';

// A second set used in PUT flow (kept as-is from your original)
const HEAD_GFA_ALT =
  '^GFA,246,246,6,0001FFC00000000FFFF80000003FFFFE0000007F80FF000001FC001FC00003F00007E00007C00001F0000F800000F8000F00000078001E0000003C003C0000001E003C0000001E00780000000F00780000000F00700000000700F00000000780F00000000780E0001C000380E0003E000380E0007F000380E0007F000380E0007F000380E0003E000380E0001C000380F00000000780F00000000780700000000700780000000F00780000000F003C0000001E003C0000001E001E0000003C000F00000078000F800000F80007C00001F00003F00007E00001FC001FC000007F80FF0000003FFFFE0000000FFFF800000001FFC00000';

const CE_GFA_ALT =
  '^GFA,480,480,8,0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000FF0000001FF00007FF0000007FF0001FFF000001FFF0003FFF000007FFF000FFFF00000FFFF001FFFF00001FFFF003FFFA00003FFFF007FF0000007FF8000FFC000000FFC0000FF8000001FF80001FE0000001FF00003FC0000003FE00003FC0000003FC00003F80000003F800007F00000007F000007F00000007F000007F00000007F00000FE00000007E00000FE0000000FFFFE00FE0000000FFFFE00FE0000000FFFFE00FE0000000FFFFE00FE0000000FFFFE00FE0000000FFFFE00FE00000007FFFE00FF00000007E000007F00000007F000007F00000007F000007F80000003F800003FC0000003FC00003FE0000001FC00001FE0000001FE00001FF8000000FF80000FFC000000FFC00007FF0000007FF00003FFFE00003FFFA001FFFF00001FFFF000FFFF00000FFFF0007FFF000007FFF0001FFF000001FFF00007FF0000007FF00001FF0000001FF0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';

const INFO_GFA_ALT =
  '^GFA,480,480,8,000000000000000000100000000080000018000000018000000C0000000300000004003F80060000000207F0F80C000000010FDFC79800000000BDFFFFF0000000003FFFFFF0000000000FFFFFE0000000000E0003C0000000000E0003C0000000000600034000000000060007C00000000007000E0000000000059FF6000000000004FFF60000000000046026000000000004704600000000000438860000000000021D060000000000020E040000000000020E040000000000021F04000000000002398C00000000000270CC000000000002606C000000000002C03C000000000003801C000000000003000C000000000007003E00000000000F007300000000001B006180000000003300618000000000630061C000000000C1FFF3500000000180C01E100000000100000018000000020000000C00000004000000060000000800000003000000180000000100000010000000008000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000007FFFFFFFE00000007FFFFFFFE00000007FFFFFFFE00000007FFFFFFFE00000007FFFFFFFE00000007FFFFFFFE00000007FFFFFFFE00000007FFFFFFFE00000007FFFFFFFC0000';

/* =========================
   GET  /api/zubehoer
   ========================= */
export const GET: RequestHandler = async ({ locals, url }) => {
  if (!locals.user) return json({ success: false, error: 'Authentication required' }, { status: 401 });

  try {
    const lieferscheinnummer = url.searchParams.get('lieferscheinnummer');
    
    if (lieferscheinnummer) {
      // Query by Lieferschein number
      const item = await prisma.zubehoerEtikett.findFirst({
        where: { lieferscheinnummer: lieferscheinnummer.trim() }
      });
      
      if (item) {
        return json({ 
          success: true, 
          found: true, 
          item: {
            id: item.id,
            lieferscheinnummer: item.lieferscheinnummer,
            entries: item.entries as any[],
            created_at: item.created_at
          }
        });
      } else {
        return json({ success: true, found: false, item: null });
      }
    } else {
      // Return all items
      const allItems = await prisma.zubehoerEtikett.findMany({
        orderBy: { id: 'asc' }
      });
      return json({ success: true, items: allItems });
    }
  } catch {
    return json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
};

/* =========================
   POST  /api/zubehoer
   body: { lieferscheinnummer: string, items: Array<{ artikelnummer, artikelbezeichnung, menge, serialnummer? }>, skipPrint?: boolean }
   ========================= */
export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) return json({ success: false, error: 'Authentication required' }, { status: 401 });

  try {
    const body = await request.json();
    const { lieferscheinnummer, items, skipPrint } = body as {
      lieferscheinnummer?: string;
      items?: Array<{ artikelnummer: string; artikelbezeichnung: string; menge: number; serialnummer?: string }>;
      skipPrint?: boolean;
    };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return json({ success: false, error: 'No items provided' }, { status: 400 });
    }

    if (!lieferscheinnummer || lieferscheinnummer.trim() === '') {
      return json({ success: false, error: 'Lieferschein-Nummer ist erforderlich' }, { status: 400 });
    }

    const existingEntry = await prisma.zubehoerEtikett.findFirst({
      where: { lieferscheinnummer: lieferscheinnummer.trim() }
    });
    if (existingEntry) {
      return json({ success: false, error: 'Lieferschein-Nummer bereits vorhanden' }, { status: 400 });
    }

    // Optional serial from C-Extender (10370)
    const cExtenderItem = items.find((item) => item.artikelnummer === '10370');
    const serialnummer = cExtenderItem?.serialnummer || null;

    await prisma.zubehoerEtikett.create({
      data: {
        serialnummer,
        lieferscheinnummer: lieferscheinnummer.trim(),
        entries: items
      }
    });

    const qrContent =
      [`ZUBEHOER: ${lieferscheinnummer.trim()} `]
        .concat(items.map((i) => `${i.artikelnummer} - ${i.artikelbezeichnung} - ${i.menge}`))
        .join('\n');

    if (skipPrint) {
      return json({ success: true, message: 'Data saved successfully' });
    }

    // ====== three-column data ======
    const qtyCol = items.map((it) => `${it.menge}×`);
    const descCol = items.map((it) => `${it.artikelbezeichnung}`);
    const rightCol = items.map((it) => `${it.artikelnummer}`);

    // 1) Render QR to PNG and 2) Convert to ZPL ^GFA
    const qrPng = await makeQrPng(qrContent, 350);
    const { gfa } = pngToZplGFA(qrPng);

    const M = mm(6);
    const W = 1181;
    const H = 1772;

    const qrSize = 350;
    const qrX = W - M - qrSize;
    const qrY = M + mm(9);

    const X = M;
    let y = M;

    const H12PT = 50;
    const H6PT = 25;

    const sp6_67 = mm(9.67);
    const sp3_17 = mm(3.17);
    const sp3_295 = mm(3.295);
    const sp11_3 = mm(11.3);
    const sp2 = mm(2);
    const sp2_54 = mm(2.54);
    const sp6_54 = mm(6.54);

    const gapIcons = mm(3);
    const gapQtyDesc = mm(3);
    const rowGap = mm(3.2);
    const tableTopGap = sp11_3;

    const rightColW = mm(28);
    const rightColX = W - M - rightColW + mm(5);

    const leftAreaW = rightColX - X;
    const qtyColW = mm(6);
    const rightGutter = mm(1);
    const descColX = X + qtyColW + gapQtyDesc;
    const descColW = leftAreaW - qtyColW - gapQtyDesc - rightGutter;

    const zplParts: string[] = [
      '^XA', '^CI28', '^PON', '^FWN',
      '^LH0,0',
      `^PW${W}`, `^LL${H}`, '^LS0',
      '^CWZ,E:TT0003M_.TTF'
    ];

    // Header
    zplParts.push(`^AZN,${H12PT},${H12PT}`, `^FO${X},${y}^FDRotoclear C-Line^FS`);
    {
      const headIconX = W - M - HEAD_WDOTS; // within right margin
      zplParts.push(`^FO${headIconX},${y}${HEAD_GFA_ALT}^FS`);
    }
    y += sp6_67;

    // Address
    zplParts.push(`^AZN,${H6PT},${H6PT}`, `^FO${X},${y}^FDRotoclear GmbH^FS`); y += sp2_54;
    zplParts.push(`^AZN,${H6PT},${H6PT}`, `^FO${X},${y}^FDCarl-Benz-Strasse 10–12^FS`); y += sp2_54;
    zplParts.push(`^AZN,${H6PT},${H6PT}`, `^FO${X},${y}^FD69115 Heidelberg^FS`); y += sp2_54;
    zplParts.push(`^AZN,${H6PT},${H6PT}`, `^FO${X},${y}^FDGermany^FS`); y += sp3_17;

    // Website
    zplParts.push(`^AZN,${H6PT},${H6PT}`, `^FO${X},${y}^FDwww.rotoclear.com^FS`);
    y += sp6_54;

    // CE + INFO icons
    {
      let iconX = X;
      zplParts.push(`^FO${iconX},${y}${CE_GFA_ALT}^FS`);
      iconX += iconWdots + gapIcons;
      zplParts.push(`^FO${iconX},${y}${INFO_GFA_ALT}^FS`);
      y += iconHdots + sp3_295;
    }

    // Tagline
    zplParts.push(`^AZN,${H6PT},${H6PT}`, `^FO${X},${y}^FDDesigned and made in Germany^FS`);
    y += tableTopGap;

    // Header row
    zplParts.push(
      `^AZN,${H6PT},${H6PT}`,
      `^FO${descColX},${y}^FB${descColW},1,0,C,0^FDArtikel^FS`,
      `^AZN,${H6PT},${H6PT}`,
      `^FO${rightColX},${y}^FB${rightColW},1,0,L,0^FDArtikelnummer^FS`,
      `^FO${X},${y + mm(3)}^GB${W - 2 * M},2,2^FS`
    );
    y += mm(6);

    // QR
    zplParts.push(`^FO${qrX},${qrY}^GFA,${gfa}^FS`);

    // Rows
    zplParts.push(`^AZN,${H6PT},${H6PT}`);
    items.forEach((_, i) => {
      const ry = y + i * rowGap;
      zplParts.push(
        `^AZN,${H6PT},${H6PT}`, `^FO${X},${ry}^FB${qtyColW},1,0,L,0^FD${qtyCol[i]}^FS`,
        `^AZN,${H6PT},${H6PT}`, `^FO${descColX},${ry}^FB${descColW},1,0,L,0^FD${descCol[i]}^FS`,
        `^AZN,${H6PT},${H6PT}`, `^FO${rightColX},${ry}^FB${rightColW},1,0,L,0^FD${rightCol[i]}^FS`
      );
    });

    zplParts.push('^XZ');

    const zpl = zplParts.join('\r\n');
    await sendToPrinter(zpl, body.printerIp);
    return json({ success: true, zpl });
  } catch (err) {
    return json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
};

/* =========================
   PUT  /api/zubehoer
   body: { lieferscheinnummer: string }
   (re-prints an existing label)
   ========================= */
export const PUT: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) return json({ success: false, error: 'Authentication required' }, { status: 401 });

  try {
    const body = await request.json();
    const { lieferscheinnummer } = body as { lieferscheinnummer?: string };

    if (!lieferscheinnummer) {
      return json({ success: false, error: 'Lieferschein-Nummer ist erforderlich' }, { status: 400 });
    }

    const existingEntry = await prisma.zubehoerEtikett.findFirst({
      where: { lieferscheinnummer: lieferscheinnummer.trim() }
    });
    if (!existingEntry) {
      return json({ success: false, error: 'Keine Einträge mit dieser Lieferschein-Nummer gefunden' }, { status: 404 });
    }

    const items = (existingEntry.entries as any[]) || [];

    const qtyCol = items.map((it) => `${it.menge}×`);
    const descCol = items.map((it) => `${it.artikelbezeichnung}`);
    const rightCol = items.map((it) => it.artikelnummer);

    const qrContent =
      [`ZUBEHOER: ${lieferscheinnummer.trim()} `]
        .concat(items.map((i) => `${i.artikelnummer} - ${i.artikelbezeichnung} - ${i.menge}`))
        .join('\n');

    // 1) Render QR to PNG and 2) Convert to ZPL ^GFA
    const qrPng = await makeQrPng(qrContent, 350);
    const { gfa } = pngToZplGFA(qrPng);

    const M = mm(6);
    const W = 1181;
    const H = 1772;

    const qrSize = 350;
    const qrX = W - M - qrSize;
    const qrY = M + mm(9);

    const X = M;
    let y = M;

    const H12PT = 50;
    const H6PT = 25;

    const sp6_67 = mm(9.67);
    const sp3_17 = mm(3.17);
    const sp3_295 = mm(3.295);
    const sp11_3 = mm(11.3);
    const sp2 = mm(2);
    const sp2_54 = mm(2.54);
    const sp6_54 = mm(6.54);

    const gapIcons = mm(3);
    const gapQtyDesc = mm(3);
    const rowGap = mm(3.2);
    const tableTopGap = sp11_3;

    const rightColW = mm(28);
    const rightColX = W - M - rightColW + mm(5);

    const leftAreaW = rightColX - X;
    const qtyColW = mm(6);
    const rightGutter = mm(1);
    const descColX = X + qtyColW + gapQtyDesc;
    const descColW = leftAreaW - qtyColW - gapQtyDesc - rightGutter;

    const zplParts: string[] = [
      '^XA', '^CI28', '^PON', '^FWN',
      '^LH0,0',
      `^PW${W}`, `^LL${H}`, '^LS0',
      '^CWZ,E:TT0003M_.TTF'
    ];

    // Header
    zplParts.push(`^AZN,${H12PT},${H12PT}`, `^FO${X},${y}^FDRotoclear C-Line^FS`);
    {
      const headIconX = W - M - HEAD_WDOTS; // within right margin
      zplParts.push(`^FO${headIconX},${y}${HEAD_GFA_ALT}^FS`);
    }
    y += sp6_67;

    // Address
    zplParts.push(`^AZN,${H6PT},${H6PT}`, `^FO${X},${y}^FDRotoclear GmbH^FS`); y += sp2_54;
    zplParts.push(`^AZN,${H6PT},${H6PT}`, `^FO${X},${y}^FDCarl-Benz-Strasse 10–12^FS`); y += sp2_54;
    zplParts.push(`^AZN,${H6PT},${H6PT}`, `^FO${X},${y}^FD69115 Heidelberg^FS`); y += sp2_54;
    zplParts.push(`^AZN,${H6PT},${H6PT}`, `^FO${X},${y}^FDGermany^FS`); y += sp3_17;

    // Website
    zplParts.push(`^AZN,${H6PT},${H6PT}`, `^FO${X},${y}^FDwww.rotoclear.com^FS`);
    y += sp6_54;

    // CE + INFO icons
    {
      let iconX = X;
      zplParts.push(`^FO${iconX},${y}${CE_GFA_ALT}^FS`);
      iconX += iconWdots + gapIcons;
      zplParts.push(`^FO${iconX},${y}${INFO_GFA_ALT}^FS`);
      y += iconHdots + sp3_295;
    }

    // Tagline
    zplParts.push(`^AZN,${H6PT},${H6PT}`, `^FO${X},${y}^FDDesigned and made in Germany^FS`);
    y += tableTopGap;

    // Header row
    zplParts.push(
      `^AZN,${H6PT},${H6PT}`,
      `^FO${descColX},${y}^FB${descColW},1,0,C,0^FDArtikel^FS`,
      `^AZN,${H6PT},${H6PT}`,
      `^FO${rightColX},${y}^FB${rightColW},1,0,L,0^FDArtikelnummer^FS`,
      `^FO${X},${y + mm(3)}^GB${W - 2 * M},2,2^FS`
    );
    y += mm(6);

    // QR
    zplParts.push(`^FO${qrX},${qrY}^GFA,${gfa}^FS`);

    // Rows
    zplParts.push(`^AZN,${H6PT},${H6PT}`);
    items.forEach((_, i) => {
      const ry = y + i * rowGap;
      zplParts.push(
        `^AZN,${H6PT},${H6PT}`, `^FO${X},${ry}^FB${qtyColW},1,0,L,0^FD${qtyCol[i]}^FS`,
        `^AZN,${H6PT},${H6PT}`, `^FO${descColX},${ry}^FB${descColW},1,0,L,0^FD${descCol[i]}^FS`,
        `^AZN,${H6PT},${H6PT}`, `^FO${rightColX},${ry}^FB${rightColW},1,0,L,0^FD${rightCol[i]}^FS`
      );
    });

    zplParts.push('^XZ');

    const zpl = zplParts.join('\r\n');
    await sendToPrinter(zpl, body.printerIp);
    return json({ success: true, zpl });
  } catch {
    return json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
};
