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

<h1 class="text-2xl font-bold p-4">Outer Karton Datenbank</h1>

{#if loading}
  <p class="p-4">Lade Daten...</p>
{:else if error}
  <p class="text-red-600 p-4">Fehler: {error}</p>
{:else if data.length === 0}
  <p class="p-4">Keine Outer Karton Etiketten vorhanden.</p>
{:else}
  <div class="table-container p-4">
    <table class="min-w-full border">
      <thead>
        <tr>
          <th class="border px-2 py-1">ID</th>
          <th class="border px-2 py-1">Verpackungsdatum</th>
          <th class="border px-2 py-1">Artikelnummer</th>
          <th class="border px-2 py-1">Menge</th>
        </tr>
      </thead>
      <tbody>
        {#each data as item (item.id)}
          <tr class="bg-gray-100 font-semibold">
            <td class="border px-2 py-1">{item.id}</td>
            <td class="border px-2 py-1">{formatDate(item.created_at)}</td>
            <td class="border px-2 py-1" colspan="2">{item.entries.length} Artikel</td>
          </tr>
          {#each item.entries as entry}
            <tr>
              <td class="border px-2 py-1"></td>
              <td class="border px-2 py-1"></td>
              <td class="border px-2 py-1">{entry.artikelnummer}</td>
              <td class="border px-2 py-1">{entry.menge}</td>
            </tr>
          {/each}
        {/each}
      </tbody>
    </table>
  </div>
{/if}

<style>
.table-container {
  overflow-x: auto;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: white;
}
table {
  border-collapse: collapse;
}
th, td {
  text-align: left;
  vertical-align: top;
}
</style>
