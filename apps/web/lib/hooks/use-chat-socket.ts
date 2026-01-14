import { useCallback } from 'react';
import { useSocketStore } from '@/stores/socket.store';

/**
 * Hook to manage chat socket operations
 * Uses Zustand store for socket state management
 */
export function useChatSocket() {
  const { chatSocket, chatConnected } = useSocketStore();

  /**
   * Join a chat room
   */
  const joinRoom = useCallback((roomId: string) => {
    if (!chatSocket || !chatConnected) {
      console.warn('Socket not connected, cannot join room');
      return false;
    }
    
    chatSocket.emit('room:join', { roomId });
    console.log(`🚪 Joining room: ${roomId}`);
    return true;
  }, [chatSocket, chatConnected]);

  /**
   * Leave a chat room
   */
  const leaveRoom = useCallback((roomId: string) => {
    if (!chatSocket || !chatConnected) {
      return false;
    }
    
    chatSocket.emit('room:leave', { roomId });
    console.log(`🚪 Leaving room: ${roomId}`);
    return true;
  }, [chatSocket, chatConnected]);

  /**
   * Send a message via WebSocket
   */
  const sendMessage = useCallback((data: {
    roomId: string;
    content: string;
    userId: number;
    attachmentUrl?: string;
    replyToMessageId?: number;
    timestamp?: string;
  }) => {
    if (!chatSocket || !chatConnected) {
      console.warn('Socket not connected, cannot send message');
      return false;
    }
    
    chatSocket.emit('message:send', {
      ...data,
      timestamp: data.timestamp || new Date().toISOString(),
    });
    
    console.log('📤 Sending message:', data);
    return true;
  }, [chatSocket, chatConnected]);

  /**
   * Start typing indicator
   */
  const startTyping = useCallback((roomId: string, userId: number) => {
    if (!chatSocket || !chatConnected) {
      return false;
    }
    
    chatSocket.emit('typing:start', { roomId, userId });
    return true;
  }, [chatSocket, chatConnected]);

  /**
   * Stop typing indicator
   */
  const stopTyping = useCallback((roomId: string, userId: number) => {
    if (!chatSocket || !chatConnected) {
      return false;
    }
    
    chatSocket.emit('typing:stop', { roomId, userId });
    return true;
  }, [chatSocket, chatConnected]);

  /**
   * Mark messages as read in a room
   */
  const markAsRead = useCallback((roomId: string) => {
    if (!chatSocket || !chatConnected) {
      return false;
    }
    
    chatSocket.emit('room:read', { roomId });
    return true;
  }, [chatSocket, chatConnected]);

  return {
    socket: chatSocket,
    isConnected: chatConnected,
    joinRoom,
    leaveRoom,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
  };
}
