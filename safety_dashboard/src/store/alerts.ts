import { create } from 'zustand';
import { AlertState, Alert, AlertFilters, CreateAlertForm, UpdateAlertForm } from '@/types';
import apiClient from '@/services/api';

export const useAlertStore = create<AlertState>((set, get) => ({
  alerts: [],
  selectedAlert: null,
  filters: {},
  isLoading: false,
  error: null,

  fetchAlerts: async (filters?: AlertFilters) => {
    set({ isLoading: true, error: null });
    
    try {
      const alerts = await apiClient.getAlerts(filters);
      set({
        alerts,
        isLoading: false,
        error: null,
        filters: filters || {},
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch alerts',
        isLoading: false,
      });
    }
  },

  createAlert: async (data: CreateAlertForm) => {
    set({ isLoading: true, error: null });
    
    try {
      const newAlert = await apiClient.createAlert(data);
      const { alerts } = get();
      set({
        alerts: [newAlert, ...alerts],
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create alert',
        isLoading: false,
      });
      throw error;
    }
  },

  updateAlert: async (id: string, data: UpdateAlertForm) => {
    set({ isLoading: true, error: null });
    
    try {
      const updatedAlert = await apiClient.updateAlert(id, data);
      const { alerts } = get();
      set({
        alerts: alerts.map(alert => alert.id === id ? updatedAlert : alert),
        selectedAlert: get().selectedAlert?.id === id ? updatedAlert : get().selectedAlert,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update alert',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteAlert: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      await apiClient.deleteAlert(id);
      const { alerts } = get();
      set({
        alerts: alerts.filter(alert => alert.id !== id),
        selectedAlert: get().selectedAlert?.id === id ? null : get().selectedAlert,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete alert',
        isLoading: false,
      });
      throw error;
    }
  },

  setSelectedAlert: (alert: Alert | null) => {
    set({ selectedAlert: alert });
  },

  setFilters: (filters: AlertFilters) => {
    set({ filters });
  },

  clearError: () => set({ error: null }),
}));
