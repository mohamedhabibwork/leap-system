import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { AdminTicketQueryDto } from './dto/admin-ticket-query.dto';
import { BulkTicketOperationDto } from './dto/bulk-operation.dto';
import { CreateTicketReplyDto } from './dto/ticket-reply.dto';
export declare class TicketsService {
    private readonly db;
    constructor(db: NodePgDatabase<any>);
    create(dto: CreateTicketDto): Promise<{
        description: string;
        id: number;
        uuid: string;
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
        statusId: number;
        userId: number;
        categoryId: number;
        ticketNumber: string;
        priorityId: number;
        subject: string;
        assignedTo: number;
        resolvedAt: Date;
        closedAt: Date;
    }>;
    findAllAdmin(query: AdminTicketQueryDto): Promise<{
        data: {
            description: string;
            id: number;
            uuid: string;
            isDeleted: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date;
            statusId: number;
            userId: number;
            categoryId: number;
            ticketNumber: string;
            priorityId: number;
            subject: string;
            assignedTo: number;
            resolvedAt: Date;
            closedAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: number): Promise<{
        description: string;
        id: number;
        uuid: string;
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
        statusId: number;
        userId: number;
        categoryId: number;
        ticketNumber: string;
        priorityId: number;
        subject: string;
        assignedTo: number;
        resolvedAt: Date;
        closedAt: Date;
    }>;
    update(id: number, dto: UpdateTicketDto): Promise<{
        id: number;
        uuid: string;
        ticketNumber: string;
        userId: number;
        categoryId: number;
        priorityId: number;
        statusId: number;
        subject: string;
        description: string;
        assignedTo: number;
        resolvedAt: Date;
        closedAt: Date;
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
    }>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
    assignTicket(id: number, assignToId: number): Promise<{
        id: number;
        uuid: string;
        ticketNumber: string;
        userId: number;
        categoryId: number;
        priorityId: number;
        statusId: number;
        subject: string;
        description: string;
        assignedTo: number;
        resolvedAt: Date;
        closedAt: Date;
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
    }>;
    getReplies(ticketId: number): Promise<{
        id: number;
        uuid: string;
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
        userId: number;
        attachmentUrl: string;
        message: string;
        ticketId: number;
        isInternal: boolean;
    }[]>;
    addReply(ticketId: number, dto: CreateTicketReplyDto): Promise<{
        id: number;
        uuid: string;
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
        userId: number;
        attachmentUrl: string;
        message: string;
        ticketId: number;
        isInternal: boolean;
    }>;
    getStatistics(): Promise<{
        total: number;
        open: number;
        pending: number;
        resolved: number;
        closed: number;
    }>;
    bulkOperation(dto: BulkTicketOperationDto): Promise<{
        success: boolean;
        processedCount: number;
        failedCount: number;
        errors: {
            id: number;
            error: string;
        }[];
    }>;
    exportToCsv(query: AdminTicketQueryDto): Promise<{
        data: {
            description: string;
            id: number;
            uuid: string;
            isDeleted: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date;
            statusId: number;
            userId: number;
            categoryId: number;
            ticketNumber: string;
            priorityId: number;
            subject: string;
            assignedTo: number;
            resolvedAt: Date;
            closedAt: Date;
        }[];
        format: string;
    }>;
}
//# sourceMappingURL=tickets.service.d.ts.map