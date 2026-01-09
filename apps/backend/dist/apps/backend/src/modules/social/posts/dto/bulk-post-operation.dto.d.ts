export declare enum PostBulkAction {
    DELETE = "delete",
    HIDE = "hide",
    UNHIDE = "unhide",
    CHANGE_VISIBILITY = "change_visibility"
}
export declare class BulkPostOperationDto {
    ids: number[];
    action: PostBulkAction;
    reason?: string;
    visibilityId?: number;
}
//# sourceMappingURL=bulk-post-operation.dto.d.ts.map