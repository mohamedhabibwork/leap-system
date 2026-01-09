'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import socketClient from '@/lib/socket/client';
import { useChatStore } from '@/stores/chat.store';
import { Socket } from 'socket.io-client';

interface ChatSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const ChatSocketContext = createContext<ChatSocketContextType>({
  socket: null,
  isConnected: false,
});

export function useChatSocketContext() {
  return useContext(ChatSocketContext);
}

interface ChatSocketProviderProps {
  children: ReactNode;
}

export function ChatSocketProvider({ children }: ChatSocketProviderProps) {
  const { data: session, status } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { addMessage, setTypingUsers } = useChatStore();

  useEffect(() => {
    // Only connect if user is authenticated
    if (status === 'authenticated' && session?.accessToken) {
      const token = session.accessToken as string;
      
      // Connect to chat namespace
      const chatSocket = socketClient.connectToChat(token);
      setSocket(chatSocket);

      // Connection event handlers
      chatSocket.on('connect', () => {
        console.log('✅ Chat socket connected');
        setIsConnected(true);
      });

      chatSocket.on('disconnect', (reason) => {
        console.log('❌ Chat socket disconnected:', reason);
        setIsConnected(false);
      });

      chatSocket.on('connect_error', (error) => {
        console.error('🔴 Chat socket connection error:', error);
        setIsConnected(false);
      });

      // Message events
      chatSocket.on('message:received', (data: any) => {
        console.log('📨 Message received:', data);
        
        // Add message to store
        addMessage({
          id: data.id || Date.now(),
          roomId: data.roomId || data.chatRoomId,
          senderId: data.userId || data.senderId,
          content: data.content,
          createdAt: data.timestamp || data.createdAt || new Date().toISOString(),
          attachmentUrl: data.attachmentUrl,
        });
      });

      // Typing indicators
      chatSocket.on('user:typing', (data: { roomId: string; userId: number }) => {
        console.log('✍️ User typing:', data);
        setTypingUsers(data.roomId, [data.userId]);
      });

      chatSocket.on('user:stopped-typing', (data: { roomId: string; userId: number }) => {
        console.log('⏸️ User stopped typing:', data);
        setTypingUsers(data.roomId, []);
      });

      // Room events
      chatSocket.on('room:updated', (data: any) => {
        console.log('🔄 Room updated:', data);
        // Could trigger a refresh of rooms here
      });

      chatSocket.on('room:user-joined', (data: any) => {
        console.log('👋 User joined room:', data);
      });

      chatSocket.on('room:user-left', (data: any) => {
        console.log('👋 User left room:', data);
      });

      return () => {
        // Cleanup on unmount or logout
        console.log('🧹 Cleaning up chat socket connection');
        chatSocket.off('connect');
        chatSocket.off('disconnect');
        chatSocket.off('connect_error');
        chatSocket.off('message:received');
        chatSocket.off('user:typing');
        chatSocket.off('user:stopped-typing');
        chatSocket.off('room:updated');
        chatSocket.off('room:user-joined');
        chatSocket.off('room:user-left');
        socketClient.disconnect();
        setSocket(null);
        setIsConnected(false);
      };
    } else if (status === 'unauthenticated') {
      // Disconnect if user logs out
      socketClient.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  }, [status, session, addMessage, setTypingUsers]);

  return (
    <ChatSocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </ChatSocketContext.Provider>
  );
}
