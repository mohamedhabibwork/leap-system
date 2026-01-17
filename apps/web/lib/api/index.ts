/**
 * API Services Index
 * Central export for all API services
 */

export { default as eventsAPI } from './events';
export { default as jobsAPI } from './jobs';
export { default as coursesAPI } from './courses';
export { default as groupsAPI } from './groups';
export { default as pagesAPI } from './pages';
export { default as postsAPI } from './posts';
export { default as chatAPI } from './chat';
export { default as notificationsAPI } from './notifications';
export { default as searchAPI } from './search';
export { default as storiesAPI } from './stories';
// Payments API removed - all payments/* endpoints removed from frontend
// export { default as paymentsAPI } from './payments';
export { default as certificatesAPI } from './certificates';
export { default as lookupsAPI } from './lookups';

// gRPC-web clients
export {
  usersServiceClient,
  coursesServiceClient,
  subscriptionsServiceClient,
  plansServiceClient,
  auditServiceClient,
  grpcClient,
} from './grpc';

// Export types
export type { Event, CreateEventDto, UpdateEventDto } from './events';
export type { Job, JobApplication, CreateJobDto, UpdateJobDto, ApplyJobDto } from './jobs';
export type { Course, CourseLesson, Enrollment, CreateCourseDto, UpdateCourseDto } from './courses';
export type { Group, GroupMember, CreateGroupDto, UpdateGroupDto } from './groups';
export type { Page, CreatePageDto, UpdatePageDto } from './pages';
export type { Post, CreatePostDto, UpdatePostDto } from './posts';
export type { Notification, NotificationPreferences } from './notifications';
export type { SearchResult, SearchParams, SearchSuggestion } from './search';
export type { Story, CreateStoryDto } from './stories';
// Payment types removed - payments/* endpoints removed from frontend
// export type { Payment, InvoiceInfo } from './payments';
export type { CertificateInfo } from './certificates';
export type { LookupType, Lookup, LookupsByTypeQuery } from './lookups';

// gRPC types
export type {
  User,
  FindAllUsersRequest,
  FindAllUsersResponse,
  SearchUsersRequest,
  SearchUsersResponse,
  UpdateUserRoleRequest,
  SuspendUserRequest,
  ActivateUserRequest,
  BulkUserActionsRequest,
  BulkUserActionsResponse,
  GetUserStatsResponse,
  Course as GrpcCourse,
  FindAllCoursesRequest,
  FindAllCoursesResponse,
  ApproveCourseRequest,
  RejectCourseRequest,
  GetCourseStatsResponse,
  Subscription,
  FindAllSubscriptionsResponse,
  Plan,
  FindAllPlansResponse,
  AuditLog,
  FindAllAuditResponse,
  FindAllAuditPaginatedRequest,
  FindAllAuditPaginatedResponse,
  FindByDateRangeRequest,
} from './grpc';
