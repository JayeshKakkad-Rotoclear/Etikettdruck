<script lang="ts">
  import { onMount } from 'svelte';
  import { authStore } from '$lib/stores/auth.js';
  import { goto } from '$app/navigation';
  import { canActAsProeferA, canActAsProeferB, canAccessDatabase, type UserRole } from '$lib/client-auth';

  export let requiredRole: 'PRUEFER_A' | 'PRUEFER_B' | 'PRUEFER_AB' | 'MANAGEMENT' | 'ADMIN' | 'ANY_PRUEFER' | 'DATABASE' = 'ANY_PRUEFER';
  export let redirectTo: string = '/';

  let isAuthorized = false;
  let isLoading = true;

  onMount(() => {
    const unsubscribe = authStore.subscribe(state => {
      // Don't redirect if authentication is still loading
      if (state.isLoading) {
        isLoading = true;
        return;
      }

      if (!state.isAuthenticated || !state.user) {
        goto('/login');
        return;
      }

      const userRole: UserRole = state.user.role;
      
      switch (requiredRole) {
        case 'PRUEFER_A':
          isAuthorized = canActAsProeferA(userRole);
          break;
        case 'PRUEFER_B':
          isAuthorized = canActAsProeferB(userRole);
          break;
        case 'PRUEFER_AB':
          isAuthorized = userRole === 'PRUEFER_AB' || userRole === 'MANAGEMENT' || userRole === 'ADMIN';
          break;
        case 'MANAGEMENT':
          isAuthorized = userRole === 'MANAGEMENT' || userRole === 'ADMIN';
          break;
        case 'ADMIN':
          isAuthorized = userRole === 'ADMIN';
          break;
        case 'DATABASE':
          isAuthorized = canAccessDatabase(userRole);
          break;
        case 'ANY_PRUEFER':
          isAuthorized = canActAsProeferA(userRole) || canActAsProeferB(userRole);
          break;
        default:
          isAuthorized = true;
      }

      if (!isAuthorized) {
        goto(redirectTo);
        return;
      }

      isLoading = false;
    });

    return unsubscribe;
  });
</script>

{#if isLoading}
  <div class="loading">Überprüfe Berechtigung...</div>
{:else if isAuthorized}
  <slot />
{/if}

<style>
  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    font-size: 1.1rem;
    color: #666;
  }
</style>
