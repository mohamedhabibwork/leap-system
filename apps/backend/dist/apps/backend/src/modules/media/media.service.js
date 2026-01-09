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
exports.MediaService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("@leap-lms/database");
const node_postgres_1 = require("drizzle-orm/node-postgres");
let MediaService = class MediaService {
    db;
    constructor(db) {
        this.db = db;
    }
    async create(createMediaDto) {
        const [media] = await this.db
            .insert(database_1.mediaLibrary)
            .values({
            ...createMediaDto,
        })
            .returning();
        return media;
    }
    async findAll() {
        return await this.db
            .select()
            .from(database_1.mediaLibrary)
            .where((0, drizzle_orm_1.eq)(database_1.mediaLibrary.isDeleted, false));
    }
    async findOne(id) {
        const [media] = await this.db
            .select()
            .from(database_1.mediaLibrary)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.mediaLibrary.id, id), (0, drizzle_orm_1.eq)(database_1.mediaLibrary.isDeleted, false)))
            .limit(1);
        if (!media) {
            throw new common_1.NotFoundException(`Media with ID ${id} not found`);
        }
        return media;
    }
    async findByUploadable(uploadableType, uploadableId) {
        return await this.db
            .select()
            .from(database_1.mediaLibrary)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.mediaLibrary.mediableType, uploadableType), (0, drizzle_orm_1.eq)(database_1.mediaLibrary.mediableId, uploadableId), (0, drizzle_orm_1.eq)(database_1.mediaLibrary.isDeleted, false)));
    }
    async update(id, updateMediaDto) {
        await this.findOne(id);
        const [updatedMedia] = await this.db
            .update(database_1.mediaLibrary)
            .set({
            ...updateMediaDto,
        })
            .where((0, drizzle_orm_1.eq)(database_1.mediaLibrary.id, id))
            .returning();
        return updatedMedia;
    }
    async incrementDownloadCount(id) {
        await this.db
            .update(database_1.mediaLibrary)
            .set({
            downloadCount: (0, drizzle_orm_1.sql) `${database_1.mediaLibrary.downloadCount} + 1`,
        })
            .where((0, drizzle_orm_1.eq)(database_1.mediaLibrary.id, id));
    }
    async remove(id) {
        await this.findOne(id);
        await this.db
            .update(database_1.mediaLibrary)
            .set({
            isDeleted: true,
        })
            .where((0, drizzle_orm_1.eq)(database_1.mediaLibrary.id, id));
    }
    async cleanupTemporaryFiles() {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const result = await this.db
            .update(database_1.mediaLibrary)
            .set({
            isDeleted: true,
        })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.mediaLibrary.isTemporary, true), (0, drizzle_orm_1.lt)(database_1.mediaLibrary.createdAt, twentyFourHoursAgo), (0, drizzle_orm_1.eq)(database_1.mediaLibrary.isDeleted, false)))
            .returning();
        return result.length;
    }
    detectMediaType(fileType) {
        if (fileType.startsWith('image/'))
            return 'image';
        if (fileType.startsWith('video/'))
            return 'video';
        if (fileType.startsWith('audio/'))
            return 'audio';
        if (fileType.includes('pdf') || fileType.includes('document'))
            return 'document';
        return 'other';
    }
};
exports.MediaService = MediaService;
exports.MediaService = MediaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DRIZZLE_DB')),
    __metadata("design:paramtypes", [node_postgres_1.NodePgDatabase])
], MediaService);
//# sourceMappingURL=media.service.js.map