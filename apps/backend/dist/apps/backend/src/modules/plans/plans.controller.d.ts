import { PlansService } from './plans.service';
import { CreatePlanDto, UpdatePlanDto, CreatePlanFeatureDto } from './dto';
export declare class PlansController {
    private readonly plansService;
    constructor(plansService: PlansService);
    create(createPlanDto: CreatePlanDto): Promise<any>;
    findAll(): Promise<any[]>;
    findActive(): Promise<any[]>;
    findOne(id: number): Promise<any>;
    findBySlug(slug: string): Promise<any>;
    update(id: number, updatePlanDto: UpdatePlanDto): Promise<any>;
    remove(id: number): Promise<void>;
    addFeature(createFeatureDto: CreatePlanFeatureDto): Promise<any>;
    getFeatures(id: number): Promise<any[]>;
}
//# sourceMappingURL=plans.controller.d.ts.map