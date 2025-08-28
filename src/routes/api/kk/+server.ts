import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PrismaClient, AnzahlOptiken, OptikFormat, KonfigurationKK } from '@prisma/client';
import net from 'node:net';
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

      // Close a moment later – many Zebra jobs are fire-and-forget
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

    const result = await prisma.singleItemKK.create({
      data: {
        artikel_bezeichnung: body.artikel_bezeichnung,
        serialnummer: body.serialnummer,
        hinweis: body.hinweis,
        ba_nummer: body.ba_nummer,
        artikel_nummer: body.artikel_nummer,
        firmware_version: body.firmware_version,
        seriennummer_elektronik: body.seriennummer_elektronik,
        seriennummer_optik1: body.seriennummer_optik1,
        seriennummer_optik2: body.seriennummer_optik2,
        datum: new Date(body.datum),
        produktionsjahr: body.produktionsjahr,
        konfiguration: body.konfiguration as KonfigurationKK,
        pigtail_schrumpfschlauch: body.pigtail_schrumpfschlauch,
        pigtail_drehmoment: body.pigtail_drehmoment,
        pruefer_a: body.pruefer_a,
        chargenummer: body.chargenummer,
        hardware_ok: body.hardware_ok,
        optikglas_ok: body.optikglas_ok,
        rotor_ok: body.rotor_ok,
        klebung_rotor_ok: body.klebung_rotor_ok,
        kleber_2k_ok: body.kleber_2k_ok,
        dichtring_datenkabel_eingelegt: body.dichtring_datenkabel_eingelegt,
        druckluftanscluss_montiert: body.druckluftanscluss_montiert,
        uberdrucktest_ok: body.uberdrucktest_ok,
        lichtmodul_ok: body.lichtmodul_ok,
        motor_ok: body.motor_ok,
        motor_dauerhaft_drehbar: body.motor_dauerhaft_drehbar,
        laufzeit_motor: body.laufzeit_motor,
        drucksensor_ok: body.drucksensor_ok,
        lagesensor_ok: body.lagesensor_ok,
        zustandsdaten_ok: body.zustandsdaten_ok,
        zustandsdaten_fehler: body.zustandsdaten_fehler,
        anzahl_optiken: body.anzahl_optiken as AnzahlOptiken,
        optik_format: body.optik_format as OptikFormat,
        fokuslage_ok: body.fokuslage_ok,
        optik_wechseln_funktioniert: body.optik_wechseln_funktioniert,
        siegellack_aufgebracht: body.siegellack_aufgebracht
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
    const item = await prisma.singleItemKK.findFirst({ where: { serialnummer: serial } });
    if (!item) return json({ found: false });
    return json({ found: true, item });
  } else {
    const allItems = await prisma.singleItemKK.findMany({ orderBy: { id: 'asc' } });
    return json({ success: true, items: allItems });
  }
};

export const PUT: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) return json({ success: false, error: 'Authentication required' }, { status: 401 });

  try {
    const body = await request.json();

    const updated = await prisma.singleItemKK.update({
      where: { serialnummer: body.serialnummer },
      data: {
        artikel_bezeichnung: body.artikel_bezeichnung,
        hinweis: body.hinweis,
        ba_nummer: body.ba_nummer,
        artikel_nummer: body.artikel_nummer,
        firmware_version: body.firmware_version,
        seriennummer_elektronik: body.seriennummer_elektronik,
        seriennummer_optik1: body.seriennummer_optik1,
        seriennummer_optik2: body.seriennummer_optik2,
        datum: new Date(body.datum),
        produktionsjahr: body.produktionsjahr,
        konfiguration: body.konfiguration as KonfigurationKK,
        pigtail_schrumpfschlauch: body.pigtail_schrumpfschlauch,
        pigtail_drehmoment: body.pigtail_drehmoment,
        pruefer_b: body.pruefer_b,
        chargenummer: body.chargenummer,
        hardware_ok: body.hardware_ok,
        optikglas_ok: body.optikglas_ok,
        rotor_ok: body.rotor_ok,
        klebung_rotor_ok: body.klebung_rotor_ok,
        kleber_2k_ok: body.kleber_2k_ok,
        dichtring_datenkabel_eingelegt: body.dichtring_datenkabel_eingelegt,
        druckluftanscluss_montiert: body.druckluftanscluss_montiert,
        uberdrucktest_ok: body.uberdrucktest_ok,
        lichtmodul_ok: body.lichtmodul_ok,
        motor_ok: body.motor_ok,
        motor_dauerhaft_drehbar: body.motor_dauerhaft_drehbar,
        laufzeit_motor: body.laufzeit_motor,
        drucksensor_ok: body.drucksensor_ok,
        lagesensor_ok: body.lagesensor_ok,
        zustandsdaten_ok: body.zustandsdaten_ok,
        zustandsdaten_fehler: body.zustandsdaten_fehler,
        automatiktest_ok: body.automatiktest_ok,
        qr_code_automatiktest: body.qr_code_automatiktest,
        anzahl_optiken: body.anzahl_optiken as AnzahlOptiken,
        optik_format: body.optik_format as OptikFormat,
        fokuslage_ok: body.fokuslage_ok,
        optik_wechseln_funktioniert: body.optik_wechseln_funktioniert,
        siegellack_aufgebracht: body.siegellack_aufgebracht
      }
    });

    // Only print if skipPrint is not true
    if (!body.skipPrint) {
      const formattedDate = new Date(body.datum).toISOString().split('T')[0];

      const normalizeAscii = (s: string) =>
        s?.replace(/\u2013|\u2014/g, '-').replace(/[^\x20-\x7E]/g, '').trim() ?? '';

      const serialnummer = normalizeAscii(body.serialnummer);
      const artikel_bezeichnung = normalizeAscii(body.artikel_bezeichnung);
      const seriennummer_elektronik = normalizeAscii(body.seriennummer_elektronik);
      const seriennummer_optik1 = normalizeAscii(body.seriennummer_optik1);
      const seriennummer_optik2 = body.seriennummer_optik2 ? normalizeAscii(body.seriennummer_optik2) : '';
      const firmware_version = normalizeAscii(body.firmware_version);

      const qrData =
        `SN: ${serialnummer} \n` +
        `ART: ${artikel_bezeichnung} \n` +
        `ARTN: ${body.artikel_nummer} \n` +
        `ELE: ${seriennummer_elektronik} \n` +
        `OPT1: ${seriennummer_optik1} \n` +
        (seriennummer_optik2 ? `OPT2: ${seriennummer_optik2} \n` : '') +
        `FW: ${firmware_version} \n` +
        `DAT: ${formattedDate} \n`;

      // 1) Render QR to PNG and 2) Convert to ZPL ^GFA
      const qrPng = await makeQrPng(qrData, 350);
      const { gfa } = pngToZplGFA(qrPng);

      // --- layout helpers (same as other products) ---
      const mm = (n: number) => Math.round(n * 12);

      // icons
      const iconWdots = Math.round(3.395 * 12); // ≈41
      const iconHdots = Math.round(3.295 * 12); // ≈39
      const HEAD_WDOTS = 6 * 8;
      const HEAD_HDOTS = 39;

      const HEAD_GFA =
        '^GFA,234,234,6,0047FFF10000003FFFFE0000027FFFFF200005FFC1FFD0000BFC7F1FE80017F3C1E7F4000FCC0019F8002FB00006FA001F6000037C007E800000BF003D0000005E00FE0000003F807A0000002F00FC0000001F80F0001C000780F80022000F80F0003E000780F0007F000780E0007F000380E0007F000380E0007F000380F0007F000780F0003E000780F80022000F80F0001C000780FC0000001F807A0000002F00FE0000003F803D0000005E007E800000BF001F6000037C002FB00006FA000FCC0019F80017F3C1E7F4000BFC7F1FE80005FFC1FFD000027FFFFF2000003FFFFE00000047FFF10000';

      const CE_GFA =
        '^GFA,234,234,6,00BFA0005F8002FFA0017F8005FFA000FF8003FFA003FF8037FFA017FF802FFFA017FF805FFF802FFC003FE8005FE000BFD0005FD0007FA000BFA0007F4000BF4000FE80017F4000FE80017E4000FD00017E8000FD00007E8000FD00007D8000FD0000FFFE00FA0002FFFE80FA0002FFFE80FA0002FFFE80FA0002FFFE80FA0002FFFE80FB0000FFFE00FD00007E8000FD00007E8000FD00017E8000FE80017F4000FE80017F40007F4000BFA0007FA000BFD000BFD0005FE8003FE8005FF4005FFF802FFF802FFFA017FF8037FFA017FF8003FFA003FF8005FFA000FF8002FFA0017F8000BFA0005F80';

      const INFO_GFA =
        '^GFA,234,234,6,C8003F800D80E60C000F13807973BFF0EF80BC8FFFFF1F004F7FFFFFFC8037FFFFFFFB0009FFFFFFE40006F80007F800013D805FE00000FE7FFF00000037FFFFE000001BFFCF0000001CF3BF0000001B7F4E000000193E9E0000001EF73E00000019CBDE0000001F94FF8000006E413E4000009D80FFA000037FFFFFD0000CEC00E3CC0013DFFFF3F600672FFFFFF9009EC3807E1E80790C7F81EF00F601007E1380C80000000D80B000000002004000000001808000000000003FFFFFFFFE000000000000003FFFFFFFFE003FFFFFFFFE003FFFFFFFFE003FFFFFFFFE003FFFFFFFFE003FFFFFFFFE00';

      // geometry
      const W = 1181;
      const H = 1772;
      const M = mm(6);
      const X = M;
      let y = M + mm(3);

      const H12 = 50; // header font
      const H6 = 25;  // body font

      // QR on right
      const qrSize = 350;
      const qrX = W - M - qrSize;
      const qrY = M + mm(9);

      const sp6_67 = mm(3.67);
      const sp3_17 = mm(3.17);
      const sp2 = mm(1);
      const sp3_295 = mm(3.295);
      const sp11_3 = mm(11.3);
      const sp6_54 = mm(3.54);

      const adv = (h = H6, gap = sp3_17) => { y += h + gap; };

      const zpl = [
        '^XA',
        '^CI28',
        '^PON',
        '^FWN',
        '^LH0,0',
        '^LS0',
        `^PW${W}`,
        `^LL${H}`,
        '^CWZ,E:TT0003M_.TTF',

        // Header
        `^AZN,${H12},${H12}`,
        `^FT${X},${y}^FDKamerakopf^FS`,
        (() => {
          const headIconX = W - M - HEAD_WDOTS;
          const headIconY = y - H12;
          return `^FO${headIconX},${headIconY}${HEAD_GFA}^FS`;
        })(),
        (() => { adv(H12, sp6_67); return ''; })(),

        // Address block
        `^AZN,${H6},${H6}`,
        `^FT${X},${y}^FDRotoclear GmbH^FS`,
        (() => { adv(H6, sp2); return ''; })(),
        `^AZN,${H6},${H6}`,
        `^FT${X},${y}^FDCarl-Benz-Strasse 10–12^FS`,
        (() => { adv(H6, sp2); return ''; })(),
        `^AZN,${H6},${H6}`,
        `^FT${X},${y}^FD69115 Heidelberg^FS`,
        (() => { adv(H6, sp2); return ''; })(),
        `^AZN,${H6},${H6}`,
        `^FT${X},${y}^FDGermany^FS`,
        (() => { adv(H6, sp3_17); return ''; })(),

        // Website
        `^AZN,${H6},${H6}`,
        `^FT${X},${y}^FDwww.rotoclear.com^FS`,
        (() => { adv(H6, sp6_54); return ''; })(),

        // CE + Info icons
        (() => {
          let out = '';
          let iconX = X;
          out += `^FO${iconX},${y}${CE_GFA}^FS\r\n`;
          iconX += iconWdots + mm(2);
          out += `^FO${iconX},${y}${INFO_GFA}^FS\r\n`;
          y += iconHdots + mm(3.295);
          return out;
        })(),

        // Tagline
        `^AZN,${H6},${H6}`,
        `^FT${X},${y}^FDDesigned and made in Germany^FS`,
        (() => { adv(H6, sp11_3); return ''; })(),

        // QR on the right
        `^FO${qrX},${qrY}`,
        gfa + '^FS',

        // Details
        `^AZN,${H6},${H6}`,
        `^FT${X},${y}^FDArtikelnummer: ${normalizeAscii(body.artikel_nummer)}^FS`,
        (() => { adv(H6, sp2); return ''; })(),
        `^AZN,${H6},${H6}`,
        `^FT${X},${y}^FDArtikelbezeichnung: ${artikel_bezeichnung}^FS`,
        (() => { adv(H6, sp2); return ''; })(),
        `^AZN,${H6},${H6}`,
        `^FT${X},${y}^FDSeriennummer: ${serialnummer}^FS`,
        (() => { adv(H6, sp2); return ''; })(),
        `^AZN,${H6},${H6}`,
        `^FT${X},${y}^FDVerpackungsdatum: ${formattedDate}^FS`,

        '^XZ'
      ].join('\r\n');

      try {
        await sendToPrinter(zpl, body.printerIp);
        console.log('KK label sent to printer successfully');
      } catch (error) {
        console.error('Failed to send KK label to printer:', error);
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
