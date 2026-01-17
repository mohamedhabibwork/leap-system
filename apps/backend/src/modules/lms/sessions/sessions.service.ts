import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@leap-lms/database';
import { eq, and, sql, desc, between, gte, lte } from 'drizzle-orm';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import {
  lessonSessions,
  sessionAttendees,
  lessons,
  courseSections,
  courses,
  enrollments,
} from '@leap-lms/database';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';

@Injectable()
export class SessionsService {
  constructor(@Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<typeof schema>) {}

  async create(createSessionDto: CreateSessionDto, instructorId: number) {
    // Verify the lesson belongs to a course owned by the instructor
    const lesson = await this.db
      .select({
        lessonId: lessons.id,
        courseId: courses.id,
        instructorId: courses.instructorId,
      })
      .from(lessons)
      .innerJoin(courseSections, eq(lessons.sectionId, courseSections.id))
      .innerJoin(courses, eq(courseSections.courseId, courses.id))
      .where(eq(lessons.id, createSessionDto.lessonId))
      .limit(1);

    if (!lesson.length || lesson[0].instructorId !== instructorId) {
      throw new ForbiddenException('You do not have permission to create sessions for this lesson');
    }

    const [session] = await this.db
      .insert(lessonSessions)
      .values({
        ...createSessionDto,
        startTime: new Date(createSessionDto.startTime),
        endTime: new Date(createSessionDto.endTime),
      } as InferInsertModel<typeof lessonSessions>)
      .returning();

    return session;
  }

  async findAll(filters?: {
    courseId?: number;
    startDate?: Date;
    endDate?: Date;
    statusId?: number;
  }) {
    const conditions = [eq(lessonSessions.isDeleted, false)];

    if (filters?.startDate) {
      conditions.push(gte(lessonSessions.startTime, filters.startDate));
    }
    if (filters?.endDate) {
      conditions.push(lte(lessonSessions.startTime, filters.endDate));
    }
    if (filters?.statusId) {
      conditions.push(eq(lessonSessions.statusId, filters.statusId));
    }

    let query = this.db
      .select({
        id: lessonSessions.id,
        uuid: lessonSessions.uuid,
        lessonId: lessonSessions.lessonId,
        titleEn: lessonSessions.titleEn,
        titleAr: lessonSessions.titleAr,
        startTime: lessonSessions.startTime,
        endTime: lessonSessions.endTime,
        timezone: lessonSessions.timezone,
        meetingUrl: lessonSessions.meetingUrl,
        maxAttendees: lessonSessions.maxAttendees,
        attendanceCount: lessonSessions.attendanceCount,
        statusId: lessonSessions.statusId,
        createdAt: lessonSessions.createdAt,
        lessonTitle: lessons.titleEn,
        courseId: courses.id,
        courseName: courses.titleEn,
      })
      .from(lessonSessions)
      .innerJoin(lessons, eq(lessonSessions.lessonId, lessons.id))
      .innerJoin(courseSections, eq(lessons.sectionId, courseSections.id))
      .innerJoin(courses, eq(courseSections.courseId, courses.id));

    if (filters?.courseId) {
      conditions.push(eq(courses.id, filters.courseId));
    }

    return await query.where(and(...conditions)).orderBy(desc(lessonSessions.startTime));
  }

  async findOne(id: number) {
    const [session] = await this.db
      .select({
        id: lessonSessions.id,
        uuid: lessonSessions.uuid,
        lessonId: lessonSessions.lessonId,
        titleEn: lessonSessions.titleEn,
        titleAr: lessonSessions.titleAr,
        sessionTypeId: lessonSessions.sessionTypeId,
        startTime: lessonSessions.startTime,
        endTime: lessonSessions.endTime,
        timezone: lessonSessions.timezone,
        meetingUrl: lessonSessions.meetingUrl,
        meetingPassword: lessonSessions.meetingPassword,
        maxAttendees: lessonSessions.maxAttendees,
        descriptionEn: lessonSessions.descriptionEn,
        descriptionAr: lessonSessions.descriptionAr,
        recordingUrl: lessonSessions.recordingUrl,
        statusId: lessonSessions.statusId,
        attendanceCount: lessonSessions.attendanceCount,
        createdAt: lessonSessions.createdAt,
        updatedAt: lessonSessions.updatedAt,
        lessonTitle: lessons.titleEn,
        courseId: courses.id,
        courseName: courses.titleEn,
      })
      .from(lessonSessions)
      .innerJoin(lessons, eq(lessonSessions.lessonId, lessons.id))
      .innerJoin(courseSections, eq(lessons.sectionId, courseSections.id))
      .innerJoin(courses, eq(courseSections.courseId, courses.id))
      .where(and(eq(lessonSessions.id, id), eq(lessonSessions.isDeleted, false)))
      .limit(1);

    if (!session) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }

    return session;
  }

  async update(id: number, updateSessionDto: UpdateSessionDto, instructorId: number) {
    const session = await this.findOne(id);

    // Verify the session belongs to a course owned by the instructor
    const lesson = await this.db
      .select({
        instructorId: courses.instructorId,
      })
      .from(lessons)
      .innerJoin(courseSections, eq(lessons.sectionId, courseSections.id))
      .innerJoin(courses, eq(courseSections.courseId, courses.id))
      .where(eq(lessons.id, session.lessonId))
      .limit(1);

    if (!lesson.length || lesson[0].instructorId !== instructorId) {
      throw new ForbiddenException('You do not have permission to update this session');
    }

    const updateData: any = { ...updateSessionDto };
    if (updateSessionDto.startTime) {
      updateData.startTime = new Date(updateSessionDto.startTime);
    }
    if (updateSessionDto.endTime) {
      updateData.endTime = new Date(updateSessionDto.endTime);
    }

    const [updated] = await this.db
      .update(lessonSessions)
      .set({ ...updateData, updatedAt: new Date() } as Partial<InferInsertModel<typeof lessonSessions>>)
      .where(eq(lessonSessions.id, id))
      .returning();

    return updated;
  }

  async remove(id: number, instructorId: number) {
    const session = await this.findOne(id);

    // Verify the session belongs to a course owned by the instructor
    const lesson = await this.db
      .select({
        instructorId: courses.instructorId,
      })
      .from(lessons)
      .innerJoin(courseSections, eq(lessons.sectionId, courseSections.id))
      .innerJoin(courses, eq(courseSections.courseId, courses.id))
      .where(eq(lessons.id, session.lessonId))
      .limit(1);

    if (!lesson.length || lesson[0].instructorId !== instructorId) {
      throw new ForbiddenException('You do not have permission to delete this session');
    }

    await this.db
      .update(lessonSessions)
      .set({ isDeleted: true, deletedAt: new Date() } as Partial<InferSelectModel<typeof lessonSessions>>)
      .where(eq(lessonSessions.id, id));

    return { message: 'Session deleted successfully' };
  }

  async markAttendance(sessionId: number, attendanceDto: MarkAttendanceDto) {
    // Verify session exists
    await this.findOne(sessionId);

    // Check if attendance already exists
    const existing = await this.db
      .select()
      .from(sessionAttendees)
      .where(
        and(
          eq(sessionAttendees.sessionId, sessionId),
          eq(sessionAttendees.userId, attendanceDto.userId),
          eq(sessionAttendees.isDeleted, false)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing attendance
      const [updated] = await this.db
        .update(sessionAttendees)
        .set({
          attendanceStatusId: attendanceDto.attendanceStatusId,
          joinedAt: attendanceDto.joinedAt ? new Date(attendanceDto.joinedAt) : undefined,
          leftAt: attendanceDto.leftAt ? new Date(attendanceDto.leftAt) : undefined,
          durationMinutes: attendanceDto.durationMinutes,
        } as Partial<InferInsertModel<typeof sessionAttendees>>)
        .where(eq(sessionAttendees.id, existing[0].id))
        .returning();

      return updated;
    } else {
      // Create new attendance record
      const [attendance] = await this.db
        .insert(sessionAttendees)
        .values({
          sessionId,
          userId: attendanceDto.userId,
          enrollmentId: attendanceDto.enrollmentId,
          attendanceStatusId: attendanceDto.attendanceStatusId,
          joinedAt: attendanceDto.joinedAt ? new Date(attendanceDto.joinedAt) : undefined,
          leftAt: attendanceDto.leftAt ? new Date(attendanceDto.leftAt) : undefined,
          durationMinutes: attendanceDto.durationMinutes,
        } )
        .returning();

      // Update attendance count
      await this.db
        .update(lessonSessions)
        .set({
          attendanceCount: sql`${lessonSessions.attendanceCount} + 1`,
        } as Partial<InferInsertModel<typeof lessonSessions>>)
        .where(eq(lessonSessions.id, sessionId));

      return attendance;
    }
  }

  async getAttendees(sessionId: number) {
    await this.findOne(sessionId);

    const attendees = await this.db
      .select({
        id: sessionAttendees.id,
        userId: sessionAttendees.userId,
        userName: sql`users.username`,
        userEmail: sql`users.email`,
        attendanceStatusId: sessionAttendees.attendanceStatusId,
        joinedAt: sessionAttendees.joinedAt,
        leftAt: sessionAttendees.leftAt,
        durationMinutes: sessionAttendees.durationMinutes,
        createdAt: sessionAttendees.createdAt,
      })
      .from(sessionAttendees)
      .where(
        and(eq(sessionAttendees.sessionId, sessionId), eq(sessionAttendees.isDeleted, false))
      );

    return attendees;
  }
}
