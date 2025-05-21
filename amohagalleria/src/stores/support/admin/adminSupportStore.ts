// store/support/admin/adminSupportStore.ts
import { create } from 'zustand';
import {
    fetchFilteredTickets,
    updateTicketStatus,
    assignTicket,
    fetchSupportAgents,
    fetchTicketPriorities,
    fetchTicketCategories,
} from './adminSupportService';
import type { Ticket, User, TicketPriority, TicketCategory, TicketFilters } from '@/types/support';

interface AdminSupportState {
    tickets: Ticket[];
    agents: User[];
    priorities: TicketPriority[];
    categories: TicketCategory[];
    loading: boolean;
    error: string | null;
    filters: TicketFilters;
    totalCount: number;
    hasMore: boolean;

    // Ticket methods
    fetchTickets: (filters?: Partial<TicketFilters>) => Promise<void>;
    fetchFilteredTickets: (filters?: Partial<TicketFilters>) => Promise<void>;
    loadMoreTickets: () => Promise<void>;
    updateStatus: (ticketId: string, status: string) => Promise<void>;
    assignAgent: (ticketId: string, assigneeId: string) => Promise<void>;

    // Filter methods
    setFilters: (filters: Partial<TicketFilters>) => void;
    resetFilters: () => void;

    // Data methods
    fetchAgents: () => Promise<void>;
    fetchPriorities: () => Promise<void>;
    fetchCategories: () => Promise<void>;

    // Utility methods
    clearError: () => void;
}

const DEFAULT_FILTERS: TicketFilters = {
    status: '',
    priority: '',
    category: '',
    assignee: '',
    search: '',
    page: 1,
    limit: 20
};

export const useAdminSupportStore = create<AdminSupportState>((set, get) => ({
    tickets: [],
    agents: [],
    priorities: [],
    categories: [],
    loading: false,
    error: null,
    filters: DEFAULT_FILTERS,
    totalCount: 0,
    hasMore: true,

    // Fetch tickets with optional filters
    fetchTickets: async (newFilters = {}) => {
        set({ loading: true, error: null });
        try {
            const filters = { ...get().filters, ...newFilters, page: 1 };
            const { data, count } = await fetchFilteredTickets(filters);

            set({
                tickets: data,
                filters,
                totalCount: count || 0,
                hasMore: data.length === (filters.limit || 20),
                loading: false
            });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch tickets',
                loading: false
            });
        }
    },
    fetchFilteredTickets: async (newFilters = {}) => {
        set({ loading: true, error: null });
        try {
            const filters = { ...get().filters, ...newFilters, page: 1 };
            const { data, count } = await fetchFilteredTickets(filters);

            set({
                tickets: data,
                filters,
                totalCount: count || 0,
                hasMore: data.length === (filters.limit || 20),
                loading: false
            });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch tickets',
                loading: false
            });
        }
    },

    // Load more tickets for infinite scroll
    loadMoreTickets: async () => {
        const { loading, hasMore, filters } = get();
        if (loading || !hasMore) return;

        set({ loading: true });
        try {
            const nextPage = filters.page ? filters.page + 1 : 2;
            const newFilters = { ...filters, page: nextPage };

            const { data, count } = await fetchFilteredTickets(newFilters);

            set({
                tickets: [...get().tickets, ...data],
                filters: newFilters,
                totalCount: count || 0,
                hasMore: data.length === (filters.limit || 20),
                loading: false
            });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to load more tickets',
                loading: false
            });
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

    // Set filters and optionally refetch
    setFilters: (filters) => {
        set((state) => ({
            filters: { ...state.filters, ...filters }
        }));
    },

    // Reset to default filters
    resetFilters: () => {
        set({
            filters: DEFAULT_FILTERS,
            hasMore: true
        });
    },

    // Fetch support agents
    fetchAgents: async () => {
        set({ loading: true, error: null });
        try {
            const agents = await fetchSupportAgents();
            set({ agents, loading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch agents',
                loading: false
            });
        }
    },

    // Fetch ticket priorities
    fetchPriorities: async () => {
        set({ loading: true, error: null });
        try {
            const priorities = await fetchTicketPriorities();
            set({ priorities, loading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch priorities',
                loading: false
            });
        }
    },

    // Fetch ticket categories
    fetchCategories: async () => {
        set({ loading: true, error: null });
        try {
            const categories = await fetchTicketCategories();
            set({ categories, loading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch categories',
                loading: false
            });
        }
    },

    // Clear error state
    clearError: () => set({ error: null }),
}));