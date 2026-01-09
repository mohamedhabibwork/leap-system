"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lookupsRelations = exports.lookupTypesRelations = exports.lookups = exports.lookupTypes = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
exports.lookupTypes = (0, pg_core_1.pgTable)('lookup_types', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    uuid: (0, pg_core_1.uuid)('uuid').defaultRandom().notNull().unique(),
    name: (0, pg_core_1.varchar)('name', { length: 100 }).notNull().unique(),
    code: (0, pg_core_1.varchar)('code', { length: 50 }).notNull().unique(),
    description: (0, pg_core_1.text)('description'),
    parentId: (0, pg_core_1.bigserial)('parent_id', { mode: 'number' }).references(() => exports.lookupTypes.id),
    metadata: (0, pg_core_1.jsonb)('metadata'),
    sortOrder: (0, pg_core_1.integer)('sort_order').default(0),
    isActive: (0, pg_core_1.boolean)('isActive').default(true).notNull(),
    isDeleted: (0, pg_core_1.boolean)('isDeleted').default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt', { withTimezone: true }).defaultNow(),
    deletedAt: (0, pg_core_1.timestamp)('deletedAt', { withTimezone: true }),
}, (table) => ({
    uuidIdx: (0, pg_core_1.index)('lookup_types_uuid_idx').on(table.uuid),
    codeIdx: (0, pg_core_1.index)('lookup_types_code_idx').on(table.code),
    parentIdx: (0, pg_core_1.index)('lookup_types_parent_id_idx').on(table.parentId),
}));
exports.lookups = (0, pg_core_1.pgTable)('lookups', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    uuid: (0, pg_core_1.uuid)('uuid').defaultRandom().notNull().unique(),
    lookupTypeId: (0, pg_core_1.bigserial)('lookup_type_id', { mode: 'number' }).references(() => exports.lookupTypes.id).notNull(),
    parentId: (0, pg_core_1.bigserial)('parent_id', { mode: 'number' }).references(() => exports.lookups.id),
    code: (0, pg_core_1.varchar)('code', { length: 50 }).notNull().unique(),
    nameEn: (0, pg_core_1.varchar)('name_en', { length: 255 }).notNull(),
    nameAr: (0, pg_core_1.varchar)('name_ar', { length: 255 }),
    descriptionEn: (0, pg_core_1.text)('description_en'),
    descriptionAr: (0, pg_core_1.text)('description_ar'),
    timezone: (0, pg_core_1.varchar)('timezone', { length: 100 }),
    metadata: (0, pg_core_1.jsonb)('metadata'),
    sortOrder: (0, pg_core_1.integer)('sort_order').default(0),
    displayOrder: (0, pg_core_1.integer)('display_order').default(0),
    isActive: (0, pg_core_1.boolean)('isActive').default(true).notNull(),
    isDeleted: (0, pg_core_1.boolean)('isDeleted').default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt', { withTimezone: true }).defaultNow(),
    deletedAt: (0, pg_core_1.timestamp)('deletedAt', { withTimezone: true }),
}, (table) => ({
    uuidIdx: (0, pg_core_1.index)('lookups_uuid_idx').on(table.uuid),
    codeIdx: (0, pg_core_1.index)('lookups_code_idx').on(table.code),
    typeIdx: (0, pg_core_1.index)('lookups_type_id_idx').on(table.lookupTypeId),
    parentIdx: (0, pg_core_1.index)('lookups_parent_id_idx').on(table.parentId),
}));
exports.lookupTypesRelations = (0, drizzle_orm_1.relations)(exports.lookupTypes, ({ many, one }) => ({
    lookups: many(exports.lookups),
    parent: one(exports.lookupTypes, {
        fields: [exports.lookupTypes.parentId],
        references: [exports.lookupTypes.id],
    }),
    children: many(exports.lookupTypes),
}));
exports.lookupsRelations = (0, drizzle_orm_1.relations)(exports.lookups, ({ one, many }) => ({
    lookupType: one(exports.lookupTypes, {
        fields: [exports.lookups.lookupTypeId],
        references: [exports.lookupTypes.id],
    }),
    parent: one(exports.lookups, {
        fields: [exports.lookups.parentId],
        references: [exports.lookups.id],
    }),
    children: many(exports.lookups),
}));
//# sourceMappingURL=lookups.schema.js.map