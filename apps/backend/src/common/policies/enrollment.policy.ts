import { Injectable } from '@nestjs/common';
import { BasePolicy } from './base.policy';
import { Role } from '../enums/roles.enum';

/**
 * Enrollment Policy
 * Defines authorization rules for enrollment resources
 */
@Injectable()
export class EnrollmentPolicy extends BasePolicy {
  /**
   * View permission:
   * - Student: Their own enrollments
   * - Instructor: Enrollments in their courses
   * - Admin: All enrollments
   */
  async canView(
    userId: number,
    userRole: Role | string,
    enrollment: any,
  ): Promise<boolean> {
    // Super admin can view everything
    if (this.isSuperAdmin(userRole)) {
      return true;
    }

    // Admin can view all enrollments
    if (this.isAdminOrHigher(userRole)) {
      return true;
    }

    // Student can view their own enrollments
    if (userRole === Role.STUDENT && enrollment.userId === userId) {
      return true;
    }

    // Instructor can view enrollments in their courses
    if (userRole === Role.INSTRUCTOR && enrollment.course?.instructorId === userId) {
      return true;
    }

    return false;
  }

  /**
   * Create permission:
   * - Students can enroll themselves
   * - Admins can enroll anyone
   */
  async canCreate(
    userId: number,
    userRole: Role | string,
    data?: any,
  ): Promise<boolean> {
    // Super admin and admin can create enrollments
    if (this.isAdminOrHigher(userRole)) {
      return true;
    }

    // Students can enroll themselves
    if (userRole === Role.STUDENT && data?.userId === userId) {
      return true;
    }

    return false;
  }

  /**
   * Update permission:
   * - Instructor can update enrollments in their courses (progress, grades)
   * - Admin can update any enrollment
   * - Students cannot update enrollments directly
   */
  async canUpdate(
    userId: number,
    userRole: Role | string,
    enrollment: any,
  ): Promise<boolean> {
    // Super admin and admin can update any enrollment
    if (this.isAdminOrHigher(userRole)) {
      return true;
    }

    // Instructor can update enrollments in their courses
    if (userRole === Role.INSTRUCTOR && enrollment.course?.instructorId === userId) {
      return true;
    }

    return false;
  }

  /**
   * Delete permission:
   * - Student can unenroll (before course completion)
   * - Admin can delete any enrollment
   */
  async canDelete(
    userId: number,
    userRole: Role | string,
    enrollment: any,
  ): Promise<boolean> {
    // Super admin and admin can delete any enrollment
    if (this.isAdminOrHigher(userRole)) {
      return true;
    }

    // Student can unenroll if not completed
    if (
      userRole === Role.STUDENT &&
      enrollment.userId === userId &&
      enrollment.status !== 'completed'
    ) {
      return true;
    }

    return false;
  }
}
