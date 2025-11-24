import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/ar') || pathname.startsWith('/en')) {
    if (pathname.endsWith('/sentry-example-page')) {
      const url = request.nextUrl.clone();
      url.pathname = '/sentry-example-page';
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next();
  }

  const locale = 'ar';
  if (pathname === '/sentry-example-page') {
    return NextResponse.next();
  }
  request.nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ['/((?!_next|api).*)'],
};
