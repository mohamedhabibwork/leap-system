/**
 * gRPC-web TypeScript types
 * These types mirror the proto definitions for type-safe client usage
 */

// ============================================
// Users Service Types
// ============================================

export interface User {
  id: number;
  uuid: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  bio: string;
  avatarUrl: string;
  resumeUrl: string;
  roleId: number;
  statusId: number;
  preferredLanguage: string;
  timezone: string;
  emailVerifiedAt: string;
  lastLoginAt: string;
  lastSeenAt: string;
  isOnline: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FindAllUsersRequest {
  page?: number;
  limit?: number;
}

export interface FindAllUsersResponse {
  users: User[];
  total: number;
}

export interface SearchUsersRequest {
  query?: string;
  roleFilter?: string;
  page?: number;
  limit?: number;
}

export interface SearchUsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UpdateUserRoleRequest {
  userId: number;
  roleId: number;
}

export interface SuspendUserRequest {
  userId: number;
  reason?: string;
}

export interface ActivateUserRequest {
  userId: number;
}

export interface BulkUserActionsRequest {
  action: string;
  userIds: number[];
  reason?: string;
  roleId?: number;
}

export interface BulkUserActionsResponse {
  message: string;
  affectedCount: number;
}

export interface GetUserStatsResponse {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  suspendedUsers: number;
  instructors: number;
  students: number;
}

// ============================================
// Courses Service Types
// ============================================

export interface Course {
  id: number;
  uuid: string;
  titleEn: string;
  titleAr: string;
  slug: string;
  descriptionEn: string;
  descriptionAr: string;
  instructorId: number;
  categoryId: number;
  statusId: number;
  price: number;
  thumbnailUrl: string;
  videoUrl: string;
  durationHours: number;
  allowSubscriptionAccess: boolean;
  allowPurchase: boolean;
  publishDate: string;
  isFeatured: boolean;
  viewCount: number;
  favoriteCount: number;
  shareCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface FindAllCoursesRequest {
  page?: number;
  limit?: number;
}

export interface FindAllCoursesResponse {
  courses: Course[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApproveCourseRequest {
  courseId: number;
}

export interface RejectCourseRequest {
  courseId: number;
  reason?: string;
}

export interface GetCourseStatsResponse {
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  pendingApproval: number;
  rejectedCourses: number;
  featuredCourses: number;
}

// ============================================
// Subscriptions Service Types
// ============================================

export interface Subscription {
  id: number;
  uuid: string;
  userId: number;
  planId: number;
  statusId: number;
  billingCycleId: number;
  amountPaid: number;
  startDate: string;
  endDate: string;
  cancelledAt: string;
  autoRenew: boolean;
  createdAt: string;
}

export interface Plan {
  id: number;
  uuid: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  priceMonthly: number;
  priceQuarterly: number;
  priceAnnual: number;
  maxCourses: number;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
}

export interface FindAllSubscriptionsResponse {
  subscriptions: Subscription[];
}

export interface FindByUserResponse {
  subscriptions: Subscription[];
}

export interface FindAllPlansResponse {
  plans: Plan[];
}

// ============================================
// Audit Service Types
// ============================================

export interface AuditLog {
  id: number;
  uuid: string;
  userId: number;
  auditableType: string;
  auditableId: number;
  action: string;
  oldValues: string;
  newValues: string;
  description: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

export interface FindAllAuditResponse {
  logs: AuditLog[];
}

export interface FindAllAuditPaginatedRequest {
  page?: number;
  limit?: number;
  action?: string;
  auditableType?: string;
}

export interface FindAllAuditPaginatedResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FindByDateRangeRequest {
  startDate: string;
  endDate: string;
  page?: number;
  limit?: number;
}
