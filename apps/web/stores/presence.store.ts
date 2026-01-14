import { create } from 'zustand';

interface PresenceState {
  onlineUsers: Set<number>;
  // Actions
  setOnlineUsers: (userIds: number[]) => void;
  addOnlineUser: (userId: number) => void;
  removeOnlineUser: (userId: number) => void;
  isUserOnline: (userId: number) => boolean;
  clearOnlineUsers: () => void;
}

export const usePresenceStore = create<PresenceState>((set, get) => ({
  onlineUsers: new Set<number>(),

  setOnlineUsers: (userIds) => set({ onlineUsers: new Set(userIds) }),

  addOnlineUser: (userId) => {
    set((state) => {
      const newSet = new Set(state.onlineUsers);
      newSet.add(userId);
      return { onlineUsers: newSet };
    });
  },

  removeOnlineUser: (userId) => {
    set((state) => {
      const newSet = new Set(state.onlineUsers);
      newSet.delete(userId);
      return { onlineUsers: newSet };
    });
  },

  isUserOnline: (userId) => {
    return get().onlineUsers.has(userId);
  },

  clearOnlineUsers: () => set({ onlineUsers: new Set() }),
}));
