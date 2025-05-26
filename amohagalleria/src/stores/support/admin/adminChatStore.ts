import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-toastify';
import { ChatMessage } from '@/types/support';

interface AdminChatState {
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
        isInternal?: boolean;
    }) => Promise<void>;
    setFile: (file: File | null) => void;
    clearMessages: () => void;
}

export const useAdminChatStore = create<AdminChatState>((set) => ({
    messages: [],
    isLoading: false,
    isSubmitting: false,
    error: null,
    currentFile: null,

    fetchMessages: async (ticketId) => {
        set({ isLoading: true, error: null });
        try {
            const { data, error } = await supabase
                .from('ticket_threads')
                .select('messages')
                .eq('ticket_id', ticketId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    set({ messages: [] });
                    return;
                }
                throw error;
            }

            if (data?.messages) {
                set({
                    messages: Array.isArray(data.messages)
                        ? data.messages
                        : []
                });
            } else {
                set({ messages: [] });
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
            const errorMessage = error instanceof Error
                ? error.message
                : 'Failed to fetch messages';
            set({ error: errorMessage });
            toast.error('Failed to load messages');
        } finally {
            set({ isLoading: false });
        }
    },

    sendMessage: async ({ ticketId, userId, content, file, isInternal = false }) => {
        if (!content.trim() || !userId) return;

        set({ isSubmitting: true, error: null });
        try {
            const newMessageObj: ChatMessage = {
                id: crypto.randomUUID(),
                author_ref: `agent_${userId}`,
                content: content,
                is_internal: !!isInternal,
                created_at: new Date().toISOString(),
                attachments: []
            };

            if (file) {
                const fileExt = file.name.split('.').pop();
                const fileName = `agent_${userId}-${Date.now()}.${fileExt}`;
                const filePath = `${ticketId}/${fileName}`;

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('ticket-attachments')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('ticket-attachments')
                    .getPublicUrl(filePath);

                newMessageObj.attachments = [{
                    id: uploadData.path,
                    url: publicUrl,
                    name: file.name,
                    type: file.type,
                    size: file.size
                }];
            }

            const { error } = await supabase.rpc('append_ticket_message', {
                p_ticket_id: ticketId,
                new_message: newMessageObj,
                user_id: userId,
            });

            if (error) throw error;

            const { error: ticketError } = await supabase
                .from('support_tickets')
                .update({
                    status: 'in_progress',
                    updated_at: new Date().toISOString()
                })
                .eq('id', ticketId);

            if (ticketError) throw ticketError;

            set((state) => ({
                messages: Array.isArray(state.messages)
                    ? [...state.messages, newMessageObj]
                    : [newMessageObj],
                currentFile: null
            }));

            toast.success('Message sent successfully');
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage = error instanceof Error
                ? error.message
                : 'Failed to send message';
            set({ error: errorMessage });
            toast.error('Failed to send message');
        } finally {
            set({ isSubmitting: false });
        }
    },

    setFile: (file) => {
        set({ currentFile: file });
    },

    clearMessages: () => {
        set({ messages: [] });
    }
}));