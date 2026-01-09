import { CreatePlanDto, UpdatePlanDto, CreatePlanFeatureDto } from './dto';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
export declare class PlansService {
    private readonly db;
    constructor(db: NodePgDatabase<any>);
    create(createPlanDto: CreatePlanDto): Promise<any>;
    findAll(): Promise<any[]>;
    findActive(): Promise<any[]>;
    findOne(id: number): Promise<any>;
    findBySlug(slug: string): Promise<any>;
    update(id: number, updatePlanDto: UpdatePlanDto): Promise<any>;
    remove(id: number): Promise<void>;
    addFeature(createFeatureDto: CreatePlanFeatureDto): Promise<any>;
    getFeatures(planId: number): Promise<any[]>;
}
//# sourceMappingURL=plans.service.d.ts.map