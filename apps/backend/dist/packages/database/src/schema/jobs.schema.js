"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobApplicationsRelations = exports.jobsRelations = exports.jobApplications = exports.jobs = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const users_schema_1 = require("./users.schema");
const lookups_schema_1 = require("./lookups.schema");
const social_schema_1 = require("./social.schema");
exports.jobs = (0, pg_core_1.pgTable)('jobs', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    uuid: (0, pg_core_1.uuid)('uuid').defaultRandom().notNull().unique(),
    titleEn: (0, pg_core_1.varchar)('title_en', { length: 255 }).notNull(),
    titleAr: (0, pg_core_1.varchar)('title_ar', { length: 255 }),
    slug: (0, pg_core_1.varchar)('slug', { length: 255 }).notNull().unique(),
    descriptionEn: (0, pg_core_1.text)('description_en'),
    descriptionAr: (0, pg_core_1.text)('description_ar'),
    requirementsEn: (0, pg_core_1.text)('requirements_en'),
    requirementsAr: (0, pg_core_1.text)('requirements_ar'),
    responsibilitiesEn: (0, pg_core_1.text)('responsibilities_en'),
    responsibilitiesAr: (0, pg_core_1.text)('responsibilities_ar'),
    seo: (0, pg_core_1.jsonb)('seo'),
    jobTypeId: (0, pg_core_1.bigserial)('job_type_id', { mode: 'number' }).references(() => lookups_schema_1.lookups.id).notNull(),
    experienceLevelId: (0, pg_core_1.bigserial)('experience_level_id', { mode: 'number' }).references(() => lookups_schema_1.lookups.id).notNull(),
    statusId: (0, pg_core_1.bigserial)('status_id', { mode: 'number' }).references(() => lookups_schema_1.lookups.id).notNull(),
    location: (0, pg_core_1.varchar)('location', { length: 255 }),
    salaryRange: (0, pg_core_1.varchar)('salary_range', { length: 255 }),
    postedBy: (0, pg_core_1.bigserial)('posted_by', { mode: 'number' }).references(() => users_schema_1.users.id).notNull(),
    companyId: (0, pg_core_1.bigserial)('company_id', { mode: 'number' }).references(() => social_schema_1.pages.id),
    applicationCount: (0, pg_core_1.integer)('application_count').default(0),
    viewCount: (0, pg_core_1.integer)('view_count').default(0),
    favoriteCount: (0, pg_core_1.integer)('favorite_count').default(0),
    shareCount: (0, pg_core_1.integer)('share_count').default(0),
    deadline: (0, pg_core_1.timestamp)('deadline', { withTimezone: true }),
    isFeatured: (0, pg_core_1.boolean)('is_featured').default(false).notNull(),
    isDeleted: (0, pg_core_1.boolean)('isDeleted').default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt', { withTimezone: true }).defaultNow(),
    deletedAt: (0, pg_core_1.timestamp)('deletedAt', { withTimezone: true }),
}, (table) => ({
    uuidIdx: (0, pg_core_1.index)('jobs_uuid_idx').on(table.uuid),
    slugIdx: (0, pg_core_1.index)('jobs_slug_idx').on(table.slug),
    postedByIdx: (0, pg_core_1.index)('jobs_posted_by_idx').on(table.postedBy),
    companyIdx: (0, pg_core_1.index)('jobs_company_id_idx').on(table.companyId),
}));
exports.jobApplications = (0, pg_core_1.pgTable)('job_applications', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    uuid: (0, pg_core_1.uuid)('uuid').defaultRandom().notNull().unique(),
    jobId: (0, pg_core_1.bigserial)('job_id', { mode: 'number' }).references(() => exports.jobs.id).notNull(),
    userId: (0, pg_core_1.bigserial)('userId', { mode: 'number' }).references(() => users_schema_1.users.id).notNull(),
    statusId: (0, pg_core_1.bigserial)('status_id', { mode: 'number' }).references(() => lookups_schema_1.lookups.id).notNull(),
    coverLetter: (0, pg_core_1.text)('cover_letter'),
    resumeUrl: (0, pg_core_1.varchar)('resume_url', { length: 500 }),
    notes: (0, pg_core_1.text)('notes'),
    reviewedBy: (0, pg_core_1.bigserial)('reviewed_by', { mode: 'number' }).references(() => users_schema_1.users.id),
    reviewedAt: (0, pg_core_1.timestamp)('reviewed_at', { withTimezone: true }),
    appliedAt: (0, pg_core_1.timestamp)('applied_at', { withTimezone: true }).defaultNow(),
    isDeleted: (0, pg_core_1.boolean)('isDeleted').default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt', { withTimezone: true }).defaultNow(),
    deletedAt: (0, pg_core_1.timestamp)('deletedAt', { withTimezone: true }),
}, (table) => ({
    uuidIdx: (0, pg_core_1.index)('job_applications_uuid_idx').on(table.uuid),
    jobIdx: (0, pg_core_1.index)('job_applications_job_id_idx').on(table.jobId),
    userIdx: (0, pg_core_1.index)('job_applications_userId_idx').on(table.userId),
}));
exports.jobsRelations = (0, drizzle_orm_1.relations)(exports.jobs, ({ one, many }) => ({
    poster: one(users_schema_1.users, {
        fields: [exports.jobs.postedBy],
        references: [users_schema_1.users.id],
    }),
    company: one(social_schema_1.pages, {
        fields: [exports.jobs.companyId],
        references: [social_schema_1.pages.id],
    }),
    jobType: one(lookups_schema_1.lookups, {
        fields: [exports.jobs.jobTypeId],
        references: [lookups_schema_1.lookups.id],
    }),
    experienceLevel: one(lookups_schema_1.lookups, {
        fields: [exports.jobs.experienceLevelId],
        references: [lookups_schema_1.lookups.id],
    }),
    status: one(lookups_schema_1.lookups, {
        fields: [exports.jobs.statusId],
        references: [lookups_schema_1.lookups.id],
    }),
    applications: many(exports.jobApplications),
}));
exports.jobApplicationsRelations = (0, drizzle_orm_1.relations)(exports.jobApplications, ({ one }) => ({
    job: one(exports.jobs, {
        fields: [exports.jobApplications.jobId],
        references: [exports.jobs.id],
    }),
    user: one(users_schema_1.users, {
        fields: [exports.jobApplications.userId],
        references: [users_schema_1.users.id],
    }),
    status: one(lookups_schema_1.lookups, {
        fields: [exports.jobApplications.statusId],
        references: [lookups_schema_1.lookups.id],
    }),
    reviewer: one(users_schema_1.users, {
        fields: [exports.jobApplications.reviewedBy],
        references: [users_schema_1.users.id],
    }),
}));
//# sourceMappingURL=jobs.schema.js.map