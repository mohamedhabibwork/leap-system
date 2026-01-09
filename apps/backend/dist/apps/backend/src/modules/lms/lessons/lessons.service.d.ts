import { NodePgDatabase } from 'drizzle-orm/node-postgres';
export declare class LessonsService {
    private readonly db;
    constructor(db: NodePgDatabase<any>);
    findOne(lessonId: number): Promise<{
        id: number;
        uuid: string;
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
        descriptionEn: string;
        descriptionAr: string;
        displayOrder: number;
        titleEn: string;
        titleAr: string;
        videoUrl: string;
        sectionId: number;
        contentTypeId: number;
        contentEn: string;
        contentAr: string;
        attachmentUrl: string;
        durationMinutes: number;
        isPreview: boolean;
    }>;
    checkLessonAccess(lessonId: number, userId: number, userRole: string): Promise<{
        canAccess: boolean;
        reason: 'admin' | 'instructor' | 'enrolled' | 'preview' | 'denied';
        enrollment?: any;
    }>;
    getCourseLessons(courseId: number, userId?: number, userRole?: string): Promise<{
        canAccess: boolean;
        accessReason: string;
        id: number;
        uuid: string;
        sectionId: number;
        titleEn: string;
        titleAr: string;
        descriptionEn: string;
        descriptionAr: string;
        videoUrl: string;
        attachmentUrl: string;
        durationMinutes: number;
        displayOrder: number;
        isPreview: boolean;
        createdAt: Date;
    }[]>;
}
//# sourceMappingURL=lessons.service.d.ts.map