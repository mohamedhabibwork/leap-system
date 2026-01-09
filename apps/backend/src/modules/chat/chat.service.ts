import { Injectable, NotFoundException, ForbiddenException, Inject, BadRequestException } from '@nestjs/common';
import { eq, and, desc, sql, inArray, or } from 'drizzle-orm';
import { chatRooms, chatMessages, chatParticipants, users } from '@leap-lms/database';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { CreateRoomDto, SendMessageDto, GetMessagesDto } from './dto';
import { ChatRoom, ChatMessage } from './entities';

@Injectable()
export class ChatService {
  constructor(
    @Inject('DRIZZLE_DB')
    private readonly db: NodePgDatabase<any>,
  ) {}

  /**
   * Get all chat rooms for a user
   */
  async getRoomsByUserId(userId: number): Promise<any[]> {
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
        const [participants, lastMessage, unreadCount] = await Promise.all([
          this.getRoomParticipants(room.id),
          this.getLastMessage(room.id),
          this.getUnreadCount(room.id, userId),
        ]);

        return {
          ...room,
          participants: participants.map(p => p.userId),
          lastMessage,
          unreadCount,
        };
      })
    );

    return enhancedRooms;
  }

  /**
   * Get a single chat room by ID
   */
  async getRoomById(roomId: number, userId: number): Promise<any> {
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
      participants: participants.map(p => p.userId),
      lastMessage,
      unreadCount,
    };
  }

  /**
   * Create a new chat room
   */
  async createRoom(dto: CreateRoomDto, userId: number): Promise<any> {
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
      } as any)
      .returning();

    // Add participants
    const participantValues = allParticipantIds.map(participantId => ({
      chatRoomId: newRoom.id,
      userId: participantId,
      isAdmin: participantId === userId,
    }));

    await this.db
      .insert(chatParticipants)
      .values(participantValues as any);

    return this.getRoomById(newRoom.id, userId);
  }

  /**
   * Get messages for a room
   */
  async getMessages(roomId: number, userId: number, dto: GetMessagesDto): Promise<any[]> {
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
        firstName: msg.senderFirstName,
        lastName: msg.senderLastName,
        avatar: msg.senderAvatar,
      },
    })).reverse(); // Reverse to show oldest first
  }

  /**
   * Send a message (REST fallback)
   */
  async sendMessage(dto: SendMessageDto, userId: number): Promise<any> {
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
      } as any)
      .returning();

    // Update room's last message timestamp
    await this.db
      .update(chatRooms)
      .set({ lastMessageAt: new Date() })
      .where(eq(chatRooms.id, dto.roomId));

    // Get sender info
    const [sender] = await this.db
      .select({
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
      return Number(result.count);
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

    return Number(result.count);
  }

  /**
   * Helper: Get room participants
   */
  private async getRoomParticipants(roomId: number): Promise<any[]> {
    return this.db
      .select()
      .from(chatParticipants)
      .where(
        and(
          eq(chatParticipants.chatRoomId, roomId),
          eq(chatParticipants.isDeleted, false)
        )
      );
  }

  /**
   * Helper: Get last message in a room
   */
  private async getLastMessage(roomId: number): Promise<any | null> {
    const [message] = await this.db
      .select({
        id: chatMessages.id,
        content: chatMessages.content,
        createdAt: chatMessages.createdAt,
        senderId: chatMessages.userId,
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

    return message || null;
  }

  /**
   * Helper: Find existing direct chat room between two users
   */
  private async findExistingDirectRoom(userId1: number, userId2: number): Promise<any | null> {
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
