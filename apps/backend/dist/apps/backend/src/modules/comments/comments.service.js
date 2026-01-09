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
exports.CommentsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("@leap-lms/database");
const node_postgres_1 = require("drizzle-orm/node-postgres");
let CommentsService = class CommentsService {
    db;
    constructor(db) {
        this.db = db;
    }
    async create(userId, createCommentDto) {
        const [comment] = await this.db.insert(database_1.comments).values({
            ...createCommentDto,
            userId: userId,
        }).returning();
        return comment;
    }
    async findByCommentable(type, id) {
        return await this.db.select().from(database_1.comments).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.comments.commentableType, type), (0, drizzle_orm_1.eq)(database_1.comments.commentableId, id), (0, drizzle_orm_1.eq)(database_1.comments.isDeleted, false)));
    }
    async findOne(id) {
        const [comment] = await this.db.select().from(database_1.comments).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.comments.id, id), (0, drizzle_orm_1.eq)(database_1.comments.isDeleted, false))).limit(1);
        if (!comment)
            throw new common_1.NotFoundException(`Comment with ID ${id} not found`);
        return comment;
    }
    async update(id, updateCommentDto) {
        await this.findOne(id);
        const [updated] = await this.db.update(database_1.comments).set({
            ...updateCommentDto,
        }).where((0, drizzle_orm_1.eq)(database_1.comments.id, id)).returning();
        return updated;
    }
    async remove(id) {
        await this.findOne(id);
        await this.db.update(database_1.comments).set({
            isDeleted: true,
        }).where((0, drizzle_orm_1.eq)(database_1.comments.id, id));
    }
};
exports.CommentsService = CommentsService;
exports.CommentsService = CommentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DRIZZLE_DB')),
    __metadata("design:paramtypes", [node_postgres_1.NodePgDatabase])
], CommentsService);
//# sourceMappingURL=comments.service.js.map