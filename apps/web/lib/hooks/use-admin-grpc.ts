/**
 * Admin API Hooks using gRPC-web
 * TanStack Query hooks for admin dashboard operations via gRPC
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  usersServiceClient,
  coursesServiceClient,
  subscriptionsServiceClient,
  plansServiceClient,
  auditServiceClient,
} from '../api/grpc';
import type {
  FindAllUsersRequest,
  SearchUsersRequest,
  UpdateUserRoleRequest,
  SuspendUserRequest,
  BulkUserActionsRequest,
  FindAllCoursesRequest,
  ApproveCourseRequest,
  RejectCourseRequest,
  FindAllAuditPaginatedRequest,
  FindByDateRangeRequest,
} from '../api/grpc';

// ============================================
// User Management Hooks (gRPC)
// ============================================

/**
 * Fetch all users with pagination
 */
export function useAdminUsersGrpc(params?: FindAllUsersRequest) {
  return useQuery({
    queryKey: ['admin', 'users', 'grpc', params],
    queryFn: () => usersServiceClient.findAll(params || {}),
  });
}

/**
 * Fetch a single user by ID
 */
export function useAdminUserGrpc(id: number) {
  return useQuery({
    queryKey: ['admin', 'users', 'grpc', id],
    queryFn: () => usersServiceClient.findOne(id),
    enabled: !!id,
  });
}

/**
 * Search users with filters
 */
export function useSearchUsersGrpc(params: SearchUsersRequest) {
  return useQuery({
    queryKey: ['admin', 'users', 'grpc', 'search', params],
    queryFn: () => usersServiceClient.searchUsers(params),
    enabled: !!params.query || !!params.roleFilter,
  });
}

/**
 * Get user statistics
 */
export function useUserStatsGrpc() {
  return useQuery({
    queryKey: ['admin', 'users', 'grpc', 'stats'],
    queryFn: () => usersServiceClient.getUserStats(),
  });
}

/**
 * Update user role
 */
export function useUpdateUserRoleGrpc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: UpdateUserRoleRequest) =>
      usersServiceClient.updateUserRole(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

/**
 * Suspend a user
 */
export function useSuspendUserGrpc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: SuspendUserRequest) =>
      usersServiceClient.suspendUser(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

/**
 * Activate a user
 */
export function useActivateUserGrpc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) =>
      usersServiceClient.activateUser({ userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

/**
 * Bulk user actions
 */
export function useBulkUserActionsGrpc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: BulkUserActionsRequest) =>
      usersServiceClient.bulkUserActions(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

// ============================================
// Course Management Hooks (gRPC)
// ============================================

/**
 * Fetch all courses with pagination
 */
export function useAdminCoursesGrpc(params?: FindAllCoursesRequest) {
  return useQuery({
    queryKey: ['admin', 'courses', 'grpc', params],
    queryFn: () => coursesServiceClient.findAll(params || {}),
  });
}

/**
 * Fetch a single course by ID
 */
export function useAdminCourseGrpc(id: number) {
  return useQuery({
    queryKey: ['admin', 'courses', 'grpc', id],
    queryFn: () => coursesServiceClient.findOne(id),
    enabled: !!id,
  });
}

/**
 * Get course statistics
 */
export function useCourseStatsGrpc() {
  return useQuery({
    queryKey: ['admin', 'courses', 'grpc', 'stats'],
    queryFn: () => coursesServiceClient.getCourseStats(),
  });
}

/**
 * Approve a course
 */
export function useApproveCourseGrpc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: ApproveCourseRequest) =>
      coursesServiceClient.approveCourse(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
    },
  });
}

/**
 * Reject a course
 */
export function useRejectCourseGrpc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: RejectCourseRequest) =>
      coursesServiceClient.rejectCourse(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
    },
  });
}

// ============================================
// Subscription Management Hooks (gRPC)
// ============================================

/**
 * Fetch all subscriptions
 */
export function useAdminSubscriptionsGrpc() {
  return useQuery({
    queryKey: ['admin', 'subscriptions', 'grpc'],
    queryFn: () => subscriptionsServiceClient.findAll(),
  });
}

/**
 * Fetch a single subscription by ID
 */
export function useAdminSubscriptionGrpc(id: number) {
  return useQuery({
    queryKey: ['admin', 'subscriptions', 'grpc', id],
    queryFn: () => subscriptionsServiceClient.findOne(id),
    enabled: !!id,
  });
}

/**
 * Fetch subscriptions by user
 */
export function useUserSubscriptionsGrpc(userId: number) {
  return useQuery({
    queryKey: ['admin', 'subscriptions', 'grpc', 'user', userId],
    queryFn: () => subscriptionsServiceClient.findByUser(userId),
    enabled: !!userId,
  });
}

/**
 * Cancel a subscription
 */
export function useCancelSubscriptionGrpc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId }: { id: number; userId: number }) =>
      subscriptionsServiceClient.cancel(id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions'] });
    },
  });
}

// ============================================
// Plans Hooks (gRPC)
// ============================================

/**
 * Fetch all plans
 */
export function usePlansGrpc() {
  return useQuery({
    queryKey: ['admin', 'plans', 'grpc'],
    queryFn: () => plansServiceClient.findAll(),
  });
}

/**
 * Fetch a single plan by ID
 */
export function usePlanGrpc(id: number) {
  return useQuery({
    queryKey: ['admin', 'plans', 'grpc', id],
    queryFn: () => plansServiceClient.findOne(id),
    enabled: !!id,
  });
}

// ============================================
// Audit Log Hooks (gRPC)
// ============================================

/**
 * Fetch all audit logs (non-paginated)
 */
export function useAuditLogsGrpc() {
  return useQuery({
    queryKey: ['admin', 'audit', 'grpc'],
    queryFn: () => auditServiceClient.findAll(),
  });
}

/**
 * Fetch a single audit log by ID
 */
export function useAuditLogGrpc(id: number) {
  return useQuery({
    queryKey: ['admin', 'audit', 'grpc', id],
    queryFn: () => auditServiceClient.findOne(id),
    enabled: !!id,
  });
}

/**
 * Fetch audit logs by user
 */
export function useUserAuditLogsGrpc(userId: number) {
  return useQuery({
    queryKey: ['admin', 'audit', 'grpc', 'user', userId],
    queryFn: () => auditServiceClient.findByUser(userId),
    enabled: !!userId,
  });
}

/**
 * Fetch paginated audit logs with filters
 */
export function useAuditLogsPaginatedGrpc(params: FindAllAuditPaginatedRequest) {
  return useQuery({
    queryKey: ['admin', 'audit', 'grpc', 'paginated', params],
    queryFn: () => auditServiceClient.findAllPaginated(params),
  });
}

/**
 * Fetch audit logs by date range
 */
export function useAuditLogsByDateRangeGrpc(params: FindByDateRangeRequest) {
  return useQuery({
    queryKey: ['admin', 'audit', 'grpc', 'dateRange', params],
    queryFn: () => auditServiceClient.findByDateRange(params),
    enabled: !!params.startDate && !!params.endDate,
  });
}
