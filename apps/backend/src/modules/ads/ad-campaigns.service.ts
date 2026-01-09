import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { eq, and, desc, sql } from 'drizzle-orm';
import { adCampaigns, ads } from '@leap-lms/database';
import { CreateCampaignDto, UpdateCampaignDto } from './dto';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class AdCampaignsService {
  constructor(@Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<any>) {}

  async create(createCampaignDto: CreateCampaignDto, userId: number) {
    const [campaign] = await this.db.insert(adCampaigns).values({
      name: createCampaignDto.name,
      description: createCampaignDto.description,
      budget: createCampaignDto.budget?.toString(),
      spentAmount: '0',
      statusId: createCampaignDto.statusId,
      startDate: new Date(createCampaignDto.startDate),
      endDate: createCampaignDto.endDate ? new Date(createCampaignDto.endDate) : null,
      createdBy: userId,
    } as any).returning();

    return campaign;
  }

  async findAll(userId?: number, page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;
    const conditions = [eq(adCampaigns.isDeleted, false)];

    if (userId) {
      conditions.push(eq(adCampaigns.createdBy, userId));
    }

    const results = await this.db
      .select()
      .from(adCampaigns)
      .where(and(...conditions))
      .orderBy(desc(adCampaigns.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(adCampaigns)
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
    const [campaign] = await this.db
      .select()
      .from(adCampaigns)
      .where(and(eq(adCampaigns.id, id), eq(adCampaigns.isDeleted, false)));

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }

    // Get associated ads
    const campaignAds = await this.db
      .select()
      .from(ads)
      .where(and(eq(ads.campaignId, id), eq(ads.isDeleted, false)))
      .orderBy(desc(ads.createdAt));

    return {
      ...campaign,
      ads: campaignAds,
    };
  }

  async update(id: number, updateCampaignDto: UpdateCampaignDto, userId: number, isAdmin: boolean = false) {
    const campaign = await this.findOne(id);

    // Check ownership
    if (!isAdmin && campaign.createdBy !== userId) {
      throw new ForbiddenException('You can only update your own campaigns');
    }

    const updateData: any = { updatedAt: new Date() };
    if (updateCampaignDto.name !== undefined) updateData.name = updateCampaignDto.name;
    if (updateCampaignDto.description !== undefined) updateData.description = updateCampaignDto.description;
    if (updateCampaignDto.budget !== undefined) updateData.budget = updateCampaignDto.budget.toString();
    if (updateCampaignDto.statusId !== undefined) updateData.statusId = updateCampaignDto.statusId;
    if (updateCampaignDto.startDate !== undefined) updateData.startDate = new Date(updateCampaignDto.startDate);
    if (updateCampaignDto.endDate !== undefined) updateData.endDate = new Date(updateCampaignDto.endDate);

    const [updated] = await this.db
      .update(adCampaigns)
      .set(updateData)
      .where(eq(adCampaigns.id, id))
      .returning();

    return updated;
  }

  async remove(id: number, userId: number, isAdmin: boolean = false) {
    const campaign = await this.findOne(id);

    // Check ownership
    if (!isAdmin && campaign.createdBy !== userId) {
      throw new ForbiddenException('You can only delete your own campaigns');
    }

    await this.db
      .update(adCampaigns)
      .set({ isDeleted: true, deletedAt: new Date() } as any)
      .where(eq(adCampaigns.id, id));

    return { message: 'Campaign deleted successfully' };
  }

  async getAnalytics(id: number, userId: number, isAdmin: boolean = false) {
    const campaign = await this.findOne(id);

    if (!isAdmin && campaign.createdBy !== userId) {
      throw new ForbiddenException('You can only view analytics for your own campaigns');
    }

    // Calculate aggregated stats from all ads in campaign
    const campaignAds = await this.db
      .select({
        totalImpressions: sql<number>`COALESCE(SUM(${ads.impressionCount}), 0)`,
        totalClicks: sql<number>`COALESCE(SUM(${ads.clickCount}), 0)`,
        adCount: sql<number>`COUNT(*)`,
      })
      .from(ads)
      .where(and(eq(ads.campaignId, id), eq(ads.isDeleted, false)));

    const stats = campaignAds[0];
    const ctr = stats.totalImpressions > 0 
      ? ((stats.totalClicks / stats.totalImpressions) * 100).toFixed(2)
      : '0.00';

    return {
      campaignId: campaign.id,
      name: campaign.name,
      budget: campaign.budget,
      spentAmount: campaign.spentAmount,
      adCount: Number(stats.adCount),
      totalImpressions: Number(stats.totalImpressions),
      totalClicks: Number(stats.totalClicks),
      ctr: Number(ctr),
    };
  }
}
