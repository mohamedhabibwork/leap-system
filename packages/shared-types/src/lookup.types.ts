/**
 * Lookup Type Codes Enum
 * Centralized enum for all lookup type codes used across the application
 * Source: apps/backend/src/database/seeders/01-lookups.seeder.ts
 */
export enum LookupTypeCode {
  // User Management
  USER_ROLE = 'user_role',
  USER_STATUS = 'user_status',
  PERMISSION = 'permission',

  // Course System
  COURSE_LEVEL = 'course_level',
  COURSE_STATUS = 'course_status',
  ENROLLMENT_TYPE = 'enrollment_type',
  ENROLLMENT_STATUS = 'enrollment_status',

  // Social Features
  POST_TYPE = 'post_type',
  POST_VISIBILITY = 'post_visibility',
  GROUP_ROLE = 'group_role',
  GROUP_PRIVACY = 'group_privacy',
  GROUP_MEMBER_STATUS = 'group_member_status',
  PAGE_ROLE = 'page_role',
  FRIEND_REQUEST_STATUS = 'friend_request_status',
  FRIEND_STATUS = 'friend_status',
  REACTION_TYPE = 'reaction_type',

  // Events
  EVENT_TYPE = 'event_type',
  EVENT_STATUS = 'event_status',
  EVENT_ATTENDANCE_STATUS = 'event_attendance_status',
  EVENT_CATEGORY = 'event_category',

  // Jobs Module
  JOB_TYPE = 'job_type',
  EXPERIENCE_LEVEL = 'experience_level',
  JOB_STATUS = 'job_status',
  JOB_APPLICATION_STATUS = 'job_application_status',

  // Tickets & Reports
  TICKET_CATEGORY = 'ticket_category',
  TICKET_STATUS = 'ticket_status',
  TICKET_PRIORITY = 'ticket_priority',
  REPORT_TYPE = 'report_type',
  REPORT_STATUS = 'report_status',

  // Subscriptions
  SUBSCRIPTION_STATUS = 'subscription_status',
  BILLING_CYCLE = 'billing_cycle',
  PLAN_FEATURE = 'plan_feature',

  // Content & Resources
  QUIZ_QUESTION_TYPE = 'quiz_question_type',
  ASSIGNMENT_STATUS = 'assignment_status',
  CONTENT_TYPE = 'content_type',
  RESOURCE_TYPE = 'resource_type',

  // Chat & Messaging
  CHAT_TYPE = 'chat_type',
  MESSAGE_TYPE = 'message_type',
  MESSAGE_STATUS = 'message_status',

  // System Configuration
  LANGUAGE = 'language',
  TIMEZONE = 'timezone',
  MEDIA_PROVIDER = 'media_provider',
  VISIBILITY_TYPE = 'visibility_type',
  PAYMENT_STATUS = 'payment_status',
  PAYMENT_METHOD = 'payment_method',
  NOTIFICATION_TYPE = 'notification_type',
}

/**
 * Lookup Value Enums
 * Centralized enums for all lookup values used across the application
 * Source: apps/backend/src/database/seeders/01-lookups.seeder.ts
 */

// User Management
export enum UserRoleCode {
  ADMIN = 'admin',
  INSTRUCTOR = 'instructor',
  USER = 'user',
  RECRUITER = 'recruiter',
}

export enum UserStatusCode {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  BANNED = 'banned',
}

// Course System
export enum CourseLevelCode {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export enum CourseStatusCode {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum EnrollmentTypeCode {
  PURCHASE = 'purchase',
  SUBSCRIPTION = 'subscription',
}

export enum EnrollmentStatusCode {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
  DROPPED = 'dropped',
  CANCELLED = 'cancelled',
}

// Social Features
export enum PostTypeCode {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  LINK = 'link',
  POLL = 'poll',
}

export enum PostVisibilityCode {
  PUBLIC = 'public',
  PRIVATE = 'private',
  FRIENDS = 'friends',
  CUSTOM = 'custom',
}

export enum GroupRoleCode {
  OWNER = 'owner',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  MEMBER = 'member',
}

export enum GroupPrivacyCode {
  PUBLIC = 'public',
  PRIVATE = 'private',
  SECRET = 'secret',
}

export enum GroupMemberStatusCode {
  ACTIVE = 'active',
  PENDING = 'pending',
  BANNED = 'banned',
}

export enum PageRoleCode {
  OWNER = 'owner',
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

export enum FriendRequestStatusCode {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  BLOCKED = 'blocked',
}

export enum FriendStatusCode {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  BLOCKED = 'blocked',
}

export enum ReactionTypeCode {
  LIKE = 'like',
  LOVE = 'love',
  CELEBRATE = 'celebrate',
  INSIGHTFUL = 'insightful',
  CURIOUS = 'curious',
}

// Events
export enum EventTypeCode {
  ONLINE = 'online',
  IN_PERSON = 'in_person',
  HYBRID = 'hybrid',
}

export enum EventStatusCode {
  UPCOMING = 'upcoming',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum EventAttendanceStatusCode {
  GOING = 'going',
  INTERESTED = 'interested',
  MAYBE = 'maybe',
  NOT_GOING = 'not_going',
}

// Jobs Module
export enum JobTypeCode {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
  INTERNSHIP = 'internship',
}

export enum ExperienceLevelCode {
  ENTRY = 'entry',
  MID = 'mid',
  SENIOR = 'senior',
  EXECUTIVE = 'executive',
}

export enum JobStatusCode {
  OPEN = 'open',
  CLOSED = 'closed',
  FILLED = 'filled',
  ON_HOLD = 'on_hold',
}

export enum JobApplicationStatusCode {
  APPLIED = 'applied',
  UNDER_REVIEW = 'under_review',
  SHORTLISTED = 'shortlisted',
  INTERVIEW_SCHEDULED = 'interview_scheduled',
  REJECTED = 'rejected',
  ACCEPTED = 'accepted',
  WITHDRAWN = 'withdrawn',
}

// Tickets & Reports
export enum TicketCategoryCode {
  TECHNICAL = 'technical',
  BILLING = 'billing',
  GENERAL = 'general',
  CONTENT = 'content',
  JOB_RELATED = 'job_related',
}

export enum TicketStatusCode {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  WAITING = 'waiting',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum TicketPriorityCode {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum ReportTypeCode {
  SPAM = 'spam',
  HARASSMENT = 'harassment',
  INAPPROPRIATE = 'inappropriate',
  COPYRIGHT = 'copyright',
  FAKE_JOB = 'fake_job',
  OTHER = 'other',
}

export enum ReportStatusCode {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed',
}

// Subscriptions
export enum SubscriptionStatusCode {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  SUSPENDED = 'suspended',
  TRIAL = 'trial',
}

export enum BillingCycleCode {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUAL = 'annual',
}

export enum PlanFeatureCode {
  COURSE_ACCESS = 'course_access',
  CHAT_ACCESS = 'chat_access',
  DOWNLOADS = 'downloads',
  CERTIFICATES = 'certificates',
  PRIORITY_SUPPORT = 'priority_support',
  JOB_POSTINGS = 'job_postings',
}

// Content & Resources
export enum QuizQuestionTypeCode {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  SHORT_ANSWER = 'short_answer',
  ESSAY = 'essay',
}

export enum AssignmentStatusCode {
  NOT_SUBMITTED = 'not_submitted',
  SUBMITTED = 'submitted',
  GRADED = 'graded',
}

export enum ContentTypeCode {
  VIDEO = 'video',
  DOCUMENT = 'document',
  QUIZ = 'quiz',
  ASSIGNMENT = 'assignment',
  TEXT = 'text',
}

export enum ResourceTypeCode {
  PDF = 'pdf',
  VIDEO = 'video',
  DOCUMENT = 'document',
  LINK = 'link',
  FILE = 'file',
  ARCHIVE = 'archive',
}

// Chat & Messaging
export enum ChatTypeCode {
  PUBLIC = 'public',
  PRIVATE = 'private',
  GROUP = 'group',
}

export enum MessageTypeCode {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  VOICE = 'voice',
}

export enum MessageStatusCode {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
}

// System Configuration
export enum LanguageCode {
  EN = 'en',
  AR = 'ar',
}

export enum TimezoneCode {
  UTC = 'UTC',
  AFRICA_CAIRO = 'Africa/Cairo',
  ASIA_DUBAI = 'Asia/Dubai',
  ASIA_RIYADH = 'Asia/Riyadh',
}

export enum MediaProviderCode {
  LOCAL = 'local',
  MINIO = 'minio',
  R2 = 'r2',
  S3 = 's3',
}

export enum VisibilityTypeCode {
  PUBLIC = 'public',
  PRIVATE = 'private',
  FRIENDS_ONLY = 'friends_only',
  CUSTOM = 'custom',
}

export enum PaymentStatusCode {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum PaymentMethodCode {
  PAYPAL = 'paypal',
  STRIPE = 'stripe',
  BANK_TRANSFER = 'bank_transfer',
}

export enum NotificationTypeCode {
  // LMS (12 types)
  COURSE_ENROLLMENT = 'course_enrollment',
  COURSE_ENROLLMENT_APPROVED = 'course_enrollment_approved',
  COURSE_COMPLETION = 'course_completion',
  LESSON_UNLOCKED = 'lesson_unlocked',
  ASSIGNMENT_ASSIGNED = 'assignment_assigned',
  ASSIGNMENT_SUBMITTED = 'assignment_submitted',
  ASSIGNMENT_GRADED = 'assignment_graded',
  ASSIGNMENT_DUE_SOON = 'assignment_due_soon',
  QUIZ_GRADED = 'quiz_graded',
  CERTIFICATE_ISSUED = 'certificate_issued',
  INSTRUCTOR_MESSAGE = 'instructor_message',
  COURSE_UPDATED = 'course_updated',
  // Job (8 types)
  JOB_POSTED = 'job_posted',
  JOB_APPLICATION_RECEIVED = 'job_application_received',
  JOB_APPLICATION_REVIEWED = 'job_application_reviewed',
  JOB_APPLICATION_SHORTLISTED = 'job_application_shortlisted',
  JOB_INTERVIEW_SCHEDULED = 'job_interview_scheduled',
  JOB_APPLICATION_ACCEPTED = 'job_application_accepted',
  JOB_APPLICATION_REJECTED = 'job_application_rejected',
  JOB_EXPIRED = 'job_expired',
  // Social (13 types)
  FRIEND_REQUEST_RECEIVED = 'friend_request_received',
  FRIEND_REQUEST_ACCEPTED = 'friend_request_accepted',
  GROUP_INVITATION = 'group_invitation',
  GROUP_JOINED = 'group_joined',
  GROUP_JOIN = 'group_join',
  POST_COMMENTED = 'post_commented',
  POST_COMMENT = 'post_comment',
  POST_REACTION = 'post_reaction',
  POST_SHARE = 'post_share',
  COMMENT_REPLY = 'comment_reply',
  MENTION_IN_POST = 'mention_in_post',
  MENTION = 'mention',
  PAGE_FOLLOW = 'page_follow',
  PAGE_LIKE = 'page_like',
  EVENT_INVITATION = 'event_invitation',
  EVENT_REMINDER = 'event_reminder',
  // Ticket (6 types)
  TICKET_CREATED = 'ticket_created',
  TICKET_ASSIGNED = 'ticket_assigned',
  TICKET_REPLY = 'ticket_reply',
  TICKET_STATUS_CHANGED = 'ticket_status_changed',
  TICKET_RESOLVED = 'ticket_resolved',
  TICKET_REOPENED = 'ticket_reopened',
  // Payment (6 types)
  PAYMENT_SUCCESSFUL = 'payment_successful',
  PAYMENT_FAILED = 'payment_failed',
  REFUND_PROCESSED = 'refund_processed',
  SUBSCRIPTION_RENEWED = 'subscription_renewed',
  SUBSCRIPTION_EXPIRING = 'subscription_expiring',
  SUBSCRIPTION_CANCELLED = 'subscription_cancelled',
  // System (8 types)
  ACCOUNT_VERIFIED = 'account_verified',
  PASSWORD_CHANGED = 'password_changed',
  SECURITY_ALERT = 'security_alert',
  PROFILE_UPDATED = 'profile_updated',
  MAINTENANCE_SCHEDULED = 'maintenance_scheduled',
  WELCOME_TO_PLATFORM = 'welcome_to_platform',
  INACTIVITY_REMINDER = 'inactivity_reminder',
  ACCOUNT_SUSPENDED = 'account_suspended',
}
