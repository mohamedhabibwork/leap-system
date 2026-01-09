"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentHistoryRelations = exports.subscriptionsRelations = exports.planFeaturesRelations = exports.plansRelations = exports.paymentHistory = exports.subscriptions = exports.planFeatures = exports.plans = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const lookups_schema_1 = require("./lookups.schema");
const users_schema_1 = require("./users.schema");
exports.plans = (0, pg_core_1.pgTable)('plans', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    uuid: (0, pg_core_1.uuid)('uuid').defaultRandom().notNull().unique(),
    nameEn: (0, pg_core_1.varchar)('name_en', { length: 255 }).notNull(),
    nameAr: (0, pg_core_1.varchar)('name_ar', { length: 255 }),
    descriptionEn: (0, pg_core_1.text)('description_en'),
    descriptionAr: (0, pg_core_1.text)('description_ar'),
    priceMonthly: (0, pg_core_1.decimal)('price_monthly', { precision: 10, scale: 2 }),
    priceQuarterly: (0, pg_core_1.decimal)('price_quarterly', { precision: 10, scale: 2 }),
    priceAnnual: (0, pg_core_1.decimal)('price_annual', { precision: 10, scale: 2 }),
    maxCourses: (0, pg_core_1.integer)('max_courses'),
    isActive: (0, pg_core_1.boolean)('isActive').default(true).notNull(),
    isDeleted: (0, pg_core_1.boolean)('isDeleted').default(false).notNull(),
    displayOrder: (0, pg_core_1.integer)('display_order').default(0),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt', { withTimezone: true }).defaultNow(),
    deletedAt: (0, pg_core_1.timestamp)('deletedAt', { withTimezone: true }),
}, (table) => ({
    uuidIdx: (0, pg_core_1.index)('plans_uuid_idx').on(table.uuid),
}));
exports.planFeatures = (0, pg_core_1.pgTable)('plan_features', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    uuid: (0, pg_core_1.uuid)('uuid').defaultRandom().notNull().unique(),
    planId: (0, pg_core_1.bigserial)('plan_id', { mode: 'number' }).references(() => exports.plans.id).notNull(),
    featureId: (0, pg_core_1.bigserial)('feature_id', { mode: 'number' }).references(() => lookups_schema_1.lookups.id).notNull(),
    featureValue: (0, pg_core_1.varchar)('feature_value', { length: 255 }),
    isDeleted: (0, pg_core_1.boolean)('isDeleted').default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: (0, pg_core_1.timestamp)('deletedAt', { withTimezone: true }),
}, (table) => ({
    uuidIdx: (0, pg_core_1.index)('plan_features_uuid_idx').on(table.uuid),
    planIdx: (0, pg_core_1.index)('plan_features_plan_id_idx').on(table.planId),
}));
exports.subscriptions = (0, pg_core_1.pgTable)('subscriptions', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    uuid: (0, pg_core_1.uuid)('uuid').defaultRandom().notNull().unique(),
    userId: (0, pg_core_1.bigserial)('userId', { mode: 'number' }).references(() => users_schema_1.users.id).notNull(),
    planId: (0, pg_core_1.bigserial)('plan_id', { mode: 'number' }).references(() => exports.plans.id).notNull(),
    statusId: (0, pg_core_1.bigserial)('status_id', { mode: 'number' }).references(() => lookups_schema_1.lookups.id).notNull(),
    billingCycleId: (0, pg_core_1.bigserial)('billing_cycle_id', { mode: 'number' }).references(() => lookups_schema_1.lookups.id).notNull(),
    amountPaid: (0, pg_core_1.decimal)('amount_paid', { precision: 10, scale: 2 }),
    startDate: (0, pg_core_1.timestamp)('start_date', { withTimezone: true }).notNull(),
    endDate: (0, pg_core_1.timestamp)('end_date', { withTimezone: true }),
    cancelledAt: (0, pg_core_1.timestamp)('cancelled_at', { withTimezone: true }),
    autoRenew: (0, pg_core_1.boolean)('auto_renew').default(true).notNull(),
    isDeleted: (0, pg_core_1.boolean)('isDeleted').default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt', { withTimezone: true }).defaultNow(),
    deletedAt: (0, pg_core_1.timestamp)('deletedAt', { withTimezone: true }),
}, (table) => ({
    uuidIdx: (0, pg_core_1.index)('subscriptions_uuid_idx').on(table.uuid),
    userIdx: (0, pg_core_1.index)('subscriptions_userId_idx').on(table.userId),
    planIdx: (0, pg_core_1.index)('subscriptions_plan_id_idx').on(table.planId),
    statusIdx: (0, pg_core_1.index)('subscriptions_status_id_idx').on(table.statusId),
}));
exports.paymentHistory = (0, pg_core_1.pgTable)('payment_history', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    uuid: (0, pg_core_1.uuid)('uuid').defaultRandom().notNull().unique(),
    subscriptionId: (0, pg_core_1.bigserial)('subscription_id', { mode: 'number' }).references(() => exports.subscriptions.id),
    userId: (0, pg_core_1.bigserial)('userId', { mode: 'number' }).references(() => users_schema_1.users.id).notNull(),
    amount: (0, pg_core_1.decimal)('amount', { precision: 10, scale: 2 }).notNull(),
    currency: (0, pg_core_1.varchar)('currency', { length: 3 }).default('USD'),
    paymentMethod: (0, pg_core_1.varchar)('payment_method', { length: 50 }),
    transactionId: (0, pg_core_1.varchar)('transaction_id', { length: 255 }),
    invoiceNumber: (0, pg_core_1.varchar)('invoice_number', { length: 100 }).unique(),
    invoiceUrl: (0, pg_core_1.varchar)('invoice_url', { length: 500 }),
    statusId: (0, pg_core_1.bigserial)('status_id', { mode: 'number' }).references(() => lookups_schema_1.lookups.id).notNull(),
    paymentDate: (0, pg_core_1.timestamp)('payment_date', { withTimezone: true }).defaultNow(),
    isDeleted: (0, pg_core_1.boolean)('isDeleted').default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: (0, pg_core_1.timestamp)('deletedAt', { withTimezone: true }),
}, (table) => ({
    uuidIdx: (0, pg_core_1.index)('payment_history_uuid_idx').on(table.uuid),
    subscriptionIdx: (0, pg_core_1.index)('payment_history_subscription_id_idx').on(table.subscriptionId),
    userIdx: (0, pg_core_1.index)('payment_history_userId_idx').on(table.userId),
    invoiceIdx: (0, pg_core_1.index)('payment_history_invoice_number_idx').on(table.invoiceNumber),
}));
exports.plansRelations = (0, drizzle_orm_1.relations)(exports.plans, ({ many }) => ({
    planFeatures: many(exports.planFeatures),
    subscriptions: many(exports.subscriptions),
}));
exports.planFeaturesRelations = (0, drizzle_orm_1.relations)(exports.planFeatures, ({ one }) => ({
    plan: one(exports.plans, {
        fields: [exports.planFeatures.planId],
        references: [exports.plans.id],
    }),
    feature: one(lookups_schema_1.lookups, {
        fields: [exports.planFeatures.featureId],
        references: [lookups_schema_1.lookups.id],
    }),
}));
exports.subscriptionsRelations = (0, drizzle_orm_1.relations)(exports.subscriptions, ({ one, many }) => ({
    user: one(users_schema_1.users, {
        fields: [exports.subscriptions.userId],
        references: [users_schema_1.users.id],
    }),
    plan: one(exports.plans, {
        fields: [exports.subscriptions.planId],
        references: [exports.plans.id],
    }),
    status: one(lookups_schema_1.lookups, {
        fields: [exports.subscriptions.statusId],
        references: [lookups_schema_1.lookups.id],
    }),
    billingCycle: one(lookups_schema_1.lookups, {
        fields: [exports.subscriptions.billingCycleId],
        references: [lookups_schema_1.lookups.id],
    }),
    paymentHistory: many(exports.paymentHistory),
}));
exports.paymentHistoryRelations = (0, drizzle_orm_1.relations)(exports.paymentHistory, ({ one }) => ({
    subscription: one(exports.subscriptions, {
        fields: [exports.paymentHistory.subscriptionId],
        references: [exports.subscriptions.id],
    }),
    user: one(users_schema_1.users, {
        fields: [exports.paymentHistory.userId],
        references: [users_schema_1.users.id],
    }),
    status: one(lookups_schema_1.lookups, {
        fields: [exports.paymentHistory.statusId],
        references: [lookups_schema_1.lookups.id],
    }),
}));
//# sourceMappingURL=subscriptions.schema.js.map