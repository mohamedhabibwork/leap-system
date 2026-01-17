import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { CreatePlanDto, UpdatePlanDto, CreatePlanFeatureDto } from './dto';
import { Plan } from './entities/plan.entity';
import { eq, and, sql } from 'drizzle-orm';
import { plans, planFeatures } from '@leap-lms/database';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@leap-lms/database';

@Injectable()
export class PlansService {
  constructor(
    @Inject('DRIZZLE_DB')
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(createPlanDto: CreatePlanDto): Promise<any> {
    const [newPlan] = await this.db
      .insert(plans)
      .values(createPlanDto as any)
      .returning();

    return newPlan;
  }

  async findAll(): Promise<any[]> {
    return await this.db
      .select()
      .from(plans)
      .where(eq(plans.isDeleted, false))
      .orderBy(plans.displayOrder);
  }

  async findActive(): Promise<any[]> {
    return await this.db
      .select()
      .from(plans)
      .where(and(eq(plans.isDeleted, false), eq(plans.isActive, true)))
      .orderBy(plans.displayOrder);
  }

  async findOne(id: number): Promise<any> {
    const [plan] = await this.db
      .select()
      .from(plans)
      .where(and(eq(plans.id, id), eq(plans.isDeleted, false)))
      .limit(1);

    if (!plan) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }

    return plan;
  }

  async findBySlug(slug: string): Promise<any> {
    throw new NotFoundException('Plans do not have slugs in this schema');
  }

  async update(id: number, updatePlanDto: UpdatePlanDto): Promise<any> {
    await this.findOne(id);

    const [updatedPlan] = await this.db
      .update(plans)
      .set(updatePlanDto as any)
      .where(eq(plans.id, id))
      .returning();

    return updatedPlan;
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);

    await this.db
      .update(plans)
      .set({
        isDeleted: true,
      } as any)
      .where(eq(plans.id, id));
  }

  async addFeature(createFeatureDto: CreatePlanFeatureDto): Promise<any> {
    const [feature] = await this.db
      .insert(planFeatures)
      .values(createFeatureDto)
      .returning();

    return feature;
  }

  async getFeatures(planId: number): Promise<any[]> {
    await this.findOne(planId);

    return await this.db
      .select()
      .from(planFeatures)
      .where(and(eq(planFeatures.planId, planId), eq(planFeatures.isDeleted, false)));
  }
}
