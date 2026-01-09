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
exports.LookupsService = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../../database/database.module");
const database_1 = require("@leap-lms/database");
const drizzle_orm_1 = require("drizzle-orm");
let LookupsService = class LookupsService {
    db;
    constructor(db) {
        this.db = db;
    }
    async findAll() {
        return this.db
            .select()
            .from(database_1.lookups)
            .where((0, drizzle_orm_1.eq)(database_1.lookups.isDeleted, false))
            .orderBy(database_1.lookups.displayOrder, database_1.lookups.sortOrder);
    }
    async findByType(typeCode) {
        const [type] = await this.db
            .select()
            .from(database_1.lookupTypes)
            .where((0, drizzle_orm_1.eq)(database_1.lookupTypes.code, typeCode))
            .limit(1);
        if (!type) {
            throw new common_1.NotFoundException(`Lookup type ${typeCode} not found`);
        }
        return this.db
            .select()
            .from(database_1.lookups)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.lookups.lookupTypeId, type.id), (0, drizzle_orm_1.eq)(database_1.lookups.isDeleted, false), (0, drizzle_orm_1.eq)(database_1.lookups.isActive, true)))
            .orderBy(database_1.lookups.displayOrder, database_1.lookups.sortOrder);
    }
    async findOne(id) {
        const [lookup] = await this.db
            .select()
            .from(database_1.lookups)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.lookups.id, id), (0, drizzle_orm_1.eq)(database_1.lookups.isDeleted, false)))
            .limit(1);
        if (!lookup) {
            throw new common_1.NotFoundException(`Lookup with ID ${id} not found`);
        }
        return lookup;
    }
    async create(data) {
        const [lookup] = await this.db
            .insert(database_1.lookups)
            .values({
            ...data,
            isActive: data.isActive ?? true,
            isDeleted: false,
        })
            .returning();
        return lookup;
    }
    async update(id, data) {
        const [updated] = await this.db
            .update(database_1.lookups)
            .set({
            ...data,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(database_1.lookups.id, id))
            .returning();
        if (!updated) {
            throw new common_1.NotFoundException(`Lookup with ID ${id} not found`);
        }
        return updated;
    }
    async remove(id) {
        const [deleted] = await this.db
            .update(database_1.lookups)
            .set({
            isDeleted: true,
            deletedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(database_1.lookups.id, id))
            .returning();
        if (!deleted) {
            throw new common_1.NotFoundException(`Lookup with ID ${id} not found`);
        }
        return { message: 'Lookup deleted successfully' };
    }
};
exports.LookupsService = LookupsService;
exports.LookupsService = LookupsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DATABASE_CONNECTION)),
    __metadata("design:paramtypes", [Object])
], LookupsService);
//# sourceMappingURL=lookups.service.js.map