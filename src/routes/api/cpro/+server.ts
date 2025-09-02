import { json } from '@sveltejs/kit';
import { PrismaClient, KonfigurationCPro, Festplattengroesse, FreierFestplattenspeicher } from '@prisma/client';
import net from 'node:net';
import type { RequestHandler } from './$types';
import QRCode from 'qrcode';
import { PNG } from 'pngjs';

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
const DEFAULT_PRINTER_IP = '10.50.8.113';
const PRINTER_PORT = 9100; // Standard ZPL port

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

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) return json({ success: false, error: 'Authentication required' }, { status: 401 });

  try {
    const body = await request.json();

    const result = await prisma.singleItem.create({
      data: {
        artikel_bezeichnung: body.artikel_bezeichnung,
        serialnummer: body.serialnummer,
        hinweis: body.hinweis,
        ba_nummer: body.ba_nummer,
        artikel_nummer: body.artikel_nummer,
        software_version: body.software_version,
        konfiguration: body.konfiguration as KonfigurationCPro,
        seriennummer_elektronik: body.seriennummer_elektronik,
        mac_adresse: body.mac_adresse,
        seriennummer_festplatte: body.seriennummer_festplatte,
        festplattengroesse: body.festplattengroesse as Festplattengroesse,
        datum: new Date(body.datum),
        produktionsjahr: body.produktionsjahr,
        pruefer_a: body.pruefer_a,
        hardware_ok: body.hardware_ok,
        hdmi_ok: body.hdmi_ok,
        web_ok: body.web_ok,
        zoom_ok: body.zoom_ok,
        menue_bedienbar: body.menue_bedienbar,
        festplatte_angezeigt: body.festplatte_angezeigt,
        freier_festplattenspeicher: body.freier_festplattenspeicher as FreierFestplattenspeicher,
        ip_adresse: body.ip_adresse,
        kameraeingang_ok: body.kameraeingang_ok,
        zustandsdaten_ok: body.zustandsdaten_ok,
        zustandsdaten_fehler: body.zustandsdaten_fehler,
        festplatte_leer: body.festplatte_leer
      }
    });

    return json({ success: true, itemId: result.id });
  } catch (error) {
    return json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
};

export const GET: RequestHandler = async ({ url, locals }) => {
  if (!locals.user) return json({ success: false, error: 'Authentication required' }, { status: 401 });

  const serial = url.searchParams.get('serialnummer');

  if (serial) {
    const item = await prisma.singleItem.findFirst({ where: { serialnummer: serial } });
    if (!item) return json({ found: false });
    return json({ found: true, item });
  } else {
    const allItems = await prisma.singleItem.findMany({ orderBy: { id: 'asc' } });
    return json({ success: true, items: allItems });
  }
};

export const PUT: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) return json({ success: false, error: 'Authentication required' }, { status: 401 });

  try {
    const body = await request.json();

    const updated = await prisma.singleItem.update({
      where: { serialnummer: body.serialnummer },
      data: {
        artikel_bezeichnung: body.artikel_bezeichnung,
        hinweis: body.hinweis,
        ba_nummer: body.ba_nummer,
        artikel_nummer: body.artikel_nummer,
        software_version: body.software_version,
        konfiguration: body.konfiguration as KonfigurationCPro,
        seriennummer_elektronik: body.seriennummer_elektronik,
        mac_adresse: body.mac_adresse,
        seriennummer_festplatte: body.seriennummer_festplatte,
        festplattengroesse: body.festplattengroesse as Festplattengroesse,
        datum: new Date(body.datum),
        produktionsjahr: body.produktionsjahr,
        pruefer_b: body.pruefer_b,
        hardware_ok: body.hardware_ok,
        hdmi_ok: body.hdmi_ok,
        web_ok: body.web_ok,
        zoom_ok: body.zoom_ok,
        menue_bedienbar: body.menue_bedienbar,
        festplatte_angezeigt: body.festplatte_angezeigt,
        freier_festplattenspeicher: body.freier_festplattenspeicher as FreierFestplattenspeicher,
        ip_adresse: body.ip_adresse,
        kameraeingang_ok: body.kameraeingang_ok,
        zustandsdaten_ok: body.zustandsdaten_ok,
        zustandsdaten_fehler: body.zustandsdaten_fehler,
        automatiktest_ok: body.automatiktest_ok,
        qr_code_automatiktest: body.qr_code_automatiktest,
        werkseinstellung: body.werkseinstellung,
        lp_verschraubt: body.lp_verschraubt,
        festplatte_leer: body.festplatte_leer
      }
    });

    if (!body.skipPrint) {
      // ----- ZPL generation (as in your original) -----
      const formattedDate = new Date(body.datum).toISOString().split('T')[0];

      const normalizeAscii = (s: string) =>
        s?.replace(/\u2013|\u2014/g, '-').replace(/[^\x20-\x7E]/g, '').trim() ?? '';

      const normalizeMac = (s: string) => {
        if (!s) return '';
        const hex = s.replace(/[^0-9a-fA-F]/g, '').toUpperCase();
        if (hex.length !== 12) return normalizeAscii(s).toUpperCase();
        return hex.match(/.{2}/g)!.join(':');
      };

      const serialnummer = normalizeAscii(body.serialnummer);
      const artikel_bezeichnung = normalizeAscii(body.artikel_bezeichnung);
      const seriennummer_elektronik = normalizeAscii(body.seriennummer_elektronik);
      const mac_adresse = normalizeMac(body.mac_adresse);
      const seriennummer_festplatte = normalizeAscii(body.seriennummer_festplatte);
      const software_version = normalizeAscii(body.software_version);

      const qrData =
        `SN: ${serialnummer} \n` +
        `ART: ${artikel_bezeichnung} \n` +
        `ARTN: ${body.artikel_nummer} \n` +
        `ELE: ${seriennummer_elektronik} \n` +
        `MAC: ${mac_adresse} \n` +
        `HDD: ${seriennummer_festplatte} \n` +
        `SW: ${software_version} \n` +
        `DAT: ${formattedDate} \n`;

      const mm = (n: number) => Math.round(n * 12);

      const iconWdots = Math.round(3.395 * 12); // ≈41 dots
      const iconHdots = Math.round(3.295 * 12); // ≈39 dots
      const HEAD_WDOTS = 6 * 8;
      const HEAD_HDOTS = 39;

      const HEAD_GFA =
        '^GFA,246,246,6,0001FFC00000000FFFF80000003FFFFE0000007F80FF000001FC001FC00003F00007E00007C00001F0000F800000F8000F00000078001E0000003C003C0000001E003C0000001E00780000000F00780000000F00700000000700F00000000780F00000000780E0001C000380E0003E000380E0007F000380E0007F000380E0007F000380E0003E000380E0001C000380F00000000780F00000000780700000000700780000000F00780000000F003C0000001E003C0000001E001E0000003C000F00000078000F800000F80007C00001F00003F00007E00001FC001FC000007F80FF0000003FFFFE0000000FFFF800000001FFC00000';

      const CE_GFA =
        '^GFA,480,480,8,0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000FF0000001FF00007FF0000007FF0001FFF000001FFF0003FFF000007FFF000FFFF00000FFFF001FFFF00001FFFF003FFFA00003FFFF007FF0000007FF8000FFC000000FFC0000FF8000001FF80001FE0000001FF00003FC0000003FE00003FC0000003FC00003F80000003F800007F00000007F000007F00000007F000007F00000007F00000FE00000007E00000FE0000000FFFFE00FE0000000FFFFE00FE0000000FFFFE00FE0000000FFFFE00FE0000000FFFFE00FE0000000FFFFE00FE00000007FFFE00FF00000007E000007F00000007F000007F00000007F000007F80000003F800003FC0000003FC00003FE0000001FC00001FE0000001FE00001FF8000000FF80000FFC000000FFC00007FF0000007FF00003FFFE00003FFFA001FFFF00001FFFF000FFFF00000FFFF0007FFF000007FFF0001FFF000001FFF00007FF0000007FF00001FF0000001FF0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';

      const INFO_GFA =
        '^GFA,480,480,8,000000000000000000100000000080000018000000018000000C0000000300000004003F80060000000207F0F80C000000010FDFC79800000000BDFFFFF0000000003FFFFFF0000000000FFFFFE0000000000E0003C0000000000E0003C0000000000600034000000000060007C00000000007000E0000000000059FF6000000000004FFF60000000000046026000000000004704600000000000438860000000000021D060000000000020E040000000000020E040000000000021F04000000000002398C00000000000270CC000000000002606C000000000002C03C000000000003801C000000000003000C000000000007003E00000000000F007300000000001B006180000000003300618000000000630061C000000000C1FFF3200000000180C01E100000000100000018000000020000000C00000004000000060000000800000003000000180000000100000010000000008000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000007FFFFFFFE00000007FFFFFFFE00000007FFFFFFFE00000007FFFFFFFE00000007FFFFFFFE00000007FFFFFFFE00000007FFFFFFFE00000007FFFFFFFE00000007FFFFFFFC0000';

      // 1) Render QR to PNG and 2) Convert to ZPL ^GFA
      const qrPng = await makeQrPng(qrData, 350);
      const { gfa } = pngToZplGFA(qrPng);

      const M  = mm(6);
      const W  = 1181;
      const H  = 1772;

      const qrSize = 350;
      const qrX = W - M - qrSize;
      const qrY = M + mm(9);

      const X = M;
      let y = M;

      const H12PT = 50;
      const H6PT  = 25;

      const sp6_67   = mm(9.67);
      const sp3_17   = mm(3.17);
      const sp3_295  = mm(3.295);
      const sp11_3   = mm(11.3);
      const sp2      = mm(2);
      const sp3	  = mm(3);
      const sp2_54   = mm(2.54);
      const sp6_54   = mm(6.54);

      const gapIcons   = mm(3);
      const gapQtyDesc = mm(3);   // reduced
      const rowGap     = mm(3.2);
      const tableTopGap = sp11_3;

      const rightColW = mm(28);
      const rightColX = W - M - rightColW + mm(5);

      const leftAreaW   = rightColX - X;
      const qtyColW     = mm(6);
      const rightGutter = mm(1);
      const descColX    = X + qtyColW + gapQtyDesc;
      const descColW    = leftAreaW - qtyColW - gapQtyDesc - rightGutter;

      const zplParts: string[] = [
      '^XA', '^CI28', '^PON', '^FWN',
      '^LH0,0',
      `^PW${W}`, `^LL${H}`, '^LS0',
      '^CWZ,E:TT0003M_.TTF'
      ];

      // Header
      zplParts.push(`^AZN,${H12PT},${H12PT}`, `^FO${X},${y}^FDRotoclear C Pro^FS`);

      {
      const headIconX = W - M - HEAD_WDOTS; // within right margin
      zplParts.push(`^FO${headIconX},${y}${HEAD_GFA}^FS`);
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

      // CE + INFO icons (inline ^GFA)
      {
      let iconX = X;
      zplParts.push(`^FO${iconX},${y}${CE_GFA}^FS`);
      iconX += iconWdots + gapIcons; // 2 mm gap
      zplParts.push(`^FO${iconX},${y}${INFO_GFA}^FS`);
      y += iconHdots + sp3_295;      // advance by icon height + spacing
      }

      // Tagline
      zplParts.push(`^AZN,${H6PT},${H6PT}`, `^FO${X},${y}^FDDesigned and made in Germany^FS`);
      y += tableTopGap;

      zplParts.push(`^FO${qrX},${qrY}^GFA,${gfa}^FS`);

      // Item details (left column)
      zplParts.push(`^FO${X},${y}^AZN,${H6PT},${H6PT}^FDArtikelnummer: ${normalizeAscii(body.artikel_nummer)}^FS`); y += sp3;
      zplParts.push(`^FO${X},${y}^AZN,${H6PT},${H6PT}^FDArtikelbezeichnung: ${artikel_bezeichnung}^FS`);            y += sp3;
      zplParts.push(`^FO${X},${y}^AZN,${H6PT},${H6PT}^FDSeriennummer: ${serialnummer}^FS`);                          y += sp3;
      zplParts.push(`^FO${X},${y}^AZN,${H6PT},${H6PT}^FDVerpackungsdatum: ${formattedDate}^FS`);

      zplParts.push('^XZ');

      const zpl = zplParts.join('\r\n');

      try {
        await sendToPrinter(zpl, body.printerIp);
        console.log('Label sent to printer successfully');
      } catch (err) {
        console.error('Failed to send label to printer:', err);
      }
    }

    return json({ success: true });
  } catch (error) {
    return json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
};
