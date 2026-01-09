export declare class LookupTypesService {
    private db;
    constructor(db: any);
    findAll(): Promise<any>;
    findOne(id: number): Promise<any>;
    findByCode(code: string): Promise<any>;
    create(data: any): Promise<any>;
    update(id: number, data: any): Promise<any>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=lookup-types.service.d.ts.map