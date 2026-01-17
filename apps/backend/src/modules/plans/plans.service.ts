import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { CreatePlanDto, UpdatePlanDto, CreatePlanFeatureDto } from './dto';
import { Plan } from './entities/plan.entity';
import { eq, and, sql } from 'drizzle-orm';
import { plans, planFeatures } from '@leap-lms/database';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@leap-lms/database';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

@Injectable()
export class PlansService {
  constructor(
    @Inject('DRIZZLE_DB')
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(createPlanDto: CreatePlanDto): Promise<InferSelectModel<typeof plans>> {
    const [newPlan] = await this.db
      .insert(plans)
      .values(createPlanDto as InferInsertModel<typeof plans>)
      .returning();

    return newPlan;
  }

  async findAll(): Promise<InferSelectModel<typeof plans>[]> {
    return await this.db
      .select()
      .from(plans)
      .where(eq(plans.isDeleted, false))
      .orderBy(plans.displayOrder);
  }

  async findActive(): Promise<InferSelectModel<typeof plans>[]> {
    return await this.db
      .select()
      .from(plans)
      .where(and(eq(plans.isDeleted, false), eq(plans.isActive, true)))
      .orderBy(plans.displayOrder);
  }

  async findOne(id: number): Promise<InferSelectModel<typeof plans>> {
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

  async findBySlug(slug: string): Promise<InferSelectModel<typeof plans>> {
    throw new NotFoundException('Plans do not have slugs in this schema');
  }

  async update(id: number, updatePlanDto: UpdatePlanDto): Promise<InferSelectModel<typeof plans>> {
    await this.findOne(id);

    const [updatedPlan] = await this.db
      .update(plans)
      .set(updatePlanDto as Partial<InferInsertModel<typeof plans>>)
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
      } as Partial<InferInsertModel<typeof plans>>)
      .where(eq(plans.id, id));
  }

  async addFeature(createFeatureDto: CreatePlanFeatureDto): Promise<InferSelectModel<typeof planFeatures>> {
    const [feature] = await this.db
      .insert(planFeatures)
      .values(createFeatureDto as InferInsertModel<typeof planFeatures>)
      .returning();

    return feature;
  }

  async getFeatures(planId: number): Promise<InferSelectModel<typeof planFeatures>[]> {
    await this.findOne(planId);

    return await this.db
      .select()
      .from(planFeatures)
      .where(and(eq(planFeatures.planId, planId), eq(planFeatures.isDeleted, false)));
  }
}
