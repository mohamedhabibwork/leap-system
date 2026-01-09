import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    
    // Admin routes
    if (path.startsWith('/admin') && token?.user?.role !== 'admin') {
      return NextResponse.redirect(new URL('/hub', req.url));
    }
    
    // Instructor routes
    if (path.startsWith('/instructor') && token?.user?.role !== 'instructor') {
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
