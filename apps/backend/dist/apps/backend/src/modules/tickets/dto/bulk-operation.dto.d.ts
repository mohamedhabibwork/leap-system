export declare enum TicketBulkAction {
    DELETE = "delete",
    CLOSE = "close",
    ASSIGN = "assign",
    CHANGE_STATUS = "change_status",
    CHANGE_PRIORITY = "change_priority"
}
export declare class BulkTicketOperationDto {
    ids: number[];
    action: TicketBulkAction;
    reason?: string;
    assignToId?: number;
    statusId?: number;
    priorityId?: number;
}
//# sourceMappingURL=bulk-operation.dto.d.ts.map