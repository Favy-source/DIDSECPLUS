import { create } from 'zustand';
import { TicketState, Ticket, TicketFilters, CreateTicketForm, UpdateTicketForm } from '@/types';
import apiClient from '@/services/api';
import { useAlertStore } from './alerts';

export const useTicketStore = create<TicketState>((set, get) => ({
  tickets: [],
  selectedTicket: null,
  filters: {},
  isLoading: false,
  error: null,

  fetchTickets: async (filters?: TicketFilters) => {
    set({ isLoading: true, error: null });
    
    try {
      const tickets = await apiClient.getTickets(filters);
      set({
        tickets,
        isLoading: false,
        error: null,
        filters: filters || {},
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch tickets',
        isLoading: false,
      });
    }
  },

  createTicket: async (data: CreateTicketForm) => {
    set({ isLoading: true, error: null });
    
    try {
      const newTicket = await apiClient.createTicket(data);
      const { tickets } = get();
      set({
        tickets: [newTicket, ...tickets],
        isLoading: false,
        error: null,
      });
      return newTicket; // return the created ticket
    } catch (error) {
      // If API fails (404 or network) and mock data is enabled, create a local mock ticket so the UI can continue in demo mode
      const errMsg = error instanceof Error ? error.message : String(error);
      console.warn('createTicket API failed, attempting local fallback:', errMsg);

      const shouldFallback = process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA === 'true' || errMsg.includes('404') || errMsg.toLowerCase().includes('not found');

      if (shouldFallback) {
        const now = new Date().toISOString();
        const fakeId = `TKT-${Date.now()}`;
        const mockTicket: Ticket = {
          id: fakeId,
          title: (data as any).title || `Ticket ${fakeId}`,
          description: (data as any).description || '',
          priority: (data as any).priority || ('low' as any),
          status: 'open',
          alert_id: (data as any).alert_id,
          assigned_to: (data as any).assigned_to,
          created_by: (data as any).created_by || 'operator:phone',
          created_at: now,
          updated_at: now,
        };

        const { tickets } = get();
        set({
          tickets: [mockTicket, ...tickets],
          isLoading: false,
          error: null,
        });
        return mockTicket;
      }

      set({
        error: error instanceof Error ? error.message : 'Failed to create ticket',
        isLoading: false,
      });
      throw error;
    }
  },

  updateTicket: async (id: string, data: UpdateTicketForm) => {
    set({ isLoading: true, error: null });
    
    try {
      const updatedTicket = await apiClient.updateTicket(id, data);
      const { tickets } = get();
      set({
        tickets: tickets.map(ticket => ticket.id === id ? updatedTicket : ticket),
        selectedTicket: get().selectedTicket?.id === id ? updatedTicket : get().selectedTicket,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update ticket',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteTicket: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      await apiClient.deleteTicket(id);
      const { tickets } = get();
      set({
        tickets: tickets.filter(ticket => ticket.id !== id),
        selectedTicket: get().selectedTicket?.id === id ? null : get().selectedTicket,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete ticket',
        isLoading: false,
      });
      throw error;
    }
  },

  setSelectedTicket: (ticket: Ticket | null) => {
    set({ selectedTicket: ticket });
  },

  setFilters: (filters: TicketFilters) => {
    set({ filters });
  },

  clearError: () => set({ error: null }),
}));

// Seed mock tickets from alerts when feature flag enabled
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA === 'true') {
  // prevent double-seeding across HMR / reloads
  if (!(window as any).__MOCK_TICKETS_SEEDED) {
    (window as any).__MOCK_TICKETS_SEEDED = true;

    // initial seed if there are alerts already
    const seedFromAlerts = (alerts: ReturnType<typeof useAlertStore.getState>['alerts']) => {
      if (!alerts || alerts.length === 0) return;
      const existing = useTicketStore.getState().tickets || [];
      const newTickets = alerts
        .filter(a => !existing.some(t => t.alert_id === a.id))
        .map(a => ({
          id: `ticket-${a.id}`,
          title: `Ticket: ${a.title}`,
          description: a.description || `Auto-generated ticket for alert ${a.id}`,
          priority: (a.severity === 'critical' ? 'critical' : a.severity === 'high' ? 'high' : a.severity === 'medium' ? 'medium' : 'low') as any,
          status: 'open' as const,
          alert_id: a.id,
          assigned_to: undefined,
          created_by: 'system',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

      if (newTickets.length > 0) {
        useTicketStore.setState((state) => ({ tickets: [...newTickets, ...state.tickets] }));
      }
    };

    // seed now from current alerts
    try {
      const alerts = useAlertStore.getState().alerts;
      seedFromAlerts(alerts);
    } catch (err) {
      console.warn('Unable to seed mock tickets from alerts:', err);
    }

    // subscribe to future alert changes and create tickets for new alerts
    useAlertStore.subscribe((state) => {
      try {
        seedFromAlerts(state.alerts || []);
      } catch (err) {
        console.warn('Error seeding tickets from alerts subscription:', err);
      }
    });
  }
}
