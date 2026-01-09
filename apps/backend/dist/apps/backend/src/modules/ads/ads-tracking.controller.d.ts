import { AdsTrackingService } from './ads-tracking.service';
import { TrackImpressionDto, TrackClickDto, BulkTrackImpressionDto } from './dto';
import { Request } from 'express';
export declare class AdsTrackingController {
    private readonly trackingService;
    constructor(trackingService: AdsTrackingService);
    trackImpression(dto: TrackImpressionDto, req: Request): Promise<{
        success: boolean;
        message: string;
    }>;
    trackBulkImpressions(dto: BulkTrackImpressionDto, req: Request): Promise<{
        success: boolean;
        message: string;
    }>;
    trackClick(dto: TrackClickDto, req: Request): Promise<{
        success: boolean;
        clickId: number;
    }>;
    getAnalytics(adId: number, startDate?: string, endDate?: string): Promise<{
        adId: number;
        totalImpressions: number;
        totalClicks: number;
        ctr: number;
        uniqueUsers: number;
        dailyStats: {
            date: string;
            impressions: number;
        }[];
        topPlacements: {
            placementId: number;
            count: number;
        }[];
    }>;
}
//# sourceMappingURL=ads-tracking.controller.d.ts.map