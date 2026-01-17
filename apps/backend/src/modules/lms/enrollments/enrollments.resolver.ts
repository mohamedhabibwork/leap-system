import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthenticatedUser, getUserId } from '../../../common/types/request.types';
import { EnrollmentsService } from './enrollments.service';
import { Enrollment } from './types/enrollment.type';
import { CreateEnrollmentInput, UpdateEnrollmentInput } from './types/enrollment.input';

@Resolver(() => Enrollment)

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
  async findMyEnrollments(@CurrentUser() user: AuthenticatedUser) {
    return this.enrollmentsService.findByUser(getUserId(user));
  }

  @Query(() => [Enrollment], { name: 'enrollmentsByCourse' })
  @Roles('admin', 'instructor')
  async findByCourse(@Args('courseId', { type: () => Int }) courseId: number) {
    return this.enrollmentsService.findByCourse(courseId);
  }

  @Mutation(() => Enrollment)
  async createEnrollment(@Args('input') input: CreateEnrollmentInput, @CurrentUser() user: AuthenticatedUser) {
    return this.enrollmentsService.create({
      ...input,
      userId:  getUserId(user),
    } );
  }

  @Mutation(() => Enrollment)
  async updateEnrollment(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateEnrollmentInput,
  ) {
    return this.enrollmentsService.update(id, input );
  }

  @Mutation(() => String)
  @Roles('admin')
  async removeEnrollment(@Args('id', { type: () => Int }) id: number) {
    await this.enrollmentsService.remove(id);
    return 'Enrollment deleted successfully';
  }
}
