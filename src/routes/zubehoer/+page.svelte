<script lang="ts">
  import { onMount } from 'svelte';

  type Item = {
    id: string;
    artikelnummer: string;
    artikelbezeichnung: string;
    selected: boolean | null;
    menge: number;
  };

  const initialItems = [
    {
      category: 'C-Extender',
      items: [
        { artikelnummer: '10370', artikelbezeichnung: 'Rotoclear C-Extender' },
        { artikelnummer: '10413', artikelbezeichnung: 'Halterung für Rotoclear C-Extender' },
      ],
    },
    {
      category: 'Halterung KK',
      items: [
        { artikelnummer: '10144', artikelbezeichnung: 'Flex-Armhalter (Blecheinbau)' },
        { artikelnummer: '10178', artikelbezeichnung: 'Flex-Armhalter (Vorwandmontage)' },
        { artikelnummer: '10222', artikelbezeichnung: 'Flex-Armhalter (Magnethalter)' },
        { artikelnummer: '10229', artikelbezeichnung: 'Kugelhalterung' },
        { artikelnummer: '10147', artikelbezeichnung: 'Verlängerungsstück für Flex-Armhalterung' },
      ],
    },
    {
      category: 'Datenkabel',
      items: [
        { artikelnummer: '10035', artikelbezeichnung: 'Datenkabel mit 2x M12-Stecker (10m)' },
        { artikelnummer: '10036', artikelbezeichnung: 'Datenkabel mit 2x M12-Stecker (20m)' },
      ],
    },
    {
      category: 'Extras',
      items: [
        { artikelnummer: '10091', artikelbezeichnung: 'Stromkabel (2m)' },
        { artikelnummer: '10038', artikelbezeichnung: 'Sperrluftleitung 5m (6x1mm)' },
        { artikelnummer: '10299', artikelbezeichnung: 'Durchgangsventil für Sperrluftschlauch 6mm' },
      ],
    }
  ];

  let selectedCategories: Record<string, boolean | null> = {};
  let itemSelections: Record<string, { selected: boolean | null; menge: number }> = {};
  let serialnummer = '';

  onMount(() => {
    for (const block of initialItems) {
      selectedCategories[block.category] = null;
      for (const item of block.items) {
        itemSelections[item.artikelnummer] = { selected: null, menge: 1 };
      }
    }
  });

async function submitForm() {
    const selectedItems = Object.entries(itemSelections)
        .filter(([_, v]) => v.selected === true)
        .map(([artikelnummer]) => {
            const item = initialItems.flatMap((c) => c.items).find((i) => i.artikelnummer === artikelnummer);
            const itemData = {
                artikelnummer,
                artikelbezeichnung: item?.artikelbezeichnung ?? '',
                menge: itemSelections[artikelnummer].menge,
            };
            
            if (artikelnummer === '10370' && serialnummer) {
                return { ...itemData, serialnummer };
            }
            
            return itemData;
        });

    const payload: any = {
        items: selectedItems,
    };

    const res = await fetch('/api/zubehoer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!res.ok) {
        const error = await res.json();
        alert('Fehler beim Speichern: ' + error.error);
        return;
    } else {
            alert('Etikett erfolgreich erstellt!');
            serialnummer = '';
            for (const block of initialItems) {
                    selectedCategories[block.category] = null;
                    for (const item of block.items) {
                            itemSelections[item.artikelnummer] = { selected: null, menge: 1 };
                    }
            }
    }

    const result = await res.json();
    if (result.success) {
        const zplBlob = new Blob([result.zpl], { type: 'text/plain' });
        const zplUrl = URL.createObjectURL(zplBlob);
        const a = document.createElement('a');
        a.href = zplUrl;
        a.download = `zubehoer-etikett-${Date.now()}.zpl`;
        a.click();
    } else {
        alert('Fehler beim Senden: ' + result.error);
    }
}
</script>

<form on:submit|preventDefault={submitForm} class="form">
    <h1 class="page-title">Zubehör Etikett erstellen</h1>

    {#each initialItems as categoryBlock}
    <div class="category-container">
        <div class="category-header">
            <span class="category-title">{categoryBlock.category}</span>
            <div class="option-group">
                <label class:active={selectedCategories[categoryBlock.category] === true}>
                    <input
                        type="radio"
                        name={categoryBlock.category}
                        on:change={() => selectedCategories[categoryBlock.category] = true}
                    />
                    Ja
                </label>
                <label class:active={selectedCategories[categoryBlock.category] === false}>
                    <input
                        type="radio"
                        name={categoryBlock.category}
                        on:change={() => selectedCategories[categoryBlock.category] = false}
                    />
                    Nein
                </label>
            </div>
        </div>

        {#if selectedCategories[categoryBlock.category] === true}
            <div class="items-container">
                {#each categoryBlock.items as item}
                    <div class="item-group">
                        <div class="item-row">
                            <span class="item-title">{item.artikelbezeichnung}</span>
                            <div class="option-group">
                                <label class:active={itemSelections[item.artikelnummer].selected === true}>
                                    <input
                                        type="radio"
                                        name={item.artikelnummer}
                                        on:change={() => itemSelections[item.artikelnummer].selected = true}
                                    />
                                    Ja
                                </label>
                                <label class:active={itemSelections[item.artikelnummer].selected === false}>
                                    <input
                                        type="radio"
                                        name={item.artikelnummer}
                                        on:change={() => itemSelections[item.artikelnummer].selected = false}
                                    />
                                    Nein
                                </label>
                            </div>
                        </div>

                        {#if itemSelections[item.artikelnummer].selected === true}
                            <div class="item-row secondary-row">
                                <div class="quantity-control">
                                    <label class="quantity-label">Menge:
                                        <select bind:value={itemSelections[item.artikelnummer].menge} class="quantity-select">
                                            {#each [1, 2, 3, 4, 5] as n}
                                                <option value={n}>{n}</option>
                                            {/each}
                                        </select>
                                    </label>
                                </div>

                                {#if item.artikelnummer === '10370'}
                                    <div class="serial-control">
                                        <label class="serial-label">Serialnummer:
                                            <input type="text" bind:value={serialnummer} placeholder="z.B. 12345" class="serial-input" />
                                        </label>
                                    </div>
                                {/if}
                            </div>
                        {/if}
                    </div>
                {/each}
            </div>
        {/if}
    </div>
    {/each}

    <button type="submit" class="submit-button">
        Speichern & Drucken
    </button>
</form>

<style>
    .form {
        max-width: 800px;
        margin: 70px auto;
        display: flex;
        flex-direction: column;
        gap: 2rem;
        padding: 2rem 3rem;
        border-radius: 8px;
        background: #fff;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
    }

    .page-title {
        font-size: 1.5rem;
        font-weight: bold;
        margin-bottom: 1.5rem;
        text-align: center;
        color: #123345;
    }

    .category-container {
        border: 2px solid #e5e5e5;
        border-radius: 8px;
        padding: 1.5rem;
        background-color: #fafafa;
        margin-bottom: 1rem;
    }

    .category-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1rem;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid #ddd;
    }

    .category-title {
        font-weight: bold;
        font-size: 1.2rem;
        color: #123345;
    }

    .items-container {
        background-color: white;
        border-radius: 6px;
        padding: 1rem;
        border: 1px solid #e0e0e0;
    }

    .item-group {
        margin-bottom: 1rem;
        border-bottom: 1px solid #f0f0f0;
        padding-bottom: 0.75rem;
    }

    .item-group:last-child {
        border-bottom: none;
        margin-bottom: 0;
    }

    .item-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.5rem 0;
        gap: 1rem;
    }

    .secondary-row {
        background-color: #f8f9fa;
        padding: 0.75rem;
        border-radius: 4px;
        margin-top: 0.5rem;
        justify-content: flex-start;
        gap: 2rem;
    }

    .item-title {
        font-weight: 500;
        flex: 1;
        min-width: 200px;
        color: #123345;
    }

    .option-group {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
    }

    .option-group label {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.4rem 0.8rem;
        border-radius: 0.5rem;
        border: 1px solid #ddd;
        background-color: #f9f9ff;
        cursor: pointer;
        transition: background-color 0.2s ease;
        font-size: 0.9rem;
    }

    .option-group label:hover {
        background-color: #e0e0f0;
    }

    .option-group label.active {
        color: #123345;
        font-weight: 500;
    }

    .quantity-control {
        display: flex;
        align-items: center;
    }

    .quantity-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 500;
        font-size: 0.9rem;
    }

    .quantity-select {
        border: 1px solid #ccc;
        padding: 0.3rem;
        border-radius: 0.3rem;
        font-size: 0.9rem;
        background-color: white;
    }

    .serial-control {
        display: flex;
        align-items: center;
    }

    .serial-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 500;
        font-size: 0.9rem;
    }

    .serial-input {
        border: 1px solid #ccc;
        padding: 0.3rem 0.5rem;
        border-radius: 0.3rem;
        font-size: 0.9rem;
        width: 120px;
    }

    .submit-button {
        margin-top: 1.5rem;
        padding: 0.75rem 1.5rem;
        background-color: #123345;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.3s;
        align-self: center;
    }

    .submit-button:hover {
        background-color: #005fa3;
    }

    input[type='radio'] {
        accent-color: #123345;
        margin: 0;
    }

    @media (max-width: 768px) {
        .form {
            padding: 1rem;
            margin: 20px auto;
        }

        .category-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
        }

        .item-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
        }

        .secondary-row {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
        }

        .item-title {
            min-width: unset;
        }
    }
</style>