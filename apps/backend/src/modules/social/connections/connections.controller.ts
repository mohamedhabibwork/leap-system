import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ConnectionsService } from './connections.service';
import { SendConnectionRequestDto, ConnectionQueryDto } from './dto';
import { CombinedAuthGuard } from '../../auth/guards/combined-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@ApiTags('social/connections')
@Controller('social/connections')
@UseGuards(CombinedAuthGuard)
@ApiBearerAuth()
export class ConnectionsController {
  constructor(private readonly connectionsService: ConnectionsService) {}

  @Post('requests')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send a connection request' })
  @ApiResponse({ status: 201, description: 'Connection request sent successfully' })
  @ApiResponse({ status: 400, description: 'Connection request already exists' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async sendRequest(
    @Body() dto: SendConnectionRequestDto,
    @CurrentUser() user: any,
  ) {
    const userId = user?.userId || user?.sub || user?.id;
    return this.connectionsService.sendConnectionRequest(userId, dto);
  }

  @Post('requests/:id/accept')
  @ApiOperation({ summary: 'Accept a connection request' })
  @ApiParam({ name: 'id', description: 'Connection request ID' })
  @ApiResponse({ status: 200, description: 'Connection request accepted' })
  @ApiResponse({ status: 404, description: 'Connection request not found' })
  async acceptRequest(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    const userId = user?.userId || user?.sub || user?.id;
    return this.connectionsService.acceptConnectionRequest(userId, id);
  }

  @Post('requests/:id/reject')
  @ApiOperation({ summary: 'Reject a connection request' })
  @ApiParam({ name: 'id', description: 'Connection request ID' })
  @ApiResponse({ status: 200, description: 'Connection request rejected' })
  @ApiResponse({ status: 404, description: 'Connection request not found' })
  async rejectRequest(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    const userId = user?.userId || user?.sub || user?.id;
    return this.connectionsService.rejectConnectionRequest(userId, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a connection' })
  @ApiParam({ name: 'id', description: 'Connection ID' })
  @ApiResponse({ status: 200, description: 'Connection removed successfully' })
  @ApiResponse({ status: 404, description: 'Connection not found' })
  async removeConnection(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    const userId = user?.userId || user?.sub || user?.id;
    return this.connectionsService.removeConnection(userId, id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all connections' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Connections retrieved successfully' })
  async getConnections(
    @Query() query: ConnectionQueryDto,
    @CurrentUser() user: any,
  ) {
    const userId = user?.userId || user?.sub || user?.id;
    return this.connectionsService.getConnections(userId, query);
  }

  @Get('requests/pending')
  @ApiOperation({ summary: 'Get pending connection requests (received)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Pending requests retrieved successfully' })
  async getPendingRequests(
    @Query() query: ConnectionQueryDto,
    @CurrentUser() user: any,
  ) {
    const userId = user?.userId || user?.sub || user?.id;
    return this.connectionsService.getPendingRequests(userId, query);
  }

  @Get('requests/sent')
  @ApiOperation({ summary: 'Get sent connection requests' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Sent requests retrieved successfully' })
  async getSentRequests(
    @Query() query: ConnectionQueryDto,
    @CurrentUser() user: any,
  ) {
    const userId = user?.userId || user?.sub || user?.id;
    return this.connectionsService.getSentRequests(userId, query);
  }

  @Get('mutual/:userId')
  @ApiOperation({ summary: 'Get mutual connections with another user' })
  @ApiParam({ name: 'userId', description: 'Target user ID' })
  @ApiResponse({ status: 200, description: 'Mutual connections retrieved successfully' })
  async getMutualConnections(
    @Param('userId', ParseIntPipe) targetUserId: number,
    @CurrentUser() user: any,
  ) {
    const userId = user?.userId || user?.sub || user?.id;
    return this.connectionsService.getMutualConnections(userId, targetUserId);
  }

  @Get('status/:userId')
  @ApiOperation({ summary: 'Get connection status with a specific user' })
  @ApiParam({ name: 'userId', description: 'Target user ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Connection status retrieved',
    schema: {
      type: 'object',
      properties: {
        status: { 
          type: 'string', 
          enum: ['none', 'pending', 'connected'],
          description: 'Connection status'
        },
        connectionId: { 
          type: 'number', 
          description: 'Connection ID (if connected)'
        },
        requestId: { 
          type: 'number', 
          description: 'Request ID (if pending)'
        },
        isReceiver: {
          type: 'boolean',
          description: 'Whether current user is the receiver of the pending request'
        },
      },
    },
  })
  async getConnectionStatus(
    @Param('userId', ParseIntPipe) targetUserId: number,
    @CurrentUser() user: any,
  ) {
    const userId = user?.userId || user?.sub || user?.id;
    return this.connectionsService.getConnectionStatus(userId, targetUserId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get connection statistics' })
  @ApiResponse({ 
    status: 200, 
    description: 'Connection statistics retrieved',
    schema: {
      type: 'object',
      properties: {
        totalConnections: { type: 'number' },
        pendingRequests: { type: 'number' },
        sentRequests: { type: 'number' },
      },
    },
  })
  async getConnectionStats(@CurrentUser() user: any) {
    const userId = user?.userId || user?.sub || user?.id;
    return this.connectionsService.getConnectionStats(userId);
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Get connection suggestions (people you may know)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Connection suggestions retrieved' })
  async getConnectionSuggestions(
    @Query() query: ConnectionQueryDto,
    @CurrentUser() user: any,
  ) {
    const userId = user?.userId || user?.sub || user?.id;
    return this.connectionsService.getConnectionSuggestions(userId, query);
  }

  @Post('block/:userId')
  @ApiOperation({ summary: 'Block a user' })
  @ApiParam({ name: 'userId', description: 'User ID to block' })
  @ApiResponse({ status: 200, description: 'User blocked successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async blockUser(
    @Param('userId', ParseIntPipe) targetUserId: number,
    @CurrentUser() user: any,
  ) {
    const userId = user?.userId || user?.sub || user?.id;
    return this.connectionsService.blockUser(userId, targetUserId);
  }

  @Delete('block/:userId')
  @ApiOperation({ summary: 'Unblock a user' })
  @ApiParam({ name: 'userId', description: 'User ID to unblock' })
  @ApiResponse({ status: 200, description: 'User unblocked successfully' })
  @ApiResponse({ status: 404, description: 'Blocked connection not found' })
  async unblockUser(
    @Param('userId', ParseIntPipe) targetUserId: number,
    @CurrentUser() user: any,
  ) {
    const userId = user?.userId || user?.sub || user?.id;
    return this.connectionsService.unblockUser(userId, targetUserId);
  }

  @Get('blocked')
  @ApiOperation({ summary: 'Get list of blocked users' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Blocked users retrieved successfully' })
  async getBlockedUsers(
    @Query() query: ConnectionQueryDto,
    @CurrentUser() user: any,
  ) {
    const userId = user?.userId || user?.sub || user?.id;
    return this.connectionsService.getBlockedUsers(userId, query);
  }
}
