<script lang="ts">
  import { onMount } from 'svelte';

  export let items: any[] = [];
  let loading = true;
  let error: string | null = null;
  let expandedGroups: Set<number> = new Set();

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }

  $: allRows = items.flatMap((entry) => {
    return entry.entries.map((product: any) => ({
      id: entry.id,
      created_at: formatDate(entry.created_at),
      lieferscheinnummer: entry.lieferscheinnummer || 'N/A',
      artikelnummer: product.artikelnummer,
      artikelbezeichnung: product.artikelbezeichnung,
      menge: product.menge,
      serialnummer: product.serialnummer || null,
    }));
  });

  $: totalEtiketten = items.length;
  $: totalArtikel = allRows.length;

  let sortField = '';
  let sortAsc = true;
  let filters: Record<string, string> = {};

  const fieldLabels: Record<string, string> = {
    id: 'ID',
    created_at: 'Verpackungsdatum',
    lieferscheinnummer: 'Lieferschein-Nr.',
    artikelnummer: 'Artikelnummer',
    artikelbezeichnung: 'Artikelbezeichnung',
    menge: 'Menge',
    serialnummer: 'Serialnummer Elektronik (für C-Extender)',
  };

  const sortableFields = Object.keys(fieldLabels);

  $: filteredGroups = items
    .filter((group) => {
      return group.entries.some((product: any) =>
        Object.entries(filters).every(([key, val]) => {
          if (!val) return true;
          const itemData: Record<string, any> = {
            id: group.id,
            created_at: formatDate(group.created_at),
            lieferscheinnummer: group.lieferscheinnummer || 'N/A',
            artikelnummer: product.artikelnummer,
            artikelbezeichnung: product.artikelbezeichnung,
            menge: product.menge,
            serialnummer: product.serialnummer || null,
          };
          return String(itemData[key] || '').toLowerCase().includes(val.toLowerCase());
        })
      );
    })
    .sort((a, b) => {
      if (!sortField) return 0;
      const aVal = sortField === 'id' ? a[sortField] : 
                   sortField === 'created_at' ? formatDate(a[sortField]) :
                   sortField === 'lieferscheinnummer' ? (a[sortField] || 'N/A') :
                   a.entries[0]?.[sortField] ?? '';
      const bVal = sortField === 'id' ? b[sortField] : 
                   sortField === 'created_at' ? formatDate(b[sortField]) :
                   sortField === 'lieferscheinnummer' ? (b[sortField] || 'N/A') :
                   b.entries[0]?.[sortField] ?? '';
      return sortAsc
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

  $: filteredItems = allRows
    .filter((item) =>
      Object.entries(filters).every(([key, val]) =>
        val ? String(item[key] || '').toLowerCase().includes(val.toLowerCase()) : true
      )
    )
    .sort((a, b) => {
      if (!sortField) return 0;
      const aVal = a[sortField] ?? '';
      const bVal = b[sortField] ?? '';
      return sortAsc
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

  let currentPage = 1;
  const rowsPerPage = 25;

  $: paginatedGroups = filteredGroups.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  function toggleSort(field: string) {
    if (sortField === field) {
      sortAsc = !sortAsc;
    } else {
      sortField = field;
      sortAsc = true;
    }
  }

  function toggleGroup(groupId: number) {
    if (expandedGroups.has(groupId)) {
      expandedGroups.delete(groupId);
    } else {
      expandedGroups.add(groupId);
    }
    expandedGroups = expandedGroups; // Trigger reactivity
  }

  function downloadCSV() {
    const keys = Object.keys(fieldLabels);
    const headers = keys.map(k => fieldLabels[k]).join(',');
    const rows = filteredItems.map(row =>
      keys.map(k => `"${String(row[k] || '').replace(/"/g, '""')}"`).join(',')
    );
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'zubehoer_dashboard.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  onMount(async () => {
    try {
      const res = await fetch('/api/zubehoer');
      const data = await res.json();
      if (data.success) {
        items = data.items;
      } else {
        error = data.error || 'Unbekannter Fehler beim Laden';
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Verbindung fehlgeschlagen';
    } finally {
      loading = false;
    }
  });
</script>

<svelte:head>
	<title>Zubehör Dashboard - Datenbank Übersicht</title>
</svelte:head>

<div class="dashboard-container">
	<div class="dashboard-header">
		<h1 class="dashboard-title">Zubehör Datenbank</h1>
		<div class="header-actions">
			<div class="data-summary">
				<span class="data-count">{totalEtiketten} Etiketten</span>
				<span class="data-count">{totalArtikel} Artikel</span>
			</div>
			<button on:click={downloadCSV} class="export-btn">
				<svg class="export-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
					<polyline points="7,10 12,15 17,10"/>
					<line x1="12" y1="15" x2="12" y2="3"/>
				</svg>
				CSV Export
			</button>
		</div>
	</div>

	{#if loading}
		<div class="loading-container">
			<div class="loading-spinner"></div>
			<p class="loading-text">Lade Datenbank...</p>
		</div>
	{:else if error}
		<div class="error-container">
			<p class="error-message">Fehler beim Laden der Daten: {error}</p>
		</div>
	{:else if items.length === 0}
		<div class="empty-container">
			<p class="empty-message">Keine Zubehör-Etiketten vorhanden.</p>
		</div>
	{:else}
		<div class="table-wrapper">
			<div class="table-container">
				<table class="data-table">
					<thead>
						<tr class="header-row">
							<th class="table-header expand-column">
								<div class="header-content">
									<span class="header-label">Etikett</span>
								</div>
							</th>
							{#each Object.keys(fieldLabels) as key}
								<th class="table-header" class:sortable={sortableFields.includes(key)} on:click={() => toggleSort(key)}>
									<div class="header-content">
										<span class="header-label">{fieldLabels[key]}</span>
										{#if sortField === key}
											<span class="sort-icon">
												{#if sortAsc}
													<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
														<path d="M7 14l5-5 5 5z"/>
													</svg>
												{:else}
													<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
														<path d="M7 10l5 5 5-5z"/>
													</svg>
												{/if}
											</span>
										{/if}
									</div>
								</th>
							{/each}
						</tr>
						<tr class="filter-row">
							<td class="filter-cell"></td>
							{#each Object.keys(fieldLabels) as key}
								<td class="filter-cell">
									<input
										type="text"
										placeholder="Filter..."
										bind:value={filters[key]}
										class="filter-input"
									/>
								</td>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each paginatedGroups as group (group.id)}
							<tr class="group-header-row" on:click={() => toggleGroup(group.id)}>
								<td class="group-toggle-cell">
									<div class="group-toggle">
										<span class="toggle-icon">
											{#if expandedGroups.has(group.id)}
												<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
													<path d="M7 10l5 5 5-5z"/>
												</svg>
											{:else}
												<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
													<path d="M9 6l6 6-6 6z"/>
												</svg>
											{/if}
										</span>
										<span class="etikett-label">Etikett #{group.id}</span>
									</div>
								</td>
								<td class="group-header-cell">{group.id}</td>
								<td class="group-header-cell">{formatDate(group.created_at)}</td>
								<td class="group-header-cell">{group.lieferscheinnummer || 'N/A'}</td>
								<td class="group-header-cell" colspan="3">
									<span class="article-count">{group.entries.length} Artikel</span>
								</td>
							</tr>
							{#if expandedGroups.has(group.id)}
								{#each group.entries as product}
									<tr class="product-row">
										<td class="product-indent-cell">
											<div class="indent-line"></div>
										</td>
										<td class="data-cell">{group.id}</td>
										<td class="data-cell">{formatDate(group.created_at)}</td>
										<td class="data-cell">{group.lieferscheinnummer || 'N/A'}</td>
										<td class="data-cell">{product.artikelnummer}</td>
										<td class="data-cell">{product.artikelbezeichnung}</td>
										<td class="data-cell">{product.menge}</td>
										<td class="data-cell">{product.serialnummer || ''}</td>
									</tr>
								{/each}
							{/if}
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<div class="pagination-container">
			<div class="pagination-info">
				<span class="pagination-text">
					Seite {currentPage} von {Math.ceil(filteredGroups.length / rowsPerPage)}
				</span>
				<span class="pagination-count">
					{Math.min((currentPage - 1) * rowsPerPage + 1, filteredGroups.length)} - {Math.min(currentPage * rowsPerPage, filteredGroups.length)} von {filteredGroups.length}
				</span>
			</div>
			<div class="pagination-controls">
				<button 
					class="pagination-btn" 
					class:disabled={currentPage === 1}
					on:click={() => currentPage--} 
					disabled={currentPage === 1}
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<polyline points="15,18 9,12 15,6"></polyline>
					</svg>
					Zurück
				</button>
				<button 
					class="pagination-btn" 
					class:disabled={currentPage * rowsPerPage >= filteredGroups.length}
					on:click={() => currentPage++} 
					disabled={currentPage * rowsPerPage >= filteredGroups.length}
				>
					Weiter
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<polyline points="9,18 15,12 9,6"></polyline>
					</svg>
				</button>
			</div>
		</div>
	{/if}
</div>

<style>
	/* Dashboard Layout */
	.dashboard-container {
		padding: var(--spacing-lg);
		max-width: 1400px;
		margin: 0 auto;
		min-height: calc(100vh - 180px);
		background: var(--bg-light);
	}

	.dashboard-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-lg);
		padding: var(--spacing-lg);
		background: var(--white);
		border-radius: var(--border-radius-md);
		box-shadow: var(--shadow-md);
		border: 1px solid var(--border-light);
	}

	.dashboard-title {
		font-size: var(--font-size-2xl);
		font-weight: var(--font-weight-bold);
		color: var(--text-primary);
		margin: 0;
	}

	.header-actions {
		display: flex;
		gap: var(--spacing-md);
		align-items: center;
	}

	.data-summary {
		display: flex;
		gap: var(--spacing-md);
		align-items: center;
	}

	.data-count {
		padding: var(--spacing-sm) var(--spacing-md);
		background: var(--info-color);
		color: var(--white);
		border-radius: var(--border-radius-md);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		box-shadow: var(--shadow-sm);
	}

	.export-btn {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-sm) var(--spacing-md);
		background: var(--success-color);
		color: var(--white);
		border: none;
		border-radius: var(--border-radius-md);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		cursor: pointer;
		transition: background-color var(--transition-smooth);
	}

	.export-btn:hover {
		background: var(--success-hover);
	}

	.export-icon {
		flex-shrink: 0;
	}

	/* Loading, Error and Empty States */
	.loading-container, .error-container, .empty-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--spacing-2xl);
		text-align: center;
		background: var(--white);
		border-radius: var(--border-radius-md);
		box-shadow: var(--shadow-md);
		border: 1px solid var(--border-light);
	}

	.loading-spinner {
		width: 40px;
		height: 40px;
		border: 4px solid var(--bg-light);
		border-top: 4px solid var(--info-color);
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: var(--spacing-md);
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.loading-text, .error-message, .empty-message {
		font-size: var(--font-size-lg);
		color: var(--text-muted);
		margin: 0;
	}

	/* Table Styles */
	.table-wrapper {
		background: var(--white);
		border-radius: var(--border-radius-md);
		box-shadow: var(--shadow-lg);
		border: 1px solid var(--border-light);
		overflow: hidden;
		margin-bottom: var(--spacing-lg);
	}

	.table-container {
		overflow-x: auto;
	}

	.data-table {
		width: 100%;
		border-collapse: collapse;
		font-size: var(--font-size-sm);
	}

	.header-row {
		background: var(--bg-light);
		border-bottom: 2px solid var(--border-medium);
	}

	.filter-row {
		background: var(--bg-muted);
		border-bottom: 1px solid var(--border-light);
	}

	.table-header {
		padding: var(--spacing-md) var(--spacing-lg);
		text-align: left;
		border-right: 1px solid var(--border-light);
		font-weight: var(--font-weight-semibold);
		color: var(--text-secondary);
	}

	.table-header:last-child {
		border-right: none;
	}

	.table-header.sortable {
		cursor: pointer;
		transition: background-color var(--transition-smooth);
	}

	.table-header.sortable:hover {
		background: var(--bg-hover);
	}

	.expand-column {
		width: 140px;
		min-width: 140px;
	}

	.header-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--spacing-sm);
	}

	.header-label {
		font-size: var(--font-size-sm);
	}

	.sort-icon {
		color: var(--info-color);
		display: flex;
		align-items: center;
	}

	.filter-cell {
		padding: var(--spacing-sm) var(--spacing-lg);
		border-right: 1px solid var(--border-light);
	}

	.filter-cell:last-child {
		border-right: none;
	}

	.filter-input {
		width: 100%;
		padding: var(--spacing-sm);
		border: 1px solid var(--border-medium);
		border-radius: var(--border-radius-sm);
		font-size: var(--font-size-xs);
		background: var(--white);
		transition: border-color var(--transition-smooth);
	}

	.filter-input:focus {
		outline: none;
		border-color: var(--info-color);
		box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
	}

	/* Group Header Styles */
	.group-header-row {
		background: var(--primary-light);
		border-bottom: 1px solid var(--border-medium);
		cursor: pointer;
		transition: all var(--transition-smooth);
	}

	.group-header-row:hover {
		background: var(--bg-hover);
		transform: translateY(-1px);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.group-toggle-cell {
		padding: var(--spacing-md) var(--spacing-lg);
		border-right: 1px solid var(--border-light);
	}

	.group-header-cell {
		padding: var(--spacing-md) var(--spacing-lg);
		font-weight: var(--font-weight-semibold);
		color: var(--text-primary);
		border-right: 1px solid var(--border-light);
	}

	.group-header-cell:last-child {
		border-right: none;
	}

	.group-toggle {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
	}

	.toggle-icon {
		color: var(--primary-color);
		display: flex;
		align-items: center;
		transition: transform var(--transition-smooth);
	}

	.etikett-label {
		font-weight: var(--font-weight-semibold);
		color: var(--text-primary);
	}

	.article-count {
		padding: var(--spacing-xs) var(--spacing-sm);
		background: var(--info-color);
		color: var(--white);
		border-radius: var(--border-radius-sm);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-medium);
	}

	/* Product Row Styles */
	.product-row {
		background: var(--bg-card);
		border-bottom: 1px solid var(--border-light);
		transition: all var(--transition-smooth);
	}

	.product-row:hover {
		background: var(--bg-hover);
		transform: translateY(-1px);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
	}

	.product-indent-cell {
		padding: var(--spacing-sm) var(--spacing-lg);
		border-right: 1px solid var(--border-light);
		position: relative;
		width: 140px;
		min-width: 140px;
	}

	.indent-line {
		position: absolute;
		left: var(--spacing-xl);
		top: 0;
		bottom: 0;
		width: 3px;
		background: var(--info-color);
		border-radius: var(--border-radius-full);
	}

	.data-cell {
		padding: var(--spacing-sm) var(--spacing-lg);
		border-right: 1px solid var(--border-light);
		color: var(--text-secondary);
	}

	.data-cell:last-child {
		border-right: none;
	}

	/* Pagination Styles */
	.pagination-container {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--spacing-lg);
		background: var(--white);
		border-radius: var(--border-radius-md);
		box-shadow: var(--shadow-sm);
		border: 1px solid var(--border-light);
	}

	.pagination-info {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}

	.pagination-text {
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		color: var(--text-primary);
	}

	.pagination-count {
		font-size: var(--font-size-xs);
		color: var(--text-muted);
	}

	.pagination-controls {
		display: flex;
		gap: var(--spacing-sm);
	}

	.pagination-btn {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-sm) var(--spacing-md);
		background: var(--white);
		color: var(--text-secondary);
		border: 1px solid var(--border-medium);
		border-radius: var(--border-radius-md);
		font-size: var(--font-size-sm);
		cursor: pointer;
		transition: all var(--transition-smooth);
	}

	.pagination-btn:hover:not(.disabled) {
		background: var(--info-color);
		color: var(--white);
		border-color: var(--info-color);
		transform: translateY(-1px);
		box-shadow: var(--shadow-sm);
	}

	.pagination-btn.disabled {
		opacity: 0.5;
		cursor: not-allowed;
		background: var(--bg-light);
		color: var(--text-muted);
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.dashboard-container {
			padding: var(--spacing-md);
		}

		.dashboard-header {
			flex-direction: column;
			gap: var(--spacing-md);
			align-items: stretch;
		}

		.header-actions {
			justify-content: space-between;
		}

		.data-summary {
			flex: 1;
			justify-content: flex-start;
		}

		.dashboard-title {
			font-size: var(--font-size-xl);
			text-align: center;
		}

		.table-container {
			font-size: var(--font-size-xs);
		}

		.table-header,
		.group-header-cell,
		.group-toggle-cell,
		.data-cell,
		.product-indent-cell {
			padding: var(--spacing-sm) var(--spacing-md);
		}

		.expand-column,
		.product-indent-cell {
			width: 100px;
			min-width: 100px;
		}

		.pagination-container {
			flex-direction: column;
			gap: var(--spacing-md);
			align-items: stretch;
		}

		.pagination-controls {
			justify-content: center;
		}

		.data-count {
			font-size: var(--font-size-xs);
			padding: var(--spacing-xs) var(--spacing-sm);
		}

		.export-btn {
			padding: var(--spacing-sm) var(--spacing-md);
			font-size: var(--font-size-xs);
		}
	}

	@media (max-width: 480px) {
		.dashboard-title {
			font-size: var(--font-size-lg);
		}

		.table-container {
			font-size: 11px;
		}

		.table-header,
		.group-header-cell,
		.group-toggle-cell,
		.data-cell,
		.product-indent-cell {
			padding: var(--spacing-xs) var(--spacing-sm);
		}

		.expand-column,
		.product-indent-cell {
			width: 80px;
			min-width: 80px;
		}

		.header-actions {
			flex-direction: column;
			gap: var(--spacing-sm);
		}

		.data-summary {
			justify-content: center;
		}
	}
</style>
