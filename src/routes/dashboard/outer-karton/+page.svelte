<script lang="ts">
  import { onMount } from 'svelte';
  import { format } from 'date-fns';
  import { de } from 'date-fns/locale';

  let data: any[] = [];
  let error: string | null = null;
  let loading = true;

  onMount(async () => {
    try {
      const res = await fetch('/api/outerkarton');
      const json = await res.json();
      if (json.success) {
        data = json.items;
      } else {
        error = json.error || 'Fehler beim Laden';
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unbekannter Fehler';
    } finally {
      loading = false;
    }
  });

  function formatDate(dateStr: string): string {
    return format(new Date(dateStr), 'dd.MM.yyyy', { locale: de });
  }
</script>

<svelte:head>
	<title>Outer Karton Dashboard - Datenbank Übersicht</title>
</svelte:head>

<div class="dashboard-container">
	<div class="dashboard-header">
		<h1 class="dashboard-title">Outer Karton Datenbank</h1>
		<div class="header-actions">
			<div class="data-summary">
				<span class="data-count">{data.length} Einträge</span>
			</div>
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
	{:else if data.length === 0}
		<div class="empty-container">
			<p class="empty-message">Keine Outer Karton Etiketten vorhanden.</p>
		</div>
	{:else}
		<div class="table-wrapper">
			<div class="table-container">
				<table class="data-table">
					<thead>
						<tr class="header-row">
							<th class="table-header">
								<div class="header-content">
									<span class="header-label">ID</span>
								</div>
							</th>
							<th class="table-header">
								<div class="header-content">
									<span class="header-label">Verpackungsdatum</span>
								</div>
							</th>
							<th class="table-header">
								<div class="header-content">
									<span class="header-label">Auftrags Nr.</span>
								</div>
							</th>
							<th class="table-header">
								<div class="header-content">
									<span class="header-label">Artikelbezeichnung</span>
								</div>
							</th>
							<th class="table-header">
								<div class="header-content">
									<span class="header-label">Artikelnummer</span>
								</div>
							</th>
							<th class="table-header">
								<div class="header-content">
									<span class="header-label">Menge</span>
								</div>
							</th>
						</tr>
					</thead>
					<tbody>
						{#each data as item (item.id)}
							<tr class="group-header-row">
								<td class="group-header-cell">{item.id}</td>
								<td class="group-header-cell">{formatDate(item.createdAt)}</td>
								<td class="group-header-cell">{item.lieferscheinNumber || '-'}</td>
								<td class="group-header-cell" colspan="2">
									<span class="article-count">{item.entries.length} Artikel</span>
								</td>
								<td class="group-header-cell" colspan="2">
									<span class="article-count">{item.entries.length} Artikel</span>
								</td>
							</tr>
							{#each item.entries as entry}
								<tr class="data-row entry-row">
									<td class="data-cell empty-cell"></td>
									<td class="data-cell empty-cell"></td>
									<td class="data-cell empty-cell"></td>
									<td class="data-cell">{entry.artikelbezeichnung}</td>
									<td class="data-cell">{entry.artikelnummer}</td>
									<td class="data-cell">{entry.menge}</td>
								</tr>
							{/each}
						{/each}
					</tbody>
				</table>
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

	.table-header {
		padding: var(--spacing-md) var(--spacing-lg);
		text-align: left;
		border-right: 1px solid var(--border-light);
		position: relative;
	}

	.table-header:last-child {
		border-right: none;
	}

	.header-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--spacing-sm);
	}

	.header-label {
		font-weight: var(--font-weight-semibold);
		color: var(--text-secondary);
		font-size: var(--font-size-sm);
	}

	/* Group Header Row */
	.group-header-row {
		background: var(--primary-light);
		border-bottom: 1px solid var(--border-medium);
	}

	.group-header-cell {
		padding: var(--spacing-md) var(--spacing-lg);
		font-weight: var(--font-weight-semibold);
		color: var(--text-primary);
		border-right: 1px solid var(--border-light);
		background: var(--bg-light);
	}

	.group-header-cell:last-child {
		border-right: none;
	}

	.article-count {
		padding: var(--spacing-xs) var(--spacing-sm);
		background: var(--info-color);
		color: var(--white);
		border-radius: var(--border-radius-sm);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-medium);
	}

	/* Entry Rows */
	.entry-row {
		border-bottom: 1px solid var(--border-light);
		transition: all var(--transition-smooth);
	}

	.entry-row:hover {
		background: var(--bg-hover);
		transform: translateY(-1px);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
	}

	.data-cell {
		padding: var(--spacing-sm) var(--spacing-lg);
		border-right: 1px solid var(--border-light);
		color: var(--text-secondary);
	}

	.data-cell:last-child {
		border-right: none;
	}

	.empty-cell {
		background: var(--bg-card);
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
			justify-content: center;
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
		.data-cell {
			padding: var(--spacing-sm) var(--spacing-md);
		}

		.data-count {
			font-size: var(--font-size-xs);
			padding: var(--spacing-xs) var(--spacing-sm);
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
		.data-cell {
			padding: var(--spacing-xs) var(--spacing-sm);
		}
	}
</style>
