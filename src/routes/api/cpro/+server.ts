import { json } from '@sveltejs/kit';
import { PrismaClient, KonfigurationCPro, Festplattengroesse, FreierFestplattenspeicher } from '@prisma/client';
import net from 'node:net';
import type { RequestHandler } from './$types';

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
        '^GFA,234,234,6,004FFFF90000013FFFFE4000027FFFFF200005FFC1FFD0000BFC7F1FE80017F3C1E7F4000FCC0019F8003FB00006FE001F4000017C007E800000BF003D0000005E00FE0000003F80780000000F00FC0000001F80F0001C000780F80022000F80F0003E000780F0007F000780E0007F000380E0007F000380E0007F000380F0007F000780F0003E000780F80022000F80F0001C000780FC0000001F80780000000F00FE0000003F803D0000005E007E800000BF001F4000037C003FB00006FE000FCC0019F80017F3C1E7F4000BFC7F1FE80005FFC1FFD000027FFFFF2000013FFFFE40000047FFF10000';

      const CE_GFA =
        '^GFA,234,234,6,003FA000BF8002FFA000FF8005FFA005FF801BFFA00BFF8017FFA017FF802FFFA02FFF805FFC002FFF809FEF005FF400BFDC00DFDF80BFE000BFB0007F4000BFE0007E80017F4000FE80017E8000FD00017E8000FD00017EFC00FD00017D0000FC0002FFFC00FA0002FFFC80FA0002FFFC80FA0002FFFC80FA0002FFFC80F80002FFFC80FC00017FFC00FD00017D0000FD00017E8000FD00017EF800FE80017E80007E80017F40007F4000BF60007FE000BFB000BFD8005FDC00BFEF005FF7805FFA002FFE006FFFA02FFF802FFFA017FF8017FFA00BFF800BFFA005FF8001FFA000FF80007FA000BF80';

      const INFO_GFA =
        '^GFA,234,234,6,D00180000D80E4303F0F138073CFFFF0EF009C3FFFFF1E804FFFFFFFF90013FFFFFFF600097FFFFFC80002F80007F000003C801FC000005F7FFFC0000017FFFC0000001BEDCFC000001CF3BC0000001B7F5C000000193E9C0000001EFF3C00000019E3DC0000003F9CFE0000004F2279000001BCC07E8000027FFFFF40000DEC01C39000139FFFE7C8006F6FFFFF72009C80003CB9007B0CFFC34E00E40300382780C80000000B803000000004804000000001000000000000003FFFFFFFFE000000000000003FFFFFFFFE003FFFFFFFFE003FFFFFFFFE003FFFFFFFFE003FFFFFFFFE003FFFFFFFFE00';


      const M  = mm(6);
      const W  = 1181;
      const H  = 1772;

      const qrSize = 340;
      const qrX = W - M - qrSize;
      const qrY = M + mm(9);

      const X = M;
      let y = M;

      const H12PT = 50;
      const H6PT  = 25;

      const sp6_67   = mm(9.67);
      const sp3_17   = mm(5.17);
      const sp3_295  = mm(3.295);
      const sp11_3   = mm(11.3);
      const sp2      = mm(2);
      const sp3	  = mm(3);
      const sp2_54   = mm(2.54);
      const sp6_54   = mm(6.54);

      const gapIcons   = mm(2);
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

      zplParts.push(`^FO${qrX},${qrY}^BQN,2,8^FDLA,${qrData}^FS`);

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
