<script lang="ts">
	let serialnummer = '';
	let error = '';
	let qrSVG = '';
	let showPreview = false;

	async function loadQR() {
		error = '';
		showPreview = false;
		qrSVG = '';

		const res = await fetch(`/api/c2/qr?serialnummer=${encodeURIComponent(serialnummer)}`);
		if (res.ok) {
			const data = await res.json();
			if (data.qr_code) {
				qrSVG = data.qr_code;
				showPreview = true;
			} else {
				error = 'Kein QR-Code gefunden für diese Seriennummer.';
			}
		} else {
			error = 'Fehler beim Abrufen des QR-Codes.';
		}
	}
</script>

<form on:submit|preventDefault={loadQR} class="form">
    <h1>QR-Code Vorschau</h1>
	<div class="field">
		<label for="serialnummer">Seriennummer</label>
		<input id="serialnummer" bind:value={serialnummer} required />
	</div>
	<button type="submit" class="submit-button">Anzeigen</button>

    {#if error}
        <p class="error">{error}</p>
    {/if}

    {#if showPreview}
        <div class="svg-container">{@html qrSVG}</div>
    {/if}
</form>

<style>
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

	.svg-container {
		width: auto;
		height: auto;
		border: 1px solid #ccc;
		padding: 1rem;
		margin: 1rem 0;
        background-color: #f9f9f9;
        display: flex;
        justify-content: center;
	}
</style>