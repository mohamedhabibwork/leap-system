export declare class LookupsService {
    private db;
    constructor(db: any);
    findAll(): Promise<any>;
    findByType(typeCode: string, query?: any): Promise<any>;
    findOne(id: number): Promise<any>;
    create(data: any): Promise<any>;
    update(id: number, data: any): Promise<any>;
    remove(id: number): Promise<{
        message: string;
    }>;
    findAllAdmin(query: any): Promise<{
        data: any;
        pagination: {
            page: any;
            limit: any;
            total: number;
            totalPages: number;
        };
    }>;
    getStatistics(): Promise<{
        total: number;
        active: number;
        inactive: number;
    }>;
    reorder(dto: any): Promise<{
        message: string;
    }>;
    bulkOperation(dto: any): Promise<{
        message: string;
    }>;
    exportToCsv(query: any): Promise<string>;
}
//# sourceMappingURL=lookups.service.d.ts.map