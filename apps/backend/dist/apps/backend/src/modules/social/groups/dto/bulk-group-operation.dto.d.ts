export declare enum GroupBulkAction {
    DELETE = "delete",
    APPROVE = "approve",
    REJECT = "reject",
    FEATURE = "feature",
    UNFEATURE = "unfeature"
}
export declare class BulkGroupOperationDto {
    ids: number[];
    action: GroupBulkAction;
}
//# sourceMappingURL=bulk-group-operation.dto.d.ts.map