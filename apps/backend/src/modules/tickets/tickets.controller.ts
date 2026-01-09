import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { AdminTicketQueryDto } from './dto/admin-ticket-query.dto';
import { BulkTicketOperationDto } from './dto/bulk-operation.dto';
import { CreateTicketReplyDto, UpdateTicketReplyDto } from './dto/ticket-reply.dto';
import { AssignTicketDto } from './dto/assign-ticket.dto';

@ApiTags('Tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new ticket' })
  create(@Body() createTicketDto: CreateTicketDto) {
    return this.ticketsService.create(createTicketDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tickets with pagination and filtering' })
  findAll(@Query() query: AdminTicketQueryDto) {
    return this.ticketsService.findAllAdmin(query);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get ticket statistics' })
  getStatistics() {
    return this.ticketsService.getStatistics();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ticket by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ticketsService.findOne(id);
  }

  @Get(':id/replies')
  @ApiOperation({ summary: 'Get ticket replies' })
  getReplies(@Param('id', ParseIntPipe) id: number) {
    return this.ticketsService.getReplies(id);
  }

  @Post(':id/replies')
  @ApiOperation({ summary: 'Add a reply to ticket' })
  addReply(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateTicketReplyDto) {
    return this.ticketsService.addReply(id, dto);
  }

  @Patch(':id/assign')
  @ApiOperation({ summary: 'Assign ticket to user' })
  assign(@Param('id', ParseIntPipe) id: number, @Body() dto: AssignTicketDto) {
    return this.ticketsService.assignTicket(id, dto.assignToId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update ticket' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateTicketDto: UpdateTicketDto) {
    return this.ticketsService.update(id, updateTicketDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete ticket' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ticketsService.remove(id);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Perform bulk operations on tickets' })
  bulkOperation(@Body() dto: BulkTicketOperationDto) {
    return this.ticketsService.bulkOperation(dto);
  }

  @Get('export/csv')
  @ApiOperation({ summary: 'Export tickets to CSV' })
  export(@Query() query: AdminTicketQueryDto) {
    return this.ticketsService.exportToCsv(query);
  }
}
