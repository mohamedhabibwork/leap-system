import { AdCampaignsService } from './ad-campaigns.service';
import { CreateCampaignDto, UpdateCampaignDto } from './dto';
export declare class AdCampaignsController {
    private readonly adCampaignsService;
    constructor(adCampaignsService: AdCampaignsService);
    create(createCampaignDto: CreateCampaignDto, req: any): Promise<{
        description: string;
        id: number;
        uuid: string;
        name: string;
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
        statusId: number;
        startDate: Date;
        endDate: Date;
        createdBy: number;
        budget: string;
        spentAmount: string;
    }>;
    findAll(req: any, page?: number, limit?: number): Promise<{
        data: {
            description: string;
            id: number;
            uuid: string;
            name: string;
            isDeleted: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date;
            statusId: number;
            startDate: Date;
            endDate: Date;
            createdBy: number;
            budget: string;
            spentAmount: string;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findOne(id: number): Promise<{
        ads: {
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
        }[];
        description: string;
        id: number;
        uuid: string;
        name: string;
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
        statusId: number;
        startDate: Date;
        endDate: Date;
        createdBy: number;
        budget: string;
        spentAmount: string;
    }>;
    update(id: number, updateCampaignDto: UpdateCampaignDto, req: any): Promise<{
        id: number;
        uuid: string;
        name: string;
        description: string;
        budget: string;
        spentAmount: string;
        statusId: number;
        startDate: Date;
        endDate: Date;
        createdBy: number;
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
    }>;
    remove(id: number, req: any): Promise<{
        message: string;
    }>;
    getAnalytics(id: number, req: any): Promise<{
        campaignId: number;
        name: string;
        budget: string;
        spentAmount: string;
        adCount: number;
        totalImpressions: number;
        totalClicks: number;
        ctr: number;
    }>;
}
//# sourceMappingURL=ad-campaigns.controller.d.ts.map