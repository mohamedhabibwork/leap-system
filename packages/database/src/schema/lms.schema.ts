import { pgTable, bigserial, bigint, uuid, varchar, text, timestamp, boolean, decimal, integer, jsonb, index, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { lookups } from './lookups.schema';
import { users } from './users.schema';
import { subscriptions } from './subscriptions.schema';

// Tags Table
export const tags = pgTable('tags', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  usageCount: integer('usage_count').default(0),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ({
  uuidIdx: index('tags_uuid_idx').on(table.uuid),
  slugIdx: index('tags_slug_idx').on(table.slug),
  nameIdx: index('tags_name_idx').on(table.name),
}));

// Course Categories Table
export const courseCategories = pgTable('course_categories', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  nameEn: varchar('name_en', { length: 255 }).notNull(),
  nameAr: varchar('name_ar', { length: 255 }),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  descriptionEn: text('description_en'),
  descriptionAr: text('description_ar'),
  parentId: bigserial('parent_id', { mode: 'number' }).references((): any => courseCategories.id),
  displayOrder: integer('display_order').default(0),
  isActive: boolean('isActive').default(true).notNull(),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ({
  uuidIdx: index('course_categories_uuid_idx').on(table.uuid),
  slugIdx: index('course_categories_slug_idx').on(table.slug),
  parentIdx: index('course_categories_parent_id_idx').on(table.parentId),
}));

// Courses Table
export const courses = pgTable('courses', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  titleEn: varchar('title_en', { length: 255 }).notNull(),
  titleAr: varchar('title_ar', { length: 255 }),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  descriptionEn: text('description_en'),
  descriptionAr: text('description_ar'),
  objectivesEn: text('objectives_en'),
  objectivesAr: text('objectives_ar'),
  requirementsEn: text('requirements_en'),
  requirementsAr: text('requirements_ar'),
  seo: jsonb('seo'),
  instructorId: bigserial('instructor_id', { mode: 'number' }).references(() => users.id).notNull(),
  categoryId: bigserial('category_id', { mode: 'number' }).references(() => courseCategories.id),
  statusId: bigserial('status_id', { mode: 'number' }).references(() => lookups.id).notNull(),
  enrollmentTypeId: bigserial('enrollment_type_id', { mode: 'number' }).references(() => lookups.id),
  price: decimal('price', { precision: 10, scale: 2 }),
  thumbnailUrl: varchar('thumbnail_url', { length: 500 }),
  videoUrl: varchar('video_url', { length: 500 }),
  durationHours: integer('duration_hours'),
  maxStudents: integer('max_students'),
  allowSubscriptionAccess: boolean('allow_subscription_access').default(true).notNull(),
  allowPurchase: boolean('allow_purchase').default(true).notNull(),
  publishDate: timestamp('publish_date', { withTimezone: true }),
  isFeatured: boolean('is_featured').default(false).notNull(),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  viewCount: integer('view_count').default(0),
  favoriteCount: integer('favorite_count').default(0),
  shareCount: integer('share_count').default(0),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ({
  uuidIdx: index('courses_uuid_idx').on(table.uuid),
  slugIdx: index('courses_slug_idx').on(table.slug),
  instructorIdx: index('courses_instructor_id_idx').on(table.instructorId),
  categoryIdx: index('courses_category_id_idx').on(table.categoryId),
  statusIdx: index('courses_status_id_idx').on(table.statusId),
}));

// Course Tags Junction Table (Many-to-Many)
export const courseTags = pgTable('course_tags', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  courseId: bigserial('course_id', { mode: 'number' }).references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  tagId: bigserial('tag_id', { mode: 'number' }).references(() => tags.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uuidIdx: index('course_tags_uuid_idx').on(table.uuid),
  courseIdx: index('course_tags_course_id_idx').on(table.courseId),
  tagIdx: index('course_tags_tag_id_idx').on(table.tagId),
  courseTagUnique: unique('course_tags_unique').on(table.courseId, table.tagId),
}));

// Course Sections Table
export const courseSections = pgTable('course_sections', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  courseId: bigserial('course_id', { mode: 'number' }).references(() => courses.id).notNull(),
  titleEn: varchar('title_en', { length: 255 }).notNull(),
  titleAr: varchar('title_ar', { length: 255 }),
  descriptionEn: text('description_en'),
  descriptionAr: text('description_ar'),
  displayOrder: integer('display_order').default(0),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ({
  uuidIdx: index('course_sections_uuid_idx').on(table.uuid),
  courseIdx: index('course_sections_course_id_idx').on(table.courseId),
}));

// Lessons Table
export const lessons = pgTable('lessons', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  sectionId: bigserial('section_id', { mode: 'number' }).references(() => courseSections.id).notNull(),
  contentTypeId: bigserial('content_type_id', { mode: 'number' }).references(() => lookups.id).notNull(),
  titleEn: varchar('title_en', { length: 255 }).notNull(),
  titleAr: varchar('title_ar', { length: 255 }),
  descriptionEn: text('description_en'),
  descriptionAr: text('description_ar'),
  contentEn: text('content_en'),
  contentAr: text('content_ar'),
  videoUrl: varchar('video_url', { length: 500 }),
  attachmentUrl: varchar('attachment_url', { length: 500 }),
  durationMinutes: integer('duration_minutes'),
  displayOrder: integer('display_order').default(0),
  isPreview: boolean('is_preview').default(false).notNull(),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ({
  uuidIdx: index('lessons_uuid_idx').on(table.uuid),
  sectionIdx: index('lessons_section_id_idx').on(table.sectionId),
}));

// Course Resources Table
export const courseResources = pgTable('course_resources', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  courseId: bigint('course_id', { mode: 'number' }).references(() => courses.id).notNull(),
  sectionId: bigint('section_id', { mode: 'number' }).references(() => courseSections.id),
  lessonId: bigint('lesson_id', { mode: 'number' }).references(() => lessons.id),
  resourceTypeId: bigint('resource_type_id', { mode: 'number' }).references(() => lookups.id).notNull(),
  titleEn: varchar('title_en', { length: 255 }).notNull(),
  titleAr: varchar('title_ar', { length: 255 }),
  descriptionEn: text('description_en'),
  descriptionAr: text('description_ar'),
  fileUrl: varchar('file_url', { length: 500 }).notNull(),
  fileName: varchar('file_name', { length: 255 }),
  fileSize: integer('file_size'),
  downloadCount: integer('download_count').default(0),
  displayOrder: integer('display_order').default(0),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ({
  uuidIdx: index('course_resources_uuid_idx').on(table.uuid),
  courseIdx: index('course_resources_course_id_idx').on(table.courseId),
}));

// Assignments Table
export const assignments = pgTable('assignments', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  sectionId: bigserial('section_id', { mode: 'number' }).references(() => courseSections.id).notNull(),
  titleEn: varchar('title_en', { length: 255 }).notNull(),
  titleAr: varchar('title_ar', { length: 255 }),
  descriptionEn: text('description_en'),
  descriptionAr: text('description_ar'),
  instructionsEn: text('instructions_en'),
  instructionsAr: text('instructions_ar'),
  maxPoints: integer('max_points').default(100),
  dueDate: timestamp('due_date', { withTimezone: true }),
  maxAttempts: integer('max_attempts'),
  allowLateSubmission: boolean('allow_late_submission').default(false).notNull(),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ({
  uuidIdx: index('assignments_uuid_idx').on(table.uuid),
  sectionIdx: index('assignments_section_id_idx').on(table.sectionId),
}));

// Quizzes Table
export const quizzes = pgTable('quizzes', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  sectionId: bigint('section_id', { mode: 'number' }).references(() => courseSections.id).notNull(),
  lessonId: bigint('lesson_id', { mode: 'number' }).references(() => lessons.id),
  titleEn: varchar('title_en', { length: 255 }).notNull(),
  titleAr: varchar('title_ar', { length: 255 }),
  descriptionEn: text('description_en'),
  descriptionAr: text('description_ar'),
  timeLimitMinutes: integer('time_limit_minutes'),
  maxAttempts: integer('max_attempts'),
  passingScore: integer('passing_score').default(60),
  shuffleQuestions: boolean('shuffle_questions').default(false).notNull(),
  showCorrectAnswers: boolean('show_correct_answers').default(true).notNull(),
  availableFrom: timestamp('available_from', { withTimezone: true }),
  availableUntil: timestamp('available_until', { withTimezone: true }),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ({
  uuidIdx: index('quizzes_uuid_idx').on(table.uuid),
  sectionIdx: index('quizzes_section_id_idx').on(table.sectionId),
  lessonIdx: index('quizzes_lesson_id_idx').on(table.lessonId),
}));

// Question Bank Table
export const questionBank = pgTable('question_bank', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  courseId: bigint('course_id', { mode: 'number' }).references(() => courses.id), // nullable for general questions
  questionTypeId: bigserial('question_type_id', { mode: 'number' }).references(() => lookups.id).notNull(),
  questionTextEn: text('question_text_en').notNull(),
  questionTextAr: text('question_text_ar'),
  explanationEn: text('explanation_en'),
  explanationAr: text('explanation_ar'),
  points: integer('points').default(1),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ({
  uuidIdx: index('question_bank_uuid_idx').on(table.uuid),
  courseIdx: index('question_bank_course_id_idx').on(table.courseId),
}));

// Question Options Table
export const questionOptions = pgTable('question_options', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  questionId: bigserial('question_id', { mode: 'number' }).references(() => questionBank.id).notNull(),
  optionTextEn: text('option_text_en').notNull(),
  optionTextAr: text('option_text_ar'),
  isCorrect: boolean('is_correct').default(false).notNull(),
  displayOrder: integer('display_order').default(0),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ({
  uuidIdx: index('question_options_uuid_idx').on(table.uuid),
  questionIdx: index('question_options_question_id_idx').on(table.questionId),
}));

// Quiz Questions Table (Many-to-Many)
export const quizQuestions = pgTable('quiz_questions', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  quizId: bigserial('quiz_id', { mode: 'number' }).references(() => quizzes.id).notNull(),
  questionId: bigserial('question_id', { mode: 'number' }).references(() => questionBank.id).notNull(),
  displayOrder: integer('display_order').default(0),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ({
  uuidIdx: index('quiz_questions_uuid_idx').on(table.uuid),
  quizIdx: index('quiz_questions_quiz_id_idx').on(table.quizId),
}));

// Enrollments Table
export const enrollments = pgTable('enrollments', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  userId: bigserial('userId', { mode: 'number' }).references(() => users.id).notNull(),
  courseId: bigserial('course_id', { mode: 'number' }).references(() => courses.id).notNull(),
  enrollmentTypeId: bigserial('enrollment_type_id', { mode: 'number' }).references(() => lookups.id).notNull(),
  statusId: bigserial('status_id', { mode: 'number' }).references(() => lookups.id).notNull(),
  subscriptionId: bigserial('subscription_id', { mode: 'number' }).references(() => subscriptions.id),
  enrollmentType: varchar('enrollment_type', { length: 20 }).default('purchase'), // 'purchase', 'subscription', 'free', 'admin_granted'
  amountPaid: decimal('amount_paid', { precision: 10, scale: 2 }),
  enrolledAt: timestamp('enrolled_at', { withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  progressPercentage: decimal('progress_percentage', { precision: 5, scale: 2 }).default('0'),
  lastAccessedAt: timestamp('last_accessed_at', { withTimezone: true }),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ({
  uuidIdx: index('enrollments_uuid_idx').on(table.uuid),
  userIdx: index('enrollments_userId_idx').on(table.userId),
  courseIdx: index('enrollments_course_id_idx').on(table.courseId),
  enrollmentTypeIdx: index('enrollments_enrollment_type_idx').on(table.enrollmentType),
}));

// Lesson Progress Table
export const lessonProgress = pgTable('lesson_progress', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  enrollmentId: bigserial('enrollment_id', { mode: 'number' }).references(() => enrollments.id).notNull(),
  lessonId: bigserial('lesson_id', { mode: 'number' }).references(() => lessons.id).notNull(),
  isCompleted: boolean('is_completed').default(false).notNull(),
  timeSpentMinutes: integer('time_spent_minutes').default(0),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  lastAccessedAt: timestamp('last_accessed_at', { withTimezone: true }),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ({
  uuidIdx: index('lesson_progress_uuid_idx').on(table.uuid),
  enrollmentIdx: index('lesson_progress_enrollment_id_idx').on(table.enrollmentId),
  lessonIdx: index('lesson_progress_lesson_id_idx').on(table.lessonId),
}));

// Assignment Submissions Table
export const assignmentSubmissions = pgTable('assignment_submissions', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  assignmentId: bigserial('assignment_id', { mode: 'number' }).references(() => assignments.id).notNull(),
  userId: bigserial('userId', { mode: 'number' }).references(() => users.id).notNull(),
  submissionText: text('submission_text'),
  fileUrl: varchar('file_url', { length: 500 }),
  statusId: bigserial('status_id', { mode: 'number' }).references(() => lookups.id).notNull(),
  score: decimal('score', { precision: 5, scale: 2 }),
  maxPoints: decimal('max_points', { precision: 5, scale: 2 }),
  feedback: text('feedback'),
  submittedAt: timestamp('submitted_at', { withTimezone: true }).defaultNow(),
  gradedAt: timestamp('graded_at', { withTimezone: true }),
  gradedBy: bigserial('graded_by', { mode: 'number' }).references(() => users.id),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ({
  uuidIdx: index('assignment_submissions_uuid_idx').on(table.uuid),
  assignmentIdx: index('assignment_submissions_assignment_id_idx').on(table.assignmentId),
  userIdx: index('assignment_submissions_userId_idx').on(table.userId),
}));

// Quiz Attempts Table
export const quizAttempts = pgTable('quiz_attempts', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  quizId: bigint('quiz_id', { mode: 'number' }).references(() => quizzes.id).notNull(),
  userId: bigint('userId', { mode: 'number' }).references(() => users.id).notNull(),
  attemptNumber: integer('attempt_number').notNull(),
  score: decimal('score', { precision: 5, scale: 2 }),
  maxScore: decimal('max_score', { precision: 5, scale: 2 }),
  isPassed: boolean('is_passed').default(false).notNull(),
  startedAt: timestamp('started_at', { withTimezone: true }).defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ({
  uuidIdx: index('quiz_attempts_uuid_idx').on(table.uuid),
  quizIdx: index('quiz_attempts_quiz_id_idx').on(table.quizId),
  userIdx: index('quiz_attempts_userId_idx').on(table.userId),
}));

// Quiz Answers Table
export const quizAnswers = pgTable('quiz_answers', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  attemptId: bigserial('attempt_id', { mode: 'number' }).references(() => quizAttempts.id).notNull(),
  questionId: bigserial('question_id', { mode: 'number' }).references(() => questionBank.id).notNull(),
  selectedOptionId: bigserial('selected_option_id', { mode: 'number' }).references(() => questionOptions.id),
  answerText: text('answer_text'),
  isCorrect: boolean('is_correct').default(false).notNull(),
  pointsEarned: decimal('points_earned', { precision: 5, scale: 2 }),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ({
  uuidIdx: index('quiz_answers_uuid_idx').on(table.uuid),
  attemptIdx: index('quiz_answers_attempt_id_idx').on(table.attemptId),
}));

// Course Reviews Table
export const courseReviews = pgTable('course_reviews', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  courseId: bigserial('course_id', { mode: 'number' }).references(() => courses.id).notNull(),
  userId: bigserial('userId', { mode: 'number' }).references(() => users.id).notNull(),
  rating: integer('rating').notNull(),
  reviewText: text('review_text'),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ({
  uuidIdx: index('course_reviews_uuid_idx').on(table.uuid),
  courseIdx: index('course_reviews_course_id_idx').on(table.courseId),
  userIdx: index('course_reviews_userId_idx').on(table.userId),
}));

// Certificates Table
export const certificates = pgTable('certificates', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  enrollmentId: bigserial('enrollment_id', { mode: 'number' }).references(() => enrollments.id).notNull(),
  certificateNumber: varchar('certificate_number', { length: 100 }).notNull().unique(),
  issuedDate: timestamp('issued_date', { withTimezone: true }).defaultNow(),
  fileUrl: varchar('file_url', { length: 500 }),
  downloadUrl: varchar('download_url', { length: 500 }),
  downloadCount: integer('download_count').default(0),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ({
  uuidIdx: index('certificates_uuid_idx').on(table.uuid),
  enrollmentIdx: index('certificates_enrollment_id_idx').on(table.enrollmentId),
  certificateNumberIdx: index('certificates_certificate_number_idx').on(table.certificateNumber),
}));

// Lesson Sessions Table
export const lessonSessions = pgTable('lesson_sessions', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  lessonId: bigserial('lesson_id', { mode: 'number' }).references(() => lessons.id).notNull(),
  titleEn: varchar('title_en', { length: 255 }).notNull(),
  titleAr: varchar('title_ar', { length: 255 }),
  sessionTypeId: bigserial('session_type_id', { mode: 'number' }).references(() => lookups.id).notNull(),
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }).notNull(),
  timezone: varchar('timezone', { length: 100 }).default('UTC'),
  meetingUrl: varchar('meeting_url', { length: 500 }),
  meetingPassword: varchar('meeting_password', { length: 255 }),
  maxAttendees: integer('max_attendees'),
  descriptionEn: text('description_en'),
  descriptionAr: text('description_ar'),
  recordingUrl: varchar('recording_url', { length: 500 }),
  statusId: bigserial('status_id', { mode: 'number' }).references(() => lookups.id).notNull(),
  attendanceCount: integer('attendance_count').default(0),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ({
  uuidIdx: index('lesson_sessions_uuid_idx').on(table.uuid),
  lessonIdx: index('lesson_sessions_lesson_id_idx').on(table.lessonId),
  statusIdx: index('lesson_sessions_status_id_idx').on(table.statusId),
  startTimeIdx: index('lesson_sessions_start_time_idx').on(table.startTime),
}));

// Session Attendees Table
export const sessionAttendees = pgTable('session_attendees', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  sessionId: bigserial('session_id', { mode: 'number' }).references(() => lessonSessions.id).notNull(),
  userId: bigserial('userId', { mode: 'number' }).references(() => users.id).notNull(),
  enrollmentId: bigserial('enrollment_id', { mode: 'number' }).references(() => enrollments.id).notNull(),
  attendanceStatusId: bigserial('attendance_status_id', { mode: 'number' }).references(() => lookups.id).notNull(),
  joinedAt: timestamp('joined_at', { withTimezone: true }),
  leftAt: timestamp('left_at', { withTimezone: true }),
  durationMinutes: integer('duration_minutes'),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uuidIdx: index('session_attendees_uuid_idx').on(table.uuid),
  sessionIdx: index('session_attendees_session_id_idx').on(table.sessionId),
  userIdx: index('session_attendees_userId_idx').on(table.userId),
  enrollmentIdx: index('session_attendees_enrollment_id_idx').on(table.enrollmentId),
}));

// Relations (add more as needed for joins)
export const coursesRelations = relations(courses, ({ one, many }) => ({
  instructor: one(users, {
    fields: [courses.instructorId],
    references: [users.id],
  }),
  category: one(courseCategories, {
    fields: [courses.categoryId],
    references: [courseCategories.id],
  }),
  status: one(lookups, {
    fields: [courses.statusId],
    references: [lookups.id],
  }),
  sections: many(courseSections),
  enrollments: many(enrollments),
  reviews: many(courseReviews),
  resources: many(courseResources),
  questionBank: many(questionBank),
  courseTags: many(courseTags),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  courseTags: many(courseTags),
}));

export const courseTagsRelations = relations(courseTags, ({ one }) => ({
  course: one(courses, {
    fields: [courseTags.courseId],
    references: [courses.id],
  }),
  tag: one(tags, {
    fields: [courseTags.tagId],
    references: [tags.id],
  }),
}));

export const courseSectionsRelations = relations(courseSections, ({ one, many }) => ({
  course: one(courses, {
    fields: [courseSections.courseId],
    references: [courses.id],
  }),
  lessons: many(lessons),
  assignments: many(assignments),
  quizzes: many(quizzes),
  resources: many(courseResources),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  section: one(courseSections, {
    fields: [lessons.sectionId],
    references: [courseSections.id],
  }),
  contentType: one(lookups, {
    fields: [lessons.contentTypeId],
    references: [lookups.id],
  }),
  progress: many(lessonProgress),
  resources: many(courseResources),
  sessions: many(lessonSessions),
}));

export const enrollmentsRelations = relations(enrollments, ({ one, many }) => ({
  user: one(users, {
    fields: [enrollments.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [enrollments.courseId],
    references: [courses.id],
  }),
  enrollmentType: one(lookups, {
    fields: [enrollments.enrollmentTypeId],
    references: [lookups.id],
  }),
  status: one(lookups, {
    fields: [enrollments.statusId],
    references: [lookups.id],
  }),
  subscription: one(subscriptions, {
    fields: [enrollments.subscriptionId],
    references: [subscriptions.id],
  }),
  lessonProgress: many(lessonProgress),
  certificates: many(certificates),
  sessionAttendees: many(sessionAttendees),
}));

export const lessonSessionsRelations = relations(lessonSessions, ({ one, many }) => ({
  lesson: one(lessons, {
    fields: [lessonSessions.lessonId],
    references: [lessons.id],
  }),
  sessionType: one(lookups, {
    fields: [lessonSessions.sessionTypeId],
    references: [lookups.id],
  }),
  status: one(lookups, {
    fields: [lessonSessions.statusId],
    references: [lookups.id],
  }),
  attendees: many(sessionAttendees),
}));

export const sessionAttendeesRelations = relations(sessionAttendees, ({ one }) => ({
  session: one(lessonSessions, {
    fields: [sessionAttendees.sessionId],
    references: [lessonSessions.id],
  }),
  user: one(users, {
    fields: [sessionAttendees.userId],
    references: [users.id],
  }),
  enrollment: one(enrollments, {
    fields: [sessionAttendees.enrollmentId],
    references: [enrollments.id],
  }),
  attendanceStatus: one(lookups, {
    fields: [sessionAttendees.attendanceStatusId],
    references: [lookups.id],
  }),
}));
