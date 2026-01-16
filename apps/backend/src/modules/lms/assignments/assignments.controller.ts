import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { GradeSubmissionDto } from './dto/grade-submission.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';

@ApiTags('lms/assignments')
@Controller('lms/assignments')

@ApiBearerAuth()
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post('submissions/:id/grade')
  @UseGuards(RolesGuard)
  @Roles('instructor', 'admin')
  @ApiOperation({ summary: 'Grade an assignment submission' })
  gradeSubmission(
    @Param('id', ParseIntPipe) id: number,
    @Body() gradeDto: GradeSubmissionDto,
    @Request() req
  ) {
    const instructorId = req.user.id;
    return this.assignmentsService.gradeSubmission(id, gradeDto, instructorId);
  }

  @Get('submissions/pending')
  @UseGuards(RolesGuard)
  @Roles('instructor', 'admin')
  @ApiOperation({ summary: 'Get pending submissions for instructor' })
  getPendingSubmissions(@Request() req, @Query('courseId') courseId?: string) {
    const instructorId = req.user.id;
    const parsedCourseId = courseId ? parseInt(courseId) : undefined;
    return this.assignmentsService.getPendingSubmissions(instructorId, parsedCourseId);
  }

  @Get('submissions/:id')
  @UseGuards(RolesGuard)
  @Roles('instructor', 'admin')
  @ApiOperation({ summary: 'Get submission details' })
  getSubmissionDetails(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const instructorId = req.user.id;
    return this.assignmentsService.getSubmissionDetails(id, instructorId);
  }
}
