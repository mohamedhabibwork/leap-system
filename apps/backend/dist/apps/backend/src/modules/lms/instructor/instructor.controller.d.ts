import { InstructorService } from './instructor.service';
export declare class InstructorController {
    private readonly instructorService;
    constructor(instructorService: InstructorService);
    getDashboard(req: any): Promise<{
        totalCourses: number;
        totalStudents: number;
        totalRevenue: number;
        averageRating: number;
        pendingAssignments: number;
        upcomingSessions: {
            id: number;
            uuid: string;
            titleEn: string;
            titleAr: string;
            startTime: Date;
            endTime: Date;
            meetingUrl: string;
            attendanceCount: number;
        }[];
        recentActivity: any[];
    }>;
    getCourses(req: any): Promise<{
        enrollmentCount: number;
        averageRating: number;
        id: number;
        uuid: string;
        titleEn: string;
        titleAr: string;
        slug: string;
        thumbnailUrl: string;
        price: string;
        isFeatured: boolean;
        viewCount: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getCourseStudents(req: any, courseId: number): Promise<{
        completedLessons: number;
        totalLessons: number;
        userId: number;
        userName: string;
        userEmail: string;
        enrollmentId: number;
        progressPercentage: string;
        enrolledAt: Date;
        lastAccessedAt: Date;
    }[]>;
    getCourseAnalytics(req: any, courseId: number): Promise<{
        courseId: number;
        enrollmentTrend: {
            month: unknown;
            count: number;
        }[];
        completionRate: number;
        averageQuizScores: any[];
        studentEngagement: {
            active: number;
            inactive: number;
        };
        revenueTrend: any[];
        ratingDistribution: {
            rating: number;
            count: number;
        }[];
    }>;
    getUpcomingSessions(req: any): Promise<{
        id: number;
        uuid: string;
        titleEn: string;
        titleAr: string;
        startTime: Date;
        endTime: Date;
        meetingUrl: string;
        attendanceCount: number;
        lessonId: number;
        lessonTitle: string;
        courseId: number;
        courseName: string;
    }[]>;
    getCalendarSessions(req: any, startDate?: string, endDate?: string): Promise<{
        id: number;
        uuid: string;
        titleEn: string;
        titleAr: string;
        startTime: Date;
        endTime: Date;
        timezone: string;
        meetingUrl: string;
        attendanceCount: number;
        maxAttendees: number;
        lessonId: number;
        lessonTitle: string;
        courseId: number;
        courseName: string;
    }[]>;
    getPendingAssignments(req: any): Promise<{
        id: number;
        uuid: string;
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
        statusId: number;
        userId: number;
        fileUrl: string;
        maxPoints: string;
        assignmentId: number;
        submissionText: string;
        score: string;
        feedback: string;
        submittedAt: Date;
        gradedAt: Date;
        gradedBy: number;
    }[]>;
    getQuizAttempts(req: any): Promise<{
        id: number;
        uuid: string;
        isDeleted: boolean;
        createdAt: Date;
        deletedAt: Date;
        userId: number;
        quizId: number;
        completedAt: Date;
        score: string;
        attemptNumber: number;
        maxScore: string;
        isPassed: boolean;
        startedAt: Date;
    }[]>;
}
//# sourceMappingURL=instructor.controller.d.ts.map