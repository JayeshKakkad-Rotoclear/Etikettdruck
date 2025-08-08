<script lang="ts">
  import { AnzahlOptiken, KonfigurationKK } from '@prisma/client';
	import { onMount } from 'svelte';

	export let items: any[] = [];
	let loading = true;
	let error: string | null = null;

	let sortField = '';
	let sortAsc = true;
	let filters: Record<string, string> = {};

    const enumOptions: Record<string, string[]> = {
        konfiguration: ['RC', 'DMG'],
        anzahl_optiken: ['Ein Optik', 'Zwei Optiken'],
        optik_format: ['F1', 'F2', 'TFT', 'F1+F2', 'F1+TFT', 'F2+TFT']
    };

	const sortableFields = [
		'serialnummer',
		'ba_nummer',
		'artikel_nummer',
		'firmware_version',
		'anzahl_optiken',
		'optik_format',
		'seriennummer_elektronik',
		'seriennummer_optik1',
		'seriennummer_optik2',
		'konfiguration'
	];

    const fieldLabels: Record<string, string> = {
        serialnummer: 'Serialnummer',
        hinweis: 'Hinweis',
        artikel_bezeichnung: 'Artikelbezeichnung',
        ba_nummer: 'BA-Nummer',
        artikel_nummer: 'Artikelnummer',
        firmware_version: 'Firmware-Version',
        seriennummer_elektronik: 'Seriennummer Elektronik',
        seriennummer_optik1: 'Seriennummer Optik 1',
        seriennummer_optik2: 'Seriennummer Optik 2',
        datum: 'Datum',
        produktionsjahr: 'Produktionsjahr',
        pigtail_schrumpfschlauch: 'Pigtail-Kabel mit Schrumpfschlauch angezogen',
        pigtail_drehmoment: 'Pigtail-Kabel mit Drehmoment angezogen',
        konfiguration: 'Konfiguration',
        automatiktest_ok: 'Automatiktest OK',
        qr_code_automatiktest: 'QR-Code Automatiktest',
        pruefer_a: 'Prüfer A',
        pruefer_b: 'Prüfer B',
        chargenummer: 'Chargenummer Lagereinheit',
        hardware_ok: 'Hardware vollständig und unbeschädigt',
        optikglas_ok: 'Optikglas Staub- und Fettfrei',
        rotor_ok: 'Rotor dreht frei(von Hand)',
        klebung_rotor_ok: 'Klebung Rotor i.O.',
        kleber_2k_ok: '2K-Kleber Lichtmodul i.O.',
        dichtring_datenkabel_eingelegt: 'Dichtring (grün) für Datenkabel eingelegt',
        druckluftanscluss_montiert: 'Fest Druckluftanschluss montiert',
        uberdrucktest_ok: 'Überdrucktest durchgeführt',
        lichtmodul_ok: '10x Lichtmodul auf Funktion überprüft',
        motor_ok: '10x Motor auf Funktion überprüft',
        motor_dauerhaft_drehbar: 'Motor im dauerhaft überprüft',
        laufzeit_motor: 'Laufzeit des Motors eintragen',
        drucksensor_ok: 'Drucksensor funktioniert',
        lagesensor_ok: 'Lagesensor funktioniert',
        zustandsdaten_ok: 'Zustandsdaten i.O.',
        zustandsdaten_fehler: 'Fehlende Zustandsdaten',
        anzahl_optiken: 'Anzahl Optiken',
        optik_format: 'Optik Format',
        fokuslage_ok: 'Fokuslage korrekt eingestellt',
        optik_wechseln_funktioniert: 'Optik wechseln funktioniert',
        siegellack_aufgebracht: 'Siegellack auf Gehäuseschrauben aufgebracht',
        id: 'ID'
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
		link.setAttribute('download', 'kk_dashboard.csv');
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
    }

	onMount(async () => {
		try {
			const res = await fetch('/api/kk');
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

<h1 class="text-2xl font-bold p-4">Kamerakopf Datenbank Übersicht</h1>

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
