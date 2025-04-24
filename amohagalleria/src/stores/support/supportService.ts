// store/support/supportService.ts
import { supabase } from '@/lib/supabase';
import { Ticket, Comment } from '@/types';

export async function fetchTickets(userId: string): Promise<Ticket[]> {
    const { data, error } = await supabase
        .from('support_tickets')
        .select(`
            *,
            category: ticket_categories(name),
            priority: ticket_priorities(name)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data as Ticket[];
}

export async function createTicket(
    ticketData: Omit<Ticket, 'id' | 'created_at' | 'updated_at'>
): Promise<Ticket> {
    const { data, error } = await supabase
        .from('support_tickets')
        .insert([ticketData])
        .select(`
            *,
            category: ticket_categories(name),
            priority: ticket_priorities(name)
        `);

    if (error) throw new Error(error.message);
    return (data as Ticket[])[0];
}

export async function addComment(
    commentData: Omit<Comment, 'id' | 'created_at'>
): Promise<Comment> {
    const { data, error } = await supabase
        .from('ticket_comments')
        .insert([commentData])
        .select('*');

    if (error) throw new Error(error.message);
    return (data as Comment[])[0];
}