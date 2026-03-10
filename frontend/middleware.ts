import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes that require authentication
const protectedRoutes = ['/dashboard', '/folder', '/profile', '/shared'];
const authRoutes = ['/login', '/register'];
const publicRoutes = ['/', '/_next', '/favicon.ico', '/public']; // Add public routes

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes to pass through
  if (publicRoutes.some((route) => pathname.startsWith(route) || pathname === '/')) {
    return NextResponse.next();
  }

  // Check if user is authenticated by looking for session cookie
  const hasSession = request.cookies.has('sessionid') || request.cookies.has('csrftoken');

  // If user is on auth routes (login/register) and has session, redirect to dashboard
  if (authRoutes.includes(pathname)) {
    if (hasSession) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // Allow access to auth routes if no session
    return NextResponse.next();
  }

  // For protected routes, check if user has session
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!hasSession) {
      // Store the attempted URL to redirect back after login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
    // Allow access to protected routes if has session
    return NextResponse.next();
  }

  // Default: allow all other routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (if you want to handle API separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
};
