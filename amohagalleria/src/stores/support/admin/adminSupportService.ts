// services/support/adminSupportService.ts
import { supabase } from '@/lib/supabase';
import { Ticket, User, TicketPriority, TicketCategory, TicketFilters } from '@/types/support';

// Utility function to transform raw ticket data
function transformTicketData(ticket: any): Ticket {
    return {
        ...ticket,
        user: {
            id: ticket.user_id,
            name: ticket.profile?.name || 'Unknown',
            email: ticket.profile?.email || 'Unknown',
            avatar_url: ticket.profile?.avatar_url || null,
            role: ticket.profile?.role || 'user',
        },
        priority: ticket.priority_id ? {
            id: ticket.priority_id,
            name: ticket.priority?.name || 'Unknown',
            description: ticket.priority?.description || ''
        } : null,
        category: ticket.category_id ? {
            id: ticket.category_id,
            name: ticket.category?.name || 'Unknown',
            description: ticket.category?.description || ''
        } : null,
    };
}

// Fetch all tickets with user profiles and other relations
export async function fetchAllTickets(): Promise<Ticket[]> {
    console.log('Fetching tickets with user profiles...');
    try {
        const { data, error } = await supabase
            .from('support_tickets')
            .select(`
                *,
                profile:user_id (*),
                priority:priority_id (*),
                category:category_id (*),
                attachments:ticket_attachments (*)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching tickets:', error);
            throw error;
        }

        console.log('Raw ticket data with profiles:', data);

        // Transform the raw data to match the Ticket type
        const tickets = data.map(transformTicketData);

        console.log('Processed tickets:', tickets);
        return tickets;
    } catch (error) {
        console.error('Error in fetchAllTickets:', error);
        throw error;
    }
}

// Update ticket status and return the updated ticket with related information
export async function updateTicketStatus(ticketId: string, status: string): Promise<Ticket | null> {
    try {
        const { data, error } = await supabase
            .from('support_tickets')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', ticketId)
            .select(`
                *,
                profile:user_id (*),
                priority:priority_id (*),
                category:category_id (*),
                attachments:ticket_attachments (*)
            `)
            .single();

        if (error) throw error;

        // Transform the updated ticket data
        return transformTicketData(data);
    } catch (error) {
        console.error('Error updating ticket status:', error);
        throw error;
    }
}

// Fetch tickets with filters and pagination
export async function fetchFilteredTickets(filters: TicketFilters): Promise<{ data: Ticket[], count: number }> {
    let query = supabase
        .from('support_tickets')
        .select(`
            *,
            profile:user_id (*),
            priority:priority_id (*),
            category:category_id (*),
            attachments:ticket_attachments (*)
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

    // Apply filters
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.priority) query = query.eq('priority_id', filters.priority);
    if (filters.category) query = query.eq('category_id', filters.category);
    if (filters.assignee) query = query.eq('assignee_id', filters.assignee);
    if (filters.search) {
        query = query.or(`subject.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }
    if (filters.startDate) query = query.gte('created_at', filters.startDate);
    if (filters.endDate) query = query.lte('created_at', filters.endDate);

    // Add pagination
    if (filters.page && filters.limit) {
        const offset = (filters.page - 1) * filters.limit;
        query = query.range(offset, offset + filters.limit - 1);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return {
        data: data.map(transformTicketData),
        count: count || 0
    };
}
// Assign a ticket to a support agent and return the updated ticket
export async function assignTicket(ticketId: string, assigneeId: string): Promise<Ticket | null> {
    try {
        const { data, error } = await supabase
            .from('support_tickets')
            .update({
                assignee_id: assigneeId,
                updated_at: new Date().toISOString()
            })
            .eq('id', ticketId)
            .select(`
                *,
                profile:user_id (*),
                priority:priority_id (*),
                category:category_id (*),
                attachments:ticket_attachments (*)
            `)
            .single();

        if (error) throw error;

        // Transform the updated ticket data
        return transformTicketData(data);
    } catch (error) {
        console.error('Error assigning ticket:', error);
        throw error;
    }
}

// Fetch support agents
export async function fetchSupportAgents(): Promise<User[]> {
    try {
        const { data, error } = await supabase
            .from('profile')
            .select('*')
            .eq('role', 'support_agent');

        if (error) throw error;

        return data.map(agent => ({
            id: agent.user_id,
            name: agent.name || 'Unknown Agent',
            email: agent.email || 'No email',
            avatar_url: agent.avatar_url || null,
            role: agent.role || 'support_agent'
        })) as User[];
    } catch (error) {
        console.error('Error fetching support agents:', error);
        throw error;
    }
}

// Fetch ticket priorities
export async function fetchTicketPriorities(): Promise<TicketPriority[]> {
    try {
        const { data, error } = await supabase
            .from('ticket_priorities')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;

        return data.map(priority => ({
            id: priority.id,
            name: priority.name ? String(priority.name) : 'Unknown',
            description: priority.description ? String(priority.description) : ''
        })) as TicketPriority[];
    } catch (error) {
        console.error('Error fetching ticket priorities:', error);
        throw error;
    }
}

// Fetch ticket categories
export async function fetchTicketCategories(): Promise<TicketCategory[]> {
    try {
        const { data, error } = await supabase
            .from('ticket_categories')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;

        return data.map(category => ({
            id: category.id,
            name: typeof category.name === 'string' ? category.name : String(category.name) || 'Unknown',
            description: typeof category.description === 'string' ? category.description : String(category.description) || ''
        })) as TicketCategory[];
    } catch (error) {
        console.error('Error fetching ticket categories:', error);
        throw error;
    }
}
