import { oidcClients } from '@leap-lms/database';
import { eq } from 'drizzle-orm';
import { createDrizzleDatabase } from './db-helper';
import * as crypto from 'crypto';

export async function seedOidcClients() {
  const { db, pool } = createDrizzleDatabase();

  console.log('🌱 Seeding OIDC clients...');

  // Generate a secure random client secret
  const generateClientSecret = () => {
    return crypto.randomBytes(32).toString('base64url');
  };

  // Default frontend client
  const frontendClientId = 'leap-frontend';
  const frontendClientSecret = generateClientSecret();

  // Check if frontend client already exists
  const [existingFrontend] = await db
    .select()
    .from(oidcClients)
    .where(eq(oidcClients.clientId, frontendClientId))
    .limit(1);

  if (!existingFrontend) {
    await db.insert(oidcClients).values({
      id: frontendClientId,
      clientId: frontendClientId,
      clientSecret: frontendClientSecret,
      redirectUris: [
        'http://localhost:3001/api/auth/callback/oidc',
        'http://localhost:3002/api/auth/callback/oidc',
        process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/api/auth/callback/oidc` : null,
      ].filter(Boolean) as string[],
      grantTypes: ['authorization_code', 'refresh_token'],
      responseTypes: ['code'],
      scopes: ['openid', 'profile', 'email', 'offline_access'],
      clientName: 'LEAP Frontend Application',
      clientUri: process.env.FRONTEND_URL || 'http://localhost:3001',
      tokenEndpointAuthMethod: 'client_secret_basic',
      applicationType: 'web',
      subjectType: 'public',
      idTokenSignedResponseAlg: 'RS256',
    } );

    console.log(`✅ Created OIDC client: ${frontendClientId}`);
    console.log(`   Client Secret: ${frontendClientSecret}`);
    console.log(`   ⚠️  Save this secret securely!`);
  } else {
    console.log(`ℹ️  OIDC client ${frontendClientId} already exists, skipping...`);
  }

  // Mobile app client (optional)
  const mobileClientId = 'leap-mobile';
  const mobileClientSecret = generateClientSecret();

  const [existingMobile] = await db
    .select()
    .from(oidcClients)
    .where(eq(oidcClients.clientId, mobileClientId))
    .limit(1);

  if (!existingMobile) {
    await db.insert(oidcClients).values({
      id: mobileClientId,
      clientId: mobileClientId,
      clientSecret: mobileClientSecret,
      redirectUris: [
        'leap://callback',
        'com.leap.app://callback',
      ],
      grantTypes: ['authorization_code', 'refresh_token'],
      responseTypes: ['code'],
      scopes: ['openid', 'profile', 'email', 'offline_access'],
      clientName: 'LEAP Mobile Application',
      tokenEndpointAuthMethod: 'client_secret_basic',
      applicationType: 'native',
      subjectType: 'public',
      idTokenSignedResponseAlg: 'RS256',
    } );

    console.log(`✅ Created OIDC client: ${mobileClientId}`);
    console.log(`   Client Secret: ${mobileClientSecret}`);
    console.log(`   ⚠️  Save this secret securely!`);
  } else {
    console.log(`ℹ️  OIDC client ${mobileClientId} already exists, skipping...`);
  }

  // Public client (for SPA - no client secret, uses PKCE)
  const publicClientId = 'leap-spa';
  const [existingPublic] = await db
    .select()
    .from(oidcClients)
    .where(eq(oidcClients.clientId, publicClientId))
    .limit(1);

  if (!existingPublic) {
    await db.insert(oidcClients).values({
      id: publicClientId,
      clientId: publicClientId,
      clientSecret: null, // Public clients don't have secrets
      redirectUris: [
        'http://localhost:3001/callback',
        'http://localhost:3002/callback',
        process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/callback` : null,
      ].filter(Boolean) as string[],
      grantTypes: ['authorization_code', 'refresh_token'],
      responseTypes: ['code'],
      scopes: ['openid', 'profile', 'email', 'offline_access'],
      clientName: 'LEAP SPA (Public Client)',
      clientUri: process.env.FRONTEND_URL || 'http://localhost:3001',
      tokenEndpointAuthMethod: 'none', // Public clients use PKCE
      applicationType: 'web',
      subjectType: 'public',
      idTokenSignedResponseAlg: 'RS256',
    } );

    console.log(`✅ Created OIDC public client: ${publicClientId}`);
    console.log(`   Note: This is a public client (no secret), uses PKCE`);
  } else {
    console.log(`ℹ️  OIDC client ${publicClientId} already exists, skipping...`);
  }

  await pool.end();
}
