import { Injectable, NotFoundException, ForbiddenException, Inject, BadRequestException } from '@nestjs/common';
import { eq, and, desc, sql, inArray, asc, lt, gt } from 'drizzle-orm';
import type { InferSelectModel } from 'drizzle-orm';
import { chatRooms, chatMessages, chatParticipants, users, messageReads } from '@leap-lms/database';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@leap-lms/database';
import { CreateRoomDto, SendMessageDto, GetMessagesDto, EditMessageDto, DeleteMessageDto } from './dto';

  /**
   * Chat message with sender information
   */
  export interface ChatMessageWithSender {
    id: number;
    uuid: string;
    roomId: number;
    senderId: number;
    content: string | null;
    attachmentUrl: string | null;
    messageTypeId: number;
    replyToMessageId: number | null;
    isEdited: boolean;
    editedAt: Date | null;
    createdAt: Date;
    sender: {
      id: number;
      firstName: string | null;
      lastName: string | null;
      avatar: string | null;
    };
  }

  /**
   * Message read receipt
   */
  export interface MessageRead {
    userId: number;
    readAt: Date;
  }

  /**
   * Participant with user info
   */
  export interface ParticipantWithInfo {
    id: number;
    userId: number;
    isAdmin: boolean;
    joinedAt: Date | null;
    user: {
      id: number;
      firstName: string | null;
      lastName: string | null;
      avatar: string | null;
      email: string | null;
    };
  }

  /**
   * Last message in room
   */
  export interface LastMessage {
    id: number;
    content: string | null;
    createdAt: Date;
    senderId: number;
    roomId: number;
  }

  /**
   * Enhanced chat room with participants and unread count
   */
  export interface EnhancedChatRoom {
    id: string | number;
    uuid?: string;
    name: string;
    chatTypeId: number;
    createdBy: number;
    participants: number[];
    lastMessage: ChatMessageWithSender | null;
    unreadCount: number;
    lastMessageAt?: string | Date;
    createdAt?: string | Date;
    updatedAt?: string | Date;
  }
@Injectable()
export class ChatService {
  constructor(
    @Inject('DRIZZLE_DB')
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}


  /**
   * Get all chat rooms for a user
   */
  async getRoomsByUserId(userId: number): Promise<EnhancedChatRoom[]> {
    // Get rooms where user is a participant
    const userRooms = await this.db
      .select({
        roomId: chatParticipants.chatRoomId,
      })
      .from(chatParticipants)
      .where(
        and(
          eq(chatParticipants.userId, userId),
          eq(chatParticipants.isDeleted, false)
        )
      );

    if (userRooms.length === 0) {
      return [];
    }

    const roomIds = userRooms.map(r => r.roomId);

    // Get room details with last message
    const rooms = await this.db
      .select({
        id: chatRooms.id,
        uuid: chatRooms.uuid,
        name: chatRooms.name,
        chatTypeId: chatRooms.chatTypeId,
        createdBy: chatRooms.createdBy,
        lastMessageAt: chatRooms.lastMessageAt,
        createdAt: chatRooms.createdAt,
        updatedAt: chatRooms.updatedAt,
      })
      .from(chatRooms)
      .where(
        and(
          inArray(chatRooms.id, roomIds),
          eq(chatRooms.isDeleted, false)
        )
      )
      .orderBy(desc(chatRooms.lastMessageAt));

    // Enhance rooms with participants and unread count
    const enhancedRooms = await Promise.all(
      rooms.map(async (room) => {
        try {
          const [participants, lastMessage, unreadCount] = await Promise.all([
            this.getRoomParticipants(room.id),
            this.getLastMessage(room.id),
            this.getUnreadCount(room.id, userId),
          ]);

          return {
            ...room,
            id: String(room.id), // Convert to string for frontend compatibility
            uuid: room.uuid || undefined,
            participants: participants.map(p => p.userId),
            lastMessage,
            unreadCount: unreadCount || 0,
            lastMessageAt: room.lastMessageAt ? new Date(room.lastMessageAt).toISOString() : undefined,
            createdAt: room.createdAt ? new Date(room.createdAt).toISOString() : undefined,
            updatedAt: room.updatedAt ? new Date(room.updatedAt).toISOString() : undefined,
          };
        } catch (error) {
          // Log error but continue with other rooms
          console.error(`Error enhancing room ${room.id}:`, error);
          // Return room with minimal data if enhancement fails
          return {
            ...room,
            id: String(room.id),
            participants: [],
            lastMessage: null,
            unreadCount: 0,
          };
        }
      })
    );

    return enhancedRooms;
  }

  /**
   * Get a single chat room by ID
   */
  async getRoomById(roomId: number, userId: number): Promise<EnhancedChatRoom> {
    // Check if user has access to this room
    const hasAccess = await this.checkUserAccess(roomId, userId);
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this chat room');
    }

    const [room] = await this.db
      .select()
      .from(chatRooms)
      .where(
        and(
          eq(chatRooms.id, roomId),
          eq(chatRooms.isDeleted, false)
        )
      )
      .limit(1);

    if (!room) {
      throw new NotFoundException('Chat room not found');
    }

    const [participants, lastMessage, unreadCount] = await Promise.all([
      this.getRoomParticipants(roomId),
      this.getLastMessage(roomId),
      this.getUnreadCount(roomId, userId),
    ]);

    return {
      ...room,
      id: String(room.id), // Convert to string for frontend compatibility
      uuid: room.uuid || undefined,
      participants: participants.map(p => p.userId),
      lastMessage,
      unreadCount: unreadCount || 0,
      lastMessageAt: room.lastMessageAt ? new Date(room.lastMessageAt).toISOString() : undefined,
      createdAt: room.createdAt ? new Date(room.createdAt).toISOString() : undefined,
      updatedAt: room.updatedAt ? new Date(room.updatedAt).toISOString() : undefined,
    };
  }

  /**
   * Create a new chat room
   */
  async createRoom(dto: CreateRoomDto, userId: number): Promise<InferSelectModel<typeof chatRooms>> {
    // Validate participant IDs
    if (dto.participantIds.length === 0) {
      throw new BadRequestException('At least one participant is required');
    }

    // Add creator to participants if not already included
    const allParticipantIds = Array.from(new Set([userId, ...dto.participantIds]));

    // Verify all users exist
    const existingUsers = await this.db
      .select({ id: users.id })
      .from(users)
      .where(
        and(
          inArray(users.id, allParticipantIds),
          eq(users.isDeleted, false)
        )
      );

    if (existingUsers.length !== allParticipantIds.length) {
      throw new BadRequestException('One or more participant users do not exist');
    }

    // For 1-on-1 chats, check if room already exists
    if (allParticipantIds.length === 2) {
      const existingRoom = await this.findExistingDirectRoom(allParticipantIds[0], allParticipantIds[1]);
      if (existingRoom) {
        return this.getRoomById(existingRoom.id, userId);
      }
    }

    // Determine chat type (default to 1 for direct message)
    const chatTypeId = dto.chatTypeId || 1;

    // Create the room
    const [newRoom] = await this.db
      .insert(chatRooms)
      .values({
        name: dto.name,
        chatTypeId,
        createdBy: userId,
      })
      .returning();

    // Add participants
    const participantValues = allParticipantIds.map(participantId => ({
      chatRoomId: newRoom.id,
      userId: participantId,
      isAdmin: participantId === userId,
    }));

    await this.db
      .insert(chatParticipants)
      .values(participantValues);

    return this.getRoomById(newRoom.id, userId);
  }

  /**
   * Get messages for a room with cursor-based pagination
   */
  async getMessages(roomId: number, userId: number, dto: GetMessagesDto): Promise<ChatMessageWithSender[]> {
    // Check if user has access
    const hasAccess = await this.checkUserAccess(roomId, userId);
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this chat room');
    }

    const { limit = 50, offset = 0 } = dto;

    const messages = await this.db
      .select({
        id: chatMessages.id,
        uuid: chatMessages.uuid,
        chatRoomId: chatMessages.chatRoomId,
        userId: chatMessages.userId,
        content: chatMessages.content,
        attachmentUrl: chatMessages.attachmentUrl,
        messageTypeId: chatMessages.messageTypeId,
        replyToMessageId: chatMessages.replyToMessageId,
        isEdited: chatMessages.isEdited,
        isDeleted: chatMessages.isDeleted,
        editedAt: chatMessages.editedAt,
        createdAt: chatMessages.createdAt,
        senderFirstName: users.firstName,
        senderLastName: users.lastName,
        senderAvatar: users.avatarUrl,
      })
      .from(chatMessages)
      .leftJoin(users, eq(chatMessages.userId, users.id))
      .where(
        and(
          eq(chatMessages.chatRoomId, roomId),
          eq(chatMessages.isDeleted, false)
        )
      )
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit)
      .offset(offset);

    return messages.map(msg => ({
      id: msg.id,
      uuid: msg.uuid,
      roomId: msg.chatRoomId,
      senderId: msg.userId,
      content: msg.content,
      attachmentUrl: msg.attachmentUrl,
      messageTypeId: msg.messageTypeId,
      replyToMessageId: msg.replyToMessageId,
      isEdited: msg.isEdited,
      editedAt: msg.editedAt,
      createdAt: msg.createdAt,
      sender: {
        id: msg.userId,
        firstName: msg.senderFirstName,
        lastName: msg.senderLastName,
        avatar: msg.senderAvatar,
      },
    })).reverse(); // Reverse to show oldest first
  }

  /**
   * Get messages before a specific message (for infinite scroll)
   */
  async getMessagesBefore(roomId: number, userId: number, beforeMessageId: number, limit = 50): Promise<ChatMessageWithSender[]> {
    // Check if user has access
    const hasAccess = await this.checkUserAccess(roomId, userId);
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this chat room');
    }

    const messages = await this.db
      .select({
        id: chatMessages.id,
        uuid: chatMessages.uuid,
        chatRoomId: chatMessages.chatRoomId,
        userId: chatMessages.userId,
        content: chatMessages.content,
        attachmentUrl: chatMessages.attachmentUrl,
        messageTypeId: chatMessages.messageTypeId,
        replyToMessageId: chatMessages.replyToMessageId,
        isEdited: chatMessages.isEdited,
        editedAt: chatMessages.editedAt,
        createdAt: chatMessages.createdAt,
        senderFirstName: users.firstName,
        senderLastName: users.lastName,
        senderAvatar: users.avatarUrl,
      })
      .from(chatMessages)
      .leftJoin(users, eq(chatMessages.userId, users.id))
      .where(
        and(
          eq(chatMessages.chatRoomId, roomId),
          eq(chatMessages.isDeleted, false),
          lt(chatMessages.id, beforeMessageId)
        )
      )
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);

    return messages.map(msg => ({
      id: msg.id,
      uuid: msg.uuid,
      roomId: msg.chatRoomId,
      senderId: msg.userId,
      content: msg.content,
      attachmentUrl: msg.attachmentUrl,
      messageTypeId: msg.messageTypeId,
      replyToMessageId: msg.replyToMessageId,
      isEdited: msg.isEdited,
      editedAt: msg.editedAt,
      createdAt: msg.createdAt,
      sender: {
        id: msg.userId,
        firstName: msg.senderFirstName,
        lastName: msg.senderLastName,
        avatar: msg.senderAvatar,
      },
    })).reverse();
  }

  /**
   * Send a message (REST fallback)
   */
  async sendMessage(dto: SendMessageDto, userId: number): Promise<InferSelectModel<typeof chatMessages>> {
    // Check if user has access to the room
    const hasAccess = await this.checkUserAccess(dto.roomId, userId);
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this chat room');
    }

    // Default message type (1 = text message)
    const messageTypeId = 1;

    // Insert message
    const [newMessage] = await this.db
      .insert(chatMessages)
      .values({
        chatRoomId: dto.roomId,
        userId,
        content: dto.content,
        attachmentUrl: dto.attachmentUrl,
        messageTypeId,
        replyToMessageId: dto.replyToMessageId,
      })
      .returning();

    // Update room's last message timestamp
    await this.db
      .update(chatRooms)
      .set({ lastMessageAt: new Date() })
      .where(eq(chatRooms.id, dto.roomId));

    // Get sender info
    const [sender] = await this.db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        avatar: users.avatarUrl,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return {
      id: newMessage.id,
      uuid: newMessage.uuid,
      roomId: newMessage.chatRoomId,
      senderId: newMessage.userId,
      content: newMessage.content,
      attachmentUrl: newMessage.attachmentUrl,
      messageTypeId: newMessage.messageTypeId,
      replyToMessageId: newMessage.replyToMessageId,
      isEdited: newMessage.isEdited,
      createdAt: newMessage.createdAt,
      sender,
    };
  }

  /**
   * Edit a message
   */
  async editMessage(dto: EditMessageDto, userId: number): Promise<InferSelectModel<typeof chatMessages>> {
    // Get the message
    const [message] = await this.db
      .select()
      .from(chatMessages)
      .where(
        and(
          eq(chatMessages.id, dto.messageId),
          eq(chatMessages.isDeleted, false)
        )
      )
      .limit(1);

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Check if user owns the message
    if (message.userId !== userId) {
      throw new ForbiddenException('You can only edit your own messages');
    }

    // Update message
    const [updatedMessage] = await this.db
      .update(chatMessages)
      .set({
        content: dto.content,
        isEdited: true,
        editedAt: new Date(),
      })
      .where(eq(chatMessages.id, dto.messageId))
      .returning();

    // Get sender info
    const [sender] = await this.db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        avatar: users.avatarUrl,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return {
      id: updatedMessage.id,
      uuid: updatedMessage.uuid,
      roomId: updatedMessage.chatRoomId,
      senderId: updatedMessage.userId,
      content: updatedMessage.content,
      attachmentUrl: updatedMessage.attachmentUrl,
      isEdited: updatedMessage.isEdited,
      editedAt: updatedMessage.editedAt,
      createdAt: updatedMessage.createdAt,
      sender,
    };
  }

  /**
   * Delete a message (soft delete)
   */
  async deleteMessage(messageId: number, userId: number): Promise<{ success: boolean; messageId: number; roomId: number }> {
    // Get the message
    const [message] = await this.db
      .select()
      .from(chatMessages)
      .where(
        and(
          eq(chatMessages.id, messageId),
          eq(chatMessages.isDeleted, false)
        )
      )
      .limit(1);

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Check if user owns the message or is room admin
    if (message.userId !== userId) {
      // Check if user is admin of the room
      const [participant] = await this.db
        .select()
        .from(chatParticipants)
        .where(
          and(
            eq(chatParticipants.chatRoomId, message.chatRoomId),
            eq(chatParticipants.userId, userId),
            eq(chatParticipants.isAdmin, true),
            eq(chatParticipants.isDeleted, false)
          )
        )
        .limit(1);

      if (!participant) {
        throw new ForbiddenException('You can only delete your own messages or messages in rooms you admin');
      }
    }

    // Soft delete message
    await this.db
      .update(chatMessages)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
      })
      .where(eq(chatMessages.id, messageId));

    return { success: true, messageId, roomId: message.chatRoomId };
  }

  /**
   * Mark messages as read in a room
   */
  async markAsRead(roomId: number, userId: number): Promise<void> {
    // Check if user has access
    const hasAccess = await this.checkUserAccess(roomId, userId);
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this chat room');
    }

    // Update participant's last read timestamp
    await this.db
      .update(chatParticipants)
      .set({ lastReadAt: new Date() })
      .where(
        and(
          eq(chatParticipants.chatRoomId, roomId),
          eq(chatParticipants.userId, userId)
        )
      );
  }

  /**
   * Get read receipts for a message
   */
  async getMessageReads(messageId: number, userId: number): Promise<MessageRead[]> {
    // Get the message to verify access
    const [message] = await this.db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.id, messageId))
      .limit(1);

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Verify user has access to the room
    const hasAccess = await this.checkUserAccess(message.chatRoomId, userId);
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this chat room');
    }

    // Get read receipts
    const reads = await this.db
      .select({
        userId: messageReads.userId,
        readAt: messageReads.readAt,
        userFirstName: users.firstName,
        userLastName: users.lastName,
        userAvatar: users.avatarUrl,
      })
      .from(messageReads)
      .leftJoin(users, eq(messageReads.userId, users.id))
      .where(
        and(
          eq(messageReads.messageId, messageId),
          eq(messageReads.isDeleted, false)
        )
      );

    return reads.map(r => ({
      userId: r.userId,
      readAt: r.readAt,
      user: {
        firstName: r.userFirstName,
        lastName: r.userLastName,
        avatar: r.userAvatar,
      },
    }));
  }

  /**
   * Leave a chat room (soft delete)
   */
  async leaveRoom(roomId: number, userId: number): Promise<void> {
    // Check if user is in the room
    const hasAccess = await this.checkUserAccess(roomId, userId);
    if (!hasAccess) {
      throw new ForbiddenException('You are not a member of this chat room');
    }

    // Update participant status
    await this.db
      .update(chatParticipants)
      .set({ 
        leftAt: new Date(),
        isDeleted: true,
        deletedAt: new Date(),
      })
      .where(
        and(
          eq(chatParticipants.chatRoomId, roomId),
          eq(chatParticipants.userId, userId)
        )
      );
  }

  /**
   * Add participant to a room
   */
  async addParticipant(roomId: number, participantUserId: number, addedByUserId: number): Promise<{ success: boolean; participantId: number }> {
    // Check if adder is admin
    const [adderParticipant] = await this.db
      .select()
      .from(chatParticipants)
      .where(
        and(
          eq(chatParticipants.chatRoomId, roomId),
          eq(chatParticipants.userId, addedByUserId),
          eq(chatParticipants.isAdmin, true),
          eq(chatParticipants.isDeleted, false)
        )
      )
      .limit(1);

    if (!adderParticipant) {
      throw new ForbiddenException('Only room admins can add participants');
    }

    // Check if user is already a participant
    const [existing] = await this.db
      .select()
      .from(chatParticipants)
      .where(
        and(
          eq(chatParticipants.chatRoomId, roomId),
          eq(chatParticipants.userId, participantUserId)
        )
      )
      .limit(1);

    if (existing && !existing.isDeleted) {
      throw new BadRequestException('User is already a participant');
    }

    // If they were previously a member, reactivate them
    if (existing) {
      await this.db
        .update(chatParticipants)
        .set({
          isDeleted: false,
          deletedAt: null,
          leftAt: null,
          joinedAt: new Date(),
        })
        .where(eq(chatParticipants.id, existing.id));

      return { success: true, participantId: existing.id };
    }

    // Add new participant
    const [newParticipant] = await this.db
      .insert(chatParticipants)
      .values({
        chatRoomId: roomId,
        userId: participantUserId,
        isAdmin: false,
      })
      .returning();

    return { success: true, participantId: newParticipant.id };
  }

  /**
   * Remove participant from a room
   */
  async removeParticipant(roomId: number, participantUserId: number, removedByUserId: number): Promise<void> {
    // Check if remover is admin
    const [removerParticipant] = await this.db
      .select()
      .from(chatParticipants)
      .where(
        and(
          eq(chatParticipants.chatRoomId, roomId),
          eq(chatParticipants.userId, removedByUserId),
          eq(chatParticipants.isAdmin, true),
          eq(chatParticipants.isDeleted, false)
        )
      )
      .limit(1);

    if (!removerParticipant) {
      throw new ForbiddenException('Only room admins can remove participants');
    }

    // Can't remove yourself this way
    if (participantUserId === removedByUserId) {
      throw new BadRequestException('Use leaveRoom to remove yourself');
    }

    // Remove participant
    await this.db
      .update(chatParticipants)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
        leftAt: new Date(),
      })
      .where(
        and(
          eq(chatParticipants.chatRoomId, roomId),
          eq(chatParticipants.userId, participantUserId)
        )
      );
  }

  /**
   * Helper: Check if user has access to a room
   */
  async checkUserAccess(roomId: number, userId: number): Promise<boolean> {
    const [participant] = await this.db
      .select()
      .from(chatParticipants)
      .where(
        and(
          eq(chatParticipants.chatRoomId, roomId),
          eq(chatParticipants.userId, userId),
          eq(chatParticipants.isDeleted, false)
        )
      )
      .limit(1);

    return !!participant;
  }

  /**
   * Helper: Get unread message count for a room
   */
  async getUnreadCount(roomId: number, userId: number): Promise<number> {
    try {
      // Get participant's last read timestamp
      const [participant] = await this.db
        .select({ lastReadAt: chatParticipants.lastReadAt })
        .from(chatParticipants)
        .where(
          and(
            eq(chatParticipants.chatRoomId, roomId),
            eq(chatParticipants.userId, userId),
            eq(chatParticipants.isDeleted, false)
          )
        )
        .limit(1);

      if (!participant || !participant.lastReadAt) {
        // Count all messages if never read
        const [result] = await this.db
          .select({ count: sql<number>`count(*)` })
          .from(chatMessages)
          .where(
            and(
              eq(chatMessages.chatRoomId, roomId),
              eq(chatMessages.isDeleted, false)
            )
          );
        return Number(result.count) || 0;
      }

      // Count messages after last read
      const [result] = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(chatMessages)
        .where(
          and(
            eq(chatMessages.chatRoomId, roomId),
            eq(chatMessages.isDeleted, false),
            sql`${chatMessages.createdAt} > ${participant.lastReadAt}`
          )
        );

      return Number(result.count) || 0;
    } catch (error) {
      console.error(`Error fetching unread count for room ${roomId}:`, error);
      return 0;
    }
  }

  /**
   * Helper: Get room participants with user info
   */
  async getRoomParticipantsWithInfo(roomId: number): Promise<ParticipantWithInfo[]> {
    const participants = await this.db
      .select({
        id: chatParticipants.id,
        userId: chatParticipants.userId,
        isAdmin: chatParticipants.isAdmin,
        joinedAt: chatParticipants.joinedAt,
        firstName: users.firstName,
        lastName: users.lastName,
        avatar: users.avatarUrl,
        email: users.email,
      })
      .from(chatParticipants)
      .leftJoin(users, eq(chatParticipants.userId, users.id))
      .where(
        and(
          eq(chatParticipants.chatRoomId, roomId),
          eq(chatParticipants.isDeleted, false)
        )
      );

    return participants.map(p => ({
      id: p.id,
      userId: p.userId,
      isAdmin: p.isAdmin,
      joinedAt: p.joinedAt,
      user: {
        firstName: p.firstName,
        lastName: p.lastName,
        avatar: p.avatar,
        email: p.email,
      },
    }));
  }

  /**
   * Helper: Get room participants
   */
  private async getRoomParticipants(roomId: number): Promise<InferSelectModel<typeof chatParticipants>[]> {
    try {
      return await this.db
        .select()
        .from(chatParticipants)
        .where(
          and(
            eq(chatParticipants.chatRoomId, roomId),
            eq(chatParticipants.isDeleted, false)
          )
        );
    } catch (error) {
      console.error(`Error fetching participants for room ${roomId}:`, error);
      return [];
    }
  }

  /**
   * Helper: Get last message in a room
   */
  private async getLastMessage(roomId: number): Promise<LastMessage | null> {
    try {
      const [message] = await this.db
        .select({
          id: chatMessages.id,
          content: chatMessages.content,
          createdAt: chatMessages.createdAt,
          senderId: chatMessages.userId,
          roomId: chatMessages.chatRoomId,
        })
        .from(chatMessages)
        .where(
          and(
            eq(chatMessages.chatRoomId, roomId),
            eq(chatMessages.isDeleted, false)
          )
        )
        .orderBy(desc(chatMessages.createdAt))
        .limit(1);

      if (!message) {
        return null;
      }

      // Format message to match frontend ChatMessage interface
      return {
        id: message.id,
        roomId: String(message.roomId),
        senderId: message.senderId,
        content: message.content,
        createdAt: message.createdAt ? new Date(message.createdAt).toISOString() : new Date().toISOString(),
      };
    } catch (error) {
      console.error(`Error fetching last message for room ${roomId}:`, error);
      return null;
    }
  }

  /**
   * Helper: Find existing direct chat room between two users
   */
  private async findExistingDirectRoom(userId1: number, userId2: number): Promise<InferSelectModel<typeof chatRooms> | null> {
    // Find rooms where both users are participants
    const user1Rooms = await this.db
      .select({ roomId: chatParticipants.chatRoomId })
      .from(chatParticipants)
      .where(
        and(
          eq(chatParticipants.userId, userId1),
          eq(chatParticipants.isDeleted, false)
        )
      );

    const user2Rooms = await this.db
      .select({ roomId: chatParticipants.chatRoomId })
      .from(chatParticipants)
      .where(
        and(
          eq(chatParticipants.userId, userId2),
          eq(chatParticipants.isDeleted, false)
        )
      );

    const commonRoomIds = user1Rooms
      .filter(r1 => user2Rooms.some(r2 => r2.roomId === r1.roomId))
      .map(r => r.roomId);

    if (commonRoomIds.length === 0) {
      return null;
    }

    // Check which of these rooms is a direct chat (only 2 participants)
    for (const roomId of commonRoomIds) {
      const participants = await this.getRoomParticipants(roomId);
      if (participants.length === 2) {
        const [room] = await this.db
          .select()
          .from(chatRooms)
          .where(eq(chatRooms.id, roomId))
          .limit(1);
        return room;
      }
    }

    return null;
  }
}
