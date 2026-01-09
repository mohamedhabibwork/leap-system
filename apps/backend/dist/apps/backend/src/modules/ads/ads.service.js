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
exports.AdsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("@leap-lms/database");
const node_postgres_1 = require("drizzle-orm/node-postgres");
let AdsService = class AdsService {
    db;
    constructor(db) {
        this.db = db;
    }
    async create(createAdDto, userId) {
        if (createAdDto.targetType !== 'external' && !createAdDto.targetId) {
            throw new common_1.BadRequestException('Target ID is required for non-external ads');
        }
        if (createAdDto.targetType === 'external' && !createAdDto.externalUrl) {
            throw new common_1.BadRequestException('External URL is required for external ads');
        }
        const statusId = createAdDto.isPaid ? 2 : 1;
        const [ad] = await this.db.insert(database_1.ads).values({
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
        }).returning();
        if (createAdDto.targetingRules) {
            await this.db.insert(database_1.adTargetingRules).values({
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
    async findAll(query, userId) {
        const { page = 1, limit = 10, statusId, adTypeId, placementCode, campaignId } = query;
        const offset = (page - 1) * limit;
        const conditions = [(0, drizzle_orm_1.eq)(database_1.ads.isDeleted, false)];
        if (userId) {
            conditions.push((0, drizzle_orm_1.eq)(database_1.ads.createdBy, userId));
        }
        if (statusId) {
            conditions.push((0, drizzle_orm_1.eq)(database_1.ads.statusId, statusId));
        }
        if (adTypeId) {
            conditions.push((0, drizzle_orm_1.eq)(database_1.ads.adTypeId, adTypeId));
        }
        if (campaignId) {
            conditions.push((0, drizzle_orm_1.eq)(database_1.ads.campaignId, campaignId));
        }
        const results = await this.db
            .select()
            .from(database_1.ads)
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy((0, drizzle_orm_1.desc)(database_1.ads.createdAt))
            .limit(limit)
            .offset(offset);
        const [{ count }] = await this.db
            .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
            .from(database_1.ads)
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
        const [ad] = await this.db
            .select()
            .from(database_1.ads)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.ads.id, id), (0, drizzle_orm_1.eq)(database_1.ads.isDeleted, false)));
        if (!ad) {
            throw new common_1.NotFoundException(`Ad with ID ${id} not found`);
        }
        const [targeting] = await this.db
            .select()
            .from(database_1.adTargetingRules)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.adTargetingRules.adId, id), (0, drizzle_orm_1.eq)(database_1.adTargetingRules.isDeleted, false)));
        return {
            ...ad,
            targetingRules: targeting || null,
        };
    }
    async update(id, updateAdDto, userId, isAdmin = false) {
        const ad = await this.findOne(id);
        if (!isAdmin && ad.createdBy !== userId) {
            throw new common_1.ForbiddenException('You can only update your own ads');
        }
        const updateData = {};
        if (updateAdDto.campaignId !== undefined)
            updateData.campaignId = updateAdDto.campaignId;
        if (updateAdDto.adTypeId !== undefined)
            updateData.adTypeId = updateAdDto.adTypeId;
        if (updateAdDto.targetType !== undefined)
            updateData.targetType = updateAdDto.targetType;
        if (updateAdDto.targetId !== undefined)
            updateData.targetId = updateAdDto.targetId;
        if (updateAdDto.externalUrl !== undefined)
            updateData.externalUrl = updateAdDto.externalUrl;
        if (updateAdDto.titleEn !== undefined)
            updateData.titleEn = updateAdDto.titleEn;
        if (updateAdDto.titleAr !== undefined)
            updateData.titleAr = updateAdDto.titleAr;
        if (updateAdDto.descriptionEn !== undefined)
            updateData.descriptionEn = updateAdDto.descriptionEn;
        if (updateAdDto.descriptionAr !== undefined)
            updateData.descriptionAr = updateAdDto.descriptionAr;
        if (updateAdDto.mediaUrl !== undefined)
            updateData.mediaUrl = updateAdDto.mediaUrl;
        if (updateAdDto.callToAction !== undefined)
            updateData.callToAction = updateAdDto.callToAction;
        if (updateAdDto.placementTypeId !== undefined)
            updateData.placementTypeId = updateAdDto.placementTypeId;
        if (updateAdDto.priority !== undefined)
            updateData.priority = updateAdDto.priority;
        if (updateAdDto.startDate !== undefined)
            updateData.startDate = new Date(updateAdDto.startDate);
        if (updateAdDto.endDate !== undefined)
            updateData.endDate = new Date(updateAdDto.endDate);
        if (updateAdDto.isPaid !== undefined)
            updateData.isPaid = updateAdDto.isPaid;
        updateData.updatedAt = new Date();
        const [updated] = await this.db
            .update(database_1.ads)
            .set(updateData)
            .where((0, drizzle_orm_1.eq)(database_1.ads.id, id))
            .returning();
        if (updateAdDto.targetingRules) {
            await this.db
                .delete(database_1.adTargetingRules)
                .where((0, drizzle_orm_1.eq)(database_1.adTargetingRules.adId, id));
            await this.db.insert(database_1.adTargetingRules).values({
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
    async remove(id, userId, isAdmin = false) {
        const ad = await this.findOne(id);
        if (!isAdmin && ad.createdBy !== userId) {
            throw new common_1.ForbiddenException('You can only delete your own ads');
        }
        await this.db
            .update(database_1.ads)
            .set({ isDeleted: true, deletedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(database_1.ads.id, id));
        return { message: 'Ad deleted successfully' };
    }
    async pause(id, userId, isAdmin = false) {
        const ad = await this.findOne(id);
        if (!isAdmin && ad.createdBy !== userId) {
            throw new common_1.ForbiddenException('You can only pause your own ads');
        }
        const [updated] = await this.db
            .update(database_1.ads)
            .set({ statusId: 4, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(database_1.ads.id, id))
            .returning();
        return updated;
    }
    async resume(id, userId, isAdmin = false) {
        const ad = await this.findOne(id);
        if (!isAdmin && ad.createdBy !== userId) {
            throw new common_1.ForbiddenException('You can only resume your own ads');
        }
        const [updated] = await this.db
            .update(database_1.ads)
            .set({ statusId: 3, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(database_1.ads.id, id))
            .returning();
        return updated;
    }
    async getAnalytics(id, userId, isAdmin = false) {
        const ad = await this.findOne(id);
        if (!isAdmin && ad.createdBy !== userId) {
            throw new common_1.ForbiddenException('You can only view analytics for your own ads');
        }
        return {
            adId: ad.id,
            impressions: ad.impressionCount,
            clicks: ad.clickCount,
            ctr: ad.ctr,
        };
    }
    async getActiveAds(placementCode, limit = 3) {
        const now = new Date();
        const conditions = [
            (0, drizzle_orm_1.eq)(database_1.ads.isDeleted, false),
            (0, drizzle_orm_1.eq)(database_1.ads.statusId, 3),
            (0, drizzle_orm_1.lte)(database_1.ads.startDate, now),
        ];
        conditions.push((0, drizzle_orm_1.sql) `(${database_1.ads.endDate} IS NULL OR ${database_1.ads.endDate} >= ${now})`);
        const results = await this.db
            .select()
            .from(database_1.ads)
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy((0, drizzle_orm_1.desc)(database_1.ads.priority), (0, drizzle_orm_1.desc)(database_1.ads.createdAt))
            .limit(limit);
        return results;
    }
};
exports.AdsService = AdsService;
exports.AdsService = AdsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DRIZZLE_DB')),
    __metadata("design:paramtypes", [node_postgres_1.NodePgDatabase])
], AdsService);
//# sourceMappingURL=ads.service.js.map