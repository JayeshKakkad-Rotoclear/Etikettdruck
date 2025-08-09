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
</script>

<svelte:head>
	<title>C Basic Prüfer B - Prüfprotokoll</title>
</svelte:head>

<form on:submit|preventDefault={loadSerialDataCbasic} class="form">
    <h1>C Basic Prüfprotokoll - Prüfer B</h1>
	<div class="field">
		<label for="serialSearch">Seriennummer</label>
		<input id="serialSearch" bind:value={serialToFindCbasic} required />
		<button type="submit" class="submit-button">Laden</button>
	</div>    
	{#if serialErrorCbasic}<p class="error">{serialErrorCbasic}</p>{/if}
</form>    

{#if showFormCbasic}
<form on:submit|preventDefault={submitFormCbasicB} class="form">
    <h1>C Basic Prüfprotokoll - Prüfer B</h1>
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
        <input id="artikel_nummer" bind:value={form.artikel_nummer} />
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

        <div class="field">
            <label for="seriennummer_elektronik">Seriennummer Elektronik</label>
            <input id="seriennummer_elektronik" bind:value={form.seriennummer_elektronik} />
        </div>        

        <BooleanRadio bind:bindValue={form.hardware_ok} label="Hardware vollständig und unbeschädigt" />
        <BooleanRadio bind:bindValue={form.hutschienenclip_montiert} label="Hutschienenclip montiert" />
        <BooleanRadio bind:bindValue={form.hdmi_ok} label="HDMI-Verbindung funktioniert" />
        <BooleanRadio bind:bindValue={form.zoom_ok} label="Zoom funktioniert" />
        <BooleanRadio bind:bindValue={form.kameraeingang_ok} label="Kameraeingang funktioniert" />
        <BooleanRadio bind:bindValue={form.sprache_wechslen_funktioniert} label="Sprache wechseln funktioniert" />
        <BooleanRadio bind:bindValue={form.sprache_auf_englisch_eingestellt} label="Sprache auf Englisch eingestellt" />
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
