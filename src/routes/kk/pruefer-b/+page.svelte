<script lang="ts">
  import BooleanRadio from '$lib/components/booleanRadio.svelte';
  import SelectRadio from '$lib/components/selectRadio.svelte';

  let form = getEmptyFormKKB();
  let serialToFindKK = '';
  let serialErrorKK = '';
  let showFormKK = false;

  $: {
    if (form.anzahl_optiken === 'Ein_Optik' && form.optik_format === 'F1') {
      form.artikel_bezeichnung = 'Kamerakopf F1';
      form.artikel_nummer = '10083';
    } else if (form.anzahl_optiken === 'Ein_Optik' && form.optik_format === 'F2') {
      form.artikel_bezeichnung = 'Kamerakopf F2';
      form.artikel_nummer = '10084';
    } else if (form.anzahl_optiken === 'Ein_Optik' && form.optik_format === 'TFT') {
      form.artikel_bezeichnung = 'Kamerakopf TFT';
      form.artikel_nummer = '10471';
    } else if (form.anzahl_optiken === 'Zwei_Optiken' && form.optik_format === 'F1+F2') {
      form.artikel_bezeichnung = 'Kamerakopf F1+F2';
      form.artikel_nummer = '10085';
    } else if (form.anzahl_optiken === 'Zwei_Optiken' && form.optik_format === 'F1+TFT') {
      form.artikel_bezeichnung = 'Kamerakopf F1+TFT';
      form.artikel_nummer = '10691';
    } else if (form.anzahl_optiken === 'Zwei_Optiken' && form.optik_format === 'F2+TFT') {
      form.artikel_bezeichnung = 'Kamerakopf F2+TFT';
      form.artikel_nummer = '10692';
    }
  }

  function getEmptyFormKKB() {
    const today = new Date();
    const formattedDateKKA = today.toISOString().split('T')[0];
    const currentyearKKA = today.getFullYear().toString();
    return {
      artikel_bezeichnung: '',
      serialnummer: '',
      hinweis: '',
      ba_nummer: '',
      artikel_nummer: '',
      firmware_version: '',
      seriennummer_elektronik: '',
      seriennummer_optik1: '',
      seriennummer_optik2: '',
      datum: formattedDateKKA,
      produktionsjahr: currentyearKKA,
      automatiktest_ok: null,
      qr_code_automatiktest: '',
      pruefer_b: '',
      KonfigurationKK: null,
      pigtail_schrumpfschlauch: null,
      pigtail_drehmoment: null,
      chargenummer: '',
      hardware_ok: null,
      optikglas_ok: null,
      rotor_ok: null,
      klebung_rotor_ok: null,
      kleber_2k_ok: null,
      dichtring_datenkabel_eingelegt: null,
      druckluftanscluss_montiert: null,
      uberdrucktest_ok: null,
      lichtmodul_ok: null,
      motor_ok: null,
      motor_dauerhaft_drehbar: null,
      laufzeit_motor: '',
      drucksensor_ok: null,
      lagesensor_ok: null,
      zustandsdaten_ok: null,
      zustandsdaten_fehler: '',
      anzahl_optiken: 'Ein Optik',
      optik_format: null,
      fokuslage_ok: null,
      optik_wechseln_funktioniert: null,
      siegellack_aufgebracht: null,
    };
  }

	async function loadSerialDataKK() {
		serialErrorKK = '';
		try {
			const res = await fetch(`/api/kk?serialnummer=${encodeURIComponent(serialToFindKK)}`);
			if (res.ok) {
				const data = await res.json();
				if (data.found) {
					form.serialnummer = serialToFindKK;
					showFormKK = true;
				} else {
					serialErrorKK = 'Keine Daten mit dieser Seriennummer gefunden';
					showFormKK = false;
				}
			} else {
				serialErrorKK = 'Fehler beim Laden der Daten';
			}
		} catch (err) {
			serialErrorKK = 'Verbindungsfehler';
		}
	}

    function handleFileUploadKK(event: Event) {
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

	async function submitFormKKB() {
		const res = await fetch('/api/kk', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(form)
		});
		if (res.ok) {
			alert('Formular aktualisiert und Etikett gedruckt!');
			form = getEmptyFormKKB();
			serialToFindKK = '';
			showFormKK = false;
		} else {
			alert('Fehler beim Speichern');
		}    
	}

	async function saveOnlyKKB() {
		const res = await fetch('/api/kk', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ ...form, skipPrint: true })
		});
		if (res.ok) {
			alert('Formular gespeichert!');
			form = getEmptyFormKKB();
			serialToFindKK = '';
			showFormKK = false;
		} else {
			alert('Fehler beim Speichern');
		}
	}  
</script>

<svelte:head>
	<title>Kamerakopf Prüfer B - Prüfprotokoll</title>
</svelte:head>

<div class="form-container">
    <form on:submit|preventDefault={loadSerialDataKK} class="form search-form">
        <h1>Kamerakopf Prüfprotokoll - Prüfer B</h1>
        <div class="search-section">
            <div class="field">
                <label for="serialSearch">Seriennummer eingaben</label>
                <div class="search-input-group">
                    <input id="serialSearch" bind:value={serialToFindKK} required />
                    <button type="submit" class="search-button">
                        <span>Laden</span>
                    </button>
                </div>
            
                {#if serialErrorKK}
                    <div class="error-message">
                        {serialErrorKK}
                    </div>
                {/if}
            </div>
        </div>
    </form>

	<!-- {#if showFormKK} -->
		<form on:submit|preventDefault={submitFormKKB} class="form main-form">
			<div class="form-header">
				<h2>Prüfprotokoll bearbeiten</h2>
				<div class="serial-info">
					<span class="serial-label">Seriennummer:</span>
					<span class="serial-value">{form.serialnummer}</span>
				</div>
			</div>

			<div class="form-grid">
				<div class="field">
					<label for="pruefer_b">Prüfer B</label>
					<input id="pruefer_b" bind:value={form.pruefer_b} />
				</div>

				<div class="section-title">Konfiguration</div>

				<div class="radio-section">
					<SelectRadio
						label="Anzahl Optiken"
						bind:value={form.anzahl_optiken}
						options={[
							{ label: "1 Optik", value: "Ein_Optik" },
							{ label: "2 Optiken", value: "Zwei_Optiken" }
						]}        
					/>

					<SelectRadio
						label="Optik Format"
						bind:value={form.optik_format}
						options={form.anzahl_optiken === 'Ein_Optik' 
							? [
							{ label: "F1", value: "F1" },
							{ label: "F2", value: "F2" },
							{ label: "TFT", value: "TFT" }
							]
							: [
							{ label: "F1+F2", value: "F1_F2" },
							{ label: "F1+TFT", value: "F1_TFT" },
							{ label: "F2+TFT", value: "F2_TFT" }
							]
						}        
					/>

					<SelectRadio
						label="Konfiguration"
						bind:value={form.KonfigurationKK}
						options={[
							{ label: "RC", value: "RC" },
							{ label: "DMG", value: "DMG" }
						]}
					/>
				</div>

				<div class="section-title">Hardware-Informationen</div>

				<div class="field">
					<label for="seriennummer_elektronik">Seriennummer Elektronik</label>
					<input id="seriennummer_elektronik" bind:value={form.seriennummer_elektronik} />
				</div>

				<div class="field">
					<label for="firmware_version">Firmware Version</label>
					<input id="firmware_version" bind:value={form.firmware_version} />
				</div>

				<div class="field">
					<label for="seriennummer_optik1">Seriennummer Optik 1</label>
					<input id="seriennummer_optik1" bind:value={form.seriennummer_optik1} />
				</div>

				{#if form.anzahl_optiken === 'Zwei_Optiken'}
					<div class="field">
						<label for="seriennummer_optik2">Seriennummer Optik 2</label>
						<input id="seriennummer_optik2" bind:value={form.seriennummer_optik2} />
					</div>
				{/if}

				<div class="field">
					<label for="chargenummer">Chargenummer Lagereinheit</label>
					<input id="chargenummer" bind:value={form.chargenummer} />
				</div>

				<div class="field field-full-width">
					<label for="hinweis">Hinweis</label>
					<input id="hinweis" bind:value={form.hinweis} />
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

				{#if form.KonfigurationKK === 'DMG'}
					<div class="section-title">DMG Konfiguration</div>
					<div class="radio-grid">
						<BooleanRadio bind:bindValue={form.pigtail_schrumpfschlauch} label="Pigtail-Kabel mit Schrumpfschlauch montiert" />
						<BooleanRadio bind:bindValue={form.pigtail_drehmoment} label="Pigtail-Kabel mit Drehmoment angezogen" />
					</div>
				{/if}

				<div class="section-title">Funktionsprüfungen</div>

                <div class="field field-full-width">
					<BooleanRadio bind:bindValue={form.hardware_ok} label="Hardware vollständig und unbeschädigt" />
                </div>

                <div class="field field-full-width">
					<BooleanRadio bind:bindValue={form.optikglas_ok} label="Optikglas Staub- und Fettfrei" />
                </div>

                <div class="field field-full-width">
					<BooleanRadio bind:bindValue={form.rotor_ok} label="Rotor dreht frei(von Hand)" />
                </div>

                <div class="field field-full-width">
					<BooleanRadio bind:bindValue={form.klebung_rotor_ok} label="Klebung Rotor i.O." />
                </div>

                <div class="field field-full-width">
					<BooleanRadio bind:bindValue={form.kleber_2k_ok} label="2K-Kleber Lichtmodul i.O." />
                </div>

                <div class="field field-full-width">
					<BooleanRadio bind:bindValue={form.dichtring_datenkabel_eingelegt} label="Dichtring(grün) für Datenkabel eingelegt" />
                </div>

                <div class="field field-full-width">
					<BooleanRadio bind:bindValue={form.druckluftanscluss_montiert} label="Fest Druckluftanschluss montiert" />
                </div>

                <div class="field field-full-width">
					<BooleanRadio bind:bindValue={form.uberdrucktest_ok} label="Überdrucktest durchgeführt" />
                </div>

                <div class="field field-full-width">
					<BooleanRadio bind:bindValue={form.lichtmodul_ok} label="10x Lichtmodul auf Funktion überprüft" />
                </div>

                <div class="field field-full-width">
					<BooleanRadio bind:bindValue={form.motor_ok} label="10x Motor auf Funktion überprüft" />
                </div>

                <div class="field field-full-width">
					<BooleanRadio bind:bindValue={form.motor_dauerhaft_drehbar} label="Motor im Dauerlauf überprüft(min. 30 Min.)" />
				</div>

				<div class="field field-full-width">
					<label for="laufzeit_motor">Laufzeit des Motors eintragen</label>
					<input id="laufzeit_motor" bind:value={form.laufzeit_motor} />
				</div>

                <div class="field field-full-width">
					<BooleanRadio bind:bindValue={form.drucksensor_ok} label="Drucksensor funktioniert" />
                </div>

                <div class="field field-full-width">
					<BooleanRadio bind:bindValue={form.lagesensor_ok} label="Lagesensor funktioniert" />
                </div>

                <div class="field field-full-width">
					<BooleanRadio bind:bindValue={form.fokuslage_ok} label="Fokuslage korrekt eingestellt" />
                </div>
					{#if form.anzahl_optiken === 'Zwei_Optiken'}
                        <div class="field field-full-width">
                            <BooleanRadio bind:bindValue={form.optik_wechseln_funktioniert} label="Optik wechseln funktioniert" />
                        </div>
					{/if}

                <div class="field field-full-width">
					<BooleanRadio bind:bindValue={form.siegellack_aufgebracht} label="Siegellack aufgebracht" />
                </div>

                <div class="field field-full-width">
					<BooleanRadio bind:bindValue={form.automatiktest_ok} label="Automatiktest durchgeführt" />
				</div>

				<div class="file-upload-field field-full-width">
					<label for="qr_code_file">QR-Code Automatiktest (.svg)</label>
					<div class="file-input-wrapper">
						<input 
							id="qr_code_file" 
							type="file" 
							accept="image/svg+xml" 
							on:change={handleFileUploadKK} 
						/>
						<div class="file-input-display">
							<span class="file-icon">📁</span>
							<span class="file-text">SVG-Datei auswählen...</span>
						</div>
					</div>
				</div>
			</div>

			<div class="button-group">
				<button type="button" class="save-button" on:click={saveOnlyKKB}>
					Speichern
				</button>
				<button type="submit" class="submit-button">
					Speichern & Drucken
				</button>
			</div>
		</form>
	<!-- {/if} -->
</div>

<style>
	.form-container {
		min-height: 100vh;
		background: linear-gradient(135deg, var(--bg-light) 0%, var(--white) 100%);
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

	.form {
		max-width: 900px;
		margin: 0 auto var(--spacing-xl) auto;
		background: var(--white);
		border-radius: var(--border-radius-lg);
		padding: var(--spacing-xl);
		box-shadow: var(--shadow-medium);
		border: 1px solid var(--border-light);
		position: relative;
		overflow: hidden;
	}

	.form::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 4px;
		background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
	}

	.search-form {
		margin-bottom: var(--spacing-2xl);
	}

	.search-section {
		text-align: center;
	}


	.search-input-group {
		display: flex;
		gap: var(--spacing-md);
		align-items: flex-end;
		max-width: 500px;
		margin: 0 auto;
	}

	.search-button {
		background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
		color: var(--white);
		border: none;
		border-radius: var(--border-radius-md);
		padding: var(--spacing-md) var(--spacing-xl);
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-semibold);
		cursor: pointer;
		transition: all var(--transition-smooth);
		min-height: 56px;
		box-shadow: var(--shadow-sm);
		position: relative;
		overflow: hidden;
		white-space: nowrap;
	}

	.search-button::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
		transition: left 0.6s ease;
	}

	.search-button:hover::before {
		left: 100%;
	}

	.search-button:hover {
		background: linear-gradient(135deg, var(--primary-hover), var(--primary-active));
		transform: translateY(-2px);
		box-shadow: var(--shadow-lg);
	}

	.error-message {
		background: linear-gradient(135deg, var(--error-color), var(--danger-hover));
		color: var(--white);
		padding: var(--spacing-md);
		border-radius: var(--border-radius-md);
		margin-top: var(--spacing-md);
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		box-shadow: var(--shadow-sm);
		animation: slideDown 0.3s ease-out;
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.main-form {
		animation: fadeIn 0.5s ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.form-header {
		text-align: center;
		margin-bottom: var(--spacing-xl);
		padding-bottom: var(--spacing-lg);
		border-bottom: 2px solid var(--border-light);
	}

	.form-header h2 {
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-bold);
		color: var(--primary-color);
		margin-bottom: var(--spacing-md);
	}

	.serial-info {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-sm);
		background: linear-gradient(135deg, var(--bg-light), var(--white));
		padding: var(--spacing-sm) var(--spacing-lg);
		border-radius: var(--border-radius-full);
		border: 1px solid var(--border-light);
		box-shadow: var(--shadow-sm);
	}

	.serial-label {
		font-weight: var(--font-weight-semibold);
		color: var(--text-secondary);
		font-size: var(--font-size-sm);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.serial-value {
		font-weight: var(--font-weight-bold);
		color: var(--primary-color);
		font-family: monospace;
		font-size: var(--font-size-base);
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

	.radio-section {
		grid-column: 1 / -1;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: var(--spacing-md);
		margin-bottom: var(--spacing-md);
	}

	.radio-grid {
		grid-column: 1 / -1;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: var(--spacing-md);
		margin-top: var(--spacing-md);
	}

	.section-title {
		grid-column: 1 / -1;
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-bold);
		color: var(--primary-color);
		margin: var(--spacing-lg) 0 var(--spacing-md) 0;
		padding-bottom: var(--spacing-sm);
		border-bottom: 2px solid var(--border-light);
		position: relative;
	}

	label {
		font-weight: var(--font-weight-semibold);
		color: var(--text-secondary);
		font-size: var(--font-size-base);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin-bottom: var(--spacing-xs);
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
	
	.file-upload-field {
		margin: var(--spacing-lg) 0;
	}

	.file-input-wrapper {
		position: relative;
		display: inline-block;
        margin: var(--spacing-sm) 0;
		width: 100%;
	}

	.file-input-wrapper input[type="file"] {
		position: absolute;
		opacity: 0;
		width: 100%;
		height: 100%;
		cursor: pointer;
	}

	.file-input-display {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
		padding: var(--spacing-md) var(--spacing-lg);
		border: 2px dashed var(--border-medium);
		border-radius: var(--border-radius-md);
		background: var(--bg-light);
		transition: all var(--transition-smooth);
		cursor: pointer;
		min-height: 60px;
	}

	.file-input-display:hover {
		border-color: var(--primary-color);
		background: var(--white);
		box-shadow: var(--shadow-sm);
	}

	.file-icon {
		font-size: var(--font-size-xl);
	}

	.file-text {
		font-weight: var(--font-weight-medium);
		color: var(--text-secondary);
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
		min-height: 64px;
		text-transform: uppercase;
		letter-spacing: 1px;
		box-shadow: var(--shadow-md);
		position: relative;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-md);
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
		transform: translateY(-3px);
		box-shadow: var(--shadow-lg);
	}

	.submit-button:active {
		transform: translateY(-1px);
		box-shadow: var(--shadow-md);
	}

	.button-group {
		display: flex;
		gap: var(--spacing-md);
		margin-top: var(--spacing-xl);
	}

	.save-button {
		flex: 1;
		padding: var(--spacing-lg) var(--spacing-xl);
		background: linear-gradient(135deg, var(--success-color), var(--success-hover));
		color: var(--white);
		border: none;
		border-radius: var(--border-radius-md);
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		cursor: pointer;
		transition: all var(--transition-smooth);
		min-height: 64px;
		text-transform: uppercase;
		letter-spacing: 1px;
		box-shadow: var(--shadow-md);
		position: relative;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-md);
	}

	.save-button::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
		transition: left 0.6s ease;
	}

	.save-button:hover::before {
		left: 100%;
	}

	.save-button:hover {
		background: linear-gradient(135deg, var(--success-hover), #0f7037);
		transform: translateY(-3px);
		box-shadow: var(--shadow-lg);
	}

	.save-button:active {
		transform: translateY(-1px);
		box-shadow: var(--shadow-md);
	}

	.submit-button {
		flex: 1;
		margin-top: 0;
	}

	@media (max-width: 768px) {
		.form-container {
			padding: var(--spacing-md) var(--spacing-sm);
		}

		.form {
			padding: var(--spacing-lg);
		}

		h1 {
			font-size: var(--font-size-xl);
		}

		.form-grid {
			grid-template-columns: 1fr;
			gap: var(--spacing-md);
		}

		.radio-section {
			grid-template-columns: 1fr;
			gap: var(--spacing-sm);
		}

		.radio-grid {
			grid-template-columns: 1fr;
			gap: var(--spacing-sm);
		}

		.search-input-group {
			flex-direction: column;
			gap: var(--spacing-md);
		}

		.search-button {
			width: 100%;
		}

		.submit-button {
			font-size: var(--font-size-base);
			padding: var(--spacing-md) var(--spacing-lg);
			min-height: 56px;
		}
	}

	@media (max-width: 480px) {
		.form-container {
			padding: var(--spacing-sm);
		}

		.form {
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

		.form-header h2 {
			font-size: var(--font-size-lg);
		}
	}
</style>