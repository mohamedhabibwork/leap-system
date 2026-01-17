import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@leap-lms/database';
import { eq, and, sql, desc, isNull } from 'drizzle-orm';
import type { InferInsertModel } from 'drizzle-orm';
import {
  assignmentSubmissions,
  assignments,
  courseSections,
  courses,
  users,
} from '@leap-lms/database';
import { GradeSubmissionDto } from './dto/grade-submission.dto';

@Injectable()
export class AssignmentsService {
  constructor(@Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<typeof schema>) {}

  async findAll() {
    return await this.db
      .select()
      .from(assignments)
      .where(eq(assignments.isDeleted, false))
      .orderBy(desc(assignments.createdAt));
  }

  async findOne(id: number) {
    const [assignment] = await this.db
      .select()
      .from(assignments)
      .where(and(eq(assignments.id, id), eq(assignments.isDeleted, false)))
      .limit(1);
    
    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${id} not found`);
    }
    return assignment;
  }

  async findBySection(sectionId: number) {
    return await this.db
      .select()
      .from(assignments)
      .where(and(eq(assignments.sectionId, sectionId), eq(assignments.isDeleted, false)))
      .orderBy(desc(assignments.createdAt));
  }

  async create(data: any) {
    const [assignment] = await this.db
      .insert(assignments)
      .values(data)
      .returning();
    return assignment;
  }

  async update(id: number, data: any) {
    await this.findOne(id);
    const [updated] = await this.db
      .update(assignments)
      .set(data)
      .where(eq(assignments.id, id))
      .returning();
    return updated;
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.db
      .update(assignments)
      .set({ isDeleted: true } as Partial<InferInsertModel<typeof assignments>>)
      .where(eq(assignments.id, id));
  }

  async gradeSubmission(
    submissionId: number,
    gradeDto: GradeSubmissionDto,
    instructorId: number
  ) {
    // Get submission details with course info
    const [submission] = await this.db
      .select({
        id: assignmentSubmissions.id,
        assignmentId: assignmentSubmissions.assignmentId,
        userId: assignmentSubmissions.userId,
        sectionId: assignments.sectionId,
        courseId: courseSections.courseId,
        instructorId: courses.instructorId,
      })
      .from(assignmentSubmissions)
      .innerJoin(assignments, eq(assignmentSubmissions.assignmentId, assignments.id))
      .innerJoin(courseSections, eq(assignments.sectionId, courseSections.id))
      .innerJoin(courses, eq(courseSections.courseId, courses.id))
      .where(
        and(
          eq(assignmentSubmissions.id, submissionId),
          eq(assignmentSubmissions.isDeleted, false)
        )
      )
      .limit(1);

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    if (submission.instructorId !== instructorId) {
      throw new ForbiddenException('You do not have permission to grade this submission');
    }

    // Update submission with grade
    const [graded] = await this.db
      .update(assignmentSubmissions)
      .set({
        score: gradeDto.score.toString(),
        maxPoints: gradeDto.maxPoints.toString(),
        feedback: gradeDto.feedback,
        gradedBy: gradeDto.gradedBy || instructorId,
        gradedAt: new Date(),
      } )
      .where(eq(assignmentSubmissions.id, submissionId))
      .returning();

    return graded;
  }

  async getPendingSubmissions(instructorId: number, courseId?: number) {
    const conditions: any[] = [
      eq(assignmentSubmissions.isDeleted, false),
      isNull(assignmentSubmissions.gradedAt),
      eq(courses.instructorId, instructorId),
    ];

    if (courseId) {
      conditions.push(eq(courses.id, courseId));
    }

    const submissions = await this.db
      .select({
        id: assignmentSubmissions.id,
        uuid: assignmentSubmissions.uuid,
        assignmentId: assignmentSubmissions.assignmentId,
        assignmentTitle: assignments.titleEn,
        userId: assignmentSubmissions.userId,
        userName: users.username,
        userEmail: users.email,
        submissionText: assignmentSubmissions.submissionText,
        fileUrl: assignmentSubmissions.fileUrl,
        submittedAt: assignmentSubmissions.submittedAt,
        courseId: courses.id,
        courseName: courses.titleEn,
      })
      .from(assignmentSubmissions)
      .innerJoin(assignments, eq(assignmentSubmissions.assignmentId, assignments.id))
      .innerJoin(courseSections, eq(assignments.sectionId, courseSections.id))
      .innerJoin(courses, eq(courseSections.courseId, courses.id))
      .innerJoin(users, eq(assignmentSubmissions.userId, users.id))
      .where(and(...conditions))
      .orderBy(desc(assignmentSubmissions.submittedAt))
      .limit(100);

    return submissions;
  }

  async getSubmissionDetails(submissionId: number, instructorId: number) {
    const [submission] = await this.db
      .select({
        id: assignmentSubmissions.id,
        uuid: assignmentSubmissions.uuid,
        assignmentId: assignmentSubmissions.assignmentId,
        assignmentTitle: assignments.titleEn,
        assignmentDescription: assignments.descriptionEn,
        assignmentInstructions: assignments.instructionsEn,
        maxPoints: assignments.maxPoints,
        userId: assignmentSubmissions.userId,
        userName: users.username,
        userEmail: users.email,
        submissionText: assignmentSubmissions.submissionText,
        fileUrl: assignmentSubmissions.fileUrl,
        statusId: assignmentSubmissions.statusId,
        score: assignmentSubmissions.score,
        submittedMaxPoints: assignmentSubmissions.maxPoints,
        feedback: assignmentSubmissions.feedback,
        submittedAt: assignmentSubmissions.submittedAt,
        gradedAt: assignmentSubmissions.gradedAt,
        gradedBy: assignmentSubmissions.gradedBy,
        courseId: courses.id,
        courseName: courses.titleEn,
        instructorId: courses.instructorId,
      })
      .from(assignmentSubmissions)
      .innerJoin(assignments, eq(assignmentSubmissions.assignmentId, assignments.id))
      .innerJoin(courseSections, eq(assignments.sectionId, courseSections.id))
      .innerJoin(courses, eq(courseSections.courseId, courses.id))
      .innerJoin(users, eq(assignmentSubmissions.userId, users.id))
      .where(
        and(
          eq(assignmentSubmissions.id, submissionId),
          eq(assignmentSubmissions.isDeleted, false)
        )
      )
      .limit(1);

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    if (submission.instructorId !== instructorId) {
      throw new ForbiddenException('You do not have permission to view this submission');
    }

    return submission;
  }
}
