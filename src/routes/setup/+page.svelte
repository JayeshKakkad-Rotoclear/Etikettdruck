<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import PasswordInput from '$lib/components/PasswordInput.svelte';

  let setupForm = {
    username: 'admin',
    email: 'admin@rotoclear.com',
    password: '',
    confirmPassword: '',
    firstName: 'System',
    lastName: 'Administrator'
  };

  let error = '';
  let loading = false;
  let needsSetup = true;

  onMount(async () => {
    try {
      const response = await fetch('/api/setup/check');
      const data = await response.json();
      needsSetup = data.needsSetup;
      
      if (!needsSetup) {
        goto('/login');
      }
    } catch (err) {
    }
  });

  async function handleSetup() {
    if (setupForm.password !== setupForm.confirmPassword) {
      error = 'Passwörter stimmen nicht überein';
      return;
    }

    if (setupForm.password.length < 6) {
      error = 'Passwort muss mindestens 6 Zeichen lang sein';
      return;
    }

    loading = true;
    error = '';

    try {
      const response = await fetch('/api/setup/create-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(setupForm)
      });

      const data = await response.json();

      if (data.success) {
        alert('Admin-Benutzer erfolgreich erstellt! Sie werden zur Anmeldeseite weitergeleitet.');
        goto('/login');
      } else {
        error = data.error || 'Setup fehlgeschlagen';
      }
    } catch (err) {
      error = 'Verbindungsfehler';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>System Setup - Etikettdrucker</title>
</svelte:head>

{#if needsSetup}
  <div class="setup-container">
    <div class="setup-card">
      <div class="header">
        <img src="/Logo.svg" alt="Rotoclear Logo" class="logo" />
        <h1>System Setup</h1>
        <p>Erstellen Sie den ersten Administrator-Account</p>
      </div>

      {#if error}
        <div class="error-message">{error}</div>
      {/if}

      <form on:submit|preventDefault={handleSetup} class="setup-form">
        <div class="form-row">
          <div class="field">
            <label for="username">Benutzername</label>
            <input
              id="username"
              type="text"
              bind:value={setupForm.username}
              required
              disabled={loading}
            />
          </div>

          <div class="field">
            <label for="email">E-Mail</label>
            <input
              id="email"
              type="email"
              bind:value={setupForm.email}
              required
              disabled={loading}
            />
          </div>
        </div>

        <div class="form-row">
          <div class="field">
            <label for="firstName">Vorname</label>
            <input
              id="firstName"
              type="text"
              bind:value={setupForm.firstName}
              required
              disabled={loading}
            />
          </div>

          <div class="field">
            <label for="lastName">Nachname</label>
            <input
              id="lastName"
              type="text"
              bind:value={setupForm.lastName}
              required
              disabled={loading}
            />
          </div>
        </div>

        <div class="form-row">
          <div class="field">
            <label for="password">Passwort</label>
            <PasswordInput
              id="password"
              bind:value={setupForm.password}
              required
              disabled={loading}
              minlength={6}
            />
          </div>

          <div class="field">
            <label for="confirmPassword">Passwort bestätigen</label>
            <PasswordInput
              id="confirmPassword"
              bind:value={setupForm.confirmPassword}
              required
              disabled={loading}
            />
          </div>
        </div>

        <button type="submit" class="setup-button" disabled={loading}>
          {loading ? 'Erstelle Administrator...' : 'Administrator erstellen'}
        </button>
      </form>
    </div>
  </div>
{:else}
  <div class="setup-container">
    <div class="setup-card">
      <h1>Setup bereits abgeschlossen</h1>
      <p>Das System wurde bereits konfiguriert.</p>
      <a href="/login">Zur Anmeldung</a>
    </div>
  </div>
{/if}

<style>
  .setup-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }

  .setup-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    padding: 3rem;
    max-width: 600px;
    width: 100%;
  }

  .header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .logo {
    height: 60px;
    margin-bottom: 1rem;
  }

  .header h1 {
    color: #123345;
    font-size: 2rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
  }

  .header p {
    color: #666;
    margin: 0;
  }

  .setup-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .field {
    display: flex;
    flex-direction: column;
  }

  .field label {
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #123345;
  }

  .field input {
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.2s;
  }

  .field input:focus {
    outline: none;
    border-color: #123345;
    box-shadow: 0 0 0 3px rgba(18, 51, 69, 0.1);
  }

  .field input:disabled {
    background-color: #f7f7f7;
    cursor: not-allowed;
  }

  .setup-button {
    background: #123345;
    color: white;
    border: none;
    padding: 1rem 2rem;
    border-radius: 6px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
    margin-top: 1rem;
  }

  .setup-button:hover:not(:disabled) {
    background: #1a4d66;
  }

  .setup-button:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  .error-message {
    background: #fed7d7;
    color: #c53030;
    padding: 1rem;
    border-radius: 6px;
    border: 1px solid #feb2b2;
    margin-bottom: 1rem;
  }

  @media (max-width: 768px) {
    .setup-container {
      padding: 1rem;
    }

    .setup-card {
      padding: 2rem;
    }

    .form-row {
      grid-template-columns: 1fr;
    }

    .header h1 {
      font-size: 1.5rem;
    }
  }
</style>
