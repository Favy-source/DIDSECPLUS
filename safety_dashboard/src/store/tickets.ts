import { create } from 'zustand';
import { TicketState, Ticket, TicketFilters, CreateTicketForm, UpdateTicketForm } from '@/types';
import apiClient from '@/services/api';

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
    } catch (error) {
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
