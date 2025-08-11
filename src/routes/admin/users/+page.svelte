<script lang="ts">
  import { onMount } from 'svelte';
  import { authStore } from '$lib/stores/auth.js';
  import { goto } from '$app/navigation';

  interface User {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    status: string;
    lastLoginAt: string | null;
    createdAt: string;
    createdBy: string | null;
  }

  let users: User[] = [];
  let loading = true;
  let error = '';
  let currentUser: any = null;
  let showCreateForm = false;
  let showPasswordResetModal = false;
  let showDeleteModal = false;
  let selectedUser: User | null = null;
  let newPassword = '';
  let searchQuery = '';

  // Form data for creating new user
  let newUser = {
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'VIEWER'
  };

  onMount(() => {
    authStore.subscribe(state => {
      currentUser = state.user;
      
      // Only redirect if authentication check is complete (not loading)
      if (!state.isLoading) {
        if (!state.isAuthenticated || !state.user || state.user.role !== 'ADMIN') {
          goto('/login');
          return;
        }
      }
    });
    loadUsers();
  });

  async function loadUsers() {
    try {
      const response = await fetch(`/api/users?search=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();

      if (data.success) {
        users = data.data.users;
      } else {
        error = data.error || 'Fehler beim Laden der Benutzer';
      }
    } catch (err) {
      error = 'Verbindungsfehler';
    } finally {
      loading = false;
    }
  }

  async function createUser() {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
      });

      const data = await response.json();

      if (data.success) {
        showCreateForm = false;
        newUser = {
          username: '',
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          role: 'VIEWER'
        };
        loadUsers();
      } else {
        error = data.error || 'Fehler beim Erstellen des Benutzers';
      }
    } catch (err) {
      error = 'Verbindungsfehler';
    }
  }

  function formatDate(dateString: string | null) {
    if (!dateString) return 'Nie';
    return new Date(dateString).toLocaleString('de-DE');
  }

  function getRoleLabel(role: string) {
    const roleLabels: Record<string, string> = {
      'ADMIN': 'Administrator',
      'MANAGEMENT': 'Management',
      'PRUEFER_AB': 'Prüfer A & B',
      'PRUEFER_A': 'Prüfer A',
      'PRUEFER_B': 'Prüfer B',
      'VIEWER': 'Betrachter'
    };
    return roleLabels[role] || role;
  }

  function getStatusLabel(status: string) {
    const statusLabels: Record<string, string> = {
      'ACTIVE': 'Aktiv',
      'INACTIVE': 'Inaktiv',
      'SUSPENDED': 'Gesperrt'
    };
    return statusLabels[status] || status;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && showCreateForm) {
      showCreateForm = false;
    }
    if (event.key === 'Escape' && showPasswordResetModal) {
      showPasswordResetModal = false;
    }
    if (event.key === 'Escape' && showDeleteModal) {
      showDeleteModal = false;
    }
  }

  function openPasswordReset(user: User) {
    selectedUser = user;
    newPassword = '';
    showPasswordResetModal = true;
  }

  function closePasswordReset() {
    showPasswordResetModal = false;
    selectedUser = null;
    newPassword = '';
  }

  function openDeleteModal(user: User) {
    selectedUser = user;
    showDeleteModal = true;
  }

  function closeDeleteModal() {
    showDeleteModal = false;
    selectedUser = null;
  }

  async function resetUserPassword() {
    if (!selectedUser || !newPassword) {
      error = 'Bitte geben Sie ein neues Passwort ein';
      return;
    }

    if (newPassword.length < 6) {
      error = 'Passwort muss mindestens 6 Zeichen lang sein';
      return;
    }

    try {
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          userId: selectedUser.id,
          newPassword: newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        closePasswordReset();
        error = ''; // Clear any previous errors
        // Show success message temporarily
        const successMessage = `Passwort für ${selectedUser.username} wurde erfolgreich zurückgesetzt`;
        // You could show this in a toast or temporary message
        alert(successMessage); // Simple alert for now
      } else {
        error = data.error || 'Fehler beim Zurücksetzen des Passworts';
      }
    } catch (err) {
      error = 'Verbindungsfehler beim Zurücksetzen des Passworts';
    }
  }

  async function deleteUser() {
    if (!selectedUser) {
      error = 'Kein Benutzer ausgewählt';
      return;
    }

    // Prevent self-deletion
    if (currentUser && selectedUser.id === currentUser.id) {
      error = 'Sie können sich nicht selbst löschen';
      return;
    }

    try {
      const response = await fetch(`/api/admin/delete-user/${selectedUser.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        closeDeleteModal();
        error = ''; // Clear any previous errors
        // Show success message temporarily
        const successMessage = `Benutzer ${selectedUser.username} wurde erfolgreich gelöscht`;
        alert(successMessage); // Simple alert for now
        // Reload users list
        loadUsers();
      } else {
        error = data.error || 'Fehler beim Löschen des Benutzers';
      }
    } catch (err) {
      error = 'Verbindungsfehler beim Löschen des Benutzers';
    }
  }
</script>

<svelte:head>
  <title>Benutzerverwaltung - Etikettdrucker</title>
</svelte:head>

<svelte:window on:keydown={handleKeydown} />

<div class="user-management">
  <div class="header">
    <h1>Benutzerverwaltung</h1>
    <button class="create-button" on:click={() => showCreateForm = true}>
      Neuen Benutzer erstellen
    </button>
  </div>

  {#if error}
    <div class="error-message">{error}</div>
  {/if}

  <div class="search-section">
    <input
      type="text"
      placeholder="Benutzer suchen..."
      bind:value={searchQuery}
      on:input={loadUsers}
      class="search-input"
    />
  </div>

  {#if loading}
    <div class="loading">Lade Benutzer...</div>
  {:else}
    <div class="users-table">
      <table>
        <thead>
          <tr>
            <th>Benutzername</th>
            <th>Name</th>
            <th>E-Mail</th>
            <th>Rolle</th>
            <th>Status</th>
            <th>Letzte Anmeldung</th>
            <th>Erstellt</th>
            <th>Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {#each users as user}
            <tr>
              <td>{user.username}</td>
              <td>{user.firstName} {user.lastName}</td>
              <td>{user.email}</td>
              <td>
                <span class="role-badge role-{user.role.toLowerCase()}">
                  {getRoleLabel(user.role)}
                </span>
              </td>
              <td>
                <span class="status-badge status-{user.status.toLowerCase()}">
                  {getStatusLabel(user.status)}
                </span>
              </td>
              <td>{formatDate(user.lastLoginAt)}</td>
              <td>{formatDate(user.createdAt)}</td>
              <td>
                <div class="action-buttons">
                  <button 
                    class="action-btn reset-btn"
                    on:click={() => openPasswordReset(user)}
                    title="Passwort zurücksetzen"
                  >
                    🔑
                  </button>
                  <button 
                    class="action-btn delete-btn"
                    on:click={() => openDeleteModal(user)}
                    title="Benutzer löschen"
                    disabled={currentUser && user.id === currentUser.id}
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<!-- Create User Modal -->
{#if showCreateForm}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div 
    class="modal-overlay" 
    role="button"
    tabindex="0"
    aria-label="Hintergrund klicken um Modal zu schließen"
    on:click={() => showCreateForm = false}
  >
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div 
      class="modal" 
      role="dialog"
      tabindex="-1"
      aria-modal="true"
      aria-labelledby="modal-title"
      on:click|stopPropagation
    >
      <div class="modal-header">
        <h2 id="modal-title">Neuen Benutzer erstellen</h2>
        <button 
          class="close-button" 
          aria-label="Modal schließen"
          on:click={() => showCreateForm = false}
        >
          &times;
        </button>
      </div>

      <form on:submit|preventDefault={createUser} class="create-form">
        <div class="form-row">
          <div class="field">
            <label for="username">Benutzername</label>
            <input
              id="username"
              type="text"
              bind:value={newUser.username}
              required
            />
          </div>

          <div class="field">
            <label for="email">E-Mail</label>
            <input
              id="email"
              type="email"
              bind:value={newUser.email}
              required
            />
          </div>
        </div>

        <div class="form-row">
          <div class="field">
            <label for="firstName">Vorname</label>
            <input
              id="firstName"
              type="text"
              bind:value={newUser.firstName}
              required
            />
          </div>

          <div class="field">
            <label for="lastName">Nachname</label>
            <input
              id="lastName"
              type="text"
              bind:value={newUser.lastName}
              required
            />
          </div>
        </div>

        <div class="form-row">
          <div class="field">
            <label for="password">Passwort</label>
            <input
              id="password"
              type="password"
              bind:value={newUser.password}
              required
            />
          </div>

          <div class="field">
            <label for="role">Rolle</label>
            <select id="role" bind:value={newUser.role} required>
              <option value="VIEWER">Betrachter</option>
              <option value="PRUEFER_B">Prüfer B</option>
              <option value="PRUEFER_A">Prüfer A</option>
              <option value="PRUEFER_AB">Prüfer A & B</option>
              <option value="MANAGEMENT">Management</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="cancel-button" on:click={() => showCreateForm = false}>
            Abbrechen
          </button>
          <button type="submit" class="submit-button">
            Benutzer erstellen
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- Password Reset Modal -->
{#if showPasswordResetModal && selectedUser}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div 
    class="modal-overlay" 
    on:click={closePasswordReset}
  >
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div 
      class="modal-content password-reset-modal" 
      on:click|stopPropagation
      role="dialog"
      aria-modal="true"
      aria-labelledby="password-reset-title"
      tabindex="-1"
    >
      <div class="modal-header">
        <h2 id="password-reset-title">Passwort zurücksetzen</h2>
        <button 
          class="close-button" 
          on:click={closePasswordReset}
          aria-label="Modal schließen"
        >
          &times;
        </button>
      </div>

      <div class="modal-body">
        <p class="reset-info">
          Passwort für Benutzer <strong>{selectedUser.username}</strong> zurücksetzen:
        </p>
        <p class="user-details">
          {selectedUser.firstName} {selectedUser.lastName} ({selectedUser.email})
        </p>

        <form on:submit|preventDefault={resetUserPassword}>
          <div class="field">
            <input
              id="newPassword"
              type="password"
              bind:value={newPassword}
              placeholder="Mindestens 6 Zeichen"
              required
              minlength="6"
            />
          </div>

          <div class="password-info">
            <p>⚠️ Das neue Passwort wird sofort wirksam.</p>
            <p>Teilen Sie dem Benutzer das neue Passwort sicher mit.</p>
          </div>

          <div class="form-actions">
            <button type="button" class="cancel-button" on:click={closePasswordReset}>
              Abbrechen
            </button>
            <button type="submit" class="submit-button reset-submit">
              Passwort zurücksetzen
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
{/if}

<!-- Delete User Modal -->
{#if showDeleteModal && selectedUser}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div 
    class="modal-overlay" 
    on:click={closeDeleteModal}
  >
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div 
      class="modal-content delete-modal" 
      on:click|stopPropagation
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-title"
      tabindex="-1"
    >
      <div class="modal-header">
        <h2 id="delete-title">Benutzer löschen</h2>
        <button 
          class="close-button" 
          on:click={closeDeleteModal}
          aria-label="Modal schließen"
        >
          &times;
        </button>
      </div>

      <div class="modal-body">
        <div class="delete-warning">
          <div class="warning-icon">⚠️</div>
          <div class="warning-content">
            <h3>Sind Sie sicher?</h3>
            <p>
              Sie sind dabei, den Benutzer <strong>{selectedUser.username}</strong> permanent zu löschen.
            </p>
            <p class="user-details">
              {selectedUser.firstName} {selectedUser.lastName} ({selectedUser.email})
            </p>
          </div>
        </div>

        <div class="danger-info">
          <p><strong>⚠️ Diese Aktion kann nicht rückgängig gemacht werden!</strong></p>
          <ul>
            <li>Der Benutzer wird sofort aus dem System entfernt</li>
            <li>Alle Zugangsberechtigungen werden entzogen</li>
            <li>Der Benutzername wird für neue Accounts wieder verfügbar</li>
          </ul>
        </div>

        <div class="form-actions">
          <button type="button" class="cancel-button" on:click={closeDeleteModal}>
            Abbrechen
          </button>
          <button 
            type="button" 
            class="delete-submit-button"
            on:click={deleteUser}
          >
            Benutzer löschen
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .user-management {
    max-width: 1400px;
    margin: 0 auto;
    padding: var(--spacing-xl);
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-xl);
    padding: var(--spacing-xl);
    background: linear-gradient(135deg, var(--white) 0%, var(--bg-light) 100%);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-md);
    border: 1px solid var(--border-color);
  }

  .header h1 {
    color: var(--text-primary);
    font-size: var(--font-size-xxl);
    font-weight: var(--font-weight-semibold);
    margin: 0;
    letter-spacing: 0.5px;
  }

  .create-button {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
    color: var(--white);
    border: none;
    padding: var(--spacing-md) var(--spacing-xl);
    border-radius: var(--border-radius-md);
    font-weight: var(--font-weight-semibold);
    cursor: pointer;
    transition: all var(--transition-normal) ease;
    box-shadow: var(--shadow-sm);
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
    background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%);
    transition: left var(--transition-normal) ease;
  }

  .create-button:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  .create-button:hover::before {
    left: 100%;
  }

  .search-section {
    margin-bottom: var(--spacing-xl);
    padding: var(--spacing-lg);
    background: var(--white);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-color);
  }

  .search-input {
    width: 100%;
    max-width: 400px;
    padding: var(--spacing-md);
    border: 2px solid var(--border-color);
    border-radius: var(--border-radius-md);
    font-size: var(--font-size-base);
    transition: all var(--transition-fast) ease;
    background: var(--white);
    position: relative;
  }

  .search-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(18, 51, 69, 0.1);
    transform: translateY(-1px);
  }

  .users-table {
    background: var(--white);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-md);
    overflow: hidden;
    border: 1px solid var(--border-color);
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th, td {
    padding: var(--spacing-lg);
    text-align: left;
    border-bottom: 1px solid var(--border-light);
  }

  th {
    background: linear-gradient(135deg, var(--bg-light) 0%, #f1f5f9 100%);
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
    font-size: var(--font-size-sm);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  tbody tr {
    transition: all var(--transition-fast) ease;
  }

  tbody tr:hover {
    background: var(--bg-light);
    transform: scale(1.01);
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  .role-badge, .status-badge {
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--border-radius-full);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: inline-block;
    box-shadow: var(--shadow-sm);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  .role-admin { 
    background: linear-gradient(135deg, #fed7d7 0%, #fcb9b9 100%); 
    color: #c53030; 
    border-color: rgba(197, 48, 48, 0.2);
  }
  .role-management { 
    background: linear-gradient(135deg, #fbb6ce 0%, #f687b3 100%); 
    color: #b83280; 
    border-color: rgba(184, 50, 128, 0.2);
  }
  .role-pruefer_ab { 
    background: linear-gradient(135deg, #d6f5d6 0%, #9ae6b4 100%); 
    color: #22543d; 
    border-color: rgba(34, 84, 61, 0.2);
  }
  .role-pruefer_a { 
    background: linear-gradient(135deg, #bee3f8 0%, #90cdf4 100%); 
    color: #2b6cb0; 
    border-color: rgba(43, 108, 176, 0.2);
  }
  .role-pruefer_b { 
    background: linear-gradient(135deg, #c6f6d5 0%, #9ae6b4 100%); 
    color: #2f855a; 
    border-color: rgba(47, 133, 90, 0.2);
  }
  .role-viewer { 
    background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e0 100%); 
    color: #4a5568; 
    border-color: rgba(74, 85, 104, 0.2);
  }

  .status-active { 
    background: linear-gradient(135deg, #c6f6d5 0%, #9ae6b4 100%); 
    color: #2f855a; 
    border-color: rgba(47, 133, 90, 0.2);
  }
  .status-inactive { 
    background: linear-gradient(135deg, #fed7d7 0%, #fcb9b9 100%); 
    color: #c53030; 
    border-color: rgba(197, 48, 48, 0.2);
  }
  .status-suspended { 
    background: linear-gradient(135deg, #fbb6ce 0%, #f687b3 100%); 
    color: #b83280; 
    border-color: rgba(184, 50, 128, 0.2);
  }

  .loading, .error-message {
    text-align: center;
    padding: var(--spacing-xl);
    font-size: var(--font-size-lg);
    border-radius: var(--border-radius-lg);
    margin: var(--spacing-lg) 0;
  }

  .loading {
    background: var(--bg-light);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
  }

  .error-message {
    background: linear-gradient(135deg, #fed7d7 0%, #fcb9b9 100%);
    color: var(--danger-color);
    border: 1px solid #feb2b2;
    box-shadow: var(--shadow-sm);
  }

  /* Modal Styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .modal {
    background: var(--white);
    border-radius: var(--border-radius-lg);
    max-width: 700px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: var(--shadow-xl);
    border: 1px solid var(--border-color);
    animation: slideIn 0.3s ease;
  }

  @keyframes slideIn {
    from { 
      opacity: 0; 
      transform: translateY(-20px) scale(0.95); 
    }
    to { 
      opacity: 1; 
      transform: translateY(0) scale(1); 
    }
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-xl);
    border-bottom: 2px solid var(--border-light);
    background: linear-gradient(135deg, var(--white) 0%, var(--bg-light) 100%);
  }

  .modal-header h2 {
    margin: 0;
    color: var(--text-primary);
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
  }

  .close-button {
    background: none;
    border: none;
    font-size: var(--font-size-xl);
    cursor: pointer;
    color: var(--text-muted);
    width: 32px;
    height: 32px;
    border-radius: var(--border-radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--transition-fast) ease;
  }

  .close-button:hover {
    background: var(--danger-color);
    color: var(--white);
    transform: scale(1.1);
  }

  .create-form {
    padding: var(--spacing-xl);
    background: var(--white);
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-lg);
  }

  .field {
    display: flex;
    flex-direction: column;
  }

  .field label {
    margin-bottom: var(--spacing-sm);
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
    font-size: var(--font-size-sm);
  }

  .field input, .field select {
    padding: var(--spacing-md);
    border: 2px solid var(--border-color);
    border-radius: var(--border-radius-md);
    font-size: var(--font-size-base);
    transition: all var(--transition-fast) ease;
    background: var(--white);
  }

  .field input:focus, .field select:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(18, 51, 69, 0.1);
    transform: translateY(-1px);
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--spacing-md);
    margin-top: var(--spacing-xl);
    padding-top: var(--spacing-lg);
    border-top: 2px solid var(--border-light);
  }

  .cancel-button, .submit-button {
    padding: var(--spacing-md) var(--spacing-xl);
    border: none;
    border-radius: var(--border-radius-md);
    font-weight: var(--font-weight-semibold);
    cursor: pointer;
    transition: all var(--transition-normal) ease;
    font-size: var(--font-size-base);
    position: relative;
    overflow: hidden;
  }

  .cancel-button {
    background: var(--bg-light);
    color: var(--text-secondary);
    border: 2px solid var(--border-color);
  }

  .cancel-button:hover {
    background: var(--white);
    color: var(--text-primary);
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }

  .submit-button {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
    color: var(--white);
    box-shadow: var(--shadow-sm);
  }

  .submit-button:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  /* Action Buttons */
  .action-buttons {
    display: flex;
    gap: var(--spacing-sm);
    justify-content: center;
  }

  .action-btn {
    padding: var(--spacing-sm);
    border: none;
    border-radius: var(--border-radius-md);
    cursor: pointer;
    font-size: var(--font-size-base);
    transition: all var(--transition-normal) ease;
    min-width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--shadow-sm);
    position: relative;
    overflow: hidden;
  }

  .action-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%);
    transition: left var(--transition-normal) ease;
  }

  .action-btn:hover::before {
    left: 100%;
  }

  .reset-btn {
    background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
    color: var(--white);
  }

  .reset-btn:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: var(--shadow-md);
  }

  .delete-btn {
    background: linear-gradient(135deg, var(--danger-color) 0%, var(--danger-hover) 100%);
    color: var(--white);
  }

  .delete-btn:hover:not(:disabled) {
    transform: translateY(-2px) scale(1.05);
    box-shadow: var(--shadow-md);
  }

  .delete-btn:disabled {
    background: var(--text-muted);
    cursor: not-allowed;
    opacity: 0.6;
    transform: none !important;
    box-shadow: none !important;
  }

  /* Password Reset Modal */
  .password-reset-modal {
    max-width: 500px;
    width: 90%;
    padding: var(--spacing-xl);
  }

  .modal-content {
    background: var(--white);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-xl);
    border: 1px solid var(--border-color);
  }

  .reset-info {
    margin-bottom: var(--spacing-sm);
    color: var(--text-primary);
    font-size: var(--font-size-base);
  }

  .user-details {
    background: linear-gradient(135deg, var(--bg-light) 0%, #f1f5f9 100%);
    padding: var(--spacing-md);
    border-radius: var(--border-radius-md);
    margin-bottom: var(--spacing-xl);
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
    border: 1px solid var(--border-color);
  }

  .password-info {
    background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
    border: 1px solid #ffd93d;
    border-radius: var(--border-radius-md);
    padding: var(--spacing-md);
    margin: var(--spacing-lg) 0;
    box-shadow: var(--shadow-sm);
  }

  .password-info p {
    margin: var(--spacing-xs) 0;
    font-size: var(--font-size-sm);
    color: #856404;
    font-weight: var(--font-weight-normal);
  }

  .reset-submit {
    background: linear-gradient(135deg, var(--danger-color) 0%, var(--danger-hover) 100%) !important;
  }

  .reset-submit:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg) !important;
  }

  /* Delete Modal */
  .delete-modal {
    max-width: 520px;
    width: 90%;
    padding: var(--spacing-xl);
  }

  .delete-warning {
    display: flex;
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-xl);
    padding: var(--spacing-lg);
    background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%);
    border: 2px solid #feb2b2;
    border-radius: var(--border-radius-md);
    box-shadow: var(--shadow-sm);
  }

  .warning-icon {
    font-size: var(--font-size-xl);
    flex-shrink: 0;
    color: var(--danger-color);
  }

  .warning-content h3 {
    margin: 0 0 var(--spacing-sm) 0;
    color: var(--danger-color);
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
  }

  .warning-content p {
    margin: var(--spacing-xs) 0;
    color: var(--text-primary);
    font-size: var(--font-size-base);
  }

  .danger-info {
    background: linear-gradient(135deg, #ffeaa7 0%, #ffd93d 100%);
    border: 2px solid #ffc107;
    border-radius: var(--border-radius-md);
    padding: var(--spacing-lg);
    margin-bottom: var(--spacing-xl);
    box-shadow: var(--shadow-sm);
  }

  .danger-info p {
    margin: 0 0 var(--spacing-sm) 0;
    color: #856404;
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-base);
  }

  .danger-info ul {
    margin: var(--spacing-sm) 0 0 var(--spacing-xl);
    color: #856404;
  }

  .danger-info li {
    margin-bottom: var(--spacing-xs);
    font-size: var(--font-size-sm);
  }

  .delete-submit-button {
    background: linear-gradient(135deg, var(--danger-color) 0%, var(--danger-hover) 100%) !important;
    color: var(--white);
    padding: var(--spacing-md) var(--spacing-xl);
    border: none;
    border-radius: var(--border-radius-md);
    font-weight: var(--font-weight-semibold);
    cursor: pointer;
    transition: all var(--transition-normal) ease;
    box-shadow: var(--shadow-sm);
  }

  .delete-submit-button:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg) !important;
  }

  @media (max-width: 768px) {
    .user-management {
      padding: var(--spacing-md);
    }

    .header {
      flex-direction: column;
      gap: var(--spacing-lg);
      align-items: stretch;
      padding: var(--spacing-lg);
    }

    .header h1 {
      font-size: var(--font-size-xl);
    }

    .create-button {
      width: 100%;
      text-align: center;
    }

    .search-section {
      padding: var(--spacing-md);
    }

    .search-input {
      max-width: 100%;
    }

    .users-table {
      overflow-x: auto;
    }

    table {
      min-width: 800px;
    }

    th, td {
      padding: var(--spacing-md);
      font-size: var(--font-size-sm);
    }

    .form-row {
      grid-template-columns: 1fr;
      gap: var(--spacing-md);
    }

    .form-actions {
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .cancel-button, .submit-button {
      width: 100%;
      padding: var(--spacing-lg);
    }

    .modal {
      max-width: 95%;
      margin: var(--spacing-md);
    }

    .modal-header {
      padding: var(--spacing-lg);
    }

    .create-form {
      padding: var(--spacing-lg);
    }

    .action-buttons {
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .action-btn {
      min-width: 100%;
      justify-content: center;
    }
  }
</style>
