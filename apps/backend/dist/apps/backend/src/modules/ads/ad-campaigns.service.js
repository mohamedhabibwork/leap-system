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
exports.AdCampaignsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("@leap-lms/database");
const node_postgres_1 = require("drizzle-orm/node-postgres");
let AdCampaignsService = class AdCampaignsService {
    db;
    constructor(db) {
        this.db = db;
    }
    async create(createCampaignDto, userId) {
        const [campaign] = await this.db.insert(database_1.adCampaigns).values({
            name: createCampaignDto.name,
            description: createCampaignDto.description,
            budget: createCampaignDto.budget?.toString(),
            spentAmount: '0',
            statusId: createCampaignDto.statusId,
            startDate: new Date(createCampaignDto.startDate),
            endDate: createCampaignDto.endDate ? new Date(createCampaignDto.endDate) : null,
            createdBy: userId,
        }).returning();
        return campaign;
    }
    async findAll(userId, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const conditions = [(0, drizzle_orm_1.eq)(database_1.adCampaigns.isDeleted, false)];
        if (userId) {
            conditions.push((0, drizzle_orm_1.eq)(database_1.adCampaigns.createdBy, userId));
        }
        const results = await this.db
            .select()
            .from(database_1.adCampaigns)
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy((0, drizzle_orm_1.desc)(database_1.adCampaigns.createdAt))
            .limit(limit)
            .offset(offset);
        const [{ count }] = await this.db
            .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
            .from(database_1.adCampaigns)
            .where((0, drizzle_orm_1.and)(...conditions));
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
    async findOne(id) {
        const [campaign] = await this.db
            .select()
            .from(database_1.adCampaigns)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.adCampaigns.id, id), (0, drizzle_orm_1.eq)(database_1.adCampaigns.isDeleted, false)));
        if (!campaign) {
            throw new common_1.NotFoundException(`Campaign with ID ${id} not found`);
        }
        const campaignAds = await this.db
            .select()
            .from(database_1.ads)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.ads.campaignId, id), (0, drizzle_orm_1.eq)(database_1.ads.isDeleted, false)))
            .orderBy((0, drizzle_orm_1.desc)(database_1.ads.createdAt));
        return {
            ...campaign,
            ads: campaignAds,
        };
    }
    async update(id, updateCampaignDto, userId, isAdmin = false) {
        const campaign = await this.findOne(id);
        if (!isAdmin && campaign.createdBy !== userId) {
            throw new common_1.ForbiddenException('You can only update your own campaigns');
        }
        const updateData = { updatedAt: new Date() };
        if (updateCampaignDto.name !== undefined)
            updateData.name = updateCampaignDto.name;
        if (updateCampaignDto.description !== undefined)
            updateData.description = updateCampaignDto.description;
        if (updateCampaignDto.budget !== undefined)
            updateData.budget = updateCampaignDto.budget.toString();
        if (updateCampaignDto.statusId !== undefined)
            updateData.statusId = updateCampaignDto.statusId;
        if (updateCampaignDto.startDate !== undefined)
            updateData.startDate = new Date(updateCampaignDto.startDate);
        if (updateCampaignDto.endDate !== undefined)
            updateData.endDate = new Date(updateCampaignDto.endDate);
        const [updated] = await this.db
            .update(database_1.adCampaigns)
            .set(updateData)
            .where((0, drizzle_orm_1.eq)(database_1.adCampaigns.id, id))
            .returning();
        return updated;
    }
    async remove(id, userId, isAdmin = false) {
        const campaign = await this.findOne(id);
        if (!isAdmin && campaign.createdBy !== userId) {
            throw new common_1.ForbiddenException('You can only delete your own campaigns');
        }
        await this.db
            .update(database_1.adCampaigns)
            .set({ isDeleted: true, deletedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(database_1.adCampaigns.id, id));
        return { message: 'Campaign deleted successfully' };
    }
    async getAnalytics(id, userId, isAdmin = false) {
        const campaign = await this.findOne(id);
        if (!isAdmin && campaign.createdBy !== userId) {
            throw new common_1.ForbiddenException('You can only view analytics for your own campaigns');
        }
        const campaignAds = await this.db
            .select({
            totalImpressions: (0, drizzle_orm_1.sql) `COALESCE(SUM(${database_1.ads.impressionCount}), 0)`,
            totalClicks: (0, drizzle_orm_1.sql) `COALESCE(SUM(${database_1.ads.clickCount}), 0)`,
            adCount: (0, drizzle_orm_1.sql) `COUNT(*)`,
        })
            .from(database_1.ads)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.ads.campaignId, id), (0, drizzle_orm_1.eq)(database_1.ads.isDeleted, false)));
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
};
exports.AdCampaignsService = AdCampaignsService;
exports.AdCampaignsService = AdCampaignsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DRIZZLE_DB')),
    __metadata("design:paramtypes", [node_postgres_1.NodePgDatabase])
], AdCampaignsService);
//# sourceMappingURL=ad-campaigns.service.js.map