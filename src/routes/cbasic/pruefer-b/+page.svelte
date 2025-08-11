<script lang="ts">
	import BooleanRadio from '$lib/components/booleanRadio.svelte';

	let form = getEmptyFormCbasicB();
	let serialToFindCbasic = '';
	let serialErrorCbasic = '';
	let showFormCbasic = false;

	function getEmptyFormCbasicB() {
        const today = new Date();
        const formattedDateCbasic = today.toISOString().split('T')[0];
        const currentyearCbasic = today.getFullYear().toString();
		return {
			artikel_bezeichnung: 'Rotoclear C Basic Steuerrechner',
			serialnummer: '',
			hinweis: '',
			ba_nummer: '',
			artikel_nummer: '',
			software_version: '',
			seriennummer_elektronik: '',
			datum: formattedDateCbasic,
			produktionsjahr: currentyearCbasic,
			pruefer_b: '',
			hardware_ok: null,
            hutschienenclip_montiert: null,
			hdmi_ok: null,
            zoom_ok: null,
			kameraeingang_ok: null,
            sprache_wechslen_funktioniert: null,
            sprache_auf_englisch_eingestellt: null,
			lp_verschraubt: null
		};
	}

	async function loadSerialDataCbasic() {
		serialErrorCbasic = '';
		try {
			const res = await fetch(`/api/cbasic?serialnummer=${encodeURIComponent(serialToFindCbasic)}`);
			if (res.ok) {
				const data = await res.json();
				if (data.found) {
					form.serialnummer = serialToFindCbasic;
					showFormCbasic = true;
				} else {
					serialErrorCbasic = 'Keine Daten mit dieser Seriennummer gefunden';
					showFormCbasic = false;
				}
			} else {
				serialErrorCbasic = 'Fehler beim Laden der Daten';
			}
		} catch (err) {
			serialErrorCbasic = 'Verbindungsfehler';
		}
	}

    	async function submitFormCbasicB() {
		const res = await fetch('/api/cbasic', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(form)
		});
		if (res.ok) {
			alert('Formular aktualisiert und Etikett gedruckt!');
			form = getEmptyFormCbasicB();
			serialToFindCbasic = '';
			showFormCbasic = false;
		} else {
			alert('Fehler beim Speichern');
		}
	}

	async function saveOnlyCbasicB() {
		const res = await fetch('/api/cbasic', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ ...form, skipPrint: true })
		});
		if (res.ok) {
			alert('Formular gespeichert!');
			form = getEmptyFormCbasicB();
			serialToFindCbasic = '';
			showFormCbasic = false;
		} else {
			alert('Fehler beim Speichern');
		}
	}
</script>

<svelte:head>
	<title>C Basic Prüfer B - Prüfprotokoll</title>
</svelte:head>

<div class="form-container">
	<form on:submit|preventDefault={loadSerialDataCbasic} class="form search-form">
		<h1>C Basic Prüfprotokoll - Prüfer B</h1>
		<div class="search-section">
			<div class="field">
				<label for="serialSearch">Seriennummer eingeben</label>
				<div class="search-input-group">
					<input 
						id="serialSearch" 
						bind:value={serialToFindCbasic} 
						required
						autocomplete="off"
					/>
					<button type="submit" class="search-button">
						<span>Laden</span>
					</button>
				</div>
			</div>
			{#if serialErrorCbasic}
				<div class="error-message">
					{serialErrorCbasic}
				</div>
			{/if}
		</div>
	</form>

	{#if showFormCbasic}
		<form on:submit|preventDefault={submitFormCbasicB} class="form main-form">
			<div class="form-header">
				<h2>Prüfer B - C Basic Steuerrechner</h2>
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

				<div class="section-title">Hardware-Informationen</div>

				<div class="field">
					<label for="software_version">Software-Version</label>
					<input id="software_version" bind:value={form.software_version} />
				</div>

				<div class="field">
					<label for="seriennummer_elektronik">Seriennummer Elektronik</label>
					<input id="seriennummer_elektronik" bind:value={form.seriennummer_elektronik} />
				</div>

				<div class="field">
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
					<input id="artikel_nummer" bind:value={form.artikel_nummer} />
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
					<BooleanRadio bind:bindValue={form.hardware_ok} label="Hardware vollständig und unbeschädigt" />
				</div>

				<div class="field field-full-width">
					<BooleanRadio bind:bindValue={form.hutschienenclip_montiert} label="Hutschienenclip montiert" />
				</div>

				<div class="field field-full-width">
					<BooleanRadio bind:bindValue={form.hdmi_ok} label="HDMI-Verbindung funktioniert" />
				</div>

				<div class="field field-full-width">
					<BooleanRadio bind:bindValue={form.zoom_ok} label="Zoom funktioniert" />
				</div>

				<div class="field field-full-width">
					<BooleanRadio bind:bindValue={form.kameraeingang_ok} label="Kameraeingang funktioniert" />
				</div>

				<div class="field field-full-width">
					<BooleanRadio bind:bindValue={form.sprache_wechslen_funktioniert} label="Sprache wechseln funktioniert" />
				</div>

				<div class="field field-full-width">
					<BooleanRadio bind:bindValue={form.sprache_auf_englisch_eingestellt} label="Sprache auf Englisch eingestellt" />
				</div>

				<div class="field field-full-width">
					<BooleanRadio bind:bindValue={form.lp_verschraubt} label="Leiterplattensteckverbinder verschraubt" />
				</div>
			</div>

			<div class="button-group">
				<button type="button" class="save-button" on:click={saveOnlyCbasicB}>
					Speichern
				</button>
				<button type="submit" class="submit-button">
					Speichern & Drucken
				</button>
			</div>
		</form>
	{/if}
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

	.form {
		max-width: 800px;
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

	/* .section-title::before {
		content: '';
		position: absolute;
		bottom: -2px;
		left: 0;
		width: 60px;
		height: 2px;
		background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
	} */

	.section-title:first-of-type {
		margin-top: 0;
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
	
	.submit-button {
		width: 100%;
		padding: var(--spacing-lg) var(--spacing-xl);
		background: linear-gradient(135deg, var(--success-color), var(--success-hover));
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
