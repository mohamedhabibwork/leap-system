import { pgTable, bigserial, uuid, varchar, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';
import { lookups } from './lookups.schema';
import { groups } from './social.schema';

// Shares Table (Universal/Polymorphic)
export const shares = pgTable('shares', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  userId: bigserial('userId', { mode: 'number' }).references(() => users.id).notNull(),
  shareableType: varchar('shareable_type', { length: 50 }).notNull(),
  shareableId: bigserial('shareable_id', { mode: 'number' }).notNull(),
  shareTypeId: bigserial('share_type_id', { mode: 'number' }).references(() => lookups.id).notNull(),
  sharedToGroupId: bigserial('shared_to_group_id', { mode: 'number' }).references(() => groups.id),
  externalPlatform: varchar('external_platform', { length: 50 }),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ({
  uuidIdx: index('shares_uuid_idx').on(table.uuid),
  userIdx: index('shares_userId_idx').on(table.userId),
  shareableIdx: index('shares_shareable_idx').on(table.shareableType, table.shareableId),
}));

// Relations
export const sharesRelations = relations(shares, ({ one }) => ({
  user: one(users, {
    fields: [shares.userId],
    references: [users.id],
  }),
  shareType: one(lookups, {
    fields: [shares.shareTypeId],
    references: [lookups.id],
  }),
  sharedToGroup: one(groups, {
    fields: [shares.sharedToGroupId],
    references: [groups.id],
  }),
}));
