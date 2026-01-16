import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { env } from '@/lib/config/env';

/**
 * Diagnostic endpoint to test Keycloak configuration
 * This helps identify issues with client credentials
 * 
 * Usage: GET /api/auth/test-keycloak
 */
export async function GET(request: NextRequest) {
  // Only allow in development
  if (env.isProduction) {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    );
  }

  const issuer = env.keycloak.issuer || 'https://keycloak.habib.cloud/realms/leap-realm';
  const clientId = env.keycloak.clientIdWeb || 'leap-client';
  const clientSecret = env.keycloak.clientSecretWeb || 'Uu2X10TY6rHnGFwenN6vb7aP3fSOrvMV';

  if (!issuer || !clientId) {
    return NextResponse.json({
      error: 'Keycloak configuration missing',
      details: {
        hasIssuer: !!issuer,
        hasClientId: !!clientId,
        hasClientSecret: !!clientSecret,
      },
    }, { status: 400 });
  }

  const results: any = {
    configuration: {
      issuer,
      clientId,
      hasClientSecret: !!clientSecret,
      clientSecretLength: clientSecret?.length || 0,
    },
    tests: [],
  };

  // Test 1: Check well-known configuration
  try {
    const wellKnownUrl = `${issuer}/.well-known/openid-configuration`;
    const wellKnownResponse = await axios.get(wellKnownUrl, { timeout: 5000 });
    results.tests.push({
      name: 'Well-known configuration',
      status: 'success',
      details: {
        tokenEndpoint: wellKnownResponse.data.token_endpoint,
        authorizationEndpoint: wellKnownResponse.data.authorization_endpoint,
      },
    });
  } catch (error: any) {
    results.tests.push({
      name: 'Well-known configuration',
      status: 'error',
      error: error.message,
      details: error.response?.data,
    });
  }

  // Test 2: Try to get client info (if admin API is available)
  // This test is optional and may fail if admin API is not accessible

  // Test 3: Verify redirect URI format
  const redirectUri = `${env.nextAuthUrl}/api/auth/callback/keycloak`;
  results.tests.push({
    name: 'Redirect URI check',
    status: 'info',
    details: {
      redirectUri,
      message: 'Ensure this URI is added to Keycloak client "Valid Redirect URIs"',
    },
  });

  // Test 4: Check if we can reach the token endpoint
  try {
    const tokenUrl = `${issuer}/protocol/openid-connect/token`;
    // Try a client credentials grant (if supported) to test client secret
    if (clientSecret) {
      try {
        const tokenResponse = await axios.post(
          tokenUrl,
          new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret,
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            timeout: 5000,
            validateStatus: (status) => status < 500, // Don't throw on 4xx
          }
        );

        if (tokenResponse.status === 200) {
          results.tests.push({
            name: 'Client credentials test',
            status: 'success',
            details: {
              message: 'Client secret is valid! Client credentials grant succeeded.',
            },
          });
        } else {
          results.tests.push({
            name: 'Client credentials test',
            status: 'warning',
            details: {
              status: tokenResponse.status,
              error: tokenResponse.data?.error,
              errorDescription: tokenResponse.data?.error_description,
              message: tokenResponse.data?.error === 'unauthorized_client'
                ? 'Client secret may be incorrect, or client is configured as "public"'
                : 'Client credentials grant failed. This is normal if client_credentials grant is not enabled.',
            },
          });
        }
      } catch (error: any) {
        results.tests.push({
          name: 'Client credentials test',
          status: 'error',
          error: error.message,
          details: error.response?.data,
        });
      }
    } else {
      results.tests.push({
        name: 'Client credentials test',
        status: 'skipped',
        details: {
          message: 'No client secret provided. Client may be configured as "public".',
        },
      });
    }
  } catch (error: any) {
    results.tests.push({
      name: 'Token endpoint reachability',
      status: 'error',
      error: error.message,
    });
  }

  // Summary
  const successCount = results.tests.filter((t: any) => t.status === 'success').length;
  const errorCount = results.tests.filter((t: any) => t.status === 'error').length;
  const warningCount = results.tests.filter((t: any) => t.status === 'warning').length;

  results.summary = {
    total: results.tests.length,
    success: successCount,
    warnings: warningCount,
    errors: errorCount,
  };

  // Recommendations
  results.recommendations = [];
  
  if (errorCount > 0) {
    results.recommendations.push('Check Keycloak server connectivity and configuration');
  }
  
  if (warningCount > 0 && clientSecret) {
    results.recommendations.push('Verify KEYCLOAK_CLIENT_SECRET_WEB matches the secret in Keycloak admin console');
    results.recommendations.push('Check if client is configured as "confidential" (not "public") in Keycloak');
    results.recommendations.push('Ensure "Client authentication" is set to "On" in Keycloak client settings');
  }

  if (!clientSecret) {
    results.recommendations.push('If using a public client, ensure PKCE is enabled in NextAuth configuration');
  }

  return NextResponse.json(results, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
