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
