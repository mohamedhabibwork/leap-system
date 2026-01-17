// Admin-specific types for the LEAP PM platform

import { BaseEntity } from './index';

// Common admin query parameters
export interface AdminQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  dateFrom?: Date | string;
  dateTo?: Date | string;
}

// Paginated response with admin metadata
export interface AdminPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filters?: Record<string, unknown>;
}

// Bulk action request
export interface BulkActionRequest {
  ids: number[];
  action: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}

// Bulk action response
export interface BulkActionResponse {
  success: boolean;
  processedCount: number;
  failedCount: number;
  errors?: Array<{ id: number; error: string }>;
}

// Admin statistics
export interface AdminStatistics {
  total: number;
  active?: number;
  inactive?: number;
  pending?: number;
  [key: string]: number | undefined;
}

// Export request
export interface ExportRequest {
  format: 'csv' | 'excel' | 'json';
  filters?: Record<string, unknown>;
  fields?: string[];
}

// Ticket types
export interface AdminTicket extends BaseEntity {
  ticketNumber: string;
  userId: number;
  user?: {
    id: number;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  categoryId: number;
  category?: { id: number; nameEn: string };
  priorityId: number;
  priority?: { id: number; nameEn: string };
  statusId: number;
  status?: { id: number; nameEn: string };
  subject: string;
  description: string;
  assignedTo?: number;
  assignee?: {
    id: number;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  resolvedAt?: Date;
  closedAt?: Date;
  replyCount?: number;
}

export interface AdminTicketReply extends BaseEntity {
  ticketId: number;
  userId: number;
  user?: {
    id: number;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  message: string;
  isInternal: boolean;
  attachmentUrl?: string;
}

export interface TicketQueryParams extends AdminQueryParams {
  status?: number;
  priority?: number;
  category?: number;
  assignedTo?: number;
  userId?: number;
}

// CMS Page types
export interface AdminCMSPage extends BaseEntity {
  slug: string;
  pageTypeId: number;
  pageType?: { id: number; nameEn: string };
  statusId: number;
  status?: { id: number; nameEn: string };
  titleEn: string;
  titleAr?: string;
  contentEn?: string;
  contentAr?: string;
  metadata?: Record<string, unknown>;
  settings?: Record<string, any>;
  isPublished: boolean;
  publishedAt?: Date;
}

export interface CMSPageQueryParams extends AdminQueryParams {
  status?: number;
  pageType?: number;
  isPublished?: boolean;
}

// Social Post types
export interface AdminPost extends BaseEntity {
  userId: number;
  user?: {
    id: number;
    username?: string;
    firstName?: string;
    lastName?: string;
  };
  postTypeId: number;
  postType?: { id: number; nameEn: string };
  content?: string;
  visibilityId: number;
  visibility?: { id: number; nameEn: string };
  groupId?: number;
  group?: { id: number; name: string };
  pageId?: number;
  page?: { id: number; name: string };
  shareCount: number;
  commentCount: number;
  reactionCount: number;
  viewCount: number;
  metadata?: Record<string, unknown>;
  publishedAt?: Date;
}

export interface PostQueryParams extends AdminQueryParams {
  userId?: number;
  postType?: number;
  visibility?: number;
  groupId?: number;
  pageId?: number;
}

// Social Page types
export interface AdminSocialPage extends BaseEntity {
  name: string;
  slug: string;
  description?: string;
  seo?: Record<string, unknown>;
  categoryId?: number;
  category?: { id: number; nameEn: string };
  coverImageUrl?: string;
  profileImageUrl?: string;
  createdBy: number;
  creator?: {
    id: number;
    username?: string;
    firstName?: string;
    lastName?: string;
  };
  followerCount: number;
  likeCount: number;
  favoriteCount: number;
  isVerified?: boolean;
  isFeatured?: boolean;
}

export interface SocialPageQueryParams extends AdminQueryParams {
  categoryId?: number;
  createdBy?: number;
  isVerified?: boolean;
  isFeatured?: boolean;
}

// Group types
export interface AdminGroup extends BaseEntity {
  name: string;
  slug: string;
  description?: string;
  seo?: Record<string, unknown>;
  privacyTypeId: number;
  privacyType?: { id: number; nameEn: string };
  coverImageUrl?: string;
  createdBy: number;
  creator?: {
    id: number;
    username?: string;
    firstName?: string;
    lastName?: string;
  };
  memberCount: number;
  favoriteCount: number;
  isApproved?: boolean;
  isFeatured?: boolean;
}

export interface GroupQueryParams extends AdminQueryParams {
  privacyType?: number;
  createdBy?: number;
  memberCountMin?: number;
  memberCountMax?: number;
  isApproved?: boolean;
}

// Event types
export interface AdminEvent extends BaseEntity {
  titleEn: string;
  titleAr?: string;
  slug: string;
  descriptionEn?: string;
  descriptionAr?: string;
  seo?: Record<string, unknown>;
  eventTypeId: number;
  eventType?: { id: number; nameEn: string };
  statusId: number;
  status?: { id: number; nameEn: string };
  categoryId?: number;
  category?: { id: number; nameEn: string };
  startDate: Date;
  endDate?: Date;
  location?: string;
  timezone?: string;
  meetingUrl?: string;
  capacity?: number;
  createdBy: number;
  creator?: {
    id: number;
    username?: string;
    firstName?: string;
    lastName?: string;
  };
  bannerUrl?: string;
  isFeatured: boolean;
  registrationCount: number;
  favoriteCount: number;
}

export interface EventQueryParams extends AdminQueryParams {
  eventType?: number;
  status?: number;
  categoryId?: number;
  startDateFrom?: Date | string;
  startDateTo?: Date | string;
  location?: string;
  isFeatured?: boolean;
  createdBy?: number;
}

// Job types
export interface AdminJob extends BaseEntity {
  titleEn: string;
  titleAr?: string;
  slug: string;
  descriptionEn?: string;
  descriptionAr?: string;
  requirementsEn?: string;
  requirementsAr?: string;
  responsibilitiesEn?: string;
  responsibilitiesAr?: string;
  seo?: Record<string, unknown>;
  jobTypeId: number;
  jobType?: { id: number; nameEn: string };
  experienceLevelId: number;
  experienceLevel?: { id: number; nameEn: string };
  statusId: number;
  status?: { id: number; nameEn: string };
  location?: string;
  salaryRange?: string;
  postedBy: number;
  poster?: {
    id: number;
    username?: string;
    firstName?: string;
    lastName?: string;
  };
  companyId?: number;
  company?: { id: number; name: string };
  applicationCount: number;
  viewCount: number;
  favoriteCount: number;
  shareCount: number;
  deadline?: Date;
  isFeatured: boolean;
}

export interface JobQueryParams extends AdminQueryParams {
  jobType?: number;
  experienceLevel?: number;
  status?: number;
  location?: string;
  postedBy?: number;
  companyId?: number;
  isFeatured?: boolean;
}

// Report types
export interface AdminReport extends BaseEntity {
  reportedBy: number;
  reporter?: {
    id: number;
    username?: string;
    firstName?: string;
    lastName?: string;
  };
  reportTypeId: number;
  reportType?: { id: number; nameEn: string };
  statusId: number;
  status?: { id: number; nameEn: string };
  reportableType: string;
  reportableId: number;
  reason: string;
  adminNotes?: string;
  reviewedBy?: number;
  reviewer?: {
    id: number;
    username?: string;
    firstName?: string;
    lastName?: string;
  };
  reviewedAt?: Date;
}

export interface ReportQueryParams extends AdminQueryParams {
  reportType?: number;
  status?: number;
  reportableType?: string;
  reportedBy?: number;
  reviewedBy?: number;
}

// Lookup Type types
export interface AdminLookupType extends BaseEntity {
  name: string;
  code: string;
  description?: string;
  parentId?: number;
  parent?: { id: number; name: string };
  metadata?: Record<string, unknown>;
  sortOrder: number;
  isActive: boolean;
  childCount?: number;
}

// Lookup types
export interface AdminLookup extends BaseEntity {
  lookupTypeId: number;
  lookupType?: { id: number; name: string; code: string };
  parentId?: number;
  parent?: { id: number; nameEn: string };
  code: string;
  nameEn: string;
  nameAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  timezone?: string;
  metadata?: Record<string, unknown>;
  sortOrder: number;
  displayOrder: number;
  isActive: boolean;
}

export interface LookupQueryParams extends AdminQueryParams {
  lookupTypeId?: number;
  lookupTypeCode?: string;
  parentId?: number;
  isActive?: boolean;
}

// Course types (admin-specific extensions)
export interface AdminCourse extends BaseEntity {
  titleEn: string;
  titleAr?: string;
  slug: string;
  descriptionEn?: string;
  descriptionAr?: string;
  instructorId: number;
  instructor?: {
    id: number;
    username?: string;
    firstName?: string;
    lastName?: string;
  };
  categoryId?: number;
  category?: { id: number; nameEn: string };
  levelId?: number;
  level?: { id: number; nameEn: string };
  statusId: number;
  status?: { id: number; nameEn: string };
  thumbnailUrl?: string;
  price?: number;
  enrollmentCount: number;
  rating?: number;
  reviewCount: number;
  isPublished: boolean;
  isFeatured: boolean;
  publishedAt?: Date;
}

export interface CourseQueryParams extends AdminQueryParams {
  instructorId?: number;
  categoryId?: number;
  levelId?: number;
  status?: number;
  isPublished?: boolean;
  isFeatured?: boolean;
  priceMin?: number;
  priceMax?: number;
}
