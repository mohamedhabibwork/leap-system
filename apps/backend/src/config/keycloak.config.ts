import { registerAs } from '@nestjs/config';

export default registerAs('keycloak', () => ({
  authServerUrl: process.env.KEYCLOAK_URL || 'http://localhost:8080',
  realm: process.env.KEYCLOAK_REALM || 'leap-lms',
  clientId: process.env.KEYCLOAK_CLIENT_ID || 'leap-lms-backend',
  clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || '',
  publicKey: process.env.KEYCLOAK_PUBLIC_KEY || '',
}));
