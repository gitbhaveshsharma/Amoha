// stores/notifications/useNotificationStore.ts
import { create } from 'zustand';
import { notificationService } from './notificationService';

export interface Notification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  metadata: {
    artwork_title?: string;
    artist_name?: string;
    image_url?: string;
  };
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  subscribeToRealtime: () => () => void; // Fix the return type
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  
  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const data = await notificationService.getNotifications();
      set({ 
        notifications: data,
        unreadCount: data.filter(n => !n.is_read).length
      });
    } finally {
      set({ isLoading: false });
    }
  },

  markAsRead: async (id: string) => {
    await notificationService.markAsRead(id);
    set(state => ({
      notifications: state.notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ),
      unreadCount: state.unreadCount - 1
    }));
  },

  subscribeToRealtime: () => {
    return notificationService.subscribe((payload) => {
      set(state => {
        const newNotification = payload.new;
        const updatedNotifications = [newNotification, ...state.notifications];
        return {
          notifications: updatedNotifications,
          unreadCount: updatedNotifications.filter(n => !n.is_read).length
        };
      });
    });
  }
}));