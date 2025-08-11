<script lang="ts">
  import { AuthService } from '$lib/stores/auth.js';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  
  let identifier = '';
  let password = '';
  let stayLoggedIn = false;
  let isLoading = false;
  let error = '';

  onMount(() => {
    // Check if user is already authenticated
    AuthService.checkAuth();
  });

  async function handleLogin() {
    if (!identifier || !password) {
      error = 'Bitte geben Sie Benutzername/E-Mail und Passwort ein';
      return;
    }

    isLoading = true;
    error = '';

    const result = await AuthService.login(identifier, password, stayLoggedIn);
    
    if (result.success) {
      goto('/');
    } else {
      error = result.error || 'Anmeldung fehlgeschlagen';
    }
    
    isLoading = false;
  }

  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      handleLogin();
    }
  }
</script>

<svelte:head>
  <title>Anmelden - Etikettdrucker</title>
</svelte:head>

<div class="login-container">
  <div class="login-card">
    <div class="logo-section">
      <img src="/Logo.svg" alt="Rotoclear" class="logo" />
      <h1>Etikettdrucker</h1>
      <p>Qualitätskontrolle & Etikettendruck</p>
    </div>

    <form on:submit|preventDefault={handleLogin} class="login-form">
      <h2>Anmelden</h2>
      
      {#if error}
        <div class="error-message">{error}</div>
      {/if}

      <div class="field">
        <label for="identifier">Benutzername oder E-Mail</label>
        <input
          id="identifier"
          type="text"
          bind:value={identifier}
          disabled={isLoading}
          on:keypress={handleKeyPress}
          required
        />
      </div>

      <div class="field">
        <label for="password">Passwort</label>
        <input
          id="password"
          type="password"
          bind:value={password}
          disabled={isLoading}
          on:keypress={handleKeyPress}
          required
        />
      </div>

      <div class="checkbox-field">
        <label class="checkbox-label">
          <input
            type="checkbox"
            bind:checked={stayLoggedIn}
            disabled={isLoading}
          />
          <span class="checkbox-text">Angemeldet bleiben</span>
        </label>
        <div class="checkbox-helper">
          {#if stayLoggedIn}
            Sie bleiben 30 Tage angemeldet
          {:else}
            Sie bleiben 7 Tage angemeldet
          {/if}
        </div>
      </div>

      <button 
        type="submit" 
        class="login-button"
        disabled={isLoading}
      >
        {#if isLoading}
          Anmelden...
        {:else}
          Anmelden
        {/if}
      </button>
    </form>

    <!-- <div class="footer">
      <p>&copy; 2025 Rotoclear GmbH – Alle Rechte vorbehalten</p>
    </div> -->
  </div>
</div>

<style>
  .login-container {
    min-height: 80vh;
    display: flex;
    align-items: center;
    justify-content: center;
    /* background: linear-gradient(135deg, #123345 0%, #324455 100%); */
    padding: 0;
  }

  .login-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    width: 100%;
    max-width: 400px;
  }

  .logo-section {
    background: linear-gradient(135deg, #123345 0%, #324455 100%);
    color: white;
    text-align: center;
    padding: 2rem;
  }

  .logo {
    width: 80px;
    height: 50px;
  }

  .logo-section h1 {
    margin: 0 0 0.5rem 0;
    font-size: 1.5rem;
    font-weight: 700;
  }

  .logo-section p {
    margin: 0;
    opacity: 0.9;
    font-size: 0.9rem;
  }

  .login-form {
    padding: 2rem;
  }

  .login-form h2 {
    margin: 0 0 1.5rem 0;
    color: #123345;
    text-align: center;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .field {
    margin-bottom: 1.5rem;
  }

  .field label {
    display: block;
    margin-bottom: 0.5rem;
    color: #123345;
    font-weight: 500;
    font-size: 0.9rem;
  }

  .field input {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #e2e8f0;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.2s, box-shadow 0.2s;
    box-sizing: border-box;
  }

  .field input:focus {
    outline: none;
    border-color: #123345;
    box-shadow: 0 0 0 3px rgba(18, 51, 69, 0.1);
  }

  .field input:disabled {
    background-color: #f8f9fa;
    cursor: not-allowed;
  }

  .checkbox-field {
    margin-bottom: 1.5rem;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    cursor: pointer;
    font-size: 0.9rem;
    color: #555;
  }

  .checkbox-label input[type="checkbox"] {
    margin-right: 0.5rem;
    width: auto;
    cursor: pointer;
  }

  .checkbox-text {
    user-select: none;
  }

  .checkbox-label:hover .checkbox-text {
    color: #123345;
  }

  .checkbox-helper {
    font-size: 0.8rem;
    color: #666;
    margin-top: 0.25rem;
    margin-left: 1.5rem;
    transition: color 0.2s;
  }

  .login-button {
    width: 100%;
    padding: 0.75rem;
    background: #123345;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s, transform 0.1s;
  }

  .login-button:hover:not(:disabled) {
    background: #1a4d66;
    transform: translateY(-1px);
  }

  .login-button:disabled {
    background: #cbd5e0;
    cursor: not-allowed;
    transform: none;
  }

  .error-message {
    background: #fed7d7;
    color: #c53030;
    padding: 0.75rem;
    border-radius: 6px;
    margin-bottom: 1.5rem;
    font-size: 0.9rem;
    border: 1px solid #feb2b2;
  }

  /* .footer {
    background: #f8f9fa;
    padding: 1rem;
    text-align: center;
    border-top: 1px solid #e2e8f0;
  }

  .footer p {
    margin: 0;
    color: #666;
    font-size: 0.8rem;
  } */

  @media (max-width: 480px) {
    .login-container {
      padding: 1rem;
    }

    .login-card {
      max-width: none;
    }

    .logo-section {
      padding: 1.5rem;
    }

    .logo {
      width: 60px;
      height: 60px;
    }

    .login-form {
      padding: 1.5rem;
    }
  }
</style>
