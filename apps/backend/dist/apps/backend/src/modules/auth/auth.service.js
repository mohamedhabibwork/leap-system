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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcrypt"));
const crypto = __importStar(require("crypto"));
const database_module_1 = require("../../database/database.module");
const database_1 = require("@leap-lms/database");
const drizzle_orm_1 = require("drizzle-orm");
const email_service_1 = require("../notifications/email.service");
const rbac_service_1 = require("./rbac.service");
const keycloak_sync_service_1 = require("./keycloak-sync.service");
let AuthService = class AuthService {
    db;
    jwtService;
    configService;
    emailService;
    rbacService;
    keycloakSyncService;
    constructor(db, jwtService, configService, emailService, rbacService, keycloakSyncService) {
        this.db = db;
        this.jwtService = jwtService;
        this.configService = configService;
        this.emailService = emailService;
        this.rbacService = rbacService;
        this.keycloakSyncService = keycloakSyncService;
    }
    async validateUser(email, password) {
        const [user] = await this.db
            .select()
            .from(database_1.users)
            .where((0, drizzle_orm_1.eq)(database_1.users.email, email))
            .limit(1);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.passwordHash) {
            throw new common_1.UnauthorizedException('Password not set for this user');
        }
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const { passwordHash, ...result } = user;
        return result;
    }
    async login(loginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        const roles = await this.rbacService.getUserRoles(user.id);
        const permissions = await this.rbacService.getUserPermissions(user.id);
        const payload = {
            sub: user.id,
            userId: user.id,
            email: user.email,
            username: user.username,
            roleId: user.roleId,
            roles,
            permissions,
        };
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign(payload, {
            expiresIn: this.configService.get('jwt.refreshExpiresIn'),
        });
        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            user: {
                id: user.id,
                uuid: user.uuid,
                email: user.email,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                roleId: user.roleId,
                roles,
                permissions,
            },
        };
    }
    async register(registerDto) {
        const [existingUser] = await this.db
            .select()
            .from(database_1.users)
            .where((0, drizzle_orm_1.eq)(database_1.users.email, registerDto.email))
            .limit(1);
        if (existingUser) {
            throw new common_1.UnauthorizedException('User already exists');
        }
        const passwordHash = await bcrypt.hash(registerDto.password, 10);
        const emailVerificationToken = crypto.randomBytes(32).toString('hex');
        const [newUser] = await this.db
            .insert(database_1.users)
            .values({
            email: registerDto.email,
            username: registerDto.username || registerDto.email.split('@')[0],
            passwordHash,
            firstName: registerDto.firstName,
            lastName: registerDto.lastName,
            roleId: registerDto.roleId || 3,
            statusId: 1,
            preferredLanguage: 'en',
            isActive: true,
            isDeleted: false,
            emailVerificationToken,
        })
            .returning();
        await this.emailService.sendVerificationEmail(newUser.email, emailVerificationToken, newUser.firstName || undefined);
        await this.keycloakSyncService.syncUserToKeycloakOnCreate(newUser.id);
        const { passwordHash: _, ...userWithoutPassword } = newUser;
        return this.login({ email: registerDto.email, password: registerDto.password });
    }
    async refreshToken(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken);
            const roles = await this.rbacService.getUserRoles(payload.sub);
            const permissions = await this.rbacService.getUserPermissions(payload.sub);
            const newAccessToken = this.jwtService.sign({
                sub: payload.sub,
                userId: payload.sub,
                email: payload.email,
                username: payload.username,
                roleId: payload.roleId,
                roles,
                permissions,
            });
            return {
                access_token: newAccessToken,
            };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async getCurrentUser(userId) {
        const [user] = await this.db
            .select()
            .from(database_1.users)
            .where((0, drizzle_orm_1.eq)(database_1.users.id, userId))
            .limit(1);
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const { passwordHash, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    async forgotPassword(forgotPasswordDto) {
        const [user] = await this.db
            .select()
            .from(database_1.users)
            .where((0, drizzle_orm_1.eq)(database_1.users.email, forgotPasswordDto.email))
            .limit(1);
        if (!user) {
            return { message: 'If an account exists with this email, a password reset link has been sent.' };
        }
        const passwordResetToken = crypto.randomBytes(32).toString('hex');
        const passwordResetExpiry = new Date(Date.now() + 3600000);
        await this.db
            .update(database_1.users)
            .set({
            passwordResetToken,
            passwordResetExpiry,
        })
            .where((0, drizzle_orm_1.eq)(database_1.users.id, user.id));
        await this.emailService.sendPasswordResetEmail(user.email, passwordResetToken, user.firstName || undefined);
        return { message: 'If an account exists with this email, a password reset link has been sent.' };
    }
    async verifyResetToken(token) {
        const [user] = await this.db
            .select()
            .from(database_1.users)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.users.passwordResetToken, token)))
            .limit(1);
        if (!user || !user.passwordResetExpiry) {
            throw new common_1.BadRequestException('Invalid or expired reset token');
        }
        if (new Date() > new Date(user.passwordResetExpiry)) {
            throw new common_1.BadRequestException('Invalid or expired reset token');
        }
        return { valid: true };
    }
    async resetPassword(resetPasswordDto) {
        const [user] = await this.db
            .select()
            .from(database_1.users)
            .where((0, drizzle_orm_1.eq)(database_1.users.passwordResetToken, resetPasswordDto.token))
            .limit(1);
        if (!user || !user.passwordResetExpiry) {
            throw new common_1.BadRequestException('Invalid or expired reset token');
        }
        if (new Date() > new Date(user.passwordResetExpiry)) {
            throw new common_1.BadRequestException('Invalid or expired reset token');
        }
        const passwordHash = await bcrypt.hash(resetPasswordDto.newPassword, 10);
        await this.db
            .update(database_1.users)
            .set({
            passwordHash,
            passwordResetToken: null,
            passwordResetExpiry: null,
        })
            .where((0, drizzle_orm_1.eq)(database_1.users.id, user.id));
        return { message: 'Password reset successfully' };
    }
    async sendVerificationEmail(userId) {
        const [user] = await this.db
            .select()
            .from(database_1.users)
            .where((0, drizzle_orm_1.eq)(database_1.users.id, userId))
            .limit(1);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.emailVerifiedAt) {
            throw new common_1.BadRequestException('Email already verified');
        }
        let verificationToken = user.emailVerificationToken;
        if (!verificationToken) {
            verificationToken = crypto.randomBytes(32).toString('hex');
            await this.db
                .update(database_1.users)
                .set({ emailVerificationToken: verificationToken })
                .where((0, drizzle_orm_1.eq)(database_1.users.id, user.id));
        }
        await this.emailService.sendVerificationEmail(user.email, verificationToken, user.firstName || undefined);
        return { message: 'Verification email sent' };
    }
    async verifyEmail(verifyEmailDto) {
        const [user] = await this.db
            .select()
            .from(database_1.users)
            .where((0, drizzle_orm_1.eq)(database_1.users.emailVerificationToken, verifyEmailDto.token))
            .limit(1);
        if (!user) {
            throw new common_1.BadRequestException('Invalid verification token');
        }
        if (user.emailVerifiedAt) {
            throw new common_1.BadRequestException('Email already verified');
        }
        await this.db
            .update(database_1.users)
            .set({
            emailVerifiedAt: new Date(),
            emailVerificationToken: null,
        })
            .where((0, drizzle_orm_1.eq)(database_1.users.id, user.id));
        await this.emailService.sendWelcomeEmail(user.email, user.firstName || undefined);
        return { message: 'Email verified successfully' };
    }
    async updateUser(userId, updateData) {
        const [updatedUser] = await this.db
            .update(database_1.users)
            .set(updateData)
            .where((0, drizzle_orm_1.eq)(database_1.users.id, userId))
            .returning();
        if (!updatedUser) {
            throw new common_1.NotFoundException('User not found');
        }
        await this.keycloakSyncService.syncUserToKeycloakOnUpdate(userId);
        if (updateData.roleId) {
            await this.keycloakSyncService.syncUserRolesToKeycloak(userId);
        }
        const { passwordHash, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword;
    }
    async assignRole(userId, roleId) {
        await this.db
            .update(database_1.users)
            .set({ roleId })
            .where((0, drizzle_orm_1.eq)(database_1.users.id, userId));
        await this.keycloakSyncService.syncUserRolesToKeycloak(userId);
        return { message: 'Role assigned successfully' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DATABASE_CONNECTION)),
    __param(4, (0, common_1.Inject)((0, common_1.forwardRef)(() => rbac_service_1.RbacService))),
    __param(5, (0, common_1.Inject)((0, common_1.forwardRef)(() => keycloak_sync_service_1.KeycloakSyncService))),
    __metadata("design:paramtypes", [Object, jwt_1.JwtService,
        config_1.ConfigService,
        email_service_1.EmailService,
        rbac_service_1.RbacService,
        keycloak_sync_service_1.KeycloakSyncService])
], AuthService);
//# sourceMappingURL=auth.service.js.map