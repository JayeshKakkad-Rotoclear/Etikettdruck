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
            {#if canViewDatabase}
              <a href="/dashboard/kk" class="nav-link dashboard">Datenbank</a>
            {/if}
          </div>
        </div>

        <div class="nav-category">
          <h3 class="category-title">Zubehör</h3>
          <div class="nav-links">
            <a href="/zubehoer" class="nav-link">Zubehör Etikett</a>
            {#if canViewDatabase}
              <a href="/dashboard/zubehoer" class="nav-link dashboard">Zubehör Datenbank</a>
            {/if}
          </div>
        </div>

        <div class="nav-category">
          <h3 class="category-title">Verpackung</h3>
          <div class="nav-links">
            <a href="/outer-karton" class="nav-link">Außenkarton Etikett</a>
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
        <div class="chart-container">
          <div class="chart-scroll-wrapper">
            <div class="chart">
              {#each stats.monthlyStats as month}
                <div class="chart-bar">
                  <div class="bar-container">
                    <div class="bar cpro" style="height: {(month.cpro / Math.max(...stats.monthlyStats.map(m => m.cpro + m.c2 + m.cbasic + m.kk))) * 100}%"></div>
                    <div class="bar c2" style="height: {(month.c2 / Math.max(...stats.monthlyStats.map(m => m.cpro + m.c2 + m.cbasic + m.kk))) * 100}%"></div>
                    <div class="bar cbasic" style="height: {(month.cbasic / Math.max(...stats.monthlyStats.map(m => m.cpro + m.c2 + m.cbasic + m.kk))) * 100}%"></div>
                    <div class="bar kk" style="height: {(month.kk / Math.max(...stats.monthlyStats.map(m => m.cpro + m.c2 + m.cbasic + m.kk))) * 100}%"></div>
                  </div>
                  <div class="chart-label">{month.label}</div>
                  <div class="chart-total">{month.cpro + month.c2 + month.cbasic + month.kk}</div>
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
    padding: 1rem;
  }

  .hero-section {
    text-align: center;
    margin-bottom: 3rem;
    padding: 3rem 0;
    background: linear-gradient(135deg, #123345 0%, #324455 100%);
    border-radius: 12px;
    color: white;
  }

  .hero-title {
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 1rem;
    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  }

  .hero-subtitle {
    font-size: 1.25rem;
    opacity: 0.9;
    max-width: 600px;
    margin: 0 auto;
  }

  .section-title {
    font-size: 2rem;
    font-weight: 600;
    margin-bottom: 2rem;
    color: #333;
    border-bottom: 3px solid #123345;
    padding-bottom: 0.5rem;
  }

  .nav-section {
    margin-bottom: 4rem;
  }

  .nav-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
  }

  .nav-category {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border: 1px solid #e2e8f0;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .nav-category:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
  }

  .category-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #2d3748;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 0.5rem;
  }

  .nav-links {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .nav-link {
    padding: 0.75rem 1rem;
    background: #f7fafc;
    border-radius: 6px;
    text-decoration: none;
    color: #4a5568;
    transition: all 0.2s;
    border-left: 3px solid transparent;
  }

  .nav-link:hover {
    background: #edf2f7;
    border-left-color: #123345;
    transform: translateX(4px);
  }

  .nav-link.dashboard {
    background: #123345;
    color: white;
  }

  .nav-link.dashboard:hover {
    background: #edf2f7;
    color: #123345;
  }

  .stats-section {
    margin-bottom: 3rem;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-bottom: 3rem;
  }

  .stat-card {
    background: white;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    text-align: center;
    border-left: 4px solid #123345;
  }

  .stat-card.total {
    border-left-color: #85c700;
    background: linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%);
  }

  .stat-card.recent {
    border-left-color: #ffA500;
    background: linear-gradient(135deg, #fffaf0 0%, #fbd38d 100%);
  }

  .stat-card.auxiliary {
    border-left-color: #123345;
    background: linear-gradient(135deg, #faf5ff 0%, #e9d8fd 100%);
  }

  .stat-card h3 {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #123345;
  }

  .stat-number {
    font-size: 2.5rem;
    font-weight: 700;
    color: #123345;
    margin-bottom: 0.25rem;
  }

  .stat-label {
    font-size: 0.875rem;
    color: #123345;
  }

  .recent-badge {
    background: #85c700;
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .chart-section {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    margin-bottom: 3rem;
  }

  .chart-section h3 {
    margin-bottom: 2rem;
    color: #123345;
    font-size: 1.5rem;
    font-weight: 600;
  }

  .chart-container {
    position: relative;
  }

  .chart-scroll-wrapper {
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
  }

  .chart {
    display: flex;
    align-items: end;
    gap: 0.5rem;
    height: 300px;
    padding: 1rem 0;
    border-bottom: 2px solid #e2e8f0;
    min-width: 800px; /* Ensure chart has minimum width for proper display */
  }

  .chart-bar {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .bar-container {
    width: 100%;
    height: 250px;
    display: flex;
    flex-direction: column-reverse;
    align-items: center;
    gap: 1px;
  }

  .bar {
    width: 80%;
    min-height: 2px;
    border-radius: 2px 2px 0 0;
  }

  .bar.cpro { background: #4299e1; }
  .bar.c2 { background: #85c700; }
  .bar.cbasic { background: #ffA500; }
  .bar.kk { background: #123345; }

  .chart-label {
    font-size: 0.75rem;
    color: #123345;
    margin-top: 0.5rem;
    transform: rotate(-45deg);
    white-space: nowrap;
  }

  .chart-total {
    font-size: 0.875rem;
    font-weight: 600;
    color: #123345;
    margin-top: 0.25rem;
  }

  .chart-legend {
    display: flex;
    justify-content: center;
    gap: 2rem;
    margin-top: 1rem;
    flex-wrap: wrap;
  }

  .chart-scroll-hint {
    display: none;
    text-align: center;
    font-size: 0.875rem;
    color: #666;
    margin: 0.5rem 0;
    font-style: italic;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: #123345;
  }

  .legend-color {
    width: 12px;
    height: 12px;
    border-radius: 2px;
  }

  .legend-color.cpro { background: #4299e1; }
  .legend-color.c2 { background: #85c700; }
  .legend-color.cbasic { background: #ffA500; }
  .legend-color.kk { background: #123345; }

  .distribution-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-bottom: 3rem;
  }

  .distribution-card {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .distribution-card h3 {
    margin-bottom: 1.5rem;
    color: #123345;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .pie-chart {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .pie-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background: #f7fafc;
    border-radius: 6px;
    border-left: 4px solid #123345;
  }

  .pie-label {
    font-weight: 500;
    color: #123345;
  }

  .pie-value {
    font-weight: 600;
    color: #123345;
    background: #123345;
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.875rem;
  }

  .performers-section {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .performers-section h3 {
    margin-bottom: 2rem;
    color: #123345;
    font-size: 1.5rem;
    font-weight: 600;
  }

  .performers-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;
  }

  .performer-category h4 {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #123345;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 0.5rem;
  }

  .performer-category ul {
    list-style: none;
    padding: 0;
  }

  .performer-category li {
    padding: 0.5rem 0;
    border-bottom: 1px solid #f1f5f9;
    color: #123345;
  }

  .loading, .error {
    text-align: center;
    padding: 3rem;
    font-size: 1.125rem;
  }

  .loading {
    color: #123345;
  }

  .error {
    color: #ff2600;
    background: #fed7d7;
    border-radius: 8px;
    border: 1px solid #feb2b2;
  }

  @media (max-width: 768px) {

    .hero-title {
      font-size: 2rem;
    }

    .hero-subtitle {
      font-size: 1rem;
    }

    .nav-grid {
      grid-template-columns: 1fr;
    }

    .stats-grid {
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    }

    .chart-section {
      padding: 1rem;
    }

    .chart-scroll-wrapper {
      /* Add scrollbar styling for better UX */
      scrollbar-width: thin;
      scrollbar-color: #123345 #f1f5f9;
    }

    .chart-scroll-wrapper::-webkit-scrollbar {
      height: 8px;
    }

    .chart-scroll-wrapper::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 4px;
    }

    .chart-scroll-wrapper::-webkit-scrollbar-thumb {
      background: #123345;
      border-radius: 4px;
    }

    .chart-scroll-wrapper::-webkit-scrollbar-thumb:hover {
      background: #1a4d66;
    }

    .chart {
      min-width: 1000px; /* Increase minimum width on mobile for better chart readability */
    }

    .chart-bar {
      min-width: 60px; /* Ensure bars have minimum width for touch interaction */
    }

    .chart-label {
      font-size: 0.6rem;
    }

    .chart-legend {
      gap: 1rem;
    }

    .chart-scroll-hint {
      display: block;
    }

    .distribution-section {
      grid-template-columns: 1fr;
    }

    .performers-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
