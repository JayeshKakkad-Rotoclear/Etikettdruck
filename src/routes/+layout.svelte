<script>
    import { onMount } from 'svelte';
    import { authStore, AuthService } from '$lib/stores/auth.js';
    import Header from '$lib/components/header.svelte';
    import Footer from '$lib/components/footer.svelte';

    onMount(async () => {
        console.log('Layout - Checking auth on mount');
        
        // Initialize auth store to loading state
        authStore.update(state => ({ ...state, isLoading: true }));
        
        try {
            // Check if user is already authenticated using the AuthService
            await AuthService.checkAuth();
            console.log('Layout - Auth check completed');
        } catch (error) {
            console.error('Layout - Auth check failed:', error);
            authStore.update(state => ({ 
                ...state, 
                isLoading: false, 
                isAuthenticated: false, 
                user: null 
            }));
        }
        
        // Subscribe to auth changes for debugging
        authStore.subscribe(state => {
            console.log('Layout - Auth state:', { 
                isAuthenticated: state.isAuthenticated, 
                isLoading: state.isLoading,
                hasUser: !!state.user,
                userRole: state.user?.role 
            });
        });
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
