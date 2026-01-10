import { Injectable } from '@nestjs/common';
import { BasePolicy } from './base.policy';
import { Role } from '../enums/roles.enum';

/**
 * Post Policy
 * Defines authorization rules for social post resources
 */
@Injectable()
export class PostPolicy extends BasePolicy {
  /**
   * View permission:
   * - Public posts: Everyone
   * - Friends-only posts: Friends of the author
   * - Private posts: Only author and admins
   */
  async canView(
    userId: number,
    userRole: Role | string,
    post: any,
  ): Promise<boolean> {
    // Super admin can view everything
    if (this.isSuperAdmin(userRole)) {
      return true;
    }

    // Public posts are visible to everyone
    if (post.visibility === 'public') {
      return true;
    }

    // Admin can view all posts
    if (this.isAdminOrHigher(userRole)) {
      return true;
    }

    // Author can view their own posts
    if (post.authorId === userId || post.userId === userId) {
      return true;
    }

    // Friends-only posts require friendship check
    if (post.visibility === 'friends') {
      // This should be verified at service level
      return false; // Deny by default, service should check friendship
    }

    // Private posts only for author
    return false;
  }

  /**
   * Create permission:
   * - All authenticated users can create posts
   */
  async canCreate(
    userId: number,
    userRole: Role | string,
    data?: any,
  ): Promise<boolean> {
    // All authenticated users can create posts
    return true;
  }

  /**
   * Update permission:
   * - Author can update their own posts
   * - Admin can update any post (for moderation)
   */
  async canUpdate(
    userId: number,
    userRole: Role | string,
    post: any,
  ): Promise<boolean> {
    // Super admin and admin can update any post
    if (this.isAdminOrHigher(userRole)) {
      return true;
    }

    // Author can update their own posts
    if (post.authorId === userId || post.userId === userId) {
      return true;
    }

    return false;
  }

  /**
   * Delete permission:
   * - Author can delete their own posts
   * - Admin can delete any post
   */
  async canDelete(
    userId: number,
    userRole: Role | string,
    post: any,
  ): Promise<boolean> {
    // Super admin and admin can delete any post
    if (this.isAdminOrHigher(userRole)) {
      return true;
    }

    // Author can delete their own posts
    if (post.authorId === userId || post.userId === userId) {
      return true;
    }

    return false;
  }
}
