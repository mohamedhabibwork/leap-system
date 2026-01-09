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
const database_module_1 = require("../../database/database.module");
const database_1 = require("@leap-lms/database");
const drizzle_orm_1 = require("drizzle-orm");
let AuthService = class AuthService {
    db;
    jwtService;
    configService;
    constructor(db, jwtService, configService) {
        this.db = db;
        this.jwtService = jwtService;
        this.configService = configService;
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
        const payload = {
            sub: user.id,
            email: user.email,
            username: user.username,
            roleId: user.roleId,
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
        })
            .returning();
        const { passwordHash: _, ...userWithoutPassword } = newUser;
        return this.login({ email: registerDto.email, password: registerDto.password });
    }
    async refreshToken(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken);
            const newAccessToken = this.jwtService.sign({
                sub: payload.sub,
                email: payload.email,
                username: payload.username,
                roleId: payload.roleId,
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DATABASE_CONNECTION)),
    __metadata("design:paramtypes", [Object, jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map