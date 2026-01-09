import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { RbacService } from './rbac.service';
import { KeycloakAdminService } from './keycloak-admin.service';
import { KeycloakSyncService } from './keycloak-sync.service';
import jwtConfig from '../../config/jwt.config';
import keycloakConfig from '../../config/keycloak.config';
import { DatabaseModule } from '../../database/database.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    DatabaseModule,
    NotificationsModule,
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(keycloakConfig),
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
    KeycloakAdminService,
    KeycloakSyncService,
    JwtStrategy,
    LocalStrategy,
  ],
  exports: [AuthService, RbacService, KeycloakAdminService, KeycloakSyncService, JwtModule],
})
export class AuthModule {}
