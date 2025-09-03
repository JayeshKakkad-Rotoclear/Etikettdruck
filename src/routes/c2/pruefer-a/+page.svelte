<script lang="ts">
	import BooleanRadio from '$lib/components/booleanRadio.svelte';
	import SelectRadio from '$lib/components/selectRadio.svelte';
	import { getPrinterIp } from '$lib/printer.js';

	let form = getEmptyFormC2A();
	let formErrors: string[] = [];

    $: {
		if (form.konfiguration === 'DMG') {
			form.artikel_bezeichnung = 'Steuerrechner fuer RotoLENS DMG-Artikel-Nr.: 3812889';
            form.artikel_nummer = '10052';
		} else if (form.konfiguration === 'RC' || form.konfiguration === 'DEMO' || form.konfiguration === 'EDU') {
			form.artikel_bezeichnung = 'Steuerrechner fuer Rotoclear C2';
            form.artikel_nummer = '10082';
		}
	}

	function validateForm() {
		formErrors = [];
		
		// Required text fields
		if (!form.pruefer_a?.trim()) formErrors.push('Prüfer A ist erforderlich');
		if (!form.serialnummer?.trim()) formErrors.push('Serialnummer ist erforderlich');
		if (!form.software_version?.trim()) formErrors.push('Software-Version ist erforderlich');
		if (!form.seriennummer_elektronik?.trim()) formErrors.push('Seriennummer Elektronik ist erforderlich');
		if (!form.mac_adresse?.trim()) formErrors.push('MAC-Adresse ist erforderlich');
		if (!form.ba_nummer?.trim()) formErrors.push('BA-Nummer ist erforderlich');
		
		// Required select fields
		if (!form.konfiguration) formErrors.push('Konfiguration ist erforderlich');
		
		// Required boolean fields
		if (form.hardware_ok === null) formErrors.push('Hardware vollständig und unbeschädigt muss bewertet werden');
		if (form.hutschienenclip_montiert === null) formErrors.push('Hutschienenclip montiert muss bewertet werden');
		if (form.hdmi_ok === null) formErrors.push('HDMI-Verbindung muss bewertet werden');
		if (form.web_ok === null) formErrors.push('Web funktioniert muss bewertet werden');
		if (form.zoom_ok === null) formErrors.push('Zoom funktioniert muss bewertet werden');
		if (form.menue_bedienbar === null) formErrors.push('Menü ist bedienbar muss bewertet werden');
		if (form.ip_adresse === null) formErrors.push('IP-Adresse sichtbar muss bewertet werden');
		if (form.kameraeingang_ok === null) formErrors.push('Kameraeingänge funktionieren muss bewertet werden');
		if (form.zustandsdaten_ok === null) formErrors.push('Zustandsdaten i.O. muss bewertet werden');
		if (form.automatiktest_ok === null) formErrors.push('Automatiktest durchgeführt muss bewertet werden');
		if (form.werkseinstellung === null) formErrors.push('Werkseinstellung muss bewertet werden');
		if (form.lp_verschraubt === null) formErrors.push('Lüfterplatte verschraubt muss bewertet werden');
		
		return formErrors.length === 0;
	}

	function getEmptyFormC2A() {
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
			pruefer_a: '',
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

    async function submitFormC2A() {
        if (!validateForm()) {
            alert('Bitte füllen Sie alle erforderlichen Felder aus:\n\n' + formErrors.join('\n'));
            return;
        }

        const res = await fetch('/api/c2', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ ...form, printerIp: getPrinterIp() })
        });
        if (res.ok) {
            alert('Form gespeichert. Bitte Prüfer B informieren.');
            form = getEmptyFormC2A();
            formErrors = [];
        } else {
            alert('Fehler beim Speichern');
        }
    }
</script>

<svelte:head>
  <title>C2 Prüfer A - Prüfprotokoll</title>
</svelte:head>

<div class="form-container">
	<form on:submit|preventDefault={submitFormC2A} class="form">
		<h1>C2 Prüfprotokoll - Prüfer A</h1>
		<div class="form-grid">
			<div class="field">
				<label for="pruefer_a">Prüfer A <span class="required">*</span></label>
				<input id="pruefer_a" bind:value={form.pruefer_a} required />
			</div>

			<div class="section-title">Hardware-Informationen</div>

			<div class="field">
				<label for="serialnummer">Serialnummer <span class="required">*</span></label>
				<input id="serialnummer" bind:value={form.serialnummer} required />
			</div>

			<div class="field">
				<label for="hinweis">Hinweis</label>
				<input id="hinweis" bind:value={form.hinweis} />
			</div>

			<div class="field">
				<label for="software_version">Software-Version <span class="required">*</span></label>
				<input id="software_version" bind:value={form.software_version} required />
			</div>

			<div class="field">
				<SelectRadio
					label="Konfiguration"
					bind:value={form.konfiguration}
					options={[
						{ label: "RC", value: "RC" },
						{ label: "DMG", value: "DMG" },
						{ label: "DEMO", value: "DEMO" },
						{ label: "EDU", value: "EDU" }
					]}
					required={true}
				/>
			</div>

			<div class="field">
				<label for="seriennummer_elektronik">Seriennummer Elektronik <span class="required">*</span></label>
				<input id="seriennummer_elektronik" bind:value={form.seriennummer_elektronik} required />
			</div>

			<div class="field">
				<label for="mac_adresse">MAC-Adresse <span class="required">*</span></label>
				<input id="mac_adresse" bind:value={form.mac_adresse} required />
			</div>

			<div class="section-title">Artikel-Informationen</div>

			<div class="field">
				<label for="artikel_bezeichnung">Artikelbezeichnung</label>
				<input id="artikel_bezeichnung" bind:value={form.artikel_bezeichnung} readonly />
			</div>

			<div class="field">
				<label for="ba_nummer">BA-Nummer</label>
				<input id="ba_nummer" bind:value={form.ba_nummer} />
			</div>

			<div class="field">
				<label for="artikel_nummer">Artikel-Nummer</label>
				<input id="artikel_nummer" bind:value={form.artikel_nummer} readonly />
			</div>

			<div class="field">
				<label for="datum">Datum</label>
				<input type="date" id="datum" bind:value={form.datum} readonly />
			</div>

			<div class="field">
				<label for="produktionsjahr">Produktionsjahr</label>
				<input id="produktionsjahr" bind:value={form.produktionsjahr} readonly />
			</div>

			<div class="section-title">Funktionsprüfungen</div>

			<div class="field field-full-width">
				<BooleanRadio bind:bindValue={form.hardware_ok} label="Hardware vollständig und unbeschädigt" required={true} />
			</div>
			
			<div class="field field-full-width">
				<BooleanRadio bind:bindValue={form.hutschienenclip_montiert} label="Hutschienenclip montiert" required={true} />
			</div>
			
			<div class="field field-full-width">
				<BooleanRadio bind:bindValue={form.hdmi_ok} label="HDMI-Verbindung funktioniert" required={true} />
			</div>
			
			<div class="field field-full-width">
				<BooleanRadio bind:bindValue={form.web_ok} label="Web funktioniert" required={true} />
			</div>
			
			<div class="field field-full-width">
				<BooleanRadio bind:bindValue={form.zoom_ok} label="Zoom funktioniert" required={true} />
			</div>
			
			<div class="field field-full-width">
				<BooleanRadio bind:bindValue={form.menue_bedienbar} label="Menü ist bedienbar" required={true} />
			</div>
			
			<div class="field field-full-width">
				<BooleanRadio bind:bindValue={form.ip_adresse} label="IP-Adresse sichtbar" required={true} />
			</div>
			
			<div class="field field-full-width">
				<BooleanRadio bind:bindValue={form.kameraeingang_ok} label="Kameraeingänge funktionieren" required={true} />
			</div>
			
			<div class="field field-full-width">
				<BooleanRadio bind:bindValue={form.zustandsdaten_ok} label="Zustandsdaten i.O." required={true} />
			</div>

			<div class="field field-full-width">
				<label for="zustandsdaten_fehler">Welche Zustandsdaten werden nicht korrekt dargestellt?</label>
				<input id="zustandsdaten_fehler" bind:value={form.zustandsdaten_fehler} />
			</div>
		</div>

		<button type="submit" class="submit-button">Speichern</button>
	</form>
</div>


<style>
	.form-container {
		min-height: 100vh;
		/* background: linear-gradient(135deg, var(--bg-light) 0%, var(--white) 100%); */
		padding: var(--spacing-lg) var(--spacing-md);
	}

	h1 {
		font-size: var(--font-size-xxl);
		font-weight: var(--font-weight-bold);
		color: var(--text-primary);
		text-align: center;
		margin-bottom: var(--spacing-xl);
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	form.form {
		max-width: 800px;
		margin: 0 auto;
		background: var(--white);
		border-radius: var(--border-radius-lg);
		padding: var(--spacing-xl);
		box-shadow: var(--shadow-medium);
		border: 1px solid var(--border-light);
		position: relative;
		overflow: hidden;
	}

	form.form::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 4px;
		background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
	}

	.form-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: var(--spacing-lg);
		margin-bottom: var(--spacing-lg);
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
	}

	.field-full-width {
		grid-column: 1 / -1;
	}

	.section-title {
		grid-column: 1 / -1;
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-bold);
		color: var(--primary-color);
		margin: var(--spacing-lg) 0 var(--spacing-md) 0;
		padding-bottom: var(--spacing-sm);
		border-bottom: 2px solid var(--border-light);
	}

	.section-title::before {
		content: '';
		position: absolute;
		bottom: -2px;
		left: 0;
		width: 60px;
		height: 2px;
		background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
	}

	label {
		font-weight: var(--font-weight-semibold);
		color: var(--text-secondary);
		font-size: var(--font-size-base);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin-bottom: var(--spacing-xs);
	}

	.required {
		color: #dc2626;
		font-weight: bold;
		margin-left: 2px;
	}

	input {
		padding: var(--spacing-md);
		font-size: var(--font-size-base);
		border: 2px solid var(--border-medium);
		border-radius: var(--border-radius-md);
		background: var(--white);
		transition: all var(--transition-smooth);
		min-height: 48px;
		box-sizing: border-box;
	}

	input:focus {
		outline: none;
		border-color: var(--primary-color);
		box-shadow: 0 0 0 3px var(--primary-light);
		background: var(--bg-light);
	}

	input:hover:not(:focus) {
		border-color: var(--border-color);
		box-shadow: var(--shadow-sm);
	}

	input[readonly] {
		background: var(--bg-muted);
		color: var(--text-muted);
		cursor: not-allowed;
		border-color: var(--border-light);
	}

	input[readonly]:hover {
		border-color: var(--border-light);
		box-shadow: none;
	}

	.submit-button {
		width: 100%;
		padding: var(--spacing-lg) var(--spacing-xl);
		background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
		color: var(--white);
		border: none;
		border-radius: var(--border-radius-md);
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		cursor: pointer;
		transition: all var(--transition-smooth);
		margin-top: var(--spacing-xl);
		min-height: 56px;
		text-transform: uppercase;
		letter-spacing: 1px;
		box-shadow: var(--shadow-sm);
		position: relative;
		overflow: hidden;
	}

	.submit-button::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
		transition: left 0.6s ease;
	}

	.submit-button:hover::before {
		left: 100%;
	}

	.submit-button:hover {
		background: linear-gradient(135deg, var(--primary-hover), var(--primary-active));
		transform: translateY(-2px);
		box-shadow: var(--shadow-medium);
	}

	.submit-button:active {
		transform: translateY(0);
		box-shadow: var(--shadow-sm);
	}

	/* Enhanced visual elements */
	.form-grid::before {
		content: '';
		grid-column: 1 / -1;
		height: 1px;
		background: linear-gradient(90deg, transparent, var(--border-light), transparent);
		margin: var(--spacing-md) 0;
	}

	@media (max-width: 768px) {
		.form-container {
			padding: var(--spacing-md) var(--spacing-sm);
		}

		form.form {
			padding: var(--spacing-lg);
		}

		h1 {
			font-size: var(--font-size-xl);
		}

		.form-grid {
			grid-template-columns: 1fr;
			gap: var(--spacing-md);
		}

		.submit-button {
			font-size: var(--font-size-base);
			padding: var(--spacing-md);
		}
	}

	@media (max-width: 480px) {
		.form-container {
			padding: var(--spacing-sm);
		}

		form.form {
			padding: var(--spacing-md);
			border-radius: var(--border-radius-md);
		}

		h1 {
			font-size: var(--font-size-lg);
			margin-bottom: var(--spacing-lg);
		}

		input {
			padding: var(--spacing-sm) var(--spacing-md);
			min-height: 44px;
		}

		.submit-button {
			min-height: 48px;
		}

		.section-title {
			font-size: var(--font-size-base);
		}
	}
</style>
