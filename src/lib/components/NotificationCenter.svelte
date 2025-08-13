<script lang="ts">
  import { fade, slide } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import { notificationStore, notificationCenterOpen, unreadCount, type Notification } from '$lib/stores/notifications';
  import { Icon } from '$lib';
  import { formatDistanceToNow } from 'date-fns';
  import { de } from 'date-fns/locale';

  $: notifications = $notificationStore;
  $: isOpen = $notificationCenterOpen;
  $: unread = $unreadCount;

  // Mobile detection
  let isMobile = false;
  let touchStartY = 0;
  let touchStartX = 0;

  // Check if device is mobile on mount
  function checkMobile() {
    isMobile = window.innerWidth <= 480 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  function toggleCenter() {
    notificationCenterOpen.update(open => !open);
    
    // Mark all as read when opening
    if (!$notificationCenterOpen) {
      setTimeout(() => {
        notificationStore.markAllAsRead();
      }, 500);
    }
  }

  function handleNotificationClick(notification: Notification) {
    if (!notification.isRead) {
      notificationStore.markAsRead(notification.id);
    }
  }

  function removeNotification(id: string, event: Event) {
    event.stopPropagation();
    notificationStore.remove(id);
  }

  function clearAllNotifications() {
    notificationStore.clear();
  }

  function getNotificationIcon(type: Notification['type']): string {
    switch (type) {
      case 'success': return 'checkCircle';
      case 'error': return 'xCircle';
      case 'warning': return 'alertTriangle';
      case 'info': return 'info';
      default: return 'info';
    }
  }

  function formatTimestamp(date: Date): string {
    return formatDistanceToNow(date, { 
      addSuffix: true, 
      locale: de 
    });
  }

  // Close notification center when clicking outside
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.notification-center') && !target.closest('.notification-trigger')) {
      notificationCenterOpen.set(false);
    }
  }

  // Mobile touch handling for swipe-to-dismiss
  function handleTouchStart(event: TouchEvent, notificationId?: string) {
    touchStartY = event.touches[0].clientY;
    touchStartX = event.touches[0].clientX;
  }

  function handleTouchEnd(event: TouchEvent, notificationId?: string) {
    if (!touchStartY || !touchStartX) return;

    const touchEndY = event.changedTouches[0].clientY;
    const touchEndX = event.changedTouches[0].clientX;
    const deltaY = touchStartY - touchEndY;
    const deltaX = touchStartX - touchEndX;

    // Detect swipe down to close notification center (mobile only)
    if (isMobile && !notificationId && deltaY < -50 && Math.abs(deltaX) < 100) {
      notificationCenterOpen.set(false);
    }
    
    // Detect swipe left to remove notification (mobile only)
    if (isMobile && notificationId && deltaX > 80 && Math.abs(deltaY) < 50) {
      notificationStore.remove(notificationId);
    }

    touchStartY = 0;
    touchStartX = 0;
  }

  // Handle escape key
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && isOpen) {
      notificationCenterOpen.set(false);
    }
  }
</script>

<svelte:window 
  on:click={handleClickOutside} 
  on:keydown={handleKeydown}
  on:resize={checkMobile}
  on:load={checkMobile}
/>

<div class="notification-wrapper">
  <!-- Notification Center Trigger Button -->
  <button 
    type="button" 
    class="notification-trigger"
    class:active={isOpen}
    on:click={toggleCenter}
    aria-label="Benachrichtigungen {isOpen ? 'schließen' : 'öffnen'}"
    title="Benachrichtigungen"
  >
    <Icon name="bell" size={20} />
    {#if unread > 0 && !isOpen}
      <span class="notification-badge" transition:fade={{ duration: 200 }}>
        {unread > 99 ? '99+' : unread}
      </span>
    {/if}
  </button>

  <!-- Notification Center Panel -->
  {#if isOpen}
    <div 
      class="notification-center"
      class:mobile={isMobile}
      transition:slide={{ duration: 300, axis: 'y' }}
      on:touchstart={(e) => handleTouchStart(e)}
      on:touchend={(e) => handleTouchEnd(e)}
    >
      <!-- Header -->
      <div class="notification-header">
        <h3 class="notification-title">Benachrichtigungen</h3>
        <div class="notification-actions">
          {#if notifications.length > 0}
            <button 
              type="button" 
              class="action-button"
              on:click={clearAllNotifications}
              title="Alle löschen"
            >
              <Icon name="delete" size={16} />
            </button>
          {/if}
          <button 
            type="button" 
            class="action-button"
            on:click={toggleCenter}
            title="Schließen"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      </div>

      <!-- Notifications List -->
      <div class="notification-list">
        {#if notifications.length === 0}
          <div class="empty-state">
            <Icon name="bell" size={isMobile ? 36 : 48} color="var(--text-muted)" />
            <p class="empty-message">Keine Benachrichtigungen</p>
            {#if isMobile}
              <p class="empty-hint">Nach unten wischen zum Schließen</p>
            {/if}
          </div>
        {:else}
          {#if isMobile && notifications.length > 0}
            <div class="mobile-hint">
              <p>💡 Nach links wischen um Benachrichtigungen zu löschen</p>
            </div>
          {/if}
          {#each notifications as notification (notification.id)}
            <div 
              class="notification-item"
              class:unread={!notification.isRead}
              class:type-success={notification.type === 'success'}
              class:type-error={notification.type === 'error'}
              class:type-warning={notification.type === 'warning'}
              class:type-info={notification.type === 'info'}
              role="button"
              tabindex="0"
              on:click={() => handleNotificationClick(notification)}
              on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && handleNotificationClick(notification)}
              on:touchstart={(e) => handleTouchStart(e, notification.id)}
              on:touchend={(e) => handleTouchEnd(e, notification.id)}
              animate:flip={{ duration: 200 }}
              transition:slide={{ duration: 200 }}
              title="{isMobile ? 'Antippen um als gelesen zu markieren. Nach links wischen um zu löschen.' : 'Klicken um als gelesen zu markieren'}"
            >
              <div class="notification-icon">
                <Icon 
                  name={getNotificationIcon(notification.type)} 
                  size={18}
                  color="currentColor"
                />
              </div>
              
              <div class="notification-content">
                <div class="notification-main">
                  <h4 class="notification-item-title">{notification.title}</h4>
                  <p class="notification-message">{notification.message}</p>
                </div>
                <div class="notification-meta">
                  <span class="notification-time">
                    {formatTimestamp(notification.timestamp)}
                  </span>
                  {#if !notification.isRead}
                    <span class="unread-indicator" title="Ungelesen"></span>
                  {/if}
                </div>
              </div>
              
              <button 
                type="button" 
                class="remove-button"
                on:click={(e) => removeNotification(notification.id, e)}
                title="Benachrichtigung entfernen"
              >
                <Icon name="close" size={14} />
              </button>
            </div>
          {/each}
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .notification-wrapper {
    position: relative;
    z-index: 1050;
  }

  /* Trigger Button */
  .notification-trigger {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: none;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: var(--border-radius-md);
    cursor: pointer;
    transition: all var(--transition-smooth);
    color: var(--white);
  }

  .notification-trigger:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.4);
    transform: translateY(-1px);
  }

  .notification-trigger.active {
    background: var(--primary-color);
    color: var(--white);
  }

  /* Notification Badge */
  .notification-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 18px;
    padding: 0 4px;
    background: var(--danger-color);
    color: var(--white);
    border-radius: 9px;
    font-size: 10px;
    font-weight: var(--font-weight-semibold);
    line-height: 1;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }

  /* Notification Center Panel */
  .notification-center {
    position: absolute;
    top: calc(100% + 17px);
    right: 0;
    width: 380px;
    max-height: 600px;
    background: var(--white);
    border: 1px solid var(--border-light);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-lg);
    overflow: hidden;
    z-index: 1051;
    transform-origin: top right;
  }

  .notification-center.mobile {
    position: fixed;
    top: 70px !important;
    right: 10px;
    left: 10px;
    width: auto;
    transform-origin: top center;
  }

  /* Header */
  .notification-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-md) var(--spacing-lg);
    background: var(--bg-light);
    border-bottom: 1px solid var(--border-light);
  }

  .notification-title {
    margin: 0;
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
  }

  .notification-actions {
    display: flex;
    gap: var(--spacing-xs);
  }

  .action-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    border-radius: var(--border-radius-sm);
    cursor: pointer;
    transition: all var(--transition-smooth);
    color: var(--text-muted);
  }

  .action-button:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  /* Notifications List */
  .notification-list {
    max-height: 500px;
    overflow-y: auto;
  }

  .notification-list::-webkit-scrollbar {
    width: 6px;
  }

  .notification-list::-webkit-scrollbar-track {
    background: var(--bg-light);
  }

  .notification-list::-webkit-scrollbar-thumb {
    background: var(--border-medium);
    border-radius: 3px;
  }

  .notification-list::-webkit-scrollbar-thumb:hover {
    background: var(--border-color);
  }

  /* Empty State */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-2xl);
    text-align: center;
  }

  .empty-message {
    margin: var(--spacing-md) 0 0;
    color: var(--text-muted);
    font-size: var(--font-size-sm);
  }

  .empty-hint {
    margin: var(--spacing-xs) 0 0;
    color: var(--text-muted);
    font-size: var(--font-size-xs);
    font-style: italic;
  }

  .mobile-hint {
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--primary-light);
    border-bottom: 1px solid var(--border-light);
    text-align: center;
  }

  .mobile-hint p {
    margin: 0;
    font-size: var(--font-size-xs);
    color: var(--primary-color);
    font-weight: var(--font-weight-medium);
  }

  /* Notification Item */
  .notification-item {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-md);
    padding: var(--spacing-md) var(--spacing-lg);
    border-bottom: 1px solid var(--border-light);
    cursor: pointer;
    transition: all var(--transition-smooth);
    position: relative;
  }

  .notification-item:hover {
    background: var(--bg-hover);
  }

  .notification-item:last-child {
    border-bottom: none;
  }

  .notification-item.unread {
    background: rgba(37, 99, 235, 0.02);
    border-left: 3px solid var(--primary-color);
  }

  /* Notification Icon */
  .notification-icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: var(--border-radius-md);
    margin-top: 2px;
  }

  .type-success .notification-icon {
    background: var(--success-color);
    color: var(--white);
  }

  .type-error .notification-icon {
    background: var(--danger-color);
    color: var(--white);
  }

  .type-warning .notification-icon {
    background: var(--warning-color);
    color: var(--white);
  }

  .type-info .notification-icon {
    background: var(--info-color);
    color: var(--white);
  }

  /* Notification Content */
  .notification-content {
    flex: 1;
    min-width: 0;
  }

  .notification-main {
    margin-bottom: var(--spacing-xs);
  }

  .notification-item-title {
    margin: 0 0 var(--spacing-xs);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
    line-height: 1.4;
  }

  .notification-message {
    margin: 0;
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
    line-height: 1.4;
    word-wrap: break-word;
  }

  .notification-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: var(--spacing-xs);
  }

  .notification-time {
    font-size: var(--font-size-xs);
    color: var(--text-muted);
  }

  .unread-indicator {
    width: 8px;
    height: 8px;
    background: var(--primary-color);
    border-radius: 50%;
    flex-shrink: 0;
  }

  /* Remove Button */
  .remove-button {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border: none;
    background: transparent;
    border-radius: var(--border-radius-sm);
    cursor: pointer;
    transition: all var(--transition-smooth);
    color: var(--text-muted);
    opacity: 0;
    margin-top: 4px;
  }

  .notification-item:hover .remove-button {
    opacity: 1;
  }

  .remove-button:hover {
    background: var(--danger-color);
    color: var(--white);
  }

  /* Enhanced Responsive Design */
  @media (max-width: 1024px) {
    .notification-center {
      width: 360px;
      max-height: 500px;
    }
  }

  @media (max-width: 768px) {
    .notification-trigger {
      width: 36px;
      height: 36px;
    }

    .notification-badge {
      top: -3px;
      right: -3px;
      min-width: 16px;
      height: 16px;
      font-size: 9px;
    }

    .notification-center {
      width: 340px;
      right: -60px;
      max-height: 450px;
      border-radius: var(--border-radius-md);
    }

    .notification-header {
      padding: var(--spacing-sm) var(--spacing-md);
    }

    .notification-title {
      font-size: var(--font-size-base);
    }

    .action-button {
      width: 28px;
      height: 28px;
    }

    .notification-item {
      gap: var(--spacing-sm);
      padding: var(--spacing-sm) var(--spacing-md);
    }

    .notification-icon {
      width: 28px;
      height: 28px;
    }

    .notification-item-title {
      font-size: var(--font-size-xs);
    }

    .notification-message {
      font-size: 11px;
    }

    .notification-time {
      font-size: 10px;
    }

    .remove-button {
      width: 20px;
      height: 20px;
      opacity: 1; /* Always visible on mobile for better UX */
    }

    .empty-state {
      padding: var(--spacing-xl);
    }
  }

  @media (max-width: 640px) {
    .notification-center {
      width: 320px;
      right: -100px;
      max-height: 400px;
    }

    .notification-list {
      max-height: 320px;
    }
  }

  @media (max-width: 480px) {
    .notification-trigger {
      width: 32px;
      height: 32px;
    }

    .notification-badge {
      top: -2px;
      right: -2px;
      min-width: 14px;
      height: 14px;
      font-size: 8px;
    }

    .notification-center {
      position: fixed;
      top: 60px !important;
      right: 10px;
      left: 10px;
      width: auto;
      max-width: none;
      max-height: calc(100vh - 80px);
      border-radius: var(--border-radius-lg);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    }

    .notification-header {
      padding: var(--spacing-md);
      position: sticky;
      top: 0;
      background: var(--white);
      z-index: 10;
      border-bottom: 2px solid var(--border-light);
    }

    .notification-title {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-bold);
    }

    .notification-list {
      max-height: calc(100vh - 160px);
      padding-bottom: var(--spacing-sm);
    }

    .notification-item {
      padding: var(--spacing-md);
      gap: var(--spacing-md);
      border-bottom: 1px solid var(--border-light);
      border-radius: 0;
    }

    .notification-item:active {
      background: var(--primary-light);
    }

    .notification-icon {
      width: 24px;
      height: 24px;
    }

    .notification-content {
      flex: 1;
    }

    .notification-item-title {
      font-size: var(--font-size-sm);
      margin-bottom: var(--spacing-xs);
      line-height: 1.3;
    }

    .notification-message {
      font-size: var(--font-size-xs);
      line-height: 1.4;
      margin-bottom: var(--spacing-xs);
    }

    .notification-meta {
      margin-top: var(--spacing-xs);
    }

    .notification-time {
      font-size: var(--font-size-xs);
    }

    .remove-button {
      width: 28px;
      height: 28px;
      background: var(--bg-light);
      border: 1px solid var(--border-light);
      border-radius: var(--border-radius-sm);
    }

    .remove-button:hover,
    .remove-button:active {
      background: var(--danger-color);
      border-color: var(--danger-color);
    }

    .empty-state {
      padding: var(--spacing-2xl) var(--spacing-lg);
    }

    .empty-message {
      font-size: var(--font-size-sm);
    }

    /* Mobile-specific touch improvements */
    .notification-item {
      -webkit-tap-highlight-color: rgba(37, 99, 235, 0.1);
    }

    .action-button,
    .remove-button,
    .notification-trigger {
      -webkit-tap-highlight-color: transparent;
      min-height: 44px; /* iOS minimum touch target */
      min-width: 44px;
    }
  }

  @media (max-width: 360px) {
    .notification-center {
      right: 5px;
      left: 5px;
    }

    .notification-header {
      padding: var(--spacing-sm);
    }

    .notification-item {
      padding: var(--spacing-sm);
      gap: var(--spacing-sm);
    }

    .notification-icon {
      width: 20px;
      height: 20px;
    }

    .remove-button {
      width: 24px;
      height: 24px;
    }
  }

  /* High DPI / Retina Display optimizations */
  @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
    .notification-center {
      border-width: 0.5px;
    }

    .notification-item {
      border-bottom-width: 0.5px;
    }

    .notification-header {
      border-bottom-width: 0.5px;
    }
  }

  /* Dark mode support preparation */
  @media (prefers-color-scheme: dark) {
    .notification-trigger {
      background: rgba(0, 0, 0, 0.2);
      border-color: rgba(255, 255, 255, 0.1);
    }

    .notification-trigger:hover {
      background: rgba(0, 0, 0, 0.3);
      border-color: rgba(255, 255, 255, 0.2);
    }
  }

  /* Reduced motion preference */
  @media (prefers-reduced-motion: reduce) {
    .notification-trigger,
    .notification-item,
    .action-button,
    .remove-button {
      transition: none;
    }

    .notification-badge {
      animation: none;
    }
  }

  /* Print styles */
  @media print {
    .notification-wrapper {
      display: none;
    }
  }
</style>
