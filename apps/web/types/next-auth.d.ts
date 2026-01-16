import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    access_token: string;
    user: {
      id: number;
      email: string;
      username: string;
      firstName?: string;
      lastName?: string;
      roleId: number;
      avatarUrl?: string;
    };
  }

  interface Session {
    accessToken: string;
    error?: string; // Error from token refresh (e.g., 'RefreshAccessTokenError')
    user: {
      id: number;
      email: string;
      username: string;
      firstName?: string;
      lastName?: string;
      roleId: number;
      avatarUrl?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken: string;
    user: {
      id: number;
      email: string;
      username: string;
      firstName?: string;
      lastName?: string;
      roleId: number;
      avatarUrl?: string;
    };
  }
}
