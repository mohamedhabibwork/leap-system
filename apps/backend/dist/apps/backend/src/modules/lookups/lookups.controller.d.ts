import { LookupsService } from './lookups.service';
import { AdminLookupQueryDto } from './dto/admin-lookup-query.dto';
import { BulkLookupOperationDto } from './dto/bulk-lookup-operation.dto';
import { ReorderLookupsDto } from './dto/reorder-lookups.dto';
export declare class LookupsController {
    private readonly lookupsService;
    constructor(lookupsService: LookupsService);
    findAll(query: AdminLookupQueryDto): Promise<{
        data: any;
        pagination: {
            page: any;
            limit: any;
            total: number;
            totalPages: number;
        };
    }>;
    findByType(typeCode: string, query: AdminLookupQueryDto): Promise<any>;
    getStatistics(): Promise<{
        total: number;
        active: number;
        inactive: number;
    }>;
    findOne(id: number): Promise<any>;
    create(data: any): Promise<any>;
    update(id: number, data: any): Promise<any>;
    remove(id: number): Promise<{
        message: string;
    }>;
    reorder(dto: ReorderLookupsDto): Promise<{
        message: string;
    }>;
    bulkOperation(dto: BulkLookupOperationDto): Promise<{
        message: string;
    }>;
    export(query: AdminLookupQueryDto): Promise<string>;
}
//# sourceMappingURL=lookups.controller.d.ts.map