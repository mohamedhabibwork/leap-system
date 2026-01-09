import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto, BulkSyncUsersDto, SyncRolesDto } from './dto';
import { KeycloakSyncService } from './keycloak-sync.service';
export declare class AuthController {
    private readonly authService;
    private readonly keycloakSyncService;
    constructor(authService: AuthService, keycloakSyncService: KeycloakSyncService);
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
    refresh(body: RefreshTokenDto): Promise<{
        access_token: string;
    }>;
    getProfile(userId: number): Promise<any>;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    verifyResetToken(token: string): Promise<{
        valid: boolean;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    sendVerification(userId: number): Promise<{
        message: string;
    }>;
    verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<{
        message: string;
    }>;
    syncUserToKeycloak(userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    syncAllUsersToKeycloak(bulkSyncDto?: BulkSyncUsersDto): Promise<{
        success: number;
        failed: number;
        message: string;
    }>;
    syncRolesToKeycloak(syncRolesDto?: SyncRolesDto): Promise<{
        roles: any;
        permissions: any;
    }>;
    getSyncStatus(userId: string): Promise<{
        synced: boolean;
        keycloakUserId?: string;
        message: string;
    }>;
    getSyncConfig(): Promise<{
        enabled: boolean;
        syncOnCreate: boolean;
        syncOnUpdate: boolean;
    }>;
    assignRole(userId: string, body: {
        roleId: number;
    }): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=auth.controller.d.ts.map