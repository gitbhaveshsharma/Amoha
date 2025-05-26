
/**
 * Custom User type for support system
 */
export interface User {
    id: string;
    name?: string;
    email?: string;
    role?: string;
    avatar_url?: string | null;
}

/**
 * Represents a support ticket in the system
 */
export interface Ticket {
    id: string;
    user_id: string;
    category_id: string;
    priority_id: string;
    assignee_id?: string;
    subject: string;
    description: string;
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    created_at: string;
    updated_at: string;
    // Joined fields from related tables (foreign keys)
    priority?: {
        id: string;
        name: string;
        description: string;
    };
    category?: {
        id: string;
        name: string;
        description: string;
    };
    attachments?: Array<{
        id: string;
        ticket_id: string;
        file_url: string;
        uploaded_by: string;
        created_at: string;
        type: string;
    }>; user: {
        id: string;
        name: string;
        email: string;
        avatar_url: string | null;
        role?: string;
    };
    // Virtual fields
    comments?: Comment[];
}

/**
 * Represents a comment on a support ticket
 */
export interface Comment {
    id: string;
    ticket_id: string;
    user_id: string;
    message: string;
    content?: string;  // Alternative to message in some cases
    is_internal: boolean;
    created_at: string;
    user_avatar?: string;
    user_name?: string;
}

/**
 * Represents a chat message within a support ticket thread
 */
export interface ChatMessage {
    id: string;
    author_ref: string;  // Format: "user_{userId}" or "agent_{agentId}"
    content: string;
    created_at: string;
    is_internal: boolean;
    attachments?: ChatAttachment[];
}

/**
 * Represents a file attachment in a chat message
 */
export interface ChatAttachment {
    id: string;
    url: string;
    name: string;
    type: string;
    size: number;
}

/**
 * A simpler representation of attachment for modal display
 */
export interface Attachment {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
}

/**
 * Represents a ticket attachment stored in the database
 */
export interface TicketAttachment {
    id: string;
    ticket_id: string;
    file_url: string;
    uploaded_by: string;
    created_at: string;
}

/**
 * Represents a category for support tickets
 */
export interface TicketCategory {
    id: string;
    name: string;
}

/**
 * Represents a priority level for support tickets
 */
export interface TicketPriority {
    id: string;
    name: string;
}

/**
 * Props for the SupportChatModal component
 */
export interface SupportChatModalProps {
    ticketId: string;
    isOpen: boolean;
    onClose: () => void;
    ticketSubject: string;
}

/**
 * Props for the TicketDetailsModal component
 */
export interface TicketDetailsModalProps {
    ticketId: string;
    isOpen: boolean;
    onClose: () => void;
    ticket: Ticket;
}

/**
 * State for the support chat store
 */
export interface SupportChatState {
    messages: ChatMessage[];
    isLoading: boolean;
    isSubmitting: boolean;
    error: string | null;
    currentFile: File | null;
    fetchMessages: (ticketId: string) => Promise<void>;
    sendMessage: (params: {
        ticketId: string;
        userId: string;
        content: string;
        file?: File | null;
    }) => Promise<void>;
    setFile: (file: File | null) => void;
    clearMessages: () => void;
}

/**
 * State for the user support store
 */
export interface SupportState {
    tickets: Ticket[];
    loading: boolean;
    error: string | null;
    fetchUserTickets: (userId: string) => Promise<void>;
    createNewTicket: (ticketData: Omit<Ticket, 'id' | 'created_at' | 'updated_at'>) => Promise<Ticket>;
    addTicketComment: (commentData: Omit<Comment, 'id' | 'created_at'>) => Promise<void>;
}

/**
 * State for the admin support store
 */
export interface AdminSupportState {
    tickets: Ticket[];
    agents: User[];
    loading: boolean;
    error: string | null;
    fetchTickets: () => Promise<void>;
    updateStatus: (ticketId: string, status: string) => Promise<void>;
    assignAgent: (ticketId: string, assigneeId: string) => Promise<void>;
    fetchAgents: () => Promise<void>;
}

/**
 * Props for the AdminSupportChat component
 */
export interface AdminSupportChatProps {
    ticketId: string;
}

/**
 * Props for the AdminTicketDetail component
 */
export interface AdminTicketDetailProps {
    ticket: Ticket;
    onClose: () => void;
}

/**
 * Message content for sending new messages
 */
export interface MessageContent {
    ticketId: string;
    userId: string;
    content: string;
    file?: File | null;
    isInternal?: boolean;
}

/**
 * State for the admin chat store
 */
export interface AdminChatState {
    messages: ChatMessage[];
    isLoading: boolean;
    isSubmitting: boolean;
    error: string | null;
    currentFile: File | null;
    fetchMessages: (ticketId: string) => Promise<void>;
    sendMessage: (params: MessageContent) => Promise<void>;
    setFile: (file: File | null) => void;
    clearMessages: () => void;
}


/**
 * Type for ticket filters
 */
export type TicketFilters = {
    status?: 'open' | 'in_progress' | 'resolved' | 'closed' | '';
    priority?: string;
    category?: string;
    assignee?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    // For pagination
    page?: number;
    limit?: number;
};

/**
 * Type for creating a new ticket
 */
export type NewTicket = Omit<Ticket, 'id' | 'created_at' | 'updated_at'>;

/**
 * Type for creating a new comment
 */
export type NewComment = Omit<Comment, 'id' | 'created_at'>;

/**
 * Type for creating a new chat message
 */
export type NewChatMessage = {
    author_ref: string;
    content: string;
    is_internal?: boolean;
    attachments?: ChatAttachment[];
    created_at: string; // Added to allow created_at in message object
};
