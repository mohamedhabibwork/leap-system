export declare class SyncUserToKeycloakDto {
    userId: number;
}
export declare class SyncRolesDto {
    syncRoles?: boolean;
    syncPermissions?: boolean;
}
export declare class BulkSyncUsersDto {
    userIds?: number[];
    batchSize?: number;
}
export declare class SyncConfigDto {
    enabled?: boolean;
    syncOnCreate?: boolean;
    syncOnUpdate?: boolean;
}
//# sourceMappingURL=sync-keycloak.dto.d.ts.map