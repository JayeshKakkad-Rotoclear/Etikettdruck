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

  .user-info {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
  }

  .role-badge {
    padding: var(--spacing-sm) var(--spacing-lg);
    border-radius: var(--border-radius-full);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    box-shadow: var(--shadow-sm);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  .role-badge.management {
    background: linear-gradient(135deg, #b83280 0%, #a0266d 100%);
    color: var(--white);
  }

  .role-badge.admin {
    background: linear-gradient(135deg, var(--danger-color) 0%, var(--danger-hover) 100%);
    color: var(--white);
  }

  .navigation {
    display: flex;
    gap: var(--spacing-xl);
    align-items: end;
    margin-bottom: var(--spacing-xl);
    flex-wrap: wrap;
    padding: var(--spacing-lg);
    background: var(--white);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-color);
  }

  .table-selector {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .table-selector label {
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
    font-size: var(--font-size-sm);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .table-selector select {
    padding: var(--spacing-md);
    border: 2px solid var(--border-color);
    border-radius: var(--border-radius-md);
    font-size: var(--font-size-base);
    min-width: 250px;
    background: var(--white);
    transition: all var(--transition-fast) ease;
    font-weight: var(--font-weight-normal);
  }

  .table-selector select:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(18, 51, 69, 0.1);
    transform: translateY(-1px);
  }

  .search-section {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .search-input {
    padding: var(--spacing-md);
    border: 2px solid var(--border-color);
    border-radius: var(--border-radius-md);
    font-size: var(--font-size-base);
    min-width: 350px;
    background: var(--white);
    transition: all var(--transition-fast) ease;
  }

  .search-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(18, 51, 69, 0.1);
    transform: translateY(-1px);
  }

  .search-input::placeholder {
    color: var(--text-muted);
    font-style: italic;
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

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--spacing-xl);
  }

  .stat-card {
    background: var(--white);
    border-radius: var(--border-radius-lg);
    padding: var(--spacing-xl);
    box-shadow: var(--shadow-md);
    border: 1px solid var(--border-color);
    transition: all var(--transition-normal) ease;
    position: relative;
    overflow: hidden;
    border-left: 4px solid var(--primary-color);
  }

  .stat-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, transparent 0%, rgba(18, 51, 69, 0.02) 100%);
    pointer-events: none;
  }

  .stat-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
    border-left-color: var(--accent-color);
  }

  .stat-card h3 {
    margin: 0 0 var(--spacing-lg) 0;
    color: var(--text-primary);
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    position: relative;
    z-index: 1;
  }

  .stat-number {
    font-size: var(--font-size-xxl);
    font-weight: var(--font-weight-bold);
    color: var(--primary-color);
    margin-bottom: var(--spacing-sm);
    position: relative;
    z-index: 1;
  }

  .stat-label {
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-normal);
    position: relative;
    z-index: 1;
  }

  .table-view {
    background: var(--white);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-md);
    overflow: hidden;
    border: 1px solid var(--border-color);
  }

  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-xl);
    border-bottom: 2px solid var(--border-light);
    background: linear-gradient(135deg, var(--bg-light) 0%, #f1f5f9 100%);
  }

  .table-header h2 {
    margin: 0;
    color: var(--text-primary);
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
  }

  .pagination-info {
    color: var(--text-muted);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-normal);
    padding: var(--spacing-xs) var(--spacing-md);
    background: var(--white);
    border-radius: var(--border-radius-full);
    border: 1px solid var(--border-color);
  }

  .data-table {
    overflow-x: auto;
    max-height: 70vh;
    scrollbar-width: thin;
    scrollbar-color: var(--primary-color) var(--bg-light);
  }

  .data-table::-webkit-scrollbar {
    height: 8px;
    width: 8px;
  }

  .data-table::-webkit-scrollbar-track {
    background: var(--bg-light);
    border-radius: var(--border-radius-sm);
  }

  .data-table::-webkit-scrollbar-thumb {
    background: var(--primary-color);
    border-radius: var(--border-radius-sm);
  }

  .data-table::-webkit-scrollbar-thumb:hover {
    background: var(--primary-hover);
  }

  table {
    width: 100%;
    border-collapse: collapse;
    min-width: 1200px;
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
    position: sticky;
    top: 0;
    z-index: 10;
    font-size: var(--font-size-sm);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  tbody tr {
    transition: all var(--transition-fast) ease;
  }

  tbody tr:hover {
    background: var(--bg-light);
    transform: scale(1.005);
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  .serial-number {
    font-family: 'Courier New', monospace;
    font-weight: var(--font-weight-semibold);
    color: var(--primary-color);
    background: linear-gradient(135deg, rgba(18, 51, 69, 0.1) 0%, rgba(18, 51, 69, 0.05) 100%);
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--border-radius-sm);
    font-size: var(--font-size-sm);
  }

  .config-badge {
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--border-radius-full);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
    background: linear-gradient(135deg, #bee3f8 0%, #90cdf4 100%);
    color: #2b6cb0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border: 1px solid rgba(43, 108, 176, 0.2);
    box-shadow: var(--shadow-sm);
  }

  .pruefer-badge {
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--border-radius-full);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    box-shadow: var(--shadow-sm);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  .pruefer-badge.pruefer-a {
    background: linear-gradient(135deg, #bee3f8 0%, #90cdf4 100%);
    color: #2b6cb0;
    border-color: rgba(43, 108, 176, 0.2);
  }

  .pruefer-badge.pruefer-b {
    background: linear-gradient(135deg, #c6f6d5 0%, #9ae6b4 100%);
    color: #2f855a;
    border-color: rgba(47, 133, 90, 0.2);
  }

  .pruefer-empty {
    color: var(--text-muted);
    font-style: italic;
    font-size: 0.875rem;
  }

  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: var(--spacing-lg);
    padding: var(--spacing-xl);
    background: linear-gradient(135deg, var(--bg-light) 0%, #f1f5f9 100%);
    border-top: 2px solid var(--border-light);
  }

  .page-btn {
    padding: var(--spacing-sm) var(--spacing-lg);
    border: 2px solid var(--primary-color);
    background: var(--white);
    color: var(--primary-color);
    border-radius: var(--border-radius-md);
    cursor: pointer;
    font-weight: var(--font-weight-semibold);
    transition: all var(--transition-normal) ease;
    position: relative;
    overflow: hidden;
    font-size: var(--font-size-sm);
  }

  .page-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent 0%, rgba(18, 51, 69, 0.1) 50%, transparent 100%);
    transition: left var(--transition-normal) ease;
  }

  .page-btn:hover:not(:disabled) {
    background: var(--primary-color);
    color: var(--white);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  .page-btn:hover:not(:disabled)::before {
    left: 100%;
  }

  .page-btn:disabled {
    background: var(--bg-light);
    color: var(--text-muted);
    border-color: var(--border-color);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .page-info {
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
    font-size: var(--font-size-base);
    padding: var(--spacing-sm) var(--spacing-lg);
    background: var(--white);
    border-radius: var(--border-radius-md);
    border: 1px solid var(--border-color);
  }

  .no-data {
    text-align: center;
    padding: var(--spacing-xxl);
    color: var(--text-muted);
    background: var(--bg-light);
    border-radius: var(--border-radius-lg);
    margin: var(--spacing-lg);
  }

  .no-data p {
    margin: var(--spacing-sm) 0;
    font-size: var(--font-size-base);
  }

  @media (max-width: 768px) {
    .database-management {
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
      text-align: center;
    }

    .user-info {
      justify-content: center;
    }

    .navigation {
      flex-direction: column;
      align-items: stretch;
      gap: var(--spacing-lg);
      padding: var(--spacing-md);
    }

    .table-selector select,
    .search-input {
      min-width: unset;
      width: 100%;
    }

    .stats-grid {
      grid-template-columns: 1fr;
      gap: var(--spacing-lg);
    }

    .stat-card {
      padding: var(--spacing-lg);
    }

    .table-header {
      flex-direction: column;
      gap: var(--spacing-md);
      align-items: stretch;
      text-align: center;
      padding: var(--spacing-lg);
    }

    .table-header h2 {
      font-size: var(--font-size-lg);
    }

    .data-table {
      font-size: var(--font-size-sm);
      max-height: 60vh;
    }

    th, td {
      padding: var(--spacing-sm);
      font-size: var(--font-size-xs);
    }

    .serial-number {
      font-size: var(--font-size-xs);
    }

    .config-badge,
    .pruefer-badge {
      font-size: var(--font-size-xs);
      padding: var(--spacing-xs);
    }

    .pagination {
      flex-direction: column;
      gap: var(--spacing-md);
      padding: var(--spacing-lg);
    }

    .page-btn {
      width: 100%;
      padding: var(--spacing-md);
    }

    .no-data {
      padding: var(--spacing-xl);
      margin: var(--spacing-md);
    }
  }

  @media (max-width: 480px) {
    .database-management {
      padding: var(--spacing-sm);
    }

    .header {
      padding: var(--spacing-md);
    }

    .navigation {
      padding: var(--spacing-sm);
    }

    .stat-card {
      padding: var(--spacing-md);
    }

    .stat-number {
      font-size: var(--font-size-xl);
    }

    table {
      min-width: 800px;
    }

    .data-table {
      max-height: 50vh;
    }
  }
</style>
