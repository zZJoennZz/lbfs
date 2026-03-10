import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for session cookie
  const hasSession = request.cookies.has('sessionid') || request.cookies.has('csrftoken');

  // Public paths that don't require authentication
  const isPublicPath = pathname === '/' || pathname.startsWith('/_next') || pathname.startsWith('/favicon');

  // Auth paths (login/register)
  const isAuthPath = pathname === '/login' || pathname === '/register';

  // Protected paths
  const isProtectedPath =
    pathname.startsWith('/dashboard') || pathname.startsWith('/folder') || pathname.startsWith('/profile') || pathname.startsWith('/shared');

  // Allow public paths
  if (isPublicPath) {
    return NextResponse.next();
  }

  // If user is authenticated
  if (hasSession) {
    // Prevent access to login/register
    if (isAuthPath) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // Allow access to protected routes
    return NextResponse.next();
  }

  // If user is NOT authenticated
  if (!hasSession) {
    // Allow access to login/register
    if (isAuthPath) {
      return NextResponse.next();
    }
    // Redirect to login for protected routes
    if (isProtectedPath) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
