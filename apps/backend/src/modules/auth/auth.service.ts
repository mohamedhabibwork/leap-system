import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { users } from '@leap-lms/database';
import { eq } from 'drizzle-orm';
import { LoginDto, RegisterDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DATABASE_CONNECTION) private db: any,
    private jwtService: JwtService,
    private configService: ConfigService,
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

    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      roleId: user.roleId,
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
      })
      .returning();

    const { passwordHash: _, ...userWithoutPassword } = newUser;
    return this.login({ email: registerDto.email, password: registerDto.password });
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      
      const newAccessToken = this.jwtService.sign({
        sub: payload.sub,
        email: payload.email,
        username: payload.username,
        roleId: payload.roleId,
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
}
