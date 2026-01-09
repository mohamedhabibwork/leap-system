import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { ReviewAttemptDto } from './dto/review-attempt.dto';
export declare class QuizzesService {
    private readonly db;
    constructor(db: NodePgDatabase<any>);
    getQuizAttempts(quizId: number, instructorId: number): Promise<{
        id: number;
        uuid: string;
        userId: number;
        userName: string;
        userEmail: string;
        attemptNumber: number;
        score: string;
        maxScore: string;
        isPassed: boolean;
        startedAt: Date;
        completedAt: Date;
    }[]>;
    getAttemptDetails(attemptId: number, instructorId: number): Promise<{
        answers: {
            id: number;
            questionId: number;
            questionText: string;
            selectedOptionId: number;
            answerText: string;
            isCorrect: boolean;
            pointsEarned: string;
            maxPoints: number;
        }[];
        id: number;
        uuid: string;
        quizId: number;
        quizTitle: string;
        userId: number;
        userName: string;
        userEmail: string;
        attemptNumber: number;
        score: string;
        maxScore: string;
        isPassed: boolean;
        startedAt: Date;
        completedAt: Date;
        courseId: number;
        courseName: string;
        instructorId: number;
    }>;
    reviewAttempt(attemptId: number, reviewDto: ReviewAttemptDto, instructorId: number): Promise<{
        message: string;
        attemptId: number;
        feedback: string;
        notes: string;
    }>;
    getAllAttempts(instructorId: number, courseId?: number): Promise<{
        id: number;
        uuid: string;
        quizId: number;
        quizTitle: string;
        userId: number;
        userName: string;
        userEmail: string;
        attemptNumber: number;
        score: string;
        maxScore: string;
        isPassed: boolean;
        completedAt: Date;
        courseId: number;
        courseName: string;
    }[]>;
}
//# sourceMappingURL=quizzes.service.d.ts.map