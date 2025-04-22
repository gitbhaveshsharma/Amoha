// stores/notifications/notificationService.ts
import { supabase } from '@/lib/supabase';
import { Notification } from './useNotificationStore';

export const notificationService = {
    /**
     * Fetches notifications for the currently logged-in user.
     */
    async getNotifications(): Promise<Notification[]> {
        try {
            // Get the current authenticated user
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                console.warn('No user is logged in or authentication failed:', authError);
                return [];
            }

            // Fetch notifications specifically for this user
            const { data, error } = await supabase
                .from('notification_messages')
                .select('*')
                .eq('user_id', user.id) // Ensure we only fetch notifications for the current user
                .order('created_at', { ascending: false }) // Order by most recent first
                .limit(10); // Limit to 10 notifications

            if (error) {
                console.error('Error fetching notifications:', error);
                return [];
            }

            // Log fetched notifications for debugging
            console.debug('Fetched notifications:', data);

            return data || [];
        } catch (error) {
            console.error('Critical error while fetching notifications:', error);
            return [];
        }
    },

    /**
     * Marks a specific notification as read.
     */
    async markAsRead(id: string): Promise<void> {
        try {
            // Get the current authenticated user
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                console.warn('No user is logged in or authentication failed:', authError);
                throw new Error('User not authenticated');
            }

            // Update the notification to mark it as read
            const { error } = await supabase
                .from('notification_messages')
                .update({ is_read: true })
                .eq('id', id) // Ensure we only update the specific notification
                .eq('user_id', user.id); // Double-check that the notification belongs to the user

            if (error) {
                console.error('Error marking notification as read:', error);
                throw error;
            }

            console.debug(`Notification ${id} marked as read successfully.`);
        } catch (error) {
            console.error('Critical error while marking notification as read:', error);
            throw error;
        }
    },

    /**
     * Subscribes to real-time notifications for the current user.
     */
    subscribe(callback: (payload: { new: Notification }) => void): () => void {
        const subscription = supabase
            .channel('realtime_notifications')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notification_messages',
            }, async (payload) => {
                try {
                    // Get the current authenticated user
                    const { data: { user }, error: authError } = await supabase.auth.getUser();
                    if (authError || !user) {
                        console.warn('No user is logged in or authentication failed:', authError);
                        return;
                    }

                    // Ensure the notification belongs to the current user
                    if (payload.new.user_id === user.id) {
                        console.debug('Real-time notification received:', payload.new);
                        callback({ new: payload.new as Notification });
                    } else {
                        console.warn('Received notification for another user:', payload.new);
                    }
                } catch (error) {
                    console.error('Error handling real-time notification:', error);
                }
            })
            .subscribe();

        // Return a cleanup function to unsubscribe
        return () => {
            supabase.removeChannel(subscription);
            console.debug('Unsubscribed from real-time notifications.');
        };
    },
};