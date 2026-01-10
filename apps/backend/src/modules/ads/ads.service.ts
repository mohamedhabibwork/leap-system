import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Inject } from '@nestjs/common';
import { eq, and, desc, gte, lte, sql } from 'drizzle-orm';
import { ads, adCampaigns, adTargetingRules } from '@leap-lms/database';
import { CreateAdDto, UpdateAdDto, AdQueryDto } from './dto';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class AdsService {
  constructor(@Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<any>) {}

  async create(createAdDto: CreateAdDto, userId: number) {
    // Validate target
    if (createAdDto.targetType !== 'external' && !createAdDto.targetId) {
      throw new BadRequestException('Target ID is required for non-external ads');
    }
    if (createAdDto.targetType === 'external' && !createAdDto.externalUrl) {
      throw new BadRequestException('External URL is required for external ads');
    }

    // Get default status ID for 'draft' or 'pending_review' based on business logic
    // For now, we'll assume statusId is passed in the DTO
    const statusId = createAdDto.isPaid ? 2 : 1; // 1=draft, 2=pending_review (example)

    const [ad] = await this.db.insert(ads).values({
      campaignId: createAdDto.campaignId,
      adTypeId: createAdDto.adTypeId,
      targetType: createAdDto.targetType,
      targetId: createAdDto.targetId,
      externalUrl: createAdDto.externalUrl,
      titleEn: createAdDto.titleEn,
      titleAr: createAdDto.titleAr,
      descriptionEn: createAdDto.descriptionEn,
      descriptionAr: createAdDto.descriptionAr,
      mediaUrl: createAdDto.mediaUrl,
      callToAction: createAdDto.callToAction,
      placementTypeId: createAdDto.placementTypeId,
      statusId: statusId,
      priority: createAdDto.priority || 0,
      startDate: new Date(createAdDto.startDate),
      endDate: createAdDto.endDate ? new Date(createAdDto.endDate) : null,
      isPaid: createAdDto.isPaid || false,
      createdBy: userId,
    } as any).returning();

    // Create targeting rules if provided
    if (createAdDto.targetingRules) {
      await this.db.insert(adTargetingRules).values({
        adId: ad.id,
        targetUserRoles: createAdDto.targetingRules.targetUserRoles,
        targetSubscriptionPlans: createAdDto.targetingRules.targetSubscriptionPlans,
        targetAgeRange: createAdDto.targetingRules.targetAgeRange,
        targetLocations: createAdDto.targetingRules.targetLocations,
        targetInterests: createAdDto.targetingRules.targetInterests,
        targetBehavior: createAdDto.targetingRules.targetBehavior,
      });
    }

    return ad;
  }

  async findAll(query: AdQueryDto, userId?: number) {
    const { page = 1, limit = 10, statusId, adTypeId, placementCode, campaignId } = query;
    const offset = (page - 1) * limit;

    const conditions = [eq(ads.isDeleted, false)];

    if (userId) {
      conditions.push(eq(ads.createdBy, userId));
    }
    if (statusId) {
      conditions.push(eq(ads.statusId, statusId));
    }
    if (adTypeId) {
      conditions.push(eq(ads.adTypeId, adTypeId));
    }
    if (campaignId) {
      conditions.push(eq(ads.campaignId, campaignId));
    }

    const results = await this.db
      .select()
      .from(ads)
      .where(and(...conditions))
      .orderBy(desc(ads.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(ads)
      .where(and(...conditions));

    return {
      data: results,
      pagination: {
        page,
        limit,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limit),
      },
    };
  }

  async findOne(id: number) {
    const [ad] = await this.db
      .select()
      .from(ads)
      .where(and(eq(ads.id, id), eq(ads.isDeleted, false)));

    if (!ad) {
      throw new NotFoundException(`Ad with ID ${id} not found`);
    }

    // Get targeting rules
    const [targeting] = await this.db
      .select()
      .from(adTargetingRules)
      .where(and(eq(adTargetingRules.adId, id), eq(adTargetingRules.isDeleted, false)));

    return {
      ...ad,
      targetingRules: targeting || null,
    };
  }

  async update(id: number, updateAdDto: UpdateAdDto, userId: number, isAdmin: boolean = false) {
    const ad = await this.findOne(id);

    // Check ownership
    if (!isAdmin && ad.createdBy !== userId) {
      throw new ForbiddenException('You can only update your own ads');
    }

    const updateData: any = {};
    if (updateAdDto.campaignId !== undefined) updateData.campaignId = updateAdDto.campaignId;
    if (updateAdDto.adTypeId !== undefined) updateData.adTypeId = updateAdDto.adTypeId;
    if (updateAdDto.targetType !== undefined) updateData.targetType = updateAdDto.targetType;
    if (updateAdDto.targetId !== undefined) updateData.targetId = updateAdDto.targetId;
    if (updateAdDto.externalUrl !== undefined) updateData.externalUrl = updateAdDto.externalUrl;
    if (updateAdDto.titleEn !== undefined) updateData.titleEn = updateAdDto.titleEn;
    if (updateAdDto.titleAr !== undefined) updateData.titleAr = updateAdDto.titleAr;
    if (updateAdDto.descriptionEn !== undefined) updateData.descriptionEn = updateAdDto.descriptionEn;
    if (updateAdDto.descriptionAr !== undefined) updateData.descriptionAr = updateAdDto.descriptionAr;
    if (updateAdDto.mediaUrl !== undefined) updateData.mediaUrl = updateAdDto.mediaUrl;
    if (updateAdDto.callToAction !== undefined) updateData.callToAction = updateAdDto.callToAction;
    if (updateAdDto.placementTypeId !== undefined) updateData.placementTypeId = updateAdDto.placementTypeId;
    if (updateAdDto.priority !== undefined) updateData.priority = updateAdDto.priority;
    if (updateAdDto.startDate !== undefined) updateData.startDate = new Date(updateAdDto.startDate);
    if (updateAdDto.endDate !== undefined) updateData.endDate = new Date(updateAdDto.endDate);
    if (updateAdDto.isPaid !== undefined) updateData.isPaid = updateAdDto.isPaid;

    updateData.updatedAt = new Date();

    const [updated] = await this.db
      .update(ads)
      .set(updateData)
      .where(eq(ads.id, id))
      .returning();

    // Update targeting rules if provided
    if (updateAdDto.targetingRules) {
      await this.db
        .delete(adTargetingRules)
        .where(eq(adTargetingRules.adId, id));

      await this.db.insert(adTargetingRules).values({
        adId: id,
        targetUserRoles: updateAdDto.targetingRules.targetUserRoles,
        targetSubscriptionPlans: updateAdDto.targetingRules.targetSubscriptionPlans,
        targetAgeRange: updateAdDto.targetingRules.targetAgeRange,
        targetLocations: updateAdDto.targetingRules.targetLocations,
        targetInterests: updateAdDto.targetingRules.targetInterests,
        targetBehavior: updateAdDto.targetingRules.targetBehavior,
      });
    }

    return updated;
  }

  async remove(id: number, userId: number, isAdmin: boolean = false) {
    const ad = await this.findOne(id);

    // Check ownership
    if (!isAdmin && ad.createdBy !== userId) {
      throw new ForbiddenException('You can only delete your own ads');
    }

    await this.db
      .update(ads)
      .set({ isDeleted: true, deletedAt: new Date() } as any)
      .where(eq(ads.id, id));

    return { message: 'Ad deleted successfully' };
  }

  async pause(id: number, userId: number, isAdmin: boolean = false) {
    const ad = await this.findOne(id);

    if (!isAdmin && ad.createdBy !== userId) {
      throw new ForbiddenException('You can only pause your own ads');
    }

    // Assuming statusId 4 = 'paused'
    const [updated] = await this.db
      .update(ads)
      .set({ statusId: 4, updatedAt: new Date() } as any)
      .where(eq(ads.id, id))
      .returning();

    return updated;
  }

  async resume(id: number, userId: number, isAdmin: boolean = false) {
    const ad = await this.findOne(id);

    if (!isAdmin && ad.createdBy !== userId) {
      throw new ForbiddenException('You can only resume your own ads');
    }

    // Assuming statusId 3 = 'active'
    const [updated] = await this.db
      .update(ads)
      .set({ statusId: 3, updatedAt: new Date() } as any)
      .where(eq(ads.id, id))
      .returning();

    return updated;
  }

  async getAnalytics(id: number, userId: number, isAdmin: boolean = false) {
    const ad = await this.findOne(id);

    if (!isAdmin && ad.createdBy !== userId) {
      throw new ForbiddenException('You can only view analytics for your own ads');
    }

    // Analytics will be enhanced by tracking service
    return {
      adId: ad.id,
      impressions: ad.impressionCount,
      clicks: ad.clickCount,
      ctr: ad.ctr,
      // Additional analytics will be added by tracking service
    };
  }

  async getActiveAds(placementCode?: string, limit: number = 3) {
    const now = new Date();
    const conditions = [
      eq(ads.isDeleted, false),
      eq(ads.statusId, 3), // 3 = active status
      lte(ads.startDate, now),
    ];

    // Add endDate check (either no end date or end date is in future)
    conditions.push(
      sql`(${ads.endDate} IS NULL OR ${ads.endDate} >= ${now})`
    );

    // Note: Placement filtering is handled by AdsTargetingService
    // This method is used as a fallback when no placement code is provided

    const results = await this.db
      .select()
      .from(ads)
      .where(and(...conditions))
      .orderBy(desc(ads.priority), desc(ads.createdAt))
      .limit(limit);

    return results;
  }

  // Admin methods
  async findAllAdmin(query: AdQueryDto) {
    const { page = 1, limit = 10, statusId, adTypeId, placementCode, campaignId } = query;
    const offset = (page - 1) * limit;

    const conditions = [eq(ads.isDeleted, false)];

    if (statusId) {
      conditions.push(eq(ads.statusId, statusId));
    }
    if (adTypeId) {
      conditions.push(eq(ads.adTypeId, adTypeId));
    }
    if (campaignId) {
      conditions.push(eq(ads.campaignId, campaignId));
    }

    const results = await this.db
      .select()
      .from(ads)
      .where(and(...conditions))
      .orderBy(desc(ads.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(ads)
      .where(and(...conditions));

    return {
      data: results,
      pagination: {
        page,
        limit,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limit),
      },
    };
  }

  async getPendingAds(query: AdQueryDto) {
    const { page = 1, limit = 10 } = query;
    const offset = (page - 1) * limit;

    // Assuming statusId 2 = 'pending_review'
    const conditions = [
      eq(ads.isDeleted, false),
      eq(ads.statusId, 2),
    ];

    const results = await this.db
      .select()
      .from(ads)
      .where(and(...conditions))
      .orderBy(desc(ads.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(ads)
      .where(and(...conditions));

    return {
      data: results,
      pagination: {
        page,
        limit,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limit),
      },
    };
  }

  async getStatistics() {
    // Get pending ads count
    const [{ pendingCount }] = await this.db
      .select({ pendingCount: sql<number>`count(*)` })
      .from(ads)
      .where(and(eq(ads.isDeleted, false), eq(ads.statusId, 2)));

    // Get active ads count
    const [{ activeCount }] = await this.db
      .select({ activeCount: sql<number>`count(*)` })
      .from(ads)
      .where(and(eq(ads.isDeleted, false), eq(ads.statusId, 3)));

    // Get total impressions and clicks
    const [adStats] = await this.db
      .select({
        totalImpressions: sql<number>`COALESCE(SUM(${ads.impressionCount}), 0)`,
        totalClicks: sql<number>`COALESCE(SUM(${ads.clickCount}), 0)`,
      })
      .from(ads)
      .where(eq(ads.isDeleted, false));

    // Calculate average CTR
    const avgCtr = adStats.totalImpressions > 0 
      ? (adStats.totalClicks / adStats.totalImpressions) * 100 
      : 0;

    // Calculate total revenue (assuming paid ads have a price field)
    // This is a placeholder - adjust based on your actual payment model
    const totalRevenue = 0; // TODO: Implement based on payment tracking

    return {
      pendingCount: Number(pendingCount),
      activeCount: Number(activeCount),
      totalImpressions: Number(adStats.totalImpressions),
      totalClicks: Number(adStats.totalClicks),
      avgCtr: Number(avgCtr.toFixed(2)),
      totalRevenue,
    };
  }

  async approveAd(id: number, adminId: number) {
    const ad = await this.findOne(id);

    if (ad.statusId !== 2) {
      throw new BadRequestException('Only pending ads can be approved');
    }

    // Assuming statusId 3 = 'active'
    const [updated] = await this.db
      .update(ads)
      .set({ 
        statusId: 3, 
        updatedAt: new Date(),
        approvedBy: adminId,
        approvedAt: new Date(),
      } as any)
      .where(eq(ads.id, id))
      .returning();

    return updated;
  }

  async rejectAd(id: number, adminId: number, reason?: string) {
    const ad = await this.findOne(id);

    if (ad.statusId !== 2) {
      throw new BadRequestException('Only pending ads can be rejected');
    }

    // Assuming statusId 5 = 'rejected'
    const [updated] = await this.db
      .update(ads)
      .set({ 
        statusId: 5, 
        updatedAt: new Date(),
        rejectionReason: reason,
        rejectedBy: adminId,
        rejectedAt: new Date(),
      } as any)
      .where(eq(ads.id, id))
      .returning();

    return updated;
  }
}
