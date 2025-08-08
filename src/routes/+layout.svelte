<script>
    import Header from '$lib/components/header.svelte';
    import Footer from '$lib/components/footer.svelte';
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
