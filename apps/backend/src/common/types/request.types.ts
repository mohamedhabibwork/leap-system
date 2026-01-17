/**
 * Common request and user types
 * Used throughout the application to replace 'any' types
 */

import { Request } from 'express';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@leap-lms/database';

/**
 * User object structure from JWT token
 * This matches what JwtStrategy.validate returns
 */
export interface AuthenticatedUser {
  sub: number | string;
  id: number;
  userId: number;
  email?: string;
  username?: string;
  roleId?: number;
  roles?: string[];
  permissions?: string[];
  firstName?: string;
  lastName?: string;
  name?: string;
  role?: string;
  roleName?: string;
  keycloakId?: string;
}

/**
 * Extended Express Request with authenticated user
 */
export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

/**
 * GraphQL Context with authenticated user
 */
export interface GraphQLContext {
  req: AuthenticatedRequest;
  user?: AuthenticatedUser;
}

/**
 * Database type for Drizzle ORM
 */
export type Database = NodePgDatabase<typeof schema>;

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  status?: number;
  error?: string;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Generic filter/query parameters
 */
export interface QueryParams {
  page?: number;
  limit?: number;
  sort?: 'asc' | 'desc';
  sortBy?: string;
  search?: string;
  [key: string]: unknown;
}

/**
 * Helper function to extract user ID from AuthenticatedUser
 */
export function getUserId(user: AuthenticatedUser): number {
  if (user.id) return user.id;
  if (user.userId) return user.userId;
  if (typeof user.sub === 'number') return user.sub;
  if (typeof user.sub === 'string') return parseInt(user.sub, 10);
  throw new Error('Unable to extract user ID from authenticated user');
}
