import { NodePgDatabase } from 'drizzle-orm/node-postgres';
interface UserProfile {
    id?: number;
    role?: string;
    subscriptionPlanId?: number;
    age?: number;
    location?: string;
    interests?: string[];
    enrolledCourses?: number[];
    lastActiveAt?: Date;
}
export declare class AdsTargetingService {
    private readonly db;
    constructor(db: NodePgDatabase<any>);
    getTargetedAds(placementCode: string, userProfile?: UserProfile, limit?: number): Promise<{
        id: number;
        uuid: string;
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
        descriptionEn: string;
        descriptionAr: string;
        statusId: number;
        startDate: Date;
        endDate: Date;
        titleEn: string;
        titleAr: string;
        createdBy: number;
        priority: number;
        campaignId: number;
        adTypeId: number;
        targetType: string;
        targetId: number;
        externalUrl: string;
        mediaUrl: string;
        callToAction: string;
        placementTypeId: number;
        isPaid: boolean;
        paymentStatusId: number;
        impressionCount: number;
        clickCount: number;
        ctr: string;
    }[]>;
    private hasNoTargeting;
    private evaluateTargeting;
    private evaluateBehavior;
    validateTargetingRules(rules: any): Promise<{
        valid: boolean;
        errors: string[];
    }>;
    getRecommendedAds(userProfile: UserProfile, limit?: number): Promise<{
        id: number;
        uuid: string;
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
        descriptionEn: string;
        descriptionAr: string;
        statusId: number;
        startDate: Date;
        endDate: Date;
        titleEn: string;
        titleAr: string;
        createdBy: number;
        priority: number;
        campaignId: number;
        adTypeId: number;
        targetType: string;
        targetId: number;
        externalUrl: string;
        mediaUrl: string;
        callToAction: string;
        placementTypeId: number;
        isPaid: boolean;
        paymentStatusId: number;
        impressionCount: number;
        clickCount: number;
        ctr: string;
    }[]>;
}
export {};
//# sourceMappingURL=ads-targeting.service.d.ts.map