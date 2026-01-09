import { NodePgDatabase } from 'drizzle-orm/node-postgres';
export declare class InstructorService {
    private readonly db;
    constructor(db: NodePgDatabase<any>);
    getDashboard(instructorId: number): Promise<{
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
    getInstructorCourses(instructorId: number): Promise<{
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
    getCourseStudents(instructorId: number, courseId: number): Promise<{
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
    getCourseAnalytics(instructorId: number, courseId: number): Promise<{
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
    getUpcomingSessions(instructorId: number): Promise<{
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
    getCalendarSessions(instructorId: number, startDate?: Date, endDate?: Date): Promise<{
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
    getPendingAssignments(instructorId: number): Promise<{
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
    getQuizAttempts(instructorId: number): Promise<{
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
//# sourceMappingURL=instructor.service.d.ts.map