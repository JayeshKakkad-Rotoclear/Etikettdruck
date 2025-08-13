import { json } from '@sveltejs/kit';
import { PrismaClient, AnzahlOptiken, OptikFormat, KonfigurationKK } from '@prisma/client';
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
                siegellack_aufgebracht: body.siegellack_aufgebracht,
            }
        });

        return json({ success: true, itemId: result.id });
    } catch (error) {
        return json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}

export async function GET({ url }) {
    const serial = url.searchParams.get('serialnummer');

    if (serial) {
        const item = await prisma.singleItemKK.findFirst({
            where: { serialnummer: serial }
        });

        if (!item) {
            return json({ found: false });
        } else {
            return json({ found: true, item });
        }
    } else {
        const allItems = await prisma.singleItemKK.findMany({
            orderBy: { id: 'asc' }
        });
        return json({ success: true, items: allItems });
    }
}

export async function PUT({ request }) {
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
                siegellack_aufgebracht: body.siegellack_aufgebracht,
            }
        });

        // Only print if skipPrint is not true
        if (!body.skipPrint) {
            const readableQRKK = [
                `Serialnummer: ${body.serialnummer}`,
                `Artikel: ${body.artikel_bezeichnung}`,
                `Elektronik: ${body.seriennummer_elektronik}`,
                `Optik1: ${body.seriennummer_optik1}`,
                body.seriennummer_optik2 ? `Optik2: ${body.seriennummer_optik2}` : null,
                `FW-Version: ${body.firmware_version}`,
                `Verpackungsdatum: ${body.datum}`,
            ].filter(Boolean).join('\n');

            const zpl = `
            ^XA

            ^CF0,40
            ^FO50,30^FDKamerakopf^FS

            ^FO50,100^BQN,2,4^FDMA${readableQRKK}^FS

            ^CF0,30
            ^FO320,110^FDArtikelnummer: ${body.artikel_nummer}^FS
            ^FO320,150^FDArtikelbezeichnung: ${body.artikel_bezeichnung}^FS
            ^FO320,190^FDSeriennummer: ${body.serialnummer}^FS
            ^FO320,230^FDVerpackungsdatum: ${body.datum}^FS

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

            const tempPath = path.join(os.tmpdir(), `etikettKK-${Date.now()}.zpl`);
            await fs.writeFile(tempPath, zpl);
            await execAsync(`notepad /p "${tempPath}"`);
            await fs.unlink(tempPath);
        }

        return json({ success: true });
    } catch (error) {
        return json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}
