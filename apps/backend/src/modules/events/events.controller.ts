import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { AdminEventQueryDto } from './dto/admin-event-query.dto';
import { BulkEventOperationDto } from './dto/bulk-event-operation.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new event' })
  create(@Body() createEventDto: CreateEventDto, @CurrentUser() user: any) {
    return this.eventsService.create({ ...createEventDto, createdBy: user.userId });
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all events with pagination and filtering' })
  findAll(@Query() query: AdminEventQueryDto) {
    return this.eventsService.findAllAdmin(query);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get event statistics' })
  getStatistics() {
    return this.eventsService.getStatistics();
  }

  @Post('bulk')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Perform bulk operations on events' })
  bulkOperation(@Body() dto: BulkEventOperationDto) {
    return this.eventsService.bulkOperation(dto);
  }

  @Get('export/csv')
  @ApiOperation({ summary: 'Export events to CSV' })
  export(@Query() query: AdminEventQueryDto) {
    return this.eventsService.exportToCsv(query);
  }

  @Get('my-events')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my created events' })
  getMyEvents(@CurrentUser() user: any, @Query() query: any) {
    return this.eventsService.findByUser(user.userId || user.sub || user.id, query);
  }

  @Get('my-registrations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my event registrations' })
  getMyRegistrations(@CurrentUser() user: any, @Query() query: any) {
    return this.eventsService.findRegistrationsByUser(user.userId || user.sub || user.id, query);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get event by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.findOne(id);
  }

  @Post(':id/register')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register for event' })
  register(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.eventsService.registerForEvent(id, user.userId);
  }

  @Get(':id/registrations')
  @ApiOperation({ summary: 'Get event registrations' })
  getRegistrations(@Param('id', ParseIntPipe) id: number, @Query() query: any) {
    return this.eventsService.getRegistrations(id, query);
  }

  @Post(':id/feature')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Feature an event' })
  feature(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.setFeatured(id, true);
  }

  @Delete(':id/feature')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unfeature an event' })
  unfeature(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.setFeatured(id, false);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update event' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateEventDto: UpdateEventDto, @CurrentUser() user: any) {
    return this.eventsService.update(id, updateEventDto, user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete event' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.eventsService.remove(id, user.userId);
  }

  @Delete(':id/register')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unregister from event' })
  unregister(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.eventsService.unregisterFromEvent(id, user.userId || user.sub || user.id);
  }

  @Patch(':id/register')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update registration status' })
  updateRegistration(@Param('id', ParseIntPipe) id: number, @Body() data: any, @CurrentUser() user: any) {
    return this.eventsService.updateRegistration(id, user.userId || user.sub || user.id, data);
  }
}
