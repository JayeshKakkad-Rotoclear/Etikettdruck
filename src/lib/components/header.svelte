<script lang="ts">
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';

	let showSidebar = false;
	let hoveredProduct = '';
	let isMobile = false;

	function handleClickOutside(event: MouseEvent) {
		const sidebar = document.getElementById('sidebar');
		const burger = document.getElementById('burger');
		if (
			showSidebar &&
			!sidebar?.contains(event.target as Node) &&
			!burger?.contains(event.target as Node)
		) {
			showSidebar = false;
			hoveredProduct = '';
		}
	}

	onMount(() => {
		isMobile = window.matchMedia('(pointer: coarse)').matches;

		document.addEventListener('click', handleClickOutside);
		return () => document.removeEventListener('click', handleClickOutside);
	});
</script>

<header>
	<!-- add icon etikettendruck\src\assets\Logo.svg-->
	<img src="/Logo.svg" alt="Rotoclear Logo" class="logo" />
	<h1>Etikettendruck System</h1>
	<button
		id="burger"
		class="burger"
		aria-label="Toggle sidebar"
		on:click={() => (showSidebar = !showSidebar)}
	>
		<svg width="26" height="26" viewBox="0 0 100 80" aria-hidden="true">
			<rect width="100" height="12"></rect>
			<rect y="30" width="100" height="12"></rect>
			<rect y="60" width="100" height="12"></rect>
		</svg>
	</button>

	{#if showSidebar}
		<nav id="sidebar" class="sidebar">
			<!-- Home -->
			<div
				class="sidebar-item"
				role="button"
				tabindex="0"
				on:mouseenter={() => !isMobile && (hoveredProduct = 'home')}
				on:mouseleave={() => !isMobile && (hoveredProduct = '')}
				on:click={() => isMobile && (hoveredProduct = hoveredProduct === 'home' ? '' : 'home')}
				on:keydown={(e) => e.key === 'Enter' && isMobile && (hoveredProduct = hoveredProduct === 'home' ? '' : 'home')}
			>
				<a href="/">Home</a>
			</div>

			<!-- C Pro -->
			<div
				class="sidebar-item"
				role="button"
				tabindex="0"
				on:mouseenter={() => !isMobile && (hoveredProduct = 'cpro')}
				on:mouseleave={() => !isMobile && (hoveredProduct = '')}
				on:click={() => isMobile && (hoveredProduct = hoveredProduct === 'cpro' ? '' : 'cpro')}
				on:keydown={(e) => e.key === 'Enter' && isMobile && (hoveredProduct = hoveredProduct === 'cpro' ? '' : 'cpro')}
			>
				<span>C Pro</span>
				{#if hoveredProduct === 'cpro'}
					<div class="submenu" transition:fade>
						<a href="/cpro/pruefer-a">Formular Prüfer A</a>
						<a href="/cpro/pruefer-b">Formular Prüfer B</a>
						<a href="/cpro/qr-preview">QR Vorschau</a>
						<a href="/dashboard/cpro">Datenbank</a>
					</div>
				{/if}
			</div>

			<!-- C2 -->
			<div
				class="sidebar-item"
				role="button"
				tabindex="0"
				on:mouseenter={() => !isMobile && (hoveredProduct = 'c2')}
				on:mouseleave={() => !isMobile && (hoveredProduct = '')}
				on:click={() => isMobile && (hoveredProduct = hoveredProduct === 'c2' ? '' : 'c2')}
				on:keydown={(e) => e.key === 'Enter' && isMobile && (hoveredProduct = hoveredProduct === 'c2' ? '' : 'c2')}
			>
				<span>C2</span>
				{#if hoveredProduct === 'c2'}
					<div class="submenu" transition:fade>
						<a href="/c2/pruefer-a">Formular Prüfer A</a>
						<a href="/c2/pruefer-b">Formular Prüfer B</a>
						<a href="/c2/qr-preview">QR Vorschau</a>
						<a href="/dashboard/c2">Datenbank</a>
					</div>
				{/if}
			</div>

			<!-- C Basic -->
			<div
				class="sidebar-item"
				role="button"
				tabindex="0"
				on:mouseenter={() => !isMobile && (hoveredProduct = 'cbasic')}
				on:mouseleave={() => !isMobile && (hoveredProduct = '')}
				on:click={() => isMobile && (hoveredProduct = hoveredProduct === 'cbasic' ? '' : 'cbasic')}
				on:keydown={(e) => e.key === 'Enter' && isMobile && (hoveredProduct = hoveredProduct === 'cbasic' ? '' : 'cbasic')}
			>
				<span>C Basic</span>
				{#if hoveredProduct === 'cbasic'}
					<div class="submenu" transition:fade>
						<a href="/cbasic/pruefer-a">Formular Prüfer A</a>
						<a href="/cbasic/pruefer-b">Formular Prüfer B</a>
						<a href="/dashboard/cbasic">Datenbank</a>
					</div>
				{/if}
			</div>

			<!-- KK -->
			<div
				class="sidebar-item"
				role="button"
				tabindex="0"
				on:mouseenter={() => !isMobile && (hoveredProduct = 'kk')}
				on:mouseleave={() => !isMobile && (hoveredProduct = '')}
				on:click={() => isMobile && (hoveredProduct = hoveredProduct === 'kk' ? '' : 'kk')}
				on:keydown={(e) => e.key === 'Enter' && isMobile && (hoveredProduct = hoveredProduct === 'kk' ? '' : 'kk')}
			>
				<span>KK</span>
				{#if hoveredProduct === 'kk'}
					<div class="submenu" transition:fade>
						<a href="/kk/pruefer-a">Formular Prüfer A</a>
						<a href="/kk/pruefer-b">Formular Prüfer B</a>
						<a href="/kk/qr-preview">QR Vorschau</a>
						<a href="/dashboard/kk">Datenbank</a>
					</div>
				{/if}
			</div>
			<!-- Zubehör -->
			<div
				class="sidebar-item"
				role="button"
				tabindex="0"
				on:mouseenter={() => !isMobile && (hoveredProduct = 'zubehoer')}
				on:mouseleave={() => !isMobile && (hoveredProduct = '')}
				on:click={() => isMobile && (hoveredProduct = hoveredProduct === 'zubehoer' ? '' : 'zubehoer')}
				on:keydown={(e) => e.key === 'Enter' && isMobile && (hoveredProduct = hoveredProduct === 'zubehoer' ? '' : 'zubehoer')}
			>
				<span>Zubehör</span>
				{#if hoveredProduct === 'zubehoer'}
					<div class="submenu" transition:fade>
						<a href="/zubehoer">Formular</a>
						<a href="/dashboard/zubehoer">Datenbank</a>
					</div>
				{/if}
			</div>
			<!-- Outer Karton -->
			<div
				class="sidebar-item"
				role="button"
				tabindex="0"
				on:mouseenter={() => !isMobile && (hoveredProduct = 'outerkarton')}
				on:mouseleave={() => !isMobile && (hoveredProduct = '')}
				on:click={() => isMobile && (hoveredProduct = hoveredProduct === 'outerkarton' ? '' : 'outerkarton')}
				on:keydown={(e) => e.key === 'Enter' && isMobile && (hoveredProduct = hoveredProduct === 'outerkarton' ? '' : 'outerkarton')}
			>
				<span>Outer Karton</span>
				{#if hoveredProduct === 'outerkarton'}
					<div class="submenu" transition:fade>
						<a href="/outer-karton">Formular</a>
						<a href="/dashboard/outer-karton">Datenbank</a>
					</div>
				{/if}
			</div>
		</nav>
	{/if}
</header>

<style>
	header {
		display: flex;
		align-items: center;
		padding: 2rem;
		background-color: #123345;
		color: white;
		position: sticky;
		top: 0;
		z-index: 1000;
		margin: 0;
	}

	.logo {
		height: 26px;
		width: auto;
		margin: 0;
		position: absolute;
		left: 1rem;
	}

	h1 {
		text-align: center;
		margin: 0;
		font-size: 1.2rem;
		pointer-events: none;
		width: 100%;
		position: absolute;
		left: 0;
		right: 0;
	}

	.burger {
		background: none;
		border: none;
		cursor: pointer;
		position: absolute;
		right: 1rem;
		z-index: 1001;
	}

	.burger svg {
		fill: white;
	}

	.sidebar {
		position: absolute;
		top: 65px;
		right: 0;
		background: #f3f3f3;
		width: 200px;
		border: 1px solid #ccc;
		padding: 0;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
		display: flex;
		flex-direction: column;
		color: #000;
	}

	.sidebar-item {
		position: relative;
		padding: 0.5rem 1rem;
		cursor: pointer;
	}

	.sidebar-item:hover {
		background-color: #e0e0e0;
	}

	.submenu {
		position: absolute;
		top: 0px;
		right: 200px;
		background-color: #fff;
		border: 1px solid #ccc;
		box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
		padding: 0;
		display: flex;
		flex-direction: column;
		min-width: 180px;
	}

	.submenu a {
		color: #333;
		text-decoration: none;
		padding: 0.3rem 0.5rem;
	}

	.submenu a:hover {
		background-color: #f0f0f0;
	}

	@media (max-width: 768px) {
		.logo {
			height: 22px;
			left: 0.75rem;
		}

		h1 {
			display: none;
		}

		.burger {
			right: 0.75rem;
		}
	}
</style>
