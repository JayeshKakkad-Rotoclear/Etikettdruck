<script lang="ts">
  import { onMount } from 'svelte';

  // Scanning mode variables
  let scannedQRs: string[] = [];
  let groupedEntries: any[] = [];
  let scanInput = '';
  
  // Manual selection mode variables
  let manualMode = false;
  let availableProducts: any[] = [];
  let availableZubehoer: any[] = [];
  let manualSelections: Record<string, { selected: boolean; serialNumber: string; etikettId: string }> = {};
  let manualEntries: any[] = [];
  
  // Common variables
  let submitSuccess = false;
  let error: string | null = null;

  onMount(async () => {
    await loadAvailableProducts();
    await loadAvailableZubehoer();
  });

  async function loadAvailableProducts() {
    try {
      // Load from all product APIs
      const responses = await Promise.all([
        fetch('/api/cpro'),
        fetch('/api/c2'),
        fetch('/api/cbasic'),
        fetch('/api/kk')
      ]);

      const data = await Promise.all(responses.map(r => r.json()));
      
      availableProducts = [
        ...data[0].success ? data[0].items.map((item: any) => ({ ...item, type: 'cpro' })) : [],
        ...data[1].success ? data[1].items.map((item: any) => ({ ...item, type: 'c2' })) : [],
        ...data[2].success ? data[2].items.map((item: any) => ({ ...item, type: 'cbasic' })) : [],
        ...data[3].success ? data[3].items.map((item: any) => ({ ...item, type: 'kk' })) : []
      ];

      // Initialize manual selections
      availableProducts.forEach(product => {
        const key = `${product.type}_${product.serialnummer}`;
        manualSelections[key] = { selected: false, serialNumber: product.serialnummer, etikettId: '' };
      });
    } catch (err) {
      console.error('Error loading products:', err);
    }
  }

  async function loadAvailableZubehoer() {
    try {
      const response = await fetch('/api/zubehoer');
      const data = await response.json();
      
      if (data.success) {
        availableZubehoer = data.items.map((item: any) => ({ ...item, type: 'zubehoer' }));
        
        // Initialize manual selections for Zubehör
        availableZubehoer.forEach(zubehoer => {
          const key = `zubehoer_${zubehoer.id}`;
          manualSelections[key] = { selected: false, serialNumber: '', etikettId: zubehoer.id.toString() };
        });
      }
    } catch (err) {
      console.error('Error loading Zubehör:', err);
    }
  }

  function handleScanInput() {
    const value = scanInput.trim();
    if (value && !scannedQRs.includes(value)) {
      scannedQRs = [...scannedQRs, value];
    }
    scanInput = '';
  }

  function parseQRContent(qr: string): any[] {
    const lines = qr.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    const entry: any = {
      artikelnummer: '',
      artikelbezeichnung: '',
      serialnummer: '',
      menge: 1
    };

    for (const line of lines) {
      if (line.startsWith('Artikelnummer:')) {
        entry.artikelnummer = line.replace('Artikelnummer:', '').trim();
      } else if (line.startsWith('Artikelbezeichnung:')) {
        entry.artikelbezeichnung = line.replace('Artikelbezeichnung:', '').trim();
      } else if (line.startsWith('Seriennummer:')) {
        entry.serialnummer = line.replace('Seriennummer:', '').trim();
      } else {
        // fallback format: artikelnummer bezeichnung - menge
        const fallbackMatch = line.match(/^(.*?)\s+-\s+(\d+)$/);
        if (fallbackMatch) {
          entry.artikelnummer = fallbackMatch[1];
          entry.menge = parseInt(fallbackMatch[2]);
        }
      }
    }

    return [entry];
  }

  $: groupedEntries = manualMode ? manualEntries : scannedQRs.flatMap((qr) => parseQRContent(qr));

  $: manualEntries = Object.entries(manualSelections)
    .filter(([_, selection]) => selection.selected)
    .map(([key, selection]) => {
      if (key.startsWith('zubehoer_')) {
        const zubehoer = availableZubehoer.find(z => z.id.toString() === selection.etikettId);
        return {
          artikelnummer: `ZUBEHOER-${zubehoer?.id}`,
          artikelbezeichnung: `Zubehör Etikett #${zubehoer?.id}`,
          serialnummer: null,
          menge: zubehoer?.entries?.length || 1,
          etikettId: selection.etikettId
        };
      } else {
        const product = availableProducts.find(p => 
          `${p.type}_${p.serialnummer}` === key
        );
        return {
          artikelnummer: product?.artikel_nummer || '',
          artikelbezeichnung: product?.artikel_bezeichnung || '',
          serialnummer: selection.serialNumber,
          menge: 1
        };
      }
    });

  async function submitOuterKarton() {
    try {
      const enriched = groupedEntries.map((e) => ({
        artikelnummer: e.artikelnummer,
        artikelbezeichnung: e.artikelbezeichnung,
        menge: e.menge,
        serialnummer: e.serialnummer || null
      }));

      const res = await fetch('/api/outerkarton', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries: enriched })
      });

      const result = await res.json();
      if (result.success) {
        submitSuccess = true;
        if (manualMode) {
          // Reset manual selections
          Object.keys(manualSelections).forEach(key => {
            manualSelections[key].selected = false;
          });
        } else {
          scannedQRs = [];
        }
      } else {
        error = result.error || 'Error while saving';
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Connection error';
    }
  }

  function switchMode() {
    manualMode = !manualMode;
    error = null;
    submitSuccess = false;
  }
</script>

<form on:submit|preventDefault={submitOuterKarton} class="outer-karton-form">
    <h1 class="page-title">Außenkarton – QR-Scan Übersicht</h1>

    <div class="mode-switcher">
    <button 
        class="mode-button" 
        class:active={!manualMode}
        on:click={() => manualMode = false}
    >
        Scan-Modus
    </button>
    <button 
        class="mode-button" 
        class:active={manualMode}
        on:click={() => manualMode = true}
    >
        Manuelle Auswahl
    </button>
    </div>

    {#if !manualMode}
    <!-- Scanning Mode -->
    <div class="input-section">
        <label for="scanInput" class="input-label">QR-Code scannen oder einfügen:</label>
        <input 
        id="scanInput" 
        type="text" 
        bind:value={scanInput} 
        on:keydown={(e) => e.key === 'Enter' && handleScanInput()} 
        class="scan-input" 
        placeholder="QR-Code scannen oder einfügen" 
        />
    </div>

    {#if scannedQRs.length > 0}
        <div class="results-section">
        <h2 class="section-title">Scans ({scannedQRs.length}):</h2>
        <ul class="scan-list">
            {#each scannedQRs as qr, index}
            <li>QR {index + 1}</li>
            {/each}
        </ul>
        </div>
    {/if}
    {:else}
    <!-- Manual Selection Mode -->
    <div class="manual-section">
        <h2 class="section-title">Produkte manuell auswählen</h2>
        
        <div class="product-categories">
        <!-- C Pro Products -->
        {#if availableProducts.filter(p => p.type === 'cpro').length > 0}
            <div class="category-container">
            <h3 class="category-title">C Pro Steuerrechner</h3>
            {#each availableProducts.filter(p => p.type === 'cpro') as product}
                <div class="product-item">
                <label class="product-label">
                    <input 
                    type="checkbox" 
                    bind:checked={manualSelections[`${product.type}_${product.serialnummer}`].selected}
                    />
                    {product.artikel_bezeichnung} - {product.serialnummer}
                </label>
                </div>
            {/each}
            </div>
        {/if}

        <!-- C2 Products -->
        {#if availableProducts.filter(p => p.type === 'c2').length > 0}
            <div class="category-container">
            <h3 class="category-title">C2 Steuerrechner</h3>
            {#each availableProducts.filter(p => p.type === 'c2') as product}
                <div class="product-item">
                <label class="product-label">
                    <input 
                    type="checkbox" 
                    bind:checked={manualSelections[`${product.type}_${product.serialnummer}`].selected}
                    />
                    {product.artikel_bezeichnung} - {product.serialnummer}
                </label>
                </div>
            {/each}
            </div>
        {/if}

        <!-- C Basic Products -->
        {#if availableProducts.filter(p => p.type === 'cbasic').length > 0}
            <div class="category-container">
            <h3 class="category-title">C Basic Steuerrechner</h3>
            {#each availableProducts.filter(p => p.type === 'cbasic') as product}
                <div class="product-item">
                <label class="product-label">
                    <input 
                    type="checkbox" 
                    bind:checked={manualSelections[`${product.type}_${product.serialnummer}`].selected}
                    />
                    {product.artikel_bezeichnung} - {product.serialnummer}
                </label>
                </div>
            {/each}
            </div>
        {/if}

        <!-- KK Products -->
        {#if availableProducts.filter(p => p.type === 'kk').length > 0}
            <div class="category-container">
            <h3 class="category-title">Kamerakopf</h3>
            {#each availableProducts.filter(p => p.type === 'kk') as product}
                <div class="product-item">
                <label class="product-label">
                    <input 
                    type="checkbox" 
                    bind:checked={manualSelections[`${product.type}_${product.serialnummer}`].selected}
                    />
                    {product.artikel_bezeichnung} - {product.serialnummer}
                </label>
                </div>
            {/each}
            </div>
        {/if}

        <!-- Zubehör Products -->
        {#if availableZubehoer.length > 0}
            <div class="category-container">
            <h3 class="category-title">Zubehör</h3>
            {#each availableZubehoer as zubehoer}
                <div class="product-item">
                <label class="product-label">
                    <input 
                    type="checkbox" 
                    bind:checked={manualSelections[`zubehoer_${zubehoer.id}`].selected}
                    />
                    Zubehör Etikett #{zubehoer.id} ({zubehoer.entries?.length || 0} Artikel)
                </label>
                </div>
            {/each}
            </div>
        {/if}
        </div>
    </div>
    {/if}

    {#if groupedEntries.length > 0}
    <div class="preview-section">
        <h3 class="section-title">Vorschau:</h3>
        <div class="table-container">
        <table class="preview-table">
            <thead>
            <tr>
                <th>Artikelnummer</th>
                <th>Artikelbezeichnung</th>
                <th>Menge</th>
                <th>Seriennummer</th>
            </tr>
            </thead>
            <tbody>
            {#each groupedEntries as entry}
                <tr>
                <td>{entry.artikelnummer}</td>
                <td>{entry.artikelbezeichnung}</td>
                <td>{entry.menge}</td>
                <td>{entry.serialnummer || '-'}</td>
                </tr>
            {/each}
            </tbody>
        </table>
        </div>

        <button class="create-button">
        Etikett erstellen
        </button>
    </div>
    {/if}

    {#if submitSuccess}
    <p class="success">Etikett erfolgreich gespeichert und gedruckt!</p>
    {/if}

    {#if error}
    <p class="error">Fehler: {error}</p>
    {/if}
</form>

<style>

	form.outer-karton-form {
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

  .page-title {
    font-size: 1.5rem;
    font-weight: bold;
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .mode-switcher {
    display: flex;
    gap: 0.5rem;
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .mode-button {
    padding: 0.5rem 1rem;
    border: 1px solid #ccc;
    background: #f9f9f9;
    cursor: pointer;
    border-radius: 4px;
  }

  .mode-button.active {
    background: #123345;
    color: white;
    border-color: #123345;
  }

  .input-section {
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .input-label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  .scan-input {
    width: 100%;
    border: 1px solid #ccc;
    padding: 0.5rem;
    border-radius: 4px;
  }

  .results-section {
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .section-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .scan-list {
    list-style: disc;
    padding-left: 1.5rem;
  }

  .manual-section {
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .product-categories {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .category-container {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 1rem;
    background: #f9f9f9;
  }

  .category-title {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #333;
    border-bottom: 1px solid #ddd;
    padding-bottom: 0.5rem;
  }

  .product-item {
    margin-bottom: 0.75rem;
  }

  .product-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 4px;
    transition: background-color 0.2s;
  }

  .product-label:hover {
    background: #f0f0f0;
  }

  .product-label input[type="checkbox"] {
    width: 1rem;
    height: 1rem;
  }

  .preview-section {
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .table-container {
    margin: 1rem 0;
    overflow-x: auto;
  }

  .preview-table {
    width: 100%;
    border-collapse: collapse;
    border: 1px solid #ddd;
  }

  .preview-table th,
  .preview-table td {
    border: 1px solid #ddd;
    padding: 0.5rem;
    text-align: left;
  }

  .preview-table th {
    background: #f5f5f5;
    font-weight: 600;
  }

  .create-button {
    margin-top: 1rem;
    padding: 0.75rem 1.5rem;
    background: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
  }

  .create-button:hover {
    background: #218838;
  }

  .error {
    color: #dc3545;
    background: #f8d7da;
    border: 1px solid #f5c6cb;
    padding: 0.75rem;
    border-radius: 4px;
    margin: 1rem;
  }

  .success {
    color: #155724;
    background: #d4edda;
    border: 1px solid #c3e6cb;
    padding: 0.75rem;
    border-radius: 4px;
    margin: 1rem;
  }

  @media (max-width: 768px) {
    .page-title {
      font-size: 1.25rem;
      padding: 0.75rem;
    }

    .mode-switcher {
      padding: 0.75rem;
    }

    .mode-button {
      padding: 0.375rem 0.75rem;
      font-size: 0.875rem;
    }

    .input-section,
    .results-section,
    .manual-section,
    .preview-section {
      padding: 0.75rem;
    }

    .product-categories {
      gap: 1rem;
    }

    .category-container {
      padding: 0.75rem;
    }

    .category-title {
      font-size: 1rem;
    }

    .preview-table th,
    .preview-table td {
      padding: 0.375rem;
      font-size: 0.875rem;
    }
  }
</style>
