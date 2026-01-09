"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cmsPagesRelations = exports.cmsPages = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const lookups_schema_1 = require("./lookups.schema");
exports.cmsPages = (0, pg_core_1.pgTable)('cms_pages', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    uuid: (0, pg_core_1.uuid)('uuid').defaultRandom().notNull().unique(),
    slug: (0, pg_core_1.varchar)('slug', { length: 255 }).notNull().unique(),
    pageTypeId: (0, pg_core_1.bigserial)('page_type_id', { mode: 'number' }).references(() => lookups_schema_1.lookups.id).notNull(),
    statusId: (0, pg_core_1.bigserial)('status_id', { mode: 'number' }).references(() => lookups_schema_1.lookups.id).notNull(),
    titleEn: (0, pg_core_1.varchar)('title_en', { length: 255 }).notNull(),
    titleAr: (0, pg_core_1.varchar)('title_ar', { length: 255 }),
    contentEn: (0, pg_core_1.text)('content_en'),
    contentAr: (0, pg_core_1.text)('content_ar'),
    metadata: (0, pg_core_1.jsonb)('metadata'),
    settings: (0, pg_core_1.jsonb)('settings'),
    isPublished: (0, pg_core_1.boolean)('is_published').default(false).notNull(),
    isDeleted: (0, pg_core_1.boolean)('isDeleted').default(false).notNull(),
    publishedAt: (0, pg_core_1.timestamp)('published_at', { withTimezone: true }),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt', { withTimezone: true }).defaultNow(),
    deletedAt: (0, pg_core_1.timestamp)('deletedAt', { withTimezone: true }),
}, (table) => ({
    uuidIdx: (0, pg_core_1.index)('cms_pages_uuid_idx').on(table.uuid),
    slugIdx: (0, pg_core_1.index)('cms_pages_slug_idx').on(table.slug),
}));
exports.cmsPagesRelations = (0, drizzle_orm_1.relations)(exports.cmsPages, ({ one }) => ({
    pageType: one(lookups_schema_1.lookups, {
        fields: [exports.cmsPages.pageTypeId],
        references: [lookups_schema_1.lookups.id],
    }),
    status: one(lookups_schema_1.lookups, {
        fields: [exports.cmsPages.statusId],
        references: [lookups_schema_1.lookups.id],
    }),
}));
//# sourceMappingURL=cms.schema.js.map