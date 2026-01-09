export declare enum ReportAction {
    WARNING = "warning",
    SUSPEND = "suspend",
    BAN = "ban",
    DELETE_CONTENT = "delete_content",
    DISMISS = "dismiss"
}
export declare class ReviewReportDto {
    action: ReportAction;
    adminNotes?: string;
    reason?: string;
}
//# sourceMappingURL=review-report.dto.d.ts.map