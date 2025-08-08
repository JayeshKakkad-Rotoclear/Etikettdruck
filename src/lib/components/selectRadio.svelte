<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let label: string;
  export let name: string = '';
  export let value: string | null = null;
  export let options: { label: string; value: string }[] = [];

  const dispatch = createEventDispatcher();

  function select(option: string) {
    value = option;
    dispatch('input', option);
  }
</script>

<div class="radio-group" role="radiogroup" aria-labelledby="group-label-id">
  <div id="group-label-id" class="group-label">{label}</div>
  <div class="options">
    {#each options as option}
      <label class="radio-option">
        <input
          type="radio"
          name={name || label}
          value={option.value}
          checked={option.value === value}
          on:change={() => select(option.value)}
        />
        {option.label}
      </label>
    {/each}
  </div>
</div>

<style>
    .radio-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
    }

    .group-label {
    display: block;
    font-weight: bold;
    margin-bottom: 10px;
    font-size: large;
    }

    .options {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    }

    .radio-option {
    display: flex;
    align-items: center;
    background-color: #f5f6fb;
    border: 1px solid #ddd;
    gap: 0.4rem;
    border-radius: 0.5rem;
    padding: 0.5rem 1rem;
    cursor: pointer;
    transition: background-color 0.2s;
    }

    .radio-option:hover {
    background-color: #e6e8f0;
    }

    input[type="radio"] {
        accent-color: #123345;
        margin-right: 0.5rem;
    }
</style>
