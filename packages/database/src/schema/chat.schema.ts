import { pgTable, bigserial, uuid, varchar, text, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';
import { lookups } from './lookups.schema';

// Chat Rooms Table
export const chatRooms = pgTable('chat_rooms', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  name: varchar('name', { length: 255 }),
  chatTypeId: bigserial('chat_type_id', { mode: 'number' }).references(() => lookups.id).notNull(),
  roomableType: varchar('roomable_type', { length: 50 }),
  roomableId: bigserial('roomable_id', { mode: 'number' }),
  createdBy: bigserial('created_by', { mode: 'number' }).references(() => users.id).notNull(),
  lastMessageAt: timestamp('last_message_at', { withTimezone: true }),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ({
  uuidIdx: index('chat_rooms_uuid_idx').on(table.uuid),
  createdByIdx: index('chat_rooms_created_by_idx').on(table.createdBy),
  roomableIdx: index('chat_rooms_roomable_idx').on(table.roomableType, table.roomableId),
}));

// Chat Participants Table
export const chatParticipants = pgTable('chat_participants', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  chatRoomId: bigserial('chat_room_id', { mode: 'number' }).references(() => chatRooms.id).notNull(),
  userId: bigserial('userId', { mode: 'number' }).references(() => users.id).notNull(),
  isAdmin: boolean('is_admin').default(false).notNull(),
  isMuted: boolean('is_muted').default(false).notNull(),
  joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow(),
  leftAt: timestamp('left_at', { withTimezone: true }),
  lastReadAt: timestamp('last_read_at', { withTimezone: true }),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ({
  uuidIdx: index('chat_participants_uuid_idx').on(table.uuid),
  roomIdx: index('chat_participants_room_id_idx').on(table.chatRoomId),
  userIdx: index('chat_participants_userId_idx').on(table.userId),
}));

// Chat Messages Table
export const chatMessages = pgTable('chat_messages', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  chatRoomId: bigserial('chat_room_id', { mode: 'number' }).references(() => chatRooms.id).notNull(),
  userId: bigserial('userId', { mode: 'number' }).references(() => users.id).notNull(),
  content: text('content'),
  attachmentUrl: varchar('attachment_url', { length: 500 }),
  messageTypeId: bigserial('message_type_id', { mode: 'number' }).references(() => lookups.id).notNull(),
  replyToMessageId: bigserial('reply_to_message_id', { mode: 'number' }).references((): any => chatMessages.id),
  isEdited: boolean('is_edited').default(false).notNull(),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  editedAt: timestamp('edited_at', { withTimezone: true }),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ({
  uuidIdx: index('chat_messages_uuid_idx').on(table.uuid),
  roomIdx: index('chat_messages_room_id_idx').on(table.chatRoomId),
  userIdx: index('chat_messages_userId_idx').on(table.userId),
}));

// Message Reads Table
export const messageReads = pgTable('message_reads', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  messageId: bigserial('message_id', { mode: 'number' }).references(() => chatMessages.id).notNull(),
  userId: bigserial('userId', { mode: 'number' }).references(() => users.id).notNull(),
  readAt: timestamp('read_at', { withTimezone: true }).defaultNow(),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ({
  uuidIdx: index('message_reads_uuid_idx').on(table.uuid),
  messageIdx: index('message_reads_message_id_idx').on(table.messageId),
  userIdx: index('message_reads_userId_idx').on(table.userId),
}));

// Relations
export const chatRoomsRelations = relations(chatRooms, ({ one, many }) => ({
  creator: one(users, {
    fields: [chatRooms.createdBy],
    references: [users.id],
  }),
  chatType: one(lookups, {
    fields: [chatRooms.chatTypeId],
    references: [lookups.id],
  }),
  participants: many(chatParticipants),
  messages: many(chatMessages),
}));

export const chatParticipantsRelations = relations(chatParticipants, ({ one }) => ({
  chatRoom: one(chatRooms, {
    fields: [chatParticipants.chatRoomId],
    references: [chatRooms.id],
  }),
  user: one(users, {
    fields: [chatParticipants.userId],
    references: [users.id],
  }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one, many }) => ({
  chatRoom: one(chatRooms, {
    fields: [chatMessages.chatRoomId],
    references: [chatRooms.id],
  }),
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.id],
  }),
  messageType: one(lookups, {
    fields: [chatMessages.messageTypeId],
    references: [lookups.id],
  }),
  replyTo: one(chatMessages, {
    fields: [chatMessages.replyToMessageId],
    references: [chatMessages.id],
  }),
  reads: many(messageReads),
}));
