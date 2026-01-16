import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UpdateProfileDto } from './dto';
import { ConnectionsService } from '../social/connections/connections.service';
import { ConnectionQueryDto } from '../social/connections/dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ResourceOwnerGuard } from '../../common/guards/resource-owner.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { ResourceType, SkipOwnership } from '../../common/decorators/resource-type.decorator';
import { Role } from '../../common/enums/roles.enum';

/**
 * Users Controller
 * Handles all user-related endpoints with proper RBAC and ownership verification
 */
@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard, ResourceOwnerGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly connectionsService: ConnectionsService,
  ) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new user (Admin only)' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.INSTRUCTOR, Role.SUPER_ADMIN)
  @SkipOwnership()
  @ApiOperation({ summary: 'Get all users with pagination (Admin/Instructor only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  findAll(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    return this.usersService.findAll(page, limit);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Current user retrieved successfully' })
  getMe(@CurrentUser() user: any) {
    return this.usersService.findOne(user.userId);
  }

  @Get('connections')
  @SkipOwnership()
  @ApiOperation({ summary: 'Get current user connections' })
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

  @Get('connections/stats')
  @SkipOwnership()
  @ApiOperation({ summary: 'Get connection statistics' })
  @ApiResponse({ status: 200, description: 'Connection statistics retrieved' })
  async getConnectionStats(@CurrentUser() user: any) {
    const userId = user?.userId || user?.sub || user?.id;
    return this.connectionsService.getConnectionStats(userId);
  }

  @Get(':id')
  @Public()
  @SkipOwnership()
  @ApiOperation({ summary: 'Get user by ID (public profile)' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Get(':id/profile')
  @Public()
  @SkipOwnership()
  @ApiOperation({ summary: 'Get user profile by ID (public)' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  getUserProfile(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getUserProfile(id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  updateMe(@CurrentUser() user: any, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(user.userId, updateUserDto);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  updateMyProfile(
    @CurrentUser() user: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.userId, updateProfileDto);
  }

  @Patch('me/profile')
  @ApiOperation({ summary: 'Update current user profile (alias)' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  updateProfile(
    @CurrentUser() user: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.userId, updateProfileDto);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update user by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Post(':id/block')
  @Roles('admin')
  @ApiOperation({ summary: 'Block user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User blocked successfully' })
  blockUser(@Param('id', ParseIntPipe) id: number, @Body() body: { reason?: string }) {
    return this.usersService.blockUser(id, body.reason);
  }

  @Post(':id/unblock')
  @Roles('admin')
  @ApiOperation({ summary: 'Unblock user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User unblocked successfully' })
  unblockUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.unblockUser(id);
  }

  @Post(':id/ban')
  @Roles('admin')
  @ApiOperation({ summary: 'Ban user permanently (Admin only)' })
  @ApiResponse({ status: 200, description: 'User banned successfully' })
  banUser(@Param('id', ParseIntPipe) id: number, @Body() body: { reason: string }) {
    return this.usersService.banUser(id, body.reason);
  }

  @Patch(':id/role')
  @Roles('admin')
  @ApiOperation({ summary: 'Update user role (Admin only)' })
  @ApiResponse({ status: 200, description: 'User role updated successfully' })
  updateUserRole(@Param('id', ParseIntPipe) id: number, @Body() body: { roleId: number }) {
    return this.usersService.updateUserRole(id, body.roleId);
  }

  @Get('stats/overview')
  @Roles('admin')
  @ApiOperation({ summary: 'Get user statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  getUserStats() {
    return this.usersService.getUserStats();
  }

  @Get('activity/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Get user activity log (Admin only)' })
  @ApiResponse({ status: 200, description: 'Activity log retrieved successfully' })
  getUserActivity(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getUserActivity(id);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete user by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

  @Get('directory')
  @Public()
  @ApiOperation({ summary: 'Get public user directory' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'role', required: false, type: String })
  @ApiResponse({ status: 200, description: 'User directory retrieved successfully' })
  getUserDirectory(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('role') role?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const roleFilter = role && role.trim() !== '' ? role : undefined;
    return this.usersService.getUserDirectory(pageNum, limitNum, roleFilter);
  }

  @Get('search')
  @Public()
  @ApiOperation({ summary: 'Search users' })
  @ApiQuery({ name: 'q', required: true, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'role', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Search results retrieved successfully' })
  searchUsers(
    @Query('q') query: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('role') role?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const roleFilter = role && role.trim() !== '' ? role : undefined;
    return this.usersService.searchUsers(query, roleFilter, pageNum, limitNum);
  }

  @Post('upload-avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Avatar uploaded successfully' })
  async uploadAvatar(
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // For now, we'll just return a placeholder URL
    // In production, this would upload to R2/S3 and return the actual URL
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.userId}`;
    return this.usersService.uploadAvatar(user.userId, avatarUrl);
  }

  @Patch('me/password')
  @ApiOperation({ summary: 'Change current user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  changePassword(
    @CurrentUser() user: any,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    return this.usersService.changePassword(user.userId, body.currentPassword, body.newPassword);
  }

  @Get('instructor/:instructorId/students')
  @Roles('admin', 'instructor')
  @ApiOperation({ summary: 'Get students enrolled in instructor courses' })
  @ApiQuery({ name: 'courseId', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Students retrieved successfully' })
  getEnrolledStudents(
    @Param('instructorId', ParseIntPipe) instructorId: number,
    @Query('courseId') courseId?: number,
  ) {
    return this.usersService.getEnrolledStudents(instructorId, courseId);
  }
}
