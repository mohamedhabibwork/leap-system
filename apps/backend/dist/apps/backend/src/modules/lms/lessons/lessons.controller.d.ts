import { LessonsService } from './lessons.service';
import { LessonAccessCheckDto } from './dto/lesson-access.dto';
export declare class LessonsController {
    private readonly lessonsService;
    constructor(lessonsService: LessonsService);
    findOne(id: number): Promise<{
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
    checkAccess(id: number, req: any): Promise<LessonAccessCheckDto>;
    getCourseLessons(courseId: number, req: any): Promise<{
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
//# sourceMappingURL=lessons.controller.d.ts.map