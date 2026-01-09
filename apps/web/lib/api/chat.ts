import { apiClient } from './client';

export interface ChatRoom {
  id: string;
  uuid?: string;
  name?: string;
  participants: number[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  lastMessageAt?: string;
  createdAt?: string;
}

export interface ChatMessage {
  id: number;
  uuid?: string;
  roomId: string;
  senderId: number;
  content: string;
  attachmentUrl?: string;
  createdAt: string;
  isEdited?: boolean;
  replyToMessageId?: number;
}

export interface CreateRoomDto {
  participantIds: number[];
  name?: string;
  chatTypeId?: number;
}

export interface SendMessageDto {
  roomId: string;
  content: string;
  attachmentUrl?: string;
  replyToMessageId?: number;
}

/**
 * Chat API Service
 * Handles all chat-related API calls
 */
export class ChatAPI {
  /**
   * Get all chat rooms for the current user
   */
  async getRooms(): Promise<ChatRoom[]> {
    try {
      const response = await apiClient.get<{ data: ChatRoom[] } | ChatRoom[]>('/chat/rooms');
      return Array.isArray(response) ? response : response.data || [];
    } catch (error) {
      console.error('Failed to fetch chat rooms:', error);
      return [];
    }
  }

  /**
   * Get a single chat room by ID
   */
  async getRoom(roomId: string): Promise<ChatRoom | null> {
    try {
      const response = await apiClient.get<{ data: ChatRoom } | ChatRoom>(`/chat/rooms/${roomId}`);
      return 'data' in response ? response.data : response;
    } catch (error) {
      console.error('Failed to fetch chat room:', error);
      return null;
    }
  }

  /**
   * Create a new chat room
   */
  async createRoom(data: CreateRoomDto): Promise<ChatRoom | null> {
    try {
      const response = await apiClient.post<{ data: ChatRoom } | ChatRoom>('/chat/rooms', data);
      return 'data' in response ? response.data : response;
    } catch (error) {
      console.error('Failed to create chat room:', error);
      return null;
    }
  }

  /**
   * Get messages for a chat room
   */
  async getMessages(roomId: string, limit = 50, offset = 0): Promise<ChatMessage[]> {
    try {
      const response = await apiClient.get<{ data: ChatMessage[] } | ChatMessage[]>(
        `/chat/rooms/${roomId}/messages?limit=${limit}&offset=${offset}`
      );
      return Array.isArray(response) ? response : response.data || [];
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      return [];
    }
  }

  /**
   * Send a message via REST API (fallback when socket is not available)
   */
  async sendMessage(data: SendMessageDto): Promise<ChatMessage | null> {
    try {
      const response = await apiClient.post<{ data: ChatMessage } | ChatMessage>(
        '/chat/messages',
        data
      );
      return 'data' in response ? response.data : response;
    } catch (error) {
      console.error('Failed to send message:', error);
      return null;
    }
  }

  /**
   * Search for users to start a new chat
   */
  async searchUsers(query: string, limit = 20): Promise<any[]> {
    try {
      const response = await apiClient.get<{ data: any[] } | any[]>(
        `/users/search?q=${encodeURIComponent(query)}&limit=${limit}`
      );
      return Array.isArray(response) ? response : response.data || [];
    } catch (error) {
      console.error('Failed to search users:', error);
      return [];
    }
  }

  /**
   * Mark messages as read in a room
   */
  async markAsRead(roomId: string): Promise<boolean> {
    try {
      await apiClient.post(`/chat/rooms/${roomId}/read`);
      return true;
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
      return false;
    }
  }
}

export const chatAPI = new ChatAPI();
export default chatAPI;
