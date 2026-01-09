import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    
    // Admin routes (roleId 1)
    if (path.startsWith('/admin') && token?.user?.roleId !== 1) {
      return NextResponse.redirect(new URL('/hub', req.url));
    }
    
    // Instructor routes (roleId 2)
    if (path.startsWith('/instructor') && token?.user?.roleId !== 2) {
      return NextResponse.redirect(new URL('/hub', req.url));
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
);

export const config = {
  matcher: ['/hub/:path*', '/admin/:path*', '/instructor/:path*']
};
