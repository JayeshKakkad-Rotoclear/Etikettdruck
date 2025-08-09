<script lang="ts">
  import { onMount } from 'svelte';
  import { authStore } from '$lib/stores/auth.js';
  import { goto } from '$app/navigation';
  
  let user: any = null;
  let isLoading = false;
  let message = '';
  let messageType: 'success' | 'error' = 'success';
  
  // Form data
  let currentPassword = '';
  let newPassword = '';
  let confirmPassword = '';
  let email = '';
  let firstName = '';
  let lastName = '';
  
  // Form states
  let showPasswordForm = false;
  let showProfileForm = false;

  onMount(() => {
    // Subscribe to auth state
    const unsubscribe = authStore.subscribe(state => {
      console.log('Auth state:', state); // Debug log
      
      // Only redirect if authentication check is complete (not loading)
      if (!state.isLoading) {
        if (!state.isAuthenticated) {
          goto('/login');
          return;
        }
      }
      
      user = state.user;
      console.log('User data:', user); // Debug log
      if (user) {
        email = user.email || '';
        firstName = user.firstName || '';
        lastName = user.lastName || '';
      }
    });

    return unsubscribe;
  });

  function clearMessage() {
    message = '';
  }

  function showMessage(text: string, type: 'success' | 'error' = 'success') {
    message = text;
    messageType = type;
    setTimeout(clearMessage, 5000);
  }

  async function updatePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showMessage('Bitte füllen Sie alle Passwort-Felder aus', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage('Neue Passwörter stimmen nicht überein', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showMessage('Neues Passwort muss mindestens 6 Zeichen lang sein', 'error');
      return;
    }

    isLoading = true;

    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      const result = await response.json();

      if (result.success) {
        showMessage('Passwort erfolgreich geändert', 'success');
        currentPassword = '';
        newPassword = '';
        confirmPassword = '';
        showPasswordForm = false;
      } else {
        showMessage(result.error || 'Fehler beim Ändern des Passworts', 'error');
      }
    } catch (error) {
      showMessage('Fehler beim Ändern des Passworts', 'error');
    }

    isLoading = false;
  }

  async function updateProfile() {
    if (!email || !firstName || !lastName) {
      showMessage('Bitte füllen Sie alle Profil-Felder aus', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showMessage('Bitte geben Sie eine gültige E-Mail-Adresse ein', 'error');
      return;
    }

    isLoading = true;

    try {
      const response = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          email,
          firstName,
          lastName
        })
      });

      const result = await response.json();

      if (result.success) {
        showMessage('Profil erfolgreich aktualisiert', 'success');
        
        // Update the auth store with new user data
        authStore.update(state => ({
          ...state,
          user: state.user ? { ...state.user, email, firstName, lastName } : null
        }));
        
        showProfileForm = false;
      } else {
        showMessage(result.error || 'Fehler beim Aktualisieren des Profils', 'error');
      }
    } catch (error) {
      showMessage('Fehler beim Aktualisieren des Profils', 'error');
    }

    isLoading = false;
  }

  function togglePasswordForm() {
    showPasswordForm = !showPasswordForm;
    showProfileForm = false;
    clearMessage();
    if (!showPasswordForm) {
      currentPassword = '';
      newPassword = '';
      confirmPassword = '';
    }
  }

  function toggleProfileForm() {
    showProfileForm = !showProfileForm;
    showPasswordForm = false;
    clearMessage();
    if (!showProfileForm && user) {
      email = user.email;
      firstName = user.firstName;
      lastName = user.lastName;
    }
  }
</script>

<svelte:head>
  <title>Mein Profil - Etikettdrucker</title>
</svelte:head>

<div class="profile-container">
  <div class="profile-header">
    <h1>Mein Profil</h1>
    <p>Verwalten Sie Ihre persönlichen Daten und Sicherheitseinstellungen</p>
  </div>

  {#if message}
    <div class="message {messageType}">
      {message}
      <button class="close-message" on:click={clearMessage}>&times;</button>
    </div>
  {/if}

  {#if user}
    <div class="profile-content">
      <!-- Current User Info -->
      <div class="info-card">
        <h2>Aktuelle Informationen</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Benutzername:</span>
            <span>{user.username || 'N/A'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">E-Mail:</span>
            <span>{user.email || 'N/A'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Vorname:</span>
            <span>{user.firstName || 'N/A'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Nachname:</span>
            <span>{user.lastName || 'N/A'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Rolle:</span>
            <span class="role-badge {user.role ? user.role.toLowerCase() : ''}">{user.role || 'N/A'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Status:</span>
            <span class="status-badge {user.status ? user.status.toLowerCase() : ''}">{user.status || 'N/A'}</span>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button 
          class="action-btn profile-btn"
          on:click={toggleProfileForm}
        >
          Profil bearbeiten
        </button>
        <button 
          class="action-btn password-btn"
          on:click={togglePasswordForm}
        >
          Passwort ändern
        </button>
      </div>

      <!-- Profile Edit Form -->
      {#if showProfileForm}
        <div class="form-card">
          <h3>Profil bearbeiten</h3>
          <form on:submit|preventDefault={updateProfile}>
            <div class="form-row">
              <div class="field">
                <label for="firstName">Vorname</label>
                <input
                  id="firstName"
                  type="text"
                  bind:value={firstName}
                  disabled={isLoading}
                  required
                />
              </div>
              <div class="field">
                <label for="lastName">Nachname</label>
                <input
                  id="lastName"
                  type="text"
                  bind:value={lastName}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
            <div class="field">
              <label for="email">E-Mail</label>
              <input
                id="email"
                type="email"
                bind:value={email}
                disabled={isLoading}
                required
              />
            </div>
            <div class="form-actions">
              <button 
                type="submit" 
                class="save-btn"
                disabled={isLoading}
              >
                {#if isLoading}
                  Speichern...
                {:else}
                  Speichern
                {/if}
              </button>
              <button 
                type="button" 
                class="cancel-btn"
                on:click={toggleProfileForm}
                disabled={isLoading}
              >
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      {/if}

      <!-- Password Change Form -->
      {#if showPasswordForm}
        <div class="form-card">
          <h3>Passwort ändern</h3>
          <form on:submit|preventDefault={updatePassword}>
            <div class="field">
              <label for="currentPassword">Aktuelles Passwort</label>
              <input
                id="currentPassword"
                type="password"
                bind:value={currentPassword}
                disabled={isLoading}
                required
              />
            </div>
            <div class="field">
              <label for="newPassword">Neues Passwort</label>
              <input
                id="newPassword"
                type="password"
                bind:value={newPassword}
                disabled={isLoading}
                required
                minlength="6"
              />
            </div>
            <div class="field">
              <label for="confirmPassword">Neues Passwort bestätigen</label>
              <input
                id="confirmPassword"
                type="password"
                bind:value={confirmPassword}
                disabled={isLoading}
                required
                minlength="6"
              />
            </div>
            <div class="form-actions">
              <button 
                type="submit" 
                class="save-btn"
                disabled={isLoading}
              >
                {#if isLoading}
                  Ändern...
                {:else}
                  Passwort ändern
                {/if}
              </button>
              <button 
                type="button" 
                class="cancel-btn"
                on:click={togglePasswordForm}
                disabled={isLoading}
              >
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      {/if}
    </div>
  {:else}
    <div class="loading">Laden...</div>
  {/if}
</div>

<style>
  .profile-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }

  .profile-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .profile-header h1 {
    color: #123345;
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  .profile-header p {
    color: #666;
    font-size: 1.1rem;
  }

  .message {
    padding: 1rem;
    border-radius: 6px;
    margin-bottom: 1.5rem;
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .message.success {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }

  .message.error {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  }

  .close-message {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: inherit;
    opacity: 0.7;
  }

  .close-message:hover {
    opacity: 1;
  }

  .info-card {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 1.5rem;
  }

  .info-card h2 {
    color: #123345;
    margin-bottom: 1rem;
    font-size: 1.25rem;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .info-item .info-label {
    font-weight: 600;
    color: #555;
    font-size: 0.9rem;
  }

  .info-item span {
    font-size: 1rem;
    color: #333;
  }

  .role-badge, .status-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    width: fit-content;
  }

  .role-badge.admin {
    background: #dc3545;
    color: white;
  }

  .role-badge.management {
    background: #b83280;
    color: white;
  }

  .role-badge.pruefer_ab {
    background: #22543d;
    color: white;
  }

  .role-badge.pruefer_a {
    background: #007bff;
    color: white;
  }

  .role-badge.pruefer_b {
    background: #17a2b8;
    color: white;
  }

  .role-badge.viewer {
    background: #6c757d;
    color: white;
  }

  .status-badge.active {
    background: #28a745;
    color: white;
  }

  .status-badge.inactive {
    background: #ffc107;
    color: #212529;
  }

  .status-badge.suspended {
    background: #dc3545;
    color: white;
  }

  .action-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-bottom: 1.5rem;
  }

  .action-btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .profile-btn {
    background: #123345;
    color: white;
  }

  .profile-btn:hover {
    background: #1a4d66;
  }

  .password-btn {
    background: #17a2b8;
    color: white;
  }

  .password-btn:hover {
    background: #138496;
  }

  .form-card {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 1.5rem;
  }

  .form-card h3 {
    color: #123345;
    margin-bottom: 1rem;
    font-size: 1.1rem;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .field {
    margin-bottom: 1rem;
  }

  .field label {
    display: block;
    margin-bottom: 0.5rem;
    color: #333;
    font-weight: 500;
    font-size: 0.9rem;
  }

  .field input {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #e2e8f0;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.2s;
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

  .form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 1.5rem;
  }

  .save-btn {
    background: #28a745;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .save-btn:hover:not(:disabled) {
    background: #218838;
  }

  .save-btn:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }

  .cancel-btn {
    background: #6c757d;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .cancel-btn:hover:not(:disabled) {
    background: #5a6268;
  }

  .cancel-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .loading {
    text-align: center;
    padding: 2rem;
    color: #666;
    font-size: 1.1rem;
  }

  @media (max-width: 768px) {
    .profile-container {
      padding: 1rem;
    }

    .info-grid {
      grid-template-columns: 1fr;
    }

    .form-row {
      grid-template-columns: 1fr;
    }

    .action-buttons {
      flex-direction: column;
      align-items: center;
    }

    .action-btn {
      width: 100%;
      max-width: 300px;
    }

    .form-actions {
      flex-direction: column;
    }
  }
</style>
