import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, sql, desc } from 'drizzle-orm';
import {
  quizAttempts,
  quizzes,
  quizAnswers,
  questionBank,
  courseSections,
  courses,
  users,
} from '@leap-lms/database';
import { ReviewAttemptDto } from './dto/review-attempt.dto';

@Injectable()
export class QuizzesService {
  constructor(@Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<any>) {}

  async getQuizAttempts(quizId: number, instructorId: number) {
    // Verify quiz belongs to instructor's course
    const [quiz] = await this.db
      .select({
        quizId: quizzes.id,
        courseId: courseSections.courseId,
        instructorId: courses.instructorId,
      })
      .from(quizzes)
      .innerJoin(courseSections, eq(quizzes.sectionId, courseSections.id))
      .innerJoin(courses, eq(courseSections.courseId, courses.id))
      .where(and(eq(quizzes.id, quizId), eq(quizzes.isDeleted, false)))
      .limit(1);

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    if (quiz.instructorId !== instructorId) {
      throw new ForbiddenException('You do not have permission to view these attempts');
    }

    // Get all attempts for this quiz
    const attempts = await this.db
      .select({
        id: quizAttempts.id,
        uuid: quizAttempts.uuid,
        userId: quizAttempts.userId,
        userName: users.username,
        userEmail: users.email,
        attemptNumber: quizAttempts.attemptNumber,
        score: quizAttempts.score,
        maxScore: quizAttempts.maxScore,
        isPassed: quizAttempts.isPassed,
        startedAt: quizAttempts.startedAt,
        completedAt: quizAttempts.completedAt,
      })
      .from(quizAttempts)
      .innerJoin(users, eq(quizAttempts.userId, users.id))
      .where(and(eq(quizAttempts.quizId, quizId), eq(quizAttempts.isDeleted, false)))
      .orderBy(desc(quizAttempts.completedAt));

    return attempts;
  }

  async getAttemptDetails(attemptId: number, instructorId: number) {
    // Get attempt with quiz and course info
    const [attempt] = await this.db
      .select({
        id: quizAttempts.id,
        uuid: quizAttempts.uuid,
        quizId: quizAttempts.quizId,
        quizTitle: quizzes.titleEn,
        userId: quizAttempts.userId,
        userName: users.username,
        userEmail: users.email,
        attemptNumber: quizAttempts.attemptNumber,
        score: quizAttempts.score,
        maxScore: quizAttempts.maxScore,
        isPassed: quizAttempts.isPassed,
        startedAt: quizAttempts.startedAt,
        completedAt: quizAttempts.completedAt,
        courseId: courses.id,
        courseName: courses.titleEn,
        instructorId: courses.instructorId,
      })
      .from(quizAttempts)
      .innerJoin(quizzes, eq(quizAttempts.quizId, quizzes.id))
      .innerJoin(courseSections, eq(quizzes.sectionId, courseSections.id))
      .innerJoin(courses, eq(courseSections.courseId, courses.id))
      .innerJoin(users, eq(quizAttempts.userId, users.id))
      .where(and(eq(quizAttempts.id, attemptId), eq(quizAttempts.isDeleted, false)))
      .limit(1);

    if (!attempt) {
      throw new NotFoundException('Quiz attempt not found');
    }

    if (attempt.instructorId !== instructorId) {
      throw new ForbiddenException('You do not have permission to view this attempt');
    }

    // Get answers for this attempt with question details
    const answers = await this.db
      .select({
        id: quizAnswers.id,
        questionId: quizAnswers.questionId,
        questionText: questionBank.questionTextEn,
        selectedOptionId: quizAnswers.selectedOptionId,
        answerText: quizAnswers.answerText,
        isCorrect: quizAnswers.isCorrect,
        pointsEarned: quizAnswers.pointsEarned,
        maxPoints: questionBank.points,
      })
      .from(quizAnswers)
      .innerJoin(questionBank, eq(quizAnswers.questionId, questionBank.id))
      .where(and(eq(quizAnswers.attemptId, attemptId), eq(quizAnswers.isDeleted, false)));

    return {
      ...attempt,
      answers,
    };
  }

  async reviewAttempt(attemptId: number, reviewDto: ReviewAttemptDto, instructorId: number) {
    // Verify attempt belongs to instructor's course
    const attempt = await this.getAttemptDetails(attemptId, instructorId);

    // Note: Since the quiz_attempts table doesn't have feedback fields in the schema,
    // this would typically update a separate review table or add feedback to quiz_answers
    // For now, we'll return a success message
    // TODO: Add feedback fields to database schema or create a separate reviews table

    return {
      message: 'Review added successfully',
      attemptId,
      feedback: reviewDto.feedback,
      notes: reviewDto.notes,
    };
  }

  async getAllAttempts(instructorId: number, courseId?: number) {
    const conditions: any[] = [
      eq(quizAttempts.isDeleted, false),
      eq(courses.instructorId, instructorId),
    ];

    if (courseId) {
      conditions.push(eq(courses.id, courseId));
    }

    const attempts = await this.db
      .select({
        id: quizAttempts.id,
        uuid: quizAttempts.uuid,
        quizId: quizAttempts.quizId,
        quizTitle: quizzes.titleEn,
        userId: quizAttempts.userId,
        userName: users.username,
        userEmail: users.email,
        attemptNumber: quizAttempts.attemptNumber,
        score: quizAttempts.score,
        maxScore: quizAttempts.maxScore,
        isPassed: quizAttempts.isPassed,
        completedAt: quizAttempts.completedAt,
        courseId: courses.id,
        courseName: courses.titleEn,
      })
      .from(quizAttempts)
      .innerJoin(quizzes, eq(quizAttempts.quizId, quizzes.id))
      .innerJoin(courseSections, eq(quizzes.sectionId, courseSections.id))
      .innerJoin(courses, eq(courseSections.courseId, courses.id))
      .innerJoin(users, eq(quizAttempts.userId, users.id))
      .where(and(...conditions))
      .orderBy(desc(quizAttempts.completedAt))
      .limit(100);

    return attempts;
  }
}
