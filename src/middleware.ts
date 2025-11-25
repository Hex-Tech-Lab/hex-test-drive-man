import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip processing for static files
  if (pathname.includes('.')) {
    return NextResponse.next();
  }

  // Allow Sentry test page without locale redirect
  if (pathname === '/sentry-example-page') {
    return NextResponse.next();
  }

  // Redirect to Arabic locale
  const locale = 'ar';
  request.nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ['/((?!_next|api).*)'],
};
