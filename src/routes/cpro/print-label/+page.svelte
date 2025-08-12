<script lang="ts">
	let serialnummer = '';
	let isLoading = false;
	let message = '';
	let messageType: 'success' | 'error' = 'success';
	let productData: any = null;

	function clearMessage() {
		message = '';
		setTimeout(() => {
			messageType = 'success';
		}, 300);
	}

	function showMessage(text: string, type: 'success' | 'error' = 'success') {
		messageType = type;
		message = text;
		setTimeout(clearMessage, 5000);
	}

	async function loadProductData() {
		if (!serialnummer.trim()) {
			showMessage('Bitte geben Sie eine Seriennummer ein.', 'error');
			return;
		}

		isLoading = true;
		try {
			const response = await fetch(`/api/cpro?serialnummer=${encodeURIComponent(serialnummer.trim())}`);
			
			if (!response.ok) {
				throw new Error(`Server Error: ${response.status} ${response.statusText}`);
			}

			const data = await response.json();
			
			if (data.found && data.item) {
				productData = data.item;
				showMessage('Produkt gefunden! Sie können jetzt das Etikett drucken.', 'success');
			} else {
				productData = null;
				showMessage('Kein Produkt mit dieser Seriennummer gefunden.', 'error');
			}
		} catch (err) {
			console.error('Load Product Error:', err);
			showMessage(err instanceof Error ? err.message : 'Fehler beim Laden des Produkts.', 'error');
			productData = null;
		} finally {
			isLoading = false;
		}
	}

	async function printLabel() {
		if (!productData) {
			showMessage('Kein Produkt geladen.', 'error');
			return;
		}

		isLoading = true;
		try {
			const response = await fetch('/api/cpro', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(productData)
			});

			if (!response.ok) {
				throw new Error(`Server Error: ${response.status} ${response.statusText}`);
			}

			const result = await response.json();
			
			if (result.success) {
				showMessage('Etikett erfolgreich gedruckt!', 'success');
			} else {
				throw new Error(result.error || 'Unbekannter Fehler beim Drucken');
			}
		} catch (err) {
			console.error('Print Label Error:', err);
			showMessage(err instanceof Error ? err.message : 'Fehler beim Drucken des Etiketts.', 'error');
		} finally {
			isLoading = false;
		}
	}

	function resetForm() {
		serialnummer = '';
		productData = null;
		clearMessage();
	}
</script>

<svelte:head>
	<title>C Pro Etikett Drucken</title>
</svelte:head>

<div class="form-container">
	<div class="form">
		<h1 class="page-title">
			C Pro Etikett Drucken
		</h1>

		{#if message}
			<div class="alert {messageType}">
				<span>{message}</span>
				<button type="button" class="close-message" on:click={clearMessage}>✕</button>
			</div>
		{/if}

		<div class="search-section">
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
						on:keydown={(e) => e.key === 'Enter' && loadProductData()}
						required 
					/>
					<button 
						type="button" 
						class="search-button"
						disabled={isLoading || !serialnummer.trim()}
						on:click={loadProductData}
					>
						{#if isLoading}
							<div class="loading-spinner"></div>
							Lädt...
						{:else}
							Suchen
						{/if}
					</button>
				</div>
			</div>
		</div>

		{#if productData}
			<div class="product-section">
				<h2 class="section-title">
					Produkt Details
				</h2>
				<div class="product-info">
					<div class="info-grid">
						<div class="info-item">
							<span class="info-label">Seriennummer:</span>
							<span class="info-value">{productData.serialnummer}</span>
						</div>
						<div class="info-item">
							<span class="info-label">Artikelbezeichnung:</span>
							<span class="info-value">{productData.artikel_bezeichnung}</span>
						</div>
						<div class="info-item">
							<span class="info-label">Artikel-Nummer:</span>
							<span class="info-value">{productData.artikel_nummer}</span>
						</div>
						<div class="info-item">
							<span class="info-label">Produktionsjahr:</span>
							<span class="info-value">{productData.produktionsjahr}</span>
						</div>
                        <div class="info-item">
                            <span class="info-label">Datum:</span>
                            <span class="info-value">{productData.datum}</span>
                        </div>
						<div class="info-item">
							<span class="info-label">Prüfer A:</span>
							<span class="info-value">{productData.pruefer_a || 'Nicht angegeben'}</span>
						</div>
						<div class="info-item">
							<span class="info-label">Prüfer B:</span>
							<span class="info-value">{productData.pruefer_b || 'Nicht angegeben'}</span>
						</div>
					</div>
				</div>

				<div class="action-buttons">
					<button 
						type="button" 
						class="print-button"
						disabled={isLoading}
						on:click={printLabel}
					>
						{#if isLoading}
							<div class="loading-spinner"></div>
							Druckt...
						{:else}
							Etikett Drucken
						{/if}
					</button>
					<button 
						type="button" 
						class="reset-button"
						disabled={isLoading}
						on:click={resetForm}
					>
						Zurücksetzen
					</button>
				</div>
			</div>
		{/if}
	</div>
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
		margin-bottom: var(--spacing-lg);
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.description {
		background: var(--bg-light);
		border-radius: var(--border-radius-md);
		padding: var(--spacing-lg);
		margin-bottom: var(--spacing-xl);
		border: 1px solid var(--border-light);
		text-align: center;
	}

	.alert {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--spacing-md);
		padding: var(--spacing-lg);
		border-radius: var(--border-radius-md);
		font-weight: var(--font-weight-medium);
		margin-bottom: var(--spacing-lg);
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

	.alert.success {
		background: linear-gradient(135deg, #d4edda, #c3e6cb);
		color: #155724;
		border: 2px solid #c3e6cb;
	}

	.alert.error {
		background: linear-gradient(135deg, #f8d7da, #f5c6cb);
		color: #721c24;
		border: 2px solid #f5c6cb;
	}

	.close-message {
		background: none;
		border: none;
		font-size: var(--font-size-lg);
		cursor: pointer;
		color: inherit;
		opacity: 0.7;
		transition: all var(--transition-fast) ease;
		width: 24px;
		height: 24px;
		border-radius: var(--border-radius-sm);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.close-message:hover {
		opacity: 1;
		background: rgba(0, 0, 0, 0.1);
		transform: scale(1.1);
	}

	.search-section {
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

	.search-button {
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

	.search-button:hover:not(:disabled) {
		background: linear-gradient(135deg, var(--primary-hover), var(--primary-active));
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
	}

	.search-button:disabled {
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

	.product-section {
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

	.product-info {
		margin-bottom: var(--spacing-xl);
	}

	.info-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: var(--spacing-md);
	}

	.info-item {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
		padding: var(--spacing-md);
		background: var(--bg-light);
		border-radius: var(--border-radius-md);
		border: 1px solid var(--border-light);
		transition: all var(--transition-fast) ease;
	}

	.info-item:hover {
		background: var(--white);
		box-shadow: var(--shadow-sm);
	}

	.info-label {
		font-weight: var(--font-weight-semibold);
		color: var(--text-secondary);
		font-size: var(--font-size-sm);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.info-value {
		font-size: var(--font-size-base);
		color: var(--text-primary);
		font-weight: var(--font-weight-medium);
		font-family: monospace;
	}

	.action-buttons {
		display: flex;
		gap: var(--spacing-md);
		justify-content: center;
		flex-wrap: wrap;
	}

	.print-button {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-lg) var(--spacing-xl);
		background: linear-gradient(135deg, var(--success-color), var(--success-hover));
		color: var(--white);
		border: none;
		border-radius: var(--border-radius-md);
		cursor: pointer;
		transition: all var(--transition-smooth);
		font-weight: var(--font-weight-semibold);
		font-size: var(--font-size-lg);
		min-height: 60px;
		box-shadow: var(--shadow-md);
		position: relative;
		overflow: hidden;
	}

	.print-button::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
		transition: left 0.6s ease;
	}

	.print-button:hover::before {
		left: 100%;
	}

	.print-button:hover:not(:disabled) {
		background: linear-gradient(135deg, var(--success-hover), #0f7037);
		transform: translateY(-3px);
		box-shadow: var(--shadow-lg);
	}

	.print-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}

	.reset-button {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-lg) var(--spacing-xl);
		background: linear-gradient(135deg, var(--danger-color), var(--danger-hover));
		color: var(--white);
		border: none;
		border-radius: var(--border-radius-md);
		cursor: pointer;
		transition: all var(--transition-smooth);
		font-weight: var(--font-weight-semibold);
		font-size: var(--font-size-base);
		min-height: 60px;
		box-shadow: var(--shadow-md);
		position: relative;
		overflow: hidden;
	}

	.reset-button::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
		transition: left 0.6s ease;
	}

	.reset-button:hover::before {
		left: 100%;
	}

	.reset-button:hover:not(:disabled) {
		background: linear-gradient(135deg, var(--danger-hover), #b91c1c);
		transform: translateY(-3px);
		box-shadow: var(--shadow-lg);
	}

	.reset-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
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
		}

		.input-wrapper {
			flex-direction: column;
			gap: var(--spacing-sm);
		}

		.info-grid {
			grid-template-columns: 1fr;
		}

		.action-buttons {
			flex-direction: column;
			align-items: center;
		}

		.print-button,
		.reset-button {
			width: 100%;
			max-width: 300px;
			justify-content: center;
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
		}

		.info-item {
			padding: var(--spacing-sm) var(--spacing-md);
		}

		.action-buttons {
			gap: var(--spacing-sm);
		}

		.print-button,
		.reset-button {
			min-height: 50px;
			font-size: var(--font-size-base);
			padding: var(--spacing-md) var(--spacing-lg);
		}
	}
</style>
