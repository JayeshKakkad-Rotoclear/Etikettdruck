import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { UserRole } from '../../app.d.ts';

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false
};

export const authStore = writable<AuthState>(initialState);

export class AuthService {
  static async login(identifier: string, password: string, stayLoggedIn: boolean = false): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ identifier, password, stayLoggedIn })
      });

      const data = await response.json();

      if (data.success) {
        authStore.update(state => ({
          ...state,
          user: data.user,
          isAuthenticated: true,
          isLoading: false
        }));
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Anmeldung fehlgeschlagen' };
      }
    } catch (error) {
      return { success: false, error: 'Verbindungsfehler' };
    }
  }

  static async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    authStore.set({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
  }

  static async checkAuth(): Promise<void> {
    if (!browser) return;

    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        authStore.update(state => ({
          ...state,
          user: data.user,
          isAuthenticated: true,
          isLoading: false
        }));
      } else {
        authStore.update(state => ({
          ...state,
          user: null,
          isAuthenticated: false,
          isLoading: false
        }));
      }
    } catch (error) {
      authStore.update(state => ({
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false
      }));
    }
  }

  static hasRole(requiredRole: User['role']): boolean {
    const roleHierarchy = {
      'VIEWER': 0,
      'PRUEFER_B': 1,
      'PRUEFER_A': 2,
      'PRUEFER_AB': 3,
      'MANAGEMENT': 4,
      'ADMIN': 5
    };

    let currentRole: User['role'] = 'VIEWER';
    authStore.subscribe(state => {
      if (state.user) {
        currentRole = state.user.role;
      }
    })();

    return roleHierarchy[currentRole] >= roleHierarchy[requiredRole];
  }
}
