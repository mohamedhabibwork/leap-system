/**
 * gRPC-Web Client
 * Provides a typed client for making gRPC-web calls through the Envoy proxy
 */

import { env } from '../../config/env';
import { getSession } from 'next-auth/react';
import axios from 'axios';
import type {
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
  Course,
  FindAllCoursesRequest,
  FindAllCoursesResponse,
  ApproveCourseRequest,
  RejectCourseRequest,
  GetCourseStatsResponse,
  Subscription,
  FindAllSubscriptionsResponse,
  FindByUserResponse,
  Plan,
  FindAllPlansResponse,
  AuditLog,
  FindAllAuditResponse,
  FindAllAuditPaginatedRequest,
  FindAllAuditPaginatedResponse,
  FindByDateRangeRequest,
} from './types';

// gRPC-web uses a specific content type
const GRPC_WEB_CONTENT_TYPE = 'application/grpc-web+proto';
const GRPC_WEB_TEXT_CONTENT_TYPE = 'application/grpc-web-text';

interface GrpcError {
  code: number;
  message: string;
}

class GrpcWebError extends Error {
  code: number;
  
  constructor(code: number, message: string) {
    super(message);
    this.code = code;
    this.name = 'GrpcWebError';
  }
}

/**
 * Base gRPC-Web client class
 * Uses JSON encoding for simplicity (grpc-web-text mode)
 */
class GrpcWebClient {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  /**
   * Get authentication token from NextAuth session or manually set token
   */
  private async getAuthToken(): Promise<string | null> {
    // If token was manually set, use it (for backward compatibility)
    if (this.authToken) {
      return this.authToken;
    }

    // Otherwise, get token from NextAuth session
    if (typeof window !== 'undefined') {
      try {
        const session = await getSession();
        // Extract token from session (try multiple possible locations for compatibility)
        const token = 
          (session as any)?.accessToken ||
          (session as any)?.access_token ||
          (session as any)?.token ||
          (session as any)?.user?.accessToken ||
          (session as any)?.user?.access_token ||
          null;
        return token;
      } catch (error) {
        console.warn('[GrpcWebClient] Error getting session:', error);
        return null;
      }
    }

    return null;
  }

  /**
   * Make a gRPC-web unary call
   * Note: This is a simplified implementation using JSON over HTTP
   * For full grpc-web protocol support, use the @grpc/grpc-js or grpc-web npm packages
   */
  async unaryCall<TRequest, TResponse>(
    service: string,
    method: string,
    request: TRequest
  ): Promise<TResponse> {
    const url = `${this.baseUrl}/${service}/${method}`;
    
    // Get token from NextAuth session or manually set token
    const token = await this.getAuthToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'x-grpc-web': '1',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      // Use axios directly for gRPC-web calls since they need special headers
      const response = await axios.post<TResponse>(url, request, {
        headers,
      });

      return response.data;
    } catch (error: any) {
      if (error instanceof GrpcWebError) {
        throw error;
      }
      
      // Handle axios errors
      if (error.response) {
        const errorData = error.response.data;
        const code = errorData?.code || error.response.status;
        const message = errorData?.message || error.response.statusText || 'Unknown error';
        throw new GrpcWebError(code, message);
      }
      
      throw new GrpcWebError(14, `Network error: ${error.message || 'Unknown error'}`);
    }
  }
}

// Create the default client instance
const grpcClient = new GrpcWebClient(env.grpcWebUrl);

// ============================================
// Users Service Client
// ============================================

export const usersServiceClient = {
  setAuthToken: (token: string | null) => grpcClient.setAuthToken(token),

  findAll: (request: FindAllUsersRequest = {}): Promise<FindAllUsersResponse> =>
    grpcClient.unaryCall('users.UsersService', 'FindAll', request),

  findOne: (id: number): Promise<User> =>
    grpcClient.unaryCall('users.UsersService', 'FindOne', { id }),

  searchUsers: (request: SearchUsersRequest): Promise<SearchUsersResponse> =>
    grpcClient.unaryCall('users.UsersService', 'SearchUsers', request),

  updateUserRole: (request: UpdateUserRoleRequest): Promise<User> =>
    grpcClient.unaryCall('users.UsersService', 'UpdateUserRole', request),

  suspendUser: (request: SuspendUserRequest): Promise<User> =>
    grpcClient.unaryCall('users.UsersService', 'SuspendUser', request),

  activateUser: (request: ActivateUserRequest): Promise<User> =>
    grpcClient.unaryCall('users.UsersService', 'ActivateUser', request),

  blockUser: (id: number, reason?: string): Promise<User> =>
    grpcClient.unaryCall('users.UsersService', 'BlockUser', { id, reason }),

  unblockUser: (id: number): Promise<User> =>
    grpcClient.unaryCall('users.UsersService', 'UnblockUser', { id }),

  bulkUserActions: (request: BulkUserActionsRequest): Promise<BulkUserActionsResponse> =>
    grpcClient.unaryCall('users.UsersService', 'BulkUserActions', request),

  getUserStats: (): Promise<GetUserStatsResponse> =>
    grpcClient.unaryCall('users.UsersService', 'GetUserStats', {}),
};

// ============================================
// Courses Service Client
// ============================================

export const coursesServiceClient = {
  setAuthToken: (token: string | null) => grpcClient.setAuthToken(token),

  findAll: (request: FindAllCoursesRequest = {}): Promise<FindAllCoursesResponse> =>
    grpcClient.unaryCall('courses.CoursesService', 'FindAll', request),

  findOne: (id: number): Promise<Course> =>
    grpcClient.unaryCall('courses.CoursesService', 'FindOne', { id }),

  findPublished: (): Promise<{ courses: Course[] }> =>
    grpcClient.unaryCall('courses.CoursesService', 'FindPublished', {}),

  approveCourse: (request: ApproveCourseRequest): Promise<Course> =>
    grpcClient.unaryCall('courses.CoursesService', 'ApproveCourse', request),

  rejectCourse: (request: RejectCourseRequest): Promise<Course> =>
    grpcClient.unaryCall('courses.CoursesService', 'RejectCourse', request),

  getCourseStats: (): Promise<GetCourseStatsResponse> =>
    grpcClient.unaryCall('courses.CoursesService', 'GetCourseStats', {}),
};

// ============================================
// Subscriptions Service Client
// ============================================

export const subscriptionsServiceClient = {
  setAuthToken: (token: string | null) => grpcClient.setAuthToken(token),

  findAll: (): Promise<FindAllSubscriptionsResponse> =>
    grpcClient.unaryCall('subscriptions.SubscriptionsService', 'FindAll', {}),

  findOne: (id: number): Promise<Subscription> =>
    grpcClient.unaryCall('subscriptions.SubscriptionsService', 'FindOne', { id }),

  findByUser: (userId: number): Promise<FindByUserResponse> =>
    grpcClient.unaryCall('subscriptions.SubscriptionsService', 'FindByUser', { userId }),

  create: (userId: number, planId: number): Promise<Subscription> =>
    grpcClient.unaryCall('subscriptions.SubscriptionsService', 'Create', { userId, planId }),

  cancel: (id: number, userId: number): Promise<{ message: string }> =>
    grpcClient.unaryCall('subscriptions.SubscriptionsService', 'Cancel', { id, userId }),
};

// ============================================
// Plans Service Client
// ============================================

export const plansServiceClient = {
  setAuthToken: (token: string | null) => grpcClient.setAuthToken(token),

  findAll: (): Promise<FindAllPlansResponse> =>
    grpcClient.unaryCall('subscriptions.PlansService', 'FindAll', {}),

  findOne: (id: number): Promise<Plan> =>
    grpcClient.unaryCall('subscriptions.PlansService', 'FindOne', { id }),
};

// ============================================
// Audit Service Client
// ============================================

export const auditServiceClient = {
  setAuthToken: (token: string | null) => grpcClient.setAuthToken(token),

  findAll: (): Promise<FindAllAuditResponse> =>
    grpcClient.unaryCall('audit.AuditService', 'FindAll', {}),

  findOne: (id: number): Promise<AuditLog> =>
    grpcClient.unaryCall('audit.AuditService', 'FindOne', { id }),

  findByUser: (userId: number): Promise<{ logs: AuditLog[] }> =>
    grpcClient.unaryCall('audit.AuditService', 'FindByUser', { userId }),

  findAllPaginated: (request: FindAllAuditPaginatedRequest): Promise<FindAllAuditPaginatedResponse> =>
    grpcClient.unaryCall('audit.AuditService', 'FindAllPaginated', request),

  findByDateRange: (request: FindByDateRangeRequest): Promise<FindAllAuditPaginatedResponse> =>
    grpcClient.unaryCall('audit.AuditService', 'FindByDateRange', request),
};

// Export types
export type { GrpcWebError };
export { grpcClient };
