import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { AdminGroupQueryDto } from './dto/admin-group-query.dto';
import { BulkGroupOperationDto } from './dto/bulk-group-operation.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Public } from '../../../common/decorators/public.decorator';

@ApiTags('social/groups')
@Controller('social/groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new group' })
  create(@Body() createGroupDto: CreateGroupDto, @CurrentUser() user: any) {
    return this.groupsService.create({ ...createGroupDto, createdBy: user.userId } as any);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all groups with pagination and filtering' })
  findAll(@Query() query: AdminGroupQueryDto) {
    return this.groupsService.findAllAdmin(query);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get group statistics' })
  getStatistics() {
    return this.groupsService.getStatistics();
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get group by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.findOne(id);
  }

  @Post(':id/join')
  
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Join a group' })
  joinGroup(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.groupsService.joinGroup(id, user.userId);
  }

  @Delete(':id/leave')
  
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Leave a group' })
  leaveGroup(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.groupsService.leaveGroup(id, user.userId);
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'Get group members' })
  getMembers(@Param('id', ParseIntPipe) id: number, @Query() query: any) {
    return this.groupsService.getMembers(id, query);
  }

  @Post(':id/members')
  
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add member to group' })
  addMember(@Param('id', ParseIntPipe) id: number, @Body('userId') userId: number) {
    return this.groupsService.addMember(id, userId);
  }

  @Post(':id/approve')
  
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve a group' })
  approve(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.approveGroup(id);
  }

  @Delete(':id/approve')
  
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject a group' })
  reject(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.rejectGroup(id);
  }

  @Post(':id/feature')
  
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Feature a group' })
  feature(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.setFeatured(id, true);
  }

  @Delete(':id/feature')
  
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unfeature a group' })
  unfeature(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.setFeatured(id, false);
  }

  @Patch(':id')
  
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update group' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateGroupDto: UpdateGroupDto, @CurrentUser() user: any) {
    return this.groupsService.update(id, updateGroupDto, user.userId);
  }

  @Delete(':id')
  
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete group' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.groupsService.remove(id, user.userId);
  }

  @Post('bulk')
  
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Perform bulk operations on groups' })
  bulkOperation(@Body() dto: BulkGroupOperationDto) {
    return this.groupsService.bulkOperation(dto);
  }

  @Get('export/csv')
  @ApiOperation({ summary: 'Export groups to CSV' })
  export(@Query() query: AdminGroupQueryDto) {
    return this.groupsService.exportToCsv(query);
  }
}
