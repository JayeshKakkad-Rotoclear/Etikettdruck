<script lang="ts">
  import BooleanRadio from '$lib/components/booleanRadio.svelte';
  import SelectRadio from '$lib/components/selectRadio.svelte';

  let form = getEmptyFormKKA();

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
    } else if (form.anzahl_optiken === 'Zwei_Optiken' && form.optik_format === 'F1_F2') {
      form.artikel_bezeichnung = 'Kamerakopf F1+F2';
      form.artikel_nummer = '10085';
    } else if (form.anzahl_optiken === 'Zwei_Optiken' && form.optik_format === 'F1_TFT') {
      form.artikel_bezeichnung = 'Kamerakopf F1+TFT';
      form.artikel_nummer = '10691';
    } else if (form.anzahl_optiken === 'Zwei_Optiken' && form.optik_format === 'F2_TFT') {
      form.artikel_bezeichnung = 'Kamerakopf F2+TFT';
      form.artikel_nummer = '10692';
    }
  }

  function getEmptyFormKKA() {
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
      pruefer_a: '',
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
      anzahl_optiken: 'Ein_Optik',
      optik_format: null,
      fokuslage_ok: null,
      optik_wechseln_funktioniert: null,
      siegellack_aufgebracht: null,
    };
  }

  async function submitFormKKA() {
    const res = await fetch('/api/kk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      alert('Form gespeichert. Bitte Prüfer B informieren.');
      form = getEmptyFormKKA();
    } else {
      alert('Fehler beim Speichern');
    }
  }
</script>

<svelte:head>
	<title>Kamerakopf Prüfer A - Prüfprotokoll</title>
</svelte:head>

<form on:submit|preventDefault={submitFormKKA} class="form">
	<h1>Kamerakopf Prüfprotokoll - Prüfer A</h1>
	<div class="field">
		<label for="pruefer_a">Prüfer A</label>
		<input id="pruefer_a" bind:value={form.pruefer_a} />
	</div>

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

    <SelectRadio
      label="Konfiguration"
      bind:value={form.KonfigurationKK}
      options={[
        { label: "RC", value: "RC" },
        { label: "DMG", value: "DMG" }
      ]}
    />
  {#if form.KonfigurationKK === 'DMG'}
    <BooleanRadio bind:bindValue={form.pigtail_schrumpfschlauch} label="Pigtail Schrumpfschlauch montiert" />
    <BooleanRadio bind:bindValue={form.pigtail_drehmoment} label="Pigtail Drehmoment korrekt" />
  {/if}

	<div class="field">
		<label for="serialnummer">Serialnummer</label>
		<input id="serialnummer" bind:value={form.serialnummer} />
	</div>

	<div class="field">
		<label for="hinweis">Hinweis</label>
		<input id="hinweis" bind:value={form.hinweis} />
	</div>
    
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

	<BooleanRadio bind:bindValue={form.hardware_ok} label="Hardware vollständig und unbeschädigt" />
    <BooleanRadio bind:bindValue={form.optikglas_ok} label="Optikglas Staub- und Fettfrei" />
    <BooleanRadio bind:bindValue={form.rotor_ok} label="Rotor dreht frei(von Hand)" />
    <BooleanRadio bind:bindValue={form.klebung_rotor_ok} label="Klebung Rotor i.O." />
    <BooleanRadio bind:bindValue={form.kleber_2k_ok} label="2K-Kleber Lichtmodul i.O." />
    <BooleanRadio bind:bindValue={form.dichtring_datenkabel_eingelegt} label="Dichtring(grün) für Datenkabel eingelegt" />
    <BooleanRadio bind:bindValue={form.druckluftanscluss_montiert} label="Fest Druckluftanschluss montiert" />
    <BooleanRadio bind:bindValue={form.uberdrucktest_ok} label="Überdrucktest durchgeführt" />
    <BooleanRadio bind:bindValue={form.lichtmodul_ok} label="10x Lichtmodul auf Funktion überprüft" />
    <BooleanRadio bind:bindValue={form.motor_ok} label="10x Motor auf Funktion überprüft" />
    <BooleanRadio bind:bindValue={form.motor_dauerhaft_drehbar} label="Motor im Dauerlauf überprüft(min. 30 Min.)" />
    <div class="field">
        <label for="laufzeit_motor">Laufzeit des Motors eintragen</label>
        <input id="laufzeit_motor" bind:value={form.laufzeit_motor} />
    </div>
    <BooleanRadio bind:bindValue={form.drucksensor_ok} label="Drucksensor funktioniert" />
    <BooleanRadio bind:bindValue={form.lagesensor_ok} label="Lagesensor funktioniert" />
    <BooleanRadio bind:bindValue={form.fokuslage_ok} label="Fokuslage korrekt eingestellt" />
    {#if form.anzahl_optiken === 'Zwei_Optiken'}
        <BooleanRadio bind:bindValue={form.optik_wechseln_funktioniert} label="Optik wechseln funktioniert" />
    {/if}
    <BooleanRadio bind:bindValue={form.siegellack_aufgebracht} label="Siegellack aufgebracht" />

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