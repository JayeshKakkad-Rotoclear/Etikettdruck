import { json } from '@sveltejs/kit';
import { PrismaClient, KonfigurationC2 } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);
const prisma = new PrismaClient();

export async function POST({ request }) {
    try {
        const body = await request.json();

        const result = await prisma.singleItemC2.create({
            data: {
                artikel_bezeichnung: body.artikel_bezeichnung,
                serialnummer: body.serialnummer,
                hinweis: body.hinweis,
                ba_nummer: body.ba_nummer,
                artikel_nummer: body.artikel_nummer,
                software_version: body.software_version,
                konfiguration: body.konfiguration as KonfigurationC2,
                seriennummer_elektronik: body.seriennummer_elektronik,
                mac_adresse: body.mac_adresse,
                datum: new Date(body.datum),
                produktionsjahr: body.produktionsjahr,
                pruefer_a: body.pruefer_a,
                hardware_ok: body.hardware_ok,
                hutschienenclip_montiert: body.hutschienenclip_montiert,
                hdmi_ok: body.hdmi_ok,
                web_ok: body.web_ok,
                zoom_ok: body.zoom_ok,
                menue_bedienbar: body.menue_bedienbar,
                ip_adresse: body.ip_adresse,
                kameraeingang_ok: body.kameraeingang_ok,
                zustandsdaten_ok: body.zustandsdaten_ok,
                zustandsdaten_fehler: body.zustandsdaten_fehler,
            }
        });

		return json({ success: true, itemId: result.id });
	} catch (error) {
		console.error('Prüfer A error:', error);
		return json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
	}
}

export async function GET({ url }) {
    const serial = url.searchParams.get('serialnummer');

    if (serial) {
        const item = await prisma.singleItemC2.findFirst({
            where: { serialnummer: serial }
        });

        if (!item) {
            return json({ found: false });
        } else {
            return json({ found: true, item });
        }
    } else {
        const allItems = await prisma.singleItemC2.findMany({
            orderBy: { id: 'asc' }
        });
        return json({ success: true, items: allItems });
    }
}

export async function PUT({ request }) {
    try {
        const body = await request.json();

        const updated = await prisma.singleItemC2.update({
            where: { serialnummer: body.serialnummer },
            data: {
                artikel_bezeichnung: body.artikel_bezeichnung,
                hinweis: body.hinweis,
                ba_nummer: body.ba_nummer,
                artikel_nummer: body.artikel_nummer,
                software_version: body.software_version,
                konfiguration: body.konfiguration as KonfigurationC2,
                seriennummer_elektronik: body.seriennummer_elektronik,
                mac_adresse: body.mac_adresse,
                datum: new Date(body.datum),
                produktionsjahr: body.produktionsjahr,
                pruefer_b: body.pruefer_b,
                hardware_ok: body.hardware_ok,
                hutschienenclip_montiert: body.hutschienenclip_montiert,
                hdmi_ok: body.hdmi_ok,
                web_ok: body.web_ok,
                zoom_ok: body.zoom_ok,
                menue_bedienbar: body.menue_bedienbar,
                ip_adresse: body.ip_adresse,
                kameraeingang_ok: body.kameraeingang_ok,
                zustandsdaten_ok: body.zustandsdaten_ok,
                zustandsdaten_fehler: body.zustandsdaten_fehler,
                automatiktest_ok: body.automatiktest_ok,
                qr_code_automatiktest: body.qr_code_automatiktest,
                werkseinstellung: body.werkseinstellung,
                lp_verschraubt: body.lp_verschraubt
            }
        });

		const readableQRC2 = [
			`Serialnummer: ${body.serialnummer}`,
			`Artikel: ${body.artikel_bezeichnung}`,
			`Elektronik: ${body.seriennummer_elektronik}`,
			`MAC: ${body.mac_adresse}`,
			`SW-Version: ${body.software_version}`,
			`FDVerpackungsdatum: ${body.datum}`,
		].join('\n');

		const zpl = `
		^XA

		^CF0,40
		^FO50,30^FDRotoclear C2^FS

		^FO50,100^BQN,2,4^FDMA${readableQRC2}^FS

		^CF0,30
		^FO320,110^FDArtikelnummer: ${body.artikel_nummer}^FS
		^FO320,150^FDArtikelbezeichnung: ${body.artikel_bezeichnung}^FS
		^FO320,190^FDSeriennummer: ${body.serialnummer}^FS
		^FO320,230^FDVerpackungsdatum: ${body.verpackungsdatum}^FS

		^CF0,30
		^FO50,390^FDRotoclear GmbH^FS
		^FO50,420^FDCarl-Benz-Strasse 10-12^FS
		^FO50,450^FD69115 Heidelberg^FS
		^FO50,480^FDGermany^FS

		^CF0,25
		^FO50,550^FDwww.rotoclear.com^FS
		^FO750,550^FDDesigned and made in Germany^FS

		^XZ`
		;

        const tempPath = path.join(os.tmpdir(), `etikettC2-${Date.now()}.zpl`);
        await fs.writeFile(tempPath, zpl);
        await execAsync(`notepad /p "${tempPath}"`);
        await fs.unlink(tempPath);

        return json({ success: true });
    } catch (error) {
        console.error('Update or Print error:', error);
        return json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}
