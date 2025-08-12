<script lang="ts">
	import BooleanRadio from '$lib/components/booleanRadio.svelte';
	import { Icon } from '$lib';

	let form = getEmptyFormCbasicA();

	function getEmptyFormCbasicA() {
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
			pruefer_a: '',
			hardware_ok: null,
            hutschienenclip_montiert: null,
			hdmi_ok: null,
            zoom_ok: null,
			kameraeingang_ok: null,
            sprache_wechslen_funktioniert: null,
            sprache_auf_englisch_eingestellt: null
		};
	}

    async function submitFormCbasic() {
        const res = await fetch('/api/cbasic', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form)
        });
        if (res.ok) {
            alert('Form gespeichert. Bitte Prüfer B informieren.');
            form = getEmptyFormCbasicA();
        } else {
            alert('Fehler beim Speichern');
        }            
    }
</script>

<svelte:head>
  <title>C Basic Prüfer A - Prüfprotokoll</title>
</svelte:head>

<div class="form-container">
	<form on:submit|preventDefault={submitFormCbasic} class="form">
		<h1>C Basic Prüfprotokoll - Prüfer A</h1>
		<!-- <div class="form-header">
			<h2>Prüfprotokoll erstellen</h2>
		</div> -->

		<div class="form-grid">
			<!-- <div class="section-title">Prüfer-Informationen</div> -->
			
			<div class="field">
				<label for="pruefer_a">Prüfer A</label>
				<input id="pruefer_a" bind:value={form.pruefer_a} />
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

			<div class="section-title">Hardware-Informationen</div>

			<div class="field">
				<label for="serialnummer">Serialnummer</label>
				<input id="serialnummer" bind:value={form.serialnummer} />
			</div>

			<div class="field">
				<label for="seriennummer_elektronik">Seriennummer Elektronik</label>
				<input id="seriennummer_elektronik" bind:value={form.seriennummer_elektronik} />
			</div>

			<div class="field">
				<label for="software_version">Software-Version</label>
				<input id="software_version" bind:value={form.software_version} />
			</div>

			<div class="field field-full-width">
				<label for="hinweis">Hinweis</label>
				<input id="hinweis" bind:value={form.hinweis} />
			</div>

			<div class="section-title">Funktionsprüfungen</div>

			<div class="radio-grid">
				<BooleanRadio bind:bindValue={form.hardware_ok} label="Hardware vollständig und unbeschädigt" />
				<BooleanRadio bind:bindValue={form.hutschienenclip_montiert} label="Hutschienenclip montiert" />
				<BooleanRadio bind:bindValue={form.hdmi_ok} label="HDMI-Verbindung funktioniert" />
				<BooleanRadio bind:bindValue={form.zoom_ok} label="Zoom funktioniert" />
				<BooleanRadio bind:bindValue={form.kameraeingang_ok} label="Kameraeingang funktioniert" />
				<BooleanRadio bind:bindValue={form.sprache_wechslen_funktioniert} label="Sprache wechseln funktioniert" />
				<BooleanRadio bind:bindValue={form.sprache_auf_englisch_eingestellt} label="Sprache auf Englisch eingestellt" />
			</div>
		</div>

		<button type="submit" class="submit-button">
			<Icon name="save" size={16} />
			Speichern
		</button>
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

	/* .form-header {
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
	} */

	/* .form-description {
		color: var(--text-secondary);
		font-size: var(--font-size-base);
		line-height: 1.6;
		margin: 0;
	} */

	.form-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: var(--spacing-lg);
		margin-bottom: var(--spacing-lg);
	}

	.form-grid::before {
		content: '';
		grid-column: 1 / -1;
		height: 1px;
		background: linear-gradient(90deg, transparent, var(--border-light), transparent);
		margin: var(--spacing-md) 0;
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

	.radio-grid {
		grid-column: 1 / -1;
		/* display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: var(--spacing-md);
		margin-top: var(--spacing-md); */
	}

	.submit-button {
		width: 100%;
		padding: var(--spacing-md) var(--spacing-lg);
		background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
		color: var(--white);
		border: none;
		border-radius: var(--border-radius-md);
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		cursor: pointer;
		transition: all var(--transition-smooth);
		margin-top: var(--spacing-lg);
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

	/* .button-icon {
		font-size: var(--font-size-xl);
	} */

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

		.radio-grid {
			grid-template-columns: 1fr;
			gap: var(--spacing-sm);
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

		/* .form-header h2 {
			font-size: var(--font-size-lg);
		} */

		/* .form-description {
			font-size: var(--font-size-sm);
		} */
	}
</style>
