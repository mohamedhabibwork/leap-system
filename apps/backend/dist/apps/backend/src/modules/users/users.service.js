"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("@leap-lms/database");
const node_postgres_1 = require("drizzle-orm/node-postgres");
let UsersService = class UsersService {
    db;
    constructor(db) {
        this.db = db;
    }
    async create(createUserDto) {
        const existingUser = await this.db
            .select()
            .from(database_1.users)
            .where((0, drizzle_orm_1.eq)(database_1.users.email, createUserDto.email))
            .limit(1);
        if (existingUser.length > 0) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const [newUser] = await this.db
            .insert(database_1.users)
            .values({
            email: createUserDto.email,
            username: createUserDto.email.split('@')[0],
            passwordHash: hashedPassword,
            firstName: createUserDto.firstName || '',
            lastName: createUserDto.lastName || '',
            phone: createUserDto.phone || '',
            timezone: createUserDto.timezone || 'UTC',
        })
            .returning();
        const { passwordHash, ...userWithoutPassword } = newUser;
        return userWithoutPassword;
    }
    async findAll(page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const [data, totalCount] = await Promise.all([
            this.db
                .select({
                id: database_1.users.id,
                uuid: database_1.users.uuid,
                email: database_1.users.email,
                firstName: database_1.users.firstName,
                lastName: database_1.users.lastName,
                phone: database_1.users.phone,
                avatarUrl: database_1.users.avatarUrl,
                roleId: database_1.users.roleId,
                preferredLanguage: database_1.users.preferredLanguage,
                timezone: database_1.users.timezone,
                isActive: database_1.users.isActive,
                isOnline: database_1.users.isOnline,
                emailVerifiedAt: database_1.users.emailVerifiedAt,
                lastSeenAt: database_1.users.lastSeenAt,
                createdAt: database_1.users.createdAt,
                updatedAt: database_1.users.updatedAt,
            })
                .from(database_1.users)
                .where((0, drizzle_orm_1.eq)(database_1.users.isDeleted, false))
                .limit(limit)
                .offset(offset),
            this.db
                .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
                .from(database_1.users)
                .where((0, drizzle_orm_1.eq)(database_1.users.isDeleted, false))
                .then(result => Number(result[0].count)),
        ]);
        return { data: data, total: totalCount };
    }
    async findOne(id) {
        const [user] = await this.db
            .select({
            id: database_1.users.id,
            uuid: database_1.users.uuid,
            email: database_1.users.email,
            firstName: database_1.users.firstName,
            lastName: database_1.users.lastName,
            phone: database_1.users.phone,
            avatarUrl: database_1.users.avatarUrl,
            roleId: database_1.users.roleId,
            preferredLanguage: database_1.users.preferredLanguage,
            timezone: database_1.users.timezone,
            isActive: database_1.users.isActive,
            isOnline: database_1.users.isOnline,
            emailVerifiedAt: database_1.users.emailVerifiedAt,
            lastSeenAt: database_1.users.lastSeenAt,
            createdAt: database_1.users.createdAt,
            updatedAt: database_1.users.updatedAt,
        })
            .from(database_1.users)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.users.id, id), (0, drizzle_orm_1.eq)(database_1.users.isDeleted, false)))
            .limit(1);
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }
    async findByEmail(email) {
        const [user] = await this.db
            .select()
            .from(database_1.users)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.users.email, email), (0, drizzle_orm_1.eq)(database_1.users.isDeleted, false)))
            .limit(1);
        return user || null;
    }
    async update(id, updateUserDto) {
        const user = await this.findOne(id);
        const updateData = {
            ...updateUserDto,
            updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
        };
        if (updateUserDto.password) {
            updateData.password = await bcrypt.hash(updateUserDto.password, 10);
        }
        const [updatedUser] = await this.db
            .update(database_1.users)
            .set(updateData)
            .where((0, drizzle_orm_1.eq)(database_1.users.id, id))
            .returning();
        const { passwordHash, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword;
    }
    async updateProfile(userId, updateProfileDto) {
        const user = await this.findOne(userId);
        const [updated] = await this.db
            .update(database_1.users)
            .set({
            bio: updateProfileDto.bio,
            updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
        })
            .where((0, drizzle_orm_1.eq)(database_1.users.id, userId))
            .returning();
        return updated;
    }
    async updateOnlineStatus(id, isOnline) {
        await this.db
            .update(database_1.users)
            .set({
            isOnline: isOnline,
            lastSeenAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
            updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
        })
            .where((0, drizzle_orm_1.eq)(database_1.users.id, id));
    }
    async remove(id) {
        const user = await this.findOne(id);
        await this.db
            .update(database_1.users)
            .set({
            isDeleted: true,
            deletedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
            updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
        })
            .where((0, drizzle_orm_1.eq)(database_1.users.id, id));
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DRIZZLE_DB')),
    __metadata("design:paramtypes", [node_postgres_1.NodePgDatabase])
], UsersService);
//# sourceMappingURL=users.service.js.map