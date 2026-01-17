import { Controller, Get, Post, Delete, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { SendFriendRequestDto } from './dto/send-friend-request.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser, getUserId } from '../../common/types/request.types';

@ApiTags('friends')
@Controller('friends')

@ApiBearerAuth()
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Post('request')
  @ApiOperation({ summary: 'Send a friend request' })
  @ApiResponse({ status: 201, description: 'Friend request sent' })
  @ApiResponse({ status: 400, description: 'Friend request already exists' })
  async sendRequest(@Body() dto: SendFriendRequestDto, @CurrentUser() user: AuthenticatedUser) {
    const userId = getUserId(user);
    return this.friendsService.sendFriendRequest(userId, dto.friendId);
  }

  @Post('accept/:id')
  @ApiOperation({ summary: 'Accept a friend request' })
  @ApiResponse({ status: 200, description: 'Friend request accepted' })
  @ApiResponse({ status: 404, description: 'Friend request not found' })
  async acceptRequest(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthenticatedUser) {
    const userId = getUserId(user);
    return this.friendsService.acceptFriendRequest(userId, id);
  }

  @Get('requests')
  @ApiOperation({ summary: 'Get pending friend requests' })
  @ApiResponse({ status: 200, description: 'Friend requests retrieved' })
  async getRequests(@CurrentUser() user: AuthenticatedUser) {
    const userId = getUserId(user);
    return this.friendsService.getFriendRequests(userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get user friends list' })
  @ApiResponse({ status: 200, description: 'Friends list retrieved' })
  async getFriends(@CurrentUser() user: AuthenticatedUser) {
    const userId = getUserId(user);
    return this.friendsService.getFriends(userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove friend' })
  @ApiResponse({ status: 200, description: 'Friend removed' })
  async removeFriend(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthenticatedUser) {
    const userId = getUserId(user);
    await this.friendsService.removeFriend(userId, id);
    return { message: 'Friend removed successfully' };
  }
}
