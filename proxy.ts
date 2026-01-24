// proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log('🔒 Proxy checking:', pathname);
  
  // Allow login page and static files
  if (
    pathname === '/admin/login' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    console.log('✅ Allowing:', pathname);
    return NextResponse.next();
  }
  
  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    // Check for access_token OR auth_token (you're setting both)
    const accessToken = request.cookies.get('access_token')?.value;
    const authToken = request.cookies.get('auth_token')?.value;
    
    console.log('🔍 Admin route - Cookies found:', {
      access_token: accessToken ? 'present' : 'missing',
      auth_token: authToken ? 'present' : 'missing',
      all_cookies: Object.fromEntries(request.cookies.getAll().map(c => [c.name, c.value.substring(0, 10) + '...']))
    });
    
    // Redirect to login if no auth
    if (!accessToken && !authToken) {
      console.log('🚫 No auth tokens, redirecting to login');
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    console.log('✅ User authenticated, proceeding');
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};