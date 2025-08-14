"use client";
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthState, RegisterData } from '@/types';
import apiClient from '@/services/api';

// Create a stable initial state for SSR
const initialState = {
  user: null,
  access_token: null,
  refresh_token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  _hasHydrated: false,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.login(email, password);
          set({
            user: response.data.user,
            access_token: response.data.access_token,
            refresh_token: response.data.refresh_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false,
          });
          throw error;
        }
      },
      
      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.register(data);
          set({
            user: response.user,
            access_token: response.access_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Registration failed',
            isLoading: false,
          });
          throw error;
        }
      },
      
      logout: () => {
        apiClient.logout();
        set({
          user: null,
          access_token: null,
          refresh_token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },
      
      getCurrentUser: async () => {
        const { access_token } = get();
        if (!access_token) {
          set({ isLoading: false, isAuthenticated: false });
          return;
        }
        
        set({ isLoading: true });
        try {
          const { user } = await apiClient.getCurrentUser();
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to get user',
            isLoading: false,
            user: null,
            access_token: null,
            refresh_token: null,
            isAuthenticated: false,
          });
        }
      },
      
      // Initialize auth state - now synchronous initial check
      initializeAuth: async () => {
        const { access_token, user, _hasHydrated } = get();
        
        // Only proceed if we've hydrated from storage
        if (!_hasHydrated) return;
        
        if (access_token && user) {
          // Validate token by getting current user
          await get().getCurrentUser();
        } else {
          set({ isLoading: false, isAuthenticated: false });
        }
      },
      
      // Mark as hydrated
      setHasHydrated: (hasHydrated: boolean) => {
        set({ _hasHydrated: hasHydrated });
      },
      
      // Set loading state manually
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => {
        // Safe storage for SSR
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
      partialize: (state) => ({
        user: state.user,
        access_token: state.access_token,
        refresh_token: state.refresh_token,
        isAuthenticated: state.isAuthenticated,
      }),
      // Provide a stable server snapshot
      getServerSnapshot: () => initialState,
      onRehydrateStorage: () => (state) => {
        // Mark as hydrated and then initialize
        if (state) {
          state.setHasHydrated(true);
          // Don't await this - let it run in background
          state.initializeAuth().catch(console.error);
        }
      },
    }
  )
);