<script lang="ts">
  import { onMount } from 'svelte';
  import { slide } from 'svelte/transition';
  import { notificationStore } from '$lib';

  // Scanning mode variables
  let scannedQRs: string[] = [];
  let scanInput = '';
  
  // Manual selection mode variables
  let manualMode = false;
  let availableProducts: any[] = [];
  let availableZubehoer: any[] = [];
  let manualSelections: Record<string, { selected: boolean; serialNumber: string; etikettId: string }> = {};
  let expandedManualEntries: any[] = [];
  let isExpandingZubehoer = false;
  
  // Collapsible categories state
  let expandedCategories: Record<string, boolean> = {
    cpro: false,
    c2: false,
    cbasic: false,
    kk: false,
    zubehoer: false
  };
  
  // Common variables
  let lieferscheinNumber = '';  // New field for Lieferschein number
  let finalGroupedEntries: any[] = [];  // Combined entries for display and submission
  let error: string | null = null;
  let submitSuccess = false;

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
      notificationStore.error('Fehler beim Laden', 'Fehler beim Laden der verfügbaren Produkte.');
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
      notificationStore.error('Fehler beim Laden', 'Fehler beim Laden des verfügbaren Zubehörs.');
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
    
    // Check if this is a Zubehör QR code
    const lieferscheinLine = lines.find(line => line.startsWith('Lieferschein:'));
    if (lieferscheinLine) {
      // This is a Zubehör QR code, parse individual items
      const entries = [];
      
      for (const line of lines) {
        // Look for individual product lines: "artikelnummer - artikelbezeichnung - menge"
        const productMatch = line.match(/^(\S+)\s+-\s+(.*?)\s+-\s+(\d+)$/);
        if (productMatch) {
          const [, artikelnummer, artikelbezeichnung, menge] = productMatch;
          entries.push({
            artikelnummer: artikelnummer.trim(),
            artikelbezeichnung: artikelbezeichnung.trim(),
            serialnummer: null,
            menge: parseInt(menge)
          });
        }
      }
      
      return entries.length > 0 ? entries : [{ 
        artikelnummer: 'UNKNOWN', 
        artikelbezeichnung: 'Zubehör Etikett (Parsing Error)', 
        serialnummer: null, 
        menge: 1 
      }];
    } else {
      // Regular product QR code
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
  }

  async function expandZubehoerToIndividualProducts(zubehoerId: string): Promise<any[]> {
    try {
      const response = await fetch(`/api/zubehoer/${zubehoerId}`);
      const data = await response.json();
      
      if (data.success && data.item && data.item.entries) {
        // data.item.entries should be the JSON array of individual products
        return data.item.entries.map((entry: any) => ({
          artikelnummer: entry.artikelnummer,
          artikelbezeichnung: entry.artikelbezeichnung,
          serialnummer: null, // Zubehör products don't have individual serial numbers
          menge: entry.menge || 1
        }));
      }
      
      return [];
    } catch (err) {
      notificationStore.error('Zubehör Fehler', 'Fehler beim Erweitern der Zubehör-Produkte.');
      return [];
    }
  }

  // Function to update manual entries when selections change
  async function updateManualEntries() {
    if (isExpandingZubehoer || !manualMode) return; // Prevent concurrent updates
    
    isExpandingZubehoer = true;
    
    try {
      const selectedEntries = Object.entries(manualSelections)
        .filter(([_, selection]) => selection.selected);

      const results = await Promise.all(
        selectedEntries.map(async ([key, selection]) => {
          if (key.startsWith('zubehoer_')) {
            return await expandZubehoerToIndividualProducts(selection.etikettId);
          } else {
            // Regular product
            const product = availableProducts.find(p => 
              `${p.type}_${p.serialnummer}` === key
            );
            return [{
              artikelnummer: product?.artikel_nummer || '',
              artikelbezeichnung: product?.artikel_bezeichnung || '',
              serialnummer: selection.serialNumber,
              menge: 1
            }];
          }
        })
      );

      expandedManualEntries = results.flat();
    } catch (err) {
      notificationStore.error('Manuelle Einträge Fehler', 'Fehler beim Aktualisieren der manuellen Einträge.');
      expandedManualEntries = [];
    } finally {
      isExpandingZubehoer = false;
    }
  }

  // Function to handle checkbox changes
  function handleManualSelection() {
    if (!manualMode) return;
    
    // Use setTimeout to handle async update outside reactive context
    setTimeout(() => {
      updateManualEntries();
    }, 0);
  }

  // Handle mode switching
  function switchMode() {
    manualMode = !manualMode;
    error = null;
    submitSuccess = false;
    
    if (manualMode) {
      // When switching to manual mode, update entries immediately
      setTimeout(() => {
        updateManualEntries();
      }, 0);
    }
  }

  // Use expanded entries when in manual mode
  $: {
    finalGroupedEntries = manualMode ? expandedManualEntries : scannedQRs.flatMap((qr) => parseQRContent(qr));
  }

  async function submitOuterKarton() {
    try {
      if (!finalGroupedEntries || finalGroupedEntries.length === 0) {
        notificationStore.error('Validierung fehlgeschlagen', 'Keine Einträge zum Speichern vorhanden.');
        return;
      }
      
      const enriched = finalGroupedEntries.map((e) => ({
        artikelnummer: e.artikelnummer || 'UNKNOWN',
        artikelbezeichnung: e.artikelbezeichnung || 'Unknown Item',
        menge: e.menge || 1,
        serialnummer: e.serialnummer || null
      }));

      const res = await fetch('/api/outerkarton', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          entries: enriched,
          lieferscheinNumber: lieferscheinNumber.trim() || null
        })
      });

      const result = await res.json();
      
      if (result.success) {
        notificationStore.success('Outer Karton gespeichert', 'Die Outer Karton Daten wurden erfolgreich gespeichert und das Etikett wurde gedruckt.');
        lieferscheinNumber = '';  // Clear Lieferschein number on success
        if (manualMode) {
          // Reset manual selections
          Object.keys(manualSelections).forEach(key => {
            manualSelections[key].selected = false;
          });
        } else {
          scannedQRs = [];
        }
      } else {
        notificationStore.error('Speicherfehler', result.error || 'Fehler beim Speichern der Outer Karton Daten.');
      }
    } catch (err) {
      notificationStore.error('Verbindungsfehler', err instanceof Error ? err.message : 'Verbindungsfehler beim Speichern.');
    }
  }

  function toggleCategory(category: string) {
    expandedCategories[category] = !expandedCategories[category];
  }

  function getSelectedCount(categoryType: string): number {
    if (categoryType === 'zubehoer') {
      return availableZubehoer.filter(item => 
        manualSelections[`zubehoer_${item.id}`]?.selected
      ).length;
    } else {
      return availableProducts.filter(product => 
        product.type === categoryType && 
        manualSelections[`${product.type}_${product.serialnummer}`]?.selected
      ).length;
    }
  }
</script>

<svelte:head>
  <title>Außenkarton - QR-Scan Übersicht</title>
</svelte:head>

<div class="form-container">
  <form on:submit|preventDefault={submitOuterKarton} class="form">
    <h1 class="page-title">Außenkarton – QR-Scan Übersicht</h1>

    <div class="mode-switcher">
      <button 
        type="button"
        class="mode-button" 
        class:active={!manualMode}
        on:click={() => { manualMode = false; error = null; submitSuccess = false; }}
      >
        Scan-Modus
      </button>
      <button 
        type="button"
        class="mode-button" 
        class:active={manualMode}
        on:click={switchMode}
      >
        Manuelle Auswahl
      </button>
    </div>

    <!-- Lieferschein Number Input -->
    <div class="lieferschein-section">
      <label for="lieferscheinInput" class="input-label">Lieferschein Nummer:</label>
      <input 
        id="lieferscheinInput" 
        type="text" 
        bind:value={lieferscheinNumber}
        class="lieferschein-input"
      />
    </div>

    {#if !manualMode}
    <!-- Scanning Mode -->
    <div class="scan-section">
      <div class="input-section">
        <label for="scanInput" class="input-label">QR-Code scannen oder einfügen:</label>
        <div class="input-wrapper">
          <input 
            id="scanInput" 
            type="text" 
            bind:value={scanInput} 
            on:keydown={(e) => e.key === 'Enter' && handleScanInput()} 
            class="scan-input"
          />
          <button type="button" class="scan-button" on:click={handleScanInput}>
            Hinzufügen
          </button>
        </div>
      </div>

      {#if scannedQRs.length > 0}
        <div class="results-section">
          <h2 class="section-title">
            Gescannte QR-Codes ({scannedQRs.length})
          </h2>
          <div class="scan-grid">
            {#each scannedQRs as qr, index}
              <div class="scan-item">
                <span class="scan-number">QR {index + 1}</span>
                <button type="button" class="remove-button" on:click={() => scannedQRs = scannedQRs.filter((_, i) => i !== index)}>
                  ✕
                </button>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
    {:else}
    <div class="manual-section">
      <h2 class="section-title">
        Produkte manuell auswählen
      </h2>
      
      <div class="product-categories">
        {#if availableProducts.filter(p => p.type === 'cpro').length > 0}
          <div class="category-container">
            <button 
              type="button" 
              class="category-header"
              class:expanded={expandedCategories.cpro}
              on:click={() => toggleCategory('cpro')}
            >
              <div class="category-header-content">
                <h3 class="category-title">C Pro Steuerrechner</h3>
                <div class="category-info">
                  <span class="category-count">
                    {getSelectedCount('cpro')} / {availableProducts.filter(p => p.type === 'cpro').length} ausgewählt
                  </span>
                  <svg class="category-arrow" class:rotated={expandedCategories.cpro} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>
            </button>
            
            {#if expandedCategories.cpro}
              <div class="product-list" in:slide="{{ duration: 300 }}" out:slide="{{ duration: 200 }}">
                {#each availableProducts.filter(p => p.type === 'cpro') as product}
                  <div class="product-row" class:selected={manualSelections[`${product.type}_${product.serialnummer}`].selected}>
                    <label class="product-item">
                      <input 
                        type="checkbox" 
                        bind:checked={manualSelections[`${product.type}_${product.serialnummer}`].selected}
                        on:change={handleManualSelection}
                        class="product-checkbox"
                      />
                      <div class="product-content">
                        <span class="product-name">{product.artikel_bezeichnung}</span>
                        <span class="product-serial">SN: {product.serialnummer}</span>
                      </div>
                    </label>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {/if}

        <!-- C2 Products -->
        {#if availableProducts.filter(p => p.type === 'c2').length > 0}
          <div class="category-container">
            <button 
              type="button" 
              class="category-header"
              class:expanded={expandedCategories.c2}
              on:click={() => toggleCategory('c2')}
            >
              <div class="category-header-content">
                <h3 class="category-title">C2 Steuerrechner</h3>
                <div class="category-info">
                  <span class="category-count">
                    {getSelectedCount('c2')} / {availableProducts.filter(p => p.type === 'c2').length} ausgewählt
                  </span>
                  <svg class="category-arrow" class:rotated={expandedCategories.c2} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>
            </button>
            
            {#if expandedCategories.c2}
              <div class="product-list" in:slide="{{ duration: 300 }}" out:slide="{{ duration: 200 }}">
                {#each availableProducts.filter(p => p.type === 'c2') as product}
                  <div class="product-row" class:selected={manualSelections[`${product.type}_${product.serialnummer}`].selected}>
                    <label class="product-item">
                      <input 
                        type="checkbox" 
                        bind:checked={manualSelections[`${product.type}_${product.serialnummer}`].selected}
                        on:change={handleManualSelection}
                        class="product-checkbox"
                      />
                      <div class="product-content">
                        <span class="product-name">{product.artikel_bezeichnung}</span>
                        <span class="product-serial">SN: {product.serialnummer}</span>
                      </div>
                    </label>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {/if}

        <!-- C Basic Products -->
        {#if availableProducts.filter(p => p.type === 'cbasic').length > 0}
          <div class="category-container">
            <button 
              type="button" 
              class="category-header"
              class:expanded={expandedCategories.cbasic}
              on:click={() => toggleCategory('cbasic')}
            >
              <div class="category-header-content">
                <h3 class="category-title">C Basic Steuerrechner</h3>
                <div class="category-info">
                  <span class="category-count">
                    {getSelectedCount('cbasic')} / {availableProducts.filter(p => p.type === 'cbasic').length} ausgewählt
                  </span>
                  <svg class="category-arrow" class:rotated={expandedCategories.cbasic} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>
            </button>
            
            {#if expandedCategories.cbasic}
              <div class="product-list" in:slide="{{ duration: 300 }}" out:slide="{{ duration: 200 }}">
                {#each availableProducts.filter(p => p.type === 'cbasic') as product}
                  <div class="product-row" class:selected={manualSelections[`${product.type}_${product.serialnummer}`].selected}>
                    <label class="product-item">
                      <input 
                        type="checkbox" 
                        bind:checked={manualSelections[`${product.type}_${product.serialnummer}`].selected}
                        on:change={handleManualSelection}
                        class="product-checkbox"
                      />
                      <div class="product-content">
                        <span class="product-name">{product.artikel_bezeichnung}</span>
                        <span class="product-serial">SN: {product.serialnummer}</span>
                      </div>
                    </label>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {/if}

        <!-- KK Products -->
        {#if availableProducts.filter(p => p.type === 'kk').length > 0}
          <div class="category-container">
            <button 
              type="button" 
              class="category-header"
              class:expanded={expandedCategories.kk}
              on:click={() => toggleCategory('kk')}
            >
              <div class="category-header-content">
                <h3 class="category-title">Kamerakopf</h3>
                <div class="category-info">
                  <span class="category-count">
                    {getSelectedCount('kk')} / {availableProducts.filter(p => p.type === 'kk').length} ausgewählt
                  </span>
                  <svg class="category-arrow" class:rotated={expandedCategories.kk} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>
            </button>
            
            {#if expandedCategories.kk}
              <div class="product-list" in:slide="{{ duration: 300 }}" out:slide="{{ duration: 200 }}">
                {#each availableProducts.filter(p => p.type === 'kk') as product}
                  <div class="product-row" class:selected={manualSelections[`${product.type}_${product.serialnummer}`].selected}>
                    <label class="product-item">
                      <input 
                        type="checkbox" 
                        bind:checked={manualSelections[`${product.type}_${product.serialnummer}`].selected}
                        on:change={handleManualSelection}
                        class="product-checkbox"
                      />
                      <div class="product-content">
                        <span class="product-name">{product.artikel_bezeichnung}</span>
                        <span class="product-serial">SN: {product.serialnummer}</span>
                      </div>
                    </label>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {/if}

        <!-- Zubehör Products -->
        {#if availableZubehoer.length > 0}
          <div class="category-container">
            <button 
              type="button" 
              class="category-header"
              class:expanded={expandedCategories.zubehoer}
              on:click={() => toggleCategory('zubehoer')}
            >
              <div class="category-header-content">
                <h3 class="category-title">Zubehör</h3>
                <div class="category-info">
                  <span class="category-count">
                    {getSelectedCount('zubehoer')} / {availableZubehoer.length} ausgewählt
                  </span>
                  <svg class="category-arrow" class:rotated={expandedCategories.zubehoer} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>
            </button>
            
            {#if expandedCategories.zubehoer}
              <div class="product-list" in:slide="{{ duration: 300 }}" out:slide="{{ duration: 200 }}">
                {#each availableZubehoer as zubehoer}
                  <div class="product-row" class:selected={manualSelections[`zubehoer_${zubehoer.id}`].selected}>
                    <label class="product-item">
                      <input 
                        type="checkbox" 
                        bind:checked={manualSelections[`zubehoer_${zubehoer.id}`].selected}
                        on:change={handleManualSelection}
                        class="product-checkbox"
                      />
                      <div class="product-content">
                        <span class="product-name">Zubehör Etikett #{zubehoer.id}</span>
                        <span class="product-serial">({zubehoer.entries?.length || 0} Artikel)</span>
                      </div>
                    </label>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {/if}
      </div>
    </div>
    {/if}

    {#if finalGroupedEntries.length > 0}
    <div class="preview-section">
      <h3 class="section-title">
        Vorschau
      </h3>
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
            {#each finalGroupedEntries as entry}
              <tr>
                <td class="table-cell">{entry.artikelnummer}</td>
                <td class="table-cell">{entry.artikelbezeichnung}</td>
                <td class="table-cell numeric">{entry.menge}</td>
                <td class="table-cell">{entry.serialnummer || '-'}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <button type="submit" class="create-button">
        Etikett erstellen
      </button>
    </div>
    {/if}
  </form>
</div>

<style>
  .form-container {
    min-height: 100vh;
    padding: var(--spacing-lg) var(--spacing-md);
    /* background: linear-gradient(135deg, var(--bg-light) 0%, var(--white) 100%); */
  }

  .form {
    max-width: 1200px;
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

  .mode-switcher {
    display: flex;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-xl);
    background: var(--bg-light);
    padding: var(--spacing-sm);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-sm);
  }

  .mode-button {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-md) var(--spacing-lg);
    border: 2px solid var(--border-light);
    background: var(--white);
    color: var(--text-secondary);
    border-radius: var(--border-radius-md);
    cursor: pointer;
    transition: all var(--transition-smooth);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-semibold);
    min-height: 50px;
  }

  .mode-button:hover {
    border-color: var(--primary-color);
    background: var(--primary-light);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  .mode-button.active {
    background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
    color: var(--white);
    border-color: var(--primary-color);
    box-shadow: var(--shadow-md);
  }

  .scan-section {
    background: var(--bg-light);
    border-radius: var(--border-radius-lg);
    padding: var(--spacing-xl);
    margin-bottom: var(--spacing-xl);
    border: 1px solid var(--border-light);
  }

  .input-section {
    margin-bottom: var(--spacing-xl);
  }

  .input-label {
    display: block;
    margin-bottom: var(--spacing-md);
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
    font-size: var(--font-size-lg);
  }

  .input-wrapper {
    display: flex;
    gap: var(--spacing-md);
    align-items: stretch;
  }

  .scan-input {
    flex: 1;
    padding: var(--spacing-md) var(--spacing-lg);
    border: 2px solid var(--border-medium);
    border-radius: var(--border-radius-md);
    font-size: var(--font-size-base);
    transition: all var(--transition-smooth);
    background: var(--white);
    min-height: 50px;
    box-sizing: border-box;
  }

  .scan-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px var(--primary-light);
    background: var(--bg-light);
  }

  .lieferschein-section {
    margin-bottom: var(--spacing-xl);
    padding: var(--spacing-lg);
    background: var(--bg-light);
    border: 1px solid var(--border-light);
    border-radius: var(--border-radius-md);
  }

  .lieferschein-input {
    width: 100%;
    padding: var(--spacing-md) var(--spacing-lg);
    border: 2px solid var(--border-medium);
    border-radius: var(--border-radius-md);
    font-size: var(--font-size-base);
    transition: all var(--transition-smooth);
    background: var(--white);
    min-height: 50px;
    box-sizing: border-box;
  }

  .lieferschein-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px var(--primary-light);
    background: var(--bg-light);
  }

  .scan-button {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-md) var(--spacing-lg);
    background: linear-gradient(135deg, var(--success-color), var(--success-hover));
    color: var(--white);
    border: none;
    border-radius: var(--border-radius-md);
    cursor: pointer;
    transition: all var(--transition-smooth);
    font-weight: var(--font-weight-semibold);
    min-height: 50px;
    white-space: nowrap;
  }

  .scan-button:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
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

  .results-section {
    background: var(--white);
    border-radius: var(--border-radius-md);
    padding: var(--spacing-lg);
    border: 1px solid var(--border-light);
    box-shadow: var(--shadow-sm);
  }

  .scan-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: var(--spacing-md);
  }

  .scan-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-md);
    background: linear-gradient(135deg, var(--bg-light), var(--white));
    border: 1px solid var(--border-light);
    border-radius: var(--border-radius-md);
    transition: all var(--transition-smooth);
  }

  .scan-item:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    border-color: var(--primary-light);
  }

  .scan-number {
    font-weight: var(--font-weight-semibold);
    color: var(--primary-color);
  }

  .remove-button {
    background: var(--danger-color);
    color: var(--white);
    border: none;
    border-radius: var(--border-radius-full);
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all var(--transition-smooth);
    font-size: var(--font-size-sm);
  }

  .remove-button:hover {
    background: var(--danger-hover);
    transform: scale(1.1);
  }

  .manual-section {
    background: var(--bg-light);
    border-radius: var(--border-radius-lg);
    padding: var(--spacing-xl);
    margin-bottom: var(--spacing-xl);
    border: 1px solid var(--border-light);
  }

  .product-categories {
    display: grid;
    gap: var(--spacing-xl);
  }

  .category-container {
    background: var(--white);
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
    width: 100%;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    transition: all var(--transition-smooth);
    border-radius: var(--border-radius-md);
    padding: var(--spacing-md);
    margin: calc(-1 * var(--spacing-md));
    margin-bottom: var(--spacing-lg);
  }

  .category-header:hover {
    background: var(--primary-light);
  }

  .category-header.expanded {
    background: linear-gradient(135deg, var(--primary-light), var(--white));
    border-bottom: 1px solid var(--border-light);
    border-radius: var(--border-radius-md) var(--border-radius-md) 0 0;
    margin-bottom: 0;
  }

  .category-header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .category-title {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-bold);
    color: var(--primary-color);
    margin: 0;
  }

  .category-info {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
  }

  .category-count {
    font-size: var(--font-size-sm);
    color: var(--text-muted);
    font-weight: var(--font-weight-medium);
    background: var(--bg-light);
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--border-radius-full);
    border: 1px solid var(--border-light);
  }

  .category-arrow {
    width: 20px;
    height: 20px;
    color: var(--primary-color);
    transition: transform var(--transition-smooth);
    flex-shrink: 0;
  }

  .category-arrow.rotated {
    transform: rotate(180deg);
  }

  .product-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    background: var(--white);
    border-top: 1px solid var(--border-light);
    padding-top: var(--spacing-md);
    margin-top: var(--spacing-lg);
  }

  .product-row {
    border-radius: var(--border-radius-md);
    transition: all var(--transition-smooth);
    border: 1px solid transparent;
  }

  .product-row:hover {
    background: var(--primary-light);
    border-color: var(--primary-color);
    transform: translateX(4px);
  }

  .product-row.selected {
    background: linear-gradient(135deg, var(--primary-light), var(--white));
    border-color: var(--primary-color);
    box-shadow: var(--shadow-sm);
  }

  .product-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    cursor: pointer;
    width: 100%;
    border-radius: var(--border-radius-md);
    transition: all var(--transition-smooth);
  }

  .product-checkbox {
    width: 20px;
    height: 20px;
    accent-color: var(--primary-color);
    cursor: pointer;
    flex-shrink: 0;
  }

  .product-content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    flex: 1;
    min-width: 0;
  }

  .product-name {
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
    font-size: var(--font-size-base);
    line-height: 1.4;
  }

  .product-serial {
    font-size: var(--font-size-sm);
    color: var(--text-muted);
    font-weight: var(--font-weight-medium);
    font-family: monospace;
  }

  .preview-section {
    background: var(--white);
    border-radius: var(--border-radius-lg);
    padding: var(--spacing-xl);
    border: 1px solid var(--border-light);
    box-shadow: var(--shadow-sm);
    margin-bottom: var(--spacing-xl);
  }

  .table-container {
    margin: var(--spacing-lg) 0;
    overflow-x: auto;
    border-radius: var(--border-radius-md);
    box-shadow: var(--shadow-sm);
  }

  .preview-table {
    width: 100%;
    border-collapse: collapse;
    background: var(--white);
    border-radius: var(--border-radius-md);
    overflow: hidden;
  }

  .preview-table th {
    background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
    color: var(--white);
    padding: var(--spacing-md) var(--spacing-lg);
    text-align: left;
    font-weight: var(--font-weight-bold);
    font-size: var(--font-size-base);
    border: none;
  }

  .preview-table .table-cell {
    padding: var(--spacing-md) var(--spacing-lg);
    border-bottom: 1px solid var(--border-light);
    font-size: var(--font-size-base);
    color: var(--text-primary);
    transition: background-color var(--transition-smooth);
  }

  .preview-table tr:hover .table-cell {
    background: var(--bg-light);
  }

  .preview-table tr:last-child .table-cell {
    border-bottom: none;
  }

  .table-cell.numeric {
    text-align: center;
    font-weight: var(--font-weight-semibold);
  }

  .create-button {
    width: 100%;
    max-width: 400px;
    margin: var(--spacing-xl) auto 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-md);
    padding: var(--spacing-lg) var(--spacing-xl);
    background: linear-gradient(135deg, var(--success-color), var(--success-hover));
    color: var(--white);
    border: none;
    border-radius: var(--border-radius-md);
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-bold);
    cursor: pointer;
    transition: all var(--transition-smooth);
    min-height: 60px;
    text-transform: uppercase;
    letter-spacing: 1px;
    box-shadow: var(--shadow-md);
    position: relative;
    overflow: hidden;
  }

  .create-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.6s ease;
  }

  .create-button:hover::before {
    left: 100%;
  }

  .create-button:hover {
    background: linear-gradient(135deg, var(--success-hover), var(--success-color));
    transform: translateY(-3px);
    box-shadow: var(--shadow-lg);
  }

  .create-button:active {
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
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
      margin-bottom: var(--spacing-lg);
    }

    .mode-switcher {
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .mode-button {
      flex: none;
    }

    .input-wrapper {
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .scan-button {
      justify-content: center;
    }

    .scan-grid {
      grid-template-columns: 1fr;
    }

    .scan-section,
    .manual-section,
    .preview-section {
      padding: var(--spacing-lg);
    }

    .table-container {
      font-size: var(--font-size-sm);
    }

    .preview-table th,
    .preview-table .table-cell {
      padding: var(--spacing-sm) var(--spacing-md);
    }

    .create-button {
      font-size: var(--font-size-base);
      padding: var(--spacing-md) var(--spacing-lg);
      min-height: 50px;
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

    .category-container {
      padding: var(--spacing-md);
    }

    .category-header {
      margin: calc(-1 * var(--spacing-md));
      margin-bottom: var(--spacing-md);
      padding: var(--spacing-sm);
    }

    .category-header.expanded {
      margin-bottom: 0;
    }

    .category-info {
      flex-direction: column;
      gap: var(--spacing-xs);
      align-items: flex-end;
    }

    .product-item {
      padding: var(--spacing-sm) var(--spacing-md);
    }

    .preview-table th,
    .preview-table .table-cell {
      padding: var(--spacing-xs) var(--spacing-sm);
      font-size: var(--font-size-xs);
    }

    .create-button {
      min-height: 48px;
    }
  }
</style>
