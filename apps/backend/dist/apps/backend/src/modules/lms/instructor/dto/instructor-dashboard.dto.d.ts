export declare class InstructorDashboardDto {
    totalCourses: number;
    totalStudents: number;
    totalRevenue: number;
    averageRating: number;
    pendingAssignments: number;
    upcomingSessions: any[];
    recentActivity: any[];
}
export declare class CourseStatsDto {
    courseId: number;
    courseName: string;
    enrollmentCount: number;
    completionRate: number;
    averageRating: number;
    revenue: number;
    activeStudents: number;
}
export declare class StudentProgressDto {
    userId: number;
    userName: string;
    userEmail: string;
    courseId: number;
    progressPercentage: number;
    completedLessons: number;
    totalLessons: number;
    lastAccessedAt: Date;
    enrolledAt: Date;
}
export declare class CourseAnalyticsDto {
    courseId: number;
    enrollmentTrend: any[];
    completionRate: number;
    averageQuizScores: any[];
    studentEngagement: {
        active: number;
        inactive: number;
    };
    revenueTrend: any[];
    ratingDistribution: any[];
}
//# sourceMappingURL=instructor-dashboard.dto.d.ts.map