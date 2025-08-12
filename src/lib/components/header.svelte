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
	<!-- <h1>Etikettendruck System</h1> -->
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
							<a href="/cpro/print-label">Etikett Drucken</a>
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
							<a href="/c2/print-label">Etikett Drucken</a>
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
							<a href="/cbasic/print-label">Etikett Drucken</a>
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
							<a href="/kk/print-label">Etikett Drucken</a>
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
							{#if canViewProeferA || canViewProeferB}
								<a href="/zubehoer/print-label">Etikett Drucken</a>
							{/if}
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
		justify-content: space-between;
		padding: 0 var(--spacing-lg);
		background: linear-gradient(135deg, var(--primary-color) 20%, var(--primary-hover) 100%);
		color: var(--white);
		position: sticky;
		top: 0;
		z-index: 1000;
		margin: 0;
		height: 70px;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.logo {
		height: 32px;
		width: auto;
		margin: 0;
		filter: brightness(1.1);
		transition: transform var(--transition-fast) ease;
	}

	.logo:hover {
		transform: scale(1.05);
	}

	/* h1 {
		text-align: center;
		margin: 0;
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.5px;
		flex: 1;
		padding: 0 var(--spacing-lg);
	} */

	.burger {
		background: rgba(255, 255, 255, 0.1);
		border: 2px solid rgba(255, 255, 255, 0.2);
		border-radius: var(--border-radius-sm);
		cursor: pointer;
		padding: var(--spacing-sm);
		z-index: 1001;
		transition: all var(--transition-fast) ease;
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 44px;
		min-height: 44px;
	}

	.burger:hover {
		background: rgba(255, 255, 255, 0.2);
		border-color: rgba(255, 255, 255, 0.4);
		transform: translateY(-1px);
	}

	.burger svg {
		fill: var(--white);
		width: 20px;
		height: 20px;
	}

	.sidebar {
		position: absolute;
		top: 70px;
		right: 0;
		background: var(--white);
		width: 280px;
		border: 1px solid rgba(0, 0, 0, 0.1);
		padding: 0;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
		display: flex;
		flex-direction: column;
		color: var(--text-primary);
		border-radius: 0 0 12px 12px;
		overflow: visible;
		backdrop-filter: blur(10px);
		z-index: 1001;
	}

	.sidebar-item {
		position: relative;
		margin: 0;
		cursor: pointer;
		transition: all var(--transition-fast) ease;
		border-bottom: 1px solid #f1f1f1;
		overflow: visible;
	}

	.sidebar-item:last-child {
		border-bottom: none;
	}

	.sidebar-item > span,
	.sidebar-item > a {
		color: var(--text-primary);
		text-decoration: none;
		display: block;
		/* width: 100%; */
		padding: var(--spacing-md) var(--spacing-lg);
		font-weight: var(--font-weight-normal);
		font-size: 0.95rem;
		letter-spacing: 0.2px;
		transition: all var(--transition-fast) ease;
	}

	.sidebar-item:hover {
		background: linear-gradient(90deg, rgba(18, 51, 69, 0.05) 0%, rgba(18, 51, 69, 0.02) 100%);
	}

	.sidebar-item:hover > span,
	.sidebar-item:hover > a {
		color: var(--primary-color);
		font-weight: var(--font-weight-semibold);
	}

	.submenu {
		position: absolute;
		top: 0;
		right: 280px;
		background: var(--white);
		border: 1px solid rgba(0, 0, 0, 0.1);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
		padding: var(--spacing-sm) 0;
		display: flex;
		flex-direction: column;
		min-width: 220px;
		border-radius: 8px;
		overflow: hidden;
		z-index: 1003;
		opacity: 1;
		visibility: visible;
		transform: translateX(0);
		transition: all var(--transition-fast) ease;
	}

	.submenu::before {
		content: '';
		position: absolute;
		top: 20px;
		right: -6px;
		width: 0;
		height: 0;
		border-left: 6px solid var(--white);
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
		z-index: 1004;
	}

	.submenu a {
		color: var(--text-secondary);
		text-decoration: none;
		padding: var(--spacing-sm) var(--spacing-lg);
		font-size: 0.9rem;
		font-weight: var(--font-weight-normal);
		transition: all var(--transition-fast) ease;
		border-bottom: 1px solid #f8f8f8;
	}

	.submenu a:last-child {
		border-bottom: none;
	}

	.submenu a:hover {
		background: linear-gradient(90deg, rgba(18, 51, 69, 0.08) 0%, rgba(18, 51, 69, 0.02) 100%);
		color: var(--primary-color);
		font-weight: var(--font-weight-semibold);
		padding-left: calc(var(--spacing-lg) + 4px);
	}

	.user-section {
		margin-top: auto;
		border-top: 2px solid #f1f1f1;
		background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
		border-radius: 0 0 12px 12px;
		overflow: hidden;
	}

	.user-info {
		padding: var(--spacing-lg);
		background: transparent;
		border-bottom: 1px solid rgba(18, 51, 69, 0.1);
	}

	.user-name {
		font-weight: var(--font-weight-semibold);
		color: var(--primary-color);
		font-size: 1rem;
		margin-bottom: 2px;
		letter-spacing: 0.3px;
	}

	.user-role {
		font-size: var(--font-size-sm);
		color: var(--text-muted);
		text-transform: uppercase;
		font-weight: var(--font-weight-semibold);
		letter-spacing: 1px;
		padding: 2px 8px;
		background: rgba(18, 51, 69, 0.1);
		border-radius: 12px;
		display: inline-block;
		margin-top: 4px;
	}

	.logout-button {
		background: none;
		border: none;
		color: var(--danger-color);
		cursor: pointer;
		font-size: 0.95rem;
		font-weight: var(--font-weight-normal);
		width: 100%;
		text-align: left;
		padding: var(--spacing-md) var(--spacing-lg);
		transition: all var(--transition-fast) ease;
		letter-spacing: 0.2px;
	}

	.logout-button:hover {
		color: var(--danger-hover);
		background: linear-gradient(90deg, rgba(220, 38, 38, 0.05) 0%, rgba(220, 38, 38, 0.02) 100%);
		font-weight: var(--font-weight-semibold);
	}

	@media (max-width: 768px) {
		header {
			padding: 0 var(--spacing-md);
		}

		.logo {
			height: 28px;
		}

		/* h1 {
			font-size: var(--font-size-base);
			padding: 0 var(--spacing-md);
		} */

		.burger {
			min-width: 40px;
			min-height: 40px;
			padding: var(--spacing-xs);
		}

		.sidebar {
			width: 100vw;
			right: 0;
			border-radius: 0;
		}

		.submenu {
			position: relative;
			right: 0;
			top: 0;
			width: 100%;
			box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
			background: #f8f9fa;
			border-radius: 0;
			margin-top: 0;
		}

		.submenu::before {
			display: none;
		}

		.submenu a {
			padding-left: calc(var(--spacing-lg) * 2);
			background: transparent;
		}
	}
</style>
