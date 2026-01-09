import { Injectable, UnauthorizedException, Inject, BadRequestException, NotFoundException, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { users } from '@leap-lms/database';
import { eq, and } from 'drizzle-orm';
import { LoginDto, RegisterDto, ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto } from './dto';
import { EmailService } from '../notifications/email.service';
import { RbacService } from './rbac.service';
import { KeycloakSyncService } from './keycloak-sync.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DATABASE_CONNECTION) private db: any,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
    @Inject(forwardRef(() => RbacService)) private rbacService: RbacService,
    @Inject(forwardRef(() => KeycloakSyncService)) private keycloakSyncService: KeycloakSyncService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException('Password not set for this user');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { passwordHash, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    // Get user roles and permissions for JWT payload
    const roles = await this.rbacService.getUserRoles(user.id);
    const permissions = await this.rbacService.getUserPermissions(user.id);

    const payload = {
      sub: user.id,
      userId: user.id,
      email: user.email,
      username: user.username,
      roleId: user.roleId,
      roles,
      permissions,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('jwt.refreshExpiresIn'),
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        uuid: user.uuid,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        roleId: user.roleId,
        roles,
        permissions,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    // Check if user exists
    const [existingUser] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, registerDto.email))
      .limit(1);

    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    // Create user (Note: roleId and statusId should come from lookups)
    const [newUser] = await this.db
      .insert(users)
      .values({
        email: registerDto.email,
        username: registerDto.username || registerDto.email.split('@')[0],
        passwordHash,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        roleId: registerDto.roleId || 3, // Default: User role (should be from lookups)
        statusId: 1, // Default: Active status (should be from lookups)
        preferredLanguage: 'en',
        isActive: true,
        isDeleted: false,
        emailVerificationToken,
      })
      .returning();

    // Send verification email
    await this.emailService.sendVerificationEmail(
      newUser.email,
      emailVerificationToken,
      newUser.firstName || undefined,
    );

    // Sync to Keycloak
    await this.keycloakSyncService.syncUserToKeycloakOnCreate(newUser.id);

    const { passwordHash: _, ...userWithoutPassword } = newUser;
    return this.login({ email: registerDto.email, password: registerDto.password });
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      
      // Refresh roles and permissions
      const roles = await this.rbacService.getUserRoles(payload.sub);
      const permissions = await this.rbacService.getUserPermissions(payload.sub);

      const newAccessToken = this.jwtService.sign({
        sub: payload.sub,
        userId: payload.sub,
        email: payload.email,
        username: payload.username,
        roleId: payload.roleId,
        roles,
        permissions,
      });

      return {
        access_token: newAccessToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getCurrentUser(userId: number) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, forgotPasswordDto.email))
      .limit(1);

    // Don't reveal if user exists or not for security
    if (!user) {
      return { message: 'If an account exists with this email, a password reset link has been sent.' };
    }

    // Generate password reset token
    const passwordResetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Update user with reset token
    await this.db
      .update(users)
      .set({
        passwordResetToken,
        passwordResetExpiry,
      })
      .where(eq(users.id, user.id));

    // Send password reset email
    await this.emailService.sendPasswordResetEmail(
      user.email,
      passwordResetToken,
      user.firstName || undefined,
    );

    return { message: 'If an account exists with this email, a password reset link has been sent.' };
  }

  async verifyResetToken(token: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(
        and(
          eq(users.passwordResetToken, token),
        )
      )
      .limit(1);

    if (!user || !user.passwordResetExpiry) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (new Date() > new Date(user.passwordResetExpiry)) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    return { valid: true };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.passwordResetToken, resetPasswordDto.token))
      .limit(1);

    if (!user || !user.passwordResetExpiry) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (new Date() > new Date(user.passwordResetExpiry)) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(resetPasswordDto.newPassword, 10);

    // Update user password and clear reset token
    await this.db
      .update(users)
      .set({
        passwordHash,
        passwordResetToken: null,
        passwordResetExpiry: null,
      })
      .where(eq(users.id, user.id));

    return { message: 'Password reset successfully' };
  }

  async sendVerificationEmail(userId: number) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.emailVerifiedAt) {
      throw new BadRequestException('Email already verified');
    }

    // Generate new verification token if doesn't exist
    let verificationToken = user.emailVerificationToken;
    if (!verificationToken) {
      verificationToken = crypto.randomBytes(32).toString('hex');
      await this.db
        .update(users)
        .set({ emailVerificationToken: verificationToken })
        .where(eq(users.id, user.id));
    }

    // Send verification email
    await this.emailService.sendVerificationEmail(
      user.email,
      verificationToken,
      user.firstName || undefined,
    );

    return { message: 'Verification email sent' };
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.emailVerificationToken, verifyEmailDto.token))
      .limit(1);

    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    if (user.emailVerifiedAt) {
      throw new BadRequestException('Email already verified');
    }

    // Update user to mark email as verified
    await this.db
      .update(users)
      .set({
        emailVerifiedAt: new Date(),
        emailVerificationToken: null,
      })
      .where(eq(users.id, user.id));

    // Send welcome email
    await this.emailService.sendWelcomeEmail(
      user.email,
      user.firstName || undefined,
    );

    return { message: 'Email verified successfully' };
  }

  async updateUser(userId: number, updateData: Partial<{
    firstName: string;
    lastName: string;
    phone: string;
    avatarUrl: string;
    preferredLanguage: string;
    timezone: string;
    roleId: number;
    statusId: number;
    isActive: boolean;
  }>) {
    // Update user in database
    const [updatedUser] = await this.db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    // Sync to Keycloak
    await this.keycloakSyncService.syncUserToKeycloakOnUpdate(userId);

    // If role changed, sync roles
    if (updateData.roleId) {
      await this.keycloakSyncService.syncUserRolesToKeycloak(userId);
    }

    const { passwordHash, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async assignRole(userId: number, roleId: number) {
    // Update user role in database
    await this.db
      .update(users)
      .set({ roleId })
      .where(eq(users.id, userId));

    // Sync roles to Keycloak
    await this.keycloakSyncService.syncUserRolesToKeycloak(userId);

    return { message: 'Role assigned successfully' };
  }
}
