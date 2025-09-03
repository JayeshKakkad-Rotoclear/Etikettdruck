<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let label: string;
  export let name: string = '';
  export let value: string | null = null;
  export let options: { label: string; value: string }[] = [];
  export let required: boolean = false;

  const dispatch = createEventDispatcher();

  function select(option: string) {
    value = option;
    dispatch('input', option);
  }
</script>

<div class="radio-group" role="radiogroup" aria-labelledby="group-label-id">
  <div id="group-label-id" class="group-label">
    {label}
    {#if required}<span class="required">*</span>{/if}
  </div>
  <div class="options">
    {#each options as option}
      <label class="radio-option">
        <input
          type="radio"
          name={name || label}
          value={option.value}
          checked={option.value === value}
          on:change={() => select(option.value)}
          {required}
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
        gap: var(--spacing-sm);
        margin-bottom: var(--spacing-lg);
    }

    .group-label {
        display: block;
        font-weight: var(--font-weight-semibold);
        color: var(--text-secondary);
        font-size: var(--font-size-base);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 0.3rem;
    }

    .options {
        display: flex;
        gap: var(--spacing-sm);
        flex-wrap: wrap;
    }

    .radio-option {
        display: flex;
        align-items: center;
        background: var(--white);
        border: 1px solid var(--border-medium);
        gap: var(--spacing-xs);
        border-radius: var(--border-radius-sm);
        padding: var(--spacing-xs) var(--spacing-md);
        cursor: pointer;
        transition: all var(--transition-smooth);
        min-height: 36px;
        font-size: var(--font-size-sm);
        position: relative;
        overflow: hidden;
    }

    .radio-option:hover {
        background: var(--bg-light);
        border-color: var(--primary-color);
        transform: translateY(-1px);
        box-shadow: var(--shadow-sm);
    }

    .radio-option:has(input:checked) {
        background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
        color: var(--white);
        border-color: var(--primary-color);
        font-weight: var(--font-weight-semibold);
    }

    input[type="radio"] {
        accent-color: var(--primary-color);
        margin-right: var(--spacing-xs);
        transform: scale(1.1);
    }

    .radio-option:has(input:checked) input[type="radio"] {
        accent-color: var(--white);
    }

    .required {
        color: #e53e3e;
        font-weight: var(--font-weight-bold);
        margin-left: 2px;
    }
</style>
