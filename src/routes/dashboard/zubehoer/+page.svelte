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
                   a.entries[0]?.[sortField] ?? '';
      const bVal = sortField === 'id' ? b[sortField] : 
                   sortField === 'created_at' ? formatDate(b[sortField]) :
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

<h1 class="text-2xl font-bold p-4">Zubehör Etikett Übersicht</h1>

{#if !loading && !error}
  <div class="p-4">
    <p class="text-lg font-medium text-gray-700">
      {totalEtiketten} Zubehör-Etiketten mit insgesamt {totalArtikel} Artikeln gefunden
    </p>
  </div>
{/if}

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
          <th>Etikett</th>
          {#each Object.keys(fieldLabels) as key}
            <th on:click={() => toggleSort(key)} class:clickable={sortableFields.includes(key)}>
              {fieldLabels[key]}
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
            </th>
          {/each}
        </tr>
        <tr>
          <td></td>
          {#each Object.keys(fieldLabels) as key}
            <td>
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
          <tr class="group-header" on:click={() => toggleGroup(group.id)}>
            <td class="group-toggle">
              <span class="toggle-icon">{expandedGroups.has(group.id) ? '▼' : '▶'}</span>
              Etikett #{group.id}
            </td>
            <td>{group.id}</td>
            <td>{formatDate(group.created_at)}</td>
            <td colspan="4" class="group-summary">
              {group.entries.length} Artikel(e)
            </td>
          </tr>
          {#if expandedGroups.has(group.id)}
            {#each group.entries as product}
              <tr class="product-row">
                <td class="indent"></td>
                <td>{group.id}</td>
                <td>{formatDate(group.created_at)}</td>
                <td>{product.artikelnummer}</td>
                <td>{product.artikelbezeichnung}</td>
                <td>{product.menge}</td>
                <td>{product.serialnummer || ''}</td>
              </tr>
            {/each}
          {/if}
        {/each}
      </tbody>
    </table>
  </div>
  <div class="pagination-controls p-4">
    <button on:click={() => currentPage--} disabled={currentPage === 1}>Zurück</button>
    <span class="mx-2">Seite {currentPage} von {Math.ceil(filteredGroups.length / rowsPerPage)}</span>
    <button on:click={() => currentPage++} disabled={currentPage * rowsPerPage >= filteredGroups.length}>Weiter</button>
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

.table-container table {
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

.pagination-controls {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.5rem;
}

.group-header {
  background-color: #e3f2fd !important;
  font-weight: 600;
  cursor: pointer;
}

.group-header:hover {
  background-color: #bbdefb !important;
}

.group-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.toggle-icon {
  color: #1976d2;
  font-weight: bold;
}

.group-summary {
  font-style: italic;
  color: #666;
}

.product-row {
  background-color: #f8f9fa;
}

.product-row:hover {
  background-color: #e9ecef !important;
}

.indent {
  padding-left: 2rem;
  border-left: 3px solid #ddd;
}
</style>
