<script lang="ts">
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { authStore, AuthService } from '$lib/stores/auth.js';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { canActAsProeferA, canActAsProeferB, canAccessDatabase } from '$lib/client-auth';

	let showSidebar = false;
	let hoveredProduct = '';
	let isMobile = false;
	let currentUser: any = null;

	// Role-based access checks
	$: canViewProeferA = currentUser ? canActAsProeferA(currentUser.role) : false;
	$: canViewProeferB = currentUser ? canActAsProeferB(currentUser.role) : false;
	$: canViewDatabase = currentUser ? canAccessDatabase(currentUser.role) : false;
	$: isViewer = currentUser?.role === 'VIEWER';
	$: isAdmin = currentUser?.role === 'ADMIN';
	$: isManagement = currentUser?.role === 'MANAGEMENT';

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

	async function logout() {
		console.log('Header - Logout clicked');
		await AuthService.logout();
		goto('/login');
	}

	onMount(() => {
		isMobile = window.matchMedia('(pointer: coarse)').matches;

		// Subscribe to auth state
		authStore.subscribe(state => {
			currentUser = state.user;
			console.log('Header - Auth state changed:', { 
				user: state.user, 
				isAuthenticated: state.isAuthenticated,
				isLoading: state.isLoading 
			});
			if (state.user) {
				console.log('Header - Role checks:', {
					role: state.user.role,
					canViewProeferA: canActAsProeferA(state.user.role),
					canViewProeferB: canActAsProeferB(state.user.role),
					canViewDatabase: (state.user.role === 'MANAGEMENT' || state.user.role === 'ADMIN')
				});
			}
		});

		document.addEventListener('click', handleClickOutside);
		return () => document.removeEventListener('click', handleClickOutside);
	});
</script>

<header>
	<!-- add icon etikettendruck\src\assets\Logo.svg-->
	<img src="/Logo.svg" alt="Rotoclear Logo" class="logo" />
	<h1>Etikettendruck System</h1>
	{#if $page.url.pathname !== '/login'}
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
	{/if}

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

			<!-- Product Navigation - Only for non-Viewers -->
			{#if !isViewer}
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
							{#if canViewProeferA}
								<a href="/cpro/pruefer-a">Formular Prüfer A</a>
							{/if}
							{#if canViewProeferB}
								<a href="/cpro/pruefer-b">Formular Prüfer B</a>
							{/if}
							{#if canViewProeferA || canViewProeferB}
								<a href="/cpro/qr-preview">QR Vorschau</a>
							{/if}
							{#if canViewDatabase}
								<a href="/dashboard/cpro">Datenbank</a>
							{/if}
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
							{#if canViewProeferA}
								<a href="/c2/pruefer-a">Formular Prüfer A</a>
							{/if}
							{#if canViewProeferB}
								<a href="/c2/pruefer-b">Formular Prüfer B</a>
							{/if}
							{#if canViewProeferA || canViewProeferB}
								<a href="/c2/qr-preview">QR Vorschau</a>
							{/if}
							{#if canViewDatabase}
								<a href="/dashboard/c2">Datenbank</a>
							{/if}
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
							{#if canViewProeferA}
								<a href="/cbasic/pruefer-a">Formular Prüfer A</a>
							{/if}
							{#if canViewProeferB}
								<a href="/cbasic/pruefer-b">Formular Prüfer B</a>
							{/if}
							{#if canViewDatabase}
								<a href="/dashboard/cbasic">Datenbank</a>
							{/if}
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
							{#if canViewProeferA}
								<a href="/kk/pruefer-a">Formular Prüfer A</a>
							{/if}
							{#if canViewProeferB}
								<a href="/kk/pruefer-b">Formular Prüfer B</a>
							{/if}
							{#if canViewProeferA || canViewProeferB}
								<a href="/kk/qr-preview">QR Vorschau</a>
							{/if}
							{#if canViewDatabase}
								<a href="/dashboard/kk">Datenbank</a>
							{/if}
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
							{#if canViewDatabase}
								<a href="/dashboard/zubehoer">Datenbank</a>
							{/if}
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
							{#if canViewDatabase}
								<a href="/dashboard/outer-karton">Datenbank</a>
							{/if}
						</div>
					{/if}
				</div>
			{/if}

			<!-- User Info Section -->
			{#if currentUser}
				<div class="user-section">
					<div class="user-info">
						<div class="user-name">{currentUser.firstName} {currentUser.lastName}</div>
						<div class="user-role">{currentUser.role}</div>
					</div>
					
					{#if currentUser.role === 'ADMIN'}
						<div class="sidebar-item">
							<a href="/admin/users">Benutzerverwaltung</a>
						</div>
					{/if}
					
					{#if currentUser.role === 'ADMIN' || currentUser.role === 'MANAGEMENT'}
						<div class="sidebar-item">
							<a href="/database">Datenbank Management</a>
						</div>
					{/if}
					
					<div class="sidebar-item">
						<a href="/profile">Mein Profil</a>
					</div>
					
					<div class="sidebar-item">
						<button class="logout-button" on:click={logout}>Abmelden</button>
					</div>
				</div>
			{/if}
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

	.sidebar-item a {
		color: #123345;
		text-decoration: none;
		display: block;
		width: 100%;
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

	.user-section {
		margin-top: auto;
		border-top: 1px solid #e0e0e0;
		/* padding-top: 1rem; */
	}

	.user-info {
		padding: 0.5rem 1rem;
		background-color: #f8f9fa;
		border-bottom: 1px solid #e0e0e0;
	}

	.user-name {
		font-weight: 600;
		color: #123345;
		font-size: 0.9rem;
	}

	.user-role {
		font-size: 0.8rem;
		color: #666;
		text-transform: uppercase;
	}

	.logout-button {
		background: none;
		border: none;
		color: #dc2626;
		cursor: pointer;
		font-size: 0.9rem;
		width: 100%;
		text-align: left;
		padding: 0;
	}

	.logout-button:hover {
		color: #b91c1c;
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
