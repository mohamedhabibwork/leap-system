import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@leap-lms/database';
import { eq, and } from 'drizzle-orm';
import { lessons, courseSections, courses, enrollments } from '@leap-lms/database';

@Injectable()
export class EnrollmentCheckGuard implements CanActivate {
  constructor(@Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<typeof schema>) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const lessonId = parseInt(request.params.id || request.params.lessonId);

    if (!user || !lessonId) {
      throw new ForbiddenException('Authentication required');
    }

    // Get lesson with course information
    const [lessonData] = await this.db
      .select({
        lessonId: lessons.id,
        isPreview: lessons.isPreview,
        courseId: courses.id,
        instructorId: courses.instructorId,
      })
      .from(lessons)
      .innerJoin(courseSections, eq(lessons.sectionId, courseSections.id))
      .innerJoin(courses, eq(courseSections.courseId, courses.id))
      .where(and(eq(lessons.id, lessonId), eq(lessons.isDeleted, false)))
      .limit(1);

    if (!lessonData) {
      throw new ForbiddenException('Lesson not found');
    }

    // Allow if user is admin
    if (user.role === 'admin') {
      return true;
    }

    // Allow if user is the course instructor
    if (lessonData.instructorId === user.id) {
      return true;
    }

    // Allow if lesson is a preview
    if (lessonData.isPreview) {
      return true;
    }

    // Check if user is enrolled in the course
    const [enrollment] = await this.db
      .select()
      .from(enrollments)
      .where(
        and(
          eq(enrollments.userId, user.id),
          eq(enrollments.courseId, lessonData.courseId),
          eq(enrollments.isDeleted, false)
        )
      )
      .limit(1);

    if (!enrollment) {
      throw new ForbiddenException('Enrollment required to access this lesson');
    }

    // Check if enrollment is expired
    if (enrollment.expiresAt && new Date(enrollment.expiresAt) < new Date()) {
      throw new ForbiddenException('Your enrollment has expired');
    }

    return true;
  }
}
