export declare enum PageBulkAction {
    DELETE = "delete",
    VERIFY = "verify",
    UNVERIFY = "unverify",
    FEATURE = "feature",
    UNFEATURE = "unfeature"
}
export declare class BulkPageOperationDto {
    ids: number[];
    action: PageBulkAction;
}
//# sourceMappingURL=bulk-page-operation.dto.d.ts.map