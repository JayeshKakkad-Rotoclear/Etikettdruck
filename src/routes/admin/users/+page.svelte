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
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .header h1 {
    color: #123345;
    font-size: 2rem;
    font-weight: 600;
    margin: 0;
  }

  .create-button {
    background: #123345;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .create-button:hover {
    background: #1a4d66;
  }

  .search-section {
    margin-bottom: 2rem;
  }

  .search-input {
    width: 100%;
    max-width: 300px;
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 1rem;
  }

  .users-table {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th, td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #e2e8f0;
  }

  th {
    background: #f8f9fa;
    font-weight: 600;
    color: #123345;
  }

  .role-badge, .status-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .role-admin { background: #fed7d7; color: #c53030; }
  .role-management { background: #fbb6ce; color: #b83280; }
  .role-pruefer_ab { background: #d6f5d6; color: #22543d; }
  .role-pruefer_a { background: #bee3f8; color: #2b6cb0; }
  .role-pruefer_b { background: #c6f6d5; color: #2f855a; }
  .role-viewer { background: #e2e8f0; color: #4a5568; }

  .status-active { background: #c6f6d5; color: #2f855a; }
  .status-inactive { background: #fed7d7; color: #c53030; }
  .status-suspended { background: #fbb6ce; color: #b83280; }

  .loading, .error-message {
    text-align: center;
    padding: 2rem;
    font-size: 1.1rem;
  }

  .error-message {
    background: #fed7d7;
    color: #c53030;
    border-radius: 6px;
    border: 1px solid #feb2b2;
  }

  /* Modal Styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal {
    background: white;
    border-radius: 8px;
    max-width: 600px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .modal-header h2 {
    margin: 0;
    color: #123345;
  }

  .close-button {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #666;
  }

  .create-form {
    padding: 1.5rem;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
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

  .field input, .field select {
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 1rem;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 2rem;
  }

  .cancel-button, .submit-button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
  }

  .cancel-button {
    background: #e2e8f0;
    color: #4a5568;
  }

  .submit-button {
    background: #123345;
    color: white;
  }

  /* Action Buttons */
  .action-buttons {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
  }

  .action-btn {
    padding: 0.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.2s;
    min-width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .reset-btn {
    background: #17a2b8;
    color: white;
  }

  .reset-btn:hover {
    background: #138496;
    transform: scale(1.05);
  }

  .delete-btn {
    background: #dc3545;
    color: white;
  }

  .delete-btn:hover:not(:disabled) {
    background: #c82333;
    transform: scale(1.05);
  }

  .delete-btn:disabled {
    background: #6c757d;
    cursor: not-allowed;
    opacity: 0.6;
  }

  .delete-btn:disabled:hover {
    transform: none;
  }

  /* Password Reset Modal */
  .password-reset-modal {
    max-width: 500px;
    width: 90%;
    padding: 1.5rem;
  }

  .modal-content {
    background: white;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  }

  .reset-info {
    margin-bottom: 0.5rem;
    color: #333;
  }

  .user-details {
    background: #f8f9fa;
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 1.5rem;
    color: #666;
    font-size: 0.9rem;
  }

  .password-info {
    background: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: 4px;
    padding: 0.75rem;
    margin: 1rem 0;
  }

  .password-info p {
    margin: 0.25rem 0;
    font-size: 0.9rem;
    color: #856404;
  }

  .reset-submit {
    background: #dc3545 !important;
  }

  .reset-submit:hover {
    background: #c82333 !important;
  }

  /* Delete Modal */
  .delete-modal {
    max-width: 500px;
    width: 90%;
    padding: 1.5rem;
  }

  .delete-warning {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: #fff5f5;
    border: 1px solid #fed7d7;
    border-radius: 6px;
  }

  .warning-icon {
    font-size: 2rem;
    flex-shrink: 0;
  }

  .warning-content h3 {
    margin: 0 0 0.5rem 0;
    color: #c53030;
    font-size: 1.1rem;
  }

  .warning-content p {
    margin: 0.25rem 0;
    color: #333;
  }

  .danger-info {
    background: #ffeaa7;
    border: 1px solid #ffd93d;
    border-radius: 4px;
    padding: 1rem;
    margin-bottom: 1.5rem;
  }

  .danger-info p {
    margin: 0 0 0.5rem 0;
    color: #856404;
  }

  .danger-info ul {
    margin: 0.5rem 0 0 1.5rem;
    color: #856404;
  }

  .danger-info li {
    margin-bottom: 0.25rem;
  }

  .delete-submit-button {
    background: #dc3545 !important;
    color: white;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .delete-submit-button:hover {
    background: #c82333 !important;
  }

  @media (max-width: 768px) {
    .user-management {
      padding: 1rem;
    }

    .header {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
    }

    .users-table {
      overflow-x: auto;
    }

    .form-row {
      grid-template-columns: 1fr;
    }

    .form-actions {
      flex-direction: column;
    }
  }
</style>
