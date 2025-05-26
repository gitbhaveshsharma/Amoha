import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-toastify';
import { ChatMessage, SupportChatState, Attachment } from '@/types/support';

export const useSupportChatStore = create<SupportChatState>((set) => ({
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
                const messagesArray = Array.isArray(data.messages) ? data.messages : [];
                set({ messages: messagesArray });
            } else {
                set({ messages: [] });
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch messages';
            set({ error: errorMessage });
            toast.error('Failed to load messages');
        } finally {
            set({ isLoading: false });
        }
    },

    sendMessage: async ({ ticketId, userId, content, file }) => {
        if (!content.trim() || !userId) return;

        set({ isSubmitting: true, error: null });
        try {
            let attachments: Attachment[] = [];

            if (file) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${userId}-${Date.now()}.${fileExt}`;
                const filePath = `${ticketId}/${fileName}`;

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('ticket-attachments')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('ticket-attachments')
                    .getPublicUrl(filePath);

                attachments = [{
                    id: uploadData.path,
                    url: publicUrl,
                    name: file.name,
                    type: file.type,
                    size: file.size,
                }];
            }

            const newMessageObj: ChatMessage = {
                id: crypto.randomUUID(),
                author_ref: `user_${userId}`,
                content: content,
                created_at: new Date().toISOString(),
                is_internal: false,
                attachments: attachments.length > 0 ? attachments : []
            };

            const { error } = await supabase.rpc('append_ticket_message', {
                p_ticket_id: ticketId,
                new_message: newMessageObj,
                user_id: userId,
            });

            if (error) throw error;

            set(state => ({
                messages: Array.isArray(state.messages) ? [...state.messages, newMessageObj] : [newMessageObj],
                currentFile: null
            }));

            toast.success('Message sent successfully');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
            set({ error: errorMessage });
            toast.error('Failed to send message');
        } finally {
            set({ isSubmitting: false });
        }
    },

    setFile: (file) => set({ currentFile: file }),
    clearMessages: () => set({ messages: [] }),
}));