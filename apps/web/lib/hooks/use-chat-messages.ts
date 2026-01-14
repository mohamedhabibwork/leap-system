import { useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useSocketStore } from '@/stores/socket.store';
import { useChatStore } from '@/stores/chat.store';
import { chatAPI, ChatMessage } from '@/lib/api/chat';

/**
 * Hook to manage chat messages with TanStack Query and Zustand
 * Handles both API fetching and real-time updates via WebSocket
 * Supports infinite scroll pagination
 */
export function useChatMessages(roomId: string | null) {
  const queryClient = useQueryClient();
  const { chatSocket, chatConnected } = useSocketStore();
  const { 
    addMessage, 
    updateMessage, 
    removeMessage,
    addTypingUser, 
    removeTypingUser,
    prependMessages,
  } = useChatStore();
  
  const typingTimeoutsRef = useRef<Map<number, NodeJS.Timeout>>(new Map());

  // Fetch messages using TanStack Query with infinite scroll support
  const { 
    data,
    isLoading, 
    error, 
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['chat', 'messages', roomId],
    queryFn: async ({ pageParam }) => {
      if (!roomId) return [];
      
      if (pageParam) {
        // Fetch older messages (cursor-based pagination)
        return chatAPI.getMessagesBefore(roomId, pageParam);
      }
      
      // Initial fetch
      return chatAPI.getMessages(roomId);
    },
    initialPageParam: null as number | null,
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.length < 50) return undefined;
      return lastPage[0]?.id; // Use oldest message ID as cursor
    },
    enabled: !!roomId,
    staleTime: 0,
  });

  // Flatten all pages into single messages array
  const messages = data?.pages.flat().reverse() || [];

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: ({ roomId, content, attachmentUrl }: { roomId: string; content: string; attachmentUrl?: string }) =>
      chatAPI.sendMessage({ roomId, content, attachmentUrl }),
    onSuccess: (message, variables) => {
      if (message) {
        addMessage(message);
      }
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages', variables.roomId] });
    },
  });

  // Edit message mutation
  const editMessageMutation = useMutation({
    mutationFn: ({ messageId, content }: { messageId: number; content: string }) =>
      chatAPI.editMessage(messageId, content),
    onSuccess: (message) => {
      if (message) {
        updateMessage(message.id, {
          content: message.content,
          isEdited: true,
          editedAt: message.editedAt,
        });
      }
    },
  });

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: (messageId: number) => chatAPI.deleteMessage(messageId),
    onSuccess: (_, messageId) => {
      removeMessage(messageId);
    },
  });

  // Handle incoming typing event with auto-clear
  const handleTypingEvent = useCallback((userId: number, roomIdStr: string) => {
    if (roomIdStr !== roomId) return;
    
    // Clear existing timeout for this user
    const existingTimeout = typingTimeoutsRef.current.get(userId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }
    
    // Add typing user
    addTypingUser(roomIdStr, userId);
    
    // Set timeout to remove typing indicator after 3 seconds
    const timeout = setTimeout(() => {
      removeTypingUser(roomIdStr, userId);
      typingTimeoutsRef.current.delete(userId);
    }, 3000);
    
    typingTimeoutsRef.current.set(userId, timeout);
  }, [roomId, addTypingUser, removeTypingUser]);

  // Setup WebSocket listeners for real-time updates
  useEffect(() => {
    if (!chatSocket || !chatConnected || !roomId) return;

    // Join the room
    chatSocket.emit('room:join', { roomId });

    // Handle new messages
    const handleMessageReceived = (message: any) => {
      addMessage({
        id: message.id || Date.now(),
        roomId: message.roomId || message.chatRoomId || roomId,
        senderId: message.userId || message.senderId,
        content: message.content,
        createdAt: message.timestamp || message.createdAt || new Date().toISOString(),
        attachmentUrl: message.attachmentUrl,
        isEdited: message.isEdited,
        sender: message.sender,
      });
    };

    // Handle message edited
    const handleMessageEdited = (data: { id: number; content: string; isEdited: boolean; editedAt: string }) => {
      updateMessage(data.id, {
        content: data.content,
        isEdited: data.isEdited,
        editedAt: data.editedAt,
      });
    };

    // Handle message deleted
    const handleMessageDeleted = (data: { messageId: number }) => {
      removeMessage(data.messageId);
    };

    // Handle typing indicators
    const handleUserTyping = ({ userId, roomId: eventRoomId }: { userId: number; roomId?: string }) => {
      handleTypingEvent(userId, eventRoomId || roomId);
    };

    const handleUserStoppedTyping = ({ userId, roomId: eventRoomId }: { userId: number; roomId?: string }) => {
      if ((eventRoomId || roomId) === roomId) {
        removeTypingUser(roomId, userId);
        const timeout = typingTimeoutsRef.current.get(userId);
        if (timeout) {
          clearTimeout(timeout);
          typingTimeoutsRef.current.delete(userId);
        }
      }
    };

    // Attach listeners
    chatSocket.on('message:received', handleMessageReceived);
    chatSocket.on('message:edited', handleMessageEdited);
    chatSocket.on('message:deleted', handleMessageDeleted);
    chatSocket.on('user:typing', handleUserTyping);
    chatSocket.on('user:stopped-typing', handleUserStoppedTyping);

    // Cleanup
    return () => {
      chatSocket.off('message:received', handleMessageReceived);
      chatSocket.off('message:edited', handleMessageEdited);
      chatSocket.off('message:deleted', handleMessageDeleted);
      chatSocket.off('user:typing', handleUserTyping);
      chatSocket.off('user:stopped-typing', handleUserStoppedTyping);
      
      // Clear all typing timeouts
      typingTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      typingTimeoutsRef.current.clear();
    };
  }, [chatSocket, chatConnected, roomId, addMessage, updateMessage, removeMessage, handleTypingEvent, removeTypingUser]);

  // Load more messages (for infinite scroll)
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return {
    messages,
    isLoading,
    error,
    sendMessage: sendMessageMutation.mutate,
    editMessage: editMessageMutation.mutate,
    deleteMessage: deleteMessageMutation.mutate,
    isSending: sendMessageMutation.isPending,
    isEditing: editMessageMutation.isPending,
    isDeleting: deleteMessageMutation.isPending,
    refetch,
    loadMore,
    hasMoreMessages: hasNextPage ?? false,
    isLoadingMore: isFetchingNextPage,
  };
}

/**
 * Hook to manage chat rooms with TanStack Query
 */
export function useChatRooms() {
  const queryClient = useQueryClient();
  const { chatSocket, chatConnected } = useSocketStore();
  const { data: session, status } = useSession();

  // Fetch rooms using TanStack Query
  const { data: rooms = [], isLoading, error, refetch } = useQuery({
    queryKey: ['chat', 'rooms'],
    queryFn: async () => {
      try {
        return await chatAPI.getRooms();
      } catch (error: any) {
        // Log error details for debugging
        if (error.isNetworkError || error.code === 'ERR_NETWORK') {
          console.error('[useChatRooms] Network error - Backend may not be running or CORS issue');
        }
        // Re-throw to let TanStack Query handle it
        throw error;
      }
    },
    enabled: status !== 'loading' && !!session?.accessToken,
    staleTime: 60 * 1000, // Cache for 1 minute
    retry: (failureCount, error: any) => {
      // Don't retry on network errors (likely backend is down)
      if (error.isNetworkError || error.code === 'ERR_NETWORK') {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Create room mutation
  const createRoomMutation = useMutation({
    mutationFn: chatAPI.createRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'rooms'] });
    },
  });

  // Leave room mutation
  const leaveRoomMutation = useMutation({
    mutationFn: (roomId: string) => chatAPI.leaveRoom(roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'rooms'] });
    },
  });

  // Listen for real-time room updates
  useEffect(() => {
    if (!chatSocket || !chatConnected) return;

    const handleNewRoom = () => {
      refetch();
    };

    chatSocket.on('room:created', handleNewRoom);

    return () => {
      chatSocket.off('room:created', handleNewRoom);
    };
  }, [chatSocket, chatConnected, refetch]);

  return {
    rooms,
    isLoading,
    error,
    createRoom: createRoomMutation.mutate,
    leaveRoom: leaveRoomMutation.mutate,
    isCreating: createRoomMutation.isPending,
    isLeaving: leaveRoomMutation.isPending,
    refetch,
  };
}

/**
 * Hook to get room participants
 */
export function useChatParticipants(roomId: string | null) {
  const { data: participants = [], isLoading, error, refetch } = useQuery({
    queryKey: ['chat', 'participants', roomId],
    queryFn: () => (roomId ? chatAPI.getRoomParticipants(roomId) : Promise.resolve([])),
    enabled: !!roomId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return {
    participants,
    isLoading,
    error,
    refetch,
  };
}
