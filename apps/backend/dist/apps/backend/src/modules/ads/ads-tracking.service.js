"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdsTrackingService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("@leap-lms/database");
const node_postgres_1 = require("drizzle-orm/node-postgres");
let AdsTrackingService = class AdsTrackingService {
    db;
    impressionQueue = [];
    BULK_INSERT_THRESHOLD = 50;
    BULK_INSERT_INTERVAL = 30000;
    flushTimer;
    impressionRateLimit = new Map();
    clickRateLimit = new Map();
    MAX_IMPRESSIONS_PER_MINUTE = 100;
    MAX_CLICKS_PER_MINUTE = 20;
    constructor(db) {
        this.db = db;
        this.flushTimer = setInterval(() => {
            this.flushImpressionQueue();
        }, this.BULK_INSERT_INTERVAL);
    }
    async trackImpression(dto, ipAddress, userAgent) {
        if (ipAddress && !this.checkImpressionRateLimit(ipAddress)) {
            throw new common_1.BadRequestException('Too many impression requests from this IP');
        }
        let placementId;
        if (dto.placementCode) {
            const [placement] = await this.db
                .select()
                .from(database_1.adPlacements)
                .where((0, drizzle_orm_1.eq)(database_1.adPlacements.code, dto.placementCode))
                .limit(1);
            if (placement) {
                placementId = placement.id;
            }
        }
        this.impressionQueue.push({
            adId: dto.adId,
            userId: dto.userId,
            sessionId: dto.sessionId,
            placementId,
            ipAddress,
            userAgent,
            metadata: dto.metadata,
        });
        if (this.impressionQueue.length >= this.BULK_INSERT_THRESHOLD) {
            await this.flushImpressionQueue();
        }
        return { success: true, message: 'Impression tracked' };
    }
    async trackBulkImpressions(dto, ipAddress, userAgent) {
        if (ipAddress && !this.checkImpressionRateLimit(ipAddress, dto.impressions.length)) {
            throw new common_1.BadRequestException('Too many impression requests from this IP');
        }
        for (const impression of dto.impressions) {
            let placementId;
            if (impression.placementCode) {
                const [placement] = await this.db
                    .select()
                    .from(database_1.adPlacements)
                    .where((0, drizzle_orm_1.eq)(database_1.adPlacements.code, impression.placementCode))
                    .limit(1);
                if (placement) {
                    placementId = placement.id;
                }
            }
            this.impressionQueue.push({
                adId: impression.adId,
                userId: impression.userId,
                sessionId: impression.sessionId,
                placementId,
                ipAddress,
                userAgent,
                metadata: impression.metadata,
            });
        }
        await this.flushImpressionQueue();
        return { success: true, message: `${dto.impressions.length} impressions tracked` };
    }
    async trackClick(dto, ipAddress, userAgent) {
        if (ipAddress && !this.checkClickRateLimit(ipAddress)) {
            throw new common_1.BadRequestException('Too many click requests from this IP');
        }
        const [click] = await this.db.insert(database_1.adClicks).values({
            adId: dto.adId,
            impressionId: dto.impressionId,
            userId: dto.userId,
            sessionId: dto.sessionId,
            referrer: dto.referrer,
            destinationUrl: dto.destinationUrl,
            metadata: dto.metadata,
        }).returning();
        await this.updateAdStats(dto.adId);
        return { success: true, clickId: click.id };
    }
    async flushImpressionQueue() {
        if (this.impressionQueue.length === 0) {
            return;
        }
        const toInsert = [...this.impressionQueue];
        this.impressionQueue = [];
        try {
            await this.db.insert(database_1.adImpressions).values(toInsert);
            const adIds = [...new Set(toInsert.map(i => i.adId))];
            for (const adId of adIds) {
                const count = toInsert.filter(i => i.adId === adId).length;
                await this.db
                    .update(database_1.ads)
                    .set({
                    impressionCount: (0, drizzle_orm_1.sql) `COALESCE(${database_1.ads.impressionCount}, 0) + ${count}`,
                    updatedAt: new Date(),
                })
                    .where((0, drizzle_orm_1.eq)(database_1.ads.id, adId));
                await this.updateAdStats(adId);
            }
        }
        catch (error) {
            console.error('Error flushing impression queue:', error);
            this.impressionQueue.push(...toInsert);
        }
    }
    async updateAdStats(adId) {
        const [ad] = await this.db
            .select({
            impressionCount: database_1.ads.impressionCount,
            clickCount: database_1.ads.clickCount,
        })
            .from(database_1.ads)
            .where((0, drizzle_orm_1.eq)(database_1.ads.id, adId));
        if (ad && ad.impressionCount > 0) {
            const ctr = ((ad.clickCount / ad.impressionCount) * 100).toFixed(2);
            await this.db
                .update(database_1.ads)
                .set({ ctr: ctr, updatedAt: new Date() })
                .where((0, drizzle_orm_1.eq)(database_1.ads.id, adId));
        }
    }
    checkImpressionRateLimit(ip, count = 1) {
        const now = Date.now();
        const key = `impression:${ip}`;
        const limit = this.impressionRateLimit.get(key);
        if (!limit || limit.resetTime < now) {
            this.impressionRateLimit.set(key, {
                count: count,
                resetTime: now + 60000,
            });
            return true;
        }
        if (limit.count + count > this.MAX_IMPRESSIONS_PER_MINUTE) {
            return false;
        }
        limit.count += count;
        return true;
    }
    checkClickRateLimit(ip) {
        const now = Date.now();
        const key = `click:${ip}`;
        const limit = this.clickRateLimit.get(key);
        if (!limit || limit.resetTime < now) {
            this.clickRateLimit.set(key, {
                count: 1,
                resetTime: now + 60000,
            });
            return true;
        }
        if (limit.count >= this.MAX_CLICKS_PER_MINUTE) {
            return false;
        }
        limit.count++;
        return true;
    }
    async getAdAnalytics(adId, startDate, endDate) {
        const conditions = [(0, drizzle_orm_1.eq)(database_1.adImpressions.adId, adId)];
        if (startDate) {
            conditions.push((0, drizzle_orm_1.gte)(database_1.adImpressions.viewedAt, startDate));
        }
        if (endDate) {
            conditions.push((0, drizzle_orm_1.lte)(database_1.adImpressions.viewedAt, endDate));
        }
        const [impressionStats] = await this.db
            .select({
            totalImpressions: (0, drizzle_orm_1.sql) `COUNT(*)`,
            uniqueUsers: (0, drizzle_orm_1.sql) `COUNT(DISTINCT ${database_1.adImpressions.userId})`,
        })
            .from(database_1.adImpressions)
            .where((0, drizzle_orm_1.and)(...conditions));
        const clickConditions = [(0, drizzle_orm_1.eq)(database_1.adClicks.adId, adId)];
        if (startDate) {
            clickConditions.push((0, drizzle_orm_1.gte)(database_1.adClicks.clickedAt, startDate));
        }
        if (endDate) {
            clickConditions.push((0, drizzle_orm_1.lte)(database_1.adClicks.clickedAt, endDate));
        }
        const [clickStats] = await this.db
            .select({
            totalClicks: (0, drizzle_orm_1.sql) `COUNT(*)`,
        })
            .from(database_1.adClicks)
            .where((0, drizzle_orm_1.and)(...clickConditions));
        const totalImpressions = Number(impressionStats.totalImpressions);
        const totalClicks = Number(clickStats.totalClicks);
        const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';
        const dailyStats = await this.db
            .select({
            date: (0, drizzle_orm_1.sql) `DATE(${database_1.adImpressions.viewedAt})`,
            impressions: (0, drizzle_orm_1.sql) `COUNT(*)`,
        })
            .from(database_1.adImpressions)
            .where((0, drizzle_orm_1.and)(...conditions))
            .groupBy((0, drizzle_orm_1.sql) `DATE(${database_1.adImpressions.viewedAt})`)
            .orderBy((0, drizzle_orm_1.desc)((0, drizzle_orm_1.sql) `DATE(${database_1.adImpressions.viewedAt})`))
            .limit(30);
        const topPlacements = await this.db
            .select({
            placementId: database_1.adImpressions.placementId,
            count: (0, drizzle_orm_1.sql) `COUNT(*)`,
        })
            .from(database_1.adImpressions)
            .where((0, drizzle_orm_1.and)(...conditions))
            .groupBy(database_1.adImpressions.placementId)
            .orderBy((0, drizzle_orm_1.desc)((0, drizzle_orm_1.sql) `COUNT(*)`))
            .limit(10);
        return {
            adId,
            totalImpressions,
            totalClicks,
            ctr: Number(ctr),
            uniqueUsers: Number(impressionStats.uniqueUsers),
            dailyStats: dailyStats.map(d => ({
                date: d.date,
                impressions: Number(d.impressions),
            })),
            topPlacements: topPlacements.map(p => ({
                placementId: p.placementId,
                count: Number(p.count),
            })),
        };
    }
    onModuleDestroy() {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
        }
        this.flushImpressionQueue();
    }
};
exports.AdsTrackingService = AdsTrackingService;
exports.AdsTrackingService = AdsTrackingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DRIZZLE_DB')),
    __metadata("design:paramtypes", [node_postgres_1.NodePgDatabase])
], AdsTrackingService);
//# sourceMappingURL=ads-tracking.service.js.map