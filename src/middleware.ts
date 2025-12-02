import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['ar', 'en'];

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

  // Check if the pathname already has a locale prefix
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // Redirect to Arabic locale by default
  const locale = 'ar';
  request.nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ['/((?!_next|api).*)'],
};
