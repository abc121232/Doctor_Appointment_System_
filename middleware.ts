import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to login and register pages
  if (pathname === '/login' || pathname === '/register') {
    return NextResponse.next();
  }

  // For protected routes, we'll handle auth check on the client side
  // since we're using localStorage for token storage
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};