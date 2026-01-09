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
exports.PostsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("@leap-lms/database");
const node_postgres_1 = require("drizzle-orm/node-postgres");
let PostsService = class PostsService {
    db;
    constructor(db) {
        this.db = db;
    }
    async create(dto) {
        const [post] = await this.db.insert(database_1.posts).values(dto).returning();
        return post;
    }
    async findAll() {
        return await this.db.select().from(database_1.posts).where((0, drizzle_orm_1.eq)(database_1.posts.isDeleted, false));
    }
    async findByUser(userId) {
        return await this.db.select().from(database_1.posts).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.posts.userId, userId), (0, drizzle_orm_1.eq)(database_1.posts.isDeleted, false)));
    }
    async findOne(id) {
        const [post] = await this.db.select().from(database_1.posts).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.posts.id, id), (0, drizzle_orm_1.eq)(database_1.posts.isDeleted, false))).limit(1);
        if (!post)
            throw new Error('Post not found');
        return post;
    }
    async update(id, dto, userId) {
        await this.findOne(id);
        const [updated] = await this.db.update(database_1.posts).set(dto).where((0, drizzle_orm_1.eq)(database_1.posts.id, id)).returning();
        return updated;
    }
    async remove(id, userId) {
        await this.db.update(database_1.posts).set({ isDeleted: true, deletedAt: new Date() }).where((0, drizzle_orm_1.eq)(database_1.posts.id, id));
    }
    async findAllAdmin(query) {
        const { page = 1, limit = 10, search, userId } = query;
        const offset = (page - 1) * limit;
        const conditions = [(0, drizzle_orm_1.eq)(database_1.posts.isDeleted, false)];
        if (search) {
            conditions.push((0, drizzle_orm_1.like)(database_1.posts.content, `%${search}%`));
        }
        if (userId) {
            conditions.push((0, drizzle_orm_1.eq)(database_1.posts.userId, userId));
        }
        const results = await this.db
            .select()
            .from(database_1.posts)
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy((0, drizzle_orm_1.desc)(database_1.posts.createdAt))
            .limit(limit)
            .offset(offset);
        const [{ count }] = await this.db
            .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
            .from(database_1.posts)
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
    async getStatistics() {
        const [stats] = await this.db
            .select({
            total: (0, drizzle_orm_1.sql) `count(*)`,
        })
            .from(database_1.posts)
            .where((0, drizzle_orm_1.eq)(database_1.posts.isDeleted, false));
        return {
            total: Number(stats.total),
        };
    }
    async toggleLike(postId, userId) {
        return { success: true, message: 'Like toggled successfully' };
    }
    async hidePost(id) {
        const [updated] = await this.db
            .update(database_1.posts)
            .set({ isHidden: true })
            .where((0, drizzle_orm_1.eq)(database_1.posts.id, id))
            .returning();
        return updated;
    }
    async unhidePost(id) {
        const [updated] = await this.db
            .update(database_1.posts)
            .set({ isHidden: false })
            .where((0, drizzle_orm_1.eq)(database_1.posts.id, id))
            .returning();
        return updated;
    }
    async bulkOperation(dto) {
        const { operation, ids } = dto;
        switch (operation) {
            case 'delete':
                await this.db
                    .update(database_1.posts)
                    .set({ isDeleted: true, deletedAt: new Date() })
                    .where((0, drizzle_orm_1.sql) `${database_1.posts.id} = ANY(${ids})`);
                return { message: `Deleted ${ids.length} posts` };
            case 'hide':
                await this.db
                    .update(database_1.posts)
                    .set({ isHidden: true })
                    .where((0, drizzle_orm_1.sql) `${database_1.posts.id} = ANY(${ids})`);
                return { message: `Hidden ${ids.length} posts` };
            case 'unhide':
                await this.db
                    .update(database_1.posts)
                    .set({ isHidden: false })
                    .where((0, drizzle_orm_1.sql) `${database_1.posts.id} = ANY(${ids})`);
                return { message: `Unhidden ${ids.length} posts` };
            default:
                throw new Error('Invalid operation');
        }
    }
    async exportToCsv(query) {
        const { search } = query;
        const conditions = [(0, drizzle_orm_1.eq)(database_1.posts.isDeleted, false)];
        if (search) {
            conditions.push((0, drizzle_orm_1.like)(database_1.posts.content, `%${search}%`));
        }
        const results = await this.db
            .select()
            .from(database_1.posts)
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy((0, drizzle_orm_1.desc)(database_1.posts.createdAt));
        const headers = ['ID', 'Content', 'User ID', 'Privacy', 'Created At'];
        const csvRows = [headers.join(',')];
        for (const post of results) {
            const row = [
                post.id,
                `"${post.content?.replace(/"/g, '""') || ''}"`,
                post.userId,
                'public',
                post.createdAt?.toISOString() || '',
            ];
            csvRows.push(row.join(','));
        }
        return csvRows.join('\n');
    }
};
exports.PostsService = PostsService;
exports.PostsService = PostsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DRIZZLE_DB')),
    __metadata("design:paramtypes", [node_postgres_1.NodePgDatabase])
], PostsService);
//# sourceMappingURL=posts.service.js.map