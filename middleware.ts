import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if the request is for an admin route
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  
  if (isAdminRoute) {
    // Check for authentication token in cookies or localStorage
    const authToken = request.cookies.get('auth_token')?.value;
    const accessToken = request.cookies.get('access_token')?.value;
    
    // If no token is found, redirect to admin login
    if (!authToken && !accessToken) {
      const loginUrl = new URL('/admin/login', request.url);
      // Add the original URL as a redirect parameter
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    // Match all admin routes
    '/admin/:path*',
    // Add other protected routes if needed
  ],
};