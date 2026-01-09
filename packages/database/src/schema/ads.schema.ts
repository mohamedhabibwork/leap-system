import { pgTable, bigserial, uuid, varchar, text, timestamp, boolean, integer, jsonb, index, decimal } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';
import { lookups } from './lookups.schema';

// Ad Campaigns Table
export const adCampaigns = pgTable('ad_campaigns', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  budget: decimal('budget', { precision: 10, scale: 2 }),
  spentAmount: decimal('spent_amount', { precision: 10, scale: 2 }).default('0').notNull(),
  statusId: bigserial('status_id', { mode: 'number' }).references(() => lookups.id).notNull(),
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }),
  createdBy: bigserial('created_by', { mode: 'number' }).references(() => users.id).notNull(),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ({
  uuidIdx: index('ad_campaigns_uuid_idx').on(table.uuid),
  createdByIdx: index('ad_campaigns_created_by_idx').on(table.createdBy),
  statusIdx: index('ad_campaigns_status_idx').on(table.statusId),
}));

// Ad Placements Table
export const adPlacements = pgTable('ad_placements', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  code: varchar('code', { length: 100 }).notNull().unique(),
  nameEn: varchar('name_en', { length: 255 }).notNull(),
  nameAr: varchar('name_ar', { length: 255 }),
  description: text('description'),
  width: integer('width'),
  height: integer('height'),
  maxAds: integer('max_ads').default(1).notNull(),
  isActive: boolean('isActive').default(true).notNull(),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ({
  uuidIdx: index('ad_placements_uuid_idx').on(table.uuid),
  codeIdx: index('ad_placements_code_idx').on(table.code),
}));

// Ads Table
export const ads = pgTable('ads', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  campaignId: bigserial('campaign_id', { mode: 'number' }).references(() => adCampaigns.id),
  adTypeId: bigserial('ad_type_id', { mode: 'number' }).references(() => lookups.id).notNull(),
  
  // Polymorphic relationship for target entity (course, event, job, post, etc.)
  targetType: varchar('target_type', { length: 50 }), // 'course', 'event', 'job', 'post', 'external'
  targetId: bigserial('target_id', { mode: 'number' }),
  externalUrl: varchar('external_url', { length: 500 }),
  
  titleEn: varchar('title_en', { length: 255 }).notNull(),
  titleAr: varchar('title_ar', { length: 255 }),
  descriptionEn: text('description_en'),
  descriptionAr: text('description_ar'),
  mediaUrl: varchar('media_url', { length: 500 }),
  callToAction: varchar('call_to_action', { length: 100 }),
  
  placementTypeId: bigserial('placement_type_id', { mode: 'number' }).references(() => lookups.id).notNull(),
  statusId: bigserial('status_id', { mode: 'number' }).references(() => lookups.id).notNull(),
  priority: integer('priority').default(0).notNull(),
  
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }),
  
  isPaid: boolean('is_paid').default(false).notNull(),
  paymentStatusId: bigserial('payment_status_id', { mode: 'number' }).references(() => lookups.id),
  
  impressionCount: integer('impression_count').default(0).notNull(),
  clickCount: integer('click_count').default(0).notNull(),
  ctr: decimal('ctr', { precision: 5, scale: 2 }).default('0').notNull(), // Click-through rate percentage
  
  createdBy: bigserial('created_by', { mode: 'number' }).references(() => users.id).notNull(),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ({
  uuidIdx: index('ads_uuid_idx').on(table.uuid),
  campaignIdx: index('ads_campaign_id_idx').on(table.campaignId),
  createdByIdx: index('ads_created_by_idx').on(table.createdBy),
  statusIdx: index('ads_status_idx').on(table.statusId),
  targetIdx: index('ads_target_idx').on(table.targetType, table.targetId),
  placementIdx: index('ads_placement_type_idx').on(table.placementTypeId),
  dateIdx: index('ads_date_idx').on(table.startDate, table.endDate),
}));

// Ad Targeting Rules Table
export const adTargetingRules = pgTable('ad_targeting_rules', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  adId: bigserial('ad_id', { mode: 'number' }).references(() => ads.id).notNull(),
  
  // Targeting criteria stored as JSON arrays/objects
  targetUserRoles: jsonb('target_user_roles'), // ['admin', 'instructor', 'user']
  targetSubscriptionPlans: jsonb('target_subscription_plans'), // [1, 2, 3]
  targetAgeRange: jsonb('target_age_range'), // { min: 18, max: 65 }
  targetLocations: jsonb('target_locations'), // ['US', 'UK', 'CA']
  targetInterests: jsonb('target_interests'), // ['technology', 'business']
  targetBehavior: jsonb('target_behavior'), // { enrolledCourses: true, activeInDays: 30 }
  
  metadata: jsonb('metadata'), // Additional flexible criteria
  
  isDeleted: boolean('isDeleted').default(false).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ({
  uuidIdx: index('ad_targeting_rules_uuid_idx').on(table.uuid),
  adIdx: index('ad_targeting_rules_ad_id_idx').on(table.adId),
}));

// Ad Impressions Table (Track when ads are shown)
export const adImpressions = pgTable('ad_impressions', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  adId: bigserial('ad_id', { mode: 'number' }).references(() => ads.id).notNull(),
  userId: bigserial('userId', { mode: 'number' }).references(() => users.id), // Nullable for anonymous users
  sessionId: varchar('session_id', { length: 255 }),
  placementId: bigserial('placement_id', { mode: 'number' }).references(() => adPlacements.id),
  
  ipAddress: varchar('ip_address', { length: 45 }), // IPv4 or IPv6
  userAgent: text('user_agent'),
  viewedAt: timestamp('viewed_at', { withTimezone: true }).defaultNow().notNull(),
  
  metadata: jsonb('metadata'), // Additional tracking data
  
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uuidIdx: index('ad_impressions_uuid_idx').on(table.uuid),
  adIdx: index('ad_impressions_ad_id_idx').on(table.adId),
  userIdx: index('ad_impressions_userId_idx').on(table.userId),
  sessionIdx: index('ad_impressions_session_id_idx').on(table.sessionId),
  dateIdx: index('ad_impressions_viewed_at_idx').on(table.viewedAt),
}));

// Ad Clicks Table (Track when ads are clicked)
export const adClicks = pgTable('ad_clicks', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  adId: bigserial('ad_id', { mode: 'number' }).references(() => ads.id).notNull(),
  impressionId: bigserial('impression_id', { mode: 'number' }).references(() => adImpressions.id),
  userId: bigserial('userId', { mode: 'number' }).references(() => users.id), // Nullable for anonymous users
  sessionId: varchar('session_id', { length: 255 }),
  
  clickedAt: timestamp('clicked_at', { withTimezone: true }).defaultNow().notNull(),
  referrer: text('referrer'),
  destinationUrl: varchar('destination_url', { length: 500 }),
  converted: boolean('converted').default(false).notNull(), // For future conversion tracking
  
  metadata: jsonb('metadata'),
  
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uuidIdx: index('ad_clicks_uuid_idx').on(table.uuid),
  adIdx: index('ad_clicks_ad_id_idx').on(table.adId),
  impressionIdx: index('ad_clicks_impression_id_idx').on(table.impressionId),
  userIdx: index('ad_clicks_userId_idx').on(table.userId),
  sessionIdx: index('ad_clicks_session_id_idx').on(table.sessionId),
  dateIdx: index('ad_clicks_clicked_at_idx').on(table.clickedAt),
}));

// Ad Payments Table (Track payments for paid ads)
export const adPayments = pgTable('ad_payments', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  campaignId: bigserial('campaign_id', { mode: 'number' }).references(() => adCampaigns.id).notNull(),
  userId: bigserial('userId', { mode: 'number' }).references(() => users.id).notNull(),
  
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  paymentMethod: varchar('payment_method', { length: 50 }),
  transactionId: varchar('transaction_id', { length: 255 }),
  paymentStatusId: bigserial('payment_status_id', { mode: 'number' }).references(() => lookups.id).notNull(),
  
  paidAt: timestamp('paid_at', { withTimezone: true }),
  
  metadata: jsonb('metadata'),
  
  isDeleted: boolean('isDeleted').default(false).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ({
  uuidIdx: index('ad_payments_uuid_idx').on(table.uuid),
  campaignIdx: index('ad_payments_campaign_id_idx').on(table.campaignId),
  userIdx: index('ad_payments_userId_idx').on(table.userId),
  statusIdx: index('ad_payments_status_idx').on(table.paymentStatusId),
}));

// Relations
export const adCampaignsRelations = relations(adCampaigns, ({ one, many }) => ({
  creator: one(users, {
    fields: [adCampaigns.createdBy],
    references: [users.id],
  }),
  status: one(lookups, {
    fields: [adCampaigns.statusId],
    references: [lookups.id],
  }),
  ads: many(ads),
  payments: many(adPayments),
}));

export const adsRelations = relations(ads, ({ one, many }) => ({
  campaign: one(adCampaigns, {
    fields: [ads.campaignId],
    references: [adCampaigns.id],
  }),
  creator: one(users, {
    fields: [ads.createdBy],
    references: [users.id],
  }),
  adType: one(lookups, {
    fields: [ads.adTypeId],
    references: [lookups.id],
  }),
  placementType: one(lookups, {
    fields: [ads.placementTypeId],
    references: [lookups.id],
  }),
  status: one(lookups, {
    fields: [ads.statusId],
    references: [lookups.id],
  }),
  paymentStatus: one(lookups, {
    fields: [ads.paymentStatusId],
    references: [lookups.id],
  }),
  targetingRules: many(adTargetingRules),
  impressions: many(adImpressions),
  clicks: many(adClicks),
}));

export const adTargetingRulesRelations = relations(adTargetingRules, ({ one }) => ({
  ad: one(ads, {
    fields: [adTargetingRules.adId],
    references: [ads.id],
  }),
}));

export const adImpressionsRelations = relations(adImpressions, ({ one, many }) => ({
  ad: one(ads, {
    fields: [adImpressions.adId],
    references: [ads.id],
  }),
  user: one(users, {
    fields: [adImpressions.userId],
    references: [users.id],
  }),
  placement: one(adPlacements, {
    fields: [adImpressions.placementId],
    references: [adPlacements.id],
  }),
  clicks: many(adClicks),
}));

export const adClicksRelations = relations(adClicks, ({ one }) => ({
  ad: one(ads, {
    fields: [adClicks.adId],
    references: [ads.id],
  }),
  impression: one(adImpressions, {
    fields: [adClicks.impressionId],
    references: [adImpressions.id],
  }),
  user: one(users, {
    fields: [adClicks.userId],
    references: [users.id],
  }),
}));

export const adPaymentsRelations = relations(adPayments, ({ one }) => ({
  campaign: one(adCampaigns, {
    fields: [adPayments.campaignId],
    references: [adCampaigns.id],
  }),
  user: one(users, {
    fields: [adPayments.userId],
    references: [users.id],
  }),
  paymentStatus: one(lookups, {
    fields: [adPayments.paymentStatusId],
    references: [lookups.id],
  }),
}));

export const adPlacementsRelations = relations(adPlacements, ({ many }) => ({
  impressions: many(adImpressions),
}));
