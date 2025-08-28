import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PrismaClient } from '@prisma/client';
import net from 'node:net';

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
  '^GFA,234,234,6,0047FFF10000003FFFFE0000027FFFFF200005FFC1FFD0000BFC7F1FE80017F3C1E7F4000FCC0019F8002FB00006FA001F6000037C007E800000BF003D0000005E00FE0000003F807A0000002F00FC0000001F80F0001C000780F80022000F80F0003E000780F0007F000780E0007F000380E0007F000380E0007F000380F0007F000780F0003E000780F80022000F80F0001C000780FC0000001F807A0000002F00FE0000003F803D0000005E007E800000BF001F6000037C002FB00006FA000FCC0019F80017F3C1E7F4000BFC7F1FE80005FFC1FFD000027FFFFF2000003FFFFE00000047FFF10000';

const CE_GFA =
  '^GFA,234,234,6,00BFA0005F8002FFA0017F8005FFA000FF8003FFA003FF8037FFA017FF802FFFA017FF805FFF802FFC003FE8005FE000BFD0005FD0007FA000BFA0007F4000BF4000FE80017F4000FE80017E4000FD00017E8000FD00007E8000FD00007D8000FD0000FFFE00FA0002FFFE80FA0002FFFE80FA0002FFFE80FA0002FFFE80FA0002FFFE80FB0000FFFE00FD00007E8000FD00007E8000FD00017E8000FE80017F4000FE80017F40007F4000BFA0007FA000BFD000BFD0005FE8003FE8005FF4005FFF802FFF802FFFA017FF8037FFA017FF8003FFA003FF8005FFA000FF8002FFA0017F8000BFA0005F80';

const INFO_GFA =
  '^GFA,234,234,6,C8003F800D80E60C000F13807973BFF0EF80BC8FFFFF1F004F7FFFFFFC8037FFFFFFFB0009FFFFFFE40006F80007F800013D805FE00000FE7FFF00000037FFFFE000001BFFCF0000001CF3BF0000001B7F4E000000193E9E0000001EF73E00000019CBDE0000001F94FF8000006E413E4000009D80FFA000037FFFFFD0000CEC00E3CC0013DFFFF3F600672FFFFFF9009EC3807E1E80790C7F81EF00F601007E1380C80000000D80B000000002004000000001808000000000003FFFFFFFFE000000000000003FFFFFFFFE003FFFFFFFFE003FFFFFFFFE003FFFFFFFFE003FFFFFFFFE003FFFFFFFFE00';

// A second set used in PUT flow (kept as-is from your original)
const HEAD_GFA_ALT =
  '^GFA,234,234,6,004FFFF90000013FFFFE4000027FFFFF200005FFC1FFD0000BFC7F1FE80017F3C1E7F4000FCC0019F8003FB00006FE001F4000017C007E800000BF003D0000005E00FE0000003F80780000000F00FC0000001F80F0001C000780F80022000F80F0003E000780F0007F000780E0007F000380E0007F000380E0007F000380F0007F000780F0003E000780F80022000F80F0001C000780FC0000001F80780000000F00FE0000003F803D0000005E007E800000BF001F4000037C003FB00006FE000FCC0019F80017F3C1E7F4000BFC7F1FE80005FFC1FFD000027FFFFF2000013FFFFE40000047FFF10000';

const CE_GFA_ALT =
  '^GFA,234,234,6,003FA000BF8002FFA000FF8005FFA005FF801BFFA00BFF8017FFA017FF802FFFA02FFF805FFC002FFF809FEF005FF400BFDC00DFDF80BFE000BFB0007F4000BFE0007E80017F4000FE80017E8000FD00017E8000FD00017EFC00FD00017D0000FC0002FFFC00FA0002FFFC80FA0002FFFC80FA0002FFFC80FA0002FFFC80F80002FFFC80FC00017FFC00FD00017D0000FD00017E8000FD00017EF800FE80017E80007E80017F40007F4000BF60007FE000BFB000BFD8005FDC00BFEF005FF7805FFA002FFE006FFFA02FFF802FFFA017FF8017FFA00BFF800BFFA005FF8001FFA000FF80007FA000BF80';

const INFO_GFA_ALT =
  '^GFA,234,234,6,D00180000D80E4303F0F138073CFFFF0EF009C3FFFFF1E804FFFFFFFF90013FFFFFFF600097FFFFFC80002F80007F000003C801FC000005F7FFFC0000017FFFC0000001BEDCFC000001CF3BC0000001B7F5C000000193E9C0000001EFF3C00000019E3DC0000003F9CFE0000004F2279000001BCC07E8000027FFFFF40000DEC01C39000139FFFE7C8006F6FFFFF72009C80003CB9007B0CFFC34E00E40300382780C80000000B803000000004804000000001000000000000003FFFFFFFFE000000000000003FFFFFFFFE003FFFFFFFFE003FFFFFFFFE003FFFFFFFFE003FFFFFFFFE003FFFFFFFFE00';

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
    const descCol = items.map((it) => `${it.artikelbezeichnung}${it.serialnummer ? `  SN: ${it.serialnummer}` : ''}`);
    const rightCol = items.map((it) => it.artikelnummer);

    // ====== GEOMETRY ======
    const M = mm(6);
    const W = 1181;
    const H = 1772;

    const qrSize = 320;
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
    const gapIcons = mm(2);
    const gapQtyDesc = mm(3);
    const rowGap = mm(3.2);
    const tableTopGap = sp11_3;

    // Right column (Artikelnummer)
    const rightColW = mm(28);
    const rightColX = W - M - rightColW + mm(5);

    // Left area width till right column
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
      const headIconX = W - M - HEAD_WDOTS;
      zplParts.push(`^FO${headIconX},${y}${HEAD_GFA}^FS`);
    }
    y += sp6_67;

    // Address
    zplParts.push(`^AZN,${H6PT},${H6PT}`, `^FO${X},${y}^FDRotoclear GmbH^FS`); y += sp2;
    zplParts.push(`^AZN,${H6PT},${H6PT}`, `^FO${X},${y}^FDCarl-Benz-Strasse 10–12^FS`); y += sp2;
    zplParts.push(`^AZN,${H6PT},${H6PT}`, `^FO${X},${y}^FD69115 Heidelberg^FS`); y += sp2;
    zplParts.push(`^AZN,${H6PT},${H6PT}`, `^FO${X},${y}^FDGermany^FS`); y += sp3_17;

    // Website
    zplParts.push(`^AZN,${H6PT},${H6PT}`, `^FO${X},${y}^FDwww.rotoclear.com^FS`);
    y += sp3_17;

    // CE + INFO icons
    {
      let iconX = X;
      zplParts.push(`^FO${iconX},${y}${CE_GFA}^FS`);
      iconX += iconWdots + gapIcons;
      zplParts.push(`^FO${iconX},${y}${INFO_GFA}^FS`);
      y += iconHdots + sp3_295;
    }

    // Tagline
    zplParts.push(`^AZN,${H6PT},${H6PT}`, `^FO${X},${y}^FDDesigned and made in Germany^FS`);
    y += tableTopGap;

    // Header row
    zplParts.push(
      `^AZN,${H6PT},${H6PT}`,
      `^FO${descColX},${y}^FB${descColW},1,0,C,0^FDArtikel^FS`,
      `^FO${rightColX},${y}^FB${rightColW},1,0,L,0^FDArtikelnummer^FS`,
      `^FO${X},${y + mm(3)}^GB${W - 2 * M},2,2^FS`
    );
    y += mm(6);

    // QR (ZPL native)
    zplParts.push(`^FO${qrX},${qrY}^BQN,2,4^FDLA,${qrContent}^FS`);

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
    const descCol = items.map((it) => `${it.artikelbezeichnung}${it.serialnummer ? `  SN: ${it.serialnummer}` : ''}`);
    const rightCol = items.map((it) => it.artikelnummer);

    const qrContent =
      [`ZUBEHOER: ${lieferscheinnummer.trim()} `]
        .concat(items.map((i) => `${i.artikelnummer} - ${i.artikelbezeichnung} - ${i.menge}`))
        .join('\n');

    const M = mm(6);
    const W = 1181;
    const H = 1772;

    const qrSize = 320;
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

    const gapIcons = mm(2);
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
    zplParts.push(`^FO${qrX},${qrY}^BQN,2,4^FDLA,${qrContent}^FS`);

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
