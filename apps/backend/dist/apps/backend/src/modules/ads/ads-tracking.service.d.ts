import { TrackImpressionDto, TrackClickDto, BulkTrackImpressionDto } from './dto';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
export declare class AdsTrackingService {
    private readonly db;
    private impressionQueue;
    private readonly BULK_INSERT_THRESHOLD;
    private readonly BULK_INSERT_INTERVAL;
    private flushTimer;
    private impressionRateLimit;
    private clickRateLimit;
    private readonly MAX_IMPRESSIONS_PER_MINUTE;
    private readonly MAX_CLICKS_PER_MINUTE;
    constructor(db: NodePgDatabase<any>);
    trackImpression(dto: TrackImpressionDto, ipAddress?: string, userAgent?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    trackBulkImpressions(dto: BulkTrackImpressionDto, ipAddress?: string, userAgent?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    trackClick(dto: TrackClickDto, ipAddress?: string, userAgent?: string): Promise<{
        success: boolean;
        clickId: number;
    }>;
    private flushImpressionQueue;
    private updateAdStats;
    private checkImpressionRateLimit;
    private checkClickRateLimit;
    getAdAnalytics(adId: number, startDate?: Date, endDate?: Date): Promise<{
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
    onModuleDestroy(): void;
}
//# sourceMappingURL=ads-tracking.service.d.ts.map