import { create } from 'zustand';
import { chatAPI, ChatRoom, ChatMessage, CreateRoomDto } from '@/lib/api/chat';

interface Message {
  id: number;
  roomId: string;
  senderId: number;
  content: string;
  createdAt: string;
  attachmentUrl?: string;
  isEdited?: boolean;
  editedAt?: string;
  replyToMessageId?: number;
  sender?: {
    id?: number;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
}

interface ChatState {
  rooms: ChatRoom[];
  activeRoom: string | null;
  messages: Message[];
  typingUsers: Record<string, number[]>;
  isLoading: boolean;
  isSending: boolean;
  isLoadingMore: boolean;
  hasMoreMessages: boolean;
  error: string | null;
  
  // Actions
  setRooms: (rooms: ChatRoom[]) => void;
  addRoom: (room: ChatRoom) => void;
  removeRoom: (roomId: string) => void;
  setActiveRoom: (roomId: string | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  prependMessages: (messages: Message[]) => void;
  updateMessage: (messageId: number, updates: Partial<Message>) => void;
  removeMessage: (messageId: number) => void;
  setTypingUsers: (roomId: string, userIds: number[]) => void;
  addTypingUser: (roomId: string, userId: number) => void;
  removeTypingUser: (roomId: string, userId: number) => void;
  markRoomAsRead: (roomId: string) => void;
  clearError: () => void;
  
  // API Actions
  loadRooms: () => Promise<void>;
  loadMessages: (roomId: string) => Promise<void>;
  loadMoreMessages: (roomId: string) => Promise<void>;
  createRoom: (data: CreateRoomDto) => Promise<ChatRoom | null>;
  sendMessage: (roomId: string, content: string, attachmentUrl?: string) => Promise<Message | null>;
  editMessage: (messageId: number, content: string) => Promise<Message | null>;
  deleteMessage: (messageId: number) => Promise<boolean>;
  leaveRoom: (roomId: string) => Promise<boolean>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  rooms: [],
  activeRoom: null,
  messages: [],
  typingUsers: {},
  isLoading: false,
  isSending: false,
  isLoadingMore: false,
  hasMoreMessages: true,
  error: null,
  
  setRooms: (rooms) => set({ rooms }),
  
  addRoom: (room) => set((state) => {
    // Avoid duplicates
    if (state.rooms.some(r => r.id === room.id)) {
      return state;
    }
    return { rooms: [room, ...state.rooms] };
  }),
  
  removeRoom: (roomId) => set((state) => ({
    rooms: state.rooms.filter(r => r.id !== roomId),
    activeRoom: state.activeRoom === roomId ? null : state.activeRoom,
  })),
  
  setActiveRoom: (roomId) => {
    const currentActiveRoom = get().activeRoom;
    if (currentActiveRoom === roomId) return;
    
    set({ activeRoom: roomId, messages: [], hasMoreMessages: true });
    if (roomId) {
      get().loadMessages(roomId);
      get().markRoomAsRead(roomId);
    }
  },
  
  setMessages: (messages) => set({ messages }),
  
  addMessage: (message) =>
    set((state) => {
      // Check for duplicate messages
      if (state.messages.some(m => m.id === message.id)) {
        return state;
      }
      
      // Update last message in room
      const updatedRooms = state.rooms.map((room) =>
        room.id === message.roomId
          ? { 
              ...room, 
              lastMessage: message , 
              lastMessageAt: message.createdAt,
              // Increment unread count if not active room
              unreadCount: state.activeRoom !== message.roomId 
                ? (room.unreadCount || 0) + 1 
                : room.unreadCount,
            }
          : room
      );
      
      // Sort rooms by last message time
      updatedRooms.sort((a, b) => {
        const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return bTime - aTime;
      });
      
      return {
        messages: [...state.messages, message],
        rooms: updatedRooms,
      };
    }),
  
  prependMessages: (messages) =>
    set((state) => {
      // Filter out duplicates
      const existingIds = new Set(state.messages.map(m => m.id));
      const newMessages = messages.filter(m => !existingIds.has(m.id));
      
      return {
        messages: [...newMessages, ...state.messages],
        hasMoreMessages: messages.length > 0,
      };
    }),
  
  updateMessage: (messageId, updates) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId ? { ...msg, ...updates } : msg
      ),
    })),
  
  removeMessage: (messageId) =>
    set((state) => ({
      messages: state.messages.filter((msg) => msg.id !== messageId),
    })),
  
  setTypingUsers: (roomId, userIds) =>
    set((state) => ({
      typingUsers: { ...state.typingUsers, [roomId]: userIds },
    })),
  
  addTypingUser: (roomId, userId) =>
    set((state) => {
      const currentUsers = state.typingUsers[roomId] || [];
      if (currentUsers.includes(userId)) return state;
      return {
        typingUsers: { ...state.typingUsers, [roomId]: [...currentUsers, userId] },
      };
    }),
  
  removeTypingUser: (roomId, userId) =>
    set((state) => {
      const currentUsers = state.typingUsers[roomId] || [];
      return {
        typingUsers: { 
          ...state.typingUsers, 
          [roomId]: currentUsers.filter(id => id !== userId) 
        },
      };
    }),
  
  markRoomAsRead: async (roomId) => {
    set((state) => ({
      rooms: state.rooms.map((room) =>
        room.id === roomId ? { ...room, unreadCount: 0 } : room
      ),
    }));
    await chatAPI.markAsRead(roomId);
  },
  
  clearError: () => set({ error: null }),
  
  loadRooms: async () => {
    set({ isLoading: true, error: null });
    try {
      const rooms = await chatAPI.getRooms();
      set({ rooms, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load rooms',
        isLoading: false,
      });
    }
  },
  
  loadMessages: async (roomId: string) => {
    set({ isLoading: true, error: null });
    try {
      const messages = await chatAPI.getMessages(roomId);
      set({ 
        messages, 
        isLoading: false,
        hasMoreMessages: messages.length >= 50,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load messages',
        isLoading: false,
      });
    }
  },
  
  loadMoreMessages: async (roomId: string) => {
    const { messages, isLoadingMore, hasMoreMessages } = get();
    
    if (isLoadingMore || !hasMoreMessages || messages.length === 0) return;
    
    set({ isLoadingMore: true, error: null });
    
    try {
      const oldestMessage = messages[0];
      const olderMessages = await chatAPI.getMessagesBefore(roomId, oldestMessage.id);
      
      set((state) => ({
        messages: [...olderMessages, ...state.messages],
        isLoadingMore: false,
        hasMoreMessages: olderMessages.length >= 50,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load more messages',
        isLoadingMore: false,
      });
    }
  },
  
  createRoom: async (data: CreateRoomDto) => {
    set({ isLoading: true, error: null });
    try {
      const room = await chatAPI.createRoom(data);
      if (room) {
        set((state) => ({ 
          rooms: [room, ...state.rooms], 
          isLoading: false 
        }));
        return room;
      }
      set({ isLoading: false });
      return null;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create room',
        isLoading: false,
      });
      return null;
    }
  },
  
  sendMessage: async (roomId: string, content: string, attachmentUrl?: string) => {
    set({ isSending: true, error: null });
    try {
      const message = await chatAPI.sendMessage({ roomId, content, attachmentUrl });
      if (message) {
        get().addMessage(message);
        set({ isSending: false });
        return message;
      }
      set({ isSending: false });
      return null;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to send message',
        isSending: false,
      });
      return null;
    }
  },
  
  editMessage: async (messageId: number, content: string) => {
    set({ error: null });
    try {
      const message = await chatAPI.editMessage(messageId, content);
      if (message) {
        get().updateMessage(messageId, {
          content: message.content,
          isEdited: true,
          editedAt: message.editedAt,
        });
        return message;
      }
      return null;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to edit message',
      });
      return null;
    }
  },
  
  deleteMessage: async (messageId: number) => {
    set({ error: null });
    try {
      const success = await chatAPI.deleteMessage(messageId);
      if (success) {
        get().removeMessage(messageId);
        return true;
      }
      return false;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete message',
      });
      return false;
    }
  },
  
  leaveRoom: async (roomId: string) => {
    set({ error: null });
    try {
      const success = await chatAPI.leaveRoom(roomId);
      if (success) {
        get().removeRoom(roomId);
        return true;
      }
      return false;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to leave room',
      });
      return false;
    }
  },
}));
