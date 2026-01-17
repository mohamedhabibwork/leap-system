import { Injectable, UnauthorizedException, Inject, BadRequestException, NotFoundException, forwardRef, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { users } from '@leap-lms/database';
import { eq, and } from 'drizzle-orm';
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { LoginDto, RegisterDto, ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto } from './dto';
import { EmailService } from '../notifications/email.service';
import { RbacService } from './rbac.service';
import { LookupsService } from '../lookups/lookups.service';
import { LookupTypeCode, UserRoleCode, UserStatusCode } from '@leap-lms/shared-types';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@leap-lms/database';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(DATABASE_CONNECTION) private db: NodePgDatabase<typeof schema>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
    @Inject(forwardRef(() => RbacService)) private rbacService: RbacService,
    private lookupsService: LookupsService,
  ) {}

  async validateUser(email: string, password: string): Promise<Omit<InferSelectModel<typeof users>, 'passwordHash'>> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException('Password not set for this user');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const { passwordHash, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto, rememberMe: boolean = false) {
    // DB-based authentication
    // Check if user exists in DB first
    // Select only needed columns to avoid issues with missing columns
    const dbUserResults = await this.db
      .select({
        id: users.id,
        uuid: users.uuid,
        email: users.email,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        roleId: users.roleId,
        passwordHash: users.passwordHash,
      })
      .from(users)
      .where(eq(users.email, loginDto.email))
      .limit(1);
    const [dbUser] = dbUserResults;

    if (!dbUser) {
      throw new UnauthorizedException('Invalid email or password');
    }

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

    const expiresIn = rememberMe
      ? this.configService.get('jwt.refreshExpiresIn') || '30d'
      : this.configService.get('jwt.expiresIn') || '7d';

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: rememberMe ? '30d' : this.configService.get('jwt.refreshExpiresIn'),
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: rememberMe ? 2592000 : 604800, // 30 days or 7 days in seconds
      token_type: 'Bearer',
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
    // Check if user exists in database
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

    // Create user in database (Note: roleId and statusId should come from lookups)
    // Get default role and status IDs from lookups
    const defaultRoleId = registerDto.roleId || await this.lookupsService.getLookupIdByCode(LookupTypeCode.USER_ROLE, UserRoleCode.USER);
    const activeStatusId = await this.lookupsService.getLookupIdByCode(LookupTypeCode.USER_STATUS, UserStatusCode.ACTIVE);

    const [newUser] = await this.db
      .insert(users)
      .values({
        email: registerDto.email,
        username: registerDto.username || registerDto.email.split('@')[0],
        passwordHash,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        roleId: defaultRoleId,
        statusId: activeStatusId,
        preferredLanguage: 'en',
        isActive: true,
        isDeleted: false,
        emailVerificationToken,
      } as InferInsertModel<typeof users>)
      .returning();

    // Send verification email
    await this.emailService.sendVerificationEmail(
      newUser.email,
      emailVerificationToken,
      newUser.firstName || undefined,
    );

    const { passwordHash: _, ...userWithoutPassword } = newUser;
    return this.login({ email: registerDto.email, password: registerDto.password });
  }

  async refreshToken(refreshToken: string) {
    // JWT token refresh
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
      } as Partial<InferInsertModel<typeof users>>)
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
      }  as Partial<InferSelectModel<typeof users>>)
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
        .set({ emailVerificationToken: verificationToken } as Partial<InferSelectModel<typeof users>>)
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
      } as Partial<InferInsertModel<typeof users>>)
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
      .set(updateData as Partial<InferInsertModel<typeof users>>)
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    const { passwordHash, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async assignRole(userId: number, roleId: number) {
    // Update user role in database
    await this.db
      .update(users)
      .set({ roleId } as Partial<InferInsertModel<typeof users>>)
      .where(eq(users.id, userId));

    return { message: 'Role assigned successfully' };
  }

  async generateToken(user: any) {
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
      expiresIn: this.configService.get('jwt.refreshExpiresIn') || '30d',
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 604800, // 7 days in seconds
      token_type: 'Bearer',
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
}
