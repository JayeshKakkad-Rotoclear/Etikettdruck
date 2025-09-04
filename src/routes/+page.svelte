<script lang="ts">
  import { onMount } from 'svelte';
  import { authStore } from '$lib/stores/auth.js';
  import { goto } from '$app/navigation';
  import { canActAsProeferA, canActAsProeferB, canAccessDatabase } from '$lib/client-auth';

  interface DashboardStats {
    totals: Record<string, number>;
    recent: Record<string, number>;
    distributions: {
      cproFestplatten: Array<{ name: string; value: number }>;
      c2Configs: Array<{ name: string; value: number }>;
      kkOptics: Array<{ name: string; value: number }>;
    };
    monthlyStats: Array<{
      month: string;
      label: string;
      cpro: number;
      c2: number;
      cbasic: number;
      kk: number;
    }>;
    topPerformers: Record<string, Array<{ name: string; count: number }>>;
  }

  let stats: DashboardStats | null = null;
  let loading = true;
  let error: string | null = null;
  let currentUser: any = null;
  let chartContainer: HTMLElement;
  let tooltipElement: HTMLElement;

  onMount(() => {
    // Check authentication first
    const unsubscribe = authStore.subscribe(state => {
      currentUser = state.user;
      if (!state.isAuthenticated && !state.isLoading) {
        goto('/login');
        return;
      }
      
      // If we have a user and not loading, load dashboard stats
      if (state.user && !state.isLoading) {
        loadDashboardStats();
      }
    });

    return unsubscribe;
  });

  // Setup tooltips when stats are loaded and DOM is ready
  $: if (stats && chartContainer) {
    setupChartTooltips();
  }

  function setupChartTooltips() {
    if (!chartContainer) return;
    
    const bars = chartContainer.querySelectorAll('.bar');
    bars.forEach(bar => {
      // Remove existing listeners to prevent duplicates
      bar.removeEventListener('mouseenter', handleBarHover);
      bar.removeEventListener('mouseleave', handleBarLeave);
      bar.removeEventListener('mousemove', handleBarMove);
      
      // Add new listeners
      bar.addEventListener('mouseenter', handleBarHover);
      bar.addEventListener('mouseleave', handleBarLeave);
      bar.addEventListener('mousemove', handleBarMove);
    });
  }

  function handleBarHover(event: Event) {
    const bar = event.target as HTMLElement;
    const value = bar.getAttribute('data-value');
    const product = bar.getAttribute('data-product');
    const month = bar.getAttribute('data-month');
    
    if (tooltipElement && value && product && month) {
      const tooltipHeader = tooltipElement.querySelector('.tooltip-header');
      const tooltipBody = tooltipElement.querySelector('.tooltip-body');
      
      if (tooltipHeader && tooltipBody) {
        tooltipHeader.textContent = month;
        tooltipBody.innerHTML = `<strong>${product}:</strong> ${formatNumber(parseInt(value))} Stück`;
      }
      
      tooltipElement.style.display = 'block';
      tooltipElement.style.opacity = '1';
    }
  }

  function handleBarLeave() {
    if (tooltipElement) {
      tooltipElement.style.opacity = '0';
      setTimeout(() => {
        if (tooltipElement) tooltipElement.style.display = 'none';
      }, 200);
    }
  }

  function handleBarMove(event: Event) {
    const mouseEvent = event as MouseEvent;
    if (tooltipElement) {
      const rect = tooltipElement.getBoundingClientRect();
      const x = mouseEvent.clientX + 10;
      const y = mouseEvent.clientY - rect.height - 10;
      
      tooltipElement.style.left = `${x}px`;
      tooltipElement.style.top = `${y}px`;
    }
  }

  async function loadDashboardStats() {
    try {
      loading = true;
      const response = await fetch('/api/dashboard-stats');
      const data = await response.json();
      
      if (data.success) {
        stats = data.data;
      } else {
        error = data.error || 'Failed to load dashboard data';
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Connection error';
    } finally {
      loading = false;
    }
  }

  function formatNumber(num: number): string {
    return num.toLocaleString('de-DE');
  }

  // Role-based access checks
  $: canViewProeferA = currentUser ? canActAsProeferA(currentUser.role) : false;
  $: canViewProeferB = currentUser ? canActAsProeferB(currentUser.role) : false;
  $: canViewDatabase = currentUser ? (currentUser.role === 'MANAGEMENT' || currentUser.role === 'ADMIN') : false;
  $: isViewer = currentUser?.role === 'VIEWER';
  $: isAdmin = currentUser?.role === 'ADMIN';
  $: isManagement = currentUser?.role === 'MANAGEMENT';
</script>

<svelte:head>
  <title>Dashboard</title>
</svelte:head>

<div class="home-container">
  <header class="hero-section">
    <h1 class="hero-title">Haupt Dashboard</h1>
    <p class="hero-subtitle">Zentrale Verwaltung für Prüfprotokolle und Etikettendruck</p>
  </header>

  <!-- Navigation Grid -->
  {#if !isViewer}
    <section class="nav-section">
      <h2 class="section-title">Produktsysteme</h2>
      <div class="nav-grid">
        <div class="nav-category">
          <h3 class="category-title">C Pro Steuerrechner</h3>
          <div class="nav-links">
            {#if canViewProeferA}
              <a href="/cpro/pruefer-a" class="nav-link">Prüfer A Formular</a>
            {/if}
            {#if canViewProeferB}
              <a href="/cpro/pruefer-b" class="nav-link">Prüfer B Formular</a>
            {/if}
            {#if canViewProeferA || canViewProeferB}
              <a href="/cpro/qr-preview" class="nav-link">QR-Code Vorschau</a>
            {/if}
            <a href="/cpro/print-label" class="nav-link">Etikettendruck</a>
            {#if canViewDatabase}
              <a href="/dashboard/cpro" class="nav-link dashboard">Datenbank</a>
            {/if}
          </div>
        </div>

        <div class="nav-category">
          <h3 class="category-title">C2 Steuerrechner</h3>
          <div class="nav-links">
            {#if canViewProeferA}
              <a href="/c2/pruefer-a" class="nav-link">Prüfer A Formular</a>
            {/if}
            {#if canViewProeferB}
              <a href="/c2/pruefer-b" class="nav-link">Prüfer B Formular</a>
            {/if}
            {#if canViewProeferA || canViewProeferB}
              <a href="/c2/qr-preview" class="nav-link">QR-Code Vorschau</a>
            {/if}
            <a href="/c2/print-label" class="nav-link">Etikettendruck</a>
            {#if canViewDatabase}
              <a href="/dashboard/c2" class="nav-link dashboard">Datenbank</a>
            {/if}
          </div>
        </div>

        <div class="nav-category">
          <h3 class="category-title">C Basic Steuerrechner</h3>
          <div class="nav-links">
            {#if canViewProeferA}
              <a href="/cbasic/pruefer-a" class="nav-link">Prüfer A Formular</a>
            {/if}
            {#if canViewProeferB}
              <a href="/cbasic/pruefer-b" class="nav-link">Prüfer B Formular</a>
            {/if}
            <a href="/cbasic/print-label" class="nav-link">Etikettendruck</a>
            {#if canViewDatabase}
              <a href="/dashboard/cbasic" class="nav-link dashboard">Datenbank</a>
            {/if}
          </div>
        </div>

        <div class="nav-category">
          <h3 class="category-title">Kamerakopf</h3>
          <div class="nav-links">
            {#if canViewProeferA}
              <a href="/kk/pruefer-a" class="nav-link">Prüfer A Formular</a>
            {/if}
            {#if canViewProeferB}
              <a href="/kk/pruefer-b" class="nav-link">Prüfer B Formular</a>
            {/if}
            {#if canViewProeferA || canViewProeferB}
              <a href="/kk/qr-preview" class="nav-link">QR-Code Vorschau</a>
            {/if}
            <a href="/kk/print-label" class="nav-link">Etikettendruck</a>
            {#if canViewDatabase}
              <a href="/dashboard/kk" class="nav-link dashboard">Datenbank</a>
            {/if}
          </div>
        </div>

        <div class="nav-category">
          <h3 class="category-title">Zubehör</h3>
          <div class="nav-links">
            <a href="/zubehoer" class="nav-link">Zubehör Etikett</a>
            <a href="/zubehoer/print" class="nav-link">Etikettendruck</a>
            {#if canViewDatabase}
              <a href="/dashboard/zubehoer" class="nav-link dashboard">Zubehör Datenbank</a>
            {/if}
          </div>
        </div>

        <div class="nav-category">
          <h3 class="category-title">Verpackung</h3>
          <div class="nav-links">
            <a href="/outer-karton" class="nav-link">Außenkarton Etikett</a>
            <a href="/outer-karton/print" class="nav-link">Etikettendruck</a>
            {#if canViewDatabase}
              <a href="/dashboard/outer-karton" class="nav-link dashboard">Außenkarton Datenbank</a>
            {/if}
          </div>
        </div>
      </div>
    </section>
  {/if}

  <!-- Statistics Dashboard -->
  {#if loading}
    <section class="stats-section">
      <div class="loading">Lade Dashboard-Statistiken...</div>
    </section>
  {:else if error}
    <section class="stats-section">
      <div class="error">Fehler beim Laden der Statistiken: {error}</div>
    </section>
  {:else if stats}
    <section class="stats-section">
      <h2 class="section-title">Produktionsübersicht</h2>
      
      <!-- Total Counts -->
      <div class="stats-grid">
        <div class="stat-card total">
          <h3>Gesamtproduktion</h3>
          <div class="stat-number">{formatNumber(stats.totals.total)}</div>
          <div class="stat-label">Produkte insgesamt</div>
        </div>
        
        <div class="stat-card recent">
          <h3>Letzte 30 Tage</h3>
          <div class="stat-number">{formatNumber(stats.recent.total)}</div>
          <div class="stat-label">Neue Produkte</div>
        </div>

        <div class="stat-card">
          <h3>C Pro</h3>
          <div class="stat-number">{formatNumber(stats.totals.cpro)}</div>
          <div class="stat-label">
            <span class="recent-badge">+{stats.recent.cpro}</span> diese Woche
          </div>
        </div>

        <div class="stat-card">
          <h3>C2</h3>
          <div class="stat-number">{formatNumber(stats.totals.c2)}</div>
          <div class="stat-label">
            <span class="recent-badge">+{stats.recent.c2}</span> diese Woche
          </div>
        </div>

        <div class="stat-card">
          <h3>C Basic</h3>
          <div class="stat-number">{formatNumber(stats.totals.cbasic)}</div>
          <div class="stat-label">
            <span class="recent-badge">+{stats.recent.cbasic}</span> diese Woche
          </div>
        </div>

        <div class="stat-card">
          <h3>Kamerakopf</h3>
          <div class="stat-number">{formatNumber(stats.totals.kk)}</div>
          <div class="stat-label">
            <span class="recent-badge">+{stats.recent.kk}</span> diese Woche
          </div>
        </div>

        <div class="stat-card">
          <h3>Zubehör</h3>
          <div class="stat-number">{formatNumber(stats.totals.zubehoer)}</div>
          <div class="stat-label">Etiketten erstellt</div>
        </div>

        <div class="stat-card auxiliary">
          <h3>Außenkarton</h3>
          <div class="stat-number">{formatNumber(stats.totals.outerKarton)}</div>
          <div class="stat-label">Verpackungseinheiten</div>
        </div>
      </div>

      <!-- Monthly Production Chart -->
      <div class="chart-section">
        <h3>Monatliche Produktion (letztes Jahr)</h3>
        <div class="chart-container" bind:this={chartContainer}>
          <div class="chart-scroll-wrapper">
            <div class="chart">
              {#each stats.monthlyStats as month, index}
                {@const maxTotal = Math.max(...stats.monthlyStats.map(m => m.cpro + m.c2 + m.cbasic + m.kk))}
                <div class="chart-bar" data-month="{month.label}">
                  <div class="bar-container">
                    <div 
                      class="bar cpro" 
                      style="height: {(month.cpro / maxTotal) * 100}%"
                      data-value="{month.cpro}"
                      data-product="C Pro"
                      data-month="{month.label}"
                    ></div>
                    <div 
                      class="bar c2" 
                      style="height: {(month.c2 / maxTotal) * 100}%"
                      data-value="{month.c2}"
                      data-product="C2"
                      data-month="{month.label}"
                    ></div>
                    <div 
                      class="bar cbasic" 
                      style="height: {(month.cbasic / maxTotal) * 100}%"
                      data-value="{month.cbasic}"
                      data-product="C Basic"
                      data-month="{month.label}"
                    ></div>
                    <div 
                      class="bar kk" 
                      style="height: {(month.kk / maxTotal) * 100}%"
                      data-value="{month.kk}"
                      data-product="Kamerakopf"
                      data-month="{month.label}"
                    ></div>
                  </div>
                  <div class="chart-labels">
                    <div class="chart-label">{month.label}</div>
                    <div class="chart-total">{formatNumber(month.cpro + month.c2 + month.cbasic + month.kk)}</div>
                  </div>
                </div>
              {/each}
            </div>
          </div>
          <div class="chart-scroll-hint">← Scrollen Sie horizontal für alle Monate →</div>
          <div class="chart-legend">
            <div class="legend-item"><span class="legend-color cpro"></span> C Pro</div>
            <div class="legend-item"><span class="legend-color c2"></span> C2</div>
            <div class="legend-item"><span class="legend-color cbasic"></span> C Basic</div>
            <div class="legend-item"><span class="legend-color kk"></span> Kamerakopf</div>
          </div>
        </div>
        
        <!-- Tooltip -->
        <div class="chart-tooltip" bind:this={tooltipElement}>
          <div class="tooltip-content">
            <div class="tooltip-header"></div>
            <div class="tooltip-body"></div>
          </div>
        </div>
      </div>

      <!-- Distribution Charts -->
      <div class="distribution-section">
        <div class="distribution-card">
          <h3>C Pro Festplatten</h3>
          <div class="pie-chart">
            {#each stats.distributions.cproFestplatten as festplatte}
              <div class="pie-item">
                <span class="pie-label">{festplatte.name.replace('_', ' ').replace('GB', ' GB').replace('TB', ' TB')}</span>
                <span class="pie-value">{festplatte.value}</span>
              </div>
            {/each}
          </div>
        </div>

        <div class="distribution-card">
          <h3>C2 Konfigurationen</h3>
          <div class="pie-chart">
            {#each stats.distributions.c2Configs as config}
              <div class="pie-item">
                <span class="pie-label">{config.name}</span>
                <span class="pie-value">{config.value}</span>
              </div>
            {/each}
          </div>
        </div>

        <div class="distribution-card">
          <h3>Kamerakopf Optiken</h3>
          <div class="pie-chart">
            {#each stats.distributions.kkOptics as optic}
              <div class="pie-item">
                <span class="pie-label">{optic.name.replace('_', ' ')}</span>
                <span class="pie-value">{optic.value}</span>
              </div>
            {/each}
          </div>
        </div>
      </div>

      <!-- Top Performers -->
      <div class="performers-section">
        <h3>Top Prüfer (nach Anzahl geprüfter Produkte)</h3>
        <div class="performers-grid">
          <div class="performer-category">
            <h4>C Pro</h4>
            <ul>
              {#each stats.topPerformers.cpro as performer}
                <li>{performer.name}: {performer.count}</li>
              {/each}
            </ul>
          </div>
          <div class="performer-category">
            <h4>C2</h4>
            <ul>
              {#each stats.topPerformers.c2 as performer}
                <li>{performer.name}: {performer.count}</li>
              {/each}
            </ul>
          </div>
          <div class="performer-category">
            <h4>C Basic</h4>
            <ul>
              {#each stats.topPerformers.cbasic as performer}
                <li>{performer.name}: {performer.count}</li>
              {/each}
            </ul>
          </div>
          <div class="performer-category">
            <h4>Kamerakopf</h4>
            <ul>
              {#each stats.topPerformers.kk as performer}
                <li>{performer.name}: {performer.count}</li>
              {/each}
            </ul>
          </div>
        </div>
      </div>
    </section>
  {/if}
</div>

<style>
  .home-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--spacing-lg);
  }

  .hero-section {
    text-align: center;
    margin-bottom: var(--spacing-xxl);
    padding: var(--spacing-xxl) var(--spacing-lg);
    background: linear-gradient(135deg, var(--primary-color) 20%, var(--primary-hover) 100%);
    border-radius: var(--border-radius-lg);
    color: var(--white);
    box-shadow: var(--shadow-lg);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .hero-title {
    font-size: var(--font-size-xxl);
    font-weight: var(--font-weight-bold);
    margin-bottom: var(--spacing-lg);
    text-shadow: var(--shadow-text);
    letter-spacing: 0.5px;
  }

  .hero-subtitle {
    font-size: var(--font-size-lg);
    opacity: 0.95;
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
  }

  .section-title {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
    margin-bottom: var(--spacing-xl);
    color: var(--text-primary);
    border-bottom: 3px solid var(--primary-color);
    padding-bottom: var(--spacing-sm);
    position: relative;
  }

  .section-title::after {
    content: '';
    position: absolute;
    bottom: -3px;
    left: 0;
    width: 60px;
    height: 3px;
    background: var(--accent-color);
    border-radius: var(--border-radius-sm);
  }

  .nav-section {
    margin-bottom: var(--spacing-xxl);
  }

  .nav-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--spacing-xl);
  }

  .nav-category {
    background: var(--white);
    border-radius: var(--border-radius-lg);
    padding: var(--spacing-xl);
    box-shadow: var(--shadow-md);
    border: 1px solid var(--border-color);
    transition: all var(--transition-normal) ease;
    position: relative;
    overflow: hidden;
  }

  .nav-category::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--primary-color) 0%, var(--accent-color) 100%);
  }

  .nav-category:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
    border-color: var(--primary-color);
  }

  .category-title {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    margin-bottom: var(--spacing-lg);
    color: var(--text-primary);
    border-bottom: 2px solid var(--border-light);
    padding-bottom: var(--spacing-sm);
  }

  .nav-links {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .nav-link {
    padding: var(--spacing-md) var(--spacing-lg);
    background: var(--bg-light);
    border-radius: var(--border-radius-md);
    text-decoration: none;
    color: var(--text-secondary);
    transition: all var(--transition-fast) ease;
    border-left: 3px solid transparent;
    font-weight: var(--font-weight-normal);
    position: relative;
    overflow: hidden;
  }

  .nav-link::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent 0%, rgba(18, 51, 69, 0.05) 50%, transparent 100%);
    transition: left var(--transition-normal) ease;
  }

  .nav-link:hover {
    background: var(--white);
    border-left-color: var(--primary-color);
    transform: translateX(4px);
    color: var(--primary-color);
    font-weight: var(--font-weight-semibold);
    box-shadow: var(--shadow-sm);
  }

  .nav-link:hover::before {
    left: 100%;
  }

  .nav-link.dashboard {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
    color: var(--white);
    font-weight: var(--font-weight-semibold);
    border-left-color: var(--accent-color);
  }

  .nav-link.dashboard:hover {
    background: var(--white);
    color: var(--primary-color);
    border-left-color: var(--primary-color);
  }

  .stats-section {
    margin-bottom: var(--spacing-xxl);
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: var(--spacing-xl);
    margin-bottom: var(--spacing-xxl);
  }

  .stat-card {
    background: var(--white);
    padding: var(--spacing-xl);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-md);
    text-align: center;
    border-left: 4px solid var(--primary-color);
    transition: all var(--transition-normal) ease;
    position: relative;
    overflow: hidden;
  }

  .stat-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, transparent 0%, rgba(18, 51, 69, 0.02) 100%);
    pointer-events: none;
  }

  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  .stat-card.total {
    border-left-color: var(--success-color);
    background: linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%);
  }

  .stat-card.recent {
    border-left-color: var(--warning-color);
    background: linear-gradient(135deg, #fffaf0 0%, #fbd38d 100%);
  }

  .stat-card.auxiliary {
    border-left-color: var(--info-color);
    background: linear-gradient(135deg, #faf5ff 0%, #e9d8fd 100%);
  }

  .stat-card h3 {
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-semibold);
    margin-bottom: var(--spacing-sm);
    color: var(--text-primary);
    position: relative;
    z-index: 1;
  }

  .stat-number {
    font-size: var(--font-size-xxl);
    font-weight: var(--font-weight-bold);
    color: var(--primary-color);
    margin-bottom: var(--spacing-xs);
    position: relative;
    z-index: 1;
  }

  .stat-label {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    position: relative;
    z-index: 1;
  }

  .recent-badge {
    background: var(--success-color);
    color: var(--white);
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--border-radius-full);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
    box-shadow: var(--shadow-sm);
  }

  .chart-section {
    background: var(--white);
    padding: var(--spacing-xl);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-md);
    margin-bottom: var(--spacing-xxl);
    border: 1px solid var(--border-color);
  }

  .chart-section h3 {
    margin-bottom: var(--spacing-xl);
    color: var(--text-primary);
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
  }

  .chart-container {
    position: relative;
  }

  .chart-scroll-wrapper {
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    border-radius: var(--border-radius-md);
    background: var(--bg-light);
    padding: var(--spacing-md);
  }

  .chart {
    display: flex;
    align-items: end;
    gap: var(--spacing-md);
    height: 320px;
    padding: var(--spacing-lg) 0 var(--spacing-xl) 0;
    border-bottom: 2px solid var(--border-medium);
    min-width: 900px;
    position: relative;
  }

  .chart-bar {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 60px;
    position: relative;
  }

  .bar-container {
    width: 100%;
    height: 250px;
    display: flex;
    flex-direction: column-reverse;
    align-items: center;
    gap: 2px;
    padding: 0 var(--spacing-xs);
  }

  .bar {
    width: 100%;
    min-height: 3px;
    border-radius: var(--border-radius-sm) var(--border-radius-sm) 0 0;
    transition: all var(--transition-smooth) ease;
    cursor: pointer;
    position: relative;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .bar:hover {
    opacity: 0.9;
    transform: scaleX(1.05) scaleY(1.02);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    z-index: 10;
  }

  .bar.cpro { 
    background: linear-gradient(180deg, #4299e1 0%, #3182ce 100%);
    border-top: 2px solid #2b77cb;
  }
  
  .bar.c2 { 
    background: linear-gradient(180deg, var(--success-color) 0%, #38a169 100%);
    border-top: 2px solid #2f855a;
  }
  
  .bar.cbasic { 
    background: linear-gradient(180deg, var(--warning-color) 0%, #d69e2e 100%);
    border-top: 2px solid #b7791f;
  }
  
  .bar.kk { 
    background: linear-gradient(180deg, var(--primary-color) 0%, var(--primary-hover) 100%);
    border-top: 2px solid var(--primary-active);
  }

  .chart-labels {
    margin-top: var(--spacing-md);
    text-align: center;
    width: 100%;
    min-height: 50px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: var(--spacing-xs);
  }

  .chart-label {
    font-size: var(--font-size-sm);
    color: var(--text-primary);
    font-weight: var(--font-weight-semibold);
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    line-height: 1.2;
  }

  .chart-total {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-bold);
    color: var(--primary-color);
    background: var(--white);
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--border-radius-full);
    border: 1px solid var(--border-light);
    box-shadow: var(--shadow-sm);
    white-space: nowrap;
  }

  .chart-tooltip {
    position: fixed;
    background: var(--white);
    border: 1px solid var(--border-medium);
    border-radius: var(--border-radius-md);
    box-shadow: var(--shadow-lg);
    padding: var(--spacing-md);
    pointer-events: none;
    z-index: 1000;
    display: none;
    opacity: 0;
    transition: opacity var(--transition-fast) ease;
    max-width: 200px;
  }

  .tooltip-content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .tooltip-header {
    font-weight: var(--font-weight-bold);
    color: var(--text-primary);
    font-size: var(--font-size-sm);
    border-bottom: 1px solid var(--border-light);
    padding-bottom: var(--spacing-xs);
  }

  .tooltip-body {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    line-height: 1.4;
  }

  .chart-legend {
    display: flex;
    justify-content: center;
    gap: var(--spacing-xl);
    margin-top: var(--spacing-xl);
    flex-wrap: wrap;
    padding: var(--spacing-lg);
    background: var(--bg-light);
    border-radius: var(--border-radius-md);
    border: 1px solid var(--border-light);
  }

  .chart-scroll-hint {
    display: none;
    text-align: center;
    font-size: var(--font-size-sm);
    color: var(--text-muted);
    margin: var(--spacing-sm) 0;
    font-style: italic;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-size: var(--font-size-sm);
    color: var(--text-primary);
    font-weight: var(--font-weight-normal);
  }

  .legend-color {
    width: 12px;
    height: 12px;
    border-radius: var(--border-radius-sm);
    box-shadow: var(--shadow-sm);
  }

  .legend-color.cpro { background: #4299e1; }
  .legend-color.c2 { background: var(--success-color); }
  .legend-color.cbasic { background: var(--warning-color); }
  .legend-color.kk { background: var(--primary-color); }

  .distribution-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: var(--spacing-xl);
    margin-bottom: var(--spacing-xxl);
  }

  .distribution-card {
    background: var(--white);
    padding: var(--spacing-xl);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-md);
    border: 1px solid var(--border-color);
    transition: all var(--transition-normal) ease;
  }

  .distribution-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  .distribution-card h3 {
    margin-bottom: var(--spacing-xl);
    color: var(--text-primary);
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    border-bottom: 2px solid var(--border-light);
    padding-bottom: var(--spacing-sm);
  }

  .pie-chart {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .pie-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md);
    background: var(--bg-light);
    border-radius: var(--border-radius-md);
    border-left: 4px solid var(--primary-color);
    transition: all var(--transition-fast) ease;
  }

  .pie-item:hover {
    background: var(--white);
    box-shadow: var(--shadow-sm);
    transform: translateX(4px);
  }

  .pie-label {
    font-weight: var(--font-weight-normal);
    color: var(--text-primary);
  }

  .pie-value {
    font-weight: var(--font-weight-semibold);
    color: var(--white);
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
    padding: var(--spacing-xs) var(--spacing-md);
    border-radius: var(--border-radius-full);
    font-size: var(--font-size-sm);
    box-shadow: var(--shadow-sm);
  }

  .performers-section {
    background: var(--white);
    padding: var(--spacing-xl);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-md);
    border: 1px solid var(--border-color);
  }

  .performers-section h3 {
    margin-bottom: var(--spacing-xl);
    color: var(--text-primary);
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
  }

  .performers-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: var(--spacing-xl);
  }

  .performer-category h4 {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    margin-bottom: var(--spacing-lg);
    color: var(--text-primary);
    border-bottom: 2px solid var(--border-light);
    padding-bottom: var(--spacing-sm);
  }

  .performer-category ul {
    list-style: none;
    padding: 0;
  }

  .performer-category li {
    padding: var(--spacing-sm) 0;
    border-bottom: 1px solid var(--border-light);
    color: var(--text-secondary);
    transition: all var(--transition-fast) ease;
    font-weight: var(--font-weight-normal);
  }

  .performer-category li:hover {
    color: var(--text-primary);
    padding-left: var(--spacing-sm);
  }

  .performer-category li:last-child {
    border-bottom: none;
  }

  .loading, .error {
    text-align: center;
    padding: var(--spacing-xxl);
    font-size: var(--font-size-lg);
    border-radius: var(--border-radius-lg);
  }

  .loading {
    color: var(--text-primary);
    background: var(--bg-light);
  }

  .error {
    color: var(--danger-color);
    background: #fed7d7;
    border-radius: var(--border-radius-md);
    border: 1px solid #feb2b2;
  }

  @media (max-width: 768px) {
    .home-container {
      padding: var(--spacing-md);
    }

    .hero-section {
      padding: var(--spacing-xl) var(--spacing-md);
    }

    .hero-title {
      font-size: var(--font-size-xl);
    }

    .hero-subtitle {
      font-size: var(--font-size-base);
    }

    .nav-grid {
      grid-template-columns: 1fr;
      gap: var(--spacing-lg);
    }

    .nav-category {
      padding: var(--spacing-lg);
    }

    .stats-grid {
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: var(--spacing-lg);
    }

    .stat-card {
      padding: var(--spacing-lg);
    }

    .chart-section {
      padding: var(--spacing-lg);
    }

    .chart-scroll-wrapper {
      scrollbar-width: thin;
      scrollbar-color: var(--primary-color) var(--bg-light);
      padding: var(--spacing-sm);
    }

    .chart-scroll-wrapper::-webkit-scrollbar {
      height: 8px;
    }

    .chart-scroll-wrapper::-webkit-scrollbar-track {
      background: var(--bg-light);
      border-radius: var(--border-radius-sm);
    }

    .chart-scroll-wrapper::-webkit-scrollbar-thumb {
      background: var(--primary-color);
      border-radius: var(--border-radius-sm);
    }

    .chart-scroll-wrapper::-webkit-scrollbar-thumb:hover {
      background: var(--primary-hover);
    }

    .chart {
      min-width: 1100px;
      height: 280px;
      gap: var(--spacing-sm);
    }

    .chart-bar {
      min-width: 50px;
    }

    .bar-container {
      height: 200px;
      padding: 0 2px;
    }

    .chart-labels {
      min-height: 45px;
      gap: 4px;
    }

    .chart-label {
      font-size: var(--font-size-xs);
      line-height: 1.1;
    }

    .chart-total {
      font-size: var(--font-size-xs);
      padding: 2px var(--spacing-xs);
    }

    .chart-legend {
      gap: var(--spacing-lg);
      padding: var(--spacing-md);
      flex-direction: column;
      align-items: center;
    }

    .legend-item {
      font-size: var(--font-size-xs);
    }

    .chart-scroll-hint {
      display: block;
    }

    .chart-tooltip {
      max-width: 180px;
      padding: var(--spacing-sm);
    }

    .tooltip-header {
      font-size: var(--font-size-xs);
    }

    .tooltip-body {
      font-size: var(--font-size-xs);
    }

    .distribution-section {
      grid-template-columns: 1fr;
      gap: var(--spacing-lg);
    }

    .distribution-card {
      padding: var(--spacing-lg);
    }

    .performers-section {
      padding: var(--spacing-lg);
    }

    .performers-grid {
      grid-template-columns: 1fr;
      gap: var(--spacing-lg);
    }
  }
</style>
