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
  editedAt?: string;
  replyToMessageId?: number;
  sender?: {
    id?: number;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
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

export interface EditMessageDto {
  messageId: number;
  content: string;
}

export interface ChatParticipant {
  id: number;
  userId: number;
  isAdmin: boolean;
  joinedAt: string;
  user: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    email?: string;
  };
}

export interface MessageReadReceipt {
  userId: number;
  readAt: string;
  user: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
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
   * Get messages before a specific message (for infinite scroll)
   */
  async getMessagesBefore(roomId: string, beforeMessageId: number, limit = 50): Promise<ChatMessage[]> {
    try {
      const response = await apiClient.get<{ data: ChatMessage[] } | ChatMessage[]>(
        `/chat/rooms/${roomId}/messages/before/${beforeMessageId}?limit=${limit}`
      );
      return Array.isArray(response) ? response : response.data || [];
    } catch (error) {
      console.error('Failed to fetch older messages:', error);
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
   * Edit a message
   */
  async editMessage(messageId: number, content: string): Promise<ChatMessage | null> {
    try {
      const response = await apiClient.put<{ data: ChatMessage } | ChatMessage>(
        `/chat/messages/${messageId}`,
        { content }
      );
      return 'data' in response ? response.data : response;
    } catch (error) {
      console.error('Failed to edit message:', error);
      return null;
    }
  }

  /**
   * Delete a message
   */
  async deleteMessage(messageId: number): Promise<boolean> {
    try {
      await apiClient.delete(`/chat/messages/${messageId}`);
      return true;
    } catch (error) {
      console.error('Failed to delete message:', error);
      return false;
    }
  }

  /**
   * Get read receipts for a message
   */
  async getMessageReads(messageId: number): Promise<MessageReadReceipt[]> {
    try {
      const response = await apiClient.get<{ data: MessageReadReceipt[] } | MessageReadReceipt[]>(
        `/chat/messages/${messageId}/reads`
      );
      return Array.isArray(response) ? response : response.data || [];
    } catch (error) {
      console.error('Failed to fetch message reads:', error);
      return [];
    }
  }

  /**
   * Get participants for a chat room
   */
  async getRoomParticipants(roomId: string): Promise<ChatParticipant[]> {
    try {
      const response = await apiClient.get<{ data: ChatParticipant[] } | ChatParticipant[]>(
        `/chat/rooms/${roomId}/participants`
      );
      return Array.isArray(response) ? response : response.data || [];
    } catch (error) {
      console.error('Failed to fetch room participants:', error);
      return [];
    }
  }

  /**
   * Add a participant to a chat room
   */
  async addParticipant(roomId: string, userId: number): Promise<boolean> {
    try {
      await apiClient.post(`/chat/rooms/${roomId}/participants`, { userId });
      return true;
    } catch (error) {
      console.error('Failed to add participant:', error);
      return false;
    }
  }

  /**
   * Remove a participant from a chat room
   */
  async removeParticipant(roomId: string, userId: number): Promise<boolean> {
    try {
      await apiClient.delete(`/chat/rooms/${roomId}/participants/${userId}`);
      return true;
    } catch (error) {
      console.error('Failed to remove participant:', error);
      return false;
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

  /**
   * Leave a chat room
   */
  async leaveRoom(roomId: string): Promise<boolean> {
    try {
      await apiClient.delete(`/chat/rooms/${roomId}`);
      return true;
    } catch (error) {
      console.error('Failed to leave room:', error);
      return false;
    }
  }
}

export const chatAPI = new ChatAPI();
export default chatAPI;
