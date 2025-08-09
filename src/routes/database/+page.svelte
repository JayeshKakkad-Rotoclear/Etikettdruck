<script lang="ts">
  import { onMount } from 'svelte';
  import { authStore } from '$lib/stores/auth.js';
  import { goto } from '$app/navigation';
  import type { UserRole } from '../../app.d.ts';

  interface DatabaseStats {
    singleItems: number;
    singleItemsC2: number;
    singleItemsCbasic: number;
    singleItemsKK: number;
    zubehoerEtiketten: number;
    outerKartons: number;
    outerKartonEntries: number;
    users: number;
    sessions: number;
  }

  interface ProductData {
    id: number;
    serialnummer: string;
    artikel_bezeichnung?: string;
    artikel_nummer?: string;
    konfiguration?: string;
    pruefer_a?: string;
    pruefer_b?: string;
    createdAt?: string;
    updatedAt?: string;
  }

  let currentUser: any = null;
  let loading = true;
  let error = '';
  let stats: DatabaseStats | null = null;
  let selectedTable = 'stats';
  let tableData: ProductData[] = [];
  let currentPage = 1;
  let totalPages = 1;
  let pageSize = 50;
  let searchQuery = '';

  onMount(() => {
    authStore.subscribe(state => {
      currentUser = state.user;
      
      // Only redirect if authentication check is complete (not loading)
      if (!state.isLoading) {
        if (!state.isAuthenticated || !state.user) {
          goto('/login');
          return;
        }
        // Check if user has database access (MANAGEMENT or ADMIN)
        const userRole: UserRole = state.user.role;
        if (userRole !== 'MANAGEMENT' && userRole !== 'ADMIN') {
          goto('/');
          return;
        }
      }
    });
    loadDatabaseStats();
  });

  async function loadDatabaseStats() {
    try {
      const response = await fetch('/api/database/stats', {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        stats = data.data;
      } else {
        error = data.error || 'Fehler beim Laden der Datenbankstatistiken';
      }
    } catch (err) {
      error = 'Verbindungsfehler';
    } finally {
      loading = false;
    }
  }

  async function loadTableData(table: string, page: number = 1) {
    if (table === 'stats') return;
    
    loading = true;
    try {
      const response = await fetch(`/api/database/table/${table}?page=${page}&size=${pageSize}&search=${encodeURIComponent(searchQuery)}`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        tableData = data.data.items;
        totalPages = data.data.totalPages;
        currentPage = page;
      } else {
        error = data.error || 'Fehler beim Laden der Tabellendaten';
      }
    } catch (err) {
      error = 'Verbindungsfehler';
    } finally {
      loading = false;
    }
  }

  function handleTableChange(table: string) {
    selectedTable = table;
    currentPage = 1;
    searchQuery = '';
    if (table !== 'stats') {
      loadTableData(table);
    }
  }

  function handleSearch() {
    currentPage = 1;
    loadTableData(selectedTable);
  }

  function nextPage() {
    if (currentPage < totalPages) {
      loadTableData(selectedTable, currentPage + 1);
    }
  }

  function prevPage() {
    if (currentPage > 1) {
      loadTableData(selectedTable, currentPage - 1);
    }
  }

  function formatDate(dateString: string | null | undefined) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('de-DE');
  }

  function getTableDisplayName(table: string) {
    const tableNames: Record<string, string> = {
      'stats': 'Übersicht',
      'cpro': 'C Pro Geräte',
      'c2': 'C2 Geräte',
      'cbasic': 'C Basic Geräte',
      'kk': 'Kamerakopf Geräte',
      'zubehoer': 'Zubehör Etiketten',
      'kartons': 'Äußere Kartons',
      'karton_entries': 'Karton Einträge'
    };
    return tableNames[table] || table;
  }
</script>

<svelte:head>
  <title>Datenbank Management - Etikettdrucker</title>
</svelte:head>

<div class="database-management">
  <div class="header">
    <h1>Datenbank Management</h1>
    <div class="user-info">
      <span class="role-badge {currentUser?.role?.toLowerCase()}">
        {currentUser?.role === 'MANAGEMENT' ? 'Management' : 'Administrator'}
      </span>
    </div>
  </div>

  {#if error}
    <div class="error-message">{error}</div>
  {/if}

  <div class="navigation">
    <div class="table-selector">
      <label for="table-select">Datenbereich auswählen:</label>
      <select id="table-select" bind:value={selectedTable} on:change={() => handleTableChange(selectedTable)}>
        <option value="stats">Übersicht</option>
        <option value="cpro">C Pro Geräte</option>
        <option value="c2">C2 Geräte</option>
        <option value="cbasic">C Basic Geräte</option>
        <option value="kk">Kamerakopf Geräte</option>
        <option value="zubehoer">Zubehör Etiketten</option>
        <option value="kartons">Äußere Kartons</option>
        <option value="karton_entries">Karton Einträge</option>
      </select>
    </div>

    {#if selectedTable !== 'stats'}
      <div class="search-section">
        <input
          type="text"
          placeholder="Serialnummer oder Artikel suchen..."
          bind:value={searchQuery}
          on:input={handleSearch}
          class="search-input"
        />
      </div>
    {/if}
  </div>

  {#if loading}
    <div class="loading">Lade Daten...</div>
  {:else if selectedTable === 'stats' && stats}
    <div class="stats-grid">
      <div class="stat-card">
        <h3>C Pro Geräte</h3>
        <div class="stat-number">{stats.singleItems}</div>
        <div class="stat-label">Registrierte Geräte</div>
      </div>

      <div class="stat-card">
        <h3>C2 Geräte</h3>
        <div class="stat-number">{stats.singleItemsC2}</div>
        <div class="stat-label">Registrierte Geräte</div>
      </div>

      <div class="stat-card">
        <h3>C Basic Geräte</h3>
        <div class="stat-number">{stats.singleItemsCbasic}</div>
        <div class="stat-label">Registrierte Geräte</div>
      </div>

      <div class="stat-card">
        <h3>Kamerakopf Geräte</h3>
        <div class="stat-number">{stats.singleItemsKK}</div>
        <div class="stat-label">Registrierte Geräte</div>
      </div>

      <div class="stat-card">
        <h3>Zubehör Etiketten</h3>
        <div class="stat-number">{stats.zubehoerEtiketten}</div>
        <div class="stat-label">Etiketten</div>
      </div>

      <div class="stat-card">
        <h3>Äußere Kartons</h3>
        <div class="stat-number">{stats.outerKartons}</div>
        <div class="stat-label">Kartons</div>
      </div>

      <div class="stat-card">
        <h3>Karton Einträge</h3>
        <div class="stat-number">{stats.outerKartonEntries}</div>
        <div class="stat-label">Einträge</div>
      </div>

      <div class="stat-card">
        <h3>Benutzer</h3>
        <div class="stat-number">{stats.users}</div>
        <div class="stat-label">Registrierte Benutzer</div>
      </div>

      <div class="stat-card">
        <h3>Aktive Sitzungen</h3>
        <div class="stat-number">{stats.sessions}</div>
        <div class="stat-label">Angemeldete Benutzer</div>
      </div>
    </div>
  {:else if selectedTable !== 'stats'}
    <div class="table-view">
      <div class="table-header">
        <h2>{getTableDisplayName(selectedTable)}</h2>
        {#if totalPages > 1}
          <div class="pagination-info">
            Seite {currentPage} von {totalPages}
          </div>
        {/if}
      </div>

      {#if tableData.length > 0}
        <div class="data-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Serialnummer</th>
                <th>Artikel Bezeichnung</th>
                <th>Artikel Nummer</th>
                <th>Konfiguration</th>
                <th>Prüfer A</th>
                <th>Prüfer B</th>
                <th>Erstellt</th>
                <th>Aktualisiert</th>
              </tr>
            </thead>
            <tbody>
              {#each tableData as item}
                <tr>
                  <td>{item.id}</td>
                  <td class="serial-number">{item.serialnummer}</td>
                  <td>{item.artikel_bezeichnung || 'N/A'}</td>
                  <td>{item.artikel_nummer || 'N/A'}</td>
                  <td>
                    {#if item.konfiguration}
                      <span class="config-badge">{item.konfiguration}</span>
                    {:else}
                      N/A
                    {/if}
                  </td>
                  <td>
                    {#if item.pruefer_a}
                      <span class="pruefer-badge pruefer-a">{item.pruefer_a}</span>
                    {:else}
                      <span class="pruefer-empty">Noch nicht geprüft</span>
                    {/if}
                  </td>
                  <td>
                    {#if item.pruefer_b}
                      <span class="pruefer-badge pruefer-b">{item.pruefer_b}</span>
                    {:else}
                      <span class="pruefer-empty">Noch nicht geprüft</span>
                    {/if}
                  </td>
                  <td>{formatDate(item.createdAt)}</td>
                  <td>{formatDate(item.updatedAt)}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>

        {#if totalPages > 1}
          <div class="pagination">
            <button 
              class="page-btn" 
              on:click={prevPage} 
              disabled={currentPage === 1}
            >
              ← Vorherige
            </button>
            
            <span class="page-info">
              Seite {currentPage} von {totalPages}
            </span>
            
            <button 
              class="page-btn" 
              on:click={nextPage} 
              disabled={currentPage === totalPages}
            >
              Nächste →
            </button>
          </div>
        {/if}
      {:else}
        <div class="no-data">
          <p>Keine Daten für {getTableDisplayName(selectedTable)} gefunden.</p>
          {#if searchQuery}
            <p>Versuchen Sie eine andere Suchanfrage.</p>
          {/if}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .database-management {
    max-width: 1400px;
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

  .user-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .role-badge {
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .role-badge.management {
    background: #b83280;
    color: white;
  }

  .role-badge.admin {
    background: #dc3545;
    color: white;
  }

  .navigation {
    display: flex;
    gap: 2rem;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
  }

  .table-selector {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .table-selector label {
    font-weight: 500;
    color: #123345;
  }

  .table-selector select {
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 1rem;
    min-width: 200px;
  }

  .search-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .search-input {
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 1rem;
    min-width: 300px;
  }

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

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
  }

  .stat-card {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid #e2e8f0;
  }

  .stat-card h3 {
    margin: 0 0 1rem 0;
    color: #123345;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .stat-number {
    font-size: 2.5rem;
    font-weight: 700;
    color: #123345;
    margin-bottom: 0.5rem;
  }

  .stat-label {
    color: #666;
    font-size: 0.875rem;
  }

  .table-view {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #e2e8f0;
    background: #f8f9fa;
  }

  .table-header h2 {
    margin: 0;
    color: #123345;
    font-size: 1.5rem;
  }

  .pagination-info {
    color: #666;
    font-size: 0.875rem;
  }

  .data-table {
    overflow-x: auto;
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
    position: sticky;
    top: 0;
  }

  .serial-number {
    font-family: monospace;
    font-weight: 600;
    color: #123345;
  }

  .config-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 500;
    background: #bee3f8;
    color: #2b6cb0;
  }

  .pruefer-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .pruefer-badge.pruefer-a {
    background: #bee3f8;
    color: #2b6cb0;
  }

  .pruefer-badge.pruefer-b {
    background: #c6f6d5;
    color: #2f855a;
  }

  .pruefer-empty {
    color: #666;
    font-style: italic;
    font-size: 0.875rem;
  }

  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    background: #f8f9fa;
    border-top: 1px solid #e2e8f0;
  }

  .page-btn {
    padding: 0.5rem 1rem;
    border: 1px solid #123345;
    background: white;
    color: #123345;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
  }

  .page-btn:hover:not(:disabled) {
    background: #123345;
    color: white;
  }

  .page-btn:disabled {
    background: #f8f9fa;
    color: #666;
    border-color: #e2e8f0;
    cursor: not-allowed;
  }

  .page-info {
    font-weight: 500;
    color: #123345;
  }

  .no-data {
    text-align: center;
    padding: 3rem;
    color: #666;
  }

  .no-data p {
    margin: 0.5rem 0;
  }

  @media (max-width: 768px) {
    .database-management {
      padding: 1rem;
    }

    .header {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
    }

    .navigation {
      flex-direction: column;
      align-items: stretch;
    }

    .table-selector select,
    .search-input {
      min-width: unset;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }

    .data-table {
      font-size: 0.875rem;
    }

    th, td {
      padding: 0.5rem;
    }

    .pagination {
      flex-direction: column;
      gap: 0.5rem;
    }
  }
</style>
