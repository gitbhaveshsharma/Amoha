// store/support/chatStore.ts
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { ChatMessage, SupportChatState } from '@/types';

export const useSupportChatStore = create<SupportChatState>((set) => ({
    messages: [],
    isLoading: false,
    isSubmitting: false,
    error: null,
    currentFile: null,

    fetchMessages: async (ticketId) => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await supabase
                .from('ticket_threads')
                .select('messages')
                .eq('ticket_id', ticketId)
                .single();

            if (data?.messages) {
                set({ messages: data.messages });
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch messages';
            set({ error: errorMessage });
        } finally {
            set({ isLoading: false });
        }
    },

    sendMessage: async ({ ticketId, userId, content, file }) => {
        if (!content.trim() || !userId) return;

        set({ isSubmitting: true, error: null });
        try {
            let attachmentData = null;

            // Upload file if exists
            if (file) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${userId}-${Date.now()}.${fileExt}`;
                const filePath = `ticket-attachments/${ticketId}/${fileName}`;

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('ticket-attachments')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                attachmentData = [{
                    id: uploadData.path,
                    url: supabase.storage.from('ticket-attachments').getPublicUrl(filePath).data.publicUrl,
                    name: file.name,
                    type: file.type,
                    size: file.size,
                }];
            }

            // Create new message object
            const newMessageObj: ChatMessage = {
                id: crypto.randomUUID(),
                author_ref: `user_${userId}`,
                content,
                created_at: new Date().toISOString(),
                is_internal: false,
                ...(attachmentData && { attachments: attachmentData }),
            };

            // Update the thread
            const { error } = await supabase.rpc('append_ticket_message', {
                p_ticket_id: ticketId,
                new_message: newMessageObj,
                user_id: userId,
            });

            if (error) throw error;

            set({ currentFile: null });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
            set({ error: errorMessage });
        } finally {
            set({ isSubmitting: false });
        }
    },

    setFile: (file) => set({ currentFile: file }),

    clearMessages: () => set({ messages: [] }),
}));