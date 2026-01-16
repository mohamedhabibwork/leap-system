import { Controller, Get, Patch, Query, UseGuards, ParseIntPipe, Body, Param } from '@nestjs/common';
import { EventsService } from './events.service';
import { AdminEventQueryDto } from './dto/admin-event-query.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('admin/events')
@Controller('admin/events')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super_admin')
@ApiBearerAuth()
export class AdminEventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all events (admin view) with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'statusId', required: false, type: Number })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  findAll(@Query() query: AdminEventQueryDto) {
    return this.eventsService.findAllAdmin(query);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured events' })
  getFeatured() {
    return this.eventsService.findAllAdmin({ isFeatured: true, limit: 10 });
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get event statistics' })
  getStatistics() {
    return this.eventsService.getStatistics();
  }

  @Patch(':id/featured')
  @ApiOperation({ summary: 'Set event featured status' })
  setFeatured(
    @Param('id', ParseIntPipe) id: number,
    @Body('featured') featured: boolean,
  ) {
    return this.eventsService.setFeatured(id, featured);
  }
}
