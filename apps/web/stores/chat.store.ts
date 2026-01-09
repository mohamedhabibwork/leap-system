import { create } from 'zustand';

interface Message {
  id: number;
  roomId: string;
  senderId: number;
  content: string;
  createdAt: string;
}

interface ChatRoom {
  id: string;
  name: string;
  participants: number[];
  lastMessage?: Message;
  unreadCount: number;
}

interface ChatState {
  rooms: ChatRoom[];
  activeRoom: string | null;
  messages: Message[];
  typingUsers: Record<string, number[]>;
  setRooms: (rooms: ChatRoom[]) => void;
  addRoom: (room: ChatRoom) => void;
  setActiveRoom: (roomId: string | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setTypingUsers: (roomId: string, userIds: number[]) => void;
  markRoomAsRead: (roomId: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  rooms: [],
  activeRoom: null,
  messages: [],
  typingUsers: {},
  setRooms: (rooms) => set({ rooms }),
  addRoom: (room) => set((state) => ({ rooms: [...state.rooms, room] })),
  setActiveRoom: (roomId) => set({ activeRoom: roomId }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setTypingUsers: (roomId, userIds) =>
    set((state) => ({
      typingUsers: { ...state.typingUsers, [roomId]: userIds },
    })),
  markRoomAsRead: (roomId) =>
    set((state) => ({
      rooms: state.rooms.map((room) =>
        room.id === roomId ? { ...room, unreadCount: 0 } : room
      ),
    })),
}));
