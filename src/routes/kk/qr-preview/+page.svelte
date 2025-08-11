<script lang="ts">
	let serialnummer = '';
	let error = '';
	let qrSVG = '';
	let showPreview = false;
	let isLoading = false;

	async function loadQR() {
		try {
			// Reset state
			error = '';
			showPreview = false;
			qrSVG = '';
			isLoading = true;

			// Validate input
			if (!serialnummer.trim()) {
				throw new Error('Bitte geben Sie eine Seriennummer ein.');
			}

			const res = await fetch(`/api/kk/qr?serialnummer=${encodeURIComponent(serialnummer.trim())}`);
			
			if (!res.ok) {
				throw new Error(`Server Error: ${res.status} ${res.statusText}`);
			}

			const data = await res.json();
			
			if (data.qr_code) {
				qrSVG = data.qr_code;
				showPreview = true;
			} else {
				throw new Error('Kein QR-Code gefunden für diese Seriennummer.');
			}
		} catch (err) {
			console.error('QR Code Generation Error:', err);
			error = err instanceof Error ? err.message : 'Fehler beim Abrufen des QR-Codes.';
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>KK QR-Code Vorschau</title>
</svelte:head>

<div class="form-container">
	<form on:submit|preventDefault={loadQR} class="form">
		<h1 class="page-title">
			KK QR-Code Vorschau
		</h1>

		<div class="input-section">
			<div class="field">
				<label for="serialnummer" class="input-label">
					Seriennummer
				</label>
				<div class="input-wrapper">
					<input 
						id="serialnummer" 
						bind:value={serialnummer}
						class="serial-input"
						disabled={isLoading}
						required 
					/>
					<button 
						type="submit" 
						class="submit-button"
						disabled={isLoading || !serialnummer.trim()}
					>
						{#if isLoading}
							<div class="loading-spinner"></div>
							Lädt...
						{:else}
							QR-Code Anzeigen
						{/if}
					</button>
				</div>
			</div>
		</div>

		{#if error}
			<div class="alert error">
				{error}
			</div>
		{/if}

		{#if showPreview}
			<div class="preview-section">
				<h2 class="section-title">
					QR-Code Vorschau
				</h2>
				<div class="qr-container">
					<div class="qr-wrapper">
						{@html qrSVG}
					</div>
				</div>
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

	.alert {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
		padding: var(--spacing-lg);
		border-radius: var(--border-radius-md);
		font-weight: var(--font-weight-medium);
		margin: var(--spacing-lg) 0;
		animation: slideIn 0.3s ease-out;
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

	.alert.error {
		background: linear-gradient(135deg, #f8d7da, #f5c6cb);
		color: #721c24;
		border: 2px solid #f5c6cb;
	}

	.preview-section {
		background: var(--white);
		border-radius: var(--border-radius-lg);
		padding: var(--spacing-xl);
		border: 1px solid var(--border-light);
		box-shadow: var(--shadow-sm);
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

	.section-title {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-bold);
		color: var(--primary-color);
		margin-bottom: var(--spacing-lg);
		border-bottom: 2px solid var(--border-light);
		padding-bottom: var(--spacing-md);
	}

	.qr-container {
		display: flex;
		gap: var(--spacing-xl);
		align-items: flex-start;
	}

	.qr-wrapper {
		flex: 1;
		background: var(--white);
		border: 2px solid var(--border-light);
		border-radius: var(--border-radius-lg);
		padding: var(--spacing-xl);
		display: flex;
		justify-content: center;
		align-items: center;
		box-shadow: var(--shadow-sm);
		position: relative;
		overflow: hidden;
	}

	.qr-wrapper::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
	}

	.qr-wrapper :global(svg) {
		max-width: 100%;
		height: auto;
		border-radius: var(--border-radius-sm);
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

		.qr-container {
			flex-direction: column;
			gap: var(--spacing-lg);
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

		.section-title {
			font-size: var(--font-size-lg);
			flex-direction: column;
			gap: var(--spacing-xs);
			text-align: center;
		}

		.qr-wrapper {
			padding: var(--spacing-md);
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

		.qr-container {
			flex-direction: column;
			align-items: center;
			gap: var(--spacing-lg);
		}

		.qr-wrapper {
			border: 2px solid #000;
		}
	}
</style>