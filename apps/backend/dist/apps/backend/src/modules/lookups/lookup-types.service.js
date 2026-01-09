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
exports.LookupTypesService = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../../database/database.module");
const database_1 = require("@leap-lms/database");
const drizzle_orm_1 = require("drizzle-orm");
let LookupTypesService = class LookupTypesService {
    db;
    constructor(db) {
        this.db = db;
    }
    async findAll() {
        return this.db
            .select()
            .from(database_1.lookupTypes)
            .where((0, drizzle_orm_1.eq)(database_1.lookupTypes.isDeleted, false))
            .orderBy(database_1.lookupTypes.sortOrder);
    }
    async findOne(id) {
        const [type] = await this.db
            .select()
            .from(database_1.lookupTypes)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.lookupTypes.id, id), (0, drizzle_orm_1.eq)(database_1.lookupTypes.isDeleted, false)))
            .limit(1);
        if (!type) {
            throw new common_1.NotFoundException(`Lookup type with ID ${id} not found`);
        }
        return type;
    }
    async findByCode(code) {
        const [type] = await this.db
            .select()
            .from(database_1.lookupTypes)
            .where((0, drizzle_orm_1.eq)(database_1.lookupTypes.code, code))
            .limit(1);
        if (!type) {
            throw new common_1.NotFoundException(`Lookup type ${code} not found`);
        }
        return type;
    }
    async create(data) {
        const [type] = await this.db
            .insert(database_1.lookupTypes)
            .values({
            ...data,
            isActive: data.isActive ?? true,
            isDeleted: false,
        })
            .returning();
        return type;
    }
    async update(id, data) {
        const [updated] = await this.db
            .update(database_1.lookupTypes)
            .set({
            ...data,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(database_1.lookupTypes.id, id))
            .returning();
        if (!updated) {
            throw new common_1.NotFoundException(`Lookup type with ID ${id} not found`);
        }
        return updated;
    }
    async remove(id) {
        const [deleted] = await this.db
            .update(database_1.lookupTypes)
            .set({
            isDeleted: true,
            deletedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(database_1.lookupTypes.id, id))
            .returning();
        if (!deleted) {
            throw new common_1.NotFoundException(`Lookup type with ID ${id} not found`);
        }
        return { message: 'Lookup type deleted successfully' };
    }
};
exports.LookupTypesService = LookupTypesService;
exports.LookupTypesService = LookupTypesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DATABASE_CONNECTION)),
    __metadata("design:paramtypes", [Object])
], LookupTypesService);
//# sourceMappingURL=lookup-types.service.js.map