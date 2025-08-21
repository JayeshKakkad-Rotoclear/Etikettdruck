<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let value = '';
  export let placeholder = '';
  export let required = false;
  export let disabled = false;
  export let id = '';
  export let name = '';
  export let autocomplete = '';
  export let minlength: number | undefined = undefined;
  export let maxlength: number | undefined = undefined;
  export let className = '';

  let showPassword = false;
  const dispatch = createEventDispatcher();

  function togglePasswordVisibility() {
    showPassword = !showPassword;
  }

  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    value = target.value;
    dispatch('input', { value });
  }

  function handleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    value = target.value;
    dispatch('change', { value });
  }
</script>

<div class="password-input-container">
  <input
    {id}
    {name}
    {placeholder}
    {required}
    {disabled}
    autocomplete={autocomplete as any}
    {minlength}
    {maxlength}
    type={showPassword ? 'text' : 'password'}
    bind:value
    on:input={handleInput}
    on:change={handleChange}
    class="password-input {className}"
  />
  <button
    type="button"
    class="password-toggle"
    on:click={togglePasswordVisibility}
    tabindex="-1"
    aria-label={showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
  >
    {#if showPassword}
      <!-- Eye slash icon (hide password) -->
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
        <line x1="2" y1="2" x2="22" y2="22"/>
      </svg>
    {:else}
      <!-- Eye icon (show password) -->
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    {/if}
  </button>
</div>

<style>
  .password-input-container {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
  }

  .password-input {
    width: 100%;
    padding-right: 3rem; /* Space for the toggle button */
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    padding: 0.5rem 0.75rem;
    font-size: 1rem;
    line-height: 1.5;
    color: #374151;
    background-color: #ffffff;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  }

  .password-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .password-input:disabled {
    background-color: #f9fafb;
    color: #6b7280;
    cursor: not-allowed;
  }

  .password-toggle {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: #6b7280;
    padding: 0.25rem;
    border-radius: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.15s ease-in-out;
  }

  .password-toggle:hover {
    color: #374151;
  }

  .password-toggle:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }

  .password-toggle:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  /* Ensure icons are properly sized */
  .password-toggle svg {
    width: 1.25rem;
    height: 1.25rem;
  }
</style>
