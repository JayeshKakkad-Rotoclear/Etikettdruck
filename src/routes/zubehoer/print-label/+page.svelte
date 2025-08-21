<script lang="ts">
  let lieferscheinnummer = '';
  let errorMessage = '';
  let isLoading = false;

  async function printLabel() {
    if (!lieferscheinnummer.trim()) {
      errorMessage = 'Bitte geben Sie eine Lieferschein-Nummer ein';
      return;
    }

    isLoading = true;
    errorMessage = '';

    try {
      const res = await fetch('/api/zubehoer', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lieferscheinnummer: lieferscheinnummer.trim() })
      });
      
      if (!res.ok) {
        const error = await res.json();
        errorMessage = error.error || 'Fehler beim Drucken des Etiketts';
        return;
      }

      const result = await res.json();
      if (result.success) {
        lieferscheinnummer = '';
      } else {
        errorMessage = result.error || 'Fehler beim Drucken des Etiketts';
      }
    } catch (err) {
      errorMessage = 'Verbindungsfehler';
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Zubehör Etikett - Nachdrucken</title>
</svelte:head>

<div class="form-container">
  <form on:submit|preventDefault={printLabel} class="form search-form">
    <h1>Zubehör Etikett nachdrucken</h1>
    
    <div class="search-section">
      <div class="field">
        <label for="lieferscheinSearch">Lieferschein-Nummer eingeben</label>
        <div class="search-input-group">
          <input 
            type="text" 
            bind:value={lieferscheinnummer}
            class="search-input" 
            id="lieferscheinSearch"
            disabled={isLoading}
          />
          <button type="submit" class="search-button" disabled={isLoading}>
            {#if isLoading}
              Druckt...
            {:else}
              Etikett drucken
            {/if}
          </button>
        </div>
      </div>
      
      {#if errorMessage}
        <div class="error-message">
          {errorMessage}
        </div>
      {/if}
    </div>
  </form>
</div>

<style>
  .form-container {
    min-height: 100vh;
    padding: var(--spacing-lg) var(--spacing-md);
  }

  h1 {
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

  .form {
    max-width: 600px;
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

  .search-form {
    margin-bottom: var(--spacing-2xl);
  }

  .search-section {
    text-align: center;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  label {
    font-weight: var(--font-weight-semibold);
    color: var(--text-secondary);
    font-size: var(--font-size-base);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: var(--spacing-xs);
  }

  .search-input-group {
    display: flex;
    gap: var(--spacing-md);
    align-items: flex-end;
    max-width: 500px;
    margin: 0 auto;
  }

  .search-input {
    flex: 1;
    padding: var(--spacing-md);
    font-size: var(--font-size-base);
    border: 2px solid var(--border-medium);
    border-radius: var(--border-radius-md);
    background: var(--white);
    transition: all var(--transition-smooth);
    min-height: 56px;
    box-sizing: border-box;
  }

  .search-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px var(--primary-light);
    background: var(--bg-light);
  }

  .search-input:hover:not(:focus) {
    border-color: var(--border-color);
    box-shadow: var(--shadow-sm);
  }

  .search-input:disabled {
    background: var(--bg-muted);
    color: var(--text-muted);
    cursor: not-allowed;
    border-color: var(--border-light);
  }

  .search-button {
    background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
    color: var(--white);
    border: none;
    border-radius: var(--border-radius-md);
    padding: var(--spacing-md) var(--spacing-xl);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-semibold);
    cursor: pointer;
    transition: all var(--transition-smooth);
    min-height: 56px;
    box-shadow: var(--shadow-sm);
    position: relative;
    overflow: hidden;
    white-space: nowrap;
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
    box-shadow: var(--shadow-lg);
  }

  .search-button:disabled {
    background: var(--bg-muted);
    color: var(--text-muted);
    cursor: not-allowed;
    transform: none;
    box-shadow: var(--shadow-sm);
  }

  .error-message {
    background: linear-gradient(135deg, var(--error-color), var(--danger-hover));
    color: var(--white);
    padding: var(--spacing-md);
    border-radius: var(--border-radius-md);
    margin-top: var(--spacing-md);
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
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

    .search-input-group {
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .search-button {
      width: 100%;
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

    .search-input {
      padding: var(--spacing-sm) var(--spacing-md);
      min-height: 44px;
    }

    .search-button {
      min-height: 44px;
    }
  }
</style>
