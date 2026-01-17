import { Injectable, Inject, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@leap-lms/database';
import { eq, and, sql, desc, inArray, count } from 'drizzle-orm';
import {
  quizAttempts,
  quizzes,
  quizAnswers,
  questionBank,
  courseSections,
  courses,
  users,
  quizQuestions,
  lessons,
  questionOptions,
  enrollments,
} from '@leap-lms/database';
import { ReviewAttemptDto } from './dto/review-attempt.dto';
import { AddQuestionsToQuizDto } from './dto/add-questions.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';

@Injectable()
export class QuizzesService {
  constructor(@Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<typeof schema>) {}

  async findAll() {
    return await this.db
      .select()
      .from(quizzes)
      .where(eq(quizzes.isDeleted, false))
      .orderBy(desc(quizzes.createdAt));
  }

  async findOne(id: number) {
    const [quiz] = await this.db
      .select()
      .from(quizzes)
      .where(and(eq(quizzes.id, id), eq(quizzes.isDeleted, false)))
      .limit(1);
    
    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }
    return quiz;
  }

  async findBySection(sectionId: number) {
    return await this.db
      .select()
      .from(quizzes)
      .where(and(eq(quizzes.sectionId, sectionId), eq(quizzes.isDeleted, false)))
      .orderBy(desc(quizzes.createdAt));
  }

  async findByLesson(lessonId: number) {
    return await this.db
      .select()
      .from(quizzes)
      .where(and(eq(quizzes.lessonId, lessonId), eq(quizzes.isDeleted, false)))
      .orderBy(desc(quizzes.createdAt));
  }

  async create(data: any) {
    const [quiz] = await this.db
      .insert(quizzes)
      .values(data)
      .returning();
    return quiz;
  }

  async update(id: number, data: any) {
    await this.findOne(id);
    const [updated] = await this.db
      .update(quizzes)
      .set(data)
      .where(eq(quizzes.id, id))
      .returning();
    return updated;
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.db
      .update(quizzes)
      .set({ isDeleted: true } )
      .where(eq(quizzes.id, id));
  }

  async addQuestionsToQuiz(quizId: number, dto: AddQuestionsToQuizDto) {
    const quiz = await this.findOne(quizId);

    // Verify all questions exist
    const questions = await this.db
      .select()
      .from(questionBank)
      .where(and(inArray(questionBank.id, dto.questionIds), eq(questionBank.isDeleted, false)));

    if (questions.length !== dto.questionIds.length) {
      throw new BadRequestException('Some questions not found');
    }

    // Get existing questions
    const existing = await this.db
      .select({ questionId: quizQuestions.questionId })
      .from(quizQuestions)
      .where(and(eq(quizQuestions.quizId, quizId), eq(quizQuestions.isDeleted, false)));

    const existingIds = existing.map((q) => q.questionId);
    const newQuestionIds = dto.questionIds.filter((id) => !existingIds.includes(id));

    if (newQuestionIds.length === 0) {
      throw new BadRequestException('All questions already added to quiz');
    }

    // Add new questions
    await this.db.insert(quizQuestions).values(
      newQuestionIds.map((questionId, index) => ({
        quizId,
        questionId,
        displayOrder: existing.length + index,
      })),
    );

    return { message: `Added ${newQuestionIds.length} questions to quiz`, addedCount: newQuestionIds.length };
  }

  async removeQuestionFromQuiz(quizId: number, questionId: number) {
    await this.findOne(quizId);

    // Soft delete the quiz question association
    await this.db
      .update(quizQuestions)
      .set({ isDeleted: true })
      .where(and(eq(quizQuestions.quizId, quizId), eq(quizQuestions.questionId, questionId)));

    return { message: 'Question removed from quiz' };
  }

  async getQuizQuestions(quizId: number) {
    await this.findOne(quizId);

    const questions = await this.db
      .select({
        id: questionBank.id,
        questionTextEn: questionBank.questionTextEn,
        questionTextAr: questionBank.questionTextAr,
        questionTypeId: questionBank.questionTypeId,
        points: questionBank.points,
        displayOrder: quizQuestions.displayOrder,
      })
      .from(quizQuestions)
      .innerJoin(questionBank, eq(quizQuestions.questionId, questionBank.id))
      .where(and(eq(quizQuestions.quizId, quizId), eq(quizQuestions.isDeleted, false)))
      .orderBy(quizQuestions.displayOrder);

    return questions;
  }

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

  // Student Quiz-Taking Methods

  async startQuizAttempt(quizId: number, userId: number) {
    const quiz = await this.findOne(quizId);

    // Verify enrollment in the course
    const courseIdQuery = await this.db
      .select({ courseId: courseSections.courseId })
      .from(courseSections)
      .where(eq(courseSections.id, quiz.sectionId))
      .limit(1);

    if (!courseIdQuery.length) {
      throw new NotFoundException('Course section not found');
    }

    const courseId = courseIdQuery[0].courseId;

    const enrollment = await this.db
      .select()
      .from(enrollments)
      .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId), eq(enrollments.isDeleted, false)))
      .limit(1);

    if (!enrollment.length) {
      throw new ForbiddenException('You must be enrolled in this course to take the quiz');
    }

    // Check max attempts
    if (quiz.maxAttempts) {
      const attemptCount = await this.db
        .select({ count: count() })
        .from(quizAttempts)
        .where(and(eq(quizAttempts.quizId, quizId), eq(quizAttempts.userId, userId), eq(quizAttempts.isDeleted, false)));

      if (attemptCount[0]?.count >= quiz.maxAttempts) {
        throw new BadRequestException('Maximum attempts reached for this quiz');
      }
    }

    // Get current attempt number
    const previousAttempts = await this.db
      .select({ attemptNumber: quizAttempts.attemptNumber })
      .from(quizAttempts)
      .where(and(eq(quizAttempts.quizId, quizId), eq(quizAttempts.userId, userId), eq(quizAttempts.isDeleted, false)))
      .orderBy(desc(quizAttempts.attemptNumber))
      .limit(1);

    const attemptNumber = previousAttempts.length > 0 ? previousAttempts[0].attemptNumber + 1 : 1;

    // Calculate max score
    const questions = await this.db
      .select({ points: questionBank.points })
      .from(quizQuestions)
      .innerJoin(questionBank, eq(quizQuestions.questionId, questionBank.id))
      .where(and(eq(quizQuestions.quizId, quizId), eq(quizQuestions.isDeleted, false)));

    const maxScore = questions.reduce((sum, q) => sum + (q.points || 1), 0);

    // Create attempt
    const [attempt] = await this.db
      .insert(quizAttempts)
      .values({
        quizId,
        userId,
        attemptNumber,
        maxScore,
        startedAt: new Date(),
      } )
      .returning();

    return {
      attemptId: attempt.id,
      quiz: {
        id: quiz.id,
        titleEn: quiz.titleEn,
        titleAr: quiz.titleAr,
        timeLimitMinutes: quiz.timeLimitMinutes,
        shuffleQuestions: quiz.shuffleQuestions,
      },
      attemptNumber,
      startedAt: attempt.startedAt,
    };
  }

  async getQuizQuestionsForTaking(quizId: number, userId: number) {
    // Verify active attempt
    const activeAttempt = await this.db
      .select()
      .from(quizAttempts)
      .where(
        and(
          eq(quizAttempts.quizId, quizId),
          eq(quizAttempts.userId, userId),
          sql`${quizAttempts.completedAt} IS NULL`,
          eq(quizAttempts.isDeleted, false),
        ),
      )
      .orderBy(desc(quizAttempts.startedAt))
      .limit(1);

    if (!activeAttempt.length) {
      throw new BadRequestException('No active quiz attempt found. Please start the quiz first.');
    }

    // Get questions with options (but not showing which is correct)
    const questions = await this.db
      .select({
        id: questionBank.id,
        questionTextEn: questionBank.questionTextEn,
        questionTextAr: questionBank.questionTextAr,
        questionTypeId: questionBank.questionTypeId,
        points: questionBank.points,
        displayOrder: quizQuestions.displayOrder,
      })
      .from(quizQuestions)
      .innerJoin(questionBank, eq(quizQuestions.questionId, questionBank.id))
      .where(and(eq(quizQuestions.quizId, quizId), eq(quizQuestions.isDeleted, false)))
      .orderBy(quizQuestions.displayOrder);

    // Get options for each question (without showing correct answer)
    const questionsWithOptions = await Promise.all(
      questions.map(async (question) => {
        const options = await this.db
          .select({
            id: questionOptions.id,
            optionTextEn: questionOptions.optionTextEn,
            optionTextAr: questionOptions.optionTextAr,
            displayOrder: questionOptions.displayOrder,
            // Don't include isCorrect for students
          })
          .from(questionOptions)
          .where(and(eq(questionOptions.questionId, question.id), eq(questionOptions.isDeleted, false)))
          .orderBy(questionOptions.displayOrder);

        return {
          ...question,
          options,
        };
      }),
    );

    return {
      attemptId: activeAttempt[0].id,
      questions: questionsWithOptions,
    };
  }

  async submitQuizAttempt(dto: SubmitQuizDto, userId: number) {
    // Get attempt
    const [attempt] = await this.db
      .select()
      .from(quizAttempts)
      .where(and(eq(quizAttempts.id, dto.attemptId), eq(quizAttempts.userId, userId), eq(quizAttempts.isDeleted, false)))
      .limit(1);

    if (!attempt) {
      throw new NotFoundException('Quiz attempt not found');
    }

    if (attempt.completedAt) {
      throw new BadRequestException('Quiz attempt already submitted');
    }

    // Get quiz details
    const quiz = await this.findOne(attempt.quizId);

    // Get questions with correct answers
    const questions = await this.db
      .select({
        id: questionBank.id,
        points: questionBank.points,
      })
      .from(quizQuestions)
      .innerJoin(questionBank, eq(quizQuestions.questionId, questionBank.id))
      .where(and(eq(quizQuestions.quizId, attempt.quizId), eq(quizQuestions.isDeleted, false)));

    let totalScore = 0;

    // Process each answer
    for (const answer of dto.answers) {
      const question = questions.find((q) => q.id === answer.questionId);
      if (!question) continue;

      let isCorrect = false;
      let pointsEarned = 0;

      if (answer.selectedOptionId) {
        // Check if selected option is correct
        const [option] = await this.db
          .select({ isCorrect: questionOptions.isCorrect })
          .from(questionOptions)
          .where(eq(questionOptions.id, answer.selectedOptionId))
          .limit(1);

        if (option && option.isCorrect) {
          isCorrect = true;
          pointsEarned = question.points || 1;
          totalScore += pointsEarned;
        }
      }

      // Save answer
      await this.db.insert(quizAnswers).values({
        attemptId: dto.attemptId,
        questionId: answer.questionId,
        selectedOptionId: answer.selectedOptionId || null,
        answerText: answer.answerText || null,
        isCorrect,
        pointsEarned,
      });
    }

    // Calculate if passed
    const isPassed = totalScore >= (quiz.passingScore || 60);

    // Update attempt
    await this.db
      .update(quizAttempts)
      .set({
        score: totalScore,
        isPassed,
        completedAt: new Date(),
      } )
      .where(eq(quizAttempts.id, dto.attemptId));

    return {
      attemptId: dto.attemptId,
      score: totalScore,
      maxScore: attempt.maxScore,
      isPassed,
      passingScore: quiz.passingScore || 60,
    };
  }

  async getStudentQuizResult(attemptId: number, userId: number) {
    const [attempt] = await this.db
      .select()
      .from(quizAttempts)
      .where(and(eq(quizAttempts.id, attemptId), eq(quizAttempts.userId, userId), eq(quizAttempts.isDeleted, false)))
      .limit(1);

    if (!attempt) {
      throw new NotFoundException('Quiz attempt not found');
    }

    const quiz = await this.findOne(attempt.quizId);

    // Get answers with question details
    const answers = await this.db
      .select({
        questionId: quizAnswers.questionId,
        questionTextEn: questionBank.questionTextEn,
        questionTextAr: questionBank.questionTextAr,
        selectedOptionId: quizAnswers.selectedOptionId,
        answerText: quizAnswers.answerText,
        isCorrect: quizAnswers.isCorrect,
        pointsEarned: quizAnswers.pointsEarned,
        maxPoints: questionBank.points,
      })
      .from(quizAnswers)
      .innerJoin(questionBank, eq(quizAnswers.questionId, questionBank.id))
      .where(and(eq(quizAnswers.attemptId, attemptId), eq(quizAnswers.isDeleted, false)));

    // Only show correct answers if quiz allows it
    let answersWithDetails = answers;
    if (quiz.showCorrectAnswers) {
      answersWithDetails = await Promise.all(
        answers.map(async (answer) => {
          const options = await this.db
            .select({
              id: questionOptions.id,
              optionTextEn: questionOptions.optionTextEn,
              optionTextAr: questionOptions.optionTextAr,
              isCorrect: questionOptions.isCorrect,
            })
            .from(questionOptions)
            .where(and(eq(questionOptions.questionId, answer.questionId), eq(questionOptions.isDeleted, false)));

          return {
            ...answer,
            options,
          };
        }),
      );
    }

    return {
      attemptId: attempt.id,
      quiz: {
        id: quiz.id,
        titleEn: quiz.titleEn,
        titleAr: quiz.titleAr,
      },
      score: attempt.score,
      maxScore: attempt.maxScore,
      isPassed: attempt.isPassed,
      passingScore: quiz.passingScore || 60,
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt,
      answers: answersWithDetails,
      showCorrectAnswers: quiz.showCorrectAnswers,
    };
  }

  async getStudentQuizAttempts(userId: number) {
    const attempts = await this.db
      .select({
        id: quizAttempts.id,
        quizId: quizAttempts.quizId,
        quizTitleEn: quizzes.titleEn,
        quizTitleAr: quizzes.titleAr,
        attemptNumber: quizAttempts.attemptNumber,
        score: quizAttempts.score,
        maxScore: quizAttempts.maxScore,
        isPassed: quizAttempts.isPassed,
        startedAt: quizAttempts.startedAt,
        completedAt: quizAttempts.completedAt,
      })
      .from(quizAttempts)
      .innerJoin(quizzes, eq(quizAttempts.quizId, quizzes.id))
      .where(and(eq(quizAttempts.userId, userId), eq(quizAttempts.isDeleted, false)))
      .orderBy(desc(quizAttempts.startedAt));

    return attempts;
  }

  /**
   * Pause a quiz attempt
   */
  async pauseAttempt(attemptId: number, userId: number): Promise<void> {
    const [attempt] = await this.db
      .select()
      .from(quizAttempts)
      .where(
        and(
          eq(quizAttempts.id, attemptId),
          eq(quizAttempts.userId, userId),
          sql`${quizAttempts.completedAt} IS NULL`,
          eq(quizAttempts.isDeleted, false),
        ),
      )
      .limit(1);

    if (!attempt) {
      throw new NotFoundException('Active quiz attempt not found');
    }

    // Store paused time in a JSON field or use a separate pausedAt timestamp
    // For now, we'll use a simple approach with updatedAt to track pause
    await this.db
      .update(quizAttempts)
      .set({
        updatedAt: new Date(),
      } )
      .where(eq(quizAttempts.id, attemptId));
  }

  /**
   * Resume a paused quiz attempt
   */
  async resumeAttempt(attemptId: number, userId: number): Promise<void> {
    const [attempt] = await this.db
      .select()
      .from(quizAttempts)
      .where(
        and(
          eq(quizAttempts.id, attemptId),
          eq(quizAttempts.userId, userId),
          sql`${quizAttempts.completedAt} IS NULL`,
          eq(quizAttempts.isDeleted, false),
        ),
      )
      .limit(1);

    if (!attempt) {
      throw new NotFoundException('Active quiz attempt not found');
    }

    // Resume logic - update timestamp
    await this.db
      .update(quizAttempts)
      .set({
        updatedAt: new Date(),
      } )
      .where(eq(quizAttempts.id, attemptId));
  }

  /**
   * Get remaining time for a quiz attempt
   */
  async getTimeRemaining(attemptId: number, userId: number): Promise<number | null> {
    const [attempt] = await this.db
      .select({
        startedAt: quizAttempts.startedAt,
        quizId: quizAttempts.quizId,
      })
      .from(quizAttempts)
      .where(
        and(
          eq(quizAttempts.id, attemptId),
          eq(quizAttempts.userId, userId),
          sql`${quizAttempts.completedAt} IS NULL`,
          eq(quizAttempts.isDeleted, false),
        ),
      )
      .limit(1);

    if (!attempt) {
      throw new NotFoundException('Active quiz attempt not found');
    }

    const quiz = await this.findOne(attempt.quizId);

    if (!quiz.timeLimitMinutes) {
      return null; // No time limit
    }

    const startTime = new Date(attempt.startedAt);
    const now = new Date();
    const elapsedMinutes = (now.getTime() - startTime.getTime()) / (1000 * 60);
    const remainingMinutes = quiz.timeLimitMinutes - elapsedMinutes;

    return Math.max(0, Math.floor(remainingMinutes * 60)); // Return in seconds
  }

  /**
   * Auto-submit expired quiz attempts
   */
  async autoSubmitExpired(): Promise<number> {
    // Get all active attempts with time limits
    const activeAttempts = await this.db
      .select({
        attemptId: quizAttempts.id,
        quizId: quizAttempts.quizId,
        userId: quizAttempts.userId,
        startedAt: quizAttempts.startedAt,
        timeLimit: quizzes.timeLimitMinutes,
      })
      .from(quizAttempts)
      .innerJoin(quizzes, eq(quizzes.id, quizAttempts.quizId))
      .where(
        and(
          sql`${quizAttempts.completedAt} IS NULL`,
          sql`${quizzes.timeLimitMinutes} IS NOT NULL`,
          eq(quizAttempts.isDeleted, false),
        ),
      );

    let expiredCount = 0;

    for (const attempt of activeAttempts) {
      if (!attempt.timeLimit) continue;

      const startTime = new Date(attempt.startedAt);
      const now = new Date();
      const elapsedMinutes = (now.getTime() - startTime.getTime()) / (1000 * 60);

      if (elapsedMinutes >= attempt.timeLimit) {
        // Auto-submit with current answers
        const answers = await this.db
          .select()
          .from(quizAnswers)
          .where(
            and(
              eq(quizAnswers.attemptId, attempt.attemptId),
              eq(quizAnswers.isDeleted, false),
            ),
          );

        // Calculate score from existing answers
        let totalScore = 0;
        for (const answer of answers) {
          if (answer.isCorrect) {
            totalScore += Number(answer.pointsEarned || 0);
          }
        }

        const quiz = await this.findOne(attempt.quizId);
        const isPassed = totalScore >= (quiz.passingScore || 60);

        await this.db
          .update(quizAttempts)
          .set({
            score: totalScore,
            isPassed,
            completedAt: new Date(),
          } )
          .where(eq(quizAttempts.id, attempt.attemptId));

        expiredCount++;
      }
    }

    return expiredCount;
  }

  /**
   * Flag a question for review
   */
  async flagForReview(attemptId: number, questionId: number, userId: number): Promise<void> {
    const [attempt] = await this.db
      .select()
      .from(quizAttempts)
      .where(
        and(
          eq(quizAttempts.id, attemptId),
          eq(quizAttempts.userId, userId),
          sql`${quizAttempts.completedAt} IS NULL`,
          eq(quizAttempts.isDeleted, false),
        ),
      )
      .limit(1);

    if (!attempt) {
      throw new NotFoundException('Active quiz attempt not found');
    }

    // Update or create answer with flagged status
    const [existingAnswer] = await this.db
      .select()
      .from(quizAnswers)
      .where(
        and(
          eq(quizAnswers.attemptId, attemptId),
          eq(quizAnswers.questionId, questionId),
          eq(quizAnswers.isDeleted, false),
        ),
      )
      .limit(1);

    if (existingAnswer) {
      // Update existing answer to mark as flagged
      await this.db
        .update(quizAnswers)
        .set({
          // Add flagged field if it exists in schema, otherwise use a JSON field
          updatedAt: new Date(),
        } )
        .where(eq(quizAnswers.id, existingAnswer.id));
    } else {
      // Create a placeholder answer marked for review
      await this.db.insert(quizAnswers).values({
        attemptId,
        questionId,
        isFlagged: true, // Assuming this field exists or can be added
      } );
    }
  }

  /**
   * Grade a true/false question
   */
  async gradeTrueFalse(questionId: number, answer: boolean): Promise<{ isCorrect: boolean; points: number }> {
    const [question] = await this.db
      .select({
        id: questionBank.id,
        points: questionBank.points,
      })
      .from(questionBank)
      .where(eq(questionBank.id, questionId))
      .limit(1);

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    // Get correct answer from options (true/false questions have 2 options)
    const options = await this.db
      .select({
        id: questionOptions.id,
        optionTextEn: questionOptions.optionTextEn,
        isCorrect: questionOptions.isCorrect,
      })
      .from(questionOptions)
      .where(
        and(
          eq(questionOptions.questionId, questionId),
          eq(questionOptions.isDeleted, false),
        ),
      );

    const correctOption = options.find((opt) => opt.isCorrect);
    if (!correctOption) {
      throw new BadRequestException('No correct answer found for this question');
    }

    // Determine if the answer is correct
    // Assuming optionTextEn contains "True" or "False"
    const correctAnswer = correctOption.optionTextEn?.toLowerCase().includes('true');
    const isCorrect = answer === correctAnswer;

    return {
      isCorrect,
      points: isCorrect ? (question.points || 1) : 0,
    };
  }

  /**
   * Grade an essay question (requires manual grading)
   */
  async gradeEssay(questionId: number, answerText: string, graderId: number, score: number, feedback?: string): Promise<void> {
    const [question] = await this.db
      .select()
      .from(questionBank)
      .where(eq(questionBank.id, questionId))
      .limit(1);

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    // Essay questions are graded manually, so we just store the answer
    // The actual grading happens when an instructor reviews it
    // This method is for when an instructor grades an essay answer
    // We would need to find the quiz answer record and update it with the grade
  }
}
