<script lang="ts">
	import BooleanRadio from '$lib/components/booleanRadio.svelte';
	import { getPrinterIp } from '$lib/printer.js';

	let form = getEmptyFormCbasicB();
	let formErrors: string[] = [];
	let serialToFindCbasic = '';
	let serialErrorCbasic = '';
	let showFormCbasic = false;
	
	// Confirmation dialog variables
	let originalData: any = null;
	let showConfirmDialog = false;
	let pendingAction: 'save' | 'saveAndPrint' | null = null;
	let changes: Array<{field: string, oldValue: any, newValue: any, label: string}> = [];

	function validateForm(): boolean {
		formErrors = [];

		// Check required text fields
		if (!form.pruefer_b.trim()) formErrors.push('- Prüfer B');
		if (!form.software_version.trim()) formErrors.push('- Software-Version');
		if (!form.seriennummer_elektronik.trim()) formErrors.push('- Seriennummer Elektronik');
		if (!form.ba_nummer.trim()) formErrors.push('- BA-Nummer');
		// Check required boolean fields
		if (form.hardware_ok === null) formErrors.push('- Hardware vollständig und unbeschädigt');
		if (form.hutschienenclip_montiert === null) formErrors.push('- Hutschienenclip montiert');
		if (form.hdmi_ok === null) formErrors.push('- HDMI-Verbindung funktioniert');
		if (form.zoom_ok === null) formErrors.push('- Zoom funktioniert');
		if (form.kameraeingang_ok === null) formErrors.push('- Kameraeingänge funktionieren');
		if (form.sprache_wechslen_funktioniert === null) formErrors.push('- Sprache wechseln funktioniert');
		if (form.sprache_auf_englisch_eingestellt === null) formErrors.push('- Sprache auf Englisch eingestellt');
		if (form.lp_verschraubt === null) formErrors.push('- LP verschraubt');

		return formErrors.length === 0;
	}

	function getEmptyFormCbasicB() {
        const today = new Date();
        const formattedDateCbasic = today.toISOString().split('T')[0];
        const currentyearCbasic = today.getFullYear().toString();
		return {
			artikel_bezeichnung: 'Rotoclear C Basic Steuerrechner',
			serialnummer: '',
			hinweis: '',
			ba_nummer: '',
			artikel_nummer: '10262',
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
					originalData = { ...data.item }; // Store original data for comparison
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
		if (!validateForm()) {
			alert('Bitte füllen Sie alle erforderlichen Felder aus:\n\n' + formErrors.join('\n'));
			return;
		}

		const res = await fetch('/api/cbasic', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify({ ...form, printerIp: getPrinterIp() })
		});
		if (res.ok) {
			alert('Formular aktualisiert und Etikett gedruckt!');
			form = getEmptyFormCbasicB();
			formErrors = [];
			serialToFindCbasic = '';
			showFormCbasic = false;
		} else {
			alert('Fehler beim Speichern');
		}
	}

	async function saveOnlyCbasicB() {
		if (!validateForm()) {
			alert('Bitte füllen Sie alle erforderlichen Felder aus:\n\n' + formErrors.join('\n'));
			return;
		}

		const res = await fetch('/api/cbasic', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify({ ...form, skipPrint: true, printerIp: getPrinterIp() })
		});
		if (res.ok) {
			alert('Formular gespeichert!');
			form = getEmptyFormCbasicB();
			formErrors = [];
			serialToFindCbasic = '';
			showFormCbasic = false;
		} else {
			alert('Fehler beim Speichern');
		}
	}

	// Confirmation dialog functions
	function getFieldLabel(fieldName: string): string {
		const labels: Record<string, string> = {
			artikel_bezeichnung: 'Artikelbezeichnung',
			hinweis: 'Hinweis',
			ba_nummer: 'BA-Nummer',
			artikel_nummer: 'Artikel-Nummer',
			software_version: 'Software Version',
			seriennummer_elektronik: 'Seriennummer Elektronik',
			datum: 'Datum',
			produktionsjahr: 'Produktionsjahr',
			pruefer_b: 'Prüfer B',
			hardware_ok: 'Hardware OK',
			hutschienenclip_montiert: 'Hutschienenclip montiert',
			hdmi_ok: 'HDMI OK',
			zoom_ok: 'Zoom OK',
			kameraeingang_ok: 'Kameraeingang OK',
			sprache_wechslen_funktioniert: 'Sprache wechseln funktioniert',
			sprache_auf_englisch_eingestellt: 'Sprache auf Englisch eingestellt',
			lp_verschraubt: 'Lüfterplatte verschraubt'
		};
		return labels[fieldName as keyof typeof labels] || fieldName;
	}

	function formatValue(value: any): string {
		if (value === null || value === undefined) return 'Nicht gesetzt';
		if (typeof value === 'boolean') return value ? 'Ja' : 'Nein';
		if (value === '') return 'Leer';
		return String(value);
	}

	function detectChanges() {
		changes = [];
		if (!originalData) return;

		const fieldsToCheck = [
			'artikel_bezeichnung', 'hinweis', 'ba_nummer', 'artikel_nummer',
			'software_version', 'seriennummer_elektronik', 'produktionsjahr',
			'hardware_ok', 'hutschienenclip_montiert', 'hdmi_ok', 'zoom_ok',
			'kameraeingang_ok', 'sprache_wechslen_funktioniert', 'sprache_auf_englisch_eingestellt'
		];

		for (const field of fieldsToCheck) {
			const oldValue = originalData?.[field as keyof typeof originalData];
			const newValue = form[field as keyof typeof form];
			
			if (oldValue !== newValue) {
				changes.push({
					field,
					oldValue,
					newValue,
					label: getFieldLabel(field)
				});
			}
		}
	}

	function showConfirmation(action: 'save' | 'saveAndPrint') {
		detectChanges();
		pendingAction = action;
		showConfirmDialog = true;
	}

	function cancelConfirmation() {
		showConfirmDialog = false;
		pendingAction = null;
		changes = [];
	}

	async function confirmAction() {
		if (pendingAction === 'save') {
			await saveOnlyCbasicB();
		} else if (pendingAction === 'saveAndPrint') {
			await submitFormCbasicB();
		}
		showConfirmDialog = false;
		pendingAction = null;
		changes = [];
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
		<form class="form main-form">
			<div class="form-header">
				<h2>Prüfer B - C Basic Steuerrechner</h2>
				<div class="serial-info">
					<span class="serial-label">Seriennummer:</span>
					<span class="serial-value">{form.serialnummer}</span>
				</div>
			</div>

			<div class="form-grid">
				<div class="field">
					<label for="pruefer_b">Prüfer B <span class="required">*</span></label>
					<input id="pruefer_b" bind:value={form.pruefer_b} required />
				</div>

				<div class="section-title">Hardware-Informationen</div>

				<div class="field">
					<label for="software_version">Software-Version <span class="required">*</span></label>
					<input id="software_version" bind:value={form.software_version} required />
				</div>

				<div class="field">
					<label for="seriennummer_elektronik">Seriennummer Elektronik <span class="required">*</span></label>
					<input id="seriennummer_elektronik" bind:value={form.seriennummer_elektronik} required />
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
					<label for="ba_nummer">BA-Nummer <span class="required">*</span></label>
					<input id="ba_nummer" bind:value={form.ba_nummer} required />
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
					<BooleanRadio bind:bindValue={form.zoom_ok} label="Zoom funktioniert" required={true} />
				</div>

				<div class="field field-full-width">
					<BooleanRadio bind:bindValue={form.kameraeingang_ok} label="Kameraeingang funktioniert" required={true} />
				</div>

				<div class="field field-full-width">
					<BooleanRadio bind:bindValue={form.sprache_wechslen_funktioniert} label="Sprache wechseln funktioniert" required={true} />
				</div>

				<div class="field field-full-width">
					<BooleanRadio bind:bindValue={form.sprache_auf_englisch_eingestellt} label="Sprache auf Englisch eingestellt" required={true} />
				</div>

				<div class="field field-full-width">
					<BooleanRadio bind:bindValue={form.lp_verschraubt} label="Leiterplattensteckverbinder verschraubt" required={true} />
				</div>
			</div>

			<div class="button-group">
				<button type="button" class="save-button" on:click={() => showConfirmation('save')}>
					Speichern
				</button>
				<button type="button" class="submit-button" on:click={() => showConfirmation('saveAndPrint')}>
					Speichern & Drucken
				</button>
			</div>
		</form>
	{/if}
</div>

{#if showConfirmDialog}
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div class="dialog-overlay" role="dialog" aria-modal="true" tabindex="-1" on:click={cancelConfirmation}>
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div class="dialog-content" on:click|stopPropagation>
			<div class="dialog-header">
				<h2>Änderungen bestätigen</h2>
				<button class="dialog-close" on:click={cancelConfirmation}>✕</button>
			</div>
			<div class="dialog-body">
				{#if changes.length === 0}
					<p class="no-changes">Keine Änderungen erkannt.</p>
				{:else}
					<p class="changes-intro">Die folgenden Änderungen wurden erkannt:</p>
					<div class="changes-list">
						{#each changes as change}
							<div class="change-item">
								<div class="change-field">{change.label}</div>
								<div class="change-values">
									<div class="old-value">
										<div class="value-label">Vorher</div>
										<div class="value">{formatValue(change.oldValue)}</div>
									</div>
									<div class="arrow">→</div>
									<div class="new-value">
										<div class="value-label">Nachher</div>
										<div class="value">{formatValue(change.newValue)}</div>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
			<div class="dialog-footer">
				<button class="cancel-button" on:click={cancelConfirmation}>Abbrechen</button>
				<button class="confirm-button" on:click={confirmAction}>
					{pendingAction === 'save' ? 'Speichern' : 'Speichern & Drucken'}
				</button>
			</div>
		</div>
	</div>
{/if}

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

	/* Confirmation Dialog Styles */
	.dialog-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.6);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: var(--spacing-lg);
		backdrop-filter: blur(4px);
		animation: fadeInOverlay 0.3s ease-out;
	}

	@keyframes fadeInOverlay {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.dialog-content {
		background: var(--white);
		border-radius: var(--border-radius-lg);
		box-shadow: var(--shadow-lg);
		max-width: 600px;
		width: 100%;
		max-height: 80vh;
		overflow-y: auto;
		animation: slideInDialog 0.3s ease-out;
		border: 1px solid var(--border-light);
	}

	@keyframes slideInDialog {
		from {
			opacity: 0;
			transform: translateY(-20px) scale(0.95);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	.dialog-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--spacing-lg) var(--spacing-xl);
		border-bottom: 2px solid var(--border-light);
		background: linear-gradient(135deg, var(--bg-light), var(--white));
	}

	.dialog-header h2 {
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-bold);
		color: var(--primary-color);
		margin: 0;
	}

	.dialog-close {
		background: none;
		border: none;
		font-size: var(--font-size-xl);
		cursor: pointer;
		color: var(--text-secondary);
		width: 32px;
		height: 32px;
		border-radius: var(--border-radius-full);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all var(--transition-fast);
	}

	.dialog-close:hover {
		background: var(--danger-color);
		color: var(--white);
		transform: scale(1.1);
	}

	.dialog-body {
		padding: var(--spacing-xl);
	}

	.no-changes {
		text-align: center;
		color: var(--text-secondary);
		font-size: var(--font-size-lg);
		margin: 0;
		padding: var(--spacing-lg);
		background: var(--bg-light);
		border-radius: var(--border-radius-md);
		border: 1px solid var(--border-light);
	}

	.changes-intro {
		font-size: var(--font-size-base);
		color: var(--text-primary);
		margin-bottom: var(--spacing-lg);
		font-weight: var(--font-weight-medium);
	}

	.changes-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.change-item {
		background: var(--bg-light);
		border: 1px solid var(--border-light);
		border-radius: var(--border-radius-md);
		padding: var(--spacing-md);
		transition: all var(--transition-fast);
	}

	.change-item:hover {
		background: var(--white);
		box-shadow: var(--shadow-sm);
	}

	.change-field {
		font-weight: var(--font-weight-bold);
		color: var(--primary-color);
		margin-bottom: var(--spacing-sm);
		font-size: var(--font-size-base);
	}

	.change-values {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		gap: var(--spacing-md);
		align-items: center;
	}

	.old-value,
	.new-value {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}

	.value-label {
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-semibold);
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.value {
		font-size: var(--font-size-base);
		color: var(--text-primary);
		background: var(--white);
		padding: var(--spacing-sm);
		border-radius: var(--border-radius-sm);
		border: 1px solid var(--border-light);
		font-family: monospace;
		word-break: break-word;
	}

	.old-value .value {
		background: linear-gradient(135deg, #fef3c7, #fde68a);
		border-color: #d97706;
	}

	.new-value .value {
		background: linear-gradient(135deg, #d1fae5, #a7f3d0);
		border-color: #059669;
	}

	.arrow {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-bold);
		color: var(--primary-color);
		text-align: center;
	}

	.dialog-footer {
		display: flex;
		gap: var(--spacing-md);
		padding: var(--spacing-lg) var(--spacing-xl);
		border-top: 2px solid var(--border-light);
		background: var(--bg-light);
		justify-content: flex-end;
	}

	.cancel-button {
		padding: var(--spacing-md) var(--spacing-xl);
		background: linear-gradient(135deg, var(--text-secondary), #6b7280);
		color: var(--white);
		border: none;
		border-radius: var(--border-radius-md);
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-semibold);
		cursor: pointer;
		transition: all var(--transition-smooth);
		min-height: 48px;
		position: relative;
		overflow: hidden;
	}

	.cancel-button::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
		transition: left 0.6s ease;
	}

	.cancel-button:hover::before {
		left: 100%;
	}

	.cancel-button:hover {
		background: linear-gradient(135deg, #6b7280, #4b5563);
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
	}

	.confirm-button {
		padding: var(--spacing-md) var(--spacing-xl);
		background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
		color: var(--white);
		border: none;
		border-radius: var(--border-radius-md);
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-semibold);
		cursor: pointer;
		transition: all var(--transition-smooth);
		min-height: 48px;
		position: relative;
		overflow: hidden;
	}

	.confirm-button::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
		transition: left 0.6s ease;
	}

	.confirm-button:hover::before {
		left: 100%;
	}

	.confirm-button:hover {
		background: linear-gradient(135deg, var(--primary-hover), var(--primary-active));
		transform: translateY(-2px);
		box-shadow: var(--shadow-lg);
	}

	@media (max-width: 768px) {
		.dialog-overlay {
			padding: var(--spacing-md);
		}

		.dialog-content {
			max-height: 90vh;
		}

		.dialog-header,
		.dialog-body,
		.dialog-footer {
			padding: var(--spacing-lg);
		}

		.change-values {
			grid-template-columns: 1fr;
			gap: var(--spacing-sm);
		}

		.arrow {
			transform: rotate(90deg);
		}

		.dialog-footer {
			flex-direction: column-reverse;
		}

		.cancel-button,
		.confirm-button {
			width: 100%;
		}
	}
</style>
