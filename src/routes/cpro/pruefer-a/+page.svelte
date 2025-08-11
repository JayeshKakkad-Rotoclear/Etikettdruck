<script lang="ts">
  import BooleanRadio from '$lib/components/booleanRadio.svelte';
  import SelectRadio from '$lib/components/selectRadio.svelte';

  let form = getEmptyFormCproA();

  $: {
    if (form.festplattengroesse === 'GB_256') {
      form.artikel_bezeichnung = 'Steuerrechner 256GB fuer Rotoclear C Pro';
      form.artikel_nummer = '10620';
    } else if (form.festplattengroesse === 'TB_1') {
      form.artikel_bezeichnung = 'Steuerrechner 1TB fuer Rotoclear C Pro ';
      form.artikel_nummer = '10650';
    } else if (form.festplattengroesse === 'TB_4') {
      form.artikel_bezeichnung = 'Steuerrechner 4TB fuer Rotoclear C Pro';
      form.artikel_nummer = '10651';
    }
  }

  function getEmptyFormCproA() {
    const today = new Date();
    const formattedDateCpro = today.toISOString().split('T')[0];
    const currentyearCpro = today.getFullYear().toString();
    return {
      artikel_bezeichnung: '',
      serialnummer: '',
      hinweis: '',
      ba_nummer: '',
      artikel_nummer: '',
      software_version: '',
      konfiguration: 'RC',
      seriennummer_elektronik: '',
      mac_adresse: '',
      seriennummer_festplatte: '',
      festplattengroesse: null,
      datum: formattedDateCpro,
      produktionsjahr: currentyearCpro,
      pruefer_a: '',
      hardware_ok: null,
      hdmi_ok: null,
      web_ok: null,
      zoom_ok: null,
      menue_bedienbar: null,
      festplatte_angezeigt: null,
      freier_festplattenspeicher: 'GB_233',
      ip_adresse: null,
      kameraeingang_ok: null,
      zustandsdaten_ok: null,
      zustandsdaten_fehler: '',
      festplatte_leer: null
    };
  }

  async function submitFormCproA() {
    const res = await fetch('/api/cpro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      alert('Form gespeichert. Bitte Prüfer B informieren.');
      form = getEmptyFormCproA();
    } else {
      alert('Fehler beim Speichern');
    }
  }
</script>

<svelte:head>
  <title>C Pro Prüfer A - Prüfprotokoll</title>
</svelte:head>

<div class="form-container">
	<form on:submit|preventDefault={submitFormCproA} class="form">
		<h1>C Pro Prüfprotokoll - Prüfer A</h1>
		<div class="form-grid">
			<div class="field">
				<label for="pruefer_a">Prüfer A</label>
				<input id="pruefer_a" bind:value={form.pruefer_a} />
			</div>

			<div class="section-title">Hardware-Informationen</div>

			<div class="field">
				<label for="serialnummer">Serialnummer</label>
				<input id="serialnummer" bind:value={form.serialnummer} />
			</div>

			<div class="field">
				<label for="hinweis">Hinweis</label>
				<input id="hinweis" bind:value={form.hinweis} />
			</div>

			<div class="field">
				<label for="software_version">Software-Version</label>
				<input id="software_version" bind:value={form.software_version} />
			</div>

			<div class="field">
				<SelectRadio
					label="Konfiguration"
					bind:value={form.konfiguration}
					options={[
						{ label: "RC", value: "RC" },
						// { label: "DMG", value: "DMG" },
						// { label: "DEMO", value: "DEMO" },
						// { label: "EDU", value: "EDU" }
					]}
				/>
			</div>

			<div class="field">
				<label for="seriennummer_elektronik">Seriennummer Elektronik</label>
				<input id="seriennummer_elektronik" bind:value={form.seriennummer_elektronik} />
			</div>

			<div class="field">
				<label for="mac_adresse">MAC-Adresse</label>
				<input id="mac_adresse" bind:value={form.mac_adresse} />
			</div>

			<div class="field">
				<label for="seriennummer_festplatte">Seriennummer Festplatte</label>
				<input id="seriennummer_festplatte" bind:value={form.seriennummer_festplatte} />
			</div>

			<div class="field">
				<SelectRadio
					label="Festplattengröße"
					bind:value={form.festplattengroesse}
					options={[
						{ label: "256 GB", value: "GB_256" },
						{ label: "1 TB", value: "TB_1" },
						{ label: "4 TB", value: "TB_4" }
					]}
				/>
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
				<BooleanRadio bind:bindValue={form.hardware_ok} label="Hardware vollständig und unbeschädigt" />
			</div>
			
			<div class="field field-full-width">
				<BooleanRadio bind:bindValue={form.hdmi_ok} label="HDMI-Verbindung funktioniert" />
			</div>
			
			<div class="field field-full-width">
				<BooleanRadio bind:bindValue={form.web_ok} label="Web funktioniert" />
			</div>
			
			<div class="field field-full-width">
				<BooleanRadio bind:bindValue={form.zoom_ok} label="Zoom funktioniert" />
			</div>
			
			<div class="field field-full-width">
				<BooleanRadio bind:bindValue={form.menue_bedienbar} label="Menü ist bedienbar" />
			</div>
			
			<div class="field field-full-width">
				<BooleanRadio bind:bindValue={form.festplatte_angezeigt} label="Festplatte wird angezeigt" />
			</div>

			<div class="field field-full-width">
				<SelectRadio
					label="Freier Festplattenspeicher"
					bind:value={form.freier_festplattenspeicher}
					options={[
						{ label: "ca. 233 GB", value: "GB_233" },
						{ label: "ca. 890 GB", value: "GB_890" },
						{ label: "ca. 3.7 TB", value: "GB_3700" }
					]}
				/>
			</div>

			<div class="field field-full-width">
				<BooleanRadio bind:bindValue={form.ip_adresse} label="IP-Adresse sichtbar" />
			</div>
			
			<div class="field field-full-width">
				<BooleanRadio bind:bindValue={form.kameraeingang_ok} label="Kameraeingänge funktionieren" />
			</div>
			
			<div class="field field-full-width">
				<BooleanRadio bind:bindValue={form.zustandsdaten_ok} label="Zustandsdaten i.O." />
			</div>

			<div class="field field-full-width">
				<label for="zustandsdaten_fehler">Welche Zustandsdaten werden nicht korrekt dargestellt?</label>
				<input id="zustandsdaten_fehler" bind:value={form.zustandsdaten_fehler} />
			</div>
			
			<div class="field field-full-width">
				<BooleanRadio bind:bindValue={form.festplatte_leer} label="Festplatte leer" />
			</div>
		</div>

		<button type="submit" class="submit-button">Speichern</button>
	</form>
</div>

<style>
	.form-container {
		min-height: 100vh;
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
		box-shadow: 0 0 0 3px rgba(18, 51, 69, 0.1);
		background: var(--bg-light);
	}

	input:hover:not(:focus) {
		border-color: var(--border-color);
	}

	input[readonly] {
		background: var(--bg-muted);
		color: var(--text-muted);
		cursor: not-allowed;
		border-color: var(--border-light);
	}

	input[readonly]:hover {
		border-color: var(--border-light);
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

	.section-title {
		grid-column: 1 / -1;
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-bold);
		color: var(--primary-color);
		margin: var(--spacing-lg) 0 var(--spacing-md) 0;
		padding-bottom: var(--spacing-sm);
		border-bottom: 2px solid var(--border-light);
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
	}
</style>