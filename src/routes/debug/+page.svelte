<script lang="ts">
  import { onMount } from 'svelte';
  import { authStore, AuthService } from '$lib/stores/auth.js';
  import { canActAsProeferA, canActAsProeferB } from '$lib/client-auth';

  let authState: any = null;
  let debugInfo: any = {};

  onMount(async () => {
    
    // Check auth first
    await AuthService.checkAuth();
    
    authStore.subscribe(state => {
      authState = state;
      
      if (state.user) {
        debugInfo = {
          user: state.user,
          canViewProeferA: canActAsProeferA(state.user.role),
          canViewProeferB: canActAsProeferB(state.user.role),
          isAuthenticated: state.isAuthenticated,
          isLoading: state.isLoading
        };
      } else {
        debugInfo = {
          user: null,
          canViewProeferA: false,
          canViewProeferB: false,
          isAuthenticated: state.isAuthenticated,
          isLoading: state.isLoading
        };
      }
    });

    // Test API call
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      debugInfo.apiResponse = data;
    } catch (error) {
      debugInfo.apiError = (error as Error).message;
    }
  });

  async function handleLogout() {
    try {
      await AuthService.logout();
      window.location.href = '/login';
    } catch (error) {
    }
  }
</script>

<svelte:head>
  <title>Debug Mode</title>
</svelte:head>

<h1>Debug Authentication</h1>

<div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
  <h2>Auth Store State</h2>
  <pre>{JSON.stringify(authState, null, 2)}</pre>
</div>

<div style="background: #e8f4f8; padding: 20px; margin: 20px 0; border-radius: 8px;">
  <h2>Debug Info</h2>
  <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
</div>

<div style="background: #fff3cd; padding: 20px; margin: 20px 0; border-radius: 8px;">
  <h2>Quick Actions</h2>
  <button on:click={() => window.location.href = '/login'}>Go to Login</button>
  <button on:click={() => window.location.href = '/'}>Go to Home</button>
  <button on:click={handleLogout}>Logout</button>
</div>
