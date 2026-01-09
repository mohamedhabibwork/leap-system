export declare class LookupsService {
    private db;
    constructor(db: any);
    findAll(): Promise<any>;
    findByType(typeCode: string): Promise<any>;
    findOne(id: number): Promise<any>;
    create(data: any): Promise<any>;
    update(id: number, data: any): Promise<any>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=lookups.service.d.ts.map