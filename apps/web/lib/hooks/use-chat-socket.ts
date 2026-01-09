import { useCallback } from 'react';
import { useChatSocketContext } from '@/providers/chat-socket-provider';

export function useChatSocket() {
  const { socket, isConnected } = useChatSocketContext();

  /**
   * Join a chat room
   */
  const joinRoom = useCallback((roomId: string) => {
    if (!socket || !isConnected) {
      console.warn('Socket not connected, cannot join room');
      return;
    }
    
    socket.emit('room:join', { roomId });
    console.log(`🚪 Joining room: ${roomId}`);
  }, [socket, isConnected]);

  /**
   * Leave a chat room
   */
  const leaveRoom = useCallback((roomId: string) => {
    if (!socket || !isConnected) {
      return;
    }
    
    socket.emit('room:leave', { roomId });
    console.log(`🚪 Leaving room: ${roomId}`);
  }, [socket, isConnected]);

  /**
   * Send a message via WebSocket
   */
  const sendMessage = useCallback((data: {
    roomId: string;
    content: string;
    userId: number;
    timestamp?: string;
  }) => {
    if (!socket || !isConnected) {
      console.warn('Socket not connected, cannot send message');
      return false;
    }
    
    socket.emit('message:send', {
      ...data,
      timestamp: data.timestamp || new Date().toISOString(),
    });
    
    console.log('📤 Sending message:', data);
    return true;
  }, [socket, isConnected]);

  /**
   * Start typing indicator
   */
  const startTyping = useCallback((roomId: string, userId: number) => {
    if (!socket || !isConnected) {
      return;
    }
    
    socket.emit('typing:start', { roomId, userId });
  }, [socket, isConnected]);

  /**
   * Stop typing indicator
   */
  const stopTyping = useCallback((roomId: string, userId: number) => {
    if (!socket || !isConnected) {
      return;
    }
    
    socket.emit('typing:stop', { roomId, userId });
  }, [socket, isConnected]);

  return {
    socket,
    isConnected,
    joinRoom,
    leaveRoom,
    sendMessage,
    startTyping,
    stopTyping,
  };
}
