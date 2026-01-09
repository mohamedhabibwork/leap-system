'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useAdminWebSocket } from '../hooks/use-websocket';

interface WebSocketContextType {
  notifications: any[];
  connected: boolean;
  unreadCount: number;
  markAsRead: (notificationId?: number) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  clearNotification: (notificationId: number) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const websocket = useAdminWebSocket({
    autoConnect: true,
    reconnectAttempts: 5,
    reconnectDelay: 2000,
  });

  return (
    <WebSocketContext.Provider value={websocket}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}
