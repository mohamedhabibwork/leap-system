import { pgTable, bigserial, uuid, varchar, text, timestamp, boolean, integer, jsonb, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';
import { lookups } from './lookups.schema';
import { pages } from './social.schema';

// Jobs Table
export const jobs = pgTable('jobs', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  titleEn: varchar('title_en', { length: 255 }).notNull(),
  titleAr: varchar('title_ar', { length: 255 }),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  descriptionEn: text('description_en'),
  descriptionAr: text('description_ar'),
  requirementsEn: text('requirements_en'),
  requirementsAr: text('requirements_ar'),
  responsibilitiesEn: text('responsibilities_en'),
  responsibilitiesAr: text('responsibilities_ar'),
  seo: jsonb('seo'),
  jobTypeId: bigserial('job_type_id', { mode: 'number' }).references(() => lookups.id).notNull(),
  experienceLevelId: bigserial('experience_level_id', { mode: 'number' }).references(() => lookups.id).notNull(),
  statusId: bigserial('status_id', { mode: 'number' }).references(() => lookups.id).notNull(),
  location: varchar('location', { length: 255 }),
  salaryRange: varchar('salary_range', { length: 255 }),
  postedBy: bigserial('posted_by', { mode: 'number' }).references(() => users.id).notNull(),
  companyId: bigserial('company_id', { mode: 'number' }).references(() => pages.id),
  applicationCount: integer('application_count').default(0),
  viewCount: integer('view_count').default(0),
  favoriteCount: integer('favorite_count').default(0),
  shareCount: integer('share_count').default(0),
  deadline: timestamp('deadline', { withTimezone: true }),
  isFeatured: boolean('is_featured').default(false).notNull(),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ({
  uuidIdx: index('jobs_uuid_idx').on(table.uuid),
  slugIdx: index('jobs_slug_idx').on(table.slug),
  postedByIdx: index('jobs_posted_by_idx').on(table.postedBy),
  companyIdx: index('jobs_company_id_idx').on(table.companyId),
}));

// Job Applications Table
export const jobApplications = pgTable('job_applications', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  jobId: bigserial('job_id', { mode: 'number' }).references(() => jobs.id).notNull(),
  userId: bigserial('userId', { mode: 'number' }).references(() => users.id).notNull(),
  statusId: bigserial('status_id', { mode: 'number' }).references(() => lookups.id).notNull(),
  coverLetter: text('cover_letter'),
  resumeUrl: varchar('resume_url', { length: 500 }),
  notes: text('notes'),
  reviewedBy: bigserial('reviewed_by', { mode: 'number' }).references(() => users.id),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  appliedAt: timestamp('applied_at', { withTimezone: true }).defaultNow(),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ({
  uuidIdx: index('job_applications_uuid_idx').on(table.uuid),
  jobIdx: index('job_applications_job_id_idx').on(table.jobId),
  userIdx: index('job_applications_userId_idx').on(table.userId),
}));

// Relations
export const jobsRelations = relations(jobs, ({ one, many }) => ({
  poster: one(users, {
    fields: [jobs.postedBy],
    references: [users.id],
  }),
  company: one(pages, {
    fields: [jobs.companyId],
    references: [pages.id],
  }),
  jobType: one(lookups, {
    fields: [jobs.jobTypeId],
    references: [lookups.id],
  }),
  experienceLevel: one(lookups, {
    fields: [jobs.experienceLevelId],
    references: [lookups.id],
  }),
  status: one(lookups, {
    fields: [jobs.statusId],
    references: [lookups.id],
  }),
  applications: many(jobApplications),
}));

export const jobApplicationsRelations = relations(jobApplications, ({ one }) => ({
  job: one(jobs, {
    fields: [jobApplications.jobId],
    references: [jobs.id],
  }),
  user: one(users, {
    fields: [jobApplications.userId],
    references: [users.id],
  }),
  status: one(lookups, {
    fields: [jobApplications.statusId],
    references: [lookups.id],
  }),
  reviewer: one(users, {
    fields: [jobApplications.reviewedBy],
    references: [users.id],
  }),
}));
