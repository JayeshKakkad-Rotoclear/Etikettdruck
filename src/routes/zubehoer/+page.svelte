<script lang="ts">
  import { onMount } from 'svelte';

  type Item = {
    id: string;
    artikelnummer: string;
    artikelbezeichnung: string;
    selected: boolean | null;
    menge: number;
  };

  const initialItems = [
    {
      category: 'C-Extender',
      items: [
        { artikelnummer: '10370', artikelbezeichnung: 'Rotoclear C-Extender' },
        { artikelnummer: '10413', artikelbezeichnung: 'Halterung fuer Rotoclear C-Extender' },
      ],
    },
    {
      category: 'Halterung KK',
      items: [
        { artikelnummer: '10144', artikelbezeichnung: 'Flex-Armhalter (Blecheinbau)' },
        { artikelnummer: '10178', artikelbezeichnung: 'Flex-Armhalter (Vorwandmontage)' },
        { artikelnummer: '10222', artikelbezeichnung: 'Flex-Armhalter (Magnethalter)' },
        { artikelnummer: '10229', artikelbezeichnung: 'Kugelhalterung' },
        { artikelnummer: '10147', artikelbezeichnung: 'Verlängerungsstück fuer Flex-Armhalterung' },
      ],
    },
    {
      category: 'Datenkabel',
      items: [
        { artikelnummer: '10035', artikelbezeichnung: 'Datenkabel mit 2x M12-Stecker (10m)' },
        { artikelnummer: '10036', artikelbezeichnung: 'Datenkabel mit 2x M12-Stecker (20m)' },
		{ artikelnummer: '10358', artikelbezeichnung: 'Datenkabel mit 2x M12-Stecker (männlich - weiblich), x-kodiert. Länge: 20m' },
      ],
    },
    {
      category: 'Extras',
      items: [
        { artikelnummer: '10091', artikelbezeichnung: 'Stromkabel (2m)' },
		{ artikelnummer: '10343', artikelbezeichnung: 'Netzteil 230V -> 24V fuer Rotoclear Produkte' },
		{ artikelnummer: '10344', artikelbezeichnung: 'Schutzschlauchsystem 1,5m fuer Flex-Armhalter' },
		{ artikelnummer: '10086', artikelbezeichnung: 'Ersatzscheibe (rotierende Scheibe) fuer Kamerakopf' },
        { artikelnummer: '10038', artikelbezeichnung: 'Sperrluftleitung 5m (6x1mm)' },
        { artikelnummer: '10299', artikelbezeichnung: 'Durchgangsventil fuer Sperrluftschlauch 6mm' },
      ],
    }
  ];

  let selectedCategories: Record<string, boolean | null> = {};
  let itemSelections: Record<string, { selected: boolean | null; menge: number }> = {};
  let serialnummer = '';
  let lieferscheinnummer = '';

  onMount(() => {
    for (const block of initialItems) {
      selectedCategories[block.category] = null;
      for (const item of block.items) {
        itemSelections[item.artikelnummer] = { selected: null, menge: 1 };
      }
    }
  });

async function submitForm() {
    await submitFormInternal(false);
}

async function saveOnlyForm() {
    await submitFormInternal(true);
}

async function submitFormInternal(skipPrint: boolean = false) {
    const selectedItems = Object.entries(itemSelections)
        .filter(([_, v]) => v.selected === true)
        .map(([artikelnummer]) => {
            const item = initialItems.flatMap((c) => c.items).find((i) => i.artikelnummer === artikelnummer);
            const itemData = {
                artikelnummer,
                artikelbezeichnung: item?.artikelbezeichnung ?? '',
                menge: itemSelections[artikelnummer].menge,
            };
            
            if (artikelnummer === '10370' && serialnummer) {
                return { ...itemData, serialnummer };
            }
            
            return itemData;
        });

    const payload: any = {
        items: selectedItems,
        lieferscheinnummer: lieferscheinnummer.trim() || null,
        skipPrint: skipPrint
    };

    const res = await fetch('/api/zubehoer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!res.ok) {
        const error = await res.json();
        alert('Fehler beim Speichern: ' + error.error);
        return;
    } else {
            alert(skipPrint ? 'Formular gespeichert!' : 'Etikett erfolgreich erstellt!');
            serialnummer = '';
            lieferscheinnummer = '';
            for (const block of initialItems) {
                    selectedCategories[block.category] = null;
                    for (const item of block.items) {
                            itemSelections[item.artikelnummer] = { selected: null, menge: 1 };
                    }
            }
    }

    if (!skipPrint) {
        const result = await res.json();
        if (result.success) {
            const zplBlob = new Blob([result.zpl], { type: 'text/plain' });
            const zplUrl = URL.createObjectURL(zplBlob);
            const a = document.createElement('a');
            a.href = zplUrl;
            a.download = `zubehoer-etikett-${Date.now()}.zpl`;
            a.click();
        } else {
            alert('Fehler beim Senden: ' + result.error);
        }
    }
}
</script>

<svelte:head>
  <title>Zubehör Etikett - Erstellen</title>
</svelte:head>

<div class="form-container">
	<form on:submit|preventDefault={submitForm} class="form">
        <div class="header-section">
            <h1>Zubehör Etikett erstellen</h1>
            <a href="/zubehoer/print-label" class="print-link">
                Etikett nachdrucken
            </a>
        </div>

		<div class="lieferschein-section">
			<label class="control-label" for="lieferscheinnummer">Lieferschein-Nummer:</label>
			<input 
				type="text" 
				bind:value={lieferscheinnummer}
				class="lieferschein-input" 
				id="lieferscheinnummer"
				required
			/>
		</div>

		<div class="categories-grid">
			{#each initialItems as categoryBlock}
				<div class="category-container">
					<div class="category-header">
						<h3 class="category-title">{categoryBlock.category}</h3>
						<div class="category-radio-group">
							<label class="radio-option" class:active={selectedCategories[categoryBlock.category] === true}>
								<input
									type="radio"
									name={categoryBlock.category}
									on:change={() => selectedCategories[categoryBlock.category] = true}
								/>
								<span class="radio-text">Ja</span>
							</label>
							<label class="radio-option" class:active={selectedCategories[categoryBlock.category] === false}>
								<input
									type="radio"
									name={categoryBlock.category}
									on:change={() => selectedCategories[categoryBlock.category] = false}
								/>
								<span class="radio-text">Nein</span>
							</label>
						</div>
					</div>

					{#if selectedCategories[categoryBlock.category] === true}
						<div class="items-container">
							{#each categoryBlock.items as item}
								<div class="item-group">
									<div class="item-header">
										<span class="item-title">{item.artikelbezeichnung}</span>
										<div class="item-radio-group">
											<label class="radio-option small" class:active={itemSelections[item.artikelnummer].selected === true}>
												<input
													type="radio"
													name={item.artikelnummer}
													on:change={() => itemSelections[item.artikelnummer].selected = true}
												/>
												<span class="radio-text">Ja</span>
											</label>
											<label class="radio-option small" class:active={itemSelections[item.artikelnummer].selected === false}>
												<input
													type="radio"
													name={item.artikelnummer}
													on:change={() => itemSelections[item.artikelnummer].selected = false}
												/>
												<span class="radio-text">Nein</span>
											</label>
										</div>
									</div>

									{#if itemSelections[item.artikelnummer].selected === true}
										<div class="item-details">
											<div class="quantity-section">
												<label class="control-label" for="quantity-{item.artikelnummer}">Menge:</label>
												<select bind:value={itemSelections[item.artikelnummer].menge} class="quantity-select" id="quantity-{item.artikelnummer}">
													{#each [1, 2, 3, 4, 5] as n}
														<option value={n}>{n}</option>
													{/each}
												</select>
											</div>

											{#if item.artikelnummer === '10370'}
												<div class="serial-section">
													<label class="control-label" for="serial-{item.artikelnummer}">Serialnummer:</label>
													<input 
														type="text" 
														bind:value={serialnummer}
														class="serial-input" 
														id="serial-{item.artikelnummer}"
													/>
												</div>
											{/if}
										</div>
									{/if}
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
		</div>

		<div class="submit-section">
			<button type="button" on:click={saveOnlyForm} class="submit-button save-only">
				Speichern
			</button>
			<button type="submit" class="submit-button">
				Speichern & Drucken
			</button>
		</div>
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
		margin: 0;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.header-section {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-xl);
		flex-wrap: wrap;
		gap: var(--spacing-md);
	}

	.print-link {
		color: var(--primary-color);
		text-decoration: none;
		font-weight: var(--font-weight-medium);
		padding: var(--spacing-sm) var(--spacing-md);
		border: 1px solid var(--primary-color);
		border-radius: var(--border-radius-sm);
		transition: all var(--transition-smooth);
		white-space: nowrap;
		font-size: var(--font-size-sm);
	}

	.print-link:hover {
		background: var(--primary-color);
		color: var(--white);
	}

	.form {
		max-width: 1000px;
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

	.lieferschein-section {
		background: var(--bg-light);
		border: 2px solid var(--border-light);
		border-radius: var(--border-radius-lg);
		padding: var(--spacing-lg);
		margin-bottom: var(--spacing-xl);
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
		transition: all var(--transition-smooth);
	}

	.lieferschein-section:hover {
		border-color: var(--primary-light);
		box-shadow: var(--shadow-sm);
	}

	.lieferschein-input {
		flex: 1;
		padding: var(--spacing-md);
		border: 2px solid var(--border-medium);
		border-radius: var(--border-radius-md);
		background: var(--white);
		font-size: var(--font-size-base);
		transition: all var(--transition-smooth);
		min-height: 48px;
	}

	.lieferschein-input:focus {
		outline: none;
		border-color: var(--primary-color);
		box-shadow: 0 0 0 3px var(--primary-light);
	}

	.lieferschein-input:hover:not(:focus) {
		border-color: var(--border-color);
		box-shadow: var(--shadow-sm);
	}

	.categories-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
		gap: var(--spacing-xl);
		margin-bottom: var(--spacing-xl);
	}

	.category-container {
		background: var(--bg-light);
		border: 2px solid var(--border-light);
		border-radius: var(--border-radius-lg);
		padding: var(--spacing-lg);
		transition: all var(--transition-smooth);
		position: relative;
		overflow: hidden;
	}

	.category-container::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
	}

	.category-container:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-lg);
		border-color: var(--primary-light);
	}

	.category-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--spacing-lg);
		padding-bottom: var(--spacing-md);
		border-bottom: 1px solid var(--border-medium);
	}

	.category-title {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-bold);
		color: var(--primary-color);
		margin: 0;
	}

	.category-radio-group {
		display: flex;
		gap: var(--spacing-sm);
	}

	.radio-option {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-xs);
		padding: var(--spacing-sm) var(--spacing-md);
		border: 2px solid var(--border-medium);
		border-radius: var(--border-radius-md);
		background: var(--white);
		cursor: pointer;
		transition: all var(--transition-smooth);
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-medium);
		min-height: 40px;
		min-width: 60px;
		box-sizing: border-box;
	}

	.radio-option.small {
		padding: var(--spacing-xs) var(--spacing-sm);
		font-size: var(--font-size-sm);
		min-height: 36px;
		min-width: 50px;
	}

	.radio-option:hover {
		border-color: var(--primary-color);
		background: var(--primary-light);
		transform: translateY(-1px);
		box-shadow: var(--shadow-sm);
	}

	.radio-option.active {
		background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
		color: var(--white);
		border-color: var(--primary-color);
		box-shadow: var(--shadow-md);
	}

	.radio-option input[type="radio"] {
		opacity: 0;
		position: absolute;
		margin: 0;
	}

	.radio-text {
		font-weight: inherit;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.items-container {
		background: var(--white);
		border-radius: var(--border-radius-md);
		padding: var(--spacing-lg);
		border: 1px solid var(--border-light);
		box-shadow: var(--shadow-sm);
		animation: slideDown 0.3s ease-out;
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.item-group {
		margin-bottom: var(--spacing-lg);
		padding-bottom: var(--spacing-md);
		border-bottom: 1px solid var(--border-light);
	}

	.item-group:last-child {
		border-bottom: none;
		margin-bottom: 0;
	}

	.item-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--spacing-md);
		margin-bottom: var(--spacing-md);
	}

	.item-title {
		font-weight: var(--font-weight-semibold);
		color: var(--text-primary);
		font-size: var(--font-size-base);
		flex: 1;
		min-width: 200px;
	}

	.item-radio-group {
		display: flex;
		gap: var(--spacing-xs);
		flex-shrink: 0;
	}

	.item-details {
		background: var(--bg-light);
		padding: var(--spacing-md);
		border-radius: var(--border-radius-md);
		display: flex;
		gap: var(--spacing-lg);
		align-items: center;
		flex-wrap: wrap;
		animation: fadeIn 0.3s ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-5px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.quantity-section,
	.serial-section {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
	}

	.control-label {
		font-weight: var(--font-weight-semibold);
		color: var(--text-secondary);
		font-size: var(--font-size-sm);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		white-space: nowrap;
	}

	.quantity-select {
		padding: var(--spacing-sm) var(--spacing-md);
		border: 2px solid var(--border-medium);
		border-radius: var(--border-radius-md);
		background: var(--white);
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-medium);
		cursor: pointer;
		transition: all var(--transition-smooth);
		min-height: 40px;
	}

	.quantity-select:focus {
		outline: none;
		border-color: var(--primary-color);
		box-shadow: 0 0 0 3px var(--primary-light);
	}

	.quantity-select:hover {
		border-color: var(--border-color);
		box-shadow: var(--shadow-sm);
	}

	.serial-input {
		padding: var(--spacing-sm) var(--spacing-md);
		border: 2px solid var(--border-medium);
		border-radius: var(--border-radius-md);
		background: var(--white);
		font-size: var(--font-size-base);
		transition: all var(--transition-smooth);
		min-height: 40px;
		box-sizing: border-box;
		width: 150px;
	}

	.serial-input:focus {
		outline: none;
		border-color: var(--primary-color);
		box-shadow: 0 0 0 3px var(--primary-light);
		background: var(--bg-light);
	}

	.serial-input:hover:not(:focus) {
		border-color: var(--border-color);
		box-shadow: var(--shadow-sm);
	}
	
	.submit-button {
		width: 100%;
		max-width: 400px;
		margin: var(--spacing-xl) auto 0 auto;
		padding: var(--spacing-lg) var(--spacing-xl);
		background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
		color: var(--white);
		border: none;
		border-radius: var(--border-radius-md);
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		cursor: pointer;
		transition: all var(--transition-smooth);
		min-height: 64px;
		text-transform: uppercase;
		letter-spacing: 1px;
		box-shadow: var(--shadow-md);
		position: relative;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-md);
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
		transform: translateY(-3px);
		box-shadow: var(--shadow-lg);
	}

	.submit-button:active {
		transform: translateY(-1px);
		box-shadow: var(--shadow-md);
	}

	.submit-section {
		display: flex;
		gap: var(--spacing-md);
		justify-content: center;
		margin: var(--spacing-xl) 0 0 0;
	}

	.submit-section .submit-button {
		flex: 1;
		margin: 0;
	}

	.submit-button.save-only {
		background: linear-gradient(135deg, var(--success-color), var(--success-hover));
	}

	.submit-button.save-only:hover {
		background: linear-gradient(135deg, var(--success-hover), var(--success-color));
	}

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

		.header-section {
			flex-direction: column;
			align-items: stretch;
			text-align: center;
		}

		.print-link {
			align-self: center;
		}

		.categories-grid {
			grid-template-columns: 1fr;
			gap: var(--spacing-lg);
		}

		.category-header {
			flex-direction: column;
			gap: var(--spacing-md);
			align-items: flex-start;
		}

		.category-radio-group {
			width: 100%;
		}

		.category-radio-group .radio-option {
			flex: 1;
		}

		.item-header {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--spacing-sm);
		}

		.item-radio-group {
			width: 100%;
		}

		.item-radio-group .radio-option {
			flex: 1;
		}

		.item-details {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--spacing-md);
		}

		.item-title {
			min-width: unset;
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

		.category-container {
			padding: var(--spacing-md);
		}

		.items-container {
			padding: var(--spacing-md);
		}

		.category-radio-group {
			width: 100%;
		}

		.radio-option {
			flex: 1;
			justify-content: center;
			min-width: 0;
		}

		.item-radio-group {
			width: 100%;
		}

		.item-radio-group .radio-option {
			flex: 1;
			justify-content: center;
			min-width: 0;
		}

		.submit-button {
			min-height: 48px;
		}

		.serial-input {
			width: 100%;
		}
	}
</style>