import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /admin)
  const path = request.nextUrl.pathname;
  
  // Check if the path starts with /admin
  const isAdminPath = path.startsWith('/admin');
  
  // Get the authentication status from cookies
  const isAuthenticated = request.cookies.has('wirasaba_auth_token');
  
  // If trying to access admin path but not authenticated, redirect to login
  if (isAdminPath && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // If trying to access login path but already authenticated, redirect to admin
  if (path === '/login' && isAuthenticated) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }
  
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/admin/:path*', '/login'],
};