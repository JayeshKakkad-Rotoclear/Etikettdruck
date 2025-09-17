<script lang="ts">
	import { notificationStore } from '$lib';
	import AutomatiktestLinkPreview from '$lib/components/AutomatiktestLinkPreview.svelte';
	let serialnummer = '';
	let qrContent = '';
	let showPreview = false;
	let loading = false;

	async function loadQR() {
		showPreview = false;
		qrContent = '';
		loading = true;
		try {
			const res = await fetch(`/api/cpro/qr?serialnummer=${encodeURIComponent(serialnummer)}`);
			if (!res.ok) throw new Error('Fehler beim Abrufen');
			const data = await res.json();
			if (data.qr_code) {
				qrContent = data.qr_code;
				showPreview = true;
				notificationStore.success('Automatiktest Link geladen', 'Link erfolgreich geladen.');
			} else {
				notificationStore.error('QR-Code nicht gefunden', 'Kein QR-Code gefunden für diese Seriennummer.');
			}
		} catch (e) {
			notificationStore.error('Abruffehler', 'Fehler beim Abrufen des QR-Codes.');
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
  <title>C Pro QR-Code Vorschau</title>
</svelte:head>

<div class="form-container">
	<form on:submit|preventDefault={loadQR} class="form">
		<h1 class="page-title">
			C Pro QR-Code Vorschau
		</h1>
		
		<div class="input-section">
			<div class="field">
				<label for="serialnummer" class="input-label">Seriennummer eingeben:</label>
				<div class="input-wrapper">
					<input 
						id="serialnummer" 
						bind:value={serialnummer} 
						required 
						class="serial-input"
						disabled={loading}
					/>
					<button type="submit" class="submit-button" disabled={loading || !serialnummer.trim()}>
						{#if loading}
							<span class="loading-spinner"></span>
							Lädt...
						{:else}
							QR-Code anzeigen
						{/if}
					</button>
				</div>
			</div>
		</div>

		{#if showPreview}
			<div class="preview-section">
				<AutomatiktestLinkPreview link={qrContent} />
			</div>
		{/if}
	</form>
</div>

<style>
	.form-container {
		min-height: 100vh;
		padding: var(--spacing-lg) var(--spacing-md);
	}

	.form {
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

	.form::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 4px;
		background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
	}

	.page-title {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-md);
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

	.input-section {
		background: var(--bg-light);
		border-radius: var(--border-radius-lg);
		padding: var(--spacing-xl);
		margin-bottom: var(--spacing-xl);
		border: 1px solid var(--border-light);
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.input-label {
		font-weight: var(--font-weight-semibold);
		color: var(--text-primary);
		font-size: var(--font-size-lg);
		margin-bottom: var(--spacing-sm);
	}

	.input-wrapper {
		display: flex;
		gap: var(--spacing-md);
		align-items: stretch;
	}

	.serial-input {
		flex: 1;
		padding: var(--spacing-md) var(--spacing-lg);
		border: 2px solid var(--border-medium);
		border-radius: var(--border-radius-md);
		font-size: var(--font-size-base);
		font-family: monospace;
		transition: all var(--transition-smooth);
		background: var(--white);
		min-height: 50px;
		box-sizing: border-box;
	}

	.serial-input:focus {
		outline: none;
		border-color: var(--primary-color);
		box-shadow: 0 0 0 3px var(--primary-light);
		background: var(--bg-light);
	}

	.serial-input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}


	.submit-button {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-md) var(--spacing-lg);
		background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
		color: var(--white);
		border: none;
		border-radius: var(--border-radius-md);
		cursor: pointer;
		transition: all var(--transition-smooth);
		font-weight: var(--font-weight-semibold);
		min-height: 50px;
		white-space: nowrap;
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

	.submit-button:hover:not(:disabled) {
		background: linear-gradient(135deg, var(--primary-hover), var(--primary-active));
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
	}

	.submit-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}

	.loading-spinner {
		width: 16px;
		height: 16px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top: 2px solid var(--white);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	.preview-section { background: var(--white); border-radius: var(--border-radius-lg); padding: var(--spacing-xl); border:1px solid var(--border-light); box-shadow: var(--shadow-sm); animation: fadeIn .5s ease-out; }

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

	/* Responsive Design */
	@media (max-width: 768px) {
		.form-container {
			padding: var(--spacing-md) var(--spacing-sm);
		}

		.form {
			padding: var(--spacing-lg);
		}

		.page-title {
			font-size: var(--font-size-xl);
			flex-direction: column;
			gap: var(--spacing-sm);
		}

		.input-wrapper {
			flex-direction: column;
			gap: var(--spacing-sm);
		}

		.input-section,
		.preview-section {
			padding: var(--spacing-lg);
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

		.page-title {
			font-size: var(--font-size-lg);
		}

		.input-section,
		.preview-section {
			padding: var(--spacing-md);
		}
	}

	/* Print Styles */
	@media print {
		.form-container {
			padding: 0;
			background: white;
		}

		.form {
			box-shadow: none;
			border: none;
			max-width: none;
		}

		.input-section {
			display: none;
		}
	}
</style>