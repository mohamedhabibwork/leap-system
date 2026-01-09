export declare enum EventBulkAction {
    DELETE = "delete",
    FEATURE = "feature",
    UNFEATURE = "unfeature",
    CANCEL = "cancel",
    CHANGE_STATUS = "change_status"
}
export declare class BulkEventOperationDto {
    ids: number[];
    action: EventBulkAction;
    statusId?: number;
}
//# sourceMappingURL=bulk-event-operation.dto.d.ts.map