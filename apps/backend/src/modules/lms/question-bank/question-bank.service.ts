import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@leap-lms/database';
import { eq, and, isNull, desc, or } from 'drizzle-orm';
import { questionBank, questionOptions, courses } from '@leap-lms/database';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Injectable()
export class QuestionBankService {
  constructor(@Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<typeof schema>) {}

  async create(dto: CreateQuestionDto, userId: number) {
    // If courseId is provided, verify user has access to that course
    if (dto.courseId) {
      const course = await this.db
        .select()
        .from(courses)
        .where(and(eq(courses.id, dto.courseId), eq(courses.isDeleted, false)))
        .limit(1);

      if (!course.length) {
        throw new NotFoundException('Course not found');
      }
    }

    // Create question
    const [question] = await this.db
      .insert(questionBank)
      .values({
        courseId: dto.courseId || null,
        questionTypeId: dto.questionTypeId,
        questionTextEn: dto.questionTextEn,
        questionTextAr: dto.questionTextAr,
        explanationEn: dto.explanationEn,
        explanationAr: dto.explanationAr,
        points: dto.points || 1,
      } as any)
      .returning();

    // Create options
    if (dto.options && dto.options.length > 0) {
      await this.db.insert(questionOptions).values(
        dto.options.map((opt, index) => ({
          questionId: question.id,
          optionTextEn: opt.optionTextEn,
          optionTextAr: opt.optionTextAr,
          isCorrect: opt.isCorrect,
          displayOrder: opt.displayOrder !== undefined ? opt.displayOrder : index,
        })),
      );
    }

    return this.findOne(question.id);
  }

  async findAll(userId: number, isAdmin: boolean, courseId?: number) {
    const conditions: any[] = [eq(questionBank.isDeleted, false)];

    if (courseId) {
      // Filter by specific course
      conditions.push(eq(questionBank.courseId, courseId));
    } else if (!isAdmin) {
      // Non-admins can only see general questions or their own course questions
      // This would require joining with courses to check instructorId
      // For now, we'll allow all questions for instructors
    }

    const questions = await this.db
      .select()
      .from(questionBank)
      .where(and(...conditions))
      .orderBy(desc(questionBank.createdAt));

    return questions;
  }

  async findGeneral() {
    const questions = await this.db
      .select()
      .from(questionBank)
      .where(and(isNull(questionBank.courseId), eq(questionBank.isDeleted, false)))
      .orderBy(desc(questionBank.createdAt));

    return questions;
  }

  async findByCourse(courseId: number) {
    const questions = await this.db
      .select()
      .from(questionBank)
      .where(and(eq(questionBank.courseId, courseId), eq(questionBank.isDeleted, false)))
      .orderBy(desc(questionBank.createdAt));

    return questions;
  }

  async findOne(id: number) {
    const [question] = await this.db
      .select()
      .from(questionBank)
      .where(and(eq(questionBank.id, id), eq(questionBank.isDeleted, false)))
      .limit(1);

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    // Get options
    const options = await this.db
      .select()
      .from(questionOptions)
      .where(and(eq(questionOptions.questionId, id), eq(questionOptions.isDeleted, false)))
      .orderBy(questionOptions.displayOrder);

    return {
      ...question,
      options,
    };
  }

  async update(id: number, dto: UpdateQuestionDto, userId: number, isAdmin: boolean) {
    const question = await this.findOne(id);

    // Verify access (admin or owner of course question)
    if (!isAdmin && question.courseId) {
      const course = await this.db
        .select()
        .from(courses)
        .where(eq(courses.id, question.courseId))
        .limit(1);

      if (course.length && course[0].instructorId !== userId) {
        throw new ForbiddenException('You do not have permission to update this question');
      }
    }

    // Update question
    if (dto.questionTextEn || dto.questionTextAr || dto.explanationEn || dto.explanationAr || dto.points) {
      await this.db
        .update(questionBank)
        .set({
          questionTextEn: dto.questionTextEn,
          questionTextAr: dto.questionTextAr,
          explanationEn: dto.explanationEn,
          explanationAr: dto.explanationAr,
          points: dto.points,
          updatedAt: new Date(),
        } as any)
        .where(eq(questionBank.id, id));
    }

    // Update options if provided
    if (dto.options) {
      // Delete old options
      await this.db
        .update(questionOptions)
        .set({ isDeleted: true } as any)
        .where(eq(questionOptions.questionId, id));

      // Insert new options
      await this.db.insert(questionOptions).values(
        dto.options.map((opt, index) => ({
          questionId: id,
          optionTextEn: opt.optionTextEn,
          optionTextAr: opt.optionTextAr,
          isCorrect: opt.isCorrect,
          displayOrder: opt.displayOrder !== undefined ? opt.displayOrder : index,
        })),
      );
    }

    return this.findOne(id);
  }

  async remove(id: number, userId: number, isAdmin: boolean) {
    const question = await this.findOne(id);

    // Verify access
    if (!isAdmin && question.courseId) {
      const course = await this.db
        .select()
        .from(courses)
        .where(eq(courses.id, question.courseId))
        .limit(1);

      if (course.length && course[0].instructorId !== userId) {
        throw new ForbiddenException('You do not have permission to delete this question');
      }
    }

    // Soft delete
    await this.db
      .update(questionBank)
      .set({ isDeleted: true, deletedAt: new Date() } as any)
      .where(eq(questionBank.id, id));
  }
}
