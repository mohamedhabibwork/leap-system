import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSocketStore } from '@/stores/socket.store';
import { useChatStore } from '@/stores/chat.store';
import { chatAPI } from '@/lib/api/chat';

/**
 * Hook to manage chat messages with TanStack Query and Zustand
 * Handles both API fetching and real-time updates via WebSocket
 */
export function useChatMessages(roomId: string | null) {
  const queryClient = useQueryClient();
  const { chatSocket, chatConnected } = useSocketStore();
  const { addMessage, setTypingUsers } = useChatStore();

  // Fetch messages using TanStack Query
  const { data: messages = [], isLoading, error, refetch } = useQuery({
    queryKey: ['chat', 'messages', roomId],
    queryFn: () => (roomId ? chatAPI.getMessages(roomId) : Promise.resolve([])),
    enabled: !!roomId,
    staleTime: 0, // Always fetch fresh data
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: ({ roomId, content }: { roomId: string; content: string }) =>
      chatAPI.sendMessage({ roomId, content }),
    onSuccess: (message, variables) => {
      // Add message to store
      if (message) {
        addMessage(message);
      }
      // Invalidate query to refetch messages
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages', variables.roomId] });
    },
  });

  // Setup WebSocket listeners for real-time updates
  useEffect(() => {
    if (!chatSocket || !chatConnected || !roomId) return;

    // Join the room
    chatSocket.emit('room:join', { roomId });

    // Handle new messages
    const handleMessageReceived = (message: any) => {
      addMessage({
        id: message.id || Date.now(),
        roomId: message.roomId || message.chatRoomId,
        senderId: message.userId || message.senderId,
        content: message.content,
        createdAt: message.timestamp || message.createdAt || new Date().toISOString(),
        attachmentUrl: message.attachmentUrl,
      });
      // Refetch messages to ensure consistency
      refetch();
    };

    // Handle typing indicators
    const handleUserTyping = ({ userId }: { userId: number }) => {
      setTypingUsers(roomId, [userId]);
      // Clear typing after 3 seconds
      setTimeout(() => setTypingUsers(roomId, []), 3000);
    };

    const handleUserStoppedTyping = () => {
      setTypingUsers(roomId, []);
    };

    // Attach listeners
    chatSocket.on('message:received', handleMessageReceived);
    chatSocket.on('user:typing', handleUserTyping);
    chatSocket.on('user:stopped-typing', handleUserStoppedTyping);

    // Cleanup
    return () => {
      chatSocket.off('message:received', handleMessageReceived);
      chatSocket.off('user:typing', handleUserTyping);
      chatSocket.off('user:stopped-typing', handleUserStoppedTyping);
    };
  }, [chatSocket, chatConnected, roomId, addMessage, setTypingUsers, refetch]);

  return {
    messages,
    isLoading,
    error,
    sendMessage: sendMessageMutation.mutate,
    isSending: sendMessageMutation.isPending,
    refetch,
  };
}

/**
 * Hook to manage chat rooms with TanStack Query
 */
export function useChatRooms() {
  const queryClient = useQueryClient();

  // Fetch rooms using TanStack Query
  const { data: rooms = [], isLoading, error, refetch } = useQuery({
    queryKey: ['chat', 'rooms'],
    queryFn: () => chatAPI.getRooms(),
    staleTime: 60 * 1000, // Cache for 1 minute
  });

  // Create room mutation
  const createRoomMutation = useMutation({
    mutationFn: chatAPI.createRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'rooms'] });
    },
  });

  return {
    rooms,
    isLoading,
    error,
    createRoom: createRoomMutation.mutate,
    isCreating: createRoomMutation.isPending,
    refetch,
  };
}
