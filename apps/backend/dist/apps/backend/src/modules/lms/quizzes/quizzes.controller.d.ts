import { QuizzesService } from './quizzes.service';
import { ReviewAttemptDto } from './dto/review-attempt.dto';
export declare class QuizzesController {
    private readonly quizzesService;
    constructor(quizzesService: QuizzesService);
    getQuizAttempts(id: number, req: any): Promise<{
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
    getAttemptDetails(id: number, req: any): Promise<{
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
    reviewAttempt(id: number, reviewDto: ReviewAttemptDto, req: any): Promise<{
        message: string;
        attemptId: number;
        feedback: string;
        notes: string;
    }>;
    getAllAttempts(req: any, courseId?: string): Promise<{
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
//# sourceMappingURL=quizzes.controller.d.ts.map