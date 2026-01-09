import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { AdminTicketQueryDto } from './dto/admin-ticket-query.dto';
import { BulkTicketOperationDto } from './dto/bulk-operation.dto';
import { CreateTicketReplyDto } from './dto/ticket-reply.dto';
import { AssignTicketDto } from './dto/assign-ticket.dto';
export declare class TicketsController {
    private readonly ticketsService;
    constructor(ticketsService: TicketsService);
    create(createTicketDto: CreateTicketDto): Promise<{
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
    findAll(query: AdminTicketQueryDto): Promise<{
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
    getStatistics(): Promise<{
        total: number;
        open: number;
        pending: number;
        resolved: number;
        closed: number;
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
    getReplies(id: number): Promise<{
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
    addReply(id: number, dto: CreateTicketReplyDto): Promise<{
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
    assign(id: number, dto: AssignTicketDto): Promise<{
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
    update(id: number, updateTicketDto: UpdateTicketDto): Promise<{
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
    bulkOperation(dto: BulkTicketOperationDto): Promise<{
        success: boolean;
        processedCount: number;
        failedCount: number;
        errors: {
            id: number;
            error: string;
        }[];
    }>;
    export(query: AdminTicketQueryDto): Promise<{
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
//# sourceMappingURL=tickets.controller.d.ts.map