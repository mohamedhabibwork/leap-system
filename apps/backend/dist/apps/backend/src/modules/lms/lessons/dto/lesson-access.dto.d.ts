export declare class LessonAccessCheckDto {
    lessonId: number;
    canAccess: boolean;
    reason: 'admin' | 'instructor' | 'enrolled' | 'preview' | 'denied';
    enrollment?: {
        id: number;
        enrollmentType: string;
        expiresAt?: Date;
        daysRemaining?: number;
        isExpired: boolean;
    };
}
//# sourceMappingURL=lesson-access.dto.d.ts.map