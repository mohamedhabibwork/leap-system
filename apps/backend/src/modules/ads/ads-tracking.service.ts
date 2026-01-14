import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { eq, and, sql, gte, lte, desc } from 'drizzle-orm';
import { ads, adImpressions, adClicks, adPlacements } from '@leap-lms/database';
import { TrackImpressionDto, TrackClickDto, BulkTrackImpressionDto } from './dto';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class AdsTrackingService {
  // In-memory queue for bulk insertions
  private impressionQueue: Array<{
    adId: number;
    userId?: number;
    sessionId: string;
    placementId?: number;
    ipAddress?: string;
    userAgent?: string;
    metadata?: any;
  }> = [];

  private readonly BULK_INSERT_THRESHOLD = 50;

  // Rate limiting cache (IP-based fraud prevention)
  private impressionRateLimit = new Map<string, { count: number; resetTime: number }>();
  private clickRateLimit = new Map<string, { count: number; resetTime: number }>();
  private readonly MAX_IMPRESSIONS_PER_MINUTE = 100;
  private readonly MAX_CLICKS_PER_MINUTE = 20;

  constructor(@Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<any>) {
    // Note: Periodic flush is now handled by scheduled tasks
  }

  async trackImpression(dto: TrackImpressionDto, ipAddress?: string, userAgent?: string) {
    // Fraud prevention: Check rate limit
    if (ipAddress && !this.checkImpressionRateLimit(ipAddress)) {
      throw new BadRequestException('Too many impression requests from this IP');
    }

    // Get placement ID if placement code is provided
    let placementId: number | undefined;
    if (dto.placementCode) {
      const [placement] = await this.db
        .select()
        .from(adPlacements)
        .where(eq(adPlacements.code, dto.placementCode))
        .limit(1);
      
      if (placement) {
        placementId = placement.id;
      }
    }

    // Add to queue for bulk insertion
    this.impressionQueue.push({
      adId: dto.adId,
      userId: dto.userId,
      sessionId: dto.sessionId,
      placementId,
      ipAddress,
      userAgent,
      metadata: dto.metadata,
    });

    // Flush if threshold reached
    if (this.impressionQueue.length >= this.BULK_INSERT_THRESHOLD) {
      await this.flushImpressionQueue();
    }

    return { success: true, message: 'Impression tracked' };
  }

  async trackBulkImpressions(dto: BulkTrackImpressionDto, ipAddress?: string, userAgent?: string) {
    // Fraud prevention
    if (ipAddress && !this.checkImpressionRateLimit(ipAddress, dto.impressions.length)) {
      throw new BadRequestException('Too many impression requests from this IP');
    }

    for (const impression of dto.impressions) {
      let placementId: number | undefined;
      if (impression.placementCode) {
        const [placement] = await this.db
          .select()
          .from(adPlacements)
          .where(eq(adPlacements.code, impression.placementCode))
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

    // Flush immediately for bulk operations
    await this.flushImpressionQueue();

    return { success: true, message: `${dto.impressions.length} impressions tracked` };
  }

  async trackClick(dto: TrackClickDto, ipAddress?: string, userAgent?: string) {
    // Fraud prevention: Check rate limit
    if (ipAddress && !this.checkClickRateLimit(ipAddress)) {
      throw new BadRequestException('Too many click requests from this IP');
    }

    const [click] = await this.db.insert(adClicks).values({
      adId: dto.adId,
      impressionId: dto.impressionId,
      userId: dto.userId,
      sessionId: dto.sessionId,
      referrer: dto.referrer,
      destinationUrl: dto.destinationUrl,
      metadata: dto.metadata,
    }).returning();

    // Update ad click count and CTR
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
      // Bulk insert impressions
      await this.db.insert(adImpressions).values(toInsert);

      // Update impression counts for affected ads
      const adIds = [...new Set(toInsert.map(i => i.adId))];
      for (const adId of adIds) {
        const count = toInsert.filter(i => i.adId === adId).length;
        await this.db
          .update(ads)
          .set({
            impressionCount: sql`COALESCE(${ads.impressionCount}, 0) + ${count}`,
            updatedAt: new Date(),
          } as any)
          .where(eq(ads.id, adId));
        
        // Recalculate CTR
        await this.updateAdStats(adId);
      }
    } catch (error) {
      console.error('Error flushing impression queue:', error);
      // Re-add to queue on failure
      this.impressionQueue.push(...toInsert);
    }
  }

  private async updateAdStats(adId: number) {
    const [ad] = await this.db
      .select({
        impressionCount: ads.impressionCount,
        clickCount: ads.clickCount,
      })
      .from(ads)
      .where(eq(ads.id, adId));

    if (ad && ad.impressionCount > 0) {
      const ctr = ((ad.clickCount / ad.impressionCount) * 100).toFixed(2);
      await this.db
        .update(ads)
        .set({ ctr: ctr, updatedAt: new Date() } as any)
        .where(eq(ads.id, adId));
    }
  }

  private checkImpressionRateLimit(ip: string, count: number = 1): boolean {
    const now = Date.now();
    const key = `impression:${ip}`;
    const limit = this.impressionRateLimit.get(key);

    if (!limit || limit.resetTime < now) {
      // Reset or create new limit
      this.impressionRateLimit.set(key, {
        count: count,
        resetTime: now + 60000, // 1 minute
      });
      return true;
    }

    if (limit.count + count > this.MAX_IMPRESSIONS_PER_MINUTE) {
      return false;
    }

    limit.count += count;
    return true;
  }

  private checkClickRateLimit(ip: string): boolean {
    const now = Date.now();
    const key = `click:${ip}`;
    const limit = this.clickRateLimit.get(key);

    if (!limit || limit.resetTime < now) {
      // Reset or create new limit
      this.clickRateLimit.set(key, {
        count: 1,
        resetTime: now + 60000, // 1 minute
      });
      return true;
    }

    if (limit.count >= this.MAX_CLICKS_PER_MINUTE) {
      return false;
    }

    limit.count++;
    return true;
  }

  async getAdAnalytics(adId: number, startDate?: Date, endDate?: Date) {
    const conditions = [eq(adImpressions.adId, adId)];
    
    if (startDate) {
      conditions.push(gte(adImpressions.viewedAt, startDate));
    }
    if (endDate) {
      conditions.push(lte(adImpressions.viewedAt, endDate));
    }

    // Get total impressions and clicks
    const [impressionStats] = await this.db
      .select({
        totalImpressions: sql<number>`COUNT(*)`,
        uniqueUsers: sql<number>`COUNT(DISTINCT ${adImpressions.userId})`,
      })
      .from(adImpressions)
      .where(and(...conditions));

    const clickConditions = [eq(adClicks.adId, adId)];
    if (startDate) {
      clickConditions.push(gte(adClicks.clickedAt, startDate));
    }
    if (endDate) {
      clickConditions.push(lte(adClicks.clickedAt, endDate));
    }

    const [clickStats] = await this.db
      .select({
        totalClicks: sql<number>`COUNT(*)`,
      })
      .from(adClicks)
      .where(and(...clickConditions));

    const totalImpressions = Number(impressionStats.totalImpressions);
    const totalClicks = Number(clickStats.totalClicks);
    const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';

    // Get daily stats
    const dailyStats = await this.db
      .select({
        date: sql<string>`DATE(${adImpressions.viewedAt})`,
        impressions: sql<number>`COUNT(*)`,
      })
      .from(adImpressions)
      .where(and(...conditions))
      .groupBy(sql`DATE(${adImpressions.viewedAt})`)
      .orderBy(desc(sql`DATE(${adImpressions.viewedAt})`))
      .limit(30);

    // Get top placements
    const topPlacements = await this.db
      .select({
        placementId: adImpressions.placementId,
        count: sql<number>`COUNT(*)`,
      })
      .from(adImpressions)
      .where(and(...conditions))
      .groupBy(adImpressions.placementId)
      .orderBy(desc(sql<number>`COUNT(*)`))
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

  // Note: Cleanup is now handled by scheduled tasks
  // Final flush can be called manually if needed during shutdown
}
