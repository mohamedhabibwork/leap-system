import { ConfigService } from '@nestjs/config';
import { KeycloakAdminService } from './keycloak-admin.service';
export declare class KeycloakSyncService {
    private keycloakAdminService;
    private configService;
    private readonly logger;
    private syncEnabled;
    private syncOnCreate;
    private syncOnUpdate;
    constructor(keycloakAdminService: KeycloakAdminService, configService: ConfigService);
    private isSyncEnabled;
    syncUserToKeycloakOnCreate(userId: number): Promise<void>;
    syncUserToKeycloakOnUpdate(userId: number): Promise<void>;
    syncUserRolesToKeycloak(userId: number): Promise<void>;
    deleteUserFromKeycloak(keycloakUserId: string): Promise<void>;
    manualSyncUser(userId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    manualSyncAllUsers(): Promise<{
        success: number;
        failed: number;
        message: string;
    }>;
    syncRolesToKeycloak(): Promise<{
        success: boolean;
        count?: number;
        message: string;
    }>;
    syncPermissionsToKeycloak(): Promise<{
        success: boolean;
        count?: number;
        message: string;
    }>;
    getUserSyncStatus(userId: number): Promise<{
        synced: boolean;
        keycloakUserId?: string;
        message: string;
    }>;
    enableSync(): void;
    disableSync(): void;
    getSyncConfig(): {
        enabled: boolean;
        syncOnCreate: boolean;
        syncOnUpdate: boolean;
    };
}
//# sourceMappingURL=keycloak-sync.service.d.ts.map