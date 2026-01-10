import { create } from 'zustand';
import { Socket } from 'socket.io-client';
import socketClient from '@/lib/socket/client';

interface SocketState {
  chatSocket: Socket | null;
  notificationsSocket: Socket | null;
  chatConnected: boolean;
  notificationsConnected: boolean;
  // Actions
  connectChat: (token: string) => void;
  disconnectChat: () => void;
  connectNotifications: (token: string) => void;
  disconnectNotifications: () => void;
  setChatConnected: (connected: boolean) => void;
  setNotificationsConnected: (connected: boolean) => void;
  cleanup: () => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  chatSocket: null,
  notificationsSocket: null,
  chatConnected: false,
  notificationsConnected: false,

  connectChat: (token: string) => {
    const existingSocket = get().chatSocket;
    
    // Don't reconnect if already connected
    if (existingSocket && existingSocket.connected) {
      return;
    }

    const socket = socketClient.connectToChat(token);
    
    // Set up connection state tracking
    socket.on('connect', () => {
      set({ chatConnected: true });
    });

    socket.on('disconnect', () => {
      set({ chatConnected: false });
    });

    set({ chatSocket: socket });
  },

  disconnectChat: () => {
    const socket = get().chatSocket;
    if (socket) {
      socket.disconnect();
      set({ chatSocket: null, chatConnected: false });
    }
  },

  connectNotifications: (token: string) => {
    const existingSocket = get().notificationsSocket;
    
    // Don't reconnect if already connected
    if (existingSocket && existingSocket.connected) {
      return;
    }

    const socket = socketClient.connectToNotifications(token);
    
    // Set up connection state tracking
    socket.on('connect', () => {
      set({ notificationsConnected: true });
    });

    socket.on('disconnect', () => {
      set({ notificationsConnected: false });
    });

    set({ notificationsSocket: socket });
  },

  disconnectNotifications: () => {
    const socket = get().notificationsSocket;
    if (socket) {
      socket.disconnect();
      set({ notificationsSocket: null, notificationsConnected: false });
    }
  },

  setChatConnected: (connected: boolean) => set({ chatConnected: connected }),

  setNotificationsConnected: (connected: boolean) => set({ notificationsConnected: connected }),

  cleanup: () => {
    const { chatSocket, notificationsSocket } = get();
    
    if (chatSocket) {
      chatSocket.removeAllListeners();
      chatSocket.disconnect();
    }
    
    if (notificationsSocket) {
      notificationsSocket.removeAllListeners();
      notificationsSocket.disconnect();
    }
    
    set({
      chatSocket: null,
      notificationsSocket: null,
      chatConnected: false,
      notificationsConnected: false,
    });
  },
}));
