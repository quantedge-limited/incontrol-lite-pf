import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  // Check for authentication token in cookies
  const authToken = request.cookies.get('auth_token')?.value;
  const accessToken = request.cookies.get('access_token')?.value;
  
  // If no token is found, redirect to admin login
  if (!authToken && !accessToken) {
    const loginUrl = new URL('/admin/login', request.url);
    // Add the original URL as a redirect parameter
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protect all admin routes except login
    '/admin/:path((?!login).*)',
  ],
};