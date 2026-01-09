import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Resolver('Course')
@UseGuards(JwtAuthGuard)
export class CoursesResolver {
  constructor(private readonly coursesService: CoursesService) {}

  @Query(() => String)
  async courses() {
    const courses = await this.coursesService.findAll();
    return JSON.stringify(courses);
  }

  @Query(() => String)
  async course(@Args('id', { type: () => Int }) id: number) {
    const course = await this.coursesService.findOne(id);
    return JSON.stringify(course);
  }

  @Mutation(() => String)
  async createCourse(@Args('input') input: string) {
    const dto: CreateCourseDto = JSON.parse(input);
    const course = await this.coursesService.create(dto);
    return JSON.stringify(course);
  }
}
