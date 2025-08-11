<script lang="ts">
	import { onMount } from 'svelte';

	export let items: any[] = [];
	let loading = true;
	let error: string | null = null;

	let sortField = '';
	let sortAsc = true;
	let filters: Record<string, string> = {};

	const enumOptions: Record<string, string[]> = {
		konfiguration: ['RC', 'DMG', 'DEMO', 'EDU'],
		festplattengroesse: ['GB_256', 'TB_1', 'TB_4']
	};

	const sortableFields = [
		'serialnummer',
		'ba_nummer',
		'artikel_nummer',
		'software_version',
		'konfiguration',
		'seriennummer_elektronik',
		'mac_adresse',
		'seriennummer_festplatte',
		'festplattengroesse'
	];

	const fieldLabels: Record<string, string> = {
		serialnummer: 'Serialnummer',
		artikel_bezeichnung: 'Artikelbezeichnung',
		ba_nummer: 'BA-Nummer',
		artikel_nummer: 'Artikelnummer',
		software_version: 'Software-Version',
		konfiguration: 'Konfiguration',
		seriennummer_elektronik: 'Seriennummer Elektronik',
		mac_adresse: 'MAC-Adresse',
		seriennummer_festplatte: 'Seriennummer Festplatte',
		festplattengroesse: 'Festplattengröße',
		datum: 'Datum',
		produktionsjahr: 'Produktionsjahr',
		pruefer_a: 'Prüfer A',
		pruefer_b: 'Prüfer B',
		hardware_ok: 'Hardware OK',
		hdmi_ok: 'HDMI OK',
		web_ok: 'Web OK',
		zoom_ok: 'Zoom OK',
		menue_bedienbar: 'Menü bedienbar',
		festplatte_angezeigt: 'Festplatte angezeigt',
		freier_festplattenspeicher: 'Freier Festplattenspeicher',
		ip_adresse: 'IP-Adresse',
		kameraeingang_ok: 'Beide Kameraeingänge OK',
		zustandsdaten_ok: 'Zustandsdaten OK',
		zustandsdaten_fehler: 'Fehlende Zustandsdaten',
		automatiktest_ok: 'Automatiktest OK',
		qr_code_automatiktest: 'QR-Code Automatiktest',
		werkseinstellung: 'Werkseinstellung',
		lp_verschraubt: 'Leiterplattenstecker verschraubt',
		festplatte_leer: 'Festplatte leer',
		id: 'ID',
		hinweis: 'Hinweis'
	};

	$: allKeys = items.length > 0 ? Object.keys(items[0]) : [];

	let currentPage = 1;
	const rowsPerPage = 25;

	let filteredItems: any[] = [];

	$: filteredItems = items
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

	$: paginatedItems = filteredItems.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

	function toggleSort(field: string) {
		if (sortField === field) {
			sortAsc = !sortAsc;
		} else {
			sortField = field;
			sortAsc = true;
		}
	}

	function downloadCSV() {
		const exportKeys = allKeys.filter((k) => k !== 'qr_code_automatiktest');
		const headers = exportKeys.join(',');
		const rows = filteredItems.map(row =>
			exportKeys.map(k => `"${String(row[k] || '').replace(/"/g, '""')}"`).join(',')
		);
		const csvContent = [headers, ...rows].join('\n');
		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.setAttribute('download', 'cpro_dashboard.csv');
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}

	onMount(async () => {
		try {
			const res = await fetch('/api/cpro');
			const data = await res.json();
			if (data.success) {
				items = data.items;
			} else {
				error = data.error || 'Unknown error loading items';
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to fetch data';
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>C Pro Dashboard - Datenbank Übersicht</title>
</svelte:head>

<div class="dashboard-container">
	<div class="dashboard-header">
		<h1 class="dashboard-title">C Pro Steuerrechner Datenbank</h1>
		<div class="header-actions">
			<div class="data-summary">
				<span class="data-count">{filteredItems.length} von {items.length} Einträgen</span>
			</div>
			<button on:click={downloadCSV} class="export-btn" disabled={filteredItems.length === 0}>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
	{:else}
		<div class="table-wrapper">
			<div class="table-container">
				<table class="data-table">
					<thead>
						<tr class="header-row">
							{#each allKeys as key}
								<th 
									class="table-header" 
									class:sortable={sortableFields.includes(key)}
									on:click={() => sortableFields.includes(key) && toggleSort(key)}
								>
									<div class="header-content">
										<span class="header-label">{fieldLabels[key] ?? key}</span>
										{#if sortableFields.includes(key)}
											<div class="sort-indicator">
												{#if sortField === key}
													{#if sortAsc}
														<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
															<path d="m18 15-6-6-6 6"/>
														</svg>
													{:else}
														<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
															<path d="m6 9 6 6 6-6"/>
														</svg>
													{/if}
												{:else}
													<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity="0.4">
														<path d="m7 14 5-5 5 5"/>
														<path d="m7 10 5 5 5-5"/>
													</svg>
												{/if}
											</div>
										{/if}
									</div>
								</th>
							{/each}
						</tr>
						<tr class="filter-row">
							{#each allKeys as key}
								<td class="filter-cell">
									{#if enumOptions[key]}
										<select bind:value={filters[key]} class="filter-select">
											<option value=''>Alle</option>
											{#each enumOptions[key] as opt}
												<option value={opt}>{opt}</option>
											{/each}
										</select>
									{:else if sortableFields.includes(key)}
										<input
											type="text"
											placeholder="Filter..."
											bind:value={filters[key]}
											class="filter-input"
										/>
									{/if}
								</td>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each paginatedItems as item (item.serialnummer)}
							<tr class="data-row">
								{#each allKeys as key}
									<td class="data-cell" title={item[key]}>
										{item[key] || '—'}
									</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<div class="pagination-container">
			<div class="pagination-info">
				<span>Zeige {(currentPage - 1) * rowsPerPage + 1} bis {Math.min(currentPage * rowsPerPage, filteredItems.length)} von {filteredItems.length} Einträgen</span>
			</div>
			<div class="pagination-controls">
				<button 
					class="pagination-btn" 
					on:click={() => currentPage--} 
					disabled={currentPage === 1}
				>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="m15 18-6-6 6-6"/>
					</svg>
					Zurück
				</button>
				<span class="page-indicator">Seite {currentPage} von {Math.ceil(filteredItems.length / rowsPerPage)}</span>
				<button 
					class="pagination-btn" 
					on:click={() => currentPage++} 
					disabled={currentPage * rowsPerPage >= filteredItems.length}
				>
					Weiter
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="m9 18 6-6-6-6"/>
					</svg>
				</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.dashboard-container {
		min-height: 100vh;
		padding: var(--spacing-lg) var(--spacing-md);
	}

	.dashboard-header {
		background: var(--white);
		border-radius: var(--border-radius-lg);
		padding: var(--spacing-xl);
		margin-bottom: var(--spacing-lg);
		box-shadow: var(--shadow-medium);
		border: 1px solid var(--border-light);
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--spacing-md);
		position: relative;
		overflow: hidden;
	}

	.dashboard-header::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 4px;
		background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
	}

	.dashboard-title {
		font-size: var(--font-size-xxl);
		font-weight: var(--font-weight-bold);
		color: var(--text-primary);
		margin: 0;
		background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: var(--spacing-lg);
		flex-wrap: wrap;
	}

	.data-summary {
		background: var(--bg-light);
		padding: var(--spacing-sm) var(--spacing-md);
		border-radius: var(--border-radius-md);
		border: 1px solid var(--border-light);
	}

	.data-count {
		font-size: var(--font-size-sm);
		color: var(--text-secondary);
		font-weight: var(--font-weight-medium);
	}

	.export-btn {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-md) var(--spacing-lg);
		background: linear-gradient(135deg, var(--success-color), var(--success-hover));
		color: var(--white);
		border: none;
		border-radius: var(--border-radius-md);
		cursor: pointer;
		transition: all var(--transition-smooth);
		font-weight: var(--font-weight-medium);
		font-size: var(--font-size-sm);
		box-shadow: var(--shadow-sm);
		min-height: 40px;
	}

	.export-btn:hover:not(:disabled) {
		background: linear-gradient(135deg, var(--success-hover), var(--success-color));
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
	}

	.export-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}

	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--spacing-2xl);
		background: var(--white);
		border-radius: var(--border-radius-lg);
		box-shadow: var(--shadow-sm);
	}

	.loading-spinner {
		width: 40px;
		height: 40px;
		border: 4px solid var(--border-light);
		border-top: 4px solid var(--primary-color);
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: var(--spacing-md);
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.loading-text {
		color: var(--text-secondary);
		font-size: var(--font-size-lg);
		margin: 0;
	}

	.error-container {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
		padding: var(--spacing-xl);
		background: linear-gradient(135deg, #fef2f2, #fee2e2);
		color: #991b1b;
		border: 2px solid #fecaca;
		border-radius: var(--border-radius-lg);
		margin: var(--spacing-lg) 0;
	}

	.error-message {
		margin: 0;
		font-weight: var(--font-weight-medium);
	}

	.table-wrapper {
		background: var(--white);
		border-radius: var(--border-radius-lg);
		box-shadow: var(--shadow-medium);
		border: 1px solid var(--border-light);
		overflow: hidden;
	}

	.table-container {
		overflow-x: auto;
		max-width: 100%;
	}

	.data-table {
		width: 100%;
		border-collapse: collapse;
		font-size: var(--font-size-sm);
		min-width: 800px;
	}

	.header-row {
		background: linear-gradient(135deg, var(--bg-light), var(--gray-100));
		border-bottom: 2px solid var(--border-medium);
	}

	.table-header {
		padding: var(--spacing-md) var(--spacing-sm);
		text-align: left;
		font-weight: var(--font-weight-semibold);
		color: var(--text-primary);
		border-right: 1px solid var(--border-light);
		position: sticky;
		top: 0;
		z-index: 10;
		background: inherit;
		white-space: nowrap;
		min-width: 120px;
	}

	.table-header.sortable {
		cursor: pointer;
		transition: background-color var(--transition-smooth);
	}

	.table-header.sortable:hover {
		background: linear-gradient(135deg, var(--bg-hover), var(--gray-100));
	}

	.header-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--spacing-xs);
	}

	.header-label {
		flex: 1;
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.sort-indicator {
		display: flex;
		align-items: center;
		opacity: 0.7;
		transition: opacity var(--transition-smooth);
	}

	.table-header.sortable:hover .sort-indicator {
		opacity: 1;
	}

	.filter-row {
		background: var(--bg-card);
		border-bottom: 2px solid var(--border-medium);
	}

	.filter-cell {
		padding: var(--spacing-sm);
		border-right: 1px solid var(--border-light);
	}

	.filter-input,
	.filter-select {
		width: 90%;
		padding: var(--spacing-xs) var(--spacing-sm);
		border: 1px solid var(--border-medium);
		border-radius: var(--border-radius-sm);
		font-size: var(--font-size-xs);
		transition: all var(--transition-smooth);
		background: var(--white);
		/* min-width: 80px; */
	}

	.filter-input:focus,
	.filter-select:focus {
		outline: none;
		border-color: var(--primary-color);
		box-shadow: 0 0 0 2px var(--primary-light);
	}

	.data-row {
		border-bottom: 1px solid var(--border-light);
		transition: background-color var(--transition-smooth);
	}

	.data-row:nth-child(even) {
		background: var(--bg-card);
	}

	.data-row:hover {
		background: linear-gradient(135deg, #f0f8ff, #e6f3ff);
	}

	.data-cell {
		padding: var(--spacing-sm);
		border-right: 1px solid var(--border-light);
		color: var(--text-secondary);
		font-size: var(--font-size-xs);
		max-width: 200px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		vertical-align: middle;
	}

	.data-cell:hover {
		overflow: visible;
		white-space: normal;
		background: var(--bg-light);
		position: relative;
		z-index: 5;
	}

	.pagination-container {
		background: var(--white);
		border-radius: var(--border-radius-lg);
		padding: var(--spacing-lg);
		margin-top: var(--spacing-lg);
		box-shadow: var(--shadow-sm);
		border: 1px solid var(--border-light);
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--spacing-md);
	}

	.pagination-info {
		color: var(--text-secondary);
		font-size: var(--font-size-sm);
	}

	.pagination-controls {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
	}

	.pagination-btn {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		padding: var(--spacing-sm) var(--spacing-md);
		background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
		color: var(--white);
		border: none;
		border-radius: var(--border-radius-md);
		cursor: pointer;
		transition: all var(--transition-smooth);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		min-height: 36px;
	}

	.pagination-btn:hover:not(:disabled) {
		background: linear-gradient(135deg, var(--primary-hover), var(--primary-active));
		transform: translateY(-1px);
		box-shadow: var(--shadow-sm);
	}

	.pagination-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}

	.page-indicator {
		color: var(--text-secondary);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		padding: 0 var(--spacing-sm);
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.dashboard-container {
			padding: var(--spacing-md) var(--spacing-sm);
		}

		.dashboard-header {
			flex-direction: column;
			align-items: stretch;
			padding: var(--spacing-lg);
		}

		.dashboard-title {
			font-size: var(--font-size-xl);
			text-align: center;
		}

		.header-actions {
			justify-content: center;
		}

		.pagination-container {
			flex-direction: column;
			text-align: center;
		}

		.pagination-controls {
			justify-content: center;
		}

		.data-table {
			min-width: 600px;
		}

		.header-label {
			font-size: 0.7rem;
		}

		.data-cell {
			max-width: 150px;
			font-size: 0.7rem;
		}
	}

	@media (max-width: 480px) {
		.dashboard-header {
			padding: var(--spacing-md);
		}

		.dashboard-title {
			font-size: var(--font-size-lg);
		}

		.export-btn {
			width: 100%;
			justify-content: center;
		}

		.data-table {
			min-width: 500px;
		}

		.data-cell {
			max-width: 100px;
		}
	}

	/* Print Styles */
	@media print {
		.dashboard-container {
			background: white;
			padding: 0;
		}

		.dashboard-header,
		.pagination-container {
			display: none;
		}

		.table-wrapper {
			box-shadow: none;
			border: 1px solid #000;
		}

		.data-table {
			min-width: auto;
		}

		.data-cell {
			max-width: none;
			white-space: nowrap;
		}
	}
</style>
