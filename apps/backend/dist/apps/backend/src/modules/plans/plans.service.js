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
exports.PlansService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("@leap-lms/database");
const node_postgres_1 = require("drizzle-orm/node-postgres");
let PlansService = class PlansService {
    db;
    constructor(db) {
        this.db = db;
    }
    async create(createPlanDto) {
        const [newPlan] = await this.db
            .insert(database_1.plans)
            .values(createPlanDto)
            .returning();
        return newPlan;
    }
    async findAll() {
        return await this.db
            .select()
            .from(database_1.plans)
            .where((0, drizzle_orm_1.eq)(database_1.plans.isDeleted, false))
            .orderBy(database_1.plans.displayOrder);
    }
    async findActive() {
        return await this.db
            .select()
            .from(database_1.plans)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.plans.isDeleted, false), (0, drizzle_orm_1.eq)(database_1.plans.isActive, true)))
            .orderBy(database_1.plans.displayOrder);
    }
    async findOne(id) {
        const [plan] = await this.db
            .select()
            .from(database_1.plans)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.plans.id, id), (0, drizzle_orm_1.eq)(database_1.plans.isDeleted, false)))
            .limit(1);
        if (!plan) {
            throw new common_1.NotFoundException(`Plan with ID ${id} not found`);
        }
        return plan;
    }
    async findBySlug(slug) {
        throw new common_1.NotFoundException('Plans do not have slugs in this schema');
    }
    async update(id, updatePlanDto) {
        await this.findOne(id);
        const [updatedPlan] = await this.db
            .update(database_1.plans)
            .set(updatePlanDto)
            .where((0, drizzle_orm_1.eq)(database_1.plans.id, id))
            .returning();
        return updatedPlan;
    }
    async remove(id) {
        await this.findOne(id);
        await this.db
            .update(database_1.plans)
            .set({
            isDeleted: true,
        })
            .where((0, drizzle_orm_1.eq)(database_1.plans.id, id));
    }
    async addFeature(createFeatureDto) {
        const [feature] = await this.db
            .insert(database_1.planFeatures)
            .values(createFeatureDto)
            .returning();
        return feature;
    }
    async getFeatures(planId) {
        await this.findOne(planId);
        return await this.db
            .select()
            .from(database_1.planFeatures)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.planFeatures.planId, planId), (0, drizzle_orm_1.eq)(database_1.planFeatures.isDeleted, false)));
    }
};
exports.PlansService = PlansService;
exports.PlansService = PlansService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DRIZZLE_DB')),
    __metadata("design:paramtypes", [node_postgres_1.NodePgDatabase])
], PlansService);
//# sourceMappingURL=plans.service.js.map