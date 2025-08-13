import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  autoClose?: boolean;
  duration?: number; 
}

// Create the notifications store
function createNotificationStore() {
  const { subscribe, set, update } = writable<Notification[]>([]);

  // Load notifications from localStorage on initialization
  if (browser) {
    const stored = localStorage.getItem('etikettdrucker_notifications');
    if (stored) {
      try {
        const notifications = JSON.parse(stored).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        set(notifications);
      } catch (e) {
      }
    }
  }

  return {
    subscribe,
    
    // Add a new notification
    add: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
      const newNotification: Notification = {
        ...notification,
        id: crypto.randomUUID(),
        timestamp: new Date(),
        isRead: false,
        autoClose: notification.autoClose ?? true,
        duration: notification.duration ?? (notification.type === 'error' ? 8000 : 5000)
      };

      update(notifications => {
        const updated = [newNotification, ...notifications];
        // Keep only last 100 notifications to prevent memory issues
        const trimmed = updated.slice(0, 100);
        
        // Save to localStorage
        if (browser) {
          localStorage.setItem('etikettdrucker_notifications', JSON.stringify(trimmed));
        }
        
        return trimmed;
      });

      // Auto-close notification if enabled
      if (newNotification.autoClose && newNotification.duration) {
        setTimeout(() => {
          notificationStore.remove(newNotification.id);
        }, newNotification.duration);
      }

      return newNotification.id;
    },

    // Mark notification as read
    markAsRead: (id: string) => {
      update(notifications => {
        const updated = notifications.map(n => 
          n.id === id ? { ...n, isRead: true } : n
        );
        
        if (browser) {
          localStorage.setItem('etikettdrucker_notifications', JSON.stringify(updated));
        }
        
        return updated;
      });
    },

    // Mark all notifications as read
    markAllAsRead: () => {
      update(notifications => {
        const updated = notifications.map(n => ({ ...n, isRead: true }));
        
        if (browser) {
          localStorage.setItem('etikettdrucker_notifications', JSON.stringify(updated));
        }
        
        return updated;
      });
    },

    // Remove a notification
    remove: (id: string) => {
      update(notifications => {
        const updated = notifications.filter(n => n.id !== id);
        
        if (browser) {
          localStorage.setItem('etikettdrucker_notifications', JSON.stringify(updated));
        }
        
        return updated;
      });
    },

    // Clear all notifications
    clear: () => {
      set([]);
      if (browser) {
        localStorage.removeItem('etikettdrucker_notifications');
      }
    },

    // Helper methods for different notification types
    success: (title: string, message: string, options?: Partial<Notification>) => {
      return notificationStore.add({ type: 'success', title, message, ...options });
    },

    error: (title: string, message: string, options?: Partial<Notification>) => {
      return notificationStore.add({ type: 'error', title, message, ...options });
    },

    warning: (title: string, message: string, options?: Partial<Notification>) => {
      return notificationStore.add({ type: 'warning', title, message, ...options });
    },

    info: (title: string, message: string, options?: Partial<Notification>) => {
      return notificationStore.add({ type: 'info', title, message, ...options });
    }
  };
}

export const notificationStore = createNotificationStore();

// Derived store for unread notifications count
export const unreadCount = derived(
  notificationStore,
  $notifications => $notifications.filter(n => !n.isRead).length
);

// Derived store for unread notifications
export const unreadNotifications = derived(
  notificationStore,
  $notifications => $notifications.filter(n => !n.isRead)
);

// Store for notification center visibility
export const notificationCenterOpen = writable(false);
