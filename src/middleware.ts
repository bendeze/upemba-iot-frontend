import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Strict Middleware Protection: Bounce unauthenticated traffic accessing the core dashboards
  if (pathname.includes('/dashboard')) {
    // We check for the explicit drf auth token or legacy JWT payloads
    const token = request.cookies.get('auth_token') || request.cookies.get('access_token');
    
    if (!token) {
      // Calculate the active localization strictly before redirecting
      const locale = routing.locales.find(l => pathname.startsWith(`/${l}`)) || routing.defaultLocale;
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }
  }

  // Execute the underlying English/French dynamic URL resolving natively
  return intlMiddleware(request);
}

export const config = {
  // Pass strictly the internationalized path routes explicitly to Next-intl engine
  matcher: ['/', '/(fr|en)/:path*']
};
