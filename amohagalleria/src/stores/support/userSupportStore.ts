// store/support/userSupportStore.ts
import { create } from 'zustand';
import { fetchTickets, createTicket, addComment } from './supportService';
import { Ticket, Comment } from '@/types';

interface SupportState {
    tickets: Ticket[];
    loading: boolean;
    error: string | null;
    fetchUserTickets: (userId: string) => Promise<void>;
    createNewTicket: (ticketData: Omit<Ticket, 'id' | 'created_at' | 'updated_at'>) => Promise<Ticket>;
    addTicketComment: (commentData: Omit<Comment, 'id' | 'created_at'>) => Promise<void>;
}

export const useSupportStore = create<SupportState>((set) => ({
    tickets: [],
    loading: false,
    error: null,

    fetchUserTickets: async (userId) => {
        set({ loading: true, error: null });
        try {
            const tickets = await fetchTickets(userId);
            set({ tickets, loading: false });
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            set({ error: errorMessage, loading: false });
        }
    },

    createNewTicket: async (ticketData) => {
        set({ loading: true, error: null });
        try {
            const newTicket = await createTicket(ticketData);
            set((state) => ({ tickets: [newTicket, ...state.tickets], loading: false }));
            return newTicket;
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            set({ error: errorMessage, loading: false });
            throw err;
        }
    },

    addTicketComment: async (commentData) => {
        set({ loading: true, error: null });
        try {
            const newComment = await addComment(commentData);
            set((state) => ({
                tickets: state.tickets.map((ticket) =>
                    ticket.id === commentData.ticket_id
                        ? { ...ticket, comments: [...(ticket.comments || []), newComment] }
                        : ticket
                ),
                loading: false,
            }));
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            set({ error: errorMessage, loading: false });
            throw err;
        }
    },
}));