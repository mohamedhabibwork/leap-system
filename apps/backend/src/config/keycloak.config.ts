import { registerAs } from '@nestjs/config';
import { getConfig } from './keycloak';

/**
 * Async factory for Keycloak configuration
 * Fetches well-known config if KEYCLOAK_WELL_KNOWN_URL is provided,
 * otherwise falls back to environment variables
 */
export default registerAs('keycloak', async () => {
  // Use async getConfig to fetch well-known config if available
  const config = await getConfig();
  return config;
});
