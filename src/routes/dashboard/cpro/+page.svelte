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

<h1 class="text-2xl font-bold p-4">C Pro Steuerrechner Datenbank Übersicht</h1>

<button on:click={downloadCSV} class="ml-4 mt-2 mb-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
	CSV Export
</button>

{#if loading}
	<p class="p-4">Lade Daten...</p>
{:else if error}
	<p class="text-red-500 p-4">Fehler: {error}</p>
{:else}
	<div class="table-container">
		<table>
			<thead>
				<tr>
					{#each allKeys as key}
						<th on:click={() => sortableFields.includes(key) && toggleSort(key)} class:clickable={sortableFields.includes(key)}>
							{fieldLabels[key] ?? key}
							{#if sortField === key}
								<span>{sortAsc ? ' ▲' : ' ▼'}</span>
							{/if}
						</th>
					{/each}
				</tr>
				<tr>
					{#each allKeys as key}
						<td>
							{#if enumOptions[key]}
								<select bind:value={filters[key]} class="filter-input">
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
					<tr>
						{#each allKeys as key}
							<td>{item[key]}</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<div class="pagination-controls p-4">
		<button on:click={() => currentPage--} disabled={currentPage === 1}>Zurück</button>
		<span class="mx-2">Seite {currentPage} von {Math.ceil(filteredItems.length / rowsPerPage)}</span>
		<button on:click={() => currentPage++} disabled={currentPage * rowsPerPage >= filteredItems.length}>Weiter</button>
	</div>
{/if}

<style>
.table-container {
  overflow-x: auto;
  margin: 1rem 0;
  border: 1px solid #ccc;
  border-radius: 6px;
  max-width: 100%;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

th, td {
  padding: 0.6rem 0.8rem;
  border: 1px solid #ddd;
  text-align: left;
  vertical-align: top;
}

th.clickable {
  cursor: pointer;
  background-color: #f0f8ff;
}

th {
  background-color: #f4f4f4;
  position: sticky;
  top: 0;
  z-index: 1;
  font-weight: 600;
}

.filter-input {
  width: 100%;
  padding: 0.2rem;
  font-size: 0.8rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

tbody tr:nth-child(odd) {
  background-color: #fafafa;
}

tbody tr:hover {
  background-color: #f1f7ff;
}

td {
  white-space: nowrap;
  max-width: 350px;
  overflow: hidden;
  text-overflow: ellipsis;
  position: relative;
  cursor: pointer;
  transition: max-width 0.3s ease;
}

.pagination-controls {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.5rem;
}
</style>
