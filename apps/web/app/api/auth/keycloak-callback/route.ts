import { NextRequest, NextResponse } from 'next/server';
import serverAPIClient from '@/lib/api/server-client';
import axios from 'axios';
import { env } from '@/lib/config/env';

/**
 * Handle Keycloak OAuth callback from backend
 * This endpoint is called after successful Keycloak authentication via backend
 * It validates the backend session and redirects to the frontend
 * 
 * The backend session cookie is already set, so the frontend can use it
 * for all API calls. The CombinedAuthGuard on the backend will validate it.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const error = searchParams.get('error');
    const state = searchParams.get('state');

    // Handle errors from Keycloak
    if (error) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error)}`, env.nextAuthUrl)
      );
    }

    // Validate session with backend using the cookie from the request
    try {
      const cookieHeader = request.headers.get('cookie') || '';
      
      // Make request to backend with cookies to validate session
      const response = await axios.get(
        `${env.apiUrl}/api/v1/auth/session/validate`,
        {
          headers: {
            Cookie: cookieHeader,
          },
          withCredentials: true,
        }
      );

      const sessionData = response.data;

      if (!sessionData.valid || !sessionData.user) {
        return NextResponse.redirect(
          new URL('/login?error=session_invalid', env.nextAuthUrl)
        );
      }

      // Session is valid, redirect to the hub
      // The backend session cookie is already set and will be used for all API calls
      let redirectUrl = `${env.nextAuthUrl}/hub`;
      
      // Use state parameter if provided and valid
      if (state) {
        try {
          const decodedState = decodeURIComponent(state);
          // Validate that the state is a relative URL or same origin
          if (decodedState.startsWith('/') || decodedState.startsWith(env.nextAuthUrl)) {
            redirectUrl = decodedState.startsWith('/') 
              ? `${env.nextAuthUrl}${decodedState}`
              : decodedState;
          }
        } catch (e) {
          // Invalid state, use default
        }
      }

      // Create response with redirect
      const response_obj = NextResponse.redirect(new URL(redirectUrl, env.nextAuthUrl));
      
      // Forward any cookies from backend response (if any)
      const setCookieHeaders = response.headers['set-cookie'];
      if (setCookieHeaders) {
        setCookieHeaders.forEach((cookie: string) => {
          response_obj.headers.append('Set-Cookie', cookie);
        });
      }

      return response_obj;
    } catch (error: any) {
      return NextResponse.redirect(
        new URL('/login?error=session_validation_failed', env.nextAuthUrl)
      );
    }
  } catch (error: any) {
    return NextResponse.redirect(
      new URL('/login?error=callback_error', env.nextAuthUrl)
    );
  }
}
