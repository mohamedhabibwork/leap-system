import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDto, RegisterDto, ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto } from './dto';
import { EmailService } from '../notifications/email.service';
import { RbacService } from './rbac.service';
import { KeycloakSyncService } from './keycloak-sync.service';
export declare class AuthService {
    private db;
    private jwtService;
    private configService;
    private emailService;
    private rbacService;
    private keycloakSyncService;
    constructor(db: any, jwtService: JwtService, configService: ConfigService, emailService: EmailService, rbacService: RbacService, keycloakSyncService: KeycloakSyncService);
    validateUser(email: string, password: string): Promise<any>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: any;
            uuid: any;
            email: any;
            username: any;
            firstName: any;
            lastName: any;
            roleId: any;
            roles: string[];
            permissions: string[];
        };
    }>;
    register(registerDto: RegisterDto): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: any;
            uuid: any;
            email: any;
            username: any;
            firstName: any;
            lastName: any;
            roleId: any;
            roles: string[];
            permissions: string[];
        };
    }>;
    refreshToken(refreshToken: string): Promise<{
        access_token: string;
    }>;
    getCurrentUser(userId: number): Promise<any>;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    verifyResetToken(token: string): Promise<{
        valid: boolean;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    sendVerificationEmail(userId: number): Promise<{
        message: string;
    }>;
    verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<{
        message: string;
    }>;
    updateUser(userId: number, updateData: Partial<{
        firstName: string;
        lastName: string;
        phone: string;
        avatarUrl: string;
        preferredLanguage: string;
        timezone: string;
        roleId: number;
        statusId: number;
        isActive: boolean;
    }>): Promise<any>;
    assignRole(userId: number, roleId: number): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=auth.service.d.ts.map