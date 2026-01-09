import { create } from 'zustand';
import { chatAPI, ChatRoom, ChatMessage, CreateRoomDto } from '@/lib/api/chat';

interface Message {
  id: number;
  roomId: string;
  senderId: number;
  content: string;
  createdAt: string;
  attachmentUrl?: string;
}

interface ChatState {
  rooms: ChatRoom[];
  activeRoom: string | null;
  messages: Message[];
  typingUsers: Record<string, number[]>;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  // Actions
  setRooms: (rooms: ChatRoom[]) => void;
  addRoom: (room: ChatRoom) => void;
  setActiveRoom: (roomId: string | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setTypingUsers: (roomId: string, userIds: number[]) => void;
  markRoomAsRead: (roomId: string) => void;
  // API Actions
  loadRooms: () => Promise<void>;
  loadMessages: (roomId: string) => Promise<void>;
  createRoom: (data: CreateRoomDto) => Promise<ChatRoom | null>;
  sendMessage: (roomId: string, content: string) => Promise<Message | null>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  rooms: [],
  activeRoom: null,
  messages: [],
  typingUsers: {},
  isLoading: false,
  isSending: false,
  error: null,
  
  setRooms: (rooms) => set({ rooms }),
  
  addRoom: (room) => set((state) => ({ rooms: [...state.rooms, room] })),
  
  setActiveRoom: (roomId) => {
    set({ activeRoom: roomId });
    if (roomId) {
      get().loadMessages(roomId);
      get().markRoomAsRead(roomId);
    }
  },
  
  setMessages: (messages) => set({ messages }),
  
  addMessage: (message) =>
    set((state) => {
      // Update last message in room if it's the active room
      const updatedRooms = state.rooms.map((room) =>
        room.id === message.roomId
          ? { ...room, lastMessage: message, lastMessageAt: message.createdAt }
          : room
      );
      return {
        messages: [...state.messages, message],
        rooms: updatedRooms,
      };
    }),
  
  setTypingUsers: (roomId, userIds) =>
    set((state) => ({
      typingUsers: { ...state.typingUsers, [roomId]: userIds },
    })),
  
  markRoomAsRead: async (roomId) => {
    set((state) => ({
      rooms: state.rooms.map((room) =>
        room.id === roomId ? { ...room, unreadCount: 0 } : room
      ),
    }));
    await chatAPI.markAsRead(roomId);
  },
  
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
      set({ messages, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load messages',
        isLoading: false,
      });
    }
  },
  
  createRoom: async (data: CreateRoomDto) => {
    set({ isLoading: true, error: null });
    try {
      const room = await chatAPI.createRoom(data);
      if (room) {
        set((state) => ({ rooms: [...state.rooms, room], isLoading: false }));
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
  
  sendMessage: async (roomId: string, content: string) => {
    set({ isSending: true, error: null });
    try {
      const message = await chatAPI.sendMessage({ roomId, content });
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
}));
