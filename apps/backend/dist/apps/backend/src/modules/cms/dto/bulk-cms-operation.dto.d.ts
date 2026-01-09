export declare enum CMSBulkAction {
    DELETE = "delete",
    PUBLISH = "publish",
    UNPUBLISH = "unpublish",
    CHANGE_STATUS = "change_status"
}
export declare class BulkCMSOperationDto {
    ids: number[];
    action: CMSBulkAction;
    statusId?: number;
}
//# sourceMappingURL=bulk-cms-operation.dto.d.ts.map