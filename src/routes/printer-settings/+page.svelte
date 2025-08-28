<script lang="ts">
  import { onMount } from 'svelte';
  import { notificationStore } from '$lib';
  import { Icon } from '$lib';

  let printerIp = '';
  let defaultPrinterIp = '10.50.8.113'; // Default from your server
  let isLoading = false;
  let isTesting = false;

  onMount(() => {
    // Load saved printer IP from localStorage
    const savedIp = localStorage.getItem('printerIp');
    if (savedIp) {
      printerIp = savedIp;
    } else {
      printerIp = defaultPrinterIp;
    }
  });

  function savePrinterIp() {
    if (!printerIp.trim()) {
      notificationStore.error('Validierungsfehler', 'Bitte geben Sie eine gültige IP-Adresse ein.');
      return;
    }

    // Basic IP validation
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipPattern.test(printerIp.trim())) {
      notificationStore.error('Validierungsfehler', 'Bitte geben Sie eine gültige IP-Adresse ein (z.B. 192.168.1.100).');
      return;
    }

    localStorage.setItem('printerIp', printerIp.trim());
    notificationStore.success('Gespeichert', 'Drucker-IP-Adresse wurde gespeichert.');
  }

  function resetToDefault() {
    printerIp = defaultPrinterIp;
    localStorage.removeItem('printerIp');
    notificationStore.success('Zurückgesetzt', 'Drucker-IP-Adresse wurde auf Standard zurückgesetzt.');
  }

  async function testPrinterConnection() {
    if (!printerIp.trim()) {
      notificationStore.error('Validierungsfehler', 'Bitte geben Sie eine gültige IP-Adresse ein.');
      return;
    }

    isTesting = true;
    try {
      const response = await fetch('/api/printer/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ printerIp: printerIp.trim() })
      });

      const result = await response.json();
      
      if (result.success) {
        notificationStore.success('Test erfolgreich', 'Verbindung zum Drucker wurde erfolgreich getestet.');
      } else {
        notificationStore.error('Test fehlgeschlagen', result.error || 'Verbindung zum Drucker fehlgeschlagen.');
      }
    } catch (error) {
      notificationStore.error('Test fehlgeschlagen', 'Fehler beim Testen der Druckerverbindung.');
    } finally {
      isTesting = false;
    }
  }

  function getCurrentPrinterIp() {
    return localStorage.getItem('printerIp') || defaultPrinterIp;
  }
</script>

<svelte:head>
  <title>Drucker-Einstellungen - Etikettendruck</title>
</svelte:head>

<div class="form-container">
  <form class="form">
    <h1 class="page-title">Drucker-Einstellungen</h1>
    
    <div class="form-grid">
      <div class="section-title">Drucker-Konfiguration</div>
      
      <div class="field">
        <label for="printerIp" class="input-label">Drucker-IP-Adresse</label>
        <input
          id="printerIp"
          type="text"
          bind:value={printerIp}
          placeholder="z.B. 192.168.1.100"
          class="input"
        />
        <span class="input-hint">Standard: {defaultPrinterIp}</span>
      </div>

      <div class="button-group">
        <button
          type="button"
          on:click={savePrinterIp}
          disabled={isLoading}
          class="icon-button success"
        >
          <Icon name="save" />
          <span>{isLoading ? 'Speichern...' : 'Speichern'}</span>
        </button>
        
        <button
          type="button"
          on:click={testPrinterConnection}
          disabled={isTesting}
          class="icon-button"
        >
          <Icon name="wifi" />
          <span>{isTesting ? 'Teste...' : 'Verbindung testen'}</span>
        </button>
        
        <button
          type="button"
          on:click={resetToDefault}
          class="icon-button secondary"
        >
          <Icon name="rotate-ccw" />
          <span>Auf Standard zurücksetzen</span>
        </button>
      </div>

      <div class="info-section">
        <div class="section-title">
          <Icon name="info" />
          <span>Informationen</span>
        </div>
        <div class="info-card">
          <ul class="info-list">
            <li>Diese Einstellung wird nur auf diesem Computer gespeichert</li>
            <li>Jeder Client kann seine eigene Drucker-IP konfigurieren</li>
            <li>Wenn keine IP konfiguriert ist, wird die Standard-IP verwendet</li>
            <li>Port 9100 wird standardmäßig für ZPL-Drucker verwendet</li>
          </ul>
        </div>
      </div>
      
      <div class="status-section">
        <div class="section-title">
          <Icon name="settings" />
          <span>Aktuelle Konfiguration</span>
        </div>
        <div class="status-card">
          <div class="status-item">
            <span class="status-label">Aktuelle IP:</span>
            <span class="status-value">{getCurrentPrinterIp()}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Standard-IP:</span>
            <span class="status-value">{defaultPrinterIp}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Port:</span>
            <span class="status-value">9100 (ZPL)</span>
          </div>
        </div>
      </div>
    </div>
  </form>
</div>

<style>
  .form-container {
    min-height: 100vh;
    padding: var(--spacing-lg) var(--spacing-md);
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

  form.form {
    max-width: 900px;
    margin: 0 auto;
    background: var(--white);
    border-radius: var(--border-radius-lg);
    padding: var(--spacing-xl);
    box-shadow: var(--shadow-medium);
    border: 1px solid var(--border-light);
    position: relative;
    overflow: hidden;
  }

  form.form::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--spacing-xl);
  }

  .section-title {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
    margin-bottom: var(--spacing-md);
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding-bottom: var(--spacing-sm);
    border-bottom: 2px solid var(--border-light);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .input-label {
    font-weight: var(--font-weight-semibold);
    color: var(--text-secondary);
    font-size: var(--font-size-base);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: var(--spacing-xs);
  }

  .input {
    padding: var(--spacing-md);
    font-size: var(--font-size-base);
    border: 2px solid var(--border-medium);
    border-radius: var(--border-radius-md);
    background: var(--white);
    transition: all var(--transition-smooth);
    min-height: 48px;
    box-sizing: border-box;
  }

  .input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(18, 51, 69, 0.1);
    background: var(--bg-light);
  }

  .input:hover:not(:focus) {
    border-color: var(--border-color);
  }

  .input-hint {
    font-size: var(--font-size-sm);
    color: var(--text-muted);
    font-style: italic;
  }

  .button-group {
    display: flex;
    gap: var(--spacing-md);
    flex-wrap: wrap;
    align-items: center;
  }

  .info-section,
  .status-section {
    margin-top: var(--spacing-lg);
  }

  .info-card,
  .status-card {
    background: var(--bg-card);
    border: 1px solid var(--border-light);
    border-radius: var(--border-radius-md);
    padding: var(--spacing-lg);
    margin-top: var(--spacing-md);
    box-shadow: var(--shadow-sm);
  }

  .info-list {
    margin: 0;
    padding-left: var(--spacing-lg);
    color: var(--text-secondary);
  }

  .info-list li {
    margin-bottom: var(--spacing-sm);
    font-size: var(--font-size-base);
    line-height: 1.5;
  }

  .status-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-sm) 0;
    border-bottom: 1px solid var(--border-light);
  }

  .status-item:last-child {
    border-bottom: none;
  }

  .status-label {
    font-weight: var(--font-weight-medium);
    color: var(--text-secondary);
    font-size: var(--font-size-base);
  }

  .status-value {
    font-family: 'Courier New', monospace;
    font-weight: var(--font-weight-semibold);
    color: var(--primary-color);
    background: var(--primary-light);
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--border-radius-sm);
    font-size: var(--font-size-sm);
  }

  /* Responsive Design */
  @media (min-width: 768px) {
    .form-container {
      padding: var(--spacing-xl);
    }

    .button-group {
      justify-content: flex-start;
    }

    .form-grid {
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: var(--spacing-xl) var(--spacing-lg);
    }

    .field {
      grid-column: span 1;
    }

    .button-group,
    .info-section,
    .status-section {
      grid-column: 1 / -1;
    }
  }

  @media (max-width: 576px) {
    .form-container {
      padding: var(--spacing-md) var(--spacing-sm);
    }

    form.form {
      padding: var(--spacing-lg);
    }

    .page-title {
      font-size: var(--font-size-xl);
    }

    .section-title {
      font-size: var(--font-size-lg);
    }

    .button-group {
      flex-direction: column;
      align-items: stretch;
    }

    .icon-button {
      width: 100%;
      justify-content: center;
    }
  }
</style>
