<script lang="ts">
  import { Icon } from '$lib';
  
  const iconList = [
    'key', 'delete', 'warning', 'folder', 'printer', 'save', 
    'chevronDown', 'chevronRight', 'user', 'home', 'settings',
    'plus', 'edit', 'info', 'check', 'x', 'search', 'download',
    'upload', 'grid', 'menu', 'lock', 'unlock', 'eye', 'eyeOff',
    'refresh', 'copy'
  ];
</script>

<svelte:head>
  <title>Icon System - Etikettdrucker</title>
</svelte:head>

<div class="icons-demo">
  <div class="header">
    <h1>Icon System</h1>
    <p>Übersicht aller verfügbaren SVG-Icons im System</p>
  </div>

  <div class="icon-grid">
    {#each iconList as iconName}
      <div class="icon-card">
        <div class="icon-display">
          <Icon name={iconName} size={24} />
        </div>
        <div class="icon-info">
          <span class="icon-name">{iconName}</span>
          <code>&lt;Icon name="{iconName}" /&gt;</code>
        </div>
      </div>
    {/each}
  </div>

  <div class="usage-examples">
    <h2>Verwendungsbeispiele</h2>
    
    <div class="example-section">
      <h3>Icon-Buttons</h3>
      <div class="button-examples">
        <button class="icon-button">
          <Icon name="plus" size={16} />
          Hinzufügen
        </button>
        
        <button class="icon-button danger">
          <Icon name="delete" size={16} />
          Löschen
        </button>
        
        <button class="icon-button success">
          <Icon name="check" size={16} />
          Speichern
        </button>
        
        <button class="icon-button secondary">
          <Icon name="search" size={16} />
          Suchen
        </button>
        
        <button class="icon-only">
          <Icon name="settings" size={18} />
        </button>
      </div>
    </div>

    <div class="example-section">
      <h3>Verschiedene Größen</h3>
      <div class="size-examples">
        <Icon name="user" size={12} />
        <Icon name="user" size={16} />
        <Icon name="user" size={20} />
        <Icon name="user" size={24} />
        <Icon name="user" size={32} />
      </div>
    </div>

    <div class="example-section">
      <h3>Verschiedene Farben</h3>
      <div class="color-examples">
        <Icon name="warning" size={24} color="#f59e0b" />
        <Icon name="check" size={24} color="#16a34a" />
        <Icon name="x" size={24} color="#dc2626" />
        <Icon name="info" size={24} color="#3b82f6" />
      </div>
    </div>
  </div>
</div>

<style>
  .icons-demo {
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--spacing-xl);
  }

  .header {
    text-align: center;
    margin-bottom: var(--spacing-xl);
  }

  .header h1 {
    font-size: var(--font-size-3xl);
    color: var(--primary-color);
    margin-bottom: var(--spacing-sm);
  }

  .header p {
    color: var(--text-muted);
    font-size: var(--font-size-lg);
  }

  .icon-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-xl);
  }

  .icon-card {
    background: var(--white);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-lg);
    padding: var(--spacing-lg);
    box-shadow: var(--shadow-sm);
    transition: all var(--transition-fast) ease;
  }

  .icon-card:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  .icon-display {
    display: flex;
    justify-content: center;
    margin-bottom: var(--spacing-md);
    padding: var(--spacing-lg);
    background: var(--bg-light);
    border-radius: var(--border-radius-md);
  }

  .icon-info {
    text-align: center;
  }

  .icon-name {
    display: block;
    font-weight: 600;
    margin-bottom: var(--spacing-xs);
    color: var(--text-primary);
  }

  code {
    background: var(--bg-card);
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--border-radius-sm);
    font-size: var(--font-size-sm);
    color: var(--text-muted);
    border: 1px solid var(--border-light);
  }

  .usage-examples {
    background: var(--white);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-lg);
    padding: var(--spacing-xl);
    box-shadow: var(--shadow-sm);
  }

  .usage-examples h2 {
    color: var(--primary-color);
    margin-bottom: var(--spacing-lg);
    font-size: var(--font-size-xl);
  }

  .example-section {
    margin-bottom: var(--spacing-xl);
  }

  .example-section h3 {
    color: var(--text-secondary);
    margin-bottom: var(--spacing-md);
    font-size: var(--font-size-lg);
  }

  .button-examples {
    display: flex;
    gap: var(--spacing-md);
    flex-wrap: wrap;
  }

  .size-examples {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
  }

  .color-examples {
    display: flex;
    gap: var(--spacing-lg);
    align-items: center;
  }

  @media (max-width: 768px) {
    .icons-demo {
      padding: var(--spacing-lg);
    }

    .icon-grid {
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: var(--spacing-md);
    }

    .button-examples {
      flex-direction: column;
      align-items: flex-start;
    }

    .size-examples,
    .color-examples {
      flex-wrap: wrap;
    }
  }
</style>
