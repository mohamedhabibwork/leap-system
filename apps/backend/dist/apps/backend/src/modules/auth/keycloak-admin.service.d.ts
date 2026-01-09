import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class KeycloakAdminService implements OnModuleInit {
    private db;
    private configService;
    private readonly logger;
    private kcAdminClient;
    private isConnected;
    constructor(db: any, configService: ConfigService);
    onModuleInit(): Promise<void>;
    private initializeClient;
    private ensureConnected;
    getUserByEmail(email: string): Promise<import("@keycloak/keycloak-admin-client/lib/defs/userRepresentation").default>;
    getUserById(keycloakId: string): Promise<import("@keycloak/keycloak-admin-client/lib/defs/userRepresentation").default>;
    createUser(userData: {
        email: string;
        username: string;
        firstName?: string;
        lastName?: string;
        enabled?: boolean;
        attributes?: Record<string, string[]>;
    }): Promise<import("@keycloak/keycloak-admin-client/lib/defs/userRepresentation").default>;
    updateUser(keycloakId: string, userData: {
        email?: string;
        username?: string;
        firstName?: string;
        lastName?: string;
        enabled?: boolean;
        attributes?: Record<string, string[]>;
    }): Promise<import("@keycloak/keycloak-admin-client/lib/defs/userRepresentation").default>;
    deleteUser(keycloakId: string): Promise<void>;
    syncUserToKeycloak(userId: number): Promise<import("@keycloak/keycloak-admin-client/lib/defs/userRepresentation").default>;
    syncUserFromKeycloak(keycloakId: string): Promise<any>;
    getOrCreateRole(roleName: string, description?: string): Promise<import("@keycloak/keycloak-admin-client/lib/defs/roleRepresentation").default>;
    assignRolesToUser(keycloakUserId: string, roleNames: string[]): Promise<void>;
    removeRolesFromUser(keycloakUserId: string, roleNames: string[]): Promise<void>;
    getUserRoles(keycloakUserId: string): Promise<import("@keycloak/keycloak-admin-client/lib/defs/roleRepresentation").default[]>;
    syncRolesToKeycloak(): Promise<any>;
    syncPermissionsToKeycloak(): Promise<any>;
    syncUserRoles(userId: number): Promise<void>;
    syncAllUsersToKeycloak(batchSize?: number): Promise<{
        success: number;
        failed: number;
    }>;
}
//# sourceMappingURL=keycloak-admin.service.d.ts.map