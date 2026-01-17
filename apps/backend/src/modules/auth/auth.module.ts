import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { HttpModule } from '@nestjs/axios';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { RbacService } from './rbac.service';
import { TwoFactorService } from './two-factor.service';
import { SessionService } from './session.service';
import { TokenRefreshService } from './token-refresh.service';
import { TokenVerificationService } from './token-verification.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CombinedAuthGuard } from './guards/combined-auth.guard';
import jwtConfig from '../../config/jwt.config';
import { DatabaseModule } from '../../database/database.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { LookupsModule } from '../lookups/lookups.module';

@Module({
  imports: [
    DatabaseModule,
    LookupsModule,
    forwardRef(() => NotificationsModule),
    HttpModule,
    ConfigModule.forFeature(jwtConfig),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    RbacService,
    TwoFactorService,
    SessionService,
    TokenRefreshService,
    TokenVerificationService,
    JwtStrategy,
    LocalStrategy,
    JwtAuthGuard,
    CombinedAuthGuard,
  ],
  exports: [
    AuthService, 
    RbacService, 
    TwoFactorService, 
    SessionService, 
    TokenRefreshService,
    TokenVerificationService,
    JwtModule,
    JwtAuthGuard,
    CombinedAuthGuard,
  ],
})
export class AuthModule {}
