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
      konfiguration: null,
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

<form on:submit|preventDefault={submitFormCproA} class="form">
	<h1>C Pro Prüfprotokoll - Prüfer A</h1>
	<div class="field">
		<label for="pruefer_a">Prüfer A</label>
		<input id="pruefer_a" bind:value={form.pruefer_a} />
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

	<SelectRadio
		label="Festplattengröße"
		bind:value={form.festplattengroesse}
		options={[
			{ label: "256 GB", value: "GB_256" },
			{ label: "1 TB", value: "TB_1" },
			{ label: "4 TB", value: "TB_4" }
		]}
	/>

	<BooleanRadio bind:bindValue={form.hardware_ok} label="Hardware vollständig und unbeschädigt" />
	<BooleanRadio bind:bindValue={form.hdmi_ok} label="HDMI-Verbindung funktioniert" />
	<BooleanRadio bind:bindValue={form.web_ok} label="Web funktioniert" />
    <BooleanRadio bind:bindValue={form.zoom_ok} label="Zoom funktioniert" />
	<BooleanRadio bind:bindValue={form.menue_bedienbar} label="Menü ist bedienbar" />
	<BooleanRadio bind:bindValue={form.festplatte_angezeigt} label="Festplatte wird angezeigt" />

	<SelectRadio
	label="Freier Festplattenspeicher"
	bind:value={form.freier_festplattenspeicher}
	options={[
		{ label: "ca. 233 GB", value: "GB_233" },
		{ label: "ca. 890 GB", value: "GB_890" },
		{ label: "ca. 3.7 TB", value: "GB_3700" }
	]}
	/>

	<BooleanRadio bind:bindValue={form.ip_adresse} label="IP-Adresse sichtbar" />
	<BooleanRadio bind:bindValue={form.kameraeingang_ok} label="Kameraeingänge funktionieren" />
	<BooleanRadio bind:bindValue={form.zustandsdaten_ok} label="Zustandsdaten i.O." />

	<div class="field">
		<label for="zustandsdaten_fehler">Welche Zustandsdaten werden nicht korrekt dargestellt?</label>
		<input id="zustandsdaten_fehler" bind:value={form.zustandsdaten_fehler} />
	</div>
    <BooleanRadio bind:bindValue={form.festplatte_leer} label="Festplatte leer" />

	<button type="submit" class="submit-button">Speichern</button>
</form>

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