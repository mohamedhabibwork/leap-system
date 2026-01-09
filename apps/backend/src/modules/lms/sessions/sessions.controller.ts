import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';

@ApiTags('lms/sessions')
@Controller('lms/sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new session' })
  create(@Body() createSessionDto: CreateSessionDto, @Request() req) {
    const instructorId = req.user.id;
    return this.sessionsService.create(createSessionDto, instructorId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all sessions with optional filters' })
  findAll(
    @Query('courseId') courseId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('statusId') statusId?: string
  ) {
    const filters = {
      courseId: courseId ? parseInt(courseId) : undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      statusId: statusId ? parseInt(statusId) : undefined,
    };
    return this.sessionsService.findAll(filters);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get session details by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sessionsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a session' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSessionDto: UpdateSessionDto,
    @Request() req
  ) {
    const instructorId = req.user.id;
    return this.sessionsService.update(id, updateSessionDto, instructorId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a session' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const instructorId = req.user.id;
    return this.sessionsService.remove(id, instructorId);
  }

  @Post(':id/attendance')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark attendance for a session' })
  markAttendance(
    @Param('id', ParseIntPipe) id: number,
    @Body() markAttendanceDto: MarkAttendanceDto
  ) {
    return this.sessionsService.markAttendance(id, markAttendanceDto);
  }

  @Get(':id/attendees')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get list of attendees for a session' })
  getAttendees(@Param('id', ParseIntPipe) id: number) {
    return this.sessionsService.getAttendees(id);
  }
}
