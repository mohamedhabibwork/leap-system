import { NodePgDatabase } from 'drizzle-orm/node-postgres';
export declare class RbacService {
    private readonly db;
    private readonly logger;
    constructor(db: NodePgDatabase<any>);
    getUserRoles(userId: number): Promise<string[]>;
    getUserPermissions(userId: number): Promise<string[]>;
    hasRole(userId: number, roleName: string): Promise<boolean>;
    hasAnyRole(userId: number, roleNames: string[]): Promise<boolean>;
    hasAllRoles(userId: number, roleNames: string[]): Promise<boolean>;
    hasPermission(userId: number, permissionName: string): Promise<boolean>;
    hasAnyPermission(userId: number, permissionNames: string[]): Promise<boolean>;
    hasAllPermissions(userId: number, permissionNames: string[]): Promise<boolean>;
    assignRole(userId: number, roleId: number, assignedBy?: number): Promise<void>;
    revokeRole(userId: number, roleId: number): Promise<void>;
    assignPermissionToRole(roleId: number, permissionId: number): Promise<void>;
    revokePermissionFromRole(roleId: number, permissionId: number): Promise<void>;
}
//# sourceMappingURL=rbac.service.d.ts.map