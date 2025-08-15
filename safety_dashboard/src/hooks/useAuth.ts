import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store';

export function useAuth() {
  const [isClient, setIsClient] = useState(false);
  
  // Wait for client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const authState = useAuthStore((state) => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    _hasHydrated: state._hasHydrated,
    login: state.login,
    register: state.register,
    logout: state.logout,
    getCurrentUser: state.getCurrentUser,
    clearError: state.clearError,
  }));
  
  // Return stable state during SSR and before hydration
  if (!isClient || !authState._hasHydrated) {
    return {
      user: null,
      isAuthenticated: false,
      isLoading: true, // Show loading during hydration
      error: null,
      _hasHydrated: false,
      login: authState.login,
      register: authState.register,
      logout: authState.logout,
      getCurrentUser: authState.getCurrentUser,
      clearError: authState.clearError,
    };
  }
  
  return authState;
}