export declare enum ReportBulkAction {
    DELETE = "delete",
    RESOLVE = "resolve",
    DISMISS = "dismiss",
    CHANGE_STATUS = "change_status"
}
export declare class BulkReportOperationDto {
    ids: number[];
    action: ReportBulkAction;
    adminNotes?: string;
    statusId?: number;
}
//# sourceMappingURL=bulk-report-operation.dto.d.ts.map