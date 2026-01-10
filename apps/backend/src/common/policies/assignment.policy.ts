import { Injectable } from '@nestjs/common';
import { BasePolicy } from './base.policy';
import { Role } from '../enums/roles.enum';

/**
 * Assignment Policy
 * Defines authorization rules for assignment and submission resources
 */
@Injectable()
export class AssignmentPolicy extends BasePolicy {
  /**
   * View permission:
   * - Enrolled students can view assignments
   * - Instructor can view assignments in their courses
   * - Admin can view all assignments
   */
  async canView(
    userId: number,
    userRole: Role | string,
    assignment: any,
  ): Promise<boolean> {
    // Super admin can view everything
    if (this.isSuperAdmin(userRole)) {
      return true;
    }

    // Admin can view all assignments
    if (this.isAdminOrHigher(userRole)) {
      return true;
    }

    // Instructor can view assignments in their courses
    if (userRole === Role.INSTRUCTOR && assignment.course?.instructorId === userId) {
      return true;
    }

    // Student can view assignments if enrolled in the course
    // This requires checking enrollment - should be done at service level
    if (userRole === Role.STUDENT) {
      return true; // Simplified - should verify enrollment
    }

    return false;
  }

  /**
   * Create permission:
   * - Only instructors can create assignments in their courses
   * - Admins can create assignments
   */
  async canCreate(
    userId: number,
    userRole: Role | string,
    data?: any,
  ): Promise<boolean> {
    // Super admin and admin can create assignments
    if (this.isAdminOrHigher(userRole)) {
      return true;
    }

    // Instructor can create assignments in their courses
    if (userRole === Role.INSTRUCTOR) {
      return true; // Should verify course ownership at service level
    }

    return false;
  }

  /**
   * Update permission:
   * - Instructor can update assignments in their courses
   * - Admin can update any assignment
   */
  async canUpdate(
    userId: number,
    userRole: Role | string,
    assignment: any,
  ): Promise<boolean> {
    // Super admin and admin can update any assignment
    if (this.isAdminOrHigher(userRole)) {
      return true;
    }

    // Instructor can update assignments in their courses
    if (userRole === Role.INSTRUCTOR && assignment.course?.instructorId === userId) {
      return true;
    }

    return false;
  }

  /**
   * Delete permission:
   * - Instructor can delete assignments in their courses (if no submissions)
   * - Admin can delete any assignment
   */
  async canDelete(
    userId: number,
    userRole: Role | string,
    assignment: any,
  ): Promise<boolean> {
    // Super admin can delete any assignment
    if (this.isSuperAdmin(userRole)) {
      return true;
    }

    // Admin can delete assignments
    if (this.isAdminOrHigher(userRole)) {
      return true;
    }

    // Instructor can delete assignments in their courses if no submissions
    if (
      userRole === Role.INSTRUCTOR &&
      assignment.course?.instructorId === userId &&
      (!assignment.submissionsCount || assignment.submissionsCount === 0)
    ) {
      return true;
    }

    return false;
  }

  /**
   * Submit assignment permission (special action)
   * - Only enrolled students can submit assignments
   */
  async canSubmit(
    userId: number,
    userRole: Role | string,
    assignment: any,
  ): Promise<boolean> {
    // Only students can submit assignments
    if (userRole !== Role.STUDENT) {
      return false;
    }

    // Student must be enrolled in the course
    // This should be verified at service level
    return true;
  }

  /**
   * Grade submission permission (special action)
   * - Only the course instructor can grade
   * - Admins can also grade
   */
  async canGrade(
    userId: number,
    userRole: Role | string,
    submission: any,
  ): Promise<boolean> {
    // Super admin and admin can grade
    if (this.isAdminOrHigher(userRole)) {
      return true;
    }

    // Instructor can grade submissions in their courses
    if (userRole === Role.INSTRUCTOR && submission.assignment?.course?.instructorId === userId) {
      return true;
    }

    return false;
  }
}
