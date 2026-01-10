import KcAdminClient from '@keycloak/keycloak-admin-client';
import axios from 'axios';
import { getConfig } from '../../config/keycloak';

/**
 * Initialize and authenticate Keycloak Admin Client
 * Authenticates in master realm where admin-cli/admin user exists,
 * then operates on the application realm
 * 
 * @returns Authenticated Keycloak Admin Client or null if unavailable
 */
export async function initializeKeycloakClient(): Promise<KcAdminClient | null> {
  // Get config (supports well-known URL if provided)
  const keycloakConfig = await getConfig();
  
  const baseUrl = keycloakConfig.authServerUrl;
  const applicationRealm = keycloakConfig.realm;
  const adminRealm = keycloakConfig.admin.realm || 'master';
  const clientId = keycloakConfig.admin.clientId || 'admin-cli';
  const clientSecret = keycloakConfig.admin.clientSecret;
  const username = keycloakConfig.admin.username;
  const password = keycloakConfig.admin.password;

  // Validate configuration
  if (!baseUrl) {
    console.log('  ⚠ Keycloak URL not configured - skipping Keycloak sync');
    return null;
  }

  // Prioritize client credentials over password credentials
  const hasClientCredentials = clientSecret && clientId;
  const hasPasswordCredentials = username && password;

  if (!hasClientCredentials && !hasPasswordCredentials) {
    console.log('  ⚠ Keycloak credentials not configured - skipping Keycloak sync');
    return null;
  }

  try {
    let accessToken: string;
    let refreshToken: string | undefined;

    // Authenticate in master realm (where admin-cli/admin user exists)
    const tokenEndpoint = `${baseUrl}/realms/${adminRealm}/protocol/openid-connect/token`;

    if (hasClientCredentials) {
      console.log('  🔐 Authenticating with client credentials (recommended)...');
      
      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');
      params.append('client_id', clientId);
      params.append('client_secret', clientSecret!);

      const response = await axios.post(tokenEndpoint, params.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      accessToken = response.data.access_token;
      refreshToken = response.data.refresh_token;
      
      console.log(`  ✓ Authenticated in ${adminRealm} realm (client credentials)`);
    } else {
      console.log('  🔐 Authenticating with password credentials...');
      
      // Match the working curl command format exactly
      const params = new URLSearchParams();
      params.append('grant_type', 'password');
      params.append('client_id', clientId);
      params.append('username', username!);
      params.append('password', password!);

      const response = await axios.post(tokenEndpoint, params.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      accessToken = response.data.access_token;
      refreshToken = response.data.refresh_token;
      
      console.log(`  ✓ Authenticated in ${adminRealm} realm (password credentials)`);
    }

    // Create client for application realm with master realm token
    const kcAdminClient = new KcAdminClient({
      baseUrl,
      realmName: applicationRealm,
    });

    // Set the access token manually
    (kcAdminClient as any).accessToken = accessToken;
    (kcAdminClient as any).refreshToken = refreshToken;

    console.log(`  ✓ Configured to operate on ${applicationRealm} realm`);

    // Verify permissions after authentication
    const permissions = await verifyKeycloakPermissions(kcAdminClient);
    if (!permissions.hasUserManagement) {
      console.warn('  ⚠ Warning: Keycloak account lacks user management permissions');
      console.warn('  ⚠ User sync operations may fail with 403 Forbidden errors');
    }

    return kcAdminClient;
  } catch (error: any) {
    const errorMessage = error?.response?.data?.error_description || 
                        error?.response?.data?.error || 
                        error?.message || 
                        'Unknown error';
    
    if (errorMessage.includes('invalid_grant') || errorMessage.includes('unauthorized_client') || errorMessage.includes('unauthorized')) {
      console.warn(`  ⚠ Keycloak authentication failed: ${errorMessage}`);
      console.warn('  ℹ Troubleshooting:');
      
      if (hasClientCredentials) {
        console.warn(`    1. Verify KEYCLOAK_ADMIN_CLIENT_SECRET is correct`);
        console.warn(`    2. In Keycloak Admin Console, go to ${adminRealm} realm → Clients → ${clientId}`);
        console.warn(`    3. Enable "Service accounts roles" and save`);
        console.warn(`    4. Go to "Service Account Roles" tab`);
        console.warn(`    5. Add "realm-admin" role from "realm-management" client`);
      } else {
        console.warn(`    1. Verify KEYCLOAK_ADMIN_USERNAME and KEYCLOAK_ADMIN_PASSWORD are correct`);
        console.warn(`    2. In Keycloak Admin Console, go to ${adminRealm} realm → Clients → ${clientId}`);
        console.warn(`    3. Enable "Direct access grants" and save`);
        console.warn(`    4. Verify the admin user exists in ${adminRealm} realm and is enabled`);
      }
      
      console.warn('  ⚠ Continuing without Keycloak sync');
    } else {
      console.warn(`  ⚠ Failed to connect to Keycloak: ${errorMessage}`);
      console.warn('  ⚠ Continuing without Keycloak sync');
    }
    
    return null;
  }
}

/**
 * Set user password in Keycloak
 */
export async function setKeycloakUserPassword(
  kcAdminClient: KcAdminClient,
  userId: string,
  password: string,
  temporary: boolean = false
): Promise<void> {
  try {
    await kcAdminClient.users.resetPassword({
      id: userId,
      credential: {
        temporary,
        type: 'password',
        value: password,
      },
    });
  } catch (error: any) {
    throw new Error(`Failed to set password: ${error?.message || error}`);
  }
}

/**
 * Check if user exists in Keycloak by email
 */
export async function findKeycloakUserByEmail(
  kcAdminClient: KcAdminClient,
  email: string
): Promise<any | null> {
  try {
    const users = await kcAdminClient.users.find({ email, exact: true });
    return users.length > 0 ? users[0] : null;
  } catch (error: any) {
    const is403 = error?.response?.status === 403 || 
                  error?.message?.includes('403') || 
                  error?.message?.includes('Forbidden');
    
    if (is403) {
      throw new Error('HTTP 403 Forbidden - Assign "realm-admin" role to the authenticated account');
    }
    throw new Error(`Failed to find user: ${error?.message || error}`);
  }
}

/**
 * Verify Keycloak client has necessary permissions
 */
export async function verifyKeycloakPermissions(
  kcAdminClient: KcAdminClient
): Promise<{ hasUserManagement: boolean; hasRoleManagement: boolean }> {
  try {
    // Try to list users (requires manage-users permission)
    await kcAdminClient.users.find({ max: 1 });
    
    // Try to list roles (requires view-realm permission)
    await kcAdminClient.roles.find();
    
    return { hasUserManagement: true, hasRoleManagement: true };
  } catch (error: any) {
    const is403 = error?.response?.status === 403 || 
                  error?.message?.includes('403') || 
                  error?.message?.includes('Forbidden');
    
    if (is403) {
      console.warn('  ⚠ Insufficient permissions - assign "realm-admin" role to continue');
      return { hasUserManagement: false, hasRoleManagement: false };
    }
    
    // Other errors, assume permissions might be OK but something else is wrong
    return { hasUserManagement: true, hasRoleManagement: true };
  }
}

/**
 * Assign role to user in Keycloak
 */
export async function assignKeycloakRole(
  kcAdminClient: KcAdminClient,
  userId: string,
  roleName: string
): Promise<boolean> {
  try {
    // Check if role exists
    const role = await kcAdminClient.roles.findOneByName({ name: roleName });
    if (!role) {
      console.warn(`    ⚠ Role "${roleName}" not found in Keycloak`);
      return false;
    }

    // Check if user already has the role
    const currentRoles = await kcAdminClient.users.listRealmRoleMappings({ id: userId });
    const hasRole = currentRoles.some((r) => r.name === roleName);

    if (!hasRole) {
      await kcAdminClient.users.addRealmRoleMappings({
        id: userId,
        roles: [{ id: role.id as string, name: role.name as string }],
      });
    }

    return true;
  } catch (error: any) {
    console.warn(`    ⚠ Failed to assign role "${roleName}": ${error?.message || error}`);
    return false;
  }
}
