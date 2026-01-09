import { AuditService } from './audit.service';
import { CreateAuditDto } from './dto/create-audit.dto';
import { UpdateAuditDto } from './dto/update-audit.dto';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    create(createAuditDto: CreateAuditDto): Promise<{
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
    findOne(id: string): Promise<{
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
    update(id: string, updateAuditDto: UpdateAuditDto): Promise<{
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
    remove(id: string): Promise<void>;
}
//# sourceMappingURL=audit.controller.d.ts.map