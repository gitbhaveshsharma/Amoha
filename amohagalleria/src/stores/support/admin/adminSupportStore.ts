// store/support/admin/adminSupportStore.ts
import { create } from 'zustand';
import {
    fetchAllTickets,
    updateTicketStatus,
    assignTicket,
    fetchSupportAgents
} from './adminSupportService';
import { AdminSupportState, Ticket } from '@/types/support';

export const useAdminSupportStore = create<AdminSupportState>((set) => ({
    tickets: [],
    agents: [],
    loading: false,
    error: null,

    fetchTickets: async () => {
        set({ loading: true, error: null });
        try {
            const tickets = await fetchAllTickets();
            set({ tickets, loading: false });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tickets';
            set({ error: errorMessage, loading: false });
        }
    },

    updateStatus: async (ticketId, status) => {
        set({ loading: true, error: null });
        try {
            await updateTicketStatus(ticketId, status);
            set((state) => ({
                tickets: state.tickets.map(ticket =>
                    ticket.id === ticketId ? { ...ticket, status: status as Ticket['status'] } : ticket
                ),
                loading: false
            }));
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update status';
            set({ error: errorMessage, loading: false });
        }
    },

    assignAgent: async (ticketId, assigneeId) => {
        set({ loading: true, error: null });
        try {
            await assignTicket(ticketId, assigneeId);
            set((state) => ({
                tickets: state.tickets.map(ticket =>
                    ticket.id === ticketId ? { ...ticket, assignee_id: assigneeId } : ticket
                ),
                loading: false
            }));
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to assign agent';
            set({ error: errorMessage, loading: false });
        }
    },

    fetchAgents: async () => {
        set({ loading: true, error: null });
        try {
            const agents = await fetchSupportAgents();
            set({ agents, loading: false });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch agents';
            set({ error: errorMessage, loading: false });
        }
    }
}));