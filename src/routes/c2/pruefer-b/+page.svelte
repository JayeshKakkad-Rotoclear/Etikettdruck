<script lang="ts">
	import BooleanRadio from '$lib/components/booleanRadio.svelte';
	import SelectRadio from '$lib/components/selectRadio.svelte';

    $: {
		if (form.konfiguration === 'DMG') {
			form.artikel_bezeichnung = 'Steuerrechner für RotoLENS DMG-Artikel-Nr.: 3812889';
            form.artikel_nummer = '10052';
		} else  {
			form.artikel_bezeichnung = 'Steuerrechner für Rotoclear C2';
            form.artikel_nummer = '10082';
		}
	}

	let form = getEmptyFormC2B();
	let serialToFindC2 = '';
	let serialErrorC2 = '';
	let showFormC2 = false;

	function getEmptyFormC2B() {
        const today = new Date();
        const formattedDateC2 = today.toISOString().split('T')[0];
        const currentyearC2 = today.getFullYear().toString();
		return {
			artikel_bezeichnung: '',
			serialnummer: '',
			hinweis: '',
			ba_nummer: '',
			artikel_nummer: '',
			software_version: '',
			konfiguration: null,
			seriennummer_elektronik: '',
			mac_adresse: '',
			datum: formattedDateC2,
			produktionsjahr: currentyearC2,
			pruefer_b: '',
			hardware_ok: null,
            hutschienenclip_montiert: null,
			hdmi_ok: null,
			web_ok: null,
            zoom_ok: null,
			menue_bedienbar: null,
			ip_adresse: null,
			kameraeingang_ok: null,
			zustandsdaten_ok: null,
			zustandsdaten_fehler: '',
			automatiktest_ok: null,
			qr_code_automatiktest: '',
			werkseinstellung: null,
			lp_verschraubt: null
		};
	}

	async function loadSerialDataC2() {
		serialErrorC2 = '';
		try {
			const res = await fetch(`/api/c2?serialnummer=${encodeURIComponent(serialToFindC2)}`);
			if (res.ok) {
				const data = await res.json();
				if (data.found) {
					form.serialnummer = serialToFindC2;
					showFormC2 = true;
				} else {
					serialErrorC2 = 'Keine Daten mit dieser Seriennummer gefunden';
					showFormC2 = false;
				}
			} else {
				serialErrorC2 = 'Fehler beim Laden der Daten';
			}
		} catch (err) {
			serialErrorC2 = 'Verbindungsfehler';
		}
	}

    function handleFileUploadC2(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input?.files?.[0];

        if (file && file.type === 'image/svg+xml') {
            const reader = new FileReader();
            reader.onload = () => {
                form.qr_code_automatiktest = reader.result as string;
            };
            reader.readAsText(file);
        } else {
            alert('Bitte eine .svg Datei auswählen.');
        }
    }

	async function submitFormC2B() {
		const res = await fetch('/api/c2', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(form)
		});
		if (res.ok) {
			alert('Formular aktualisiert und Etikett gedruckt!');
			form = getEmptyFormC2B();
			serialToFindC2 = '';
			showFormC2 = false;
		} else {
			alert('Fehler beim Speichern');
		}
	}
</script>

<svelte:head>
  <title>C2 Prüfer B - Prüfprotokoll</title>
</svelte:head>

<form on:submit|preventDefault={loadSerialDataC2} class="form">
    <h1>C2 Prüfprotokoll - Prüfer B</h1>
	<div class="field">
		<label for="serialSearch">Seriennummer</label>
		<input id="serialSearch" bind:value={serialToFindC2} required />
		<button type="submit" class="submit-button">Laden</button>
	</div>
	{#if serialErrorC2}<p class="error">{serialErrorC2}</p>{/if}
</form>

{#if showFormC2}
    <form on:submit|preventDefault={submitFormC2B} class="form">
        <h1>C2 Prüfprotokoll - Prüfer B</h1>

        <div class="field">
            <label for="pruefer_b">Prüfer B</label>
            <input id="pruefer_b" bind:value={form.pruefer_b} />
        </div>

        <div class="field">
            <label for="artikel_bezeichnung">Artikelbezeichnung</label>
            <input id="artikel_bezeichnung" bind:value={form.artikel_bezeichnung} readonly style="cursor: not-allowed;" />
        </div>
        
        <div class="field">
            <label for="ba_nummer">BA-Nummer</label>
            <input id="ba_nummer" bind:value={form.ba_nummer} />
        </div>    
        
        <div class="field">
            <label for="artikel_nummer">Artikel-Nummer</label>
            <input id="artikel_nummer" bind:value={form.artikel_nummer} readonly style="cursor: not-allowed;" />
        </div>    
        
        <div class="field">
            <label for="datum">Datum</label>
            <input type="date" id="datum" bind:value={form.datum} readonly style="cursor: not-allowed;" />
        </div>

        <div class="field">
            <label for="produktionsjahr">Produktionsjahr</label>
            <input id="produktionsjahr" bind:value={form.produktionsjahr} readonly style="cursor: not-allowed;" />
        </div>

        <div class="field">
        <label for="hinweis">Hinweis</label>
            <input id="hinweis" bind:value={form.hinweis} />
        </div>            
        
        <div class="field">
            <label for="software_version">Software-Version</label>
            <input id="software_version" bind:value={form.software_version} />
        </div>    

        <SelectRadio
            label="Konfiguration"
            bind:value={form.konfiguration}
            options={[
                { label: "RC", value: "RC" },
                { label: "DMG", value: "DMG" },
                { label: "DEMO", value: "DEMO" },
                { label: "EDU", value: "EDU" }
            ]}        
        />

        <div class="field">
            <label for="seriennummer_elektronik">Seriennummer Elektronik</label>
            <input id="seriennummer_elektronik" bind:value={form.seriennummer_elektronik} />
        </div>    

        <div class="field">
            <label for="mac_adresse">MAC-Adresse</label>
            <input id="mac_adresse" bind:value={form.mac_adresse} />
        </div>    

        <BooleanRadio bind:bindValue={form.hardware_ok} label="Hardware vollständig und unbeschädigt" />
        <BooleanRadio bind:bindValue={form.hutschienenclip_montiert} label="Hutschienenclip montiert" />
        <BooleanRadio bind:bindValue={form.hdmi_ok} label="HDMI-Verbindung funktioniert" />
        <BooleanRadio bind:bindValue={form.web_ok} label="Web funktioniert" />
        <BooleanRadio bind:bindValue={form.zoom_ok} label="Zoom funktioniert" />
        <BooleanRadio bind:bindValue={form.menue_bedienbar} label="Menü ist bedienbar" />
        <BooleanRadio bind:bindValue={form.ip_adresse} label="IP-Adresse sichtbar" />
        <BooleanRadio bind:bindValue={form.kameraeingang_ok} label="Kameraeingänge funktionieren" />
        <BooleanRadio bind:bindValue={form.zustandsdaten_ok} label="Zustandsdaten i.O." />

        <div class="field">
            <label for="zustandsdaten_fehler">Welche Zustandsdaten werden nicht korrekt dargestellt?</label>
            <input id="zustandsdaten_fehler" bind:value={form.zustandsdaten_fehler} />
        </div>

        <BooleanRadio bind:bindValue={form.automatiktest_ok} label="Automatiktest durchgeführt" />

        <div class="field">
        <label for="qr_code_file">QR-Code Automatiktest (.svg)</label>
        <input id="qr_code_file" type="file" accept="image/svg+xml" on:change={handleFileUploadC2} />
        </div>

        <BooleanRadio bind:bindValue={form.werkseinstellung} label="Werkseinstellung durchgeführt" />
        <BooleanRadio bind:bindValue={form.lp_verschraubt} label="Leiterplattensteckverbinder verschraubt" />

        <button type="submit" class="submit-button">Speichern & Drucken</button>
    </form>
{/if}

<style>
	h1 {
		font-size: 1.8rem;
		margin-bottom: 2rem;
		text-align: center;
	}

	form.form {
		max-width: 600px;
		margin: 70px auto;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1rem 3rem;
		border-radius: 8px;
		background: #fff;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
	}

	.field {
		display: flex;
		flex-direction: column;
	}

	label {
		font-weight: bold;
		margin-bottom: 10px;
		font-size: large;
	}

	input {
		padding: 0 0.5rem;
		font-size: 1rem;
		border: 1px solid #ccc;
		border-radius: 0px;
		height: 40px;
		margin-bottom: 20px;
	}

	.submit-button {
		padding: 0.75rem;
		background-color: #123345;
		color: white;
		border: none;
		border-radius: 4px;
		font-size: 1rem;
		cursor: pointer;
		transition: background-color 0.3s;
		margin-bottom: 20px;
	}

	.submit-button:hover {
		background-color: #005fa3;
	}

	@media (max-width: 600px) {
		form.form {
			padding: 1rem 0.5rem;
		}

		h1 {
			font-size: 1.5rem;
			text-align: center;
		}
	}
</style>
