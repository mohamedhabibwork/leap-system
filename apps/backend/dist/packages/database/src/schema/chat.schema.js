"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatMessagesRelations = exports.chatParticipantsRelations = exports.chatRoomsRelations = exports.messageReads = exports.chatMessages = exports.chatParticipants = exports.chatRooms = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const users_schema_1 = require("./users.schema");
const lookups_schema_1 = require("./lookups.schema");
exports.chatRooms = (0, pg_core_1.pgTable)('chat_rooms', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    uuid: (0, pg_core_1.uuid)('uuid').defaultRandom().notNull().unique(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }),
    chatTypeId: (0, pg_core_1.bigserial)('chat_type_id', { mode: 'number' }).references(() => lookups_schema_1.lookups.id).notNull(),
    roomableType: (0, pg_core_1.varchar)('roomable_type', { length: 50 }),
    roomableId: (0, pg_core_1.bigserial)('roomable_id', { mode: 'number' }),
    createdBy: (0, pg_core_1.bigserial)('created_by', { mode: 'number' }).references(() => users_schema_1.users.id).notNull(),
    lastMessageAt: (0, pg_core_1.timestamp)('last_message_at', { withTimezone: true }),
    isDeleted: (0, pg_core_1.boolean)('isDeleted').default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt', { withTimezone: true }).defaultNow(),
    deletedAt: (0, pg_core_1.timestamp)('deletedAt', { withTimezone: true }),
}, (table) => ({
    uuidIdx: (0, pg_core_1.index)('chat_rooms_uuid_idx').on(table.uuid),
    createdByIdx: (0, pg_core_1.index)('chat_rooms_created_by_idx').on(table.createdBy),
    roomableIdx: (0, pg_core_1.index)('chat_rooms_roomable_idx').on(table.roomableType, table.roomableId),
}));
exports.chatParticipants = (0, pg_core_1.pgTable)('chat_participants', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    uuid: (0, pg_core_1.uuid)('uuid').defaultRandom().notNull().unique(),
    chatRoomId: (0, pg_core_1.bigserial)('chat_room_id', { mode: 'number' }).references(() => exports.chatRooms.id).notNull(),
    userId: (0, pg_core_1.bigserial)('userId', { mode: 'number' }).references(() => users_schema_1.users.id).notNull(),
    isAdmin: (0, pg_core_1.boolean)('is_admin').default(false).notNull(),
    isMuted: (0, pg_core_1.boolean)('is_muted').default(false).notNull(),
    joinedAt: (0, pg_core_1.timestamp)('joined_at', { withTimezone: true }).defaultNow(),
    leftAt: (0, pg_core_1.timestamp)('left_at', { withTimezone: true }),
    lastReadAt: (0, pg_core_1.timestamp)('last_read_at', { withTimezone: true }),
    isDeleted: (0, pg_core_1.boolean)('isDeleted').default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: (0, pg_core_1.timestamp)('deletedAt', { withTimezone: true }),
}, (table) => ({
    uuidIdx: (0, pg_core_1.index)('chat_participants_uuid_idx').on(table.uuid),
    roomIdx: (0, pg_core_1.index)('chat_participants_room_id_idx').on(table.chatRoomId),
    userIdx: (0, pg_core_1.index)('chat_participants_userId_idx').on(table.userId),
}));
exports.chatMessages = (0, pg_core_1.pgTable)('chat_messages', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    uuid: (0, pg_core_1.uuid)('uuid').defaultRandom().notNull().unique(),
    chatRoomId: (0, pg_core_1.bigserial)('chat_room_id', { mode: 'number' }).references(() => exports.chatRooms.id).notNull(),
    userId: (0, pg_core_1.bigserial)('userId', { mode: 'number' }).references(() => users_schema_1.users.id).notNull(),
    content: (0, pg_core_1.text)('content'),
    attachmentUrl: (0, pg_core_1.varchar)('attachment_url', { length: 500 }),
    messageTypeId: (0, pg_core_1.bigserial)('message_type_id', { mode: 'number' }).references(() => lookups_schema_1.lookups.id).notNull(),
    replyToMessageId: (0, pg_core_1.bigserial)('reply_to_message_id', { mode: 'number' }).references(() => exports.chatMessages.id),
    isEdited: (0, pg_core_1.boolean)('is_edited').default(false).notNull(),
    isDeleted: (0, pg_core_1.boolean)('isDeleted').default(false).notNull(),
    editedAt: (0, pg_core_1.timestamp)('edited_at', { withTimezone: true }),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: (0, pg_core_1.timestamp)('deletedAt', { withTimezone: true }),
}, (table) => ({
    uuidIdx: (0, pg_core_1.index)('chat_messages_uuid_idx').on(table.uuid),
    roomIdx: (0, pg_core_1.index)('chat_messages_room_id_idx').on(table.chatRoomId),
    userIdx: (0, pg_core_1.index)('chat_messages_userId_idx').on(table.userId),
}));
exports.messageReads = (0, pg_core_1.pgTable)('message_reads', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    uuid: (0, pg_core_1.uuid)('uuid').defaultRandom().notNull().unique(),
    messageId: (0, pg_core_1.bigserial)('message_id', { mode: 'number' }).references(() => exports.chatMessages.id).notNull(),
    userId: (0, pg_core_1.bigserial)('userId', { mode: 'number' }).references(() => users_schema_1.users.id).notNull(),
    readAt: (0, pg_core_1.timestamp)('read_at', { withTimezone: true }).defaultNow(),
    isDeleted: (0, pg_core_1.boolean)('isDeleted').default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: (0, pg_core_1.timestamp)('deletedAt', { withTimezone: true }),
}, (table) => ({
    uuidIdx: (0, pg_core_1.index)('message_reads_uuid_idx').on(table.uuid),
    messageIdx: (0, pg_core_1.index)('message_reads_message_id_idx').on(table.messageId),
    userIdx: (0, pg_core_1.index)('message_reads_userId_idx').on(table.userId),
}));
exports.chatRoomsRelations = (0, drizzle_orm_1.relations)(exports.chatRooms, ({ one, many }) => ({
    creator: one(users_schema_1.users, {
        fields: [exports.chatRooms.createdBy],
        references: [users_schema_1.users.id],
    }),
    chatType: one(lookups_schema_1.lookups, {
        fields: [exports.chatRooms.chatTypeId],
        references: [lookups_schema_1.lookups.id],
    }),
    participants: many(exports.chatParticipants),
    messages: many(exports.chatMessages),
}));
exports.chatParticipantsRelations = (0, drizzle_orm_1.relations)(exports.chatParticipants, ({ one }) => ({
    chatRoom: one(exports.chatRooms, {
        fields: [exports.chatParticipants.chatRoomId],
        references: [exports.chatRooms.id],
    }),
    user: one(users_schema_1.users, {
        fields: [exports.chatParticipants.userId],
        references: [users_schema_1.users.id],
    }),
}));
exports.chatMessagesRelations = (0, drizzle_orm_1.relations)(exports.chatMessages, ({ one, many }) => ({
    chatRoom: one(exports.chatRooms, {
        fields: [exports.chatMessages.chatRoomId],
        references: [exports.chatRooms.id],
    }),
    user: one(users_schema_1.users, {
        fields: [exports.chatMessages.userId],
        references: [users_schema_1.users.id],
    }),
    messageType: one(lookups_schema_1.lookups, {
        fields: [exports.chatMessages.messageTypeId],
        references: [lookups_schema_1.lookups.id],
    }),
    replyTo: one(exports.chatMessages, {
        fields: [exports.chatMessages.replyToMessageId],
        references: [exports.chatMessages.id],
    }),
    reads: many(exports.messageReads),
}));
//# sourceMappingURL=chat.schema.js.map