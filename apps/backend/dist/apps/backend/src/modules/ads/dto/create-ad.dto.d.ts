export declare class CreateAdDto {
    campaignId?: number;
    adTypeId: number;
    targetType?: string;
    targetId?: number;
    externalUrl?: string;
    titleEn: string;
    titleAr?: string;
    descriptionEn?: string;
    descriptionAr?: string;
    mediaUrl?: string;
    callToAction?: string;
    placementTypeId: number;
    priority?: number;
    startDate: string;
    endDate?: string;
    isPaid?: boolean;
    targetingRules?: {
        targetUserRoles?: string[];
        targetSubscriptionPlans?: number[];
        targetAgeRange?: {
            min: number;
            max: number;
        };
        targetLocations?: string[];
        targetInterests?: string[];
        targetBehavior?: Record<string, any>;
    };
}
//# sourceMappingURL=create-ad.dto.d.ts.map