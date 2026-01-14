import { signOut } from 'next-auth/react';
import apiClient from '@/lib/api/client';

/**
 * Logout from both NextAuth session and Keycloak
 * This ensures complete logout from SSO
 */
export async function keycloakLogout(redirectTo: string = '/login') {
  try {
    // Get current session to extract tokens
    const { getSession } = await import('next-auth/react');
    const session = await getSession();

    // Construct Keycloak logout URL
    const keycloakUrl = process.env.NEXT_PUBLIC_KEYCLOAK_URL || process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER?.replace('/realms/', '').split('/realms/')[0] || 'https://keycloak.habib.cloud';
    const realm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'leap-realm';
    const clientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID_WEB || 'leap-client';

    if (keycloakUrl && realm) {
      // First, sign out from NextAuth (this will invalidate the session)
      await signOut({ redirect: false });

      // Then redirect to Keycloak logout
      const logoutUrl = new URL(`${keycloakUrl}/realms/${realm}/protocol/openid-connect/logout`);
      
      // Add post logout redirect URI
      const redirectUri = `${window.location.origin}${redirectTo}`;
      logoutUrl.searchParams.set('post_logout_redirect_uri', redirectUri);
      
      // Add client ID
      if (clientId) {
        logoutUrl.searchParams.set('client_id', clientId);
      }

      // Add ID token hint if available (for proper SSO logout)
      if (session?.accessToken) {
        logoutUrl.searchParams.set('id_token_hint', session.accessToken as string);
      }

      console.log('[Keycloak Logout] Redirecting to:', logoutUrl.toString());
      
      // Redirect to Keycloak logout
      window.location.href = logoutUrl.toString();
    } else {
      // Fallback to NextAuth signout only
      console.warn('[Keycloak Logout] Keycloak config not found, using NextAuth signout only');
      await signOut({ callbackUrl: redirectTo, redirect: true });
    }
  } catch (error) {
    console.error('[Keycloak Logout] Error during logout:', error);
    // Fallback to NextAuth signout
    await signOut({ callbackUrl: redirectTo, redirect: true });
  }
}

/**
 * Logout from backend session (for cookie-based sessions)
 */
export async function backendLogout() {
  try {
    await apiClient.post('/auth/logout');
    console.log('[Backend Logout] Session cleared');
  } catch (error) {
    console.error('[Backend Logout] Error:', error);
  }
}

/**
 * Complete logout - from both frontend and backend
 */
export async function completeLogout(redirectTo: string = '/login') {
  try {
    // Logout from backend first
    await backendLogout();
    
    // Then logout from Keycloak and NextAuth
    await keycloakLogout(redirectTo);
  } catch (error) {
    console.error('[Complete Logout] Error:', error);
    // Fallback to NextAuth signout
    await signOut({ callbackUrl: redirectTo, redirect: true });
  }
}
