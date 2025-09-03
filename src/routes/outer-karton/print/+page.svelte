<script lang="ts">
  import { getPrinterIp } from '$lib/printer.js';
  
  let lieferscheinNumber = '';
  let loading = false;
  let error: string | null = null;
  let success = false;
  let outerKartonData: any = null;

  async function searchAndPrint() {
    if (!lieferscheinNumber.trim()) {
      error = 'Bitte geben Sie eine Lieferschein Nummer ein.';
      return;
    }

    loading = true;
    error = null;
    success = false;

    try {
      // Search for the outer karton using the unified API
      const searchRes = await fetch(`/api/outerkarton?lieferschein=${encodeURIComponent(lieferscheinNumber.trim())}`);
      const searchResult = await searchRes.json();

      if (!searchResult.success) {
        error = searchResult.error || 'Fehler beim Suchen der Lieferschein Nummer.';
        return;
      }

      if (!searchResult.found || !searchResult.item) {
        error = `Keine Outer Karton Eintrag mit Lieferschein Nummer "${lieferscheinNumber}" gefunden.`;
        return;
      }

      outerKartonData = searchResult.item;

      // Print the etikett using the unified API PUT method
      const printRes = await fetch('/api/outerkarton', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ outerKartonId: outerKartonData.id, printerIp: getPrinterIp() })
      });

      const printResult = await printRes.json();
      
      if (printResult.success) {
        success = true;
        error = null;
      } else {
        error = printResult.error || 'Fehler beim Drucken des Etiketts.';
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Verbindungsfehler';
    } finally {
      loading = false;
    }
  }

  function reset() {
    lieferscheinNumber = '';
    error = null;
    success = false;
    outerKartonData = null;
  }
</script>

<svelte:head>
  <title>Outer Karton Etikett Drucken</title>
</svelte:head>

<div class="print-container">
  <div class="print-form">
    <h1 class="page-title">Außer Karton Etikett Drucken</h1>

    <div class="input-section">
      <label for="lieferscheinInput" class="input-label">Lieferschein Nummer:</label>
      <div class="input-wrapper">
        <input 
          id="lieferscheinInput"
          type="text" 
          bind:value={lieferscheinNumber}
          class="lieferschein-input"
          disabled={loading}
          on:keydown={(e) => e.key === 'Enter' && searchAndPrint()}
        />
        <button 
          type="button" 
          class="search-print-button"
          disabled={loading || !lieferscheinNumber.trim()}
          on:click={searchAndPrint}
        >
          {loading ? 'Wird gedruckt...' : 'Suchen & Drucken'}
        </button>
      </div>
    </div>

    {#if error}
      <div class="error-message">
        <p>{error}</p>
      </div>
    {/if}

    {#if success && outerKartonData}
      <div class="success-message">
        <h3>Etikett erfolgreich gedruckt!</h3>
        <div class="karton-details">
          <p><strong>Outer Karton ID:</strong> {outerKartonData.id}</p>
          <p><strong>Lieferschein Nummer:</strong> {outerKartonData.lieferscheinNumber}</p>
          <p><strong>Anzahl Artikel:</strong> {outerKartonData.entries.length}</p>
          <p><strong>Verpackungsdatum:</strong> {new Date(outerKartonData.createdAt).toLocaleDateString('de-DE')}</p>
        </div>
        <button type="button" class="reset-button" on:click={reset}>
          Neues Etikett drucken
        </button>
      </div>
    {/if}
  </div>
</div>

<style>
  .print-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem;
  }

  .print-form {
    background: white;
    border-radius: 8px;
    padding: 2rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .page-title {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
    color: #1f2937;
  }

  .input-section {
    margin-bottom: 1.5rem;
  }

  .input-label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #374151;
  }

  .input-wrapper {
    display: flex;
    gap: 0.5rem;
  }

  .lieferschein-input {
    flex: 1;
    padding: 0.75rem;
    border: 2px solid #d1d5db;
    border-radius: 4px;
    font-size: 1rem;
    transition: border-color 0.2s;
  }

  .lieferschein-input:focus {
    outline: none;
    border-color: #3b82f6;
  }

  .lieferschein-input:disabled {
    background-color: #f9fafb;
    cursor: not-allowed;
  }

  .search-print-button {
    padding: 0.75rem 1.5rem;
    background-color: #3b82f6;
    color: white;
    border: none;
    border-radius: 4px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
    white-space: nowrap;
  }

  .search-print-button:hover:not(:disabled) {
    background-color: #2563eb;
  }

  .search-print-button:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }

  .error-message {
    background-color: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 4px;
    padding: 1rem;
    margin-top: 1rem;
  }

  .error-message p {
    color: #dc2626;
    margin: 0;
    font-weight: 500;
  }

  .success-message {
    background-color: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 4px;
    padding: 1.5rem;
    margin-top: 1rem;
  }

  .success-message h3 {
    color: #15803d;
    margin: 0 0 1rem 0;
    font-size: 1.25rem;
  }

  .karton-details {
    background-color: white;
    border-radius: 4px;
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .karton-details p {
    margin: 0.5rem 0;
    color: #374151;
  }

  .karton-details strong {
    color: #1f2937;
  }

  .reset-button {
    padding: 0.5rem 1rem;
    background-color: #059669;
    color: white;
    border: none;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .reset-button:hover {
    background-color: #047857;
  }
</style>
