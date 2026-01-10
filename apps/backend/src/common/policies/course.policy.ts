import { Injectable } from '@nestjs/common';
import { BasePolicy } from './base.policy';
import { Role } from '../enums/roles.enum';

/**
 * Course Policy
 * Defines authorization rules for course resources
 */
@Injectable()
export class CoursePolicy extends BasePolicy {
  /**
   * View permission:
   * - Published courses: Everyone
   * - Draft courses: Only instructor owner, admins, and super admins
   */
  async canView(
    userId: number,
    userRole: Role | string,
    course: any,
  ): Promise<boolean> {
    // Super admin can view everything
    if (this.isSuperAdmin(userRole)) {
      return true;
    }

    // Published courses are public
    if (course.status === 'published' || course.isPublished) {
      return true;
    }

    // Admin can view all courses
    if (this.isAdminOrHigher(userRole)) {
      return true;
    }

    // Instructor can view their own courses
    if (userRole === Role.INSTRUCTOR && course.instructorId === userId) {
      return true;
    }

    return false;
  }

  /**
   * Create permission:
   * - Only instructors, admins, and super admins can create courses
   */
  async canCreate(
    userId: number,
    userRole: Role | string,
    data?: any,
  ): Promise<boolean> {
    // Super admin and admin can create courses
    if (this.isAdminOrHigher(userRole)) {
      return true;
    }

    // Instructors can create courses
    if (userRole === Role.INSTRUCTOR) {
      return true;
    }

    return false;
  }

  /**
   * Update permission:
   * - Course owner (instructor)
   * - Admins and super admins
   */
  async canUpdate(
    userId: number,
    userRole: Role | string,
    course: any,
  ): Promise<boolean> {
    // Super admin and admin can update any course
    if (this.isAdminOrHigher(userRole)) {
      return true;
    }

    // Instructor can update their own courses
    if (userRole === Role.INSTRUCTOR && course.instructorId === userId) {
      return true;
    }

    return false;
  }

  /**
   * Delete permission:
   * - Course owner (instructor) - only if no enrollments
   * - Admins and super admins
   */
  async canDelete(
    userId: number,
    userRole: Role | string,
    course: any,
  ): Promise<boolean> {
    // Super admin can delete any course
    if (this.isSuperAdmin(userRole)) {
      return true;
    }

    // Admin can delete courses
    if (this.isAdminOrHigher(userRole)) {
      return true;
    }

    // Instructor can delete their own courses if no enrollments
    if (
      userRole === Role.INSTRUCTOR &&
      course.instructorId === userId &&
      (!course.enrollmentsCount || course.enrollmentsCount === 0)
    ) {
      return true;
    }

    return false;
  }
}
