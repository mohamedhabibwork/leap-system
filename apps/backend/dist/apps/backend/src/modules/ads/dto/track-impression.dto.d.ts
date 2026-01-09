export declare class TrackImpressionDto {
    adId: number;
    placementCode?: string;
    userId?: number;
    sessionId: string;
    metadata?: Record<string, any>;
}
export declare class BulkTrackImpressionDto {
    impressions: TrackImpressionDto[];
}
//# sourceMappingURL=track-impression.dto.d.ts.map