import { Resolver, Query, Mutation, Args, Int, ObjectType, Field } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators/roles.decorator';

@ObjectType()
class Course {
  @Field(() => Int)
  id: number;

  @Field()
  uuid: string;

  @Field()
  titleEn: string;

  @Field({ nullable: true })
  titleAr?: string;

  @Field()
  slug: string;

  @Field({ nullable: true })
  descriptionEn?: string;

  @Field({ nullable: true })
  descriptionAr?: string;

  @Field(() => Int)
  instructorId: number;

  @Field(() => Int, { nullable: true })
  categoryId?: number;

  @Field()
  createdAt: Date;
}

@ObjectType()
class CoursesPaginated {
  @Field(() => [Course])
  data: Course[];

  @Field(() => PaginationInfo)
  pagination: PaginationInfo;
}

@ObjectType()
class PaginationInfo {
  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  totalPages: number;
}

@Resolver(() => Course)
@UseGuards(JwtAuthGuard)
export class CoursesResolver {
  constructor(private readonly coursesService: CoursesService) {}

  @Query(() => CoursesPaginated, { name: 'courses' })
  async courses(
    @Args('page', { type: () => Int, nullable: true, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 10 }) limit: number,
  ) {
    return this.coursesService.findAll(page, limit);
  }

  @Query(() => Course, { name: 'course' })
  async course(@Args('id', { type: () => Int }) id: number) {
    return this.coursesService.findOne(id);
  }

  @Query(() => [Course], { name: 'publishedCourses' })
  async publishedCourses() {
    return this.coursesService.findPublished();
  }

  @Mutation(() => Course)
  @Roles('admin', 'instructor')
  async createCourse(@Args('input') input: CreateCourseDto) {
    return this.coursesService.create(input);
  }

  @Mutation(() => Course)
  @Roles('admin', 'instructor')
  async updateCourse(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: any,
  ) {
    return this.coursesService.update(id, input);
  }

  @Mutation(() => String)
  @Roles('admin')
  async removeCourse(@Args('id', { type: () => Int }) id: number) {
    await this.coursesService.remove(id);
    return 'Course deleted successfully';
  }
}
