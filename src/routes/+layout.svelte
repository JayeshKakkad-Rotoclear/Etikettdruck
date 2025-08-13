<script>
    import '../app.css';
    import { onMount } from 'svelte';
    import { authStore, AuthService } from '$lib/stores/auth.js';
    import { notificationStore } from '$lib/stores/notifications.js';
    import Header from '$lib/components/header.svelte';
    import Footer from '$lib/components/footer.svelte';

    onMount(async () => {
     
        // Initialize auth store to loading state
        authStore.update(state => ({ ...state, isLoading: true }));
        
        try {
            await AuthService.checkAuth();
        } catch (error) {
            authStore.update(state => ({ 
                ...state, 
                isLoading: false, 
                isAuthenticated: false, 
                user: null 
            }));
        }
    });
</script>

<Header />

<main class="main">
	<slot />
</main>

<Footer />

<style>
	.main {
		padding: 1.25rem;
		min-height: calc(100vh - 100px);
        background-color: lightgrey;
	}
</style>
