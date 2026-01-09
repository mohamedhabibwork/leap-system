export declare enum JobBulkAction {
    DELETE = "delete",
    FEATURE = "feature",
    UNFEATURE = "unfeature",
    CLOSE = "close",
    CHANGE_STATUS = "change_status"
}
export declare class BulkJobOperationDto {
    ids: number[];
    action: JobBulkAction;
    statusId?: number;
}
//# sourceMappingURL=bulk-job-operation.dto.d.ts.map