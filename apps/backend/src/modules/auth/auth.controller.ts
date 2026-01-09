import { Controller, Post, Body, Get, UseGuards, Req, Query, Param, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto, BulkSyncUsersDto, SyncRolesDto } from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { KeycloakSyncService } from './keycloak-sync.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly keycloakSyncService: KeycloakSyncService,
  ) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'User registration' })
  @ApiBody({ type: RegisterDto })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({ type: RefreshTokenDto })
  async refresh(@Body() body: RefreshTokenDto) {
    return this.authService.refreshToken(body.refresh_token);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser('sub') userId: number) {
    return this.authService.getCurrentUser(userId);
  }

  @Public()
  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset email' })
  @ApiBody({ type: ForgotPasswordDto })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Public()
  @Post('verify-reset-token')
  @ApiOperation({ summary: 'Verify password reset token validity' })
  async verifyResetToken(@Query('token') token: string) {
    return this.authService.verifyResetToken(token);
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiBody({ type: ResetPasswordDto })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('send-verification')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send email verification' })
  async sendVerification(@CurrentUser('sub') userId: number) {
    return this.authService.sendVerificationEmail(userId);
  }

  @Public()
  @Post('verify-email')
  @ApiOperation({ summary: 'Verify email with token' })
  @ApiBody({ type: VerifyEmailDto })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  // ===== ADMIN KEYCLOAK SYNC ENDPOINTS =====

  @Post('admin/keycloak/sync/user/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Manually sync single user to Keycloak (Admin only)' })
  async syncUserToKeycloak(@Param('id') userId: string) {
    return this.keycloakSyncService.manualSyncUser(parseInt(userId, 10));
  }

  @Post('admin/keycloak/sync/users/all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Manually sync all users to Keycloak (Admin only)' })
  @ApiBody({ type: BulkSyncUsersDto, required: false })
  async syncAllUsersToKeycloak(@Body() bulkSyncDto?: BulkSyncUsersDto) {
    return this.keycloakSyncService.manualSyncAllUsers();
  }

  @Post('admin/keycloak/sync/roles')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sync roles and permissions to Keycloak (Admin only)' })
  @ApiBody({ type: SyncRolesDto, required: false })
  async syncRolesToKeycloak(@Body() syncRolesDto?: SyncRolesDto) {
    const syncRoles = syncRolesDto?.syncRoles !== false;
    const syncPermissions = syncRolesDto?.syncPermissions !== false;

    const results = {
      roles: null,
      permissions: null,
    };

    if (syncRoles) {
      results.roles = await this.keycloakSyncService.syncRolesToKeycloak();
    }

    if (syncPermissions) {
      results.permissions = await this.keycloakSyncService.syncPermissionsToKeycloak();
    }

    return results;
  }

  @Get('admin/keycloak/sync/status/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Keycloak sync status for user (Admin only)' })
  async getSyncStatus(@Param('userId') userId: string) {
    return this.keycloakSyncService.getUserSyncStatus(parseInt(userId, 10));
  }

  @Get('admin/keycloak/sync/config')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Keycloak sync configuration (Admin only)' })
  async getSyncConfig() {
    return this.keycloakSyncService.getSyncConfig();
  }

  @Put('admin/user/:id/role')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign role to user (Admin only)' })
  async assignRole(
    @Param('id') userId: string,
    @Body() body: { roleId: number },
  ) {
    return this.authService.assignRole(parseInt(userId, 10), body.roleId);
  }
}
