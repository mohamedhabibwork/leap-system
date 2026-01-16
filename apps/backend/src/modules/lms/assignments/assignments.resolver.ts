import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { AssignmentsService } from './assignments.service';
import { Assignment } from './types/assignment.type';
import { CreateAssignmentInput, UpdateAssignmentInput } from './types/assignment.input';

@Resolver(() => Assignment)

export class AssignmentsResolver {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Query(() => [Assignment], { name: 'assignments' })
  async findAll() {
    return this.assignmentsService.findAll();
  }

  @Query(() => Assignment, { name: 'assignment' })
  async findOne(@Args('id', { type: () => Int }) id: number) {
    return this.assignmentsService.findOne(id);
  }

  @Query(() => [Assignment], { name: 'assignmentsBySection' })
  async findBySection(@Args('sectionId', { type: () => Int }) sectionId: number) {
    return this.assignmentsService.findBySection(sectionId);
  }

  @Mutation(() => Assignment)
  @Roles('admin', 'instructor')
  async createAssignment(@Args('input') input: CreateAssignmentInput) {
    return this.assignmentsService.create(input as any);
  }

  @Mutation(() => Assignment)
  @Roles('admin', 'instructor')
  async updateAssignment(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateAssignmentInput,
  ) {
    return this.assignmentsService.update(id, input as any);
  }

  @Mutation(() => String)
  @Roles('admin', 'instructor')
  async removeAssignment(@Args('id', { type: () => Int }) id: number) {
    await this.assignmentsService.remove(id);
    return 'Assignment deleted successfully';
  }
}
