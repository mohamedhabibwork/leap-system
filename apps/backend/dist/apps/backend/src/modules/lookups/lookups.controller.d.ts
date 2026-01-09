import { LookupsService } from './lookups.service';
export declare class LookupsController {
    private readonly lookupsService;
    constructor(lookupsService: LookupsService);
    findAll(): Promise<any>;
    findByType(typeCode: string): Promise<any>;
    findOne(id: string): Promise<any>;
    create(data: any): Promise<any>;
    update(id: string, data: any): Promise<any>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=lookups.controller.d.ts.map