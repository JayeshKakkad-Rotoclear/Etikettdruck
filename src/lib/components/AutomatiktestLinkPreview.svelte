<script lang="ts">
  import { Icon, notificationStore } from '$lib';
  export let link: string = '';
  let copied = false;

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      copied = true;
      setTimeout(() => (copied = false), 1500);
      notificationStore.success('Link kopiert', 'Automatiktest Link in Zwischenablage.');
    } catch (e) {
      notificationStore.error('Kopieren fehlgeschlagen', 'Link konnte nicht kopiert werden.');
    }
  }
</script>

<div class="atk-container">
  <div class="atk-header">
    <span class="atk-title">Automatiktest Referenz</span>
    <div class="atk-actions">
      <button type="button" class="btn ghost" on:click={copy} aria-label="Link kopieren">
        <Icon name="copy" size={18} />
        <span>{copied ? 'Kopiert!' : 'Kopieren'}</span>
      </button>
      <a class="btn primary" href={link} target="_blank" rel="noopener noreferrer" aria-label="Link öffnen">
        <Icon name="external" size={18} color='white' />
        <span>Öffnen</span>
      </a>
    </div>
  </div>
  <div class="atk-body">
    <input class="atk-link" readonly value={link} />
  </div>
</div>

<style>
  .atk-container {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    border: 1px solid var(--border-light);
    border-radius: var(--border-radius-lg);
    padding: var(--spacing-lg);
    background: var(--bg-light);
  }
  .atk-header { display:flex; align-items:center; justify-content:space-between; gap: var(--spacing-lg); flex-wrap:wrap; }
  .atk-title { font-size: var(--font-size-lg); font-weight: var(--font-weight-semibold); color: var(--text-primary); }
  .atk-actions { display:flex; gap: var(--spacing-sm); }
  .btn { display:inline-flex; align-items:center; gap: var(--spacing-xs); font-size: var(--font-size-sm); font-weight: var(--font-weight-medium); padding: var(--spacing-sm) var(--spacing-md); border-radius: var(--border-radius-md); cursor:pointer; text-decoration:none; line-height:1; border:1px solid transparent; transition: background .2s, border-color .2s, color .2s; }
  .btn.ghost { background: var(--white); border-color: var(--border-light); color: var(--text-primary); }
  .btn.ghost:hover { background: var(--bg-subtle); }
  .btn.primary { background: var(--primary-color); color: var(--white); }
  .btn.primary:hover { background: var(--primary-hover); }
  .atk-body { display:flex; }
  .atk-link { flex:1; padding: var(--spacing-md) var(--spacing-lg); border:1px solid var(--border-medium); border-radius: var(--border-radius-md); background: var(--white); font-family: monospace; font-size: var(--font-size-sm); overflow:hidden; text-overflow:ellipsis; }
  .atk-link:focus { outline:none; border-color: var(--primary-color); box-shadow:0 0 0 3px var(--primary-light); }
  @media (max-width: 640px) { .atk-actions { width:100%; justify-content:flex-start; } }
</style>