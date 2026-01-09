import { registerAs } from '@nestjs/config';

export default registerAs('keycloak', () => ({
  authServerUrl: process.env.KEYCLOAK_URL || 'https://keycloak.habib.cloud',
  realm: process.env.KEYCLOAK_REALM || 'leap-lms',
  clientId: process.env.KEYCLOAK_CLIENT_ID || 'leap-lms-backend',
  clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || '',
  publicKey: process.env.KEYCLOAK_PUBLIC_KEY || '',
  admin: {
    url: process.env.KEYCLOAK_ADMIN_URL || process.env.KEYCLOAK_URL || 'https://keycloak.habib.cloud',
    clientId: process.env.KEYCLOAK_ADMIN_CLIENT_ID || 'admin-cli',
    clientSecret: process.env.KEYCLOAK_ADMIN_CLIENT_SECRET || '',
    username: process.env.KEYCLOAK_ADMIN_USERNAME || 'admin',
    password: process.env.KEYCLOAK_ADMIN_PASSWORD || 'admin',
  },
  sync: {
    enabled: process.env.KEYCLOAK_SYNC_ENABLED === 'true',
    onCreate: process.env.KEYCLOAK_SYNC_ON_CREATE !== 'false', // Default true
    onUpdate: process.env.KEYCLOAK_SYNC_ON_UPDATE !== 'false', // Default true
  },
}));
