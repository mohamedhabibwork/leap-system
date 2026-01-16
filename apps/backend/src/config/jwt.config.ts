import { registerAs } from '@nestjs/config';
import { getEnvConfig } from './env';

/**
 * JWT Configuration
 * Can be accessed via ConfigService.get('jwt')
 * 
 * Usage:
 * ```typescript
 * constructor(private configService: ConfigService) {}
 * const jwtConfig = this.configService.get('jwt');
 * ```
 */
export default registerAs('jwt', () => {
  const env = getEnvConfig();
  return {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRATION,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRATION,
  };
});
