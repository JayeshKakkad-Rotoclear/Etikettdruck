<script lang="ts">
	import BooleanRadio from '$lib/components/booleanRadio.svelte';

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

<form on:submit|preventDefault={submitFormCbasic} class="form">
	<h1>C Basic Prüfprotokoll - Prüfer A</h1>
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
