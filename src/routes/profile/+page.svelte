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
    max-width: 900px;
    margin: 0 auto;
    padding: var(--spacing-xl);
  }

  .profile-header {
    text-align: center;
    margin-bottom: var(--spacing-xxl);
    padding: var(--spacing-xl);
    background: linear-gradient(135deg, var(--white) 0%, var(--bg-light) 100%);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-md);
    border: 1px solid var(--border-color);
  }

  .profile-header h1 {
    color: var(--text-primary);
    font-size: var(--font-size-xxl);
    margin-bottom: var(--spacing-sm);
    font-weight: var(--font-weight-semibold);
    letter-spacing: 0.5px;
  }

  .profile-header p {
    color: var(--text-secondary);
    font-size: var(--font-size-lg);
    line-height: 1.6;
  }

  .message {
    padding: var(--spacing-lg);
    border-radius: var(--border-radius-md);
    margin-bottom: var(--spacing-xl);
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: var(--shadow-sm);
    animation: slideDown 0.3s ease;
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

  .message.success {
    background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
    color: #155724;
    border: 2px solid #b8e4c0;
  }

  .message.error {
    background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
    color: #721c24;
    border: 2px solid #f1b0b7;
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

  .info-card {
    background: var(--white);
    border-radius: var(--border-radius-lg);
    padding: var(--spacing-xl);
    box-shadow: var(--shadow-md);
    margin-bottom: var(--spacing-xl);
    border: 1px solid var(--border-color);
    transition: all var(--transition-normal) ease;
  }

  .info-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  .info-card h2 {
    color: var(--text-primary);
    margin-bottom: var(--spacing-lg);
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
    border-bottom: 2px solid var(--border-light);
    padding-bottom: var(--spacing-sm);
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--spacing-lg);
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    padding: var(--spacing-md);
    background: var(--bg-light);
    border-radius: var(--border-radius-md);
    border: 1px solid var(--border-color);
    transition: all var(--transition-fast) ease;
  }

  .info-item:hover {
    background: var(--white);
    box-shadow: var(--shadow-sm);
  }

  .info-item .info-label {
    font-weight: var(--font-weight-semibold);
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .info-item span {
    font-size: var(--font-size-base);
    color: var(--text-primary);
    font-weight: var(--font-weight-normal);
  }

  .role-badge, .status-badge {
    display: inline-flex;
    align-items: center;
    padding: var(--spacing-xs) var(--spacing-md);
    border-radius: var(--border-radius-full);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    width: fit-content;
    box-shadow: var(--shadow-sm);
    transition: all var(--transition-fast) ease;
    border: 1px solid transparent;
  }

  .role-badge:hover, .status-badge:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  .role-badge.admin {
    background: linear-gradient(135deg, #dc3545, #c82333);
    color: var(--white);
    border-color: #dc3545;
  }

  .role-badge.management {
    background: linear-gradient(135deg, #b83280, #a02970);
    color: var(--white);
    border-color: #b83280;
  }

  .role-badge.pruefer_ab {
    background: linear-gradient(135deg, #22543d, #1a4d66);
    color: var(--white);
    border-color: #22543d;
  }

  .role-badge.pruefer_a {
    background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
    color: var(--white);
    border-color: var(--primary-color);
  }

  .role-badge.pruefer_b {
    background: linear-gradient(135deg, var(--info-color), #138496);
    color: var(--white);
    border-color: var(--info-color);
  }

  .role-badge.viewer {
    background: linear-gradient(135deg, var(--danger-color), var(--danger-hover));
    color: var(--white);
    border-color: var(--danger-color);
  }

  .status-badge.active {
    background: linear-gradient(135deg, var(--success-color), #218838);
    color: var(--white);
    border-color: var(--success-color);
  }

  .status-badge.inactive {
    background: linear-gradient(135deg, var(--warning-color), #e0a800);
    color: var(--text-primary);
    border-color: var(--warning-color);
  }

  .status-badge.suspended {
    background: linear-gradient(135deg, var(--error-color), #c82333);
    color: var(--white);
    border-color: var(--error-color);
  }

  .action-buttons {
    display: flex;
    gap: var(--spacing-md);
    justify-content: center;
    margin-bottom: var(--spacing-xl);
    flex-wrap: wrap;
  }

  .action-btn {
    padding: var(--spacing-md) var(--spacing-xl);
    border: none;
    border-radius: var(--border-radius-md);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-medium);
    cursor: pointer;
    transition: all var(--transition-normal) ease;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-sm);
    box-shadow: var(--shadow-sm);
    position: relative;
    overflow: hidden;
    min-height: 44px;
  }

  .action-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left var(--transition-slow) ease;
  }

  .action-btn:hover::before {
    left: 100%;
  }

  .action-btn:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  .action-btn:active {
    transform: translateY(0);
    box-shadow: var(--shadow-sm);
  }

  .profile-btn {
    background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
    color: var(--white);
  }

  .profile-btn:hover {
    background: linear-gradient(135deg, var(--primary-hover), var(--primary-active));
  }

  .password-btn {
    background: linear-gradient(135deg, var(--info-color), #138496);
    color: var(--white);
  }

  .password-btn:hover {
    background: linear-gradient(135deg, #138496, #0c6674);
  }

  .form-card {
    background: var(--white);
    border-radius: var(--border-radius-lg);
    padding: var(--spacing-xl);
    box-shadow: var(--shadow-md);
    margin-bottom: var(--spacing-xl);
    border: 1px solid var(--border-color);
    transition: all var(--transition-normal) ease;
  }

  .form-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  .form-card h3 {
    color: var(--text-primary);
    margin-bottom: var(--spacing-lg);
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    border-bottom: 2px solid var(--border-light);
    padding-bottom: var(--spacing-sm);
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-lg);
  }

  .field {
    margin-bottom: var(--spacing-lg);
  }

  .field label {
    display: block;
    margin-bottom: var(--spacing-sm);
    color: var(--text-secondary);
    font-weight: var(--font-weight-medium);
    font-size: var(--font-size-sm);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .field input {
    width: 100%;
    padding: var(--spacing-md);
    border: 2px solid var(--border-color);
    border-radius: var(--border-radius-md);
    font-size: var(--font-size-base);
    transition: all var(--transition-fast) ease;
    box-sizing: border-box;
    background: var(--white);
  }

  .field input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px var(--primary-light);
    background: var(--bg-light);
  }

  .field input:disabled {
    background-color: var(--gray-100);
    color: var(--text-muted);
    cursor: not-allowed;
    border-color: var(--border-light);
  }

  .form-actions {
    display: flex;
    gap: var(--spacing-md);
    justify-content: flex-end;
    margin-top: var(--spacing-xl);
    flex-wrap: wrap;
  }

  .save-btn {
    background: linear-gradient(135deg, var(--success-color), #218838);
    color: var(--white);
    border: none;
    padding: var(--spacing-md) var(--spacing-xl);
    border-radius: var(--border-radius-md);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-medium);
    cursor: pointer;
    transition: all var(--transition-normal) ease;
    box-shadow: var(--shadow-sm);
    position: relative;
    overflow: hidden;
    min-height: 44px;
  }

  .save-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left var(--transition-slow) ease;
  }

  .save-btn:hover:not(:disabled)::before {
    left: 100%;
  }

  .save-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, #218838, #1e7e34);
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  .save-btn:disabled {
    background: var(--gray-500);
    cursor: not-allowed;
    opacity: 0.6;
  }

  .cancel-btn {
    background: linear-gradient(135deg, var(--danger-color), var(--danger-hover));
    color: var(--white);
    border: none;
    padding: var(--spacing-md) var(--spacing-xl);
    border-radius: var(--border-radius-md);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-medium);
    cursor: pointer;
    transition: all var(--transition-normal) ease;
    box-shadow: var(--shadow-sm);
    position: relative;
    overflow: hidden;
    min-height: 44px;
  }

  .cancel-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left var(--transition-slow) ease;
  }

  .cancel-btn:hover:not(:disabled)::before {
    left: 100%;
  }

  .cancel-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, var(--danger-hover), #495057);
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  .cancel-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .loading {
    text-align: center;
    padding: var(--spacing-2xl);
    color: var(--text-secondary);
    font-size: var(--font-size-lg);
    background: var(--white);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-md);
    margin: var(--spacing-xl) 0;
  }

  @media (max-width: 768px) {
    .profile-container {
      padding: var(--spacing-lg);
    }

    .info-grid {
      grid-template-columns: 1fr;
      gap: var(--spacing-md);
    }

    .form-row {
      grid-template-columns: 1fr;
      gap: var(--spacing-md);
    }

    .action-buttons {
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .action-btn {
      width: 100%;
      max-width: 300px;
      justify-content: center;
    }

    .form-actions {
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .save-btn,
    .cancel-btn {
      width: 100%;
      justify-content: center;
    }

    .profile-header h1 {
      font-size: var(--font-size-xl);
    }

    .form-card {
      padding: var(--spacing-lg);
    }

    .info-card {
      padding: var(--spacing-lg);
    }
  }
</style>
