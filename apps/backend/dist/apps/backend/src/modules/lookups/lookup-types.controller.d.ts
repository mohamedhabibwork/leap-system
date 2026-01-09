import { LookupTypesService } from './lookup-types.service';
export declare class LookupTypesController {
    private readonly lookupTypesService;
    constructor(lookupTypesService: LookupTypesService);
    findAll(): Promise<any>;
    findOne(id: string): Promise<any>;
    findByCode(code: string): Promise<any>;
    create(data: any): Promise<any>;
    update(id: string, data: any): Promise<any>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=lookup-types.controller.d.ts.map