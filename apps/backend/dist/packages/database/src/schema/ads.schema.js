"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adPlacementsRelations = exports.adPaymentsRelations = exports.adClicksRelations = exports.adImpressionsRelations = exports.adTargetingRulesRelations = exports.adsRelations = exports.adCampaignsRelations = exports.adPayments = exports.adClicks = exports.adImpressions = exports.adTargetingRules = exports.ads = exports.adPlacements = exports.adCampaigns = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const users_schema_1 = require("./users.schema");
const lookups_schema_1 = require("./lookups.schema");
exports.adCampaigns = (0, pg_core_1.pgTable)('ad_campaigns', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    uuid: (0, pg_core_1.uuid)('uuid').defaultRandom().notNull().unique(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    description: (0, pg_core_1.text)('description'),
    budget: (0, pg_core_1.decimal)('budget', { precision: 10, scale: 2 }),
    spentAmount: (0, pg_core_1.decimal)('spent_amount', { precision: 10, scale: 2 }).default('0').notNull(),
    statusId: (0, pg_core_1.bigserial)('status_id', { mode: 'number' }).references(() => lookups_schema_1.lookups.id).notNull(),
    startDate: (0, pg_core_1.timestamp)('start_date', { withTimezone: true }).notNull(),
    endDate: (0, pg_core_1.timestamp)('end_date', { withTimezone: true }),
    createdBy: (0, pg_core_1.bigserial)('created_by', { mode: 'number' }).references(() => users_schema_1.users.id).notNull(),
    isDeleted: (0, pg_core_1.boolean)('isDeleted').default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt', { withTimezone: true }).defaultNow(),
    deletedAt: (0, pg_core_1.timestamp)('deletedAt', { withTimezone: true }),
}, (table) => ({
    uuidIdx: (0, pg_core_1.index)('ad_campaigns_uuid_idx').on(table.uuid),
    createdByIdx: (0, pg_core_1.index)('ad_campaigns_created_by_idx').on(table.createdBy),
    statusIdx: (0, pg_core_1.index)('ad_campaigns_status_idx').on(table.statusId),
}));
exports.adPlacements = (0, pg_core_1.pgTable)('ad_placements', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    uuid: (0, pg_core_1.uuid)('uuid').defaultRandom().notNull().unique(),
    code: (0, pg_core_1.varchar)('code', { length: 100 }).notNull().unique(),
    nameEn: (0, pg_core_1.varchar)('name_en', { length: 255 }).notNull(),
    nameAr: (0, pg_core_1.varchar)('name_ar', { length: 255 }),
    description: (0, pg_core_1.text)('description'),
    width: (0, pg_core_1.integer)('width'),
    height: (0, pg_core_1.integer)('height'),
    maxAds: (0, pg_core_1.integer)('max_ads').default(1).notNull(),
    isActive: (0, pg_core_1.boolean)('isActive').default(true).notNull(),
    isDeleted: (0, pg_core_1.boolean)('isDeleted').default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt', { withTimezone: true }).defaultNow(),
    deletedAt: (0, pg_core_1.timestamp)('deletedAt', { withTimezone: true }),
}, (table) => ({
    uuidIdx: (0, pg_core_1.index)('ad_placements_uuid_idx').on(table.uuid),
    codeIdx: (0, pg_core_1.index)('ad_placements_code_idx').on(table.code),
}));
exports.ads = (0, pg_core_1.pgTable)('ads', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    uuid: (0, pg_core_1.uuid)('uuid').defaultRandom().notNull().unique(),
    campaignId: (0, pg_core_1.bigserial)('campaign_id', { mode: 'number' }).references(() => exports.adCampaigns.id),
    adTypeId: (0, pg_core_1.bigserial)('ad_type_id', { mode: 'number' }).references(() => lookups_schema_1.lookups.id).notNull(),
    targetType: (0, pg_core_1.varchar)('target_type', { length: 50 }),
    targetId: (0, pg_core_1.bigserial)('target_id', { mode: 'number' }),
    externalUrl: (0, pg_core_1.varchar)('external_url', { length: 500 }),
    titleEn: (0, pg_core_1.varchar)('title_en', { length: 255 }).notNull(),
    titleAr: (0, pg_core_1.varchar)('title_ar', { length: 255 }),
    descriptionEn: (0, pg_core_1.text)('description_en'),
    descriptionAr: (0, pg_core_1.text)('description_ar'),
    mediaUrl: (0, pg_core_1.varchar)('media_url', { length: 500 }),
    callToAction: (0, pg_core_1.varchar)('call_to_action', { length: 100 }),
    placementTypeId: (0, pg_core_1.bigserial)('placement_type_id', { mode: 'number' }).references(() => lookups_schema_1.lookups.id).notNull(),
    statusId: (0, pg_core_1.bigserial)('status_id', { mode: 'number' }).references(() => lookups_schema_1.lookups.id).notNull(),
    priority: (0, pg_core_1.integer)('priority').default(0).notNull(),
    startDate: (0, pg_core_1.timestamp)('start_date', { withTimezone: true }).notNull(),
    endDate: (0, pg_core_1.timestamp)('end_date', { withTimezone: true }),
    isPaid: (0, pg_core_1.boolean)('is_paid').default(false).notNull(),
    paymentStatusId: (0, pg_core_1.bigserial)('payment_status_id', { mode: 'number' }).references(() => lookups_schema_1.lookups.id),
    impressionCount: (0, pg_core_1.integer)('impression_count').default(0).notNull(),
    clickCount: (0, pg_core_1.integer)('click_count').default(0).notNull(),
    ctr: (0, pg_core_1.decimal)('ctr', { precision: 5, scale: 2 }).default('0').notNull(),
    createdBy: (0, pg_core_1.bigserial)('created_by', { mode: 'number' }).references(() => users_schema_1.users.id).notNull(),
    isDeleted: (0, pg_core_1.boolean)('isDeleted').default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt', { withTimezone: true }).defaultNow(),
    deletedAt: (0, pg_core_1.timestamp)('deletedAt', { withTimezone: true }),
}, (table) => ({
    uuidIdx: (0, pg_core_1.index)('ads_uuid_idx').on(table.uuid),
    campaignIdx: (0, pg_core_1.index)('ads_campaign_id_idx').on(table.campaignId),
    createdByIdx: (0, pg_core_1.index)('ads_created_by_idx').on(table.createdBy),
    statusIdx: (0, pg_core_1.index)('ads_status_idx').on(table.statusId),
    targetIdx: (0, pg_core_1.index)('ads_target_idx').on(table.targetType, table.targetId),
    placementIdx: (0, pg_core_1.index)('ads_placement_type_idx').on(table.placementTypeId),
    dateIdx: (0, pg_core_1.index)('ads_date_idx').on(table.startDate, table.endDate),
}));
exports.adTargetingRules = (0, pg_core_1.pgTable)('ad_targeting_rules', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    uuid: (0, pg_core_1.uuid)('uuid').defaultRandom().notNull().unique(),
    adId: (0, pg_core_1.bigserial)('ad_id', { mode: 'number' }).references(() => exports.ads.id).notNull(),
    targetUserRoles: (0, pg_core_1.jsonb)('target_user_roles'),
    targetSubscriptionPlans: (0, pg_core_1.jsonb)('target_subscription_plans'),
    targetAgeRange: (0, pg_core_1.jsonb)('target_age_range'),
    targetLocations: (0, pg_core_1.jsonb)('target_locations'),
    targetInterests: (0, pg_core_1.jsonb)('target_interests'),
    targetBehavior: (0, pg_core_1.jsonb)('target_behavior'),
    metadata: (0, pg_core_1.jsonb)('metadata'),
    isDeleted: (0, pg_core_1.boolean)('isDeleted').default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt', { withTimezone: true }).defaultNow(),
    deletedAt: (0, pg_core_1.timestamp)('deletedAt', { withTimezone: true }),
}, (table) => ({
    uuidIdx: (0, pg_core_1.index)('ad_targeting_rules_uuid_idx').on(table.uuid),
    adIdx: (0, pg_core_1.index)('ad_targeting_rules_ad_id_idx').on(table.adId),
}));
exports.adImpressions = (0, pg_core_1.pgTable)('ad_impressions', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    uuid: (0, pg_core_1.uuid)('uuid').defaultRandom().notNull().unique(),
    adId: (0, pg_core_1.bigserial)('ad_id', { mode: 'number' }).references(() => exports.ads.id).notNull(),
    userId: (0, pg_core_1.bigserial)('userId', { mode: 'number' }).references(() => users_schema_1.users.id),
    sessionId: (0, pg_core_1.varchar)('session_id', { length: 255 }),
    placementId: (0, pg_core_1.bigserial)('placement_id', { mode: 'number' }).references(() => exports.adPlacements.id),
    ipAddress: (0, pg_core_1.varchar)('ip_address', { length: 45 }),
    userAgent: (0, pg_core_1.text)('user_agent'),
    viewedAt: (0, pg_core_1.timestamp)('viewed_at', { withTimezone: true }).defaultNow().notNull(),
    metadata: (0, pg_core_1.jsonb)('metadata'),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    uuidIdx: (0, pg_core_1.index)('ad_impressions_uuid_idx').on(table.uuid),
    adIdx: (0, pg_core_1.index)('ad_impressions_ad_id_idx').on(table.adId),
    userIdx: (0, pg_core_1.index)('ad_impressions_userId_idx').on(table.userId),
    sessionIdx: (0, pg_core_1.index)('ad_impressions_session_id_idx').on(table.sessionId),
    dateIdx: (0, pg_core_1.index)('ad_impressions_viewed_at_idx').on(table.viewedAt),
}));
exports.adClicks = (0, pg_core_1.pgTable)('ad_clicks', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    uuid: (0, pg_core_1.uuid)('uuid').defaultRandom().notNull().unique(),
    adId: (0, pg_core_1.bigserial)('ad_id', { mode: 'number' }).references(() => exports.ads.id).notNull(),
    impressionId: (0, pg_core_1.bigserial)('impression_id', { mode: 'number' }).references(() => exports.adImpressions.id),
    userId: (0, pg_core_1.bigserial)('userId', { mode: 'number' }).references(() => users_schema_1.users.id),
    sessionId: (0, pg_core_1.varchar)('session_id', { length: 255 }),
    clickedAt: (0, pg_core_1.timestamp)('clicked_at', { withTimezone: true }).defaultNow().notNull(),
    referrer: (0, pg_core_1.text)('referrer'),
    destinationUrl: (0, pg_core_1.varchar)('destination_url', { length: 500 }),
    converted: (0, pg_core_1.boolean)('converted').default(false).notNull(),
    metadata: (0, pg_core_1.jsonb)('metadata'),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    uuidIdx: (0, pg_core_1.index)('ad_clicks_uuid_idx').on(table.uuid),
    adIdx: (0, pg_core_1.index)('ad_clicks_ad_id_idx').on(table.adId),
    impressionIdx: (0, pg_core_1.index)('ad_clicks_impression_id_idx').on(table.impressionId),
    userIdx: (0, pg_core_1.index)('ad_clicks_userId_idx').on(table.userId),
    sessionIdx: (0, pg_core_1.index)('ad_clicks_session_id_idx').on(table.sessionId),
    dateIdx: (0, pg_core_1.index)('ad_clicks_clicked_at_idx').on(table.clickedAt),
}));
exports.adPayments = (0, pg_core_1.pgTable)('ad_payments', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    uuid: (0, pg_core_1.uuid)('uuid').defaultRandom().notNull().unique(),
    campaignId: (0, pg_core_1.bigserial)('campaign_id', { mode: 'number' }).references(() => exports.adCampaigns.id).notNull(),
    userId: (0, pg_core_1.bigserial)('userId', { mode: 'number' }).references(() => users_schema_1.users.id).notNull(),
    amount: (0, pg_core_1.decimal)('amount', { precision: 10, scale: 2 }).notNull(),
    currency: (0, pg_core_1.varchar)('currency', { length: 3 }).default('USD').notNull(),
    paymentMethod: (0, pg_core_1.varchar)('payment_method', { length: 50 }),
    transactionId: (0, pg_core_1.varchar)('transaction_id', { length: 255 }),
    paymentStatusId: (0, pg_core_1.bigserial)('payment_status_id', { mode: 'number' }).references(() => lookups_schema_1.lookups.id).notNull(),
    paidAt: (0, pg_core_1.timestamp)('paid_at', { withTimezone: true }),
    metadata: (0, pg_core_1.jsonb)('metadata'),
    isDeleted: (0, pg_core_1.boolean)('isDeleted').default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt', { withTimezone: true }).defaultNow(),
    deletedAt: (0, pg_core_1.timestamp)('deletedAt', { withTimezone: true }),
}, (table) => ({
    uuidIdx: (0, pg_core_1.index)('ad_payments_uuid_idx').on(table.uuid),
    campaignIdx: (0, pg_core_1.index)('ad_payments_campaign_id_idx').on(table.campaignId),
    userIdx: (0, pg_core_1.index)('ad_payments_userId_idx').on(table.userId),
    statusIdx: (0, pg_core_1.index)('ad_payments_status_idx').on(table.paymentStatusId),
}));
exports.adCampaignsRelations = (0, drizzle_orm_1.relations)(exports.adCampaigns, ({ one, many }) => ({
    creator: one(users_schema_1.users, {
        fields: [exports.adCampaigns.createdBy],
        references: [users_schema_1.users.id],
    }),
    status: one(lookups_schema_1.lookups, {
        fields: [exports.adCampaigns.statusId],
        references: [lookups_schema_1.lookups.id],
    }),
    ads: many(exports.ads),
    payments: many(exports.adPayments),
}));
exports.adsRelations = (0, drizzle_orm_1.relations)(exports.ads, ({ one, many }) => ({
    campaign: one(exports.adCampaigns, {
        fields: [exports.ads.campaignId],
        references: [exports.adCampaigns.id],
    }),
    creator: one(users_schema_1.users, {
        fields: [exports.ads.createdBy],
        references: [users_schema_1.users.id],
    }),
    adType: one(lookups_schema_1.lookups, {
        fields: [exports.ads.adTypeId],
        references: [lookups_schema_1.lookups.id],
    }),
    placementType: one(lookups_schema_1.lookups, {
        fields: [exports.ads.placementTypeId],
        references: [lookups_schema_1.lookups.id],
    }),
    status: one(lookups_schema_1.lookups, {
        fields: [exports.ads.statusId],
        references: [lookups_schema_1.lookups.id],
    }),
    paymentStatus: one(lookups_schema_1.lookups, {
        fields: [exports.ads.paymentStatusId],
        references: [lookups_schema_1.lookups.id],
    }),
    targetingRules: many(exports.adTargetingRules),
    impressions: many(exports.adImpressions),
    clicks: many(exports.adClicks),
}));
exports.adTargetingRulesRelations = (0, drizzle_orm_1.relations)(exports.adTargetingRules, ({ one }) => ({
    ad: one(exports.ads, {
        fields: [exports.adTargetingRules.adId],
        references: [exports.ads.id],
    }),
}));
exports.adImpressionsRelations = (0, drizzle_orm_1.relations)(exports.adImpressions, ({ one, many }) => ({
    ad: one(exports.ads, {
        fields: [exports.adImpressions.adId],
        references: [exports.ads.id],
    }),
    user: one(users_schema_1.users, {
        fields: [exports.adImpressions.userId],
        references: [users_schema_1.users.id],
    }),
    placement: one(exports.adPlacements, {
        fields: [exports.adImpressions.placementId],
        references: [exports.adPlacements.id],
    }),
    clicks: many(exports.adClicks),
}));
exports.adClicksRelations = (0, drizzle_orm_1.relations)(exports.adClicks, ({ one }) => ({
    ad: one(exports.ads, {
        fields: [exports.adClicks.adId],
        references: [exports.ads.id],
    }),
    impression: one(exports.adImpressions, {
        fields: [exports.adClicks.impressionId],
        references: [exports.adImpressions.id],
    }),
    user: one(users_schema_1.users, {
        fields: [exports.adClicks.userId],
        references: [users_schema_1.users.id],
    }),
}));
exports.adPaymentsRelations = (0, drizzle_orm_1.relations)(exports.adPayments, ({ one }) => ({
    campaign: one(exports.adCampaigns, {
        fields: [exports.adPayments.campaignId],
        references: [exports.adCampaigns.id],
    }),
    user: one(users_schema_1.users, {
        fields: [exports.adPayments.userId],
        references: [users_schema_1.users.id],
    }),
    paymentStatus: one(lookups_schema_1.lookups, {
        fields: [exports.adPayments.paymentStatusId],
        references: [lookups_schema_1.lookups.id],
    }),
}));
exports.adPlacementsRelations = (0, drizzle_orm_1.relations)(exports.adPlacements, ({ many }) => ({
    impressions: many(exports.adImpressions),
}));
//# sourceMappingURL=ads.schema.js.map