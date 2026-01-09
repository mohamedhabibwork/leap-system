export declare enum LookupBulkAction {
    DELETE = "delete",
    ACTIVATE = "activate",
    DEACTIVATE = "deactivate"
}
export declare class BulkLookupOperationDto {
    ids: number[];
    action: LookupBulkAction;
}
//# sourceMappingURL=bulk-lookup-operation.dto.d.ts.map