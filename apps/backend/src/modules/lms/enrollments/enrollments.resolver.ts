import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { EnrollmentsService } from './enrollments.service';
import { Enrollment } from './types/enrollment.type';
import { CreateEnrollmentInput, UpdateEnrollmentInput } from './types/enrollment.input';

@Resolver(() => Enrollment)
@UseGuards(JwtAuthGuard)
export class EnrollmentsResolver {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Query(() => [Enrollment], { name: 'enrollments' })
  @Roles('admin', 'instructor')
  async findAll() {
    return this.enrollmentsService.findAll();
  }

  @Query(() => Enrollment, { name: 'enrollment' })
  async findOne(@Args('id', { type: () => Int }) id: number) {
    return this.enrollmentsService.findOne(id);
  }

  @Query(() => [Enrollment], { name: 'myEnrollments' })
  async findMyEnrollments(@CurrentUser() user: any) {
    return this.enrollmentsService.findByUser(user.sub || user.id);
  }

  @Query(() => [Enrollment], { name: 'enrollmentsByCourse' })
  @Roles('admin', 'instructor')
  async findByCourse(@Args('courseId', { type: () => Int }) courseId: number) {
    return this.enrollmentsService.findByCourse(courseId);
  }

  @Mutation(() => Enrollment)
  async createEnrollment(@Args('input') input: CreateEnrollmentInput, @CurrentUser() user: any) {
    return this.enrollmentsService.create({
      ...input,
      userId: input.userId || user.sub || user.id,
    } as any);
  }

  @Mutation(() => Enrollment)
  async updateEnrollment(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateEnrollmentInput,
  ) {
    return this.enrollmentsService.update(id, input as any);
  }

  @Mutation(() => String)
  @Roles('admin')
  async removeEnrollment(@Args('id', { type: () => Int }) id: number) {
    await this.enrollmentsService.remove(id);
    return 'Enrollment deleted successfully';
  }
}
