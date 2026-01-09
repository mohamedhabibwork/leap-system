import { CreateAuditDto } from './dto/create-audit.dto';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
export declare class AuditService {
    private readonly db;
    constructor(db: NodePgDatabase<any>);
    create(dto: CreateAuditDto): Promise<{
        description: string;
        id: number;
        uuid: string;
        createdAt: Date;
        userId: number;
        auditableType: string;
        auditableId: number;
        action: string;
        oldValues: unknown;
        newValues: unknown;
        ipAddress: string;
        userAgent: string;
    }>;
    findAll(): Promise<{
        description: string;
        id: number;
        uuid: string;
        createdAt: Date;
        userId: number;
        auditableType: string;
        auditableId: number;
        action: string;
        oldValues: unknown;
        newValues: unknown;
        ipAddress: string;
        userAgent: string;
    }[]>;
    findOne(id: number): Promise<{
        description: string;
        id: number;
        uuid: string;
        createdAt: Date;
        userId: number;
        auditableType: string;
        auditableId: number;
        action: string;
        oldValues: unknown;
        newValues: unknown;
        ipAddress: string;
        userAgent: string;
    }>;
    update(id: number, dto: any): Promise<{
        id: number;
        uuid: string;
        userId: number;
        auditableType: string;
        auditableId: number;
        action: string;
        oldValues: unknown;
        newValues: unknown;
        description: string;
        ipAddress: string;
        userAgent: string;
        createdAt: Date;
    }>;
    remove(id: number): Promise<void>;
    findByUser(userId: number): Promise<{
        description: string;
        id: number;
        uuid: string;
        createdAt: Date;
        userId: number;
        auditableType: string;
        auditableId: number;
        action: string;
        oldValues: unknown;
        newValues: unknown;
        ipAddress: string;
        userAgent: string;
    }[]>;
}
//# sourceMappingURL=audit.service.d.ts.map