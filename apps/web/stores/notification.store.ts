import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Notification } from '@/types/notification';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  soundEnabled: boolean;
  loading: boolean;
  // Actions
  addNotification: (notification: Notification) => void;
  setNotifications: (notifications: Notification[]) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: number) => void;
  clearAll: () => void;
  toggleSound: () => void;
  incrementUnread: () => void;
  setLoading: (loading: boolean) => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      soundEnabled: true,
      loading: false,

      addNotification: (notification) =>
        set((state) => {
          // Check for duplicates (by ID or content+timestamp)
          const isDuplicate = state.notifications.some(
            (n) =>
              n.id === notification.id ||
              (n.title === notification.title &&
                n.message === notification.message &&
                Math.abs(
                  new Date(n.createdAt).getTime() - new Date(notification.createdAt).getTime()
                ) < 1000) // Within 1 second
          );

          if (isDuplicate) {
            return state;
          }

          return {
            notifications: [notification, ...state.notifications],
            unreadCount: notification.isRead ? state.unreadCount : state.unreadCount + 1,
          };
        }),

      setNotifications: (notifications) =>
        set({
          notifications,
          unreadCount: notifications.filter((n) => !n.isRead).length,
        }),

      markAsRead: (id) =>
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id);
          const wasUnread = notification && !notification.isRead;

          return {
            notifications: state.notifications.map((n) =>
              n.id === id ? { ...n, isRead: true } : n
            ),
            unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
          };
        }),

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
          unreadCount: 0,
        })),

      deleteNotification: (id) =>
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id);
          const wasUnread = notification && !notification.isRead;

          return {
            notifications: state.notifications.filter((n) => n.id !== id),
            unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
          };
        }),

      clearAll: () =>
        set({
          notifications: [],
          unreadCount: 0,
        }),

      toggleSound: () =>
        set((state) => ({
          soundEnabled: !state.soundEnabled,
        })),

      incrementUnread: () =>
        set((state) => ({
          unreadCount: state.unreadCount + 1,
        })),

      setLoading: (loading) => set({ loading }),
    }),
    {
      name: 'notification-storage',
      partialize: (state) => ({
        soundEnabled: state.soundEnabled,
      }),
    }
  )
);
